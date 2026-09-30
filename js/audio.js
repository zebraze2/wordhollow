/* Voice + sound effects.
   Voice plays pre-recorded clips (audio/<id>.m4a, listed in audio/manifest.json,
   made by tools/make-audio.swift) and falls back to the browser's best voice. */

let AC = null;
function ensureAudio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}

const Voice = (() => {
  let files = new Set(), texts = {}, voiceId = '';
  const buffers = {};
  fetch('audio/manifest.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : null))
    .then(m => { if (m && m.files) { files = new Set(m.files); texts = m.texts || {}; voiceId = (m.voices && m.voices.en) || ''; } }).catch(() => {});
  // version tag per clip (its text + the voice), so re-recorded clips are never served stale from cache
  const version = key => { let h = 0; for (const c of (texts[key] || '') + voiceId) h = (h * 31 + c.charCodeAt(0)) | 0; return (h >>> 0).toString(36); };

  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|wobble|fred|good news|jester|junior|kathy|organ|superstar|ralph|trinoids|whisper|zarvox|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley/i;
  let best = null;
  function score(v) {
    const lang = v.lang.replace('_', '-').toLowerCase();
    if (!lang.startsWith('en')) return -Infinity;
    const id = (v.name + ' ' + v.voiceURI).toLowerCase();
    let s = 0;
    if (/premium|natural|neural|enhanced|siri/.test(id)) s += 60;
    if (/google|online/.test(id)) s += 45;
    if (NOVELTY.test(v.name)) s -= 50;
    if (lang === 'en-us') s += 12;
    if (/samantha|ava|allison|nora/.test(id)) s += 8;
    return s;
  }
  function pick() {
    let top = -Infinity;
    for (const v of speechSynthesis.getVoices()) { const s = score(v); if (s > top) { top = s; best = v; } }
  }
  if ('speechSynthesis' in window) { pick(); speechSynthesis.addEventListener('voiceschanged', pick); }

  let token = 0, src = null, muted = false;
  function stop() {
    token++;
    if (src) { try { src.stop(); } catch {} src = null; }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
  async function load(key) {
    if (buffers[key]) return buffers[key];
    const ac = ensureAudio();
    const res = await fetch('audio/' + key + '.m4a?v=' + version(key));
    if (!res.ok) throw new Error('missing clip ' + key);
    return (buffers[key] = await ac.decodeAudioData(await res.arrayBuffer()));
  }
  async function playClip(key, my) {
    const buf = await load(key);
    if (my !== token) return;
    await new Promise(done => {
      const s = AC.createBufferSource();
      s.buffer = buf; s.connect(AC.destination); s.onended = done; src = s; s.start();
    });
  }
  function speakTTS(key) {
    return new Promise(resolve => {
      let finished = false;
      const done = () => { if (!finished) { finished = true; resolve(); } };
      const c = CLIPS[key];
      if (!c || !('speechSynthesis' in window)) return setTimeout(done, 250);
      const text = clipPlain(c.text);
      const u = new SpeechSynthesisUtterance(text);
      u.lang = best ? best.lang : 'en-US';
      if (best) u.voice = best;
      u.rate = key.startsWith('w_') ? 0.8 : 0.95;
      u.onend = u.onerror = done;
      speechSynthesis.speak(u);
      setTimeout(done, 800 + text.length * 110);
    });
  }
  const pause = ms => new Promise(r => setTimeout(r, ms));
  async function seq(keys) {
    stop();
    if (muted) return;
    const my = token;
    for (const key of keys) {
      if (my !== token) return;
      if (typeof key === 'number') { await pause(key); continue; }
      try {
        if (files.has(key)) await playClip(key, my); else await speakTTS(key);
      } catch { if (my === token) await speakTTS(key); }
    }
  }
  return {
    say: key => seq([key]),
    seq, stop,
    preload: keys => keys.forEach(k => { if (files.has(k)) load(k).catch(() => {}); }),
    setMuted: m => { muted = m; if (m) stop(); },
    get muted() { return muted; },
  };
})();

/* ---------------- sound effects (synthesized) ---------------- */
let sfxOn = true;
function tone(freq, dur, type = 'sine', when = 0, vol = 0.1, slideTo) {
  const ac = ensureAudio(); if (!ac || !sfxOn) return;
  const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
}
let noiseBuf = null;
function noise(dur, when = 0, vol = 0.1, freq = 1200, q = 1, type = 'bandpass') {
  const ac = ensureAudio(); if (!ac || !sfxOn) return;
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ac.currentTime + when, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f).connect(g).connect(ac.destination); s.start(t); s.stop(t + dur + 0.05);
}
const SFX = {
  tap:    () => { tone(880, .06, 'triangle', 0, .05); },
  erase:  () => tone(440, .07, 'triangle', 0, .04, 300),
  right:  () => [659, 784, 1046].forEach((f, i) => tone(f, .22, 'triangle', i * .07, .08)),
  miss:   () => { tone(294, .18, 'triangle', 0, .07, 262); tone(247, .3, 'triangle', .12, .06); },
  open:   () => { tone(523, .12, 'triangle', 0, .05); tone(784, .18, 'triangle', .06, .05); },
  close:  () => { tone(784, .1, 'triangle', 0, .04); tone(523, .15, 'triangle', .05, .04); },
  bloom:  () => { [523, 659, 784, 988, 1175, 1568].forEach((f, i) => tone(f, .35, 'triangle', i * .07, .07)); noise(.9, .1, .05, 6000, .5, 'highpass'); },
  unlock: () => [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, .45, 'triangle', i * .12, .08)),
  gift:   () => { tone(988, .1, 'square', 0, .03); tone(1319, .3, 'square', .09, .03); },
  step:   () => noise(.04, 0, .025, 900, 2),
};
