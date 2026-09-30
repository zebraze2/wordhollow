/* All DOM UI: title, HUD, prompts, dialogs, the spelling challenge, lesson cards, map, word book. */

const $ = (s, el = document) => el.querySelector(s);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const ICONS = {
  speaker: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5c1.2 1 1.8 2.2 1.8 3.5s-.6 2.5-1.8 3.5M18.5 6c2 1.6 3 3.6 3 6s-1 4.4-3 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  erase: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 5h11v14H9l-6-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9l5 6M17 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  map: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  book: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 5c3-1 5-1 8 1 3-2 5-2 8-1v14c-3-1-5-1-8 1-3-2-5-2-8-1z M12 6v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  bag: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 8h14l-1 12H6z M9 8V6a3 3 0 016 0v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  sound: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9c1 .8 1.5 1.8 1.5 3s-.5 2.2-1.5 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  mute: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  heart: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 14L2 8a3.2 3.2 0 016-4 3.2 3.2 0 016 4z" fill="#e8506a"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 018 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const touch = matchMedia('(pointer: coarse)').matches;

const UI = {
  modal: null, // current blocking panel
  init() {
    this.root = $('#ui');
    this.hud = $('#hud'); this.prompt = $('#prompt');
    $('#btn-map').innerHTML = ICONS.map + '<span>Map</span>';
    $('#btn-book').innerHTML = ICONS.book + '<span>Words</span>';
    $('#btn-bag').innerHTML = ICONS.bag + '<span>Satchel</span><b id="bag-n"></b>';
    $('#btn-map').onclick = () => this.openMap();
    $('#btn-book').onclick = () => this.openBook();
    $('#btn-bag').onclick = () => this.openBag();
    $('#btn-sound').onclick = () => { Save.data.muted = !Save.data.muted; Save.write(); this.syncSound(); };
    $('#region-chip').onclick = () => this.lesson(World.regionAt(Game.player.x, Game.player.y), true);
    this.prompt.onclick = () => Game.interact();
    this.syncSound();
    this.updateHud();
  },
  syncSound() {
    const m = Save.data.muted; Voice.setMuted(m); sfxOn = !m;
    $('#btn-sound').innerHTML = m ? ICONS.mute : ICONS.sound;
    $('#btn-sound').title = m ? 'Sound off' : 'Sound on';
  },
  onKey(e, down) {
    if (!this.modal) return false;
    if (down && this.modal.onKey) this.modal.onKey(e);
    return true;
  },

  /* ---- panels ---- */
  open(panel, opts = {}) {
    this.close(true);
    Game.paused = true; Game.keys = {};
    const wrap = h('div', 'scrim' + (opts.dock ? ' dock' : '') + (opts.clear ? ' clear' : ''));
    wrap.appendChild(panel);
    this.root.appendChild(wrap);
    this.modal = { el: wrap, onKey: opts.onKey, onClose: opts.onClose };
    requestAnimationFrame(() => wrap.classList.add('in'));
    this.prompt.hidden = true;
    return wrap;
  },
  close(silent) {
    if (!this.modal) return;
    const m = this.modal; this.modal = null;
    m.el.classList.remove('in'); setTimeout(() => m.el.remove(), 180);
    Voice.stop();
    if (!silent) { Game.paused = false; if (m.onClose) m.onClose(); }
  },

  /* ---- title ---- */
  title() {
    const D = Save.data, p = h('div', 'card title-card');
    p.innerHTML = `
      <div class="kicker">A spelling adventure</div>
      <h1>Wordhollow</h1>
      <p class="lede">In this village, well-spelled words bring things back to life. Help the neighbors, and new lands open up.</p>
      <div class="row"><button class="btn primary big" id="go">${D.started ? 'Continue' : 'Begin'}</button></div>
      <div class="how">${touch ? 'Tap to walk. Tap a neighbor to help them.' : 'Arrow keys or WASD to walk · Space to talk · M for the map'}</div>
      <button class="link" id="grownups">How it teaches spelling</button>`;
    this.open(p, { clear: true, onKey: e => { if (e.key === 'Enter' || e.key === ' ') go(); } });
    const go = () => {
      ensureAudio();
      const first = !D.started;
      D.started = true; Save.write();
      this.close();
      this.hud.hidden = false;
      Game.lastRegion = -1;
      if (first) setTimeout(() => Voice.say('ui_welcome'), 300);
    };
    $('#go', p).onclick = go;
    $('#grownups', p).onclick = () => this.method(() => this.title());
  },
  method(back) {
    const p = h('div', 'card method');
    p.innerHTML = `
      <h2>How Wordhollow teaches spelling</h2>
      <p>The practice follows what research on spelling instruction supports for grades 1–2:</p>
      <ul>
        <li><b>One pattern at a time, taught directly.</b> Each land opens with a short lesson on a single spelling pattern, in a standard phonics order: short vowels, digraphs, blends, silent e, vowel teams, bossy r, then word endings.</li>
        <li><b>Spell from memory, not from choices.</b> Kids hear the word, hear it in a sentence, then build it. They never pick between misspellings, because seeing wrong spellings can make them stick.</li>
        <li><b>Sound boxes.</b> Early on, each box stands for one sound, so <i>sh</i> gets a single wide box. This links sounds to letters. The support fades land by land: first letter tiles, then a full keyboard, then letter blanks, then nothing.</li>
        <li><b>Quick feedback and a second try.</b> After a mistake, the wrong sounds are marked and the child fixes them. After a second mistake, they study the word, it gets covered, and they spell it again from memory.</li>
        <li><b>Heart words.</b> Irregular words like <i>the</i> and <i>said</i> are taught by marking the tricky part with a heart.</li>
        <li><b>Spaced, mixed review.</b> Missed words come back at the next task. Learned words come back after 1, 3, 7 and 21 days, mixed in with the new pattern.</li>
      </ul>
      <div class="row"><button class="btn" id="reset">Reset progress</button><button class="btn primary" id="ok">Back</button></div>`;
    this.open(p, { onKey: e => { if (e.key === 'Escape' || e.key === 'Enter') ok(); } });
    const ok = () => { this.close(true); back ? back() : (Game.paused = false); };
    $('#ok', p).onclick = ok;
    $('#reset', p).onclick = () => { if (confirm('Erase all progress and start over?')) { Save.reset(); location.reload(); } };
  },

  /* ---- HUD ---- */
  updateHud() {
    const ri = Math.max(0, World.regionAt(Game.player.x, Game.player.y)), R = REGIONS[ri];
    const spots = World.spots.filter(s => s.region === ri);
    $('#region-chip').innerHTML = `<span class="rname">${R.name}</span><span class="pips">${spots.map(s => `<i class="${s.done ? 'on' : ''}"></i>`).join('')}</span><span class="pat">${R.pattern}</span>`;
    const n = Save.data.gifts.length; $('#bag-n').textContent = n ? n : '';
  },
  enterRegion(ri) {
    this.updateHud();
    if (!Save.data.seenIntro[REGIONS[ri].id] && Save.data.started) this.lesson(ri);
  },

  /* ---- prompt bubble over the nearest person ---- */
  setPrompt(n) {
    this.near = n;
    if (!n || this.modal) { this.prompt.hidden = true; return; }
    const key = touch ? 'Tap' : 'Space';
    if (n.type === 'spot') {
      const s = n.spot;
      this.prompt.innerHTML = s.done
        ? `<b>${s.npc_name || s.npc}</b><span>Practice words</span><kbd>${key}</kbd>`
        : `<b>${s.npc}</b><span>${s.task}</span><kbd>${key}</kbd>`;
    } else {
      this.prompt.innerHTML = `<b>${REGIONS[n.gate.to].name}</b><span>Locked</span><kbd>${key}</kbd>`;
    }
    this.prompt.hidden = false;
  },
  placePrompt(camX, camY, k) {
    const n = this.near;
    if (!n || this.prompt.hidden) return;
    const wx = n.type === 'spot' ? n.spot.person.x : n.gate.cx, wy = n.type === 'spot' ? n.spot.person.y - 40 : n.gate.cy - 40;
    this.prompt.style.transform = `translate(${Math.round((wx - camX) * k)}px, ${Math.round((wy - camY) * k)}px) translate(-50%, -100%)`;
  },

  /* ---- talking ---- */
  talk(sp) {
    const done = sp.done, p = h('div', 'card dialog');
    const pic = portrait(sp.look, 88);
    p.innerHTML = `<div class="face"></div><div class="body"><div class="who">${sp.npc}</div>
      <p class="line">${done ? 'Thanks again for your help! Want to practice a few words with me?' : sp.ask}</p>
      <div class="row"><button class="btn" id="no">${done ? 'Maybe later' : 'Not now'}</button><button class="btn primary" id="yes">${done ? 'Practice' : "Let's spell"}</button></div></div>`;
    $('.face', p).appendChild(pic);
    SFX.open();
    this.open(p, { dock: true, onKey: e => { if (e.key === 'Enter' || e.key === ' ') yes(); if (e.key === 'Escape') this.close(); } });
    if (!done) Voice.say('a_' + sp.id);
    const yes = () => { this.close(true); Challenge.start(sp, done); };
    $('#yes', p).onclick = yes;
    $('#no', p).onclick = () => this.close();
  },
  gateInfo(g) {
    const p = h('div', 'card dialog');
    const R = REGIONS[g.to], here = REGIONS[g.from];
    const left = World.spots.filter(s => s.region === g.from && !s.done).length;
    const text = g.to >= PLAYABLE && left === 0
      ? `${R.name} is still being built. Come back soon!`
      : `The gate to ${R.name} is locked. Help everyone in ${here.name} to open it. ${left} ${left === 1 ? 'neighbor needs' : 'neighbors need'} help.`;
    p.innerHTML = `<div class="face gate">${ICONS.lock}</div><div class="body"><div class="who">${R.name}</div><p class="line">${text}</p><div class="row"><button class="btn primary" id="ok">OK</button></div></div>`;
    this.open(p, { dock: true, onKey: e => { if (['Enter', ' ', 'Escape'].includes(e.key)) this.close(); } });
    $('#ok', p).onclick = () => this.close();
  },

  /* after a task: bloom + thanks + gift */
  finish(sp) {
    Game.paused = true;
    Game.bloom(sp);
    SFX.bloom();
    const D = Save.data;
    D.done[sp.id] = true;
    const [type, name, color] = sp.gift;
    D.gifts.push({ type, name, color, from: sp.npc });
    Save.write();
    this.updateHud();
    setTimeout(() => {
      const p = h('div', 'card dialog');
      p.innerHTML = `<div class="face"></div><div class="body"><div class="who">${sp.npc}</div><p class="line">${sp.thanks}</p>
        <div class="gift"><span class="gicon"></span><span><small>You got</small><b>${name}</b></span></div>
        <div class="row"><button class="btn primary" id="ok">Thank you!</button></div></div>`;
      $('.face', p).appendChild(portrait(sp.look, 88));
      const ic = iconCanvas(type, color); ic.className = 'px'; $('.gicon', p).appendChild(ic);
      SFX.gift();
      this.open(p, { dock: true, onKey: e => { if (['Enter', ' '].includes(e.key)) ok(); } });
      Voice.say('t_' + sp.id);
      const ok = () => { this.close(); this.checkRegion(sp.region); };
      $('#ok', p).onclick = ok;
    }, 900);
  },
  checkRegion(ri) {
    const left = World.spots.filter(s => s.region === ri && !s.done).length;
    if (left) return;
    const D = Save.data;
    if (D.unlocked <= ri + 1) { D.unlocked = ri + 2; Save.write(); } else return;
    const next = REGIONS[ri + 1], built = ri + 1 < PLAYABLE;
    const g = World.gates.find(g => g.from === ri);
    if (g && built) World.setGate(g, true);
    SFX.unlock();
    const p = h('div', 'card banner');
    p.innerHTML = `<div class="kicker">${REGIONS[ri].name}</div><h2>Everything is in bloom</h2>
      <p>${built ? `The gate to <b>${next.name}</b> is open. Follow the path ${sideTo(ri, ri + 1) === 'right' ? 'east' : sideTo(ri, ri + 1) === 'left' ? 'west' : 'south'}.` : `You helped everyone in the first land! <b>${next.name}</b> is still being built. Come back soon to explore it.`}</p>
      <div class="row"><button class="btn" id="map">See the map</button><button class="btn primary" id="ok">Keep exploring</button></div>`;
    this.open(p, { onKey: e => { if (['Enter', ' '].includes(e.key)) this.close(); } });
    Voice.say('ui_unlock');
    $('#ok', p).onclick = () => this.close();
    $('#map', p).onclick = () => { this.close(); this.openMap(); };
  },

  /* ---- pattern lesson card ---- */
  lesson(ri, fromHud) {
    const R = REGIONS[ri], p = h('div', 'card lesson');
    p.innerHTML = `
      <div class="kicker">${R.grade} · Land ${ri + 1} of 8</div>
      <h2>${R.name}</h2>
      <div class="pattern-title">${R.pattern}</div>
      <p>${R.teach}</p>
      <div class="points">${R.points.map(([g, t]) => `<div class="pt"><span class="gph">${g}</span><span>${t}</span></div>`).join('')}</div>
      <div class="examples">${R.examples.map(w => `<button class="ex" data-w="${w}">${ICONS.speaker}${wordHTML(WORDS[w], true)}</button>`).join('')}</div>
      <div class="row"><button class="btn" id="hear">${ICONS.speaker} Hear the lesson</button><button class="btn primary" id="go">${fromHud ? 'Back to exploring' : "Let's go"}</button></div>`;
    this.open(p, { onKey: e => { if (e.key === 'Enter') go(); if (e.key === 'Escape') go(); } });
    const go = () => { Save.data.seenIntro[R.id] = true; Save.write(); this.close(); };
    $('#go', p).onclick = go;
    $('#hear', p).onclick = () => Voice.say('r_' + R.id);
    p.querySelectorAll('.ex').forEach(b => b.onclick = () => Voice.seq(['w_' + b.dataset.w]));
    if (!fromHud) setTimeout(() => Voice.say('r_' + R.id), 250);
  },

  /* ---- map ---- */
  openMap() {
    const p = h('div', 'card mapcard');
    p.innerHTML = `<div class="maphead"><h2>Map of Wordhollow</h2><button class="btn" id="x">Close</button></div><div class="mapwrap"><canvas></canvas><div class="labels"></div></div>
      <p class="hint">Tap a land you've opened to travel there.</p>`;
    this.open(p, { onKey: e => { if (['Escape', 'm', 'M', 'Enter'].includes(e.key)) this.close(); } });
    $('#x', p).onclick = () => this.close();
    const wrap = $('.mapwrap', p), cv = $('canvas', p), labels = $('.labels', p);
    const W = TW * T, H = TH * T;
    const fit = () => {
      const maxW = wrap.clientWidth, k = maxW / W;
      cv.width = Math.round(W * k * devicePixelRatio); cv.height = Math.round(H * k * devicePixelRatio);
      cv.style.width = Math.round(W * k) + 'px'; cv.style.height = Math.round(H * k) + 'px';
      const c = cv.getContext('2d'), s = cv.width / W;
      c.imageSmoothingEnabled = false; c.setTransform(s, 0, 0, s, 0, 0);
      c.drawImage(World.ground, 0, 0);
      const objs = World.objects.slice().sort((a, b) => a.baseY - b.baseY);
      for (const o of objs) {
        if (o.kind === 'sprite') c.drawImage(o.img, o.x, o.y);
        else if (o.kind === 'place') { const S = o.spot.S; c.drawImage((o.spot.done ? S.after : S.before)[0], o.x, o.y); }
        else if (o.kind === 'placeFront') { const S = o.spot.S; c.drawImage(o.spot.done ? S.front.after : S.front.before, o.x, o.y); }
        else if (o.kind === 'gate') { const img = o.g.open ? o.g.imgs.open : o.g.imgs.closed, [px, py, pw, ph] = o.part; c.drawImage(img, px, py, pw, ph, o.x, o.y, pw, ph); }
      }
      for (let i = 0; i < 8; i++) {
        const open = i < Save.data.unlocked && i < PLAYABLE;
        if (!open) { const { ox, oy } = regionOrigin(i); const F = World.fog[i]; c.globalAlpha = .88; c.drawImage(F, ox * T - 32, oy * T - 32, F.width * F.q, F.height * F.q); c.globalAlpha = 1; }
      }
      // player
      const P = Game.player; c.fillStyle = INK; c.beginPath(); c.arc(P.x, P.y - 8, 14, 0, 7); c.fill(); c.fillStyle = '#ffd46a'; c.beginPath(); c.arc(P.x, P.y - 8, 10, 0, 7); c.fill();
      labels.innerHTML = '';
      for (let i = 0; i < 8; i++) {
        const { ox, oy } = regionOrigin(i), R = REGIONS[i], open = i < Save.data.unlocked && i < PLAYABLE;
        const done = World.spots.filter(s => s.region === i && s.done).length;
        const el = h('button', 'mlabel' + (open ? '' : ' locked'));
        el.style.left = ((ox + RW / 2) / TW * 100) + '%'; el.style.top = ((oy + RH / 2) / TH * 100) + '%';
        el.innerHTML = `<b>${open ? '' : ICONS.lock}${R.name}</b><span>${R.pattern}${open ? ` · ${done}/5` : ''}</span>`;
        if (open) el.onclick = () => { const { ox, oy } = regionOrigin(i); Object.assign(Game.player, { x: (ox + 17) * T + 8, y: (oy + 17) * T + 12, path: null }); Game.snapCam(); this.close(); this.updateHud(); };
        labels.appendChild(el);
      }
    };
    requestAnimationFrame(fit);
  },

  /* ---- word book ---- */
  openBook() {
    const p = h('div', 'card book');
    p.innerHTML = `<div class="maphead"><h2>Word book</h2><button class="btn" id="x">Close</button></div>
      <p class="hint">Dots fill in as a word is remembered over several days.</p><div class="lands"></div>
      <button class="link" id="how">How it teaches spelling</button>`;
    const lands = $('.lands', p);
    REGIONS.forEach((R, i) => {
      const open = i < Save.data.unlocked;
      const sec = h('section', 'land' + (open ? '' : ' locked'));
      sec.innerHTML = `<div class="lhead"><b>${R.name}</b><span>${R.pattern}</span><button class="lessonbtn" ${open ? '' : 'disabled'}>Lesson</button></div>
        <div class="words">${R.list.map(w => { const lv = Learn.level(w), seen = Learn.stat(w).box > 0; return `<span class="wchip ${seen ? '' : 'unseen'}" data-w="${w}">${seen || open ? (seen ? w : '') : ''}${WORDS[w].heart ? ICONS.heart : ''}${seen ? `<i class="dots">${[0, 1, 2, 3].map(k => `<i class="${k < lv ? 'on' : ''}"></i>`).join('')}</i>` : '<i class="q">?</i>'}</span>`; }).join('')}</div>`;
      if (open) $('.lessonbtn', sec).onclick = () => { this.close(true); this.lesson(i, true); };
      sec.querySelectorAll('.wchip').forEach(c => { if (Learn.stat(c.dataset.w).box > 0) c.onclick = () => Voice.seq(['w_' + c.dataset.w]); });
      lands.appendChild(sec);
    });
    this.open(p, { onKey: e => { if (e.key === 'Escape') this.close(); } });
    $('#x', p).onclick = () => this.close();
    $('#how', p).onclick = () => { this.close(true); this.method(); };
  },
  openBag() {
    const p = h('div', 'card bag');
    const g = Save.data.gifts;
    p.innerHTML = `<div class="maphead"><h2>Satchel</h2><button class="btn" id="x">Close</button></div>
      ${g.length ? '<div class="gifts"></div>' : '<p class="hint">Gifts from your neighbors will go here.</p>'}`;
    const grid = $('.gifts', p);
    g.forEach(it => { const d = h('div', 'giftcell'); const ic = iconCanvas(it.type, it.color); ic.className = 'px'; d.appendChild(ic); d.appendChild(h('b', '', it.name)); d.appendChild(h('small', '', 'from ' + it.from)); grid.appendChild(d); });
    this.open(p, { onKey: e => { if (e.key === 'Escape') this.close(); } });
    $('#x', p).onclick = () => this.close();
  },
};

/* a word as boxes-of-letters HTML, pattern parts highlighted */
function wordHTML(w, highlight) {
  const f = highlight ? focusSegs(w) : [];
  return `<span class="wd">${w.segs.map((s, i) => `<span class="sg${f.includes(i) ? ' focus' : ''}${s.heart.length ? ' hasheart' : ''}${s.silent ? ' silent' : ''}">${[...s.text].map((ch, j) => s.heart.includes(j) ? `<span class="hl">${ch}</span>` : ch).join('')}</span>`).join('')}</span>`;
}

/* =================================================================== the spelling challenge */
const Challenge = {
  start(sp, practice) {
    this.sp = sp; this.practice = practice;
    this.ri = sp.region; this.R = REGIONS[sp.region];
    this.items = Learn.pick(sp.region, 3, practice);
    this.i = 0; this.results = [];
    const p = h('div', 'card challenge');
    p.innerHTML = `
      <div class="chead"><div class="mini"></div><div class="ctitle"><b>${sp.npc}</b><span>${practice ? 'Practice' : sp.task}</span></div><div class="prog"></div><button class="btn ghost" id="quit" aria-label="Close">✕</button></div>
      <div class="stage">
        <div class="listen"><button class="btn hear" id="hear">${ICONS.speaker}<span>Hear it</span></button><button class="btn ghost" id="sent">In a sentence</button></div>
        <div class="study-note" hidden></div>
        <div class="answer"></div>
        <div class="hintline"></div>
      </div>
      <div class="keys"></div>
      <div class="actions"><button class="btn" id="erase">${ICONS.erase}<span>Erase</span></button><button class="btn primary" id="check">Check</button></div>`;
    $('.mini', p).appendChild(portrait(sp.look, 44));
    this.el = p;
    UI.open(p, { onKey: e => this.key(e), onClose: () => {} });
    $('#quit', p).onclick = () => { UI.close(); };
    $('#hear', p).onclick = () => this.sayWord(true);
    $('#sent', p).onclick = () => Voice.seq(['s_' + this.w.word]);
    $('#erase', p).onclick = () => this.erase();
    $('#check', p).onclick = () => this.check();
    this.next();
  },
  get w() { return WORDS[this.items[this.i]]; },
  sayWord(full) { const k = this.w.word; Voice.seq(full ? ['w_' + k, 400, 's_' + k, 400, 'w_' + k] : ['w_' + k]); },
  scaffold() { return this.R.scaffold; },

  next() {
    if (this.i >= this.items.length) return this.done();
    const w = this.w;
    this.attempt = 0; this.typed = ''; this.lock = false; this.shown = false; this.el.classList.remove('studying');
    $('.prog', this.el).innerHTML = this.items.map((_, k) => `<i class="${k < this.i ? (this.results[k] === 'first' ? 'good' : 'ok') : k === this.i ? 'now' : ''}"></i>`).join('');
    $('.hintline', this.el).textContent = '';
    this.buildKeys();
    if (w.heart && Learn.stat(w.word).box === 0) this.study('heart');
    else { this.mode = 'build'; this.render(); setTimeout(() => this.sayWord(true), 250); }
    Voice.preload(['w_' + w.word, 's_' + w.word]);
  },

  /* letter tiles: a small tray early on, a full a–z board later */
  buildKeys() {
    const keys = $('.keys', this.el), w = this.w;
    keys.innerHTML = '';
    let letters;
    if (this.scaffold() === 'tray') {
      const set = new Set(w.word);
      const r = rng([...w.word].reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
      ['a', 'i', 'e', 'o', 'u'].filter(v => this.R.focus !== 'vowel' || true).slice(0, this.ri === 0 ? 3 : 5).forEach(v => set.add(v));
      const cons = 'bcdfghjklmnprstvwz';
      while (set.size < Math.max(9, set.size)) set.add(cons[Math.floor(r() * cons.length)]);
      while (set.size < 10) set.add(cons[Math.floor(r() * cons.length)]);
      letters = [...set].sort();
      keys.className = 'keys tray';
    } else {
      letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
      keys.className = 'keys abc';
    }
    letters.forEach(ch => {
      const b = h('button', 'key' + ('aeiou'.includes(ch) ? ' vowel' : ''), ch);
      b.onpointerdown = e => { e.preventDefault(); this.type(ch); };
      keys.appendChild(b);
    });
  },
  cap() { return this.scaffold() === 'open' ? this.w.word.length + 3 : this.w.word.length; },
  type(ch) {
    if (this.lock || this.mode !== 'build') return;
    if (this.typed.length >= this.cap()) return;
    this.typed += ch; SFX.tap(); this.render();
  },
  erase() { if (this.lock || this.mode !== 'build' || !this.typed) return; this.typed = this.typed.slice(0, -1); SFX.erase(); this.render(); },
  key(e) {
    if (e.key === 'Escape') return UI.close();
    if (this.mode === 'study') { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.cover(); } return; }
    if (/^[a-z]$/i.test(e.key) && !e.metaKey && !e.ctrlKey) this.type(e.key.toLowerCase());
    else if (e.key === 'Backspace') { e.preventDefault(); this.erase(); }
    else if (e.key === 'Enter') { e.preventDefault(); this.check(); }
    else if (e.key === ' ' || e.key === 'Tab') { e.preventDefault(); this.sayWord(true); }
  },

  /* split what's typed into the word's sound boxes */
  boxes() {
    const w = this.w, sc = this.scaffold();
    if (sc === 'tray' || sc === 'boxes') {
      let k = 0;
      return w.segs.map(s => { const got = this.typed.slice(k, k + s.text.length); k += s.text.length; return { cap: s.text.length, got, want: s.text, silent: s.silent }; });
    }
    if (sc === 'letters') return [...w.word].map((ch, i) => ({ cap: 1, got: this.typed[i] || '', want: ch }));
    return null;
  },
  render(marks) {
    const a = $('.answer', this.el), bx = this.boxes(), n = this.typed.length;
    $('.study-note', this.el).hidden = true;
    a.className = 'answer';
    if (bx) {
      let k = 0;
      a.innerHTML = `<div class="boxes ${this.scaffold()}">${bx.map((b, i) => {
        const cur = n >= k && n < k + b.cap && !marks; k += b.cap;
        const cls = ['box', 'w' + b.cap, b.silent ? 'silent' : '', cur ? 'cur' : '', marks ? (marks[i] ? 'right' : 'wrong') : ''].join(' ');
        return `<span class="${cls}">${[...Array(b.cap)].map((_, j) => `<span class="l">${b.got[j] || ''}</span>`).join('')}</span>`;
      }).join('')}</div>`;
    } else {
      a.innerHTML = `<div class="open ${marks ? (marks.every(Boolean) ? 'right' : 'wrong') : ''}">${[...this.typed].map((ch, i) => `<span class="l ${marks ? (marks[i] ? 'r' : 'x') : ''}">${ch}</span>`).join('')}<span class="caret"></span></div>`;
    }
    $('#check', this.el).disabled = n === 0;
    $('#erase', this.el).disabled = n === 0;
  },

  check() {
    if (this.lock || this.mode !== 'build' || !this.typed) return;
    const w = this.w, ok = this.typed === w.word;
    const bx = this.boxes();
    const marks = bx ? bx.map(b => b.got === b.want) : [...this.typed].map((ch, i) => ch === w.word[i]);
    if (ok) return this.right();
    this.lock = true;
    SFX.miss();
    this.render(marks);
    $('.answer', this.el).classList.add('shake');
    if (this.attempt === 0) {
      this.attempt = 1;
      // keep the correct beginning, clear from the first wrong sound
      let keep = 0;
      if (bx) { for (const b of bx) { if (b.got === b.want) keep += b.cap; else break; } }
      else { while (keep < this.typed.length && this.typed[keep] === w.word[keep]) keep++; }
      $('.hintline', this.el).innerHTML = `<b>Almost.</b> ${this.hintFor(w)}`;
      setTimeout(() => { this.typed = this.typed.slice(0, keep); this.lock = false; this.render(); Voice.seq(['w_' + w.word]); }, 1100);
    } else {
      // second miss (or miss after studying): study it, then spell it from memory
      setTimeout(() => { this.lock = false; this.attempt >= 2 ? this.giveUp() : this.study('study'); }, 1000);
    }
  },
  hintFor(w) {
    if (w.heart) return 'This is a heart word. Part of it has to be remembered.';
    if (w.base && this.attempt) return `Start with <b>${w.base}</b>, then add the ending.`;
    return this.R.rule;
  },
  right() {
    const w = this.w, bx = this.boxes();
    this.lock = true;
    this.render(bx ? bx.map(() => true) : [...this.typed].map(() => true));
    const a = $('.answer', this.el); a.classList.add('yay');
    // show which part carried the pattern
    const f = focusSegs(w);
    if (bx && f.length) a.querySelectorAll('.box').forEach((el, i) => { if (f.includes(i)) el.classList.add('focus'); });
    SFX.right();
    const res = this.shown ? (this.attempt >= 2 || this.studied === 'study' ? 'miss' : 'second') : this.attempt === 0 ? 'first' : 'second';
    const praise = res === 'first' ? ['Yes!', 'Spot on.', 'Perfect.', 'Nice spelling.'][this.i % 4] : this.shown ? 'Now you have it.' : 'Fixed it!';
    $('.hintline', this.el).innerHTML = `<b>${praise}</b> ${wordHTML(w, true)}`;
    Learn.record(w.word, res);
    this.results[this.i] = res;
    Voice.seq(['w_' + w.word]);
    setTimeout(() => { this.i++; this.next(); }, 1600);
  },
  giveUp() {
    const w = this.w;
    Learn.record(w.word, 'miss');
    this.results[this.i] = 'miss';
    $('.hintline', this.el).innerHTML = `This one is tricky. We will practice <b>${w.word}</b> again soon.`;
    this.mode = 'shown';
    $('.answer', this.el).innerHTML = `<div class="studyword">${wordHTML(w, true)}</div>`;
    Voice.seq(['w_' + w.word]);
    setTimeout(() => { this.i++; this.next(); }, 2600);
  },

  /* show the word (heart word intro, or after two misses), then hide it and spell from memory */
  study(kind) {
    const w = this.w;
    this.mode = 'study'; this.shown = true; this.studied = kind;
    this.el.classList.add('studying');
    const note = $('.study-note', this.el);
    note.hidden = false;
    note.innerHTML = kind === 'heart' ? `${ICONS.heart} <b>Heart word.</b> The part with the heart does not follow the rules, so we learn it by heart.` : '<b>Look closely.</b> Point to each part and say its sound.';
    const a = $('.answer', this.el); a.className = 'answer';
    a.innerHTML = `<div class="studyword">${wordHTML(w, true)}</div><button class="btn primary" id="cover">I've got it, hide it</button>`;
    $('#cover', a).onclick = () => this.cover();
    $('#check', this.el).disabled = true; $('#erase', this.el).disabled = true;
    $('.hintline', this.el).textContent = '';
    Voice.seq([kind === 'heart' ? 'ui_heart' : 'ui_study', 300, 'w_' + w.word, 300, 's_' + w.word]);
  },
  cover() {
    if (this.mode !== 'study') return;
    this.mode = 'build'; this.typed = '';
    if (this.studied === 'study') this.attempt = 2;
    this.el.classList.remove('studying');
    $('.hintline', this.el).textContent = 'Now spell it from memory.';
    this.render();
    Voice.seq(['w_' + this.w.word]);
  },

  done() {
    UI.close(true);
    if (this.practice) {
      SFX.bloom(); Game.burst(this.sp.person.x, this.sp.person.y - 20, 'spark', 24);
      Game.paused = false;
      return;
    }
    UI.finish(this.sp);
  },
};
