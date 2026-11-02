/* Sweet Potato Kitchen — a gentle, no-rules cooking playground.
   No timers, no scores, no wrong answers. Everything you do makes something fun happen. */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ------------------------------------------------------------------ state */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('spk.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('spk.' + k, JSON.stringify(v)); } catch {} },
  };

  const S = {
    food: null,          // { form, cook, toppings:[], bites }
    char: store.get('char', 0),
    muted: store.get('muted', false),
    stickers: new Set(store.get('stickers', [])),
    busy: false,
  };

  /* ------------------------------------------------------------------ audio (all sounds are synthesized, no files) */
  const FX = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    },
    tone(freq, dur, { type = 'sine', vol = .25, to = null, delay = 0 } = {}) {
      if (!this.ctx || S.muted) return;
      const t = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t); o.stop(t + dur + .05);
    },
    noise(dur, { vol = .2, freq = 1000, q = 1, type = 'bandpass', delay = 0, attack = .01 } = {}) {
      if (!this.ctx || S.muted) return;
      const t = this.ctx.currentTime + delay;
      const n = Math.ceil(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource(); src.buffer = buf;
      const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f).connect(g).connect(this.ctx.destination);
      src.start(t); src.stop(t + dur + .05);
    },
    play(name) {
      if (!this.ctx || S.muted) return;
      switch (name) {
        case 'pop':     this.tone(420, .18, { to: 880, vol: .2 }); break;
        case 'tap':     this.tone(660, .07, { type: 'triangle', vol: .12 }); break;
        case 'boing':   this.tone(320, .25, { to: 140, type: 'triangle', vol: .2 }); break;
        case 'chop':    for (let i = 0; i < 4; i++) { this.noise(.07, { vol: .3, freq: 500, type: 'lowpass', delay: i * .35 }); this.tone(130, .09, { type: 'square', vol: .12, delay: i * .35 }); } break;
        case 'mash':    for (let i = 0; i < 5; i++) this.noise(.14, { vol: .22, freq: 350, type: 'lowpass', delay: i * .3, attack: .05 }); break;
        case 'sizzle':  this.noise(1.5, { vol: .18, freq: 3200, type: 'highpass', attack: .2 }); this.noise(1.3, { vol: .07, freq: 900, q: .5, delay: .1 }); break;
        case 'bubble':  for (let i = 0; i < 9; i++) this.tone(rand(260, 520), .12, { to: rand(600, 900), vol: .1, delay: i * .16 + rand(0, .05) }); break;
        case 'hum':     this.tone(96, 1.4, { type: 'sawtooth', vol: .05 }); this.tone(192, 1.4, { type: 'sine', vol: .04 }); break;
        case 'ding':    this.tone(1046, .9, { type: 'triangle', vol: .22 }); this.tone(1568, .7, { type: 'sine', vol: .12, delay: .02 }); break;
        case 'sprinkle':for (let i = 0; i < 7; i++) this.tone(rand(1800, 3200), .05, { type: 'triangle', vol: .06, delay: i * .05 }); break;
        case 'squish':  this.noise(.25, { vol: .2, freq: 500, type: 'lowpass', attack: .06 }); this.tone(220, .2, { to: 160, vol: .08 }); break;
        case 'munch':   this.noise(.09, { vol: .3, freq: 700, type: 'lowpass' }); this.tone(110, .1, { type: 'square', vol: .1 }); this.noise(.09, { vol: .25, freq: 700, type: 'lowpass', delay: .18 }); this.noise(.09, { vol: .2, freq: 700, type: 'lowpass', delay: .36 }); break;
        case 'yum':     [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .22, { type: 'triangle', vol: .16, delay: i * .09 })); break;
        case 'hooray':  [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, .3, { type: 'triangle', vol: .16, delay: i * .08 })); this.tone(1568, .6, { type: 'sine', vol: .12, delay: .45 }); break;
        case 'hello':   this.tone(440, .12, { to: 660, type: 'triangle', vol: .12 }); this.tone(660, .18, { type: 'triangle', vol: .12, delay: .12 }); break;
        case 'swoosh':  this.noise(.3, { vol: .12, freq: 1800, q: .7 }); break;
      }
    },
  };

  /* ------------------------------------------------------------------ icons */
  const ICON = {
    knife: `<svg viewBox="0 0 100 100"><path d="M14 72 L62 24 c10-10 26-6 30 4 L30 84 c-6 4-14 0-16-12z" fill="#dfe7f2" stroke="#9fb0c7" stroke-width="3"/><path d="M14 72 L30 84 L10 92z" fill="#7a4a2a"/><path d="M8 94 l22-10" stroke="#5a3418" stroke-width="7" stroke-linecap="round"/></svg>`,
    masher: `<svg viewBox="0 0 100 100"><rect x="44" y="6" width="12" height="46" rx="6" fill="#7a4a2a"/><path d="M20 52 h60 v12 H20z" fill="#b9c6d6"/><path d="M24 64 v22 M38 64 v22 M52 64 v22 M66 64 v22 M76 64 v22" stroke="#9fb0c7" stroke-width="5" stroke-linecap="round"/><path d="M20 86 h60" stroke="#9fb0c7" stroke-width="5" stroke-linecap="round"/></svg>`,
    pot: `<svg viewBox="0 0 100 100"><g class="bubbles"><circle cx="38" cy="30" r="4" fill="#bfe6ff"/><circle cx="52" cy="26" r="3" fill="#bfe6ff"/><circle cx="64" cy="32" r="4" fill="#bfe6ff"/></g><rect x="16" y="40" width="68" height="46" rx="10" fill="#e35d5d"/><rect x="10" y="36" width="80" height="10" rx="5" fill="#c94848"/><rect x="4" y="52" width="12" height="8" rx="4" fill="#c94848"/><rect x="84" y="52" width="12" height="8" rx="4" fill="#c94848"/><path d="M26 56 h48" stroke="#f08b8b" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>`,
    pan: `<svg viewBox="0 0 100 100"><g class="sparks"><circle class="spark" cx="30" cy="30" r="4" fill="#ffd56a"/><circle class="spark" cx="50" cy="22" r="3" fill="#ffd56a"/><circle class="spark" cx="68" cy="30" r="4" fill="#ffd56a"/></g><ellipse cx="46" cy="62" rx="36" ry="24" fill="#4a4f5a"/><ellipse cx="46" cy="58" rx="30" ry="18" fill="#2f333b"/><ellipse cx="42" cy="56" rx="18" ry="10" fill="#f5b445"/><path d="M80 56 l16-10" stroke="#4a4f5a" stroke-width="10" stroke-linecap="round"/></svg>`,
    oven: `<svg viewBox="0 0 100 100"><rect x="10" y="14" width="80" height="76" rx="10" fill="#9fb0c7"/><rect x="18" y="22" width="64" height="12" rx="6" fill="#dfe7f2"/><circle cx="28" cy="28" r="4" fill="#e35d5d"/><circle cx="42" cy="28" r="4" fill="#3bb0c9"/><rect x="20" y="42" width="60" height="38" rx="8" fill="#2b2a33"/><rect class="glow" x="26" y="48" width="48" height="26" rx="5" fill="#ff9a3c"/><path d="M34 70 c8-6 24-6 32 0" stroke="#7a3b22" stroke-width="7" stroke-linecap="round"/></svg>`,
    micro: `<svg viewBox="0 0 100 100"><rect x="6" y="22" width="88" height="58" rx="10" fill="#dfe7f2" stroke="#9fb0c7" stroke-width="3"/><rect x="14" y="30" width="54" height="42" rx="6" fill="#2b2a33"/><rect class="glow" x="18" y="34" width="46" height="34" rx="4" fill="#5ec8ff" opacity=".6"/><rect x="74" y="32" width="14" height="6" rx="3" fill="#9fb0c7"/><circle cx="81" cy="52" r="6" fill="#3bb0c9"/><circle cx="81" cy="68" r="4" fill="#e35d5d"/></svg>`,
    butter: `<svg viewBox="0 0 100 100"><path d="M18 60 l24-14 h44 l-24 14z" fill="#fff0a8"/><path d="M18 60 h44 v22 H18z" fill="#ffd94a"/><path d="M62 60 l24-14 v22 l-24 14z" fill="#f2c535"/></svg>`,
    cinnamon: `<svg viewBox="0 0 100 100"><rect x="30" y="30" width="40" height="56" rx="10" fill="#b06a3a"/><rect x="26" y="16" width="48" height="20" rx="8" fill="#d9a066"/><circle cx="40" cy="24" r="2.5" fill="#6b3f2a"/><circle cx="50" cy="22" r="2.5" fill="#6b3f2a"/><circle cx="60" cy="24" r="2.5" fill="#6b3f2a"/><rect x="38" y="50" width="24" height="22" rx="4" fill="#fff0d6"/></svg>`,
    marshmallow: `<svg viewBox="0 0 100 100"><rect x="14" y="44" width="40" height="36" rx="10" fill="#fff" stroke="#e8e8f0" stroke-width="3"/><rect x="48" y="26" width="40" height="36" rx="10" fill="#fff" stroke="#e8e8f0" stroke-width="3"/><ellipse cx="68" cy="34" rx="12" ry="4" fill="#f3f3fa"/></svg>`,
    honey: `<svg viewBox="0 0 100 100"><path d="M30 34 h40 v40 a20 20 0 0 1 -40 0z" fill="#ffb833"/><rect x="34" y="20" width="32" height="16" rx="4" fill="#d9a066"/><path d="M38 52 h24 M40 62 h20" stroke="#ffd56a" stroke-width="5" stroke-linecap="round"/><path d="M78 36 v22 q0 10 -6 10" stroke="#ffb833" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="72" cy="74" r="6" fill="#ffb833"/></svg>`,
    cheese: `<svg viewBox="0 0 100 100"><path d="M12 68 L88 40 L88 72 L12 72z" fill="#ffd94a"/><path d="M12 68 L88 40 L80 30 L10 60z" fill="#fff0a8"/><circle cx="40" cy="62" r="4" fill="#f2c535"/><circle cx="64" cy="56" r="5" fill="#f2c535"/><circle cx="52" cy="66" r="2.5" fill="#f2c535"/></svg>`,
    sprinkles: `<svg viewBox="0 0 100 100"><path d="M22 44 h56 l-6 40 H28z" fill="#9fd1ea"/><ellipse cx="50" cy="44" rx="28" ry="8" fill="#fff"/><g stroke-width="6" stroke-linecap="round"><path d="M34 40 l8-6" stroke="#ff6b8a"/><path d="M50 36 l8 4" stroke="#ffd56a"/><path d="M62 42 l6-6" stroke="#7fc3a3"/><path d="M40 48 l-8 2" stroke="#3bb0c9"/><path d="M56 30 l-2-8" stroke="#b58cf2"/></g></svg>`,
  };

  /* ------------------------------------------------------------------ characters */
  const CHARS = [
    { name: 'Pip', skin: '#f7cdb0', nose: '#3bb0c9', rx: 92, ry: 100,
      hair: `<path d="M26 150 C 22 46, 218 46, 214 150 L 198 150 C 198 110, 182 94, 164 92 C 150 106, 90 106, 76 92 C 58 94, 42 110, 42 150 Z" fill="#2b2222"/><path d="M26 150 c0 30 8 40 16 40 l0 -46z M214 150 c0 30 -8 40 -16 40 l0 -46z" fill="#2b2222"/>` },
    { name: 'Momo', skin: '#5fb0ee', nose: '#b58cf2', rx: 96, ry: 96,
      behind: `<path d="M62 70 L40 18 L92 44z M178 70 L200 18 L148 44z" fill="#fff0a8" stroke="#e8d27a" stroke-width="4" stroke-linejoin="round"/>`,
      hair: `<path d="M40 110 c6-30 30-50 80-50 s74 20 80 50 c-20-14 -50-22 -80-22 s-60 8 -80 22z" fill="#3d8fd1"/><circle cx="60" cy="178" r="4" fill="#3d8fd1"/><circle cx="180" cy="178" r="4" fill="#3d8fd1"/><circle cx="48" cy="166" r="3" fill="#3d8fd1"/><circle cx="192" cy="166" r="3" fill="#3d8fd1"/>` },
    { name: 'Tater', skin: '#d9683f', nose: '#fff0d6', rx: 82, ry: 106,
      behind: `<path d="M120 50 c-34-18 -40-48 -12-54 c10 24 16 36 12 54z" fill="#5db36a"/><path d="M122 50 c34-18 40-48 12-54 c-10 24 -16 36 -12 54z" fill="#7fc98a"/>`,
      hair: `<path d="M60 86 c20-10 40-4 60-4 s40-6 60 4" stroke="#e8805c" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/><ellipse cx="66" cy="200" rx="7" ry="4" fill="#b85230" opacity=".6"/><ellipse cx="176" cy="206" rx="6" ry="4" fill="#b85230" opacity=".6"/>` },
  ];

  function charSVG(c) {
    const eye = (x, side) => `
      <g class="eye ${side}" transform="translate(${x} 112)">
        <ellipse rx="18" ry="20" fill="#fff"/>
        <circle class="pupil" cx="2" cy="3" r="8" fill="#2b1d16"/>
        <path class="happy" d="M-13 5 Q0 -12 13 5" stroke="#2b1d16" stroke-width="5" fill="none" stroke-linecap="round"/>
        <ellipse class="lid" rx="19" ry="21" fill="${c.skin}"/>
      </g>`;
    return `<svg viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg">
      ${c.behind || ''}
      <ellipse cx="120" cy="140" rx="${c.rx}" ry="${c.ry}" fill="${c.skin}"/>
      ${c.hair || ''}
      ${eye(84, 'left')}${eye(156, 'right')}
      <path d="M120 128 l-9 18 h18 z" fill="${c.nose}"/>
      <circle cx="64" cy="156" r="12" fill="#ff9aa6" opacity=".55"/><circle cx="176" cy="156" r="12" fill="#ff9aa6" opacity=".55"/>
      <g class="mouth">
        <g class="smile"><path d="M92 182 Q120 206 148 182" stroke="#5a2a1a" stroke-width="6" fill="none" stroke-linecap="round"/></g>
        <g class="open"><ellipse cx="120" cy="194" rx="30" ry="27" fill="#5a1d1d"/><ellipse cx="120" cy="210" rx="16" ry="10" fill="#ff7a8a"/><rect x="100" y="168" width="40" height="10" rx="3" fill="#fff"/></g>
        <g class="chewing"><ellipse cx="120" cy="190" rx="26" ry="14" fill="#5a1d1d"/><rect x="102" y="177" width="36" height="8" rx="3" fill="#fff"/></g>
        <g class="grin"><path d="M84 180 Q120 236 156 180 Z" fill="#5a1d1d"/><path d="M90 181 h60 v9 H90z" fill="#fff"/><ellipse cx="120" cy="214" rx="14" ry="8" fill="#ff7a8a"/></g>
        <g class="silly"><path d="M92 182 Q120 206 148 182" stroke="#5a2a1a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M118 194 q12 0 12 14 q0 12 -12 12 q-12 0 -12 -12 q0 -12 12 -14z" fill="#ff7a8a"/></g>
        <g class="ooh"><ellipse cx="120" cy="192" rx="14" ry="18" fill="#5a1d1d"/><ellipse cx="120" cy="202" rx="8" ry="5" fill="#ff7a8a"/></g>
      </g>
    </svg>`;
  }

  /* ------------------------------------------------------------------ food */
  const COOK = {
    raw:    { skin: '#c4663d', skinDark: '#9e4f2d', inside: '#f6a44a', edge: '#e38a2a', light: '#fbc27d' },
    baked:  { skin: '#8e4a2a', skinDark: '#5e2f1b', inside: '#f08a2a', edge: '#a8521a', light: '#ffb060', steam: true, char: true },
    boiled: { skin: '#d58f6e', skinDark: '#b06a4c', inside: '#f8b462', edge: '#e9a04a', light: '#ffd8a0', steam: true, drops: true },
    fried:  { skin: '#b85d33', skinDark: '#86401f', inside: '#ec9330', edge: '#9a4a1c', light: '#ffc070', crisp: true, spark: true, char: true },
    micro:  { skin: '#c56f45', skinDark: '#9a5231', inside: '#f3a243', edge: '#d78a30', light: '#ffcf8a', steam: true },
  };
  // one tapered sweet-potato outline, reused for the whole potato and the halves
  const SPINDLE = 'M44 118 C 52 84, 96 62, 136 64 C 180 66, 230 80, 266 96 C 232 112, 186 146, 136 152 C 96 156, 52 146, 44 118 Z';
  const FORMS = ['whole', 'halves', 'slices', 'fries', 'cubes', 'mash'];

  // deterministic scatter so toppings stay put between renders
  function seeded(seed) {
    let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  const REGION = {
    whole:  { x0: 80, x1: 230, y0: 80, y1: 134 },
    halves: { x0: 50, x1: 250, y0: 84, y1: 132 },
    slices: { x0: 45, x1: 255, y0: 84, y1: 134 },
    fries:  { x0: 75, x1: 225, y0: 76, y1: 140 },
    cubes:  { x0: 70, x1: 230, y0: 82, y1: 138 },
    mash:   { x0: 85, x1: 215, y0: 62, y1: 96 },
  };

  function toppingSVG(t, form, seedExtra) {
    const r = REGION[form], rnd = seeded(t + form + seedExtra);
    const at = () => [r.x0 + rnd() * (r.x1 - r.x0), r.y0 + rnd() * (r.y1 - r.y0)];
    let out = '';
    switch (t) {
      case 'butter': {
        const [x, y] = [(r.x0 + r.x1) / 2 - 16, r.y0 + 4];
        out = `<rect x="${x}" y="${y}" width="32" height="20" rx="4" fill="#ffd94a"/><path d="M${x + 4} ${y + 18} q0 10 6 12 q6 -2 4 -12" fill="#ffe46a" opacity=".9"/><rect x="${x + 4}" y="${y + 3}" width="22" height="5" rx="2" fill="#fff0a8"/>`;
        break; }
      case 'cinnamon': for (let i = 0; i < 18; i++) { const [x, y] = at(); out += `<circle cx="${x}" cy="${y}" r="${2 + rnd() * 1.5}" fill="#7a3b22"/>`; } break;
      case 'marshmallow': for (let i = 0; i < 6; i++) { const [x, y] = at(); out += `<g transform="rotate(${rnd() * 40 - 20} ${x} ${y})"><rect x="${x - 12}" y="${y - 9}" width="24" height="18" rx="6" fill="#fff" stroke="#ececf4" stroke-width="2"/><ellipse cx="${x}" cy="${y - 5}" rx="7" ry="2" fill="#f4f4fb"/></g>`; } break;
      case 'honey': {
        const y = (r.y0 + r.y1) / 2;
        out = `<path d="M${r.x0} ${y - 8} q25 18 50 0 t50 0 t50 0 t${(r.x1 - r.x0) - 150} 0" stroke="#ffb833" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"/><path d="M${r.x0 + 30} ${y + 2} q4 10 0 14 M${r.x1 - 40} ${y} q4 10 0 14" stroke="#ffb833" stroke-width="5" fill="none" stroke-linecap="round"/>`;
        break; }
      case 'cheese': for (let i = 0; i < 11; i++) { const [x, y] = at(); out += `<rect x="${x - 10}" y="${y - 3}" width="20" height="6" rx="3" fill="#ffd94a" transform="rotate(${rnd() * 180} ${x} ${y})"/>`; } break;
      case 'sprinkles': { const cols = ['#ff6b8a', '#ffd56a', '#7fc3a3', '#3bb0c9', '#b58cf2', '#ff9a3c']; for (let i = 0; i < 20; i++) { const [x, y] = at(); out += `<rect x="${x - 5}" y="${y - 1.8}" width="10" height="3.6" rx="1.8" fill="${cols[i % cols.length]}" transform="rotate(${rnd() * 180} ${x} ${y})"/>`; } break; }
    }
    return out;
  }

  function foodBody(food) {
    const c = COOK[food.cook];
    const form = food.form;
    let g = '';
    const spots = (n, box) => { const rnd = seeded('spots' + form); let s = ''; for (let i = 0; i < n; i++) s += `<ellipse cx="${box.x0 + rnd() * (box.x1 - box.x0)}" cy="${box.y0 + rnd() * (box.y1 - box.y0)}" rx="3" ry="2" fill="#000" opacity=".12"/>`; return s; };
    const gid = 'skin-' + food.cook;
    const skinGrad = `<defs><radialGradient id="${gid}" cx="38%" cy="32%" r="80%"><stop offset="0" stop-color="${c.skin}"/><stop offset="1" stop-color="${c.skinDark}"/></radialGradient></defs>`;
    const flecks = (n, x0, x1, y0, y1, seed) => { // crispy brown bits on fried / baked food
      if (!c.char) return ''; const rnd = seeded('char' + seed + form); let o = '';
      for (let i = 0; i < n; i++) { const fx = x0 + rnd() * (x1 - x0), fy = y0 + rnd() * (y1 - y0); o += `<rect x="${fx}" y="${fy}" width="${5 + rnd() * 7}" height="3" rx="1.5" fill="#6b2f12" opacity=".55" transform="rotate(${rnd() * 180} ${fx} ${fy})"/>`; }
      return o; };
    switch (form) {
      case 'whole': {
        g += skinGrad;
        g += `<path d="${SPINDLE}" fill="url(#${gid})"/>`;
        g += `<path d="M62 104 C 100 80, 150 74, 230 86 M64 130 C 110 144, 180 136, 244 104" stroke="${c.skinDark}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".35"/>`;
        g += `<path d="M70 102 C 96 84, 124 76, 156 76" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".3"/>`;
        g += spots(9, { x0: 70, x1: 240, y0: 80, y1: 142 });
        if (food.cook !== 'raw') g += `<path d="M94 94 C 130 74, 192 76, 228 90 C 198 106, 136 110, 94 94Z" fill="${c.inside}"/><path d="M110 92 c24 -10 68 -12 100 -4" stroke="${c.light}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>`;
        if (c.crisp) g += `<path d="${SPINDLE}" fill="none" stroke="${c.edge}" stroke-width="5" stroke-dasharray="12 10" opacity=".55"/>`;
        break; }
      case 'halves':
        g += skinGrad;
        [[-44, -6], [40, 6]].forEach(([dx, rot], i) => {
          g += `<g transform="translate(${dx} 0) rotate(${rot} 155 108) translate(155 108) scale(.78 .74) translate(-155 -108)">
            <path d="${SPINDLE}" fill="${c.inside}" stroke="url(#${gid})" stroke-width="12"/>
            <path d="${SPINDLE}" fill="none" stroke="${c.light}" stroke-width="3" opacity=".8" transform="translate(155 108) scale(.72) translate(-155 -108)"/>
            <ellipse cx="150" cy="108" rx="22" ry="10" fill="${c.edge}" opacity=".35"/>${flecks(5, 80, 230, 84, 132, 'h' + i)}</g>`;
        });
        break;
      case 'slices':
        [[56, 108, -8], [102, 118, 6], [150, 104, -4], [198, 118, 8], [244, 108, -6]].forEach(([x, y, a], i) => {
          const rnd = seeded('slice' + i); let mottle = '';
          for (let k = 0; k < 4; k++) mottle += `<ellipse cx="${x - 14 + rnd() * 28}" cy="${y - 14 + rnd() * 28}" rx="${5 + rnd() * 6}" ry="${3 + rnd() * 4}" fill="${c.light}" opacity=".55" transform="rotate(${rnd() * 180} ${x} ${y})"/>`;
          g += `<g transform="rotate(${a} ${x} ${y})"><circle cx="${x}" cy="${y}" r="32" fill="${c.inside}" stroke="${c.skin}" stroke-width="5"/>${mottle}<circle cx="${x}" cy="${y}" r="20" fill="none" stroke="${c.edge}" stroke-width="2" opacity=".35"/>${flecks(3, x - 24, x + 24, y - 24, y + 24, 's' + i)}</g>`;
        });
        break;
      case 'fries': {
        const fries = [[92, 118, -64], [114, 104, -48], [130, 98, -30], [150, 94, -12], [168, 96, 4], [186, 100, 20], [206, 110, 38], [222, 120, 56], [104, 124, -80], [140, 120, 72], [176, 124, -72], [160, 112, 86], [122, 112, 50]];
        fries.forEach(([x, y, a], i) => {
          const rnd = seeded('fry' + i); let bits = '';
          if (c.char) for (let k = 0; k < 3; k++) bits += `<rect x="${x - 7 + rnd() * 10}" y="${y - 44 + rnd() * 84}" width="4" height="${4 + rnd() * 8}" rx="2" fill="#6b2f12" opacity=".55"/>`;
          if (food.cook !== 'raw') for (let k = 0; k < 2; k++) bits += `<circle cx="${x - 5 + rnd() * 10}" cy="${y - 40 + rnd() * 80}" r="1.6" fill="#fff" opacity=".8"/>`;
          g += `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - 7}" y="${y - 50}" width="14" height="100" rx="4" fill="${c.inside}" stroke="${c.crisp || c.char ? c.edge : c.skin}" stroke-width="2.5"/><rect x="${x - 4}" y="${y - 44}" width="3" height="88" rx="1.5" fill="${c.light}" opacity=".7"/>${bits}</g>`;
        });
        break; }
      case 'cubes': {
        const rnd = seeded('cubes'); const cubes = [];
        for (let i = 0; i < 17; i++) cubes.push([82 + rnd() * 136, 86 + rnd() * 50, rnd() * 40 - 20, 22 + rnd() * 8]);
        cubes.sort((a, b) => a[1] - b[1]).forEach(([x, y, a, sz], i) => {
          g += `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - sz / 2}" y="${y - sz / 2}" width="${sz}" height="${sz}" rx="4" fill="${c.inside}" stroke="${c.edge}" stroke-width="2"/><rect x="${x - sz / 2 + 4}" y="${y - sz / 2 + 3}" width="${sz - 8}" height="4" rx="2" fill="${c.light}" opacity=".8"/>${flecks(2, x - sz / 2, x + sz / 2 - 8, y - sz / 2, y + sz / 2, 'c' + i)}</g>`;
        });
        break; }
      case 'mash':
        g += `<path d="M52 104 h196 c0 50 -40 76 -98 76 s-98 -26 -98 -76z" fill="#9fd1ea"/>`;
        g += `<path d="M72 104 c6 -34 36 -52 78 -52 s72 18 78 52z" fill="${c.inside}"/>`;
        g += `<path d="M86 98 c8 -18 26 -30 46 -34" stroke="${c.light}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`;
        g += `<path d="M120 80 q14 -14 28 0 q14 14 28 0" stroke="${c.edge}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>`;
        g += `<ellipse cx="150" cy="104" rx="98" ry="16" fill="#bfe3f3"/><ellipse cx="150" cy="104" rx="80" ry="10" fill="${c.inside}"/>`;
        g += `<path d="M90 104 c10 -8 30 -12 60 -12 s50 4 60 12" fill="${c.edge}" opacity=".25"/>`;
        break;
    }
    if (c.steam) g += `<g class="steam"><path d="M110 70 q-10 -14 0 -28 q10 -14 0 -28"/><path d="M150 62 q-10 -14 0 -28 q10 -14 0 -28"/><path d="M190 70 q-10 -14 0 -28 q10 -14 0 -28"/></g>`;
    if (c.spark) g += `<g><circle class="spark" cx="78" cy="70" r="5" fill="#ffd56a"/><circle class="spark" cx="150" cy="56" r="4" fill="#ffd56a"/><circle class="spark" cx="222" cy="70" r="5" fill="#ffd56a"/></g>`;
    if (c.drops) g += `<g opacity=".8"><circle cx="100" cy="150" r="4" fill="#bfe6ff"/><circle cx="160" cy="156" r="3" fill="#bfe6ff"/><circle cx="210" cy="150" r="4" fill="#bfe6ff"/></g>`;
    return g;
  }

  function foodSVG(food, { sticker = false } = {}) {
    const s = sticker ? 1 : Math.max(0, 1 - food.bites * 0.27);
    const toppings = sticker ? '' : food.toppings.map((t, i) => toppingSVG(t, food.form, String(i))).join('');
    return `<svg viewBox="${sticker ? '30 40 240 150' : '0 0 300 200'}" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(150 112) scale(${s}) translate(-150 -112)">${foodBody(food)}${toppings}</g>
    </svg>`;
  }

  /* ------------------------------------------------------------------ DOM refs */
  const el = {
    chars: $('#chars'), shelf: $('#shelf'), mute: $('#mute'),
    stage: $('#stage'), character: $('#character'), bubble: $('#bubble'),
    counter: $('#counter'), plate: $('#plate'), food: $('#food'), overlay: $('#overlay'), fridge: $('#fridge'),
    toppings: $('#toppings'), tools: $('#tools'), particles: $('#particles'),
  };

  /* ------------------------------------------------------------------ particles */
  function burst(target, kind, n = 10, spread = 90) {
    const r = target.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      p.className = 'p ' + kind;
      p.style.left = cx + rand(-r.width / 4, r.width / 4) + 'px';
      p.style.top = cy + rand(-r.height / 5, r.height / 5) + 'px';
      p.style.setProperty('--dx', rand(-spread, spread) + 'px');
      p.style.setProperty('--dy', rand(-spread, spread) + 'px');
      p.style.animationDelay = rand(0, .25) + 's';
      el.particles.appendChild(p);
      setTimeout(() => p.remove(), 1800);
    }
  }

  /* ------------------------------------------------------------------ rendering */
  function setMouth(state) {
    el.character.className = el.character.className.replace(/\bm-\w+/g, '').trim();
    el.character.classList.add('m-' + state);
  }
  function renderCharacter() {
    el.character.innerHTML = charSVG(CHARS[S.char]);
    setMouth('smile');
    [...el.chars.children].forEach((b, i) => b.classList.toggle('on', i === S.char));
  }
  function renderFood(anim) {
    if (!S.food) { el.food.innerHTML = ''; el.plate.classList.add('empty'); return; }
    el.plate.classList.remove('empty');
    el.food.innerHTML = foodSVG(S.food);
    if (anim) { el.food.classList.remove(anim); void el.food.offsetWidth; el.food.classList.add(anim); }
  }
  function renderShelf() {
    el.shelf.innerHTML = '';
    for (const key of S.stickers) {
      const [form, cook] = key.split('-');
      if (!COOK[cook] || !FORMS.includes(form)) continue;
      const d = document.createElement('div');
      d.className = 'sticker';
      d.innerHTML = foodSVG({ form, cook, toppings: [], bites: 0 }, { sticker: true });
      el.shelf.appendChild(d);
    }
    el.shelf.scrollLeft = el.shelf.scrollWidth;
  }
  function say(emoji, ms = 1400) {
    el.bubble.textContent = emoji;
    el.bubble.classList.remove('show'); void el.bubble.offsetWidth; el.bubble.classList.add('show');
    clearTimeout(say.t); say.t = setTimeout(() => el.bubble.classList.remove('show'), ms);
  }
  function flash(elm, cls, ms = 600) { elm.classList.remove(cls); void elm.offsetWidth; elm.classList.add(cls); setTimeout(() => elm.classList.remove(cls), ms); }

  let nudgeTimer;
  function scheduleNudge() {
    clearTimeout(nudgeTimer);
    el.fridge.classList.remove('nudge');
    if (!S.food) nudgeTimer = setTimeout(() => el.fridge.classList.add('nudge'), 5000);
  }

  /* ------------------------------------------------------------------ actions */
  async function spawnPotato() {
    if (S.busy) return;
    FX.init(); FX.play('pop');
    S.food = { form: 'whole', cook: 'raw', toppings: [], bites: 0 };
    renderFood('flyin');
    burst(el.fridge, 'star', 5, 60);
    setMouth('ooh'); setTimeout(() => setMouth('smile'), 700);
    scheduleNudge();
  }

  function needFood() {
    FX.play('boing');
    el.fridge.classList.add('nudge');
    flash(el.fridge, 'pressed', 400);
    say('🍠', 1200);
    setMouth('ooh'); setTimeout(() => setMouth('smile'), 900);
  }

  const TOOLS = [
    { id: 'knife', label: 'Chop', ms: 1500, sound: 'chop', run(f) {
        const next = { whole: 'halves', halves: 'slices', slices: 'fries', fries: 'cubes', cubes: 'cubes', mash: 'mash' }[f.form];
        f.form = next; f.bites = 0; } },
    { id: 'masher', label: 'Mash', ms: 1500, sound: 'mash', run(f) { f.form = 'mash'; f.bites = 0; } },
    { id: 'pot', label: 'Boil', ms: 1700, sound: 'bubble', run(f) { f.cook = 'boiled'; } },
    { id: 'pan', label: 'Fry', ms: 1700, sound: 'sizzle', run(f) { f.cook = 'fried'; } },
    { id: 'oven', label: 'Bake', ms: 1800, sound: 'hum', after: 'ding', run(f) { f.cook = 'baked'; } },
    { id: 'micro', label: 'Zap', ms: 1800, sound: 'hum', after: 'ding', run(f) { f.cook = 'micro'; } },
  ];
  const TOPPINGS = ['butter', 'cinnamon', 'marshmallow', 'honey', 'cheese', 'sprinkles'];

  async function useTool(tool, btn) {
    FX.init();
    if (S.busy) return;
    if (btn) flash(btn, 'pressed', 400);
    if (!S.food) { needFood(); return; }
    S.busy = true;
    FX.play(tool.sound);
    el.overlay.className = 'show ' + tool.id;
    el.overlay.innerHTML = `<div class="tool-big">${ICON[tool.id]}</div>`;
    if (tool.id === 'oven' || tool.id === 'micro') el.food.classList.add('hide');
    setMouth('ooh');
    const particleKind = { knife: 'crumb', masher: 'crumb', pot: 'bubble', pan: 'spark', oven: 'steam', micro: 'spark' }[tool.id];
    const pTimer = setInterval(() => burst(el.counter, particleKind, 3, 70), 220);
    await wait(tool.ms);
    clearInterval(pTimer);
    el.overlay.className = ''; el.overlay.innerHTML = '';
    tool.run(S.food);
    el.food.classList.remove('hide');
    renderFood('pop');
    if (tool.after) FX.play(tool.after); else FX.play('pop');
    burst(el.food, COOK[S.food.cook].steam ? 'steam' : 'star', 6, 60);
    setMouth('grin'); say(pick(['😍', '🤩', '😋']), 1000);
    setTimeout(() => setMouth('smile'), 1000);
    S.busy = false;
  }

  function addTopping(t, btn) {
    FX.init();
    if (S.busy) return;
    if (btn) flash(btn, 'pressed', 400);
    if (!S.food) { needFood(); return; }
    FX.play(t === 'honey' ? 'squish' : 'sprinkle');
    // tapping the same topping again adds another layer (more sprinkles!), up to 3
    const count = S.food.toppings.filter(x => x === t).length;
    if (count < 3) S.food.toppings.push(t); else FX.play('tap');
    renderFood();
    burst(el.food, t === 'marshmallow' || t === 'cheese' ? 'star' : 'spark', 8, 50);
    setMouth('grin'); setTimeout(() => setMouth('smile'), 600);
  }

  async function feed() {
    FX.init();
    if (S.busy) return;
    if (!S.food) {
      FX.play('hello'); flash(el.character, 'wiggle', 500);
      setMouth('ooh'); say('🍠', 1200); setTimeout(() => setMouth('smile'), 900);
      el.fridge.classList.add('nudge');
      return;
    }
    S.busy = true;
    const f = S.food;
    setMouth('open'); FX.play('swoosh');
    // food hops up to the mouth
    el.food.classList.remove('snap');
    el.food.style.transition = 'transform .45s cubic-bezier(.4,0,.6,1)';
    const fr = el.food.getBoundingClientRect(), cr = el.character.getBoundingClientRect();
    const dx = (cr.left + cr.width / 2) - (fr.left + fr.width / 2);
    const dy = (cr.top + cr.height * .72) - (fr.top + fr.height / 2);
    el.food.style.transform = `translate(-50%,-52%) translate(${dx}px, ${dy}px) scale(.45)`;
    await wait(450);
    FX.play('munch');
    f.bites++;
    el.food.style.transition = 'none';
    el.food.style.transform = '';
    requestAnimationFrame(() => { el.food.style.transition = ''; });
    setMouth('chew'); flash(el.character, 'chew', 800);
    burst(el.character, 'crumb', 5, 40);
    if (f.bites >= 3) {
      S.food = null; renderFood();
      await wait(700);
      const reaction = reactionFor(f);
      setMouth(reaction.mouth); say(reaction.emoji, 1800);
      FX.play(reaction.sound);
      flash(el.character, 'bounce', 700);
      burst(el.character, reaction.particle, 12, 110);
      const key = f.form + '-' + f.cook;
      if (!S.stickers.has(key)) {
        S.stickers.add(key); store.set('stickers', [...S.stickers]);
        renderShelf(); burst(el.shelf, 'star', 6, 40);
      }
      await wait(1300);
      setMouth('smile');
      scheduleNudge();
    } else {
      renderFood('pop');
      await wait(750);
      setMouth('grin'); say(pick(['😋', '🤤', '😄']), 900);
      FX.play('yum');
      flash(el.character, 'bounce', 700);
      await wait(700);
      setMouth('smile');
    }
    S.busy = false;
  }

  function reactionFor(f) {
    const sweet = f.toppings.some(t => ['marshmallow', 'honey', 'sprinkles'].includes(t));
    if (sweet) return { mouth: 'grin', emoji: '❤️', sound: 'hooray', particle: 'heart' };
    if (f.cook === 'raw') return { mouth: 'silly', emoji: '😆', sound: 'yum', particle: 'star' };
    if (f.toppings.length >= 3) return { mouth: 'grin', emoji: '🤩', sound: 'hooray', particle: 'heart' };
    return { mouth: 'grin', emoji: pick(['😋', '🥰', '⭐']), sound: 'hooray', particle: pick(['heart', 'star']) };
  }

  /* ------------------------------------------------------------------ drag the food onto a tool or the hungry friend */
  (function dragSetup() {
    let drag = null;
    const hotTargets = () => [...document.querySelectorAll('.tool, .topping'), el.character];
    const targetAt = (x, y) => {
      el.food.style.visibility = 'hidden';
      const hit = document.elementFromPoint(x, y);
      el.food.style.visibility = '';
      if (!hit) return null;
      return hit.closest('.tool, .topping, #character');
    };
    el.food.addEventListener('pointerdown', (e) => {
      if (!S.food || S.busy) return;
      FX.init();
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false };
      el.food.setPointerCapture(e.pointerId);
      el.food.classList.remove('snap', 'pop', 'flyin');
    });
    el.food.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) > 8) { drag.moved = true; el.food.classList.add('dragging'); }
      if (!drag.moved) return;
      el.food.style.transform = `translate(-50%,-52%) translate(${dx}px, ${dy}px) scale(.8)`;
      const t = targetAt(e.clientX, e.clientY);
      hotTargets().forEach(h => h.classList.toggle('hot', h === t && h !== el.character));
      el.character.classList.toggle('drop-target', t === el.character);
      if (t === el.character) { if (!el.character.classList.contains('m-open')) setMouth('open'); }
      else if (el.character.classList.contains('m-open')) setMouth('smile');
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const wasMoved = drag.moved; drag = null;
      el.food.classList.remove('dragging');
      hotTargets().forEach(h => h.classList.remove('hot'));
      el.character.classList.remove('drop-target');
      const t = wasMoved ? targetAt(e.clientX, e.clientY) : null;
      el.food.classList.add('snap'); el.food.style.transform = '';
      if (!wasMoved) { // a simple tap on the food = a happy little jiggle
        FX.play('tap'); flash(el.food, 'shake', 400); return;
      }
      if (t === el.character) feed();
      else if (t && t.dataset.tool) useTool(TOOLS.find(x => x.id === t.dataset.tool), t);
      else if (t && t.dataset.topping) addTopping(t.dataset.topping, t);
      else { setMouth('smile'); FX.play('tap'); }
    };
    el.food.addEventListener('pointerup', end);
    el.food.addEventListener('pointercancel', end);
  })();

  /* ------------------------------------------------------------------ build UI */
  function build() {
    CHARS.forEach((c, i) => {
      const b = document.createElement('button');
      b.innerHTML = charSVG(c); b.setAttribute('aria-label', c.name);
      b.addEventListener('click', () => { FX.init(); S.char = i; store.set('char', i); renderCharacter(); FX.play('hello'); flash(el.character, 'bounce', 700); say('👋', 900); });
      el.chars.appendChild(b);
    });
    TOOLS.forEach(t => {
      const b = document.createElement('button');
      b.className = 'tool'; b.dataset.tool = t.id; b.setAttribute('aria-label', t.label);
      b.innerHTML = ICON[t.id];
      b.addEventListener('click', () => useTool(t, b));
      el.tools.appendChild(b);
    });
    TOPPINGS.forEach(t => {
      const b = document.createElement('button');
      b.className = 'topping'; b.dataset.topping = t; b.setAttribute('aria-label', t);
      b.innerHTML = ICON[t];
      b.addEventListener('click', () => addTopping(t, b));
      el.toppings.appendChild(b);
    });
    el.fridge.addEventListener('click', spawnPotato);
    el.character.addEventListener('click', feed);
    el.mute.classList.toggle('muted', S.muted);
    el.mute.addEventListener('click', () => {
      S.muted = !S.muted; store.set('muted', S.muted);
      el.mute.classList.toggle('muted', S.muted);
      if (!S.muted) { FX.init(); FX.play('tap'); }
    });
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('pointerdown', () => FX.init(), { passive: true });
    // keep iOS from zooming on quick double taps
    let lastTouch = 0;
    document.addEventListener('touchend', (e) => { const now = Date.now(); if (now - lastTouch < 350) e.preventDefault(); lastTouch = now; }, { passive: false });

    renderCharacter(); renderFood(); renderShelf(); scheduleNudge();
  }
  build();
})();
