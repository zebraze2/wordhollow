/* Main loop: walking (keys or tap-to-walk), camera, drawing, talking to people. */

const Game = {
  cv: null, cx: null, scale: 3, dpr: 1, cam: { x: 0, y: 0 },
  player: { x: 0, y: 0, dir: 0, frame: 0, t: 0, moving: false, path: null },
  keys: {}, paused: true, time: 0, particles: [], near: null, fogAlpha: [], lastRegion: -1,

  init() {
    this.cv = document.getElementById('world');
    this.cx = this.cv.getContext('2d');
    World.build();
    const D = Save.data;
    for (const sp of World.spots) sp.done = !!D.done[sp.id];
    for (let i = 0; i < 8; i++) this.fogAlpha[i] = i < D.unlocked && i < PLAYABLE ? 0 : 1;
    World.gates.forEach(g => World.setGate(g, g.to < D.unlocked && g.to < PLAYABLE));
    const start = D.pos || { x: (regionOrigin(0).ox + 11) * T + 8, y: (regionOrigin(0).oy + 12) * T + 12 };
    Object.assign(this.player, start);
    this.snapCam();
    this.resize();
    addEventListener('resize', () => this.resize());
    addEventListener('keydown', e => this.onKey(e, true));
    addEventListener('keyup', e => this.onKey(e, false));
    this.cv.addEventListener('pointerdown', e => this.onTap(e));
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      this.update(dt); this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    setInterval(() => { if (!this.paused) { D.pos = { x: Math.round(this.player.x), y: Math.round(this.player.y) }; Save.write(); } }, 3000);
  },

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    const w = innerWidth, h = innerHeight;
    this.cv.width = Math.round(w * this.dpr); this.cv.height = Math.round(h * this.dpr);
    this.cv.style.width = w + 'px'; this.cv.style.height = h + 'px';
    // integer scale showing roughly 22 tiles across
    this.scale = Math.max(2, Math.round(Math.min(this.cv.width / (22 * T), this.cv.height / (13 * T))));
  },
  view() { return { w: this.cv.width / this.scale, h: this.cv.height / this.scale }; },
  snapCam() { const v = this.view(); this.cam.x = this.player.x - v.w / 2; this.cam.y = this.player.y - v.h / 2; this.clampCam(); },
  clampCam() {
    const v = this.view();
    this.cam.x = Math.max(0, Math.min(TW * T - v.w, this.cam.x));
    this.cam.y = Math.max(0, Math.min(TH * T - v.h, this.cam.y));
    if (v.w > TW * T) this.cam.x = (TW * T - v.w) / 2;
  },

  onKey(e, down) {
    const k = e.key.toLowerCase();
    if (UI.onKey && UI.onKey(e, down)) return;
    this.keys[k] = down;
    if (down && !this.paused) {
      if (k === ' ' || k === 'enter' || k === 'e') { e.preventDefault(); this.interact(); }
      if (k === 'm') UI.openMap();
    }
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  },

  /* tap to walk; tapping a place or person walks there and talks */
  onTap(e) {
    if (this.paused) return;
    ensureAudio();
    const r = this.cv.getBoundingClientRect();
    const wx = this.cam.x + (e.clientX - r.left) * this.dpr / this.scale, wy = this.cam.y + (e.clientY - r.top) * this.dpr / this.scale;
    let target = null;
    for (const sp of World.spots) {
      const S = sp.S;
      if ((wx > sp.left && wx < sp.left + S.w && wy > sp.top && wy < sp.ay * T + 4) || Math.hypot(wx - sp.person.x, wy - sp.person.y + 8) < 14) { target = sp; break; }
    }
    let goal;
    if (target) goal = [target.ax, target.ay];
    else goal = [Math.floor(wx / T), Math.floor(wy / T)];
    const p = this.findPath([Math.floor(this.player.x / T), Math.floor(this.player.y / T)], goal);
    if (p) { this.player.path = p; this.player.pathTarget = target; }
    this.tapMark = { x: wx, y: wy, t: 0 };
  },
  findPath(a, b) {
    if (World.isSolid(b[0], b[1])) {
      // nearest walkable tile to the tap
      let best = null, bd = 1e9;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const x = b[0] + dx, y = b[1] + dy; if (!World.isSolid(x, y) && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; best = [x, y]; } }
      if (!best) return null; b = best;
    }
    const prev = new Int32Array(TW * TH).fill(-1), q = [a[1] * TW + a[0]], goal = b[1] * TW + b[0];
    prev[q[0]] = q[0];
    for (let h = 0; h < q.length; h++) {
      const c = q[h]; if (c === goal) break;
      const x = c % TW, y = (c / TW) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, n = ny * TW + nx;
        if (World.isSolid(nx, ny) || prev[n] !== -1) continue;
        prev[n] = c; q.push(n);
      }
    }
    if (prev[goal] === -1) return null;
    const out = []; for (let c = goal; c !== prev[c]; c = prev[c]) out.push([(c % TW) * T + 8, ((c / TW) | 0) * T + 10]);
    return out.reverse();
  },

  /* move with an 8×5 feet box against solid tiles */
  tryMove(dx, dy) {
    const P = this.player, hw = 4, top = -4, bot = 1;
    const blocked = (x, y) => World.isSolid(Math.floor((x - hw) / T), Math.floor((y + top) / T)) || World.isSolid(Math.floor((x + hw) / T), Math.floor((y + top) / T)) ||
      World.isSolid(Math.floor((x - hw) / T), Math.floor((y + bot) / T)) || World.isSolid(Math.floor((x + hw) / T), Math.floor((y + bot) / T)) || this.hitsPerson(x, y);
    if (!blocked(P.x + dx, P.y)) P.x += dx;
    if (!blocked(P.x, P.y + dy)) P.y += dy;
  },
  hitsPerson(x, y) { return false; },

  update(dt) {
    this.time += dt;
    const P = this.player;
    // fog fades as regions unlock
    for (let i = 0; i < 8; i++) { const want = i < Save.data.unlocked && i < PLAYABLE ? 0 : 1; this.fogAlpha[i] += (want - this.fogAlpha[i]) * Math.min(1, dt * 1.5); }
    if (!this.paused) {
      let mx = 0, my = 0;
      const K_ = this.keys;
      if (K_['arrowleft'] || K_['a']) mx -= 1; if (K_['arrowright'] || K_['d']) mx += 1;
      if (K_['arrowup'] || K_['w']) my -= 1; if (K_['arrowdown'] || K_['s']) my += 1;
      if (mx || my) P.path = null;
      if (P.path && P.path.length) {
        const [tx, ty] = P.path[0], dx = tx - P.x, dy = ty - P.y, d = Math.hypot(dx, dy);
        if (d < 2) { P.path.shift(); if (!P.path.length) { P.path = null; if (P.pathTarget) { this.face(P.pathTarget); this.interact(P.pathTarget); P.pathTarget = null; } } }
        else { mx = dx / d; my = dy / d; }
      }
      const speed = 74;
      if (mx || my) {
        const n = Math.hypot(mx, my); mx /= n; my /= n;
        this.tryMove(mx * speed * dt, my * speed * dt);
        P.dir = Math.abs(mx) > Math.abs(my) ? (mx > 0 ? 2 : 3) : (my > 0 ? 0 : 1);
        P.t += dt; P.frame = [1, 0, 2, 0][Math.floor(P.t * 8) % 4];
        if (Math.floor(P.t * 4) !== Math.floor((P.t - dt) * 4)) SFX.step();
        P.moving = true;
      } else { P.frame = 0; P.moving = false; }
      this.near = this.nearest();
      UI.setPrompt(this.near);
      const ri = World.regionAt(P.x, P.y);
      if (ri !== this.lastRegion) { this.lastRegion = ri; UI.enterRegion(ri); }
    }
    // camera
    const v = this.view(), gx = P.x - v.w / 2, gy = P.y - 8 - v.h / 2;
    this.cam.x += (gx - this.cam.x) * Math.min(1, dt * 6); this.cam.y += (gy - this.cam.y) * Math.min(1, dt * 6);
    this.clampCam();
    // animals wander
    for (const a of World.animals) {
      a.t += dt;
      const happy = a.spot.done;
      if (a.wait > 0) { a.wait -= dt; if (happy && Math.random() < dt * .4) this.burst(a.x, a.y - 14, 'heart', 1); continue; }
      const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
      if (d < 1) { a.wait = .8 + Math.random() * 2.5; a.tx = a.minX + Math.random() * (a.maxX - a.minX); a.ty = a.minY + Math.random() * (a.maxY - a.minY); }
      else { const s = (happy ? 16 : 9) * dt; a.x += dx / d * s; a.y += dy / d * s; a.face = dx > 0 ? 1 : -1; }
    }
    for (const n of World.npcs) {
      n.t += dt;
      const P2 = this.player, dx = P2.x - n.x, dy = P2.y - n.y;
      n.dir = Math.hypot(dx, dy) < 48 ? (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 3) : (dy > 0 ? 0 : 1)) : 0;
    }
    // ambient particles
    for (const sp of World.spots) {
      if (!sp.done) continue;
      if (sp.S.smoke && Math.random() < dt * 1.6) this.particles.push({ type: 'smoke', x: sp.left + sp.S.w / 2 + sp.S.smoke[0], y: sp.ay * T + sp.S.smoke[1], vx: 3 + Math.random() * 3, vy: -10, life: 3, t: 0 });
      if (Math.random() < dt * .5) this.burst(sp.left + Math.random() * sp.S.w, sp.top + Math.random() * sp.S.h * .7, 'twinkle', 1);
    }
    const ri = World.regionAt(this.cam.x + v.w / 2, this.cam.y + v.h / 2);
    if (ri === 0 && Math.random() < dt * 1.2) this.particles.push({ type: 'petal', x: this.cam.x + Math.random() * v.w, y: this.cam.y - 4, vx: 6 + Math.random() * 6, vy: 10 + Math.random() * 6, life: 12, t: Math.random() * 6 });
    for (const p of this.particles) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.type === 'spark') p.vy += 30 * dt; if (p.type === 'petal') p.x += Math.sin(p.t * 2) * .3; }
    this.particles = this.particles.filter(p => p.t < p.life);
    if (this.tapMark) { this.tapMark.t += dt; if (this.tapMark.t > .5) this.tapMark = null; }
  },

  face(sp) { const P = this.player; P.dir = Math.abs(sp.ax * T + 8 - P.x) > 12 && Math.abs(sp.person.y - P.y) < 12 ? (sp.person.x > P.x ? 2 : 3) : 1; },

  nearest() {
    const P = this.player;
    let best = null, bd = 30;
    for (const sp of World.spots) {
      const d1 = Math.hypot(sp.ax * T + 8 - P.x, sp.ay * T + 8 - P.y), d2 = Math.hypot(sp.person.x - P.x, sp.person.y - P.y);
      const d = Math.min(d1, d2 + 4);
      if (d < bd) { bd = d; best = sp; }
    }
    if (best) return { type: 'spot', spot: best };
    for (const g of World.gates) if (!g.open && Math.hypot(g.cx - P.x, g.cy - P.y) < 44) return { type: 'gate', gate: g };
    return null;
  },
  interact(sp) {
    const n = sp ? { type: 'spot', spot: sp } : this.near;
    if (!n) return;
    if (n.type === 'spot') UI.talk(n.spot); else UI.gateInfo(n.gate);
  },

  burst(x, y, type, n = 16) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = type === 'spark' ? 30 + Math.random() * 50 : 6;
      this.particles.push({ type, x, y, vx: Math.cos(a) * s, vy: type === 'spark' ? Math.sin(a) * s - 30 : -8 - Math.random() * 6, life: type === 'spark' ? .9 + Math.random() * .6 : 1.4, t: 0, c: ['#fff6c0', '#ffd46a', '#ffffff', '#f6a0c0'][i % 4] });
    }
  },

  /* bloom a place after its task is done */
  bloom(sp) {
    sp.done = true; sp.bloomT = 0;
    const cx = sp.left + sp.S.w / 2, cy = sp.top + sp.S.h / 2;
    this.burst(cx, cy, 'spark', 40);
    for (let i = 0; i < 10; i++) this.burst(sp.left + Math.random() * sp.S.w, sp.top + Math.random() * sp.S.h, 'twinkle', 1);
  },

  /* ---------------------------------------------------------------- drawing */
  draw() {
    const c = this.cx, s = this.scale, v = this.view();
    const camX = Math.round(this.cam.x * s) / s, camY = Math.round(this.cam.y * s) / s;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#2d3a2a'; c.fillRect(0, 0, this.cv.width, this.cv.height);
    c.setTransform(s, 0, 0, s, -camX * s, -camY * s);
    const sx = Math.max(0, Math.floor(camX)), sy = Math.max(0, Math.floor(camY));
    const sw = Math.min(World.ground.width - sx, Math.ceil(v.w) + 2), sh = Math.min(World.ground.height - sy, Math.ceil(v.h) + 2);
    c.drawImage(World.ground, sx, sy, sw, sh, sx, sy, sw, sh);
    if (this.tapMark) { const t = this.tapMark.t / .5; c.globalAlpha = 1 - t; c.strokeStyle = '#fff'; c.lineWidth = 1; c.beginPath(); c.ellipse(this.tapMark.x, this.tapMark.y, 3 + t * 5, 1.5 + t * 2.5, 0, 0, 7); c.stroke(); c.globalAlpha = 1; }
    // y-sorted sprites
    const P = this.player, list = [];
    const inView = (x, y, w, h) => x + w > camX - 8 && x < camX + v.w + 8 && y + h > camY - 8 && y < camY + v.h + 8;
    for (const o of World.objects) {
      if (o.kind === 'animal') { if (inView(o.x - 10, o.y - 16, 20, 20)) list.push(o); o.baseY = o.y; continue; }
      if (o.kind === 'npc') { o.baseY = o.y; if (inView(o.x - 10, o.y - 28, 20, 30)) list.push(o); continue; }
      const w = o.img ? o.img.width : o.spot ? o.spot.S.w : 80, h = o.img ? o.img.height : o.spot ? o.spot.S.h : 80;
      if (o.kind === 'sprite' && this.fogAlpha[World.regionAt(o.x + w / 2, o.baseY)] > .98) continue; // hidden under fog
      if (inView(o.x, o.y, w, h)) list.push(o);
    }
    list.push({ kind: 'player', baseY: P.y });
    list.sort((a, b) => a.baseY - b.baseY);
    const R = n => Math.round(n * s) / s;
    for (const o of list) {
      if (o.kind === 'sprite') c.drawImage(o.img, o.x, o.y);
      else if (o.kind === 'place' || o.kind === 'placeFront') {
        const sp = o.spot, S = sp.S;
        let img;
        if (o.kind === 'placeFront') img = sp.done ? S.front.after : S.front.before;
        else { const fr = sp.done ? S.after : S.before; img = fr[Math.floor(this.time * (S.fps || 1)) % fr.length]; }
        // bloom: a quick squash-and-stretch
        if (sp.bloomT !== undefined && sp.bloomT < .5) {
          sp.bloomT += 1 / 60;
          const k = 1 + Math.sin(sp.bloomT / .5 * Math.PI) * .06, bx = o.x + S.w / 2, by = sp.ay * T;
          c.save(); c.translate(bx, by); c.scale(k, 2 - k); c.drawImage(img, -S.w / 2, o.y - by); c.restore();
        } else c.drawImage(img, o.x, o.y);
        if (o.kind === 'place' && sp.done && S.glow) this.glow(o.x + S.w / 2 + 0, sp.ay * T + S.glow[1], 26);
        if (o.kind === 'place' && sp.done && S.glowLanterns) for (let i = 0; i < 5; i++) this.glow(o.x + 15.5 + i * 12.5, o.y + 16, 9);
      } else if (o.kind === 'animal') {
        const spr = animalSprites(o.type), fr = spr[o.face > 0 ? 'r' : 'l'][o.wait > 0 ? 0 : Math.floor(o.t * 5) % 2];
        const hop = o.spot.done && o.wait > 0 && Math.sin(o.t * 8) > .6 ? -1 : 0;
        c.drawImage(fr, R(o.x - 9), R(o.y - 14 + hop));
      } else if (o.kind === 'npc') {
        const fr = charSprites(o.look)[o.dir][0], bob = Math.sin(o.t * 2.2) > .7 ? -1 : 0;
        c.drawImage(fr, 0, 0, 20, bob ? 29 : 30, o.x - 10, o.y - 26 + bob, 20, bob ? 29 : 30);
        if (!o.spot.done) this.marker(o.x, o.y - 32);
      } else if (o.kind === 'player') {
        const fr = charSprites('player')[P.dir][P.frame];
        c.drawImage(fr, R(P.x - 10), R(P.y - 26));
      } else if (o.kind === 'gate') {
        const img = o.g.open ? o.g.imgs.open : o.g.imgs.closed, [px, py, pw, ph] = o.part;
        c.drawImage(img, px, py, pw, ph, o.x, o.y, pw, ph);
      }
    }
    // particles
    for (const p of this.particles) {
      const a = 1 - p.t / p.life;
      if (p.type === 'smoke') { c.globalAlpha = a * .5; c.fillStyle = '#e8e4ea'; const r = 2 + p.t * 1.5; c.fillRect(R(p.x - r / 2), R(p.y - r / 2), r, r); }
      else if (p.type === 'spark') { c.globalAlpha = Math.min(1, a * 2); c.fillStyle = p.c; c.fillRect(R(p.x), R(p.y), 1, 1); if (a > .5) { c.fillRect(R(p.x) - 1, R(p.y), 3, 1); c.fillRect(R(p.x), R(p.y) - 1, 1, 3); } }
      else if (p.type === 'twinkle') { c.globalAlpha = Math.sin(a * Math.PI); c.fillStyle = '#fff6d0'; c.fillRect(R(p.x) - 1, R(p.y), 3, 1); c.fillRect(R(p.x), R(p.y) - 1, 1, 3); }
      else if (p.type === 'heart') { c.globalAlpha = Math.min(1, a * 2); c.fillStyle = '#e8506a'; const x = R(p.x), y = R(p.y); c.fillRect(x - 2, y, 2, 1); c.fillRect(x + 1, y, 2, 1); c.fillRect(x - 2, y + 1, 5, 1); c.fillRect(x - 1, y + 2, 3, 1); c.fillRect(x, y + 3, 1, 1); }
      else if (p.type === 'petal') { c.globalAlpha = .9; c.fillStyle = Math.sin(p.t * 3) > 0 ? '#f6b8cc' : '#ffd8e4'; c.fillRect(R(p.x), R(p.y), 2, 1); }
    }
    c.globalAlpha = 1;
    // gates into locked lands sit on top of the cloud bank so you can always see the way on
    const lockedGates = World.objects.filter(o => o.kind === 'gate' && this.fogAlpha[o.g.to] > .5);
    // fog over locked regions
    for (let i = 0; i < 8; i++) {
      if (this.fogAlpha[i] < .01) continue;
      const { ox, oy } = regionOrigin(i);
      c.globalAlpha = this.fogAlpha[i];
      const F = World.fog[i]; c.drawImage(F, ox * T - 32, oy * T - 32, F.width * F.q, F.height * F.q);
    }
    c.globalAlpha = 1;
    for (const o of lockedGates) { const [px, py, pw, ph] = o.part; c.drawImage(o.g.imgs.closed, px, py, pw, ph, o.x, o.y, pw, ph); }
    UI.placePrompt(camX, camY, s / this.dpr);
  },
  glow(x, y, r) {
    const c = this.cx, g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,214,120,.45)'); g.addColorStop(1, 'rgba(255,214,120,0)');
    c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.globalCompositeOperation = 'source-over';
  },
  /* bobbing "!" over people who need help */
  marker(x, y) {
    const c = this.cx, b = Math.round(Math.sin(this.time * 4) * 1.5);
    c.fillStyle = INK; c.fillRect(x - 3, y - 7 + b, 7, 11);
    c.fillStyle = '#ffd46a'; c.fillRect(x - 2, y - 6 + b, 5, 9);
    c.fillStyle = INK; c.fillRect(x, y - 5 + b, 1, 4); c.fillRect(x, y + b, 1, 1);
  },
};
