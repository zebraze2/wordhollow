/* Save state + spaced-retrieval scheduler.

   Each word moves through Leitner boxes:
     0 new · 1 learning (missed: comes back this session) · 2 → 5 spaced further apart.
   A task asks for 3 words: up to one review (a word missed earlier, or one that
   is due from an earlier region — interleaved practice), the rest new words from
   the region's pattern. Missed words come back at the next task, then again days later. */

const SAVE_KEY = 'wordhollow.v1';
const DAY = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
const INTERVAL = [0, 0, 1, 3, 7, 21]; // days until due, per box

const Save = {
  data: null,
  fresh() {
    return { v: 1, started: false, unlocked: 1, done: {}, gifts: [], seenIntro: {}, words: {}, again: [], pos: null, muted: false };
  },
  load() {
    try { this.data = Object.assign(this.fresh(), JSON.parse(localStorage.getItem(SAVE_KEY)) || {}); }
    catch { this.data = this.fresh(); }
    return this.data;
  },
  write() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch {} },
  reset() { this.data = this.fresh(); this.write(); },
};

const Learn = {
  stat(word) {
    const w = Save.data.words;
    return w[word] || (w[word] = { box: 0, right: 0, wrong: 0, due: 0 });
  },
  isDue: s => s.box > 0 && s.box < 5 && s.due <= DAY(),

  /* pick the words for a task in region ri */
  pick(ri, n = 3, practice = false) {
    const D = Save.data, out = [];
    const add = w => { if (w && !out.includes(w) && out.length < n) out.push(w); };
    const seen = w => this.stat(w).box > 0;
    const pool = REGIONS.slice(0, ri + 1).flatMap(r => r.list);

    if (practice) {
      D.again.forEach(add);
      pool.filter(w => this.isDue(this.stat(w))).sort((a, b) => this.stat(a).box - this.stat(b).box).forEach(add);
      pool.filter(seen).sort((a, b) => this.stat(a).box - this.stat(b).box || Math.random() - .5).forEach(add);
      REGIONS[ri].list.forEach(add);
      return out;
    }
    // one review slot: missed words first, then due words from earlier regions
    const review = D.again.find(w => pool.includes(w)) ||
      REGIONS.slice(0, ri).flatMap(r => r.list).filter(w => this.isDue(this.stat(w)))
        .sort((a, b) => this.stat(a).due - this.stat(b).due)[0];
    const fresh = REGIONS[ri].list.filter(w => !seen(w));
    // new words first so the pattern is practised; review goes in the middle
    const newCount = review ? n - 1 : n;
    fresh.slice(0, newCount).forEach(add);
    if (review) out.splice(Math.min(1, out.length), 0, review);
    // ran out of new words: least-known words from this region
    REGIONS[ri].list.slice().sort((a, b) => this.stat(a).box - this.stat(b).box).forEach(add);
    return out.slice(0, n);
  },

  /* result: 'first' (right first try), 'second' (fixed after a hint), 'miss' */
  record(word, result) {
    const s = this.stat(word), D = Save.data;
    if (result === 'first') { s.right++; s.box = Math.min(5, Math.max(2, s.box + 1)); }
    else if (result === 'second') { s.right++; s.box = Math.max(1, Math.min(s.box, 2)); }
    else { s.wrong++; s.box = 1; }
    s.due = DAY() + INTERVAL[s.box];
    D.again = D.again.filter(w => w !== word);
    if (result !== 'first') D.again.push(word);
    Save.write();
  },

  /* 0-4 dots for the word book */
  level(word) { const b = this.stat(word).box; return b === 0 ? 0 : Math.min(4, b - 1); },
};
