/* Tiny pixel-art toolkit: every sprite in the game is drawn here in code,
   onto a grid of colors, then outlined and baked to a canvas. */

const INK = '#2a1e26';

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const _rgb = {};
function rgba(c) {
  if (_rgb[c]) return _rgb[c];
  const h = c.slice(1);
  const v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length > 6 ? parseInt(h.slice(6, 8), 16) : 255];
  return (_rgb[c] = v);
}
const hex2 = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
/* mix a color toward black (amt<0) or white (amt>0) */
function shade(c, amt) {
  const [r, g, b] = rgba(c), t = amt < 0 ? 0 : 255, k = Math.abs(amt);
  return '#' + hex2(r + (t - r) * k) + hex2(g + (t - g) * k) + hex2(b + (t - b) * k);
}
function mix(c1, c2, k) {
  const a = rgba(c1), b = rgba(c2);
  return '#' + hex2(a[0] + (b[0] - a[0]) * k) + hex2(a[1] + (b[1] - a[1]) * k) + hex2(a[2] + (b[2] - a[2]) * k);
}

class Pix {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  set(x, y, c) { x = Math.round(x); y = Math.round(y); if (this.in(x, y)) this.d[y * this.w + x] = c; }
  get(x, y) { return this.in(x, y) ? this.d[y * this.w + x] : null; }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
  ell(cx, cy, rx, ry, c, test) {
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++)
      for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && (!test || test(x, y, dx, dy))) this.set(x, y, typeof c === 'function' ? c(x, y, dx, dy) : c);
      }
  }
  circ(cx, cy, r, c, test) { this.ell(cx, cy, r, r, c, test); }
  line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  /* recolor existing pixels: fn(x,y,c) → new color */
  each(fn) { for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const c = this.d[y * this.w + x]; if (c) { const n = fn(x, y, c); if (n !== undefined) this.d[y * this.w + x] = n; } } }
  /* dark outline around the whole shape */
  outline(c = INK, diag = false) {
    const src = this.d.slice(), W = this.w, solid = (x, y) => x >= 0 && y >= 0 && x < W && y < this.h && src[y * W + x] && rgba(src[y * W + x])[3] > 200;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < W; x++) {
      if (src[y * W + x]) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1) ||
        (diag && (solid(x - 1, y - 1) || solid(x + 1, y - 1) || solid(x - 1, y + 1) || solid(x + 1, y + 1)))) this.d[y * W + x] = c;
    }
    return this;
  }
  /* paste another Pix (null pixels are transparent) */
  blit(o, ox, oy) { for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) { const c = o.d[y * o.w + x]; if (c) this.set(ox + x, oy + y, c); } }
  canvas() {
    const cv = document.createElement('canvas'); cv.width = this.w; cv.height = this.h;
    const cx = cv.getContext('2d'), im = cx.createImageData(this.w, this.h);
    for (let i = 0; i < this.d.length; i++) { const c = this.d[i]; if (!c) continue; const v = rgba(c); im.data.set(v, i * 4); }
    cx.putImageData(im, 0, 0);
    return cv;
  }
}

function flipX(cv) {
  const o = document.createElement('canvas'); o.width = cv.width; o.height = cv.height;
  const c = o.getContext('2d'); c.translate(cv.width, 0); c.scale(-1, 1); c.drawImage(cv, 0, 0);
  return o;
}

/* soft ground shadow drawn under things */
function shadowPix(w, h) {
  const p = new Pix(w, h);
  p.ell(w / 2, h / 2, w / 2, h / 2, '#1d2a1433');
  return p;
}

/* ---------------------------------------------------------------- characters */

const SKIN = ['#f5c9a0', '#eab48c', '#c98d62', '#8e5b3c', '#f3d3b8'];
const LOOKS = {
  player:   { hair: '#8a3b2a', style: 'pony', skin: 0, top: '#3d8b86', legs: '#4b3a5a', boots: '#5b3a28', skirt: true, satchel: true },
  grandma:  { hair: '#cfcad6', style: 'bun', skin: 4, top: '#8e7cc3', legs: '#5a4a6a', boots: '#4a3a3a', skirt: true, apron: true },
  bea:      { hair: '#e8c15a', style: 'long', skin: 0, top: '#e0826a', legs: '#6a5a4a', boots: '#5b3a28', skirt: true, hat: 'straw' },
  farmer:   { hair: '#6b4a2e', style: 'short', skin: 1, top: '#6b8e4e', legs: '#4a5a7a', boots: '#4a3322', hat: 'cap', hatc: '#b8463a', beard: '#6b4a2e' },
  pip:      { hair: '#2e2a33', style: 'short', skin: 3, top: '#c8483c', legs: '#3c4e70', boots: '#3a2a22' },
  elder:    { hair: '#e8e4ea', style: 'bald', skin: 4, top: '#5c7a3e', legs: '#4a4a3a', boots: '#3a2a22', hat: 'hood', hatc: '#5c7a3e', beard: '#e8e4ea' },
  juniper:  { hair: '#b5462e', style: 'long', skin: 4, top: '#e6c35c', legs: '#5a4a3a', boots: '#5b3a28', skirt: true },
  rowan:    { hair: '#6b4a2e', style: 'short', skin: 2, top: '#5a86b8', legs: '#5a4a3a', boots: '#4a3322', hat: 'straw' },
  nell:     { hair: '#2e2a33', style: 'long', skin: 1, top: '#f0e8d8', legs: '#4a7aa8', boots: '#4a3322', skirt: true },
  baker:    { hair: '#7a5a3a', style: 'short', skin: 0, top: '#f2ede2', legs: '#5a5a6a', boots: '#3a2a22', apron: true, hat: 'beanie', hatc: '#f2ede2' },
  elder2:   { hair: '#b8b4bc', style: 'bald', skin: 2, top: '#7a5a8a', legs: '#4a4a5a', boots: '#3a2a22', beard: '#b8b4bc' },
  clover:   { hair: '#4a2e22', style: 'long', skin: 0, top: '#4f9a52', legs: '#5a4a3a', boots: '#5b3a28', skirt: true },
  ash:      { hair: '#e8d08a', style: 'short', skin: 4, top: '#b8563a', legs: '#4a5a7a', boots: '#4a3322' },
  greta:    { hair: '#7a4a2e', style: 'bun', skin: 1, top: '#7aa0c8', legs: '#5a4a3a', boots: '#4a3322', skirt: true, apron: true },
  chet:     { hair: '#2e2a33', style: 'short', skin: 3, top: '#e6b93c', legs: '#3c4e70', boots: '#3a2a22', hat: 'cap', hatc: '#3f6fa8' },
  whit:     { hair: '#f0eef2', style: 'bald', skin: 0, top: '#556070', legs: '#3a3a4a', boots: '#3a2a22', beard: '#f0eef2' },
  fran:     { hair: '#9a4a2a', style: 'bun', skin: 0, top: '#c09050', legs: '#5a4a3a', boots: '#4a3322', skirt: true, apron: true },
  brody:    { hair: '#d0703a', style: 'short', skin: 4, top: '#4a6a9a', legs: '#4a4a3a', boots: '#4a3322' },
  sunny:    { hair: '#f0d070', style: 'long', skin: 1, top: '#f0c040', legs: '#6a5a4a', boots: '#5b3a28', skirt: true, hat: 'straw' },
  flint:    { hair: '#3a2e2a', style: 'short', skin: 2, top: '#806040', legs: '#4a4a3a', boots: '#3a2a22', hat: 'beanie', hatc: '#7a8088', beard: '#3a2e2a' },
  stella:   { hair: '#c4cce0', style: 'long', skin: 3, top: '#5070b0', legs: '#4a4a6a', boots: '#3a2a22', skirt: true },
  witch:    { hair: '#2e2a33', style: 'long', skin: 0, top: '#6a4a8a', legs: '#3a2e4a', boots: '#2e2226', skirt: true, hat: 'witch', hatc: '#5a3a7a' },
  rufus:    { hair: '#d0703a', style: 'short', skin: 0, top: '#8a4a3a', legs: '#4a4a3a', boots: '#3a2a22', beard: '#c0602a' },
  poppy:    { hair: '#b5462e', style: 'long', skin: 1, top: '#e0a040', legs: '#5a4a3a', boots: '#5b3a28', skirt: true },
  bramble:  { hair: '#6b4a2e', style: 'short', skin: 2, top: '#7a6a40', legs: '#4a4a3a', boots: '#3a2a22', hat: 'straw', apron: true },
  sage:     { hair: '#a8a4ac', style: 'bald', skin: 3, top: '#7a8a5a', legs: '#4a4a3a', boots: '#3a2a22', hat: 'hood', hatc: '#8a7a5a' },
  isla:     { hair: '#3a2a22', style: 'long', skin: 2, top: '#e8e8f0', legs: '#2e3e6a', boots: '#2a2226', hat: 'captain', hatc: '#2e3e6a' },
  marlo:    { hair: '#2e2a33', style: 'short', skin: 3, top: '#3a6a8a', legs: '#4a4a3a', boots: '#3a2a22', hat: 'beanie', hatc: '#3a9a8a', beard: '#2e2a33' },
  dory:     { hair: '#e8c15a', style: 'bun', skin: 4, top: '#d06a5a', legs: '#4a4a6a', boots: '#3a2a22', skirt: true, apron: true },
  coral:    { hair: '#8a4a3a', style: 'long', skin: 1, top: '#ec7fa6', legs: '#5a4a5a', boots: '#5b3a28', skirt: true },
  captain:  { hair: '#e8e4ea', style: 'short', skin: 0, top: '#2e3e6a', legs: '#2a2e40', boots: '#2a2226', hat: 'captain', hatc: '#2e3e6a', beard: '#e8e4ea' },
  birch:    { hair: '#6b4a2e', style: 'short', skin: 4, top: '#b04a3a', legs: '#3c4e70', boots: '#3a2a22', hat: 'beanie', hatc: '#c8483c' },
  tori:     { hair: '#e8c15a', style: 'long', skin: 0, top: '#5a8ad0', legs: '#4a4a6a', boots: '#3a2a22', skirt: true, hat: 'beanie', hatc: '#5a8ad0' },
  grandma2: { hair: '#f0eef2', style: 'bun', skin: 2, top: '#a04a5a', legs: '#4a3a4a', boots: '#3a2a22', skirt: true },
  juno:     { hair: '#2e2a33', style: 'long', skin: 3, top: '#3aa0a0', legs: '#4a4a6a', boots: '#3a2a22', skirt: true, hat: 'beanie', hatc: '#f0eef2' },
  norris:   { hair: '#c0602a', style: 'bald', skin: 0, top: '#6a5a4a', legs: '#4a4a3a', boots: '#3a2a22', hat: 'hood', hatc: '#7a5a3a', beard: '#c0602a' },
  lumi:     { hair: '#f4e8c0', style: 'long', skin: 1, top: '#e0b040', legs: '#5a4a6a', boots: '#3a2a22', skirt: true },
  orla:     { hair: '#3a2a22', style: 'bun', skin: 3, top: '#6a5aa0', legs: '#4a3a5a', boots: '#3a2a22', skirt: true },
  silas:    { hair: '#c4c4d0', style: 'short', skin: 2, top: '#3a5a7a', legs: '#3a3a4a', boots: '#2a2226' },
  pim:      { hair: '#7a5a3a', style: 'short', skin: 4, top: '#e08a6a', legs: '#4a4a5a', boots: '#3a2a22', apron: true, hat: 'beanie', hatc: '#f2ede2' },
  mayor:    { hair: '#a8a4ac', style: 'short', skin: 1, top: '#6a3a4a', legs: '#2a2e40', boots: '#2a2226', hat: 'tophat', hatc: '#2e2a33', beard: '#a8a4ac' },
};

/* dir: 0 down, 1 up, 2 right (left = flipped right). frame: 0 stand, 1/2 step */
function drawChar(L, dir, frame) {
  const p = new Pix(20, 30), OX = 2, OY = 4;
  const P = (x, y, c) => p.set(x + OX, y + OY, c), R = (x, y, w, h, c) => p.rect(x + OX, y + OY, w, h, c);
  const skin = SKIN[L.skin], skinD = shade(skin, -.14), hair = L.hair, hairD = shade(hair, -.25), hairL = shade(hair, .2);
  const top = L.top, topD = shade(top, -.22), legs = L.legs, boots = L.boots;
  const side = dir === 2, back = dir === 1;

  // legs + boots
  const legRows = (x, len, c) => { R(x, 18, 2, len - 2, c); R(x, 18 + len - 2, 2, 2, boots); };
  if (!side) {
    const l = frame === 1 ? 5 : 4, r = frame === 2 ? 5 : 4;
    legRows(5, frame === 2 ? 4 : 5, legs); legRows(9, frame === 1 ? 4 : 5, legs);
    void l; void r;
  } else {
    if (frame === 0) { legRows(6, 5, shade(legs, -.2)); legRows(8, 5, legs); }
    else { legRows(frame === 1 ? 5 : 9, 5, shade(legs, -.2)); legRows(frame === 1 ? 9 : 5, 4, legs); }
  }
  // torso
  if (!side) {
    R(4, 12, 8, 6, top); R(11, 13, 1, 5, topD);
    if (L.skirt) { R(3, 16, 10, 3, top); R(3, 18, 10, 1, topD); }
    if (L.apron && !back) { R(5, 14, 6, 5, '#f4efe4'); R(5, 18, 6, 1, '#d8d0c0'); }
    // arms
    const swing = frame === 0 ? 0 : 1;
    R(3, 13, 1, 4 - (frame === 1 ? swing : 0), topD); R(12, 13, 1, 4 - (frame === 2 ? swing : 0), topD);
    P(3, frame === 1 ? 16 : 17, skin); P(12, frame === 2 ? 16 : 17, skin);
    if (L.satchel) {
      const strap = '#8a5a34';
      if (!back) { for (let i = 0; i < 5; i++) P(4 + i, 12 + i, strap); R(9, 16, 3, 3, '#a8703e'); P(10, 17, '#d8a050'); }
      else { for (let i = 0; i < 5; i++) P(11 - i, 12 + i, strap); }
    }
  } else {
    R(5, 12, 6, 6, top); R(5, 13, 1, 5, topD);
    if (L.skirt) { R(4, 16, 8, 3, top); R(4, 18, 8, 1, topD); }
    if (L.apron) R(9, 14, 2, 5, '#f4efe4');
    if (L.satchel) R(3, 15, 3, 3, '#a8703e');
    const ax = frame === 1 ? 8 : frame === 2 ? 6 : 7;
    R(ax, 13, 2, 3, topD); R(ax, 16, 2, 1, skin);
  }
  // head
  p.ell(7.5 + OX, 7 + OY, 6, 5.3, skin);
  const inHead = (x, y) => { const dx = (x + .5 - 7.5) / 6, dy = (y + .5 - 7) / 5.3; return dx * dx + dy * dy <= 1; };
  const H = (x, y) => { if (inHead(x, y)) P(x, y, (y <= 3 && x >= 4 && x <= 8) ? hairL : hair); };
  if (L.style !== 'bald') {
    for (let y = 0; y < 13; y++) for (let x = 0; x < 16; x++) {
      if (!inHead(x, y)) continue;
      let isHair = y <= 5;
      if (back) isHair = true;
      else if (side) isHair = isHair || x <= 8 || (y === 6 && x <= 11);
      else {
        if (y === 6 && (x <= 4 || x >= 11 || x === 7)) isHair = true;
        const sideLen = L.style === 'long' || L.style === 'pony' ? 11 : 8;
        if ((x <= 3 || x >= 12) && y <= sideLen) isHair = true;
      }
      if (isHair) H(x, y);
    }
    if (L.style === 'long') {
      if (!side) { R(1, 7, 2, back ? 9 : 7, hair); R(13, 7, 2, back ? 9 : 7, hair); if (back) R(3, 11, 10, 5, hair); }
      else R(2, 6, 4, 9, hair);
    }
    if (L.style === 'pony') {
      if (back) { R(6, 10, 3, 6, hair); P(7, 15, hairD); }
      if (side) { R(0, 5, 3, 3, hair); R(0, 8, 2, 3, hair); P(0, 10, hairD); }
      if (!back && !side) { P(2, 11, hair); P(13, 11, hair); }
      P(side ? 3 : 7, side ? 5 : 1, '#e8584a'); // ribbon
    }
    if (L.style === 'bun') { p.circ(7.5 + OX, 1 + OY, 2.4, hair); P(7, 0, hairL); }
  } else {
    // bald: a fringe of hair round the sides
    for (let y = 5; y <= 9; y++) { if (!side) { P(2, y, hair); P(13, y, hair); } else P(3, y, hair); }
  }
  // face
  if (!back) {
    if (!side) {
      R(5, 8, 1, 2, INK); R(10, 8, 1, 2, INK);
      P(4, 10, '#eea0a0'); P(11, 10, '#eea0a0');
    } else {
      R(11, 8, 1, 2, INK); P(12, 10, '#eea0a0'); P(14, 8, skin);
    }
    if (L.beard) {
      const b = L.beard;
      if (!side) { R(3, 10, 10, 2, b); R(4, 12, 8, 1, b); R(5, 13, 6, 1, b); P(7, 10, skinD); P(8, 10, skinD); }
      else { R(9, 10, 5, 2, b); R(9, 12, 4, 2, b); }
    }
  }
  // hats
  const hc = L.hatc || '#c8483c', hcD = shade(hc, -.25), hcL = shade(hc, .2);
  if (L.hat === 'straw') {
    const s = '#e8c35a', sD = '#b8903a';
    R(0, 4, 16, 2, s); R(0, 5, 16, 1, sD); R(3, 1, 10, 3, s); R(3, 3, 10, 1, '#c8483c'); R(5, 1, 3, 1, '#f4dc8a');
  } else if (L.hat === 'witch') {
    R(-1, 4, 18, 2, hc); R(-1, 5, 18, 1, hcD);
    R(4, 2, 8, 2, hc); R(4, 3, 8, 1, '#e0a040'); R(5, 0, 6, 2, hc); R(6, -2, 4, 2, hc); R(7, -3, 3, 1, hc); P(10, -4, hc); P(11, -4, hcD);
    P(6, 1, hcL); P(7, -1, hcL);
  } else if (L.hat === 'beanie') {
    p.ell(7.5 + OX, 4.5 + OY, 5.8, 4.2, hc, (x, y) => y - OY <= 5);
    R(2, 4, 12, 2, hcL); R(2, 5, 12, 1, hc); P(7, -1, '#f4efe4'); P(8, -1, '#f4efe4'); P(7, 0, '#e0dcd4'); P(8, 0, '#f4efe4');
  } else if (L.hat === 'cap') {
    p.ell(7.5 + OX, 4.5 + OY, 5.8, 4, hc, (x, y) => y - OY <= 5);
    if (!side) { R(3, 5, 10, 1, hcD); if (!back) R(4, 6, 8, 1, hcD); } else R(9, 5, 6, 1, hcD);
    P(5, 2, hcL);
  } else if (L.hat === 'hood') {
    for (let y = 0; y < 14; y++) for (let x = -1; x < 17; x++) {
      const dx = (x + .5 - 7.5) / 7, dy = (y + .5 - 7) / 6.4;
      if (dx * dx + dy * dy > 1) continue;
      const face = !back && (side ? x >= 9 && y >= 5 && y <= 11 : x >= 4 && x <= 11 && y >= 6 && y <= 11);
      if (!face) P(x, y, y <= 2 ? hcL : hc);
    }
    if (!back && !side) R(3, 12, 10, 1, hcD);
  } else if (L.hat === 'captain') {
    p.ell(7.5 + OX, 4 + OY, 6, 3.6, hc, (x, y) => y - OY <= 5); R(2, 4, 12, 1, '#f4efe4');
    if (!back) { R(3, 5, 10, 1, INK); P(7, 2, '#f2c12e'); P(8, 2, '#f2c12e'); }
  } else if (L.hat === 'tophat') {
    R(1, 4, 14, 2, hc); R(4, -2, 8, 6, hc); R(4, 2, 8, 1, '#a8323a'); R(5, -2, 2, 4, shade(hc, .15));
  }
  p.outline(INK);
  // ground shadow under feet
  const s = shadowPix(12, 4); for (let y = 0; y < 4; y++) for (let x = 0; x < 12; x++) { const c = s.d[y * 12 + x]; if (c && !p.get(x + 4, y + 24)) p.set(x + 4, y + 24, c); }
  return p;
}

const CharCache = {};
/* frames[dir][frame] canvases; dir 3 = left */
function charSprites(look) {
  if (CharCache[look]) return CharCache[look];
  const L = LOOKS[look] || LOOKS.pip, out = [];
  for (let d = 0; d < 3; d++) out[d] = [0, 1, 2].map(f => drawChar(L, d, f).canvas());
  out[3] = out[2].map(flipX);
  return (CharCache[look] = out);
}
/* big portrait canvas for dialogs */
function portrait(look, size = 96) {
  const src = charSprites(look)[0][0], cv = document.createElement('canvas');
  cv.width = size; cv.height = size;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const k = size / 18;
  c.drawImage(src, 1, 0, 18, 22, 0, size * .06, 18 * k, 22 * k);
  return cv;
}

/* ---------------------------------------------------------------- animals (face right) */
function drawAnimal(kind, frame) {
  const p = new Pix(18, 16), step = frame === 1;
  if (kind === 'chickens') {
    const b = '#f6f2ea', bD = '#d6cfc2';
    p.ell(8, 9, 5, 3.6, b); p.ell(7, 10.5, 4, 1.8, bD, (x, y) => y > 9);
    p.rect(3, 5, 2, 4, b); p.set(3, 4, b); // tail
    const hy = step ? 5 : 4;
    p.circ(12, hy + 1, 2.2, b); p.set(12, hy - 1, '#d8463c'); p.set(13, hy - 1, '#d8463c'); p.set(12, hy - 2, '#d8463c');
    p.set(14, hy + 1, '#f2b233'); p.set(15, hy + 1, '#f2b233'); p.set(13, hy, INK); p.set(13, hy + 2, '#d8463c');
    p.set(7, 13, '#e89a3a'); p.set(10, 13, '#e89a3a'); p.set(step ? 6 : 7, 14, '#e89a3a'); p.set(step ? 11 : 10, 14, '#e89a3a');
    p.set(6, 8, bD); p.set(7, 8, bD); p.set(8, 8, bD);
  } else if (kind === 'ducks') {
    const b = '#f4f0e0', bD = '#d6ceb4';
    p.ell(8, 10, 5.5, 3.2, b); p.ell(8, 11.5, 4.5, 1.6, bD, (x, y) => y > 10); p.rect(2, 8, 2, 2, b);
    const hy = step ? 5 : 4; p.circ(12, hy + 1, 2.3, '#3f8f5a'); p.set(12, hy, '#5aaa70');
    p.rect(14, hy + 1, 3, 1, '#f2a23a'); p.set(14, hy + 2, '#d8822a'); p.set(13, hy, INK);
    p.rect(11, hy + 3, 3, 1, '#f4f0e0');
    p.set(7, 13, '#f2a23a'); p.set(step ? 9 : 10, 13, '#f2a23a');
  } else if (kind === 'sheep') {
    const w = '#f4f0ea', wD = '#d8d2c8';
    [[5, 8, 3], [8, 7, 3.4], [11, 8, 3], [7, 10, 3], [10, 10, 3]].forEach(([x, y, r]) => p.circ(x, y, r, wD));
    [[5, 7.5, 2.6], [8, 6.5, 3], [11, 7.5, 2.6], [7, 9.4, 2.5], [10, 9.4, 2.5]].forEach(([x, y, r]) => p.circ(x, y, r, w));
    p.rect(step ? 5 : 6, 12, 1, 3, '#3a3238'); p.rect(step ? 11 : 10, 12, 1, 3, '#3a3238');
    const hy = step ? 6 : 5; p.ell(14, hy + 2, 2.2, 2.6, '#4a4048'); p.set(15, hy + 1, '#f4f0ea'); p.set(12, hy, '#4a4048');
    p.set(13, hy + 1, INK);
  } else if (kind === 'goats') {
    const w = '#ece6dc', wD = '#c8bfb2';
    p.ell(8, 9, 5.5, 3.4, w); p.ell(8, 10.5, 4.5, 1.6, wD, (x, y) => y > 9);
    p.rect(step ? 4 : 5, 11, 1, 4, wD); p.rect(step ? 11 : 10, 11, 1, 4, wD); p.rect(6, 11, 1, 4, w); p.rect(12, 11, 1, 3, w);
    const hy = step ? 5 : 4; p.ell(14, hy + 2, 2.2, 2.4, w); p.set(15, hy + 5, wD); p.set(14, hy + 5, wD);
    p.set(13, hy - 1, '#8a7a6a'); p.set(12, hy - 2, '#8a7a6a'); p.set(15, hy + 1, INK); p.set(2, 7, w); p.set(3, 7, w);
  } else if (kind === 'pigs') {
    const k = '#f2a8b0', kD = '#d88890';
    p.ell(8, 9, 6, 3.8, k); p.ell(8, 11, 5, 1.8, kD, (x, y) => y > 10);
    p.rect(step ? 4 : 5, 12, 2, 2, kD); p.rect(step ? 11 : 10, 12, 2, 2, kD);
    p.ell(14.5, 8.5, 2, 1.8, '#f7bcc2'); p.set(15, 8, kD); p.set(15, 9, kD); p.set(13, 7, INK);
    p.set(12, 5, kD); p.set(11, 5, k); p.set(2, 7, kD); p.set(1, 6, kD);
  }
  p.outline(INK);
  const s = shadowPix(12, 3); p.blit(s, 3, 14);
  return p;
}
const AnimalCache = {};
function animalSprites(kind) {
  if (AnimalCache[kind]) return AnimalCache[kind];
  const r = [0, 1].map(f => drawAnimal(kind, f).canvas());
  return (AnimalCache[kind] = { r, l: r.map(flipX) });
}

/* ---------------------------------------------------------------- gift icons (16x16) */
const ICON_ART = {
  bread:   ['      aaaa      ', '    aabbbbaa    ', '   abbcbbcbba   ', '  abbccbbccbba  ', '  abbbbbbbbbba  ', '  addbbbbbbdda  ', '   adddddddda   ', '    aaaaaaaa    '],
  egg:     ['     aaaa     ', '    abbbba    ', '   abcbbbba   ', '   abbbbbba   ', '  abbbbbbbba  ', '  abbbbbbdba  ', '  abbbbbddba  ', '   abbddddba  ', '    addddda   ', '     aaaaa    '],
  flower:  ['     aa     ', '    abba    ', '  aabccbaa  ', ' abbcddcbba ', ' abbcddcbba ', '  aabccbaa  ', '    abba    ', '     ae     ', '   aeae     ', '    aeea    ', '     ae     ', '     ae     '],
  ribbon:  [' aa      aa ', 'abba    abba', 'abbba  abbba', ' abbbaabbba ', '  abbccbba  ', '  abbccbba  ', ' abbbaabbba ', ' abba  abba ', '  aa    aa  '],
  jar:     ['   aaaaaa   ', '   addddda  ', '  aaaaaaaa  ', '  abbbbbba  ', ' abcbbbbbba ', ' abcbbbbbba ', ' abbbbbbbba ', ' abbbbbbbba ', ' abbbbbbbea ', '  abbbbbea  ', '   aaaaaa   '],
  cup:     ['  aaaaaaa   ', ' abbbbbbba  ', ' acccccccaaa', ' abbbbbbba a', ' abbbbbbba a', ' abbbbbbbaa ', '  abbbbba   ', '   aaaaa    '],
  leaf:    ['        aa  ', '      aabba ', '    aabbcba ', '   abbbcbba ', '  abbbcbbba ', '  abbcbbba  ', ' abbcbbba   ', ' abcbbaa    ', ' acaaa      ', 'ac          '],
  feather: ['         aa ', '       aabba', '      abbbba', '     abbcba ', '    abbcba  ', '   abbcba   ', '  abbcba    ', '  abcba     ', ' acaa       ', 'ac          '],
  pie:     ['   aaaaaaaa   ', '  abbcbbcbba  ', ' abbbbbbbbbba ', 'addddddddddda ', 'aeeeeeeeeeeea ', ' aeeeeeeeeea  ', '  aaaaaaaaa   '],
  coin:    ['   aaaaa   ', '  abbbbba  ', ' abccbbbba ', ' abcbbbbda ', ' abbbbbbda ', ' abbbbbdda ', '  abdddda  ', '   aaaaa   '],
  scarf:   [' aaaaaaaaa  ', 'abbbbbbbbba ', 'accccccccca ', ' aaaabbbaa  ', '    abbba   ', '    accca   ', '    abbba   ', '    accca   ', '    a a a   '],
  apple:   ['     aa     ', '    ae  aa  ', '   aaeaaeea ', '  abbbbbba  ', ' abcbbbbbba ', ' abcbbbbbba ', ' abbbbbbbba ', ' abbbbbbdba ', '  abbbbdba  ', '   aaaaaa   '],
  key:     ['  aaa       ', ' abbba      ', 'ab a ba     ', 'ab a baaaaaa', 'ab a bbbbbba', ' abbbaaaba a', '  aaa  aa a '],
  sack:    ['   a  a    ', '   abba    ', '    aa     ', '  abbbba   ', ' abbbbbba  ', 'abbbccbbba ', 'abbccccbba ', 'abbbccbbba ', 'abbbbbbbda ', ' adddddda  ', '  aaaaaa   '],
  wool:    ['   aaaaa   ', '  abbcbba  ', ' abcbbcbba ', 'abbbcbbcba ', 'abcbbcbbba ', 'abbcbbcbba ', ' abbcbbba  ', '  aaaaaa   '],
  pumpkin: ['     ae     ', '    aea     ', '  aaaaaaaa  ', ' abbcbbcbba ', 'abbbcbbcbbba', 'abbbcbbcbbba', 'abbbcbbcbbba', ' abbcbbcbba ', '  aaaaaaaa  '],
  candle:  ['    a     ', '   aba    ', '   aca    ', '    a     ', '  aaaaa   ', '  addda   ', '  addda   ', '  addda   ', '  addda   ', ' aaaaaaa  ', ' aeeeeea  ', '  aaaaa   '],
  shell:   ['    aaaa    ', '  aabcbbaa  ', ' abcbbcbbba ', 'abcbbcbbcbba', 'abbcbbcbbcba', ' abbcbbcbba ', '   adddda   ', '    aaaa    '],
  fish:    ['    aaaaa     ', '  aabbbbbaa aa', ' abcbbbbbbbaba', 'abbbbbbbbbbba ', ' addddddddaaba', '  aadddddaa aa', '    aaaaa     '],
  cookie:  ['     a     ', '    aba    ', '  aabbbaa  ', 'abbbbcbbbba', ' abbbbbbba ', '  abbbbba  ', ' abbaaabba ', ' aba   aba ', '  a     a  '],
  star:    ['     a     ', '    aba    ', '    aba    ', 'aaaabcbaaaa', ' abbbcbbba ', '  abbbbba  ', '  abbabba  ', ' abba abba ', ' aa     aa '],
  mitten:  ['  aaaa    ', ' abbbba   ', ' abbbba aa', ' abbbbaaba', ' abbbbbbba', ' abbbbbbba', ' abbbbbba ', ' acccccca ', ' acccccca ', '  aaaaaa  '],
  lantern: ['    aa    ', '   a  a   ', '  aaaaaa  ', ' abbbbbba ', 'abcbbbbbba', 'abcbbbbbba', 'abbbbbbbba', ' abbbbbba ', '  aaaaaa  ', '    aa    '],
  book:    [' aaaaaaaaa  ', ' abbbbbbba  ', ' abccccbba  ', ' abbbbbbba  ', ' abcccbbba  ', ' abbbbbbba  ', ' abbbbbbbaa ', ' addddddddaa', '  aaaaaaaaa '],
};
const ICON_COLORS = {
  bread: ['#c98a45', '#f0cd8a', '#d6975a'], egg: ['#e8c7a0', '#fff6ea', '#c9a47e'], ribbon: ['#4a86c8', '#2e5a92'],
  jar: ['#e7a526', '#fff2c0', '#8a6a4a', '#fff'], cup: ['#f2ede2', '#6fb3d6'], leaf: ['#5fae4a', '#3e8a3a'], feather: ['#f4f0ea', '#c8bfb2'],
  pie: ['#e0a860', '#f0c88a', '#a8323a', '#c98a45'], coin: ['#f2c12e', '#fff0a0', '#c8901e'], scarf: ['#4f9a52', '#3a7a3e'],
  apple: ['#d23a2e', '#ff8a7a', '#9a2a22', '#5a8a3a'], key: ['#d8a83a'], sack: ['#d8c08a', '#f0e6c8', '#a89060'], wool: ['#f4f0ea', '#d0c8bc'],
  pumpkin: ['#e8812a', '#c8601a', '#5a8a3a', '#5a8a3a'], candle: ['#f2c12e', '#fff0a0', '#f4ecd8', '#c8a060'], shell: ['#7ccfc0', '#b8f0e4', '#4aa090'],
  fish: ['#a8c0d0', '#e8f0f8', '#7890a8'], cookie: ['#d8a05a', '#f0d09a'], star: ['#f5c542', '#fff0a0'], mitten: ['#d8463c', '#f4efe4'],
  lantern: ['#f2923a', '#ffd08a'], book: ['#6a4a9a', '#f0e6c8', '#4a3a6a'], flower: ['#d8463c', '#f2c12e', '#fff0a0', '#5a9a3a'],
};
function iconCanvas(type, color) {
  const art = ICON_ART[type] || ICON_ART.star;
  const base = (ICON_COLORS[type] || ICON_COLORS.star).slice();
  if (color) {
    if (type === 'flower' || type === 'jar') base[0] = color;
    else if (type === 'cup') base[1] = color;
    else { base[0] = color; base[1] = shade(color, .35); if (base[2]) base[2] = shade(color, -.3); }
  }
  const [b, c, d, e] = base;
  const map = { a: INK, b, c: c || shade(b, .3), d: d || shade(b, -.3), e: e || shade(b, -.4) };
  if (type === 'flower') Object.assign(map, { c: shade(b, .35), d: '#f2c12e', e: '#5a9a3a' });
  if (type === 'jar') map.d = shade(b, -.2);
  if (type === 'scarf') map.c = shade(b, -.25);
  if (type === 'mitten') map.c = base[1];
  if (type === 'book') { map.c = base[1]; map.d = base[2]; }
  const h = art.length, w = Math.max(...art.map(r => r.length));
  const p = new Pix(16, 16), ox = Math.floor((16 - w) / 2), oy = Math.floor((16 - h) / 2);
  art.forEach((row, y) => [...row].forEach((ch, x) => { if (map[ch]) p.set(ox + x, oy + y, map[ch]); }));
  return p.canvas();
}
