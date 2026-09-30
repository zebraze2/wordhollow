/* Trees, decor and the buildings/places you help. Every place has a
   "before" look and an "after" (bloomed) look. */

const FOLIAGE = {
  green:   ['#3a6e34', '#4f8c3c', '#6caa46', '#96cc5a'],
  blossom: ['#a8527a', '#d27c9e', '#eea6c0', '#ffd4e2'],
  orange:  ['#a8491c', '#d0702a', '#ec963a', '#f8c060'],
  magenta: ['#7a2a52', '#a33f6e', '#c45a88', '#e07aa4'],
  apple:   ['#3a6e34', '#4f8c3c', '#6caa46', '#96cc5a'],
  willow:  ['#3f7a3a', '#56963f', '#76b24e', '#a0d06a'],
  dusk:    ['#2c3668', '#3c4c8a', '#5468a8', '#7890c8'],
};
const TRUNK = ['#7a4a2e', '#5a3420', '#9a6440'];

function canopy(p, cx, cy, pal, R, seed) {
  const r = rng(seed), cl = [];
  const base = [[0, -3, 1], [-7, 1, .7], [7, 1, .7], [0, 4, .78], [-4, -7, .6], [5, -7, .6]];
  for (const [dx, dy, k] of base) cl.push([cx + dx * R / 10 + (r() - .5) * 2, cy + dy * R / 10 + (r() - .5) * 2, R * k]);
  cl.forEach(([x, y, rr]) => p.circ(x, y, rr, pal[0]));
  cl.forEach(([x, y, rr]) => p.circ(x - .6, y - 1.6, rr - 1.2, pal[1]));
  cl.forEach(([x, y, rr]) => p.circ(x - 2, y - 3, rr * .5, pal[2]));
  cl.forEach(([x, y, rr]) => p.circ(x - 2.8, y - 3.8, rr * .2, pal[3]));
  // leafy texture
  for (let i = 0; i < R * 6; i++) {
    const x = Math.round(cx + (r() - .5) * R * 2), y = Math.round(cy + (r() - .5) * R * 2), c = p.get(x, y);
    if (c === pal[1] && p.get(x, y - 1) === pal[1]) p.set(x, y, pal[0]);
    else if (c === pal[2]) p.set(x, y - 0, pal[3]);
  }
}

function drawTree(kind, seed) {
  const p = new Pix(34, 46), r = rng(seed);
  if (kind === 'bare') {
    p.rect(15, 26, 4, 14, TRUNK[0]); p.rect(18, 27, 1, 13, TRUNK[1]); p.rect(13, 38, 8, 2, TRUNK[0]);
    const br = (x, y, a, len, d) => {
      if (d === 0 || len < 2) return;
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      p.line(x, y, x2, y2, d > 2 ? TRUNK[0] : TRUNK[2]);
      if (d > 2) p.line(x + 1, y, x2 + 1, y2, TRUNK[0]);
      br(x2, y2, a - .45 - r() * .3, len * .72, d - 1); br(x2, y2, a + .45 + r() * .3, len * .72, d - 1);
    };
    br(17, 28, -Math.PI / 2, 9, 5);
  } else if (kind === 'pine') {
    p.rect(15, 34, 4, 6, TRUNK[0]);
    const P = ['#1f4a3a', '#2e6a4a', '#3f8a5a'];
    for (let t = 0; t < 4; t++) {
      const y0 = 36 - t * 8, hw = 13 - t * 3;
      for (let y = 0; y < 11; y++) { const w = Math.round(hw * (y / 10)); p.rect(17 - w, y0 - 10 + y, w * 2, 1, y > 7 ? P[0] : P[1]); p.rect(17 - w, y0 - 10 + y, Math.max(1, w - 1), 1, y > 7 ? P[0] : P[2]); }
      for (let x = -hw + 2; x < hw - 1; x++) if ((x + t) % 3) p.set(17 + x, y0 - 2 + (x % 2), '#f4f8fc');
    }
    p.set(17, 3, '#f4f8fc'); p.set(16, 4, '#f4f8fc');
  } else if (kind === 'palm') {
    for (let i = 0; i < 26; i++) { const x = 17 + Math.sin(i / 9) * 3; p.rect(x - 1, 39 - i, 3, 1, i % 4 === 0 ? '#9a7040' : '#c09058'); }
    const top = [20, 13];
    [[-1, -.2], [-.9, .5], [1, -.25], [.9, .5], [-.3, -1], [.4, -.9]].forEach(([dx, dy]) => {
      for (let t = 0; t < 12; t++) { const x = top[0] + dx * t, y = top[1] + dy * t + (t * t) / 16; p.circ(x, y, 1.6 - t / 12, t % 3 ? '#4f9a4a' : '#3a7a3a'); }
    });
    p.circ(20, 14, 2, '#8a5a30'); p.set(18, 15, '#6a4020');
  } else if (kind === 'willow') {
    p.rect(15, 28, 4, 12, TRUNK[0]); p.rect(18, 28, 1, 12, TRUNK[1]);
    const pal = FOLIAGE.willow;
    p.ell(17, 16, 14, 12, pal[0]); p.ell(16, 14, 12.5, 10, pal[1]); p.ell(14, 11, 7, 5, pal[2]);
    for (let x = 4; x < 31; x += 2) { const len = 8 + Math.round(r() * 10); p.line(x, 18, x, 18 + len, x % 4 ? pal[1] : pal[2]); p.set(x, 18 + len + 1, pal[0]); }
  } else {
    p.rect(15, 28, 4, 12, TRUNK[0]); p.rect(18, 29, 1, 11, TRUNK[1]); p.rect(13, 38, 8, 2, TRUNK[0]); p.set(16, 33, TRUNK[1]);
    const pal = FOLIAGE[kind] || FOLIAGE.green;
    canopy(p, 17, 17, pal, 10.5, seed);
    if (kind === 'apple') for (let i = 0; i < 9; i++) { const x = 8 + r() * 18, y = 9 + r() * 16; if (p.get(Math.round(x), Math.round(y))) { p.set(x, y, '#d8392e'); p.set(x - 1, y - 1, '#ff8a7a'); } }
    if (kind === 'dusk') for (let i = 0; i < 7; i++) { const x = 8 + r() * 18, y = 9 + r() * 16; if (p.get(Math.round(x), Math.round(y))) p.set(x, y, '#ffe08a'); }
  }
  p.outline(INK);
  p.blit(shadowPix(22, 6), 6, 38);
  return p.canvas();
}

function drawBush(pal, seed, fruit) {
  const p = new Pix(22, 18), r = rng(seed);
  canopy(p, 11, 10, pal, 5.6, seed);
  if (fruit) for (let i = 0; i < 4; i++) p.set(5 + r() * 12, 6 + r() * 7, fruit);
  p.outline(INK); p.blit(shadowPix(16, 4), 3, 14);
  return p.canvas();
}

/* ---- small decor: [pix, solid?] ---- */
function drawDecor(kind, seed, region) {
  const r = rng(seed);
  let p;
  switch (kind) {
    case 'rock': case 'snowrock': {
      p = new Pix(16, 13);
      p.ell(8, 7, 6, 4.5, '#8a8e9a'); p.ell(7, 6, 5, 3.4, '#a8acb6'); p.ell(6, 5, 2.5, 1.5, '#c8ccd4');
      if (kind === 'snowrock') { p.ell(7.5, 4.5, 5, 2.4, '#f4f8fc', (x, y) => y < 6); }
      p.outline(); p.blit(shadowPix(12, 3), 2, 10); break;
    }
    case 'stump': {
      p = new Pix(16, 14);
      p.rect(3, 5, 10, 6, TRUNK[0]); p.rect(11, 5, 2, 6, TRUNK[1]); p.ell(8, 5, 5, 2.2, '#c8945a'); p.ell(8, 5, 2.6, 1, '#a87440'); p.rect(2, 10, 12, 1, TRUNK[0]);
      p.outline(); p.blit(shadowPix(14, 3), 1, 11); break;
    }
    case 'pumpkin': {
      p = new Pix(16, 14);
      const o = ['#c8601a', '#e8812a', '#f4a44a'];
      p.ell(8, 8, 6.5, 4.5, o[0]); p.ell(8, 7.5, 5.5, 3.8, o[1]); p.ell(6, 6, 2, 1.5, o[2]);
      p.line(8, 4, 8, 11, o[0]); p.line(5, 5, 5, 10, o[0]); p.line(11, 5, 11, 10, o[0]);
      p.rect(8, 1, 2, 3, '#5a7a2a'); p.set(10, 1, '#6a9a3a');
      p.outline(); p.blit(shadowPix(14, 3), 1, 11); break;
    }
    case 'crate': {
      p = new Pix(16, 17);
      const w = ['#8a5a34', '#a8703e', '#c89058'];
      p.rect(2, 2, 12, 12, w[1]); p.rect(2, 2, 12, 2, w[2]); p.rect(2, 12, 12, 2, w[0]);
      p.line(3, 4, 12, 11, w[0]); p.line(3, 5, 12, 12, w[2]); p.rect(2, 2, 1, 12, w[0]); p.rect(13, 2, 1, 12, w[0]);
      p.outline(); p.blit(shadowPix(14, 3), 1, 14); break;
    }
    case 'barrel': {
      p = new Pix(14, 18);
      p.ell(7, 9, 5.5, 7, '#9a6438'); p.rect(3, 3, 8, 12, '#a8703e'); p.rect(2, 5, 10, 1, '#5a4a4a'); p.rect(2, 12, 10, 1, '#5a4a4a');
      p.ell(7, 3, 4.5, 1.8, '#c89058'); p.rect(9, 4, 2, 10, '#8a5a34');
      p.outline(); p.blit(shadowPix(12, 3), 1, 15); break;
    }
    case 'hay': {
      p = new Pix(20, 15);
      p.rect(2, 3, 16, 9, '#e0b84a'); p.rect(2, 3, 16, 2, '#f0d070'); p.rect(2, 10, 16, 2, '#c09030');
      p.rect(6, 3, 1, 9, '#a87a2a'); p.rect(13, 3, 1, 9, '#a87a2a');
      for (let i = 0; i < 10; i++) p.set(3 + r() * 14, 5 + r() * 5, '#f4dc8a');
      p.outline(); p.blit(shadowPix(18, 3), 1, 12); break;
    }
    case 'pine_small': {
      p = new Pix(14, 18);
      for (let y = 0; y < 12; y++) { const w = Math.round(y / 2) + 1; p.rect(7 - w, 2 + y, w * 2, 1, y % 4 === 3 ? '#1f4a3a' : '#2e6a4a'); }
      p.set(7, 2, '#f4f8fc'); p.rect(5, 6, 3, 1, '#f4f8fc'); p.rect(3, 10, 3, 1, '#f4f8fc');
      p.rect(6, 14, 2, 2, TRUNK[0]); p.outline(); p.blit(shadowPix(10, 3), 2, 15); break;
    }
    case 'mushroom': {
      p = new Pix(14, 12);
      const cap = region === 7 ? '#8ab0f0' : '#d8463c';
      p.rect(4, 6, 2, 3, '#f4efe4'); p.ell(5, 5, 3.4, 2, cap); p.set(4, 4, '#fff'); p.set(6, 5, '#fff');
      p.rect(9, 7, 2, 2, '#f4efe4'); p.ell(10, 6.5, 2.4, 1.5, cap); p.set(10, 6, '#fff');
      p.outline(); p.blit(shadowPix(10, 2), 2, 9); break;
    }
    case 'lamp': {
      p = new Pix(12, 30);
      p.rect(5, 8, 2, 20, '#3a3440'); p.rect(3, 27, 6, 2, '#3a3440');
      p.rect(3, 2, 6, 7, '#3a3440'); p.rect(4, 3, 4, 5, '#ffd46a'); p.rect(4, 3, 2, 2, '#fff2c0'); p.rect(2, 1, 8, 1, '#3a3440');
      p.outline(); p.blit(shadowPix(8, 2), 2, 28); break;
    }
    case 'reeds': {
      p = new Pix(14, 18);
      for (let i = 0; i < 5; i++) { const x = 2 + i * 2.4, h = 8 + r() * 6; p.line(x, 16, x + (r() - .5) * 2, 16 - h, '#5a8a3a'); if (i % 2 === 0) p.rect(Math.round(x), Math.round(16 - h), 2, 3, '#7a4a2e'); }
      p.outline(); break;
    }
    default: {
      // bush
      const pal = region === 4 ? FOLIAGE.orange : region === 7 ? FOLIAGE.dusk : region === 6 ? ['#2e5a4a', '#3f7a5a', '#5a9a6a', '#8ac08a'] : FOLIAGE.green;
      const fruit = region === 6 ? '#d8392e' : region === 0 ? '#f0a0c0' : null;
      return { img: drawBush(pal, seed, fruit), solid: true };
    }
  }
  return { img: p.canvas(), solid: ['rock', 'snowrock', 'stump', 'crate', 'barrel', 'hay', 'pine_small', 'lamp'].includes(kind) };
}

/* flat decor baked into the ground layer */
function drawFlat(kind, seed, colors) {
  const p = new Pix(12, 10), r = rng(seed);
  if (kind === 'flowers' || kind === 'glowflower') {
    const n = 2 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const x = 2 + Math.round(r() * 7), y = 2 + Math.round(r() * 5), c = colors[Math.floor(r() * colors.length)];
      p.set(x, y + 1, '#4a7a30'); p.set(x, y + 2, '#4a7a30');
      p.set(x - 1, y, c); p.set(x + 1, y, c); p.set(x, y - 1, c); p.set(x, y + 0, kind === 'glowflower' ? '#ffffff' : '#f6e27a');
    }
  } else if (kind === 'leaves') {
    for (let i = 0; i < 6; i++) p.set(1 + r() * 10, 1 + r() * 8, ['#d8702a', '#c8461c', '#f0a040', '#a33f6e'][i % 4]);
  } else if (kind === 'wheat') {
    for (let i = 0; i < 5; i++) { const x = 1 + i * 2 + Math.round(r()); p.line(x, 9, x, 3, '#c8a040'); p.set(x, 2, '#f0d070'); p.set(x, 3, '#f0d070'); p.set(x + 1, 4, '#e8c060'); }
  } else if (kind === 'shell') {
    p.ell(5, 5, 2.2, 1.6, r() < .5 ? '#f4c0b0' : '#f8ece0'); p.set(4, 5, '#d8a090'); p.set(6, 5, '#d8a090');
    p.set(9, 7, '#f8f4ec'); p.set(10, 7, '#e8dcc8');
  } else if (kind === 'grass') {
    for (let i = 0; i < 5; i++) { const x = 2 + i * 2; p.line(x, 9, x + (i - 2) * .5, 3 + r() * 3, i % 2 ? '#7a9a4a' : '#9ab85a'); }
  } else if (kind === 'drift') {
    p.ell(6, 6, 5, 2.4, '#f8fbff'); p.ell(6, 7, 4.5, 1.2, '#d8e2ee', (x, y) => y >= 7);
  }
  return p.canvas();
}

/* ======================================================================== places
   Each returns { w, h, before:[frames], after:[frames], fps, col:[x0,y0,x1,y1] }
   col is the solid tile box relative to the anchor tile (where you stand). */

const ROOFS = {
  brown: ['#4a2a1f', '#7a4029', '#94552f', '#b06c3c'],
  red:   ['#4a1f22', '#86372f', '#a24a38', '#c0634a'],
  teal:  ['#1f3340', '#35556a', '#44708a', '#5f8fa8'],
  moss:  ['#2b3a22', '#4e6435', '#657f44', '#809b56'],
  thatch:['#6a4a1e', '#a88238', '#c09a48', '#dcbc68'],
  plum:  ['#2e1f3a', '#4e3466', '#644480', '#7e5c9c'],
};
/* wall timber per land: the same build everywhere, different wood */
const WALLS = { 2: ['#6a4424', '#9a6a3a', '#b8864e'], 3: ['#6a2a22', '#8e3a2e', '#ac5040'], 5: ['#9a9890', '#dcd8cc', '#f0ece2'], 6: ['#3e2818', '#5e3e26', '#7a5434'], 7: ['#3a2440', '#5a3a5e', '#744e78'] };

function drawHouse(v, after, region) {
  const W = 80, Hh = 86, p = new Pix(W, Hh), R = ROOFS[v] || ROOFS.brown, r = rng(v.length * 7 + region);
  const wood = WALLS[region] || ['#6a4028', '#8a5634', '#a86e44'], stone = ['#5d6270', '#8a90a0', '#a8aebb', '#c8ccd6'];
  const snow = region === 6, thatch = v === 'thatch';
  // chimney
  p.rect(56, 2, 9, 18, stone[1]); p.rect(56, 2, 9, 2, stone[2]); p.rect(63, 4, 2, 16, stone[0]);
  for (let y = 6; y < 18; y += 4) p.rect(56, y, 9, 1, stone[0]);
  // roof: planks, narrower at top
  for (let y = 8; y <= 46; y++) {
    const t = (y - 8) / 38, x0 = Math.round(7 - t * 6), x1 = W - 1 - x0, band = Math.floor((y - 8) / 6);
    const c = y <= 11 ? R[0] : y >= 43 ? (y === 43 ? R[3] : R[0]) : (band % 2 ? R[2] : R[1]);
    p.rect(x0, y, x1 - x0 + 1, 1, c);
    if (y > 11 && y < 43 && thatch) {
      for (let x = x0 + 1; x < x1; x++) { const hsh = (x * 73 + y * 31) % 11; if (hsh < 2) p.set(x, y, R[0]); else if (hsh > 8) p.set(x, y, R[3]); }
      if ((y - 8) % 9 === 8) p.rect(x0, y, x1 - x0 + 1, 1, R[1]);
    } else if (y > 11 && y < 43) {
      if ((y - 8) % 6 === 5) p.rect(x0, y, x1 - x0 + 1, 1, R[0]);
      else for (let x = x0 + ((band * 7) % 11); x < x1; x += 11) p.set(x, y, R[0]);
      if ((y - 8) % 6 === 0) for (let x = x0 + 2; x < x1 - 1; x += 3 + ((x * 7) % 3)) p.set(x, y, R[3]);
    }
    p.set(x0, y, R[0]); p.set(x1, y, R[0]);
  }
  if (snow) for (let y = 8; y < 16; y++) { const t = (y - 8) / 38, x0 = Math.round(7 - t * 6); p.rect(x0, y, W - 2 * x0, 1, y < 14 ? '#f4f8fc' : '#d8e4f0'); }
  if (snow) for (let x = 2; x < W - 2; x++) if (r() < .5) p.set(x, 43, '#f4f8fc');
  // walls
  p.rect(5, 47, 70, 12, wood[1]);
  if (snow) for (let y = 49; y < 59; y += 3) { p.rect(5, y, 70, 1, wood[0]); p.rect(5, y - 1, 70, 1, wood[2]); } // log cabin
  else for (let x = 5; x < 75; x += 5) p.rect(x, 47, 1, 12, wood[0]);
  p.rect(5, 47, 70, 1, wood[0]);
  const win = x => {
    p.rect(x - 1, 48, 14, 11, wood[0]);
    p.rect(x - 4, 48, 3, 10, R[1]); p.rect(x + 13, 48, 3, 10, R[1]); p.rect(x - 4, 48, 3, 1, R[3]); p.rect(x + 13, 48, 3, 1, R[3]);
    const g = after ? '#ffd46a' : '#2d3440', g2 = after ? '#fff2c0' : '#3c4452';
    p.rect(x, 49, 12, 8, g); p.rect(x + 1, 50, 4, 3, g2); p.rect(x + 5, 49, 2, 8, wood[0]); p.rect(x, 52, 12, 1, wood[0]);
    if (!after) { for (let i = 0; i < 5; i++) { p.set(x + i, 49 + i, '#e8e8f0'); p.set(x + i, 49, '#c8c8d0'); p.set(x, 49 + i, '#c8c8d0'); } }
    if (after) {
      p.rect(x - 2, 57, 16, 3, wood[2]); p.rect(x - 2, 59, 16, 1, wood[0]);
      const fc = region === 6 ? ['#d8392e', '#f4f8fc'] : region === 7 ? ['#ffe08a', '#b8a0f0'] : ['#e84a5a', '#f6d04a', '#f08ab0', '#fff'];
      for (let i = 0; i < 7; i++) { p.set(x - 1 + i * 2, 56, fc[i % fc.length]); p.set(x + i * 2, 55, '#4f8c3c'); }
    }
  };
  win(15); win(53);
  // stone base
  for (let y = 59; y < 82; y++) p.rect(3, y, 74, 1, stone[1]);
  for (let row = 0; row < 5; row++) {
    const y = 60 + row * 4.4, off = row % 2 ? 5 : 0;
    for (let x = 3 + off; x < 77; x += 10) { p.ell(x + 4, y + 2, 4.6, 2.2, stone[2]); p.ell(x + 3, y + 1.3, 2.2, .9, stone[3]); }
  }
  p.rect(3, 59, 74, 1, stone[0]); p.rect(3, 81, 74, 1, stone[0]);
  // door with stone arch
  p.ell(40, 57, 9, 8, stone[3], (x, y) => y < 60); p.rect(31, 57, 18, 25, stone[3]);
  const door = after ? '#5b7a98' : '#56657a';
  p.ell(40, 58, 7, 6, door, (x, y) => y < 60); p.rect(33, 58, 14, 24, door);
  for (let x = 35; x < 47; x += 3) p.rect(x, 55, 1, 27, shade(door, -.2));
  p.set(44, 70, '#f2c12e'); p.set(44, 71, '#c8901e');
  p.rect(29, 82, 22, 3, stone[2]); p.rect(29, 84, 22, 1, stone[0]);
  if (after) {
    // potted plant + wreath
    p.rect(22, 76, 6, 6, '#b8603a'); p.ell(25, 73, 4, 4, '#4f8c3c'); p.set(24, 72, '#e84a5a'); p.set(26, 74, '#f6d04a');
    p.circ(40, 63, 3, '#4f8c3c'); p.circ(40, 63, 1.5, door); p.set(40, 66, '#d8392e');
  } else {
    // cobweb in the roof corner, a crack
    for (let i = 0; i < 7; i++) { p.set(2 + i, 46 - i, '#e8e8f0'); } p.line(2, 40, 8, 46, '#d8d8e0');
    p.line(60, 64, 64, 70, stone[0]);
  }
  p.outline(INK);
  return p;
}

function drawGarden(v, after, region) {
  const p = new Pix(80, 62), r = rng(v.length * 13);
  const soil = ['#6a4028', '#8a5634', '#a0683e'], fence = ['#8a5a34', '#b07a48', '#d0a068'];
  // soil bed
  p.rect(5, 12, 70, 42, soil[1]);
  for (let y = 16; y < 52; y += 7) { p.rect(7, y, 66, 2, soil[0]); p.rect(7, y - 1, 66, 1, soil[2]); }
  // plants
  const rows = [18, 25, 32, 39, 46];
  const fl = {
    tulips: ['#d8463c', '#f2c12e', '#e8589a', '#f4f0ea'], cabbages: null, sunflowers: null, pumpkins: null,
    roses: ['#ec7fa6', '#f4b0c8', '#d8463c'], berries: ['#c2273b'], moonflowers: ['#dfe8ff', '#b8c8ff', '#fff'],
  }[v];
  rows.forEach((y, ri) => {
    for (let x = 11 + (ri % 2) * 4; x < 72; x += 9) {
      if (!after) {
        if (r() < .7) { p.set(x, y - 1, '#6caa46'); p.set(x + 1, y - 2, '#6caa46'); }
        continue;
      }
      if (v === 'cabbages') { p.circ(x, y - 2, 3.2, '#5a9a4a'); p.circ(x - .5, y - 2.5, 2, '#8ac86a'); p.set(x - 1, y - 3, '#b8e090'); }
      else if (v === 'pumpkins') { if ((x + ri) % 2) { p.ell(x, y - 2, 4, 3, '#e8812a'); p.line(x, y - 5, x, y, '#c8601a'); p.set(x - 2, y - 3, '#f4a44a'); p.set(x, y - 6, '#5a7a2a'); } else { p.line(x - 3, y - 1, x + 3, y - 2, '#5a8a3a'); p.set(x + 2, y - 3, '#6caa46'); } }
      else if (v === 'sunflowers') { p.line(x, y, x, y - 9, '#4f8c3c'); p.set(x + 1, y - 4, '#6caa46'); p.circ(x, y - 11, 3.2, '#f2c12e'); p.circ(x, y - 11, 1.5, '#7a4a2e'); }
      else if (v === 'berries') { p.circ(x, y - 2, 3.4, '#2e6a4a'); p.circ(x - .5, y - 2.5, 2, '#3f8a5a'); [[-1, -3], [1, -1], [2, -4], [-2, -1]].forEach(([dx, dy]) => p.set(x + dx, y + dy, '#d8263b')); p.set(x, y - 5, '#f4f8fc'); }
      else {
        const c = fl[Math.floor(r() * fl.length)];
        p.line(x, y, x, y - 4, '#4f8c3c'); p.set(x - 1, y - 2, '#6caa46');
        p.rect(x - 1, y - 7, 3, 3, c); p.set(x, y - 8, c); p.set(x, y - 6, shade(c, -.2));
        if (v === 'moonflowers') p.set(x, y - 6, '#ffffff');
      }
    }
  });
  // fence: back rail, posts, front rail with a gap for the gate
  const post = (x, y, h) => { p.rect(x, y, 3, h, fence[1]); p.rect(x, y, 3, 1, fence[2]); p.rect(x + 2, y + 1, 1, h - 1, fence[0]); };
  p.rect(2, 8, 76, 2, fence[1]); p.rect(2, 12, 76, 1, fence[0]);
  for (let x = 2; x < 78; x += 12) post(x, 4, 10);
  for (let y = 10; y < 52; y += 10) { post(1, y, 8); post(76, y, 8); }
  p.rect(1, 12, 2, 42, fence[1]); p.rect(77, 12, 2, 42, fence[1]);
  p.rect(2, 53, 32, 2, fence[1]); p.rect(46, 53, 32, 2, fence[1]); p.rect(2, 55, 32, 1, fence[0]); p.rect(46, 55, 32, 1, fence[0]);
  [2, 14, 26, 31, 46, 51, 63, 76].forEach(x => post(x, 49, 10));
  if (region === 6) for (let x = 2; x < 78; x++) { if (r() < .6) p.set(x, 7, '#f4f8fc'); if (r() < .6) p.set(x, 52, '#f4f8fc'); }
  p.outline(INK);
  return p;
}

/* pens come in two layers so animals walk between the back and front fence */
function drawPen(v, after, region) {
  const W = 112, H = 66, back = new Pix(W, H), front = new Pix(W, H), r = rng(5);
  const fence = region === 5 ? ['#7a6a5a', '#9a8a78', '#bcae9a'] : ['#8a5a34', '#b07a48', '#d0a068'];
  const post = (p, x, y, h) => { p.rect(x, y, 3, h, fence[1]); p.rect(x, y, 3, 1, fence[2]); p.rect(x + 2, y + 1, 1, h - 1, fence[0]); };
  // inside ground
  const ground = v === 'pigs' ? '#9a7048' : null;
  if (ground) { back.ell(56, 36, 44, 18, ground); back.ell(52, 34, 30, 10, shade(ground, .12)); }
  if (v === 'ducks') {
    back.ell(62, 36, 30, 15, after ? '#4a9ac8' : '#8a6a4a');
    back.ell(62, 36, 27, 12.5, after ? '#62b4dc' : '#9a7a58');
    if (after) { for (let i = 0; i < 8; i++) back.rect(40 + r() * 40, 30 + r() * 12, 4, 1, '#a8dcf0'); back.ell(76, 42, 3, 2, '#5a9a4a'); back.ell(46, 32, 2.5, 1.6, '#5a9a4a'); }
    else for (let i = 0; i < 6; i++) back.line(46 + r() * 30, 30 + r() * 12, 50 + r() * 30, 32 + r() * 10, '#7a5a3a');
  }
  // trough (top right)
  back.rect(78, 12, 22, 8, '#8a5634'); back.rect(80, 13, 18, 4, after ? (v === 'pigs' ? '#c8a060' : '#e0c050') : '#5a3a24');
  back.rect(78, 12, 22, 1, '#a86e44'); if (after) for (let i = 0; i < 8; i++) back.set(80 + r() * 18, 12 + r() * 2, v === 'pigs' ? '#e8812a' : '#f4dc8a');
  if (after && v !== 'ducks') {
    back.rect(10, 12, 18, 11, '#e0b84a'); back.rect(10, 12, 18, 2, '#f0d070'); back.rect(15, 12, 1, 11, '#a87a2a'); back.rect(22, 12, 1, 11, '#a87a2a');
  }
  // back fence + sides
  back.rect(1, 8, W - 2, 2, fence[1]); back.rect(1, 12, W - 2, 1, fence[0]); back.rect(1, 5, W - 2, 1, fence[1]);
  for (let x = 1; x < W - 2; x += 12) post(back, x, 2, 11);
  post(back, W - 4, 2, 11);
  for (let y = 12; y < 58; y += 11) { post(back, 0, y, 9); post(back, W - 4, y, 9); }
  back.rect(0, 12, 2, 46, fence[1]); back.rect(W - 3, 12, 2, 46, fence[1]);
  // front fence
  front.rect(1, 56, W - 2, 2, fence[1]); front.rect(1, 60, W - 2, 1, fence[0]); front.rect(1, 53, W - 2, 1, fence[1]);
  for (let x = 1; x < W - 2; x += 12) post(front, x, 50, 12);
  post(front, W - 4, 50, 12);
  if (after) for (let x = 6; x < W - 6; x += 7) { const c = ['#e84a5a', '#f6d04a', '#f4f0ea', '#b88ae0'][x % 4]; front.set(x, 62, '#4f8c3c'); front.set(x, 61, c); front.set(x + 1, 62, '#4f8c3c'); }
  if (region === 6) for (let x = 2; x < W - 2; x++) { if (r() < .5) back.set(x, 4, '#f4f8fc'); if (r() < .5) front.set(x, 52, '#f4f8fc'); }
  back.outline(INK); front.outline(INK);
  return { back, front };
}

function drawWell(after, region, frame = 0) {
  const p = new Pix(48, 52), st = ['#5d6270', '#8a90a0', '#a8aebb', '#c8ccd6'], wood = ['#6a4028', '#8a5634', '#a86e44'];
  const snow = region === 6;
  // posts + roof
  p.rect(8, 10, 4, 28, wood[1]); p.rect(36, 10, 4, 28, wood[1]); p.rect(11, 10, 1, 28, wood[0]); p.rect(39, 10, 1, 28, wood[0]);
  for (let y = 0; y < 10; y++) { const w = 10 + y * 1.8; p.rect(24 - w, 2 + y, w * 2, 1, y % 3 === 2 ? '#6a3024' : '#94452f'); }
  if (snow) p.rect(8, 2, 32, 3, '#f4f8fc');
  p.rect(10, 16, 28, 2, wood[0]);
  // ring
  p.ell(24, 38, 17, 10, st[1]);
  for (let a = 0; a < 12; a++) { const x = 24 + Math.cos(a / 12 * Math.PI * 2) * 13.5, y = 38 + Math.sin(a / 12 * Math.PI * 2) * 7.4; p.ell(x, y, 3.4, 2, st[2]); p.set(x - 1, y - 1, st[3]); }
  p.ell(24, 36, 10, 4.5, after ? '#2e6a9a' : '#2a2226');
  if (after) { p.ell(24, 36.5, 8, 3, '#4a9ac8'); p.rect(19 + frame * 2, 36, 3, 1, '#a8dcf0'); }
  p.rect(7, 38, 34, 10, st[1]); p.ell(24, 47, 17, 4, st[1]);
  for (let x = 8; x < 40; x += 8) { p.ell(x + 3, 42, 3.6, 2, st[2]); p.ell(x + 7, 46, 3.6, 2, st[2]); }
  if (after) {
    p.line(24, 18, 24, 27, '#d0b080'); p.rect(21, 27, 7, 6, wood[1]); p.rect(21, 27, 7, 1, wood[2]); p.rect(22, 28, 5, 2, '#6fb3d6');
    p.set(41, 20, '#8a5a34'); p.rect(40, 16, 3, 3, wood[0]);
    const fc = snow ? '#d8392e' : '#f08ab0';
    [[5, 48], [9, 50], [40, 49], [43, 47]].forEach(([x, y]) => { p.set(x, y, fc); p.set(x, y + 1, '#4f8c3c'); });
  } else {
    [[12, 40], [30, 44], [18, 45]].forEach(([x, y]) => p.set(x, y, '#5a8a3a'));
    p.line(9, 20, 12, 26, '#6a4028');
  }
  p.outline(INK);
  return p;
}

function drawFountain(after, region, frame = 0, star = false) {
  const p = new Pix(56, 58), st = ['#5d6270', '#8a90a0', '#a8aebb', '#c8ccd6'];
  const water = ['#3a86b8', '#5aaad8', '#8ad0f0', '#d8f4ff'];
  // basin
  p.ell(28, 42, 26, 13, st[1]); p.ell(28, 40, 24, 11, st[2]); p.ell(28, 40.5, 20, 8, after ? water[0] : '#6a5a4a');
  if (after) { p.ell(28, 41, 18, 6.5, water[1]); for (let i = 0; i < 6; i++) { const a = i + frame * .9; p.rect(Math.round(15 + (i * 7 + frame * 3) % 26), Math.round(38 + Math.sin(a) * 3), 3, 1, water[2]); } }
  else { p.ell(28, 41, 17, 6, '#7a6a52'); [[16, 40], [34, 43], [24, 38], [38, 39]].forEach(([x, y], i) => { p.set(x, y, ['#d8702a', '#c8461c', '#a8703e', '#5a8a3a'][i]); p.set(x + 1, y, '#a84a1c'); }); p.line(12, 36, 18, 40, '#4a3a2a'); }
  for (let a = 0; a < 16; a++) { const x = 28 + Math.cos(a / 16 * Math.PI * 2) * 23, y = 40 + Math.sin(a / 16 * Math.PI * 2) * 10.5; p.set(x, y - 1, st[3]); }
  p.rect(3, 42, 50, 6, st[1]); p.ell(28, 48, 25, 6, st[0], (x, y) => y > 47);
  for (let x = 6; x < 52; x += 9) p.rect(x, 43, 1, 7, st[0]);
  // column + top bowl
  p.rect(24, 16, 8, 24, st[2]); p.rect(30, 16, 2, 24, st[1]); p.rect(25, 18, 1, 20, st[3]);
  p.ell(28, 15, 10, 4, st[2]); p.ell(28, 14, 8, 2.5, after ? water[1] : st[0]);
  if (star) { p.rect(26, 2, 4, 9, '#c8901e'); [[28, 1], [25, 5], [31, 5], [26, 9], [30, 9]].forEach(([x, y]) => p.circ(x, y, 1.6, '#f5c542')); p.circ(28, 5, 2.6, '#f5c542'); p.set(27, 4, '#fff0a0'); }
  else { p.rect(26, 6, 4, 8, st[2]); p.circ(28, 5, 2.5, st[3]); }
  if (after) {
    // arcs of water from the top bowl
    for (let s = -1; s <= 1; s += 2) for (let t = 0; t < 14; t++) {
      const x = 28 + s * (8 + t * 1.1), y = 14 + (t * t) / 8 - 2;
      if ((t + frame) % 3 !== 0) p.set(x, y, t % 2 ? water[3] : water[2]);
    }
    p.rect(27, 8 - (frame % 2), 2, 5, water[3]);
  }
  if (region === 6) { p.ell(28, 34, 22, 3, '#f4f8fc', (x, y) => y < 33 && !after); }
  p.outline(INK);
  return p;
}

function drawStall(v, after) {
  const p = new Pix(80, 66), wood = ['#6a4028', '#8a5634', '#a86e44', '#c89058'];
  const cloth = { bread: ['#c8483c', '#f4ead8'], fruit: ['#4f9a52', '#f4ead8'], fish: ['#3f6fa8', '#f4f8fc'], cookies: ['#d0609a', '#f4ead8'] }[v] || ['#c8483c', '#f4ead8'];
  // posts
  p.rect(8, 12, 3, 34, wood[1]); p.rect(69, 12, 3, 34, wood[1]);
  // counter
  p.rect(4, 34, 72, 20, wood[1]); p.rect(4, 34, 72, 3, wood[3]); p.rect(4, 37, 72, 1, wood[0]);
  for (let x = 4; x < 76; x += 8) p.rect(x, 38, 1, 16, wood[0]);
  p.rect(4, 52, 72, 2, wood[0]);
  // wheels
  [14, 66].forEach(x => { p.circ(x, 55, 7, wood[0]); p.circ(x, 55, 5.5, wood[2]); p.circ(x, 55, 1.6, wood[0]); p.line(x - 5, 55, x + 5, 55, wood[0]); p.line(x, 50, x, 60, wood[0]); });
  // awning
  const aw = after ? 18 : 10;
  for (let y = 4; y < 4 + aw; y++) for (let x = 2; x < 78; x++) {
    const stripe = Math.floor((x - 2) / 8) % 2;
    p.set(x, y, y === 4 ? shade(cloth[stripe], .2) : cloth[stripe]);
  }
  for (let x = 2; x < 78; x++) { const s = Math.floor((x - 2) / 8) % 2, sc = (x - 2) % 8; if (sc > 0 && sc < 7) p.set(x, 4 + aw, cloth[s]); if (sc > 1 && sc < 6) p.set(x, 5 + aw, cloth[s]); }
  if (!after) { p.rect(30, 4 + aw - 2, 9, 3, null); for (let i = 0; i < 6; i++) p.set(40 + i, 4 + aw + (i % 2), shade(cloth[0], -.2)); }
  // goods
  if (after) {
    const r = rng(9);
    if (v === 'bread') for (let i = 0; i < 6; i++) { const x = 10 + i * 10, y = 30 + (i % 2) * 2; p.ell(x, y, 4.6, 2.8, '#c98a45'); p.ell(x - .5, y - .8, 3.4, 1.4, '#e8b46a'); p.set(x - 1, y - 1, '#f0cd8a'); }
    if (v === 'fruit') for (let b = 0; b < 3; b++) { const bx = 10 + b * 22; p.rect(bx, 28, 16, 7, '#b88048'); p.rect(bx, 28, 16, 1, '#d8a060'); for (let i = 0; i < 6; i++) p.circ(bx + 3 + (i % 3) * 5, 27 + Math.floor(i / 3) * 2, 2.2, ['#d23a2e', '#f2a23a', '#8ac04a'][b]); }
    if (v === 'fish') for (let i = 0; i < 5; i++) { const x = 12 + i * 12; p.ell(x, 31, 5, 2, '#a8c0d0'); p.ell(x - 1, 30.4, 3, .9, '#e8f0f8'); p.set(x + 5, 30, '#7890a8'); p.set(x + 6, 32, '#7890a8'); p.set(x - 3, 30, INK); }
    if (v === 'cookies') for (let i = 0; i < 7; i++) { const x = 10 + i * 9, y = 31; [[0, -2], [-2, 0], [2, 0], [-1, 2], [1, 2], [0, 0]].forEach(([dx, dy]) => p.set(x + dx, y + dy, '#d8a05a')); p.set(x, y - 1, '#f0d09a'); p.set(x, y, '#e8b46a'); }
    void r;
  } else {
    p.rect(26, 29, 12, 6, '#b88048'); p.rect(26, 29, 12, 1, '#d8a060');
  }
  p.outline(INK);
  return p;
}

function drawAppleTree(after) {
  const p = new Pix(80, 84), r = rng(77);
  p.rect(36, 50, 9, 26, TRUNK[0]); p.rect(42, 52, 3, 24, TRUNK[1]); p.rect(32, 72, 17, 4, TRUNK[0]); p.rect(38, 56, 2, 6, TRUNK[2]);
  canopy(p, 40, 32, FOLIAGE.green, 24, 3);
  for (let i = 0; i < 26; i++) {
    const x = 18 + r() * 44, y = 14 + r() * 36;
    if (!p.get(Math.round(x), Math.round(y))) continue;
    if (after) { p.circ(x, y, 1.6, '#d8392e'); p.set(x - 1, y - 1, '#ff8a7a'); }
    else if (i % 2) p.set(x, y, '#b8d870');
  }
  if (after) {
    p.rect(56, 68, 16, 9, '#b88048'); p.rect(56, 68, 16, 1, '#d8a060'); p.rect(58, 64, 1, 4, '#8a5a34'); p.rect(69, 64, 1, 4, '#8a5a34'); p.rect(58, 63, 12, 1, '#8a5a34');
    for (let i = 0; i < 6; i++) p.circ(59 + (i % 3) * 5, 67 - Math.floor(i / 3) * 2, 2, '#d8392e');
    p.circ(22, 76, 2, '#d8392e'); p.circ(27, 78, 2, '#d8392e');
  }
  p.outline(INK);
  p.blit(shadowPix(46, 8), 17, 72);
  return p;
}

function drawWindmill(after, frame = 0) {
  const p = new Pix(96, 118), st = ['#8a8070', '#d8ccb4', '#ece2cc', '#b8ac94'];
  // tower
  for (let y = 34; y < 110; y++) { const t = (y - 34) / 76, hw = 11 + t * 9; p.rect(48 - hw, y, hw * 2, 1, st[1]); p.rect(48 + hw - 4, y, 4, 1, st[3]); p.rect(48 - hw, y, 2, 1, st[2]); }
  for (let y = 40; y < 108; y += 9) p.rect(30, y, 36, 1, st[3]);
  p.rect(26, 108, 44, 2, st[0]);
  p.ell(48, 98, 6, 5, '#6a4028', (x, y) => y < 98); p.rect(42, 98, 12, 12, '#6a4028'); p.rect(44, 99, 8, 11, '#8a5634');
  p.rect(44, 62, 8, 9, '#5a3a24'); p.rect(45, 63, 6, 7, after ? '#ffd46a' : '#2d3440'); p.rect(47, 63, 2, 7, '#5a3a24');
  // cap
  p.ell(48, 34, 14, 10, '#6a3024', (x, y) => y <= 34); p.ell(47, 31, 10, 6, '#94452f', (x, y) => y <= 33); p.rect(34, 33, 28, 3, '#4a2a1f');
  // sails
  const hub = [48, 32], ang = after ? frame * (Math.PI / 2) / 8 : .35;
  const wood = '#6a4028', cloth = after ? '#f4ecd8' : '#c8bca4';
  for (let b = 0; b < 4; b++) {
    const a = ang + b * Math.PI / 2, len = (!after && b === 2) ? 20 : 38;
    const ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
    for (let t = 5; t < len; t += .5) for (let w = -1; w <= 7; w += .5) {
      const x = hub[0] + ux * t + vx * w, y = hub[1] + uy * t + vy * w;
      const edge = w <= -.5 || w >= 6.5 || Math.abs(t % 6) < .6;
      if (w < 0.5 && w > -0.6) p.set(x, y, wood);
      else if (!(!after && b === 1 && t > 20 && w > 2)) p.set(x, y, edge ? wood : cloth);
    }
  }
  p.circ(hub[0], hub[1], 3, '#4a2a1f'); p.set(hub[0], hub[1], '#a86e44');
  p.outline(INK);
  p.blit(shadowPix(50, 8), 23, 107);
  return p;
}

function drawLighthouse(after) {
  const p = new Pix(48, 118);
  for (let y = 30; y < 108; y++) {
    const t = (y - 30) / 78, hw = 8 + t * 5, band = Math.floor((y - 30) / 13) % 2;
    const c = band ? '#f4efe4' : '#c8483c';
    p.rect(24 - hw, y, hw * 2, 1, c); p.rect(24 + hw - 3, y, 3, 1, shade(c, -.18));
  }
  p.rect(9, 106, 30, 4, '#8a90a0'); p.rect(9, 106, 30, 1, '#a8aebb');
  p.ell(24, 97, 3.5, 3.5, '#4a3a3a', (x, y) => y < 98); p.rect(21, 97, 7, 9, '#4a3a3a');
  p.rect(22, 60, 4, 6, '#2d3440');
  // gallery
  p.rect(10, 26, 28, 4, '#3a3440'); for (let x = 11; x < 38; x += 3) p.rect(x, 21, 1, 5, '#3a3440'); p.rect(10, 21, 28, 1, '#3a3440');
  // lamp room
  p.rect(14, 10, 20, 12, '#3a3440'); p.rect(16, 11, 16, 10, after ? '#ffe07a' : '#4a5468'); if (after) p.rect(18, 12, 6, 6, '#fff8d0');
  p.rect(23, 11, 2, 10, '#3a3440');
  for (let y = 0; y < 10; y++) { const w = 3 + y * 1.3; p.rect(24 - w, 1 + y, w * 2, 1, '#c8483c'); }
  p.set(24, 0, '#3a3440');
  p.outline(INK);
  p.blit(shadowPix(34, 6), 7, 106);
  return p;
}

function drawSnowman(after) {
  const p = new Pix(48, 52), s = ['#c8d6e8', '#e8f0f8', '#ffffff'];
  if (!after) {
    p.ell(24, 40, 16, 8, s[0]); p.ell(22, 38, 13, 6, s[1]); p.ell(18, 36, 5, 2, s[2]);
    p.ell(36, 44, 5, 3, s[0]); p.ell(35, 43, 4, 2, s[1]);
    p.rect(8, 30, 1, 10, '#6a4430'); p.line(8, 32, 5, 29, '#6a4430');
  } else {
    p.ell(24, 40, 12, 9, s[0]); p.ell(23, 38.5, 10.5, 7.5, s[1]); p.ell(20, 36, 4, 3, s[2]);
    p.ell(24, 24, 9, 7.5, s[0]); p.ell(23, 23, 7.5, 6, s[1]);
    p.ell(24, 12, 6.5, 6, s[0]); p.ell(23.5, 11, 5.5, 5, s[1]); p.set(21, 9, s[2]);
    p.set(21, 11, INK); p.set(26, 11, INK); p.rect(24, 13, 5, 1, '#e8812a'); p.set(28, 14, '#e8812a');
    [[22, 15], [24, 16], [26, 15]].forEach(([x, y]) => p.set(x, y, '#3a3440'));
    p.rect(16, 17, 16, 3, '#d8463c'); p.rect(28, 19, 3, 7, '#d8463c'); p.rect(28, 25, 3, 1, '#a8323a');
    p.rect(17, 5, 14, 1, '#2e2a33'); p.rect(19, -1, 10, 6, '#2e2a33'); p.rect(19, 3, 10, 1, '#4a86c8');
    p.line(15, 24, 7, 18, '#6a4430'); p.line(8, 18, 6, 16, '#6a4430'); p.line(32, 24, 40, 19, '#6a4430'); p.line(39, 19, 41, 16, '#6a4430');
    [[24, 22], [24, 26], [24, 36]].forEach(([x, y]) => p.set(x, y, '#3a3440'));
  }
  p.outline(INK);
  p.blit(shadowPix(26, 5), 11, 46);
  return p;
}

function drawLanterns(after, frame = 0) {
  const p = new Pix(80, 64), wood = ['#3a3440', '#5a5260'];
  [6, 72].forEach(x => { p.rect(x, 6, 3, 56, wood[1]); p.rect(x + 2, 6, 1, 56, wood[0]); p.rect(x - 2, 60, 7, 2, wood[0]); p.rect(x - 1, 4, 5, 2, wood[0]); });
  for (let x = 9; x < 72; x++) { const t = (x - 9) / 63, y = 8 + Math.sin(t * Math.PI) * 10; p.set(x, y, '#2a2426'); }
  const cols = after ? ['#f2923a', '#f06a7a', '#ffd46a', '#8ad0a0', '#f2923a'] : ['#9a948c', '#8a847e', '#a8a29a', '#9a948c', '#8a847e'];
  for (let i = 0; i < 5; i++) {
    const x = 15 + i * 12.5, t = (x - 9) / 63, y = Math.round(8 + Math.sin(t * Math.PI) * 10), c = cols[i];
    p.rect(x, y, 1, 3, '#2a2426');
    p.ell(x + .5, y + 8, 4, 5, c); p.rect(x - 2, y + 3, 5, 1, '#3a3440'); p.rect(x - 2, y + 13, 5, 1, '#3a3440');
    p.line(x - 2, y + 8, x + 3, y + 8, shade(c, -.15));
    if (after) { p.set(x - 1, y + 6, shade(c, .5)); p.set(x - 1, y + 7, shade(c, .5)); }
  }
  p.outline(INK);
  return p;
}

/* gate between regions. vertical=true means the boundary runs up-down (you walk left-right through it) */
function drawGate(vertical, open) {
  const st = ['#5d6270', '#8a90a0', '#a8aebb', '#c8ccd6'], wood = ['#6a4028', '#8a5634', '#a86e44'];
  if (vertical) {
    const p = new Pix(32, 80);
    const pillar = y => { p.rect(8, y, 16, 14, st[1]); p.rect(8, y, 16, 3, st[3]); p.rect(20, y + 3, 4, 11, st[0]); p.rect(6, y + 12, 20, 3, st[2]); };
    pillar(0); pillar(62);
    if (!open) {
      for (let y = 14; y < 64; y += 1) { p.rect(12, y, 8, 1, (y % 8 < 1) ? wood[0] : wood[1]); p.set(13, y, wood[2]); }
      p.rect(10, 24, 12, 3, wood[0]); p.rect(10, 50, 12, 3, wood[0]);
      p.rect(13, 34, 7, 8, '#c8901e'); p.rect(14, 31, 5, 3, null); p.rect(14, 31, 1, 3, '#8a8e9a'); p.rect(18, 31, 1, 3, '#8a8e9a'); p.rect(14, 30, 5, 1, '#8a8e9a'); p.set(16, 37, INK); p.set(16, 38, INK);
    } else {
      p.rect(4, 14, 4, 12, wood[1]); p.rect(24, 54, 4, 10, wood[1]);
    }
    p.outline(INK);
    return p.canvas();
  }
  const p = new Pix(80, 40);
  const pillar = x => { p.rect(x, 0, 14, 28, st[1]); p.rect(x, 0, 14, 3, st[3]); p.rect(x + 10, 3, 4, 25, st[0]); p.rect(x - 2, 26, 18, 3, st[2]); };
  pillar(0); pillar(66);
  if (!open) {
    p.rect(14, 12, 52, 16, wood[1]); for (let x = 14; x < 66; x += 5) p.rect(x, 12, 1, 16, wood[0]); p.rect(14, 12, 52, 2, wood[2]);
    p.rect(14, 18, 52, 2, wood[0]);
    p.rect(36, 16, 8, 8, '#c8901e'); p.set(40, 19, INK); p.set(40, 20, INK); p.rect(37, 13, 6, 1, '#8a8e9a'); p.rect(37, 13, 1, 3, '#8a8e9a'); p.rect(42, 13, 1, 3, '#8a8e9a');
  } else {
    p.rect(14, 22, 6, 6, wood[1]); p.rect(60, 22, 6, 6, wood[1]);
  }
  p.outline(INK);
  return p.canvas();
}

/* build the sprite spec for a place */
function placeSprites(type, v, region) {
  const both = (fn, n = 1) => ({ before: [fn(false, 0).canvas()], after: Array.from({ length: n }, (_, f) => fn(true, f).canvas()) });
  switch (type) {
    case 'house': return { w: 80, h: 86, col: [-2, -4, 2, -1], oy: 4, ...both(a => drawHouse(v, a, region)), smoke: [18, -84] };
    case 'garden': return { w: 80, h: 62, col: [-2, -3, 2, -1], oy: 2, ...both(a => drawGarden(v, a, region)) };
    case 'pen': {
      const b = drawPen(v, false, region), a = drawPen(v, true, region);
      return { w: 112, h: 66, col: [-3, -4, 3, -1], oy: 2, before: [b.back.canvas()], after: [a.back.canvas()], front: { before: b.front.canvas(), after: a.front.canvas() }, animals: v };
    }
    case 'well': return { w: 48, h: 52, col: [-1, -2, 1, -1], oy: 2, ...both((a, f) => drawWell(a, region, f), 3), fps: 3 };
    case 'fountain': return { w: 56, h: 58, col: [-1, -3, 1, -1], oy: 4, ...both((a, f) => drawFountain(a, region, f, v === 'star'), 3), fps: 6 };
    case 'stall': return { w: 80, h: 66, col: [-2, -2, 2, -1], oy: 2, ...both(a => drawStall(v, a)) };
    case 'appletree': return { w: 80, h: 84, col: [0, -2, 0, -1], oy: 2, ...both(a => drawAppleTree(a)) };
    case 'windmill': return { w: 96, h: 118, col: [-1, -3, 1, -1], oy: 2, ...both((a, f) => drawWindmill(a, f), 8), fps: 10 };
    case 'lighthouse': return { w: 48, h: 118, col: [-1, -2, 1, -1], oy: 2, ...both(a => drawLighthouse(a)), glow: [24, -102] };
    case 'snowman': return { w: 48, h: 52, col: [-1, -2, 1, -1], oy: 2, ...both(a => drawSnowman(a)) };
    case 'lanterns': return { w: 80, h: 64, col: [-2, -1, -2, -1], col2: [2, -1, 2, -1], oy: 0, ...both(a => drawLanterns(a)), glowLanterns: true };
  }
}
