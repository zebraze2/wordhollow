/* The world: 8 regions laid out as a snake (top row left→right, bottom row
   right→left), each 34×24 tiles, joined by gates. Ground is baked once into
   a big canvas; trees, places and people are y-sorted sprites. */

const T = 16, RW = 34, RH = 24, COLS = 4, ROWS = 2;
const TW = RW * COLS, TH = RH * ROWS;
const PLAYABLE = 8; // lands open to play (raise/lower to stage new lands)
const K = { GRASS: 0, PATH: 1, PLAZA: 2, BORDER: 3, WATER: 4, BEACH: 5 };
const SLOTS = [[7, 8], [26, 8], [8, 19], [26, 19], [17, 13]];

const PATH = ['#e8d38e', '#d6bd76', '#f2e2aa']; // the one constant across every land
const GROUNDS = {
  spring: { g: ['#8cbf4c', '#a0cf5c', '#78aa40', '#6a9a3a'], p: PATH, fl: ['#f4f0ea', '#f08ab0', '#f6d04a', '#b8a0f0'] },
  lush:   { g: ['#7ab44e', '#8cc45a', '#68a042', '#5a8e3a'], p: PATH, fl: ['#f4f0ea', '#9ac8f0', '#f6d04a'] },
  orchard:{ g: ['#98c04a', '#aace5a', '#84ac40', '#749a38'], p: PATH, fl: ['#f4f0ea', '#f08a7a', '#f6d04a'] },
  golden: { g: ['#b4c24a', '#c4d05a', '#a0ae40', '#8e9c38'], p: PATH, fl: ['#f6d04a', '#f4f0ea', '#e8812a'] },
  autumn: { g: ['#a8c23e', '#bad04c', '#94ae36', '#84a030'], p: PATH, fl: ['#f4f0ea', '#e8812a', '#c45a88'] },
  sand:   { g: ['#a8c27c', '#bcd290', '#94ae6a', '#84a05e'], p: PATH, fl: ['#f08ab0', '#f4f0ea', '#b8d8f0'], beach: ['#f0dca6', '#f8e8c0', '#e2c890'] },
  snow:   { g: ['#e8eef6', '#f6f9fc', '#d4deec', '#c4d0e2'], p: PATH, fl: ['#d8392e'] },
  dusk:   { g: ['#4e6c74', '#5c7c84', '#425e66', '#38525a'], p: PATH.map(c => mix(c, '#6a6890', .38)) /* same path, evening light */, fl: ['#dfe8ff', '#f0b0d0', '#ffe08a'] },
};

function regionOrigin(i) {
  const row = i < 4 ? 0 : 1, col = row === 0 ? i : 7 - i;
  return { ox: col * RW, oy: row * RH, col, row };
}
/* which side of region a leads to region b */
function sideTo(a, b) {
  const A = regionOrigin(a), B = regionOrigin(b);
  if (B.col > A.col) return 'right'; if (B.col < A.col) return 'left';
  return B.row > A.row ? 'down' : 'up';
}

const World = {
  kind: new Uint8Array(TW * TH), solid: new Uint8Array(TW * TH), reserved: new Uint8Array(TW * TH),
  objects: [], spots: [], gates: [], animals: [], npcs: [], ground: null, fog: [],

  idx: (x, y) => y * TW + x,
  inb: (x, y) => x >= 0 && y >= 0 && x < TW && y < TH,
  isSolid(x, y) { return !this.inb(x, y) || this.solid[y * TW + x] === 1; },
  regionAt(px, py) {
    const tx = Math.floor(px / T / RW), ty = Math.floor(py / T / RH);
    for (let i = 0; i < 8; i++) { const o = regionOrigin(i); if (o.col === tx && o.row === ty) return i; }
    return 0;
  },

  build() {
    for (let i = 0; i < 8; i++) this.buildRegion(i);
    this.bake();
  },

  buildRegion(ri) {
    const R = REGIONS[ri], { ox, oy } = regionOrigin(ri), rand = rng(ri * 999 + 7);
    const set = (x, y, k, solid) => { const i = this.idx(ox + x, oy + y); this.kind[i] = k; if (solid !== undefined) this.solid[i] = solid; };
    const reserve = (x, y) => { if (x >= 0 && y >= 0 && x < RW && y < RH) this.reserved[this.idx(ox + x, oy + y)] = 1; };
    const path = (x, y, k = K.PATH) => { if (x > 0 && y > 0 && x < RW - 1 && y < RH - 1) { set(x, y, k, 0); reserve(x, y); } };
    for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
      const border = x === 0 || y === 0 || x === RW - 1 || y === RH - 1;
      set(x, y, border ? K.BORDER : K.GRASS, border ? 1 : 0);
    }
    // gates
    const sides = [];
    if (ri > 0) sides.push({ side: sideTo(ri, ri - 1), to: ri - 1 });
    if (ri < 7) sides.push({ side: sideTo(ri, ri + 1), to: ri + 1 });
    for (const s of sides) {
      const open = [];
      if (s.side === 'left' || s.side === 'right') { const x = s.side === 'left' ? 0 : RW - 1; for (let y = 11; y <= 13; y++) open.push([x, y]); for (let x2 = 0; x2 < 14; x2++) { const xx = s.side === 'left' ? x2 : RW - 1 - x2; path(xx, 12); path(xx, 13); } }
      else { const y = s.side === 'up' ? 0 : RH - 1; for (let x = 16; x <= 18; x++) open.push([x, y]); for (let y2 = 0; y2 < 10; y2++) { const yy = s.side === 'up' ? y2 : RH - 1 - y2; path(17, yy); path(18, yy); } }
      open.forEach(([x, y]) => { set(x, y, K.PATH, 0); for (let d = -2; d <= 2; d++) { reserve(x + d, y); reserve(x, y + d); } });
    }
    // plaza + paths to every slot
    for (let y = 9; y <= 16; y++) for (let x = 13; x <= 21; x++) if (!((y === 9 || y === 16) && (x === 13 || x === 21))) path(x, y, K.PLAZA);
    for (const [sx, sy] of SLOTS.slice(0, 4)) {
      const x0 = Math.min(sx, 17), x1 = Math.max(sx, 18);
      for (let x = x0; x <= x1; x++) { path(x, sy); path(x, sy + 1); }
      const ya = Math.min(sy, 12), yb = Math.max(sy + 1, 12);
      for (let y = ya; y <= yb; y++) { path(17, y); path(18, y); }
    }
    if (R.sea) {
      for (let y = 21; y < RH; y++) for (let x = 0; x < RW; x++) set(x, y, K.WATER, 1);
      for (let y = 19; y <= 20; y++) for (let x = 1; x < RW - 1; x++) if (this.kind[this.idx(ox + x, oy + y)] === K.GRASS) set(x, y, K.BEACH, 0);
    }

    // places
    R.spots.forEach(spot => {
      const [ax, ay] = SLOTS[spot.slot], S = placeSprites(spot.type, spot.v, ri);
      const wx = ox + ax, wy = oy + ay;
      const block = (c) => { for (let y = c[1]; y <= c[3]; y++) for (let x = c[0]; x <= c[2]; x++) { set(ax + x, ay + y, this.kind[this.idx(wx + x, wy + y)], 1); } };
      block(S.col); if (S.col2) block(S.col2);
      for (let y = S.col[1] - 2; y <= 1; y++) for (let x = S.col[0] - 1; x <= S.col[2] + 1; x++) reserve(ax + x, ay + y);
      const left = wx * T + 8 - S.w / 2, top = wy * T + S.oy - S.h;
      const sp = { ...spot, ax: wx, ay: wy, S, left, top, done: false, anim: 0 };
      this.objects.push({ kind: 'place', spot: sp, x: left, y: top, baseY: wy * T - 1 });
      if (S.front) this.objects.push({ kind: 'placeFront', spot: sp, x: left, y: top, baseY: wy * T - 1 });
      if (S.front) { // back layer sorts behind animals
        this.objects[this.objects.length - 2].baseY = (wy + S.col[1]) * T + 6;
        const n = spot.v === 'ducks' ? 4 : 4;
        for (let i = 0; i < n; i++) {
          const a = { kind: 'animal', type: spot.v, spot: sp, minX: left + 12, maxX: left + S.w - 22, minY: top + 20, maxY: top + 48, x: 0, y: 0, tx: 0, ty: 0, wait: rand() * 2, face: 1, t: 0 };
          a.x = a.tx = a.minX + rand() * (a.maxX - a.minX); a.y = a.ty = a.minY + rand() * (a.maxY - a.minY);
          this.animals.push(a); this.objects.push(a);
        }
      }
      // helper standing beside the place
      const nx = ax + S.col[2] + 2, ny = ay - 1;
      set(nx, ny, this.kind[this.idx(ox + nx, oy + ny)], 1); reserve(nx, ny); reserve(nx, ny + 1);
      const npc = { kind: 'npc', look: spot.look, x: (ox + nx) * T + 8, y: (oy + ny) * T + 13, spot: sp, dir: 0, t: rand() * 5 };
      sp.person = npc;
      this.npcs.push(npc); this.objects.push(npc); this.spots.push(sp);
    });

    // border trees
    const treeAt = (tx, ty, kind, solid = true) => {
      const img = drawTree(kind, (tx * 31 + ty * 17) >>> 0);
      this.objects.push({ kind: 'sprite', img, x: (ox + tx) * T + 8 - 17, y: (oy + ty) * T + 16 - 42, baseY: (oy + ty) * T + 12 });
      if (solid) set(tx, ty, this.kind[this.idx(ox + tx, oy + ty)], 1);
    };
    const pickTree = () => R.trees[Math.floor(rand() * R.trees.length)];
    for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
      const border = x === 0 || y === 0 || x === RW - 1 || y === RH - 1;
      if (!border || this.reserved[this.idx(ox + x, oy + y)]) continue;
      if (R.sea && y >= 20) continue;
      if ((x + y) % 2 === 0 || y === RH - 1) treeAt(x, y, pickTree(), false);
    }
    // scattered trees, bushes, decor
    const free = (x, y, m = 1) => { for (let j = -m; j <= m; j++) for (let i = -m; i <= m; i++) { const xx = x + i, yy = y + j; if (xx < 1 || yy < 1 || xx >= RW - 1 || yy >= RH - 1) return false; const k = this.idx(ox + xx, oy + yy); if (this.reserved[k] || this.solid[k]) return false; } return true; };
    for (let n = 0; n < 60; n++) {
      const x = 2 + Math.floor(rand() * (RW - 4)), y = 2 + Math.floor(rand() * (RH - 4));
      if (!free(x, y, 1)) continue;
      treeAt(x, y, pickTree()); reserve(x, y);
      if (n > 14) break;
    }
    for (let n = 0; n < 160; n++) {
      const x = 1 + Math.floor(rand() * (RW - 2)), y = 1 + Math.floor(rand() * (RH - 2));
      if (!free(x, y, 0)) continue;
      const kind = R.decor[Math.floor(rand() * R.decor.length)];
      if (['flowers', 'leaves', 'wheat', 'shell', 'grass', 'drift', 'glowflower'].includes(kind)) continue; // flat decor is baked
      const d = drawDecor(kind, n * 13 + ri, ri);
      this.objects.push({ kind: 'sprite', img: d.img, x: (ox + x) * T + 8 - d.img.width / 2, y: (oy + y) * T + 14 - d.img.height, baseY: (oy + y) * T + 10, glow: kind === 'lamp' });
      if (d.solid) set(x, y, K.GRASS, 1);
      reserve(x, y);
    }
    // gates (only on the "next" side, so each gate is made once)
    if (ri < 7) {
      const side = sideTo(ri, ri + 1), g = { from: ri, to: ri + 1, side, tiles: [], open: false };
      if (side === 'right' || side === 'left') {
        const bx = side === 'right' ? ox + RW - 1 : ox; // this region's edge column
        const x2 = side === 'right' ? bx + 1 : bx - 1;
        for (let y = 11; y <= 13; y++) g.tiles.push([bx, oy + y], [x2, oy + y]);
        const gx = Math.min(bx, x2) * T;
        g.vertical = true; g.x = gx; g.y = (oy + 10) * T - 2; g.cx = gx + 16; g.cy = (oy + 12) * T + 8;
      } else {
        const by = side === 'down' ? oy + RH - 1 : oy, y2 = side === 'down' ? by + 1 : by - 1;
        for (let x = 16; x <= 18; x++) g.tiles.push([ox + x, by], [ox + x, y2]);
        const gy = Math.min(by, y2) * T;
        g.vertical = false; g.x = (ox + 16) * T - 16 + 8 - 8; g.y = gy - 8; g.cx = (ox + 17) * T + 8; g.cy = gy + 16;
      }
      g.imgs = { closed: drawGate(g.vertical, false), open: drawGate(g.vertical, true) };
      g.tiles.forEach(([x, y]) => { this.solid[this.idx(x, y)] = 1; });
      this.gates.push(g);
      if (g.vertical) {
        this.objects.push({ kind: 'gate', g, part: [0, 0, 32, 16], x: g.x, y: g.y, baseY: g.y + 14 });
        this.objects.push({ kind: 'gate', g, part: [0, 16, 32, 46], x: g.x, y: g.y + 16, baseY: g.y + 58 });
        this.objects.push({ kind: 'gate', g, part: [0, 62, 32, 18], x: g.x, y: g.y + 62, baseY: g.y + 78 });
      } else this.objects.push({ kind: 'gate', g, part: [0, 0, 80, 40], x: g.x, y: g.y, baseY: g.y + 30 });
    }
    this.flatDecor = this.flatDecor || [];
    for (let n = 0; n < 220; n++) {
      const x = 1 + Math.floor(rand() * (RW - 2)), y = 1 + Math.floor(rand() * (RH - 2)), k = this.idx(ox + x, oy + y);
      if ((this.kind[k] !== K.GRASS && this.kind[k] !== K.BEACH) || this.solid[k]) continue;
      const flats = R.decor.filter(d => ['flowers', 'leaves', 'wheat', 'shell', 'grass', 'drift', 'glowflower'].includes(d));
      if (!flats.length) break;
      this.flatDecor.push({ img: drawFlat(flats[n % flats.length], n * 7 + ri, GROUNDS[R.ground].fl), x: (ox + x) * T + Math.floor(rand() * 5), y: (oy + y) * T + Math.floor(rand() * 7) });
    }
  },

  setGate(g, open) {
    g.open = open;
    g.tiles.forEach(([x, y]) => { this.solid[this.idx(x, y)] = open ? 0 : 1; });
  },

  /* bake the ground layer: grass with speckles and tufts, soft-edged dirt paths, cobbled plazas, water */
  bake() {
    const W = TW * T, H = TH * T, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const cx = cv.getContext('2d'), im = cx.createImageData(W, H), d = im.data, r = rng(4242);
    const K_ = this.kind, regionOf = new Uint8Array(TW * TH);
    for (let i = 0; i < 8; i++) { const { ox, oy } = regionOrigin(i); for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) regionOf[(oy + y) * TW + ox + x] = i; }
    const pal = i => GROUNDS[REGIONS[i].ground];
    const isPath = (tx, ty) => { if (tx < 0 || ty < 0 || tx >= TW || ty >= TH) return false; const k = K_[ty * TW + tx]; return k === K.PATH || k === K.PLAZA; };
    const isWater = (tx, ty) => tx >= 0 && ty >= 0 && tx < TW && ty < TH && K_[ty * TW + tx] === K.WATER;
    // cheap value noise for large soft patches
    const hash = (x, y) => { let h = x * 374761393 + y * 668265263; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const vnoise = (x, y, s) => { const X = Math.floor(x / s), Y = Math.floor(y / s), fx = x / s - X, fy = y / s - Y; const a = hash(X, Y), b = hash(X + 1, Y), c = hash(X, Y + 1), e = hash(X + 1, Y + 1); const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v; };
    const put = (i, c) => { const v = rgba(c); d[i] = v[0]; d[i + 1] = v[1]; d[i + 2] = v[2]; d[i + 3] = 255; };
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const tx = px >> 4, ty = py >> 4, k = K_[ty * TW + tx], P = pal(regionOf[ty * TW + tx]), i = (py * W + px) * 4;
      const lx = px & 15, ly = py & 15;
      const n = vnoise(px, py, 24), rr = r();
      let g = n > .62 ? P.g[1] : n < .3 ? P.g[2] : P.g[0];
      if (rr < .035) g = P.g[1]; else if (rr < .07) g = P.g[2];
      if (k === K.BORDER) g = n > .5 ? P.g[2] : P.g[3];
      if (k === K.BEACH) { const B = P.beach; g = rr < .05 ? B[1] : rr < .1 ? B[2] : B[0]; if (ly < 3 && !K_[(ty - 1) * TW + tx] && hash(px, py) < .5) g = P.g[0]; }
      if (k === K.PATH || k === K.PLAZA) {
        // distance into grass at edges → ragged, rounded border
        let edge = 99;
        if (!isPath(tx - 1, ty)) edge = Math.min(edge, lx); if (!isPath(tx + 1, ty)) edge = Math.min(edge, 15 - lx);
        if (!isPath(tx, ty - 1)) edge = Math.min(edge, ly); if (!isPath(tx, ty + 1)) edge = Math.min(edge, 15 - ly);
        if (!isPath(tx - 1, ty - 1) && isPath(tx - 1, ty) && isPath(tx, ty - 1)) edge = Math.min(edge, Math.hypot(lx, ly) - 1);
        if (!isPath(tx + 1, ty - 1) && isPath(tx + 1, ty) && isPath(tx, ty - 1)) edge = Math.min(edge, Math.hypot(15 - lx, ly) - 1);
        if (!isPath(tx - 1, ty + 1) && isPath(tx - 1, ty) && isPath(tx, ty + 1)) edge = Math.min(edge, Math.hypot(lx, 15 - ly) - 1);
        if (!isPath(tx + 1, ty + 1) && isPath(tx + 1, ty) && isPath(tx, ty + 1)) edge = Math.min(edge, Math.hypot(15 - lx, 15 - ly) - 1);
        const jag = hash(px >> 1, py >> 1) * 2.6;
        if (edge + 0.2 > jag) {
          let c = P.p[0];
          const q = r(); if (q < .06) c = P.p[1]; else if (q < .1) c = P.p[2];
          if (edge < jag + 1.2) c = P.p[1];
          g = c;
        }
      } else if (k === K.WATER) {
        const shore = !isWater(tx, ty - 1) ? ly : 99;
        g = shore < 3 ? '#f4f8fc' : shore < 6 ? '#8ad0e8' : ((py + Math.floor(px / 7)) % 9 === 0 && r() < .5) ? '#7cc0e0' : '#4a9ac8';
      }
      put(i, g);
    }
    cx.putImageData(im, 0, 0);
    // grass tufts
    for (let ty = 0; ty < TH; ty++) for (let tx = 0; tx < TW; tx++) {
      const k = K_[ty * TW + tx]; if (k !== K.GRASS && k !== K.BORDER) continue;
      const P = pal(regionOf[ty * TW + tx]);
      for (let n = 0; n < 2; n++) { if (r() > .45) continue;
        const x = tx * T + 2 + Math.floor(r() * 11), y = ty * T + 3 + Math.floor(r() * 10);
        cx.fillStyle = P.g[3]; cx.fillRect(x, y, 1, 2); cx.fillRect(x + 2, y, 1, 2); cx.fillRect(x + 1, y + 1, 1, 2);
        cx.fillStyle = P.g[1]; cx.fillRect(x, y - 1, 1, 1); cx.fillRect(x + 2, y - 1, 1, 1);
      }
    }
    // cobbles on plazas + stepping stones on paths
    for (let ty = 0; ty < TH; ty++) for (let tx = 0; tx < TW; tx++) {
      const k = K_[ty * TW + tx], P = pal(regionOf[ty * TW + tx]);
      const stone = (x, y, w, h) => { cx.fillStyle = shade(P.p[1], -.25); cx.fillRect(x, y + 1, w, h); cx.fillStyle = shade(P.p[2], .15); cx.fillRect(x, y, w, h); cx.fillStyle = shade(P.p[2], .4); cx.fillRect(x + 1, y, w - 2, 1); };
      if (k === K.PLAZA) { for (let n = 0; n < 3; n++) { const x = tx * T + Math.floor(r() * 10), y = ty * T + Math.floor(r() * 11); stone(x, y, 5 + Math.floor(r() * 3), 3 + Math.floor(r() * 2)); } }
      else if (k === K.PATH && r() < .12) stone(tx * T + 3 + Math.floor(r() * 6), ty * T + 4 + Math.floor(r() * 6), 6, 4);
    }
    for (const f of this.flatDecor || []) cx.drawImage(f.img, f.x, f.y);
    this.ground = cv;
    // fog for locked regions: soft pixel clouds
    // drawn at 1/4 scale as chunky pixel clouds, then scaled up
    for (let i = 0; i < 8; i++) {
      const Q = 4, fw = (RW * T + 64) / Q, fh = (RH * T + 64) / Q, p = new Pix(fw, fh), fr = rng(i * 77 + 1);
      const base = '#dce4ec';
      p.rect(8, 8, fw - 16, fh - 16, base);
      const puffs = [];
      for (let n = 0; n < 70; n++) puffs.push([fr() * fw, fr() * fh, 6 + fr() * 12]);
      // shadow, body, highlight — like the trees
      puffs.forEach(([x, y, r]) => p.circ(x, y + 1.5, r, '#c3cfdc'));
      puffs.forEach(([x, y, r]) => p.circ(x, y, r - 1, '#e6ecf2'));
      puffs.forEach(([x, y, r]) => p.circ(x - r * .3, y - r * .35, r * .45, '#f5f8fb'));
      // keep the cloud bank inside the land (a little soft overhang), so the gate beside it stays visible
      p.each((x, y) => (x < 6 || y < 6 || x >= fw - 6 || y >= fh - 6) ? null : undefined);
      this.fog[i] = p.canvas(); this.fog[i].q = Q;
    }
  },
};
