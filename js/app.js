(function () {
'use strict';

/* ================= utilities ================= */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const dstr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dstr(new Date());
const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return dstr(new Date(y, m - 1, d + n)); };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const dayNum = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
const norm = s => String(s).replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase()
  .replace(/[.,!?¿¡;:"“”'’()—–\-]/g, ' ').replace(/\s+/g, ' ').trim();
const flat = s => norm(s).replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/â/g,'a');
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
const similarity = (a, b) => { a = flat(a); b = flat(b); return 1 - lev(a, b) / Math.max(a.length, b.length, 1); };
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= data ================= */
const ALL = [];
const BYKEY = {};
WORDS.forEach(cat => cat.words.forEach(w => {
  const o = { key: cat.id + ':' + w[0], cat: cat.id, tr: w[0], ja: w[1], ex: w[2] || '', exJa: w[3] || '', note: w[4] || '' };
  ALL.push(o); BYKEY[o.key] = o;
}));
const CAT = Object.fromEntries(WORDS.map(c => [c.id, c]));
const TILE = [
  ['#FFD6A5', '#FFADAD'], ['#B9F3E4', '#9BD8FF'], ['#D7C6FF', '#FFC6F0'], ['#FFF1A8', '#FFD6A5'],
  ['#C8F7C5', '#A8E6CF'], ['#FFC6D9', '#FFADAD'], ['#A0C4FF', '#BDB2FF'], ['#FFE5B4', '#FFC09F'],
];
const tileBg = i => { const [a, b] = TILE[i % TILE.length]; return `linear-gradient(140deg, ${a}, ${b})`; };
const UNITS = [
  [0, 'UNIT 1', 'はじめの一歩', 'トルコ語の基本ルール'],
  [5, 'UNIT 2', '文をつくろう', '複数・質問・否定・所有'],
  [11, 'UNIT 3', '語尾マスター', 'で・へ・から・現在形'],
  [17, 'UNIT 4', 'いろいろな表現', '過去・未来・願望・お願い'],
];
const LEVELS = [
  [0, 'Yeni', 'はじめの一歩'], [60, 'Çaylak', '見習い'], [150, 'Öğrenci', '学生'],
  [300, 'Meraklı', '好奇心いっぱい'], [500, 'Gezgin', '旅人'], [800, 'Konuşkan', 'おしゃべり'],
  [1200, 'Usta', '達人'], [1800, 'İstanbullu', 'イスタンブールっ子'], [2600, 'Türkçe Aşığı', 'トルコ語ラバー'],
  [3600, 'Efsane', '伝説'],
];
const THEMES = { iznik: ['イズニック', '#1F4E9C', 'linear-gradient(135deg,#1F4E9C,#17A398)'], sakura: ['サクラ', '#D6457B', 'linear-gradient(135deg,#F06C9B,#9B5DE5)'], gece: ['夜のイスタンブール', '#0F1530', 'linear-gradient(135deg,#0F1530,#5B3A9E)'] };
const CHEERS = [['Miyav!', 'にゃー!'], ['Harika!', 'すごい!'], ['Aferin!', 'えらい!'], ['Devam et!', 'その調子!'], ['Sen yapabilirsin!', 'あなたならできる!'], ['Çok güzel!', 'とってもいいね!'], ['Yavaş yavaş', 'ゆっくりでいいよ'], ['Seni seviyorum!', 'だいすき!']];

/* ================= state ================= */
const KEY = 'merhaba-tr-v1';
const DEFAULT = {
  srs: {}, newDay: { date: '', n: 0 }, grammar: {}, dialogs: {},
  streak: { last: '', n: 0, best: 0 }, xp: 0, log: {}, badges: {}, flags: {},
  day: { date: '', g: false, d: false, bonus: false }, welcomed: false,
  settings: { daily: 10, kana: true, name: '', theme: 'iznik', speed: 1, autoplay: true }
};
let st;
function load() {
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { st = {}; }
  const fresh = !st.srs;
  st = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT)), st);
  st.settings = Object.assign({}, DEFAULT.settings, st.settings);
  if (!fresh && st.welcomed === false && Object.keys(st.srs).length) st.welcomed = true;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
load();
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

function applyTheme() {
  const t = THEMES[st.settings.theme] ? st.settings.theme : 'iznik';
  document.documentElement.dataset.theme = t;
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = THEMES[t][1];
}
applyTheme();

const streakNow = () => (st.streak.last === today() || st.streak.last === addDays(today(), -1)) ? st.streak.n : 0;
const newToday = () => st.newDay.date === today() ? st.newDay.n : 0;
const dueKeys = () => { const t = today(); return Object.keys(st.srs).filter(k => BYKEY[k] && st.srs[k].d <= t); };
const learnedCount = () => Object.keys(st.srs).filter(k => BYKEY[k]).length;
const masterCount = () => Object.values(st.srs).filter(s => s.i >= 21).length;
const wordStatus = k => { const s = st.srs[k]; return !s ? 'new' : s.i >= 21 ? 'master' : 'learning'; };
const grammarDone = () => GRAMMAR.filter(g => (st.grammar[g.id] || {}).done).length;
const DAILY_GOAL = 50;
const nameFix = s => st.settings.name ? s.replace(/Hana/g, st.settings.name).replace(/ハナ/g, st.settings.name) : s;
const kana = t => st.settings.kana ? `<div class="kana">${esc(toKana(t))}</div>` : '';

/* ================= audio (pre-generated neural voice mp3s) ================= */
const player = new Audio();
player.preload = 'auto';
let playToken = 0;
function play(text, voice = 'e', onend) {
  const token = ++playToken;
  const done = () => { if (token === playToken && onend) onend(); };
  try { player.pause(); } catch (e) {}
  player.src = AUDIO.file(text, voice);
  player.playbackRate = st.settings.speed || 1;
  player.preservesPitch = true; player.webkitPreservesPitch = true;
  player.onended = done;
  player.onerror = done;
  const p = player.play();
  if (p && p.catch) p.catch(done);
}
function stopAudio() {
  playToken++;
  try { player.pause(); } catch (e) {}
  document.querySelectorAll('.playing').forEach(b => b.classList.remove('playing'));
}
const sayBtn = (text, voice = 'e', cls = '') => `<button class="say ${cls}" data-act="say" data-say="${esc(text)}" data-v="${voice}" aria-label="再生">🔊</button>`;
const autoPlay = (text, voice) => { if (st.settings.autoplay) play(text, voice); };
const todoCounts = () => {
  const due = dueKeys().length;
  const nNew = Math.min(Math.max(0, st.settings.daily - newToday()), ALL.filter(w => !st.srs[w.key]).length);
  return { due, nNew, todo: due + nNew };
};
function ensureDay() { if (st.day.date !== today()) st.day = { date: today(), g: false, d: false, bonus: false }; }

function levelInfo(xp) {
  let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  if (i < LEVELS.length - 1) return { lv: i + 1, tr: LEVELS[i][1], ja: LEVELS[i][2], from: LEVELS[i][0], to: LEVELS[i + 1][0] };
  const base = LEVELS[i][0], k = Math.floor((xp - base) / 1200);
  return { lv: i + 1 + k, tr: LEVELS[i][1], ja: LEVELS[i][2], from: base + k * 1200, to: base + (k + 1) * 1200 };
}

/* ================= badges ================= */
const BADGES = [
  ['first', '🌱', 'はじめの一歩', () => learnedCount() >= 1],
  ['w50', '📚', '50語', () => learnedCount() >= 50],
  ['w100', '💯', '100語', () => learnedCount() >= 100],
  ['w250', '🏅', '250語', () => learnedCount() >= 250],
  ['m10', '💎', '10語マスター', () => masterCount() >= 10],
  ['s3', '🔥', '3日連続', () => st.streak.best >= 3],
  ['s7', '🗓️', '1週間連続', () => st.streak.best >= 7],
  ['s30', '👑', '30日連続', () => st.streak.best >= 30],
  ['g1', '📘', '文法デビュー', () => grammarDone() >= 1],
  ['gall', '🎓', '文法マスター', () => grammarDone() >= GRAMMAR.length],
  ['d1', '💬', 'はじめての会話', () => Object.keys(st.dialogs).length >= 1],
  ['dall', '🗣️', '会話の達人', () => DIALOGS.every(d => st.dialogs[d.id])],
  ['perfect', '🏆', 'パーフェクト', () => !!st.flags.perfect],
  ['mission', '⭐', '完璧な一日', () => !!st.flags.mission],
  ['lv5', '🧿', 'レベル5', () => levelInfo(st.xp).lv >= 5],
  ['lv10', '🕌', 'レベル10', () => levelInfo(st.xp).lv >= 10],
];
function checkBadges() {
  for (const [id, ic, name, test] of BADGES) {
    if (!st.badges[id] && test()) {
      st.badges[id] = today(); save();
      modal(`<div class="bdg" style="margin:4px 0 10px"><div class="medal" style="width:96px;height:96px;font-size:48px">${ic}</div></div>
        <div class="label">NEW BADGE</div><h2 style="justify-content:center;margin:4px 0">${esc(name)}</h2><p class="muted small">バッジを獲得しました!</p>`, true);
    }
  }
}

function gainXP(n) {
  const t = today(), before = levelInfo(st.xp).lv;
  st.xp += n;
  st.log[t] = (st.log[t] || 0) + n;
  if (st.streak.last !== t) {
    st.streak.n = st.streak.last === addDays(t, -1) ? st.streak.n + 1 : 1;
    st.streak.last = t;
    st.streak.best = Math.max(st.streak.best, st.streak.n);
  }
  save();
  const L = levelInfo(st.xp);
  if (L.lv > before) {
    modal(`${catSVG('wow', '')}<div class="label">LEVEL UP!</div><h1 style="margin:2px 0">Lv.${L.lv}</h1>
      <p><span class="tr" style="font-size:20px;color:var(--primary)">${esc(L.tr)}</span><br><b>${esc(L.ja)}</b></p><p class="muted small">Tebrikler! レベルアップおめでとう!</p>`, true);
  }
  checkBadges();
}
function checkMissions() {
  ensureDay();
  if (!st.day.bonus && st.day.g && st.day.d && todoCounts().todo === 0) {
    st.day.bonus = true; st.flags.mission = true; save();
    modal(`${catSVG('happy', '')}<div class="label">DAILY MISSION</div><h2 style="justify-content:center;margin:4px 0">今日のミッション達成!</h2>
      <p class="muted">単語・文法・会話ぜんぶクリア!<br><span class="tr" style="color:var(--primary)">Harikasın!</span></p><div class="xp-pill">+20 XP</div>`, true);
    gainXP(20);
  }
}

/* ================= mascot ================= */
function catSVG(mood = 'normal', cls = 'bob') {
  const ink = '#3B2F4A';
  const eyes = mood === 'happy'
    ? `<path d="M37 65q7-9 14 0M69 65q7-9 14 0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : mood === 'wow'
      ? `<circle cx="44" cy="63" r="8" fill="${ink}"/><circle cx="76" cy="63" r="8" fill="${ink}"/><circle cx="47" cy="59" r="3" fill="#fff"/><circle cx="79" cy="59" r="3" fill="#fff"/><circle cx="41" cy="66" r="1.5" fill="#fff"/><circle cx="73" cy="66" r="1.5" fill="#fff"/>`
      : `<ellipse cx="44" cy="64" rx="5.5" ry="7" fill="${ink}"/><ellipse cx="76" cy="64" rx="5.5" ry="7" fill="${ink}"/><circle cx="46" cy="61" r="2" fill="#fff"/><circle cx="78" cy="61" r="2" fill="#fff"/>`;
  const mouth = mood === 'wow'
    ? `<ellipse cx="60" cy="85" rx="5" ry="6" fill="#7A2E46"/>`
    : `<path d="M60 79q-4 7-10 3M60 79q4 7 10 3" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  return `<svg class="cat ${cls}" data-act="pet" viewBox="0 0 120 120" role="img" aria-label="Pamuk">
    <ellipse cx="60" cy="112" rx="34" ry="5" fill="#000" opacity=".08"/>
    <path d="M20 58L25 15L54 38Z" fill="#fff" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M27 45L29 26L44 37Z" fill="#FFB3C1"/>
    <path d="M100 58L95 15L66 38Z" fill="#fff" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="60" cy="70" rx="46" ry="40" fill="#fff" stroke="${ink}" stroke-width="3"/>
    <path d="M24 60q6-18 24-20q-4 14-24 20z" fill="#F7C08A"/>
    <ellipse cx="38" cy="106" rx="11" ry="7" fill="#fff" stroke="${ink}" stroke-width="3"/>
    <ellipse cx="82" cy="106" rx="11" ry="7" fill="#fff" stroke="${ink}" stroke-width="3"/>
    <g transform="rotate(14 74 26)"><path d="M59 35L89 35L84 9L64 9Z" fill="#D7263D" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M74 9q15 3 12 22" stroke="${ink}" stroke-width="2" fill="none"/><circle cx="86" cy="32" r="4" fill="#F0A23B" stroke="${ink}" stroke-width="1.6"/></g>
    ${eyes}
    <ellipse cx="34" cy="80" rx="7" ry="4.5" fill="#FF9FB2" opacity=".65"/><ellipse cx="86" cy="80" rx="7" ry="4.5" fill="#FF9FB2" opacity=".65"/>
    <path d="M56 73h8l-4 5z" fill="#FF7A93"/>${mouth}
    <path d="M22 76L6 72M22 83L6 85M98 76L114 72M98 83L114 85" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

/* ================= toast / modal / confetti ================= */
let toastT;
function toast(msg, ms = 2200) {
  const t = $('#toast'); t.innerHTML = esc(msg).replace(/\n/g, '<br>'); t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
}
const modalQ = [];
function modal(html, party = false, btn = 'OK!') {
  modalQ.push({ html, party, btn });
  if (modalQ.length === 1) showNextModal();
}
function showNextModal() {
  const m = modalQ[0], el = $('#modal');
  if (!m) { el.classList.remove('show'); return; }
  el.innerHTML = `<div class="box">${m.html}<button class="btn btn-main btn-block btn-lg" style="margin-top:16px" data-act="modal-close">${m.btn}</button></div>`;
  el.classList.add('show');
  if (m.party) confetti();
}
let confettiOn = false;
function confetti(n = 150) {
  if (reduceMotion() || confettiOn) return;
  confettiOn = true;
  const c = document.createElement('canvas'); c.id = 'confetti'; document.body.appendChild(c);
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight;
  c.width = W * dpr; c.height = H * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr);
  const cols = ['#E2483D', '#F0A23B', '#17A398', '#1F4E9C', '#F06C9B', '#FFD36E', '#9B5DE5'];
  const P = Array.from({ length: n }, () => ({
    x: W / 2 + (Math.random() - .5) * W * .3, y: H * .38, vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 5,
    w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .35,
    c: cols[Math.random() * cols.length | 0], round: Math.random() < .3,
  }));
  let f = 0;
  (function tick() {
    x.clearRect(0, 0, W, H);
    for (const p of P) {
      p.vy += .38; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.globalAlpha = Math.max(0, 1 - f / 170);
      if (p.round) { x.beginPath(); x.arc(0, 0, p.w / 2, 0, 7); x.fill(); } else x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r)));
      x.restore();
    }
    if (++f < 170) requestAnimationFrame(tick); else { c.remove(); confettiOn = false; }
  })();
}

/* ================= SRS ================= */
function rate(key, r) {
  const s = st.srs[key] || { i: 0, e: 2.5, d: today(), r: 0, l: 0 };
  if (r === 0) { s.l++; s.i = 0; s.e = Math.max(1.3, s.e - .2); }
  else if (r === 1) { s.i = Math.max(1, Math.round(s.i * 1.2)); s.e = Math.max(1.3, s.e - .15); }
  else if (r === 2) { s.i = s.i === 0 ? 1 : s.i === 1 ? 3 : Math.round(s.i * s.e); }
  else { s.i = s.i === 0 ? 3 : Math.round(s.i * s.e * 1.3); s.e += .15; }
  s.r++; s.d = addDays(today(), s.i);
  st.srs[key] = s; save();
}
function introduce(key) {
  if (!st.srs[key]) st.srs[key] = { i: 0, e: 2.5, d: today(), r: 0, l: 0 };
  if (st.newDay.date !== today()) st.newDay = { date: today(), n: 0 };
  st.newDay.n++; save();
}

/* ================= flashcard session ================= */
let S = null;   // current flashcard session
let Q = null;   // current quiz

function startDaily(extra = 0) {
  const due = shuffle(dueKeys()).slice(0, 60);
  const nNew = Math.max(0, st.settings.daily - newToday()) + extra;
  const fresh = ALL.filter(w => !st.srs[w.key]).slice(0, nNew).map(w => w.key);
  const queue = [...due.map(k => ({ key: k, mode: 'review', dir: dirFor(k) })), ...fresh.map(k => ({ key: k, mode: 'new' }))];
  if (!queue.length) { toast('今日の学習はすべて完了です 🎉'); return; }
  S = { queue, idx: 0, shown: false, xp: 0, newN: fresh.length, revN: due.length };
  go('#/study');
}
function startCategory(id) {
  const ws = CAT[id].words.map(w => id + ':' + w[0]);
  const fresh = ws.filter(k => !st.srs[k]), seen = shuffle(ws.filter(k => st.srs[k]));
  const queue = [...fresh.map(k => ({ key: k, mode: 'new' })), ...seen.map(k => ({ key: k, mode: 'review', dir: dirFor(k) }))];
  S = { queue, idx: 0, shown: false, xp: 0, newN: fresh.length, revN: seen.length };
  go('#/study');
}
function dirFor(k) { const s = st.srs[k]; return s && s.r >= 2 && Math.random() < .35 ? 'ja' : 'tr'; }
const sessionTop = (i, n, extra = '') => `<div class="session-top"><button class="close-btn" data-act="quit" aria-label="閉じる">✕</button>
  <div class="bar"><i style="width:${Math.max(4, Math.round(i / n * 100))}%"></i></div>${extra}<span class="small muted" style="font-weight:800">${i + 1}/${n}</span></div>`;

function viewStudy() {
  if (!S) return go('#/', true);
  if (S.idx >= S.queue.length) return studyDone();
  const it = S.queue[S.idx], w = BYKEY[it.key];
  const top = sessionTop(S.idx, S.queue.length);
  const example = w.ex ? `<div class="divider"></div><div class="example row"><div class="grow"><div class="tr">${esc(w.ex)}</div>${kana(w.ex)}<div class="small muted">${esc(w.exJa)}</div></div>${sayBtn(w.ex, 'e', 'sm')}</div>` : '';
  const note = w.note ? `<div class="note">💡 ${esc(w.note)}</div>` : '';
  const trBlock = `<div class="big tr">${esc(w.tr)}</div>${kana(w.tr)}<div class="say-row">${sayBtn(w.tr)}</div>`;
  const catLabel = `<span class="small muted" style="font-weight:700">${esc(CAT[w.cat].icon + ' ' + CAT[w.cat].name)}</span>`;
  let html;
  if (it.mode === 'new') {
    html = `${top}<div class="flash pop"><div><span class="badge">NEW ✨</span> ${catLabel}</div>
      ${trBlock}<div class="mean">${esc(w.ja)}</div>${note}${example}</div>
      <button class="btn btn-main btn-block btn-lg" style="margin-top:18px" data-act="learned">覚えた!次へ →</button>`;
  } else if (!S.shown) {
    const front = it.dir === 'ja'
      ? `<div class="label">トルコ語で言うと?</div><div class="big ja">${esc(w.ja)}</div>`
      : `<div class="label">意味は?</div>${trBlock}`;
    html = `${top}<div class="flash pop">${front}</div>
      <button class="btn btn-alt btn-block btn-lg" style="margin-top:18px" data-act="reveal">答えを見る 👀</button>`;
  } else {
    html = `${top}<div class="flash flip">${trBlock}<div class="mean">${esc(w.ja)}</div>${note}${example}</div>
      <div class="rate">
        <button class="r-again" data-act="rate" data-arg="0">もう一度<small>忘れた</small></button>
        <button class="r-hard" data-act="rate" data-arg="1">難しい<small>${ivl(it.key, 1)}</small></button>
        <button class="r-good" data-act="rate" data-arg="2">正解<small>${ivl(it.key, 2)}</small></button>
        <button class="r-easy" data-act="rate" data-arg="3">簡単<small>${ivl(it.key, 3)}</small></button>
      </div>`;
  }
  render(html, true);
  if (it.mode === 'new' || (it.dir !== 'ja' && !S.shown) || (it.dir === 'ja' && S.shown)) autoPlay(w.tr);
}
function ivl(key, r) {
  const s = st.srs[key] || { i: 0, e: 2.5 };
  const i = r === 1 ? Math.max(1, Math.round(s.i * 1.2)) : r === 2 ? (s.i === 0 ? 1 : s.i === 1 ? 3 : Math.round(s.i * s.e)) : (s.i === 0 ? 3 : Math.round(s.i * s.e * 1.3));
  return i < 30 ? `${i}日後` : i < 365 ? `${Math.round(i / 30)}か月後` : `${(i / 365).toFixed(1)}年後`;
}
function studyDone() {
  const big = S.xp >= 30;
  const more = ALL.some(w => !st.srs[w.key]);
  render(`<div class="done-screen pop">${catSVG('happy')}<h1 class="tr" style="color:var(--primary)">${big ? 'Harika!' : 'Aferin!'}</h1>
    <p style="font-weight:800;margin-top:0">${big ? 'すばらしい!' : 'よくできました!'}</p>
    <p class="muted">新しい単語 ${S.newN} ・ 復習 ${S.revN}</p><div class="xp-pill">⭐ +${S.xp} XP</div></div>
    <div class="stack" style="margin-top:18px"><button class="btn btn-main btn-block btn-lg" data-act="home">ホームへ</button>
    ${more ? `<button class="btn btn-block" data-act="daily-more">もう5語覚える</button>` : ''}
    <button class="btn btn-block" data-act="quiz-learned">🎯 クイズで確認する</button></div>`, true);
  S = null;
  confetti();
  checkMissions();
}

/* ================= word quiz ================= */
const QTYPES = { tr2ja: ['🇹🇷→🇯🇵', 'トルコ語 → 日本語'], ja2tr: ['🇯🇵→🇹🇷', '日本語 → トルコ語'], listen: ['🎧', '聞き取り'], type: ['⌨️', '書き取り'], mix: ['🎲', 'ミックス'] };
function startQuiz(pool, type, title) {
  if (pool.length < 4) { toast('まず単語を4つ以上覚えましょう 🐾'); return; }
  const items = pick(pool, Math.min(10, pool.length)).map(w => {
    const t = type === 'mix' ? pick(['tr2ja', 'ja2tr', 'listen', 'type'], 1)[0] : type;
    return { w, t, choices: t === 'type' ? null : makeChoices(w, t) };
  });
  Q = { kind: 'word', title, items, idx: 0, ok: 0, combo: 0, answered: null, missed: [] };
  go('#/quiz');
}
function makeChoices(w, t) {
  const field = t === 'ja2tr' ? 'tr' : 'ja';
  const same = shuffle(ALL.filter(x => x.cat === w.cat && x[field] !== w[field]));
  const others = shuffle(ALL.filter(x => x.cat !== w.cat && x[field] !== w[field]));
  const out = [w[field]];
  for (const x of [...same, ...others]) { if (out.length >= 4) break; if (!out.includes(x[field])) out.push(x[field]); }
  return shuffle(out);
}
const comboTag = () => Q.combo >= 2 ? `<span class="combo">🔥${Q.combo}連続</span>` : '';
function viewQuiz() {
  if (!Q) return go('#/', true);
  if (Q.idx >= Q.items.length) return quizDone();
  const top = sessionTop(Q.idx, Q.items.length, comboTag());
  if (Q.kind === 'grammar') return viewGQuiz(top);
  const it = Q.items[Q.idx], w = it.w, a = Q.answered;
  const prompt = it.t === 'tr2ja'
    ? `<div class="label">意味はどれ?</div><div class="big tr">${esc(w.tr)}</div>${kana(w.tr)}<div class="say-row">${sayBtn(w.tr)}</div>`
    : it.t === 'listen'
      ? `<div class="label">聞こえた言葉の意味は?</div><div class="say-row"><button class="say huge" data-act="say" data-say="${esc(w.tr)}" data-v="e">🔊</button></div>${a ? `<div class="big tr">${esc(w.tr)}</div>` : '<div class="small muted">タップでもう一度</div>'}`
      : `<div class="label">トルコ語で言うと?</div><div class="big ja">${esc(w.ja)}</div>`;
  let body;
  if (it.t === 'type') {
    body = a ? '' : `<input type="text" id="typed" class="tr" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="トルコ語を入力">
      <div class="keys">${['ç','ğ','ı','İ','ö','ş','ü'].map(k => `<button data-act="key" data-arg="${k}">${k}</button>`).join('')}</div>
      <div class="row"><button class="btn grow" data-act="type-skip">わからない</button><button class="btn btn-main grow" data-act="type-check">答え合わせ</button></div>`;
  } else {
    const correct = it.t === 'ja2tr' ? w.tr : w.ja;
    body = `<div class="choices">${it.choices.map((c, i) => {
      let cls = '';
      if (a) { if (c === correct) cls = 'right'; else if (i === a.pick) cls = 'wrong'; }
      return `<button class="choice ${cls} ${it.t === 'ja2tr' ? 'tr' : ''}" data-act="answer" data-arg="${i}" ${a ? 'disabled' : ''}>${esc(c)}</button>`;
    }).join('')}</div>`;
  }
  let fb = '';
  if (a) {
    fb = `<div class="feedback ${a.ok ? 'ok' : 'ng'} pop"><b>${a.ok ? (a.close ? '⭕ 正解!(つづりに注意)' : pick(['⭕ 正解! Harika!', '⭕ 正解! Aferin!', '⭕ 正解! Süper!'], 1)[0]) : '❌ 残念… つぎは大丈夫!'}</b>
      <div class="row" style="margin-top:6px"><div class="grow"><span class="tr">${esc(w.tr)}</span> <span class="ja">= ${esc(w.ja)}</span>${a.typed ? `<div class="small">あなたの答え:${esc(a.typed)}</div>` : ''}</div>${sayBtn(w.tr, 'e', 'sm')}</div></div>
      <button class="btn btn-main btn-block btn-lg" style="margin-top:14px" data-act="next">次へ →</button>`;
  }
  render(`${top}<div class="card q-prompt pop">${prompt}</div>${body}${fb}`, true);
  if (!a && it.t === 'type') setTimeout(() => { const i = $('#typed'); i && i.focus(); }, 100);
  if (!a && it.t === 'listen') play(w.tr);
  else if (!a && it.t === 'tr2ja') autoPlay(w.tr);
  else if (a && it.t !== 'listen' && it.t !== 'tr2ja') autoPlay(w.tr);
}
function scoreAnswer(ok) {
  if (ok) { Q.ok++; Q.combo++; if (Q.combo === 5 || Q.combo === 10) confetti(70); } else Q.combo = 0;
}
function answerWord(ok, extra = {}) {
  const it = Q.items[Q.idx];
  Q.answered = Object.assign({ ok }, extra);
  scoreAnswer(ok);
  if (ok) gainXP(3); else { Q.missed.push(it.w); if (st.srs[it.w.key]) { st.srs[it.w.key].d = today(); save(); } }
  viewQuiz();
}
function quizDone() {
  const n = Q.items.length, ok = Q.ok, r = ok / n;
  let extra = '';
  if (r === 1 && n >= 3) { st.flags.perfect = true; save(); }
  if (Q.kind === 'grammar') {
    const g = GRAMMAR.find(x => x.id === Q.gid);
    const prev = st.grammar[Q.gid] || {};
    const pass = r >= .6;
    st.grammar[Q.gid] = { done: prev.done || pass, best: Math.max(prev.best || 0, Math.round(r * 100)) };
    if (pass) { ensureDay(); st.day.g = true; }
    save();
    if (pass && !prev.done) gainXP(20);
    const nx = GRAMMAR[GRAMMAR.indexOf(g) + 1];
    extra = pass
      ? (nx ? `<a class="btn btn-main btn-block btn-lg" href="#/grammar/${nx.id}">次のレッスンへ →</a>` : '')
      : `<a class="btn btn-main btn-block btn-lg" href="#/grammar/${g.id}">レッスンを復習する</a>`;
  } else if (Q.missed.length) {
    extra = `<div class="card"><h3>📝 復習しよう</h3>${Q.missed.map(w => `<div class="word-row"><div class="grow"><span class="tr" style="color:var(--primary)">${esc(w.tr)}</span><div class="small muted">${esc(w.ja)}</div></div>${sayBtn(w.tr, 'e', 'sm')}</div>`).join('')}</div>`;
  }
  const msg = r === 1 ? ['Mükemmel!', '完璧です!'] : r >= .6 ? ['Aferin!', 'よくできました'] : ['Devam!', 'この調子で続けよう'];
  render(`<div class="done-screen pop">${catSVG(r >= .6 ? 'happy' : 'normal')}<h1>${ok} / ${n} 正解</h1>
    <p><span class="tr" style="color:var(--primary);font-size:20px">${msg[0]}</span> <b>${msg[1]}</b></p></div>
    <div class="stack">${extra}<button class="btn btn-block" data-act="home">ホームへ</button></div>`, true);
  Q = null;
  if (r >= .7) confetti();
  checkBadges();
  checkMissions();
}

/* ================= grammar quiz ================= */
function startGQuiz(id) {
  const g = GRAMMAR.find(x => x.id === id);
  const items = shuffle(g.quiz).map(q => ({ q: q[0], correct: q[1][0], choices: shuffle(q[1]), e: q[2] }));
  Q = { kind: 'grammar', gid: id, title: g.title, items, idx: 0, ok: 0, combo: 0, answered: null, missed: [] };
  go('#/quiz');
}
function viewGQuiz(top) {
  const it = Q.items[Q.idx], a = Q.answered;
  const choices = it.choices.map((c, i) => {
    let cls = '';
    if (a) { if (c === it.correct) cls = 'right'; else if (i === a.pick) cls = 'wrong'; }
    return `<button class="choice tr ${cls}" data-act="ganswer" data-arg="${i}" ${a ? 'disabled' : ''}>${esc(c)}</button>`;
  }).join('');
  const fb = a ? `<div class="feedback ${a.ok ? 'ok' : 'ng'} pop"><b>${a.ok ? '⭕ 正解!' : '❌ 残念…'}</b><div class="small" style="margin-top:4px">${it.e}</div></div>
    <button class="btn btn-main btn-block btn-lg" style="margin-top:14px" data-act="next">次へ →</button>` : '';
  render(`${top}<div class="card q-prompt lesson pop" style="text-align:left"><div class="label">${esc(Q.title)}</div><div style="font-size:18px;margin-top:8px;font-weight:700">${it.q}</div></div><div class="choices">${choices}</div>${fb}`, true);
}

/* ================= views ================= */
function render(html, focus = false) {
  $('#app').innerHTML = html;
  document.body.classList.toggle('focus', focus);
  window.scrollTo(0, 0);
}
function setTab(name) { document.querySelectorAll('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === name)); }

function catLine(todo) {
  const n = streakNow(), h = new Date().getHours();
  ensureDay();
  if (todo === 0 && st.day.g && st.day.d) return ['Harikasın!', '今日のミッション全部クリア!天才!'];
  if (todo === 0) return ['Aferin!', '単語は完了!文法か会話もやってみる?'];
  if (!st.welcomed || st.xp === 0) return ['Merhaba!', 'ボクはパムク。いっしょにトルコ語を勉強しよう!'];
  if (n >= 2) return [`${n} gün üst üste!`, `${n}日連続!その調子だよ 🔥`];
  if (h < 11) return ['Günaydın!', '朝のチャイと一緒に単語をどうぞ ☕'];
  if (h >= 21) return ['İyi geceler!', '寝る前に5分だけ復習しよう 🌙'];
  return pick([['Hadi başlayalım!', 'さあ、はじめよう!'], ['Yavaş yavaş', 'ゆっくりで大丈夫だよ'], ['Sen yapabilirsin!', 'あなたならできる!']], 1)[0];
}

function viewHome() {
  setTab('home');
  ensureDay();
  const t = today(), xpToday = st.log[t] || 0;
  const { due, nNew, todo } = todoCounts();
  const pct = Math.min(1, xpToday / DAILY_GOAL), C = 2 * Math.PI * 30;
  const nextG = GRAMMAR.find(g => !(st.grammar[g.id] || {}).done);
  const nextD = talkOrder().find(d => !st.dialogs[d.id]) || DIALOGS[dayNum() % DIALOGS.length];
  const ph = PHRASES[dayNum() % PHRASES.length];
  const wod = ALL[(dayNum() * 7) % ALL.length];
  const hour = new Date().getHours();
  const hello = hour < 11 ? 'Günaydın' : hour < 18 ? 'Merhaba' : 'İyi akşamlar';
  const L = levelInfo(st.xp), lvPct = (st.xp - L.from) / (L.to - L.from) * 100;
  const line = catLine(todo);
  const wordsDone = todo === 0;
  render(`
  <div class="top"><div><div class="muted small" style="font-weight:700">${new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}</div>
    <h1><span class="tr">${hello}</span>${st.settings.name ? `<span style="font-size:20px">, ${esc(st.settings.name)}</span>` : ''}!</h1></div>
    <div class="chips"><a class="chip fire" href="#/me" style="text-decoration:none">🔥 ${streakNow()}</a><a class="chip lv" href="#/me" style="text-decoration:none">Lv.${L.lv}</a></div></div>

  <div class="mascot-row">${catSVG(todo === 0 ? 'happy' : 'normal')}
    <div class="speech" id="speech"><span class="tr">${esc(line[0])}</span><span class="small" style="font-weight:700">${esc(line[1])}</span></div></div>

  <div class="card hero">
    <div class="row">
      <svg class="ring" viewBox="0 0 72 72"><circle class="bg" cx="36" cy="36" r="30"/><circle class="fg" cx="36" cy="36" r="30" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/>
        <text x="36" y="41" text-anchor="middle" fill="#fff" font-size="16" font-weight="900" font-family="Nunito, sans-serif">${Math.round(pct * 100)}%</text></svg>
      <div class="grow"><div class="tiny" style="opacity:.85;font-weight:800;letter-spacing:.08em">TODAY</div><h3 style="font-size:20px">今日の単語</h3>
        <div class="small" style="opacity:.9;font-weight:700">${todo ? `復習 ${due} ・ 新しい単語 ${nNew}` : '今日の分は完了!🎉'}</div>
        <div class="small" style="opacity:.75">${xpToday} / ${DAILY_GOAL} XP</div></div>
    </div>
    <button class="btn btn-white btn-block btn-lg" style="margin-top:16px" data-act="${todo ? 'daily' : 'daily-more'}">${todo ? 'はじめる ▶' : 'もう5語覚える ＋'}</button>
  </div>

  <h2>🎯 今日のミッション</h2>
  <div class="grid3">
    <a class="mission ${wordsDone ? 'done' : ''}" href="#/" data-act="${todo ? 'daily' : 'home'}"><div class="ic">🃏</div><b>単語</b><span>今日の分</span></a>
    <a class="mission ${st.day.g ? 'done' : ''}" href="#/grammar/${(nextG || GRAMMAR[0]).id}"><div class="ic">📘</div><b>文法</b><span>1レッスン</span></a>
    <a class="mission ${st.day.d ? 'done' : ''}" href="#/talk/${nextD.id}"><div class="ic">💬</div><b>会話</b><span>1つ練習</span></a>
  </div>

  <a class="card" href="#/me" style="display:block;text-decoration:none;color:inherit">
    <div class="row" style="margin-bottom:8px"><div class="grow"><span class="label">LEVEL ${L.lv}</span><div><span class="tr" style="color:var(--primary)">${esc(L.tr)}</span> <b class="small">${esc(L.ja)}</b></div></div>
      <span class="small muted" style="font-weight:800">${st.xp - L.from} / ${L.to - L.from} XP</span></div>
    <div class="lvbar"><i style="width:${lvPct}%"></i></div></a>

  <div class="card tile-phrase"><div class="label">💬 今日のひとこと</div>
    <div class="row"><div class="grow"><div class="tr" style="font-size:22px;color:var(--accent);margin-top:4px">${esc(ph[0])}</div>${kana(ph[0])}
    <div style="font-weight:800">${esc(ph[1])}</div><div class="small muted">${esc(ph[2])}</div></div>${sayBtn(ph[0])}</div></div>

  <div class="card tile-word"><div class="label">✨ 今日の単語ピックアップ</div>
    <div class="row"><div class="grow"><div class="tr" style="font-size:22px;color:var(--primary-2);margin-top:4px">${esc(wod.tr)}</div>${kana(wod.tr)}<div style="font-weight:800">${esc(wod.ja)}</div></div>${sayBtn(wod.tr)}</div>
    ${wod.ex ? `<div class="row small" style="margin-top:8px;background:var(--card-2);padding:8px 12px;border-radius:12px"><div class="grow"><span class="tr">${esc(wod.ex)}</span><br><span class="muted">${esc(wod.exJa)}</span></div>${sayBtn(wod.ex, 'e', 'sm')}</div>` : ''}</div>`);
}

function viewWords() {
  setTab('words');
  const learned = ALL.filter(w => st.srs[w.key]);
  render(`<h1>単語 🃏</h1><p class="muted small" style="margin-top:0">覚えた単語:<b>${learned.length}</b> / ${ALL.length}</p>
  <div class="card hero"><div class="tiny" style="opacity:.85;font-weight:800;letter-spacing:.08em">QUIZ</div><h3 style="font-size:19px">覚えた単語でクイズ</h3>
    <div class="quiz-grid">${Object.entries(QTYPES).map(([k, v]) => `<button data-act="quiz" data-arg="${k}"><span>${v[0]}</span>${v[1]}</button>`).join('')}</div></div>
  <h2>📂 カテゴリ</h2>
  <div class="cat-grid">${WORDS.map((c, i) => {
    const n = c.words.length, k = c.words.filter(w => st.srs[c.id + ':' + w[0]]).length;
    return `<a class="cat-tile" href="#/words/${c.id}" style="background:${tileBg(i)}">${k === n ? '<span class="star">⭐</span>' : ''}<span class="ic">${c.icon}</span><b>${esc(c.name)}</b>
      <div class="mini"><i style="width:${k / n * 100}%"></i></div><span class="cnt">${k} / ${n}</span></a>`;
  }).join('')}</div>`);
}
function viewCategory(id) {
  setTab('words');
  const c = CAT[id]; if (!c) return go('#/words', true);
  const i = WORDS.indexOf(c), ws = ALL.filter(w => w.cat === id);
  const k = ws.filter(w => st.srs[w.key]).length;
  render(`<a href="#/words" class="back">‹ 単語</a>
  <div class="lesson-head" style="background:${tileBg(i)};color:#2A2238;box-shadow:var(--shadow)"><div style="font-size:46px;line-height:1.1">${c.icon}</div><h1 style="margin:4px 0 0">${esc(c.name)}</h1><div class="small" style="font-weight:800;opacity:.75">${k} / ${ws.length} 語</div></div>
  <div class="row"><button class="btn btn-main grow" data-act="cat-study" data-arg="${id}">🃏 カードで学ぶ</button>
    <button class="btn btn-alt grow" data-act="cat-quiz" data-arg="${id}">🎯 クイズ</button></div>
  <div class="legend"><span><i class="dot"></i>未学習</span><span><i class="dot learning"></i>学習中</span><span><i class="dot master"></i>マスター</span></div>
  <div class="card">${ws.map(w => `<div class="word-row"><span class="dot ${wordStatus(w.key)}"></span>
    <div class="grow"><span class="tr" style="font-size:18px;color:var(--primary)">${esc(w.tr)}</span>${kana(w.tr)}<div style="font-weight:700">${esc(w.ja)}</div>
    ${w.ex ? `<div class="small muted"><span class="tr">${esc(w.ex)}</span> — ${esc(w.exJa)}</div>` : ''}</div>${sayBtn(w.tr, 'e', 'sm')}</div>`).join('')}</div>`);
}

function viewGrammarList() {
  setTab('grammar');
  const done = grammarDone();
  const curIdx = GRAMMAR.findIndex(g => !(st.grammar[g.id] || {}).done);
  const offs = [0, 56, 84, 56, 0, -56, -84, -56];
  let html = `<h1>文法 📘</h1><p class="muted small" style="margin-top:0">${done} / ${GRAMMAR.length} レッスン完了 ・ 上から順に進もう!</p>`;
  GRAMMAR.forEach((g, i) => {
    const u = UNITS.find(x => x[0] === i);
    if (u) html += `<div class="unit"><div class="tiny">${u[1]}</div><b>${esc(u[2])}</b><div class="small" style="opacity:.85">${esc(u[3])}</div></div><div class="path">`;
    const s = st.grammar[g.id] || {};
    const cls = s.done ? 'done' : i === curIdx ? 'cur' : '';
    html += `<a class="node ${cls}" href="#/grammar/${g.id}" style="margin-left:calc(50% - 75px + ${offs[i % offs.length]}px)">
      ${i === curIdx ? '<span class="start">START</span>' : ''}<div class="circle">${s.done ? '★' : i + 1}</div><div class="name">${esc(g.title)}</div></a>`;
    const nextU = UNITS.find(x => x[0] === i + 1);
    if (nextU || i === GRAMMAR.length - 1) html += `</div>`;
  });
  html += `<div class="center" style="margin-top:10px">${catSVG(done === GRAMMAR.length ? 'happy' : 'normal')}<p class="small muted">${done === GRAMMAR.length ? 'Tebrikler! 全レッスン完了!' : 'ゴールでパムクが待ってるよ 🐾'}</p></div>`;
  render(html);
}
function viewLesson(id) {
  setTab('grammar');
  const g = GRAMMAR.find(x => x.id === id); if (!g) return go('#/grammar', true);
  const i = GRAMMAR.indexOf(g), s = st.grammar[g.id] || {};
  render(`<a href="#/grammar" class="back">‹ 文法</a>
  <div class="lesson-head hero card"><div class="tiny" style="opacity:.85;font-weight:800;letter-spacing:.08em">LESSON ${i + 1}${s.done ? ' ・ ★ CLEAR' : ''}</div><h1 style="color:#fff;margin:2px 0">${esc(g.title)}</h1><div class="small" style="opacity:.9;font-weight:700">${esc(g.sub)}</div></div>
  <div class="card lesson">${g.body}</div>
  <h2>📝 例文</h2><div class="card">${g.ex.map(e => `<div class="ex-line row"><div class="grow"><div class="tr">${esc(nameFix(e[0]))}</div>${kana(nameFix(e[0]))}<div class="small muted">${esc(nameFix(e[1]))}</div></div>${sayBtn(e[0], 'e', 'sm')}</div>`).join('')}</div>
  <button class="btn btn-main btn-block btn-lg" data-act="gquiz" data-arg="${g.id}">練習問題にチャレンジ(${g.quiz.length}問)▶</button>
  <div class="row" style="margin-top:14px">${i > 0 ? `<a class="btn grow" href="#/grammar/${GRAMMAR[i - 1].id}">‹ 前へ</a>` : ''}${GRAMMAR[i + 1] ? `<a class="btn grow" href="#/grammar/${GRAMMAR[i + 1].id}">次へ ›</a>` : ''}</div>`);
}

const TALK_GROUPS = [
  ['family', '👨‍👩‍👧 義理の家族', 'お義母さん・お義父さん・親戚との会話'],
  ['couple', '💑 夫婦', 'ふたりの毎日の会話'],
  ['outside', '🏙️ 外で', 'お店・タクシー・病院など'],
];
const talkOrder = () => TALK_GROUPS.flatMap(g => DIALOGS.filter(d => d.group === g[0]));
let talkSeg = 'dialogs';
function viewTalk() {
  setTab('talk');
  const seg = `<div class="seg"><button class="${talkSeg === 'dialogs' ? 'on' : ''}" data-act="seg" data-arg="dialogs">🎭 場面別の会話</button><button class="${talkSeg === 'phrases' ? 'on' : ''}" data-act="seg" data-arg="phrases">✨ 決まり文句</button></div>`;
  let body;
  if (talkSeg === 'dialogs') {
    body = TALK_GROUPS.map(([gid, name, sub]) => {
      const ds = DIALOGS.filter(d => d.group === gid);
      const n = ds.filter(d => st.dialogs[d.id]).length;
      return `<h2>${name} <span class="small muted">${n} / ${ds.length}</span></h2><p class="small muted" style="margin-top:-6px">${sub}</p>` +
        ds.map(d => `<a class="card dlg-card" href="#/talk/${d.id}"><div class="ic" style="background:${tileBg(DIALOGS.indexOf(d))}">${d.icon}</div>
        <div class="grow"><b>${esc(d.title)}</b><div class="small muted">${esc(d.desc)} ・ ${d.lines.length}行</div>${st.dialogs[d.id] ? '<span class="badge teal">✓ 練習済</span>' : ''}</div><div class="chev">›</div></a>`).join('');
    }).join('');
  } else {
    body = `<p class="small muted">トルコ人がよく使う決まり文句。覚えると一気に「トルコ通」に!</p>${PHRASES.map(p => `<div class="card phrase row"><div class="grow"><div class="tr">${esc(p[0])}</div>${kana(p[0])}<div style="font-weight:800">${esc(p[1])}</div><div class="small muted">${esc(p[2])}</div></div>${sayBtn(p[0], 'e', 'sm')}</div>`).join('')}`;
  }
  render(`<h1>会話 💬</h1>${seg}${body}`);
}
let dlgHide = 'none';
function viewDialog(id) {
  setTab('talk');
  const d = DIALOGS.find(x => x.id === id); if (!d) return go('#/talk', true);
  const i = DIALOGS.indexOf(d);
  const lines = d.lines.map((l, k) => {
    const me = l[0] === 'B';
    const hide = dlgHide === 'tr' && me ? 'hide-tr' : dlgHide === 'ja' ? 'hide-ja' : '';
    return `<button class="bubble ${me ? 'me' : ''} ${hide}" style="animation-delay:${k * 60}ms" data-act="line" data-arg="${k}" id="ln${k}"><span class="who">${esc(me ? (st.settings.name || d.who.B) : d.who[l[0]])}</span>
      <span class="tr">${esc(nameFix(l[1]))}</span>${kana(nameFix(l[1]))}<span class="ja">${esc(nameFix(l[2]))}</span></button>`;
  }).join('');
  render(`<a href="#/talk" class="back">‹ 会話</a>
  <div class="lesson-head" style="background:${tileBg(i)};color:#2A2238;box-shadow:var(--shadow)"><div style="font-size:42px;line-height:1.1">${d.icon}</div><h1 style="margin:4px 0 0">${esc(d.title)}</h1><div class="small" style="font-weight:800;opacity:.75">${esc(d.desc)}</div></div>
  <button class="btn btn-alt btn-block" id="playAllBtn" data-act="playall" style="margin-top:12px">▶ 会話を全部再生</button>
  <div class="seg"><button class="${dlgHide === 'none' ? 'on' : ''}" data-act="hide" data-arg="none">全部表示</button><button class="${dlgHide === 'tr' ? 'on' : ''}" data-act="hide" data-arg="tr">🎭 自分のセリフを隠す</button><button class="${dlgHide === 'ja' ? 'on' : ''}" data-act="hide" data-arg="ja">日本語を隠す</button></div>
  ${dlgHide === 'tr' ? '<p class="small muted">ロールプレイ:右側のセリフを自分で言ってから、タップして答え合わせ!</p>' : dlgHide === 'ja' ? '<p class="small muted">聞いて意味を考えてから、タップして答え合わせ!</p>' : '<p class="small muted">吹き出しをタップすると、そのセリフを再生します。</p>'}
  <div class="bubbles">${lines}</div>
  ${d.tips && d.tips.length ? `<h2>💡 ポイント</h2><div class="card">${d.tips.map(t => `<div class="word-row"><div class="grow"><span class="tr" style="color:var(--primary)">${esc(t[0])}</span><div class="small muted">${esc(t[1])}</div></div></div>`).join('')}</div>` : ''}
  <button class="btn btn-main btn-block btn-lg" style="margin-top:8px" data-act="dlg-done" data-arg="${d.id}">練習した!(+10 XP)</button>`);
}

function viewMe() {
  setTab('me');
  const days = [...Array(14)].map((_, i) => addDays(today(), i - 13));
  const max = Math.max(DAILY_GOAL, ...days.map(d => st.log[d] || 0));
  const s = st.settings;
  const L = levelInfo(st.xp), lvPct = (st.xp - L.from) / (L.to - L.from) * 100;
  const sw = (key, label, sub = '') => `<div class="setting"><div><b>${label}</b>${sub ? `<div class="small muted">${sub}</div>` : ''}</div><label class="switch"><input type="checkbox" data-set="${key}" ${s[key] ? 'checked' : ''}><span></span></label></div>`;
  const nB = Object.keys(st.badges).length;
  render(`<div class="card profile">${catSVG('happy')}
    <h1 style="margin:4px 0 0">${esc(s.name || 'あなた')}</h1>
    <div><span class="tr" style="color:var(--primary);font-size:18px">Lv.${L.lv} ${esc(L.tr)}</span> <b class="small">${esc(L.ja)}</b></div>
    <div class="lvbar" style="margin:12px 0 4px"><i style="width:${lvPct}%"></i></div><div class="small muted" style="font-weight:700">次のレベルまで ${L.to - st.xp} XP</div></div>
  <div class="grid2">
    <div class="card stat"><b style="color:#F07A1A">🔥 ${streakNow()}</b><span>連続日数(最高 ${st.streak.best})</span></div>
    <div class="card stat"><b style="color:var(--gold)">⭐ ${st.xp}</b><span>合計 XP</span></div>
    <div class="card stat"><b style="color:var(--primary)">${learnedCount()}</b><span>覚えた単語</span></div>
    <div class="card stat"><b style="color:var(--good)">${masterCount()}</b><span>マスターした単語</span></div>
  </div>

  <h2>🏅 バッジ <span class="small muted">${nB} / ${BADGES.length}</span></h2>
  <div class="card"><div class="badges">${BADGES.map(([id, ic, name]) => `<div class="bdg ${st.badges[id] ? '' : 'locked'}"><div class="medal">${ic}</div><span>${esc(name)}</span></div>`).join('')}</div></div>

  <h2>📈 最近2週間</h2>
  <div class="card"><div class="week">${days.map(d => { const v = st.log[d] || 0;
    return `<div><i class="${v ? '' : 'zero'}" style="height:${Math.max(4, v / max * 72)}px"></i><span>${+d.slice(8)}</span></div>`; }).join('')}</div></div>

  <h2>🎨 テーマ</h2>
  <div class="themes">${Object.entries(THEMES).map(([k, v]) => `<button class="theme-btn ${s.theme === k ? 'on' : ''}" data-act="theme" data-arg="${k}"><i style="background:${v[2]}"></i>${v[0]}</button>`).join('')}</div>

  <h2>⚙️ 設定</h2>
  <div class="card">
    <div class="setting"><div><b>あなたの名前</b><div class="small muted">会話の例文の「Hana」があなたの名前になります</div></div></div>
    <input type="text" id="nameIn" value="${esc(s.name)}" placeholder="例:Yuki" maxlength="20">
    <div class="setting"><div><b>1日の新しい単語</b></div><select data-set="daily">${[5, 10, 15, 20].map(n => `<option value="${n}" ${s.daily === n ? 'selected' : ''}>${n}語</option>`).join('')}</select></div>
    ${sw('kana', 'カタカナ読みを表示', '発音の目安です')}
    ${sw('autoplay', '自動で読み上げる', 'カードやクイズを開いたときに再生')}
    <div class="setting"><div><b>再生スピード</b></div><select data-set="speed">${[[.75, 'ゆっくり'], [.9, '少しゆっくり'], [1, 'ふつう']].map(([v, l]) => `<option value="${v}" ${s.speed === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <button class="btn btn-sm" data-act="say" data-say="Merhaba! Türkçe öğreniyorum." data-v="e">🔊 音声テスト</button>
  </div>

  <h2>📲 アプリとして使う</h2>
  <div class="card small">
    <p><b>iPhone:</b>Safariで開き、共有ボタン <b>⬆️</b> →「<b>ホーム画面に追加</b>」</p>
    <p><b>Android:</b>Chromeのメニュー <b>⋮</b> →「<b>アプリをインストール</b>」</p>
    <p class="muted">ホーム画面に追加すると、オフラインでも使え、学習記録も消えにくくなります。</p>
    <button class="btn btn-main btn-block" id="installBtn" data-act="install" style="display:${deferredPrompt ? 'flex' : 'none'}">📲 インストール</button>
  </div>

  <h2>💾 バックアップ</h2>
  <div class="card">
    <p class="small muted">学習記録はこの端末に保存されています。機種変更の前にコピーして保存しておきましょう。</p>
    <div class="row"><button class="btn grow btn-sm" data-act="export">記録をコピー</button><button class="btn grow btn-sm" data-act="import">記録を読み込む</button></div>
    <textarea id="backup" rows="3" style="margin-top:10px;display:none" placeholder="ここにバックアップを貼り付け"></textarea>
    <button class="btn btn-alt btn-block" id="importGo" data-act="import-go" style="margin-top:8px;display:none">読み込む</button>
    <button class="btn btn-ghost btn-block btn-sm" style="margin-top:12px;color:var(--bad)" data-act="reset">すべての記録をリセット</button>
  </div>
  <p class="center small muted" style="margin-top:20px">Kolay gelsin! 💗 毎日すこしずつ。</p>`);
  const ni = $('#nameIn');
  ni.addEventListener('change', () => { st.settings.name = ni.value.trim(); save(); toast('保存しました'); });
}

function welcome() {
  if (st.welcomed) return;
  modal(`${catSVG('happy', '')}<h2 style="justify-content:center;margin:6px 0 2px"><span class="tr" style="color:var(--primary)">Merhaba!</span></h2>
    <p style="font-weight:700;margin-top:4px">ボクは <b style="color:var(--primary)">パムク</b>。<br>トルコ生まれのネコだよ 🐾<br>いっしょにトルコ語を勉強しよう!</p>
    <input type="text" id="welName" placeholder="あなたの名前(例:Yuki)" maxlength="20" style="text-align:center">`, false, 'はじめる!');
}

/* ================= router ================= */
function go(hash, replace) {
  if (replace) { history.replaceState(null, '', hash); route(); }
  else if (location.hash === hash) route();
  else location.hash = hash;
}
function route() {
  const [a, b] = location.hash.replace(/^#\/?/, '').split('/');
  stopAudio();
  if (a !== 'study' && S && S.idx < S.queue.length) S = null;
  if (a !== 'quiz' && Q) Q = null;
  switch (a) {
    case 'study': return viewStudy();
    case 'quiz': return viewQuiz();
    case 'words': return b ? viewCategory(b) : viewWords();
    case 'grammar': return b ? viewLesson(b) : viewGrammarList();
    case 'talk': return b ? viewDialog(b) : viewTalk();
    case 'me': return viewMe();
    default: return viewHome();
  }
}
window.addEventListener('hashchange', route);

/* ================= actions ================= */
const ACT = {
  home: () => go('#/'),
  quit: () => { S = null; Q = null; history.length > 1 ? history.back() : go('#/', true); },
  daily: () => startDaily(),
  'daily-more': () => startDaily(5),
  pet: (_, el) => {
    el.classList.remove('jump', 'bob'); void el.getBoundingClientRect(); el.classList.add('jump');
    setTimeout(() => el.classList.add('bob'), 500);
    const sp = $('#speech'), c = pick(CHEERS, 1)[0];
    if (sp) sp.innerHTML = `<span class="tr">${esc(c[0])}</span><span class="small" style="font-weight:700">${esc(c[1])}</span>`;
  },
  'modal-close': () => {
    const n = $('#welName');
    if (n) { st.settings.name = n.value.trim(); st.welcomed = true; save(); }
    modalQ.shift(); showNextModal();
    if (n) route();
  },
  theme: k => { st.settings.theme = k; save(); applyTheme(); viewMe(); },
  learned: () => {
    const it = S.queue[S.idx];
    introduce(it.key); S.xp += 5;
    S.queue.push({ key: it.key, mode: 'review', dir: 'tr' });
    S.idx++; S.shown = false; viewStudy();
    gainXP(5);
  },
  reveal: () => { S.shown = true; viewStudy(); },
  rate: arg => {
    const r = +arg, it = S.queue[S.idx];
    rate(it.key, r);
    const xp = r === 0 ? 0 : r === 1 ? 1 : 2;
    if (r === 0) S.queue.splice(Math.min(S.queue.length, S.idx + 4), 0, { key: it.key, mode: 'review', dir: 'tr' });
    S.xp += xp; S.idx++; S.shown = false; viewStudy();
    if (xp) gainXP(xp);
  },
  'cat-study': id => startCategory(id),
  'cat-quiz': id => startQuiz(ALL.filter(w => w.cat === id), 'mix', CAT[id].name),
  quiz: type => startQuiz(ALL.filter(w => st.srs[w.key]), type, (QTYPES[type] || [, 'ミックス'])[1]),
  'quiz-learned': () => startQuiz(ALL.filter(w => st.srs[w.key]), 'mix', 'ミックス'),
  answer: arg => {
    if (Q.answered) return;
    const it = Q.items[Q.idx], c = it.choices[+arg];
    answerWord(c === (it.t === 'ja2tr' ? it.w.tr : it.w.ja), { pick: +arg });
  },
  key: k => { const i = $('#typed'); if (!i) return; const p = i.selectionStart ?? i.value.length; i.value = i.value.slice(0, p) + k + i.value.slice(i.selectionEnd ?? p); i.focus(); i.setSelectionRange(p + 1, p + 1); },
  'type-check': () => {
    const v = ($('#typed') || {}).value || ''; if (!v.trim()) return;
    const answers = Q.items[Q.idx].w.tr.split('/').map(s => s.trim());
    const exact = answers.some(a => norm(a) === norm(v));
    const close = !exact && answers.some(a => flat(a) === flat(v) || similarity(a, v) >= .85);
    answerWord(exact || close, { typed: v, close });
  },
  'type-skip': () => answerWord(false, { typed: '—' }),
  next: () => { Q.idx++; Q.answered = null; viewQuiz(); },
  gquiz: id => startGQuiz(id),
  ganswer: arg => {
    if (Q.answered) return;
    const it = Q.items[Q.idx], ok = it.choices[+arg] === it.correct;
    Q.answered = { ok, pick: +arg };
    scoreAnswer(ok);
    viewQuiz();
    if (ok) gainXP(2);
  },
  seg: s => { talkSeg = s; viewTalk(); },
  hide: h => { dlgHide = h; viewDialog(location.hash.split('/')[2]); },
  say: (_, el) => {
    stopAudio(); el.classList.add('playing');
    play(el.dataset.say, el.dataset.v || 'e', () => el.classList.remove('playing'));
  },
  line: (i, el) => {
    const d = DIALOGS.find(x => x.id === location.hash.split('/')[2]); if (!d) return;
    const l = d.lines[+i];
    stopAudio(); el.classList.remove('hide-tr', 'hide-ja'); el.classList.add('playing');
    play(l[1], AUDIO.voiceFor(d, l[0]), () => el.classList.remove('playing'));
  },
  playall: (_, btn) => {
    const d = DIALOGS.find(x => x.id === location.hash.split('/')[2]); if (!d) return;
    if (btn.dataset.on) { stopAudio(); btn.dataset.on = ''; btn.textContent = '▶ 会話を全部再生'; return; }
    stopAudio(); btn.dataset.on = '1'; btn.textContent = '⏸ 停止';
    let i = 0;
    const next = () => {
      document.querySelectorAll('.bubble.playing').forEach(b => b.classList.remove('playing'));
      const el = $('#ln' + i);
      if (i >= d.lines.length || !el || !btn.isConnected) { btn.dataset.on = ''; btn.textContent = '▶ 会話を全部再生'; return; }
      const l = d.lines[i++];
      el.classList.add('playing');
      if (dlgHide !== 'tr') el.classList.remove('hide-ja');
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      play(l[1], AUDIO.voiceFor(d, l[0]), () => setTimeout(next, 450));
    };
    next();
  },
  'dlg-done': id => {
    if (!st.dialogs[id]) st.dialogs[id] = true;
    ensureDay(); st.day.d = true; save();
    toast('Aferin! +10 XP 🎉'); confetti(80);
    gainXP(10); checkMissions();
    setTimeout(() => go('#/talk'), 900);
  },
  export: async () => {
    const data = btoa(unescape(encodeURIComponent(JSON.stringify(st))));
    const ta = $('#backup'); ta.style.display = 'block'; ta.value = data; $('#importGo').style.display = 'none';
    try { await navigator.clipboard.writeText(data); toast('コピーしました。メモ帳などに保存してください'); }
    catch (e) { ta.select(); toast('表示された文字をコピーして保存してください'); }
  },
  import: () => { const ta = $('#backup'); ta.style.display = 'block'; ta.value = ''; ta.focus(); $('#importGo').style.display = 'flex'; },
  'import-go': () => {
    try {
      const obj = JSON.parse(decodeURIComponent(escape(atob($('#backup').value.trim()))));
      if (!obj || typeof obj !== 'object' || !obj.srs) throw 0;
      if (!confirm('今の記録を上書きします。よろしいですか?')) return;
      localStorage.setItem(KEY, JSON.stringify(obj)); load(); applyTheme(); toast('読み込みました ✅'); viewMe();
    } catch (e) { toast('読み込めませんでした。コピーした文字を確認してください'); }
  },
  reset: () => { if (confirm('すべての学習記録を削除します。本当によろしいですか?')) { localStorage.removeItem(KEY); load(); applyTheme(); toast('リセットしました'); viewMe(); } },
  install: async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; const b = $('#installBtn'); if (b) b.style.display = 'none'; },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  e.preventDefault(); fn(el.dataset.arg, el, e);
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-set]'); if (!el) return;
  const k = el.dataset.set;
  st.settings[k] = el.type === 'checkbox' ? el.checked : Number(el.value);
  save(); toast('保存しました');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'typed') { e.preventDefault(); ACT['type-check'](); }
  if (e.key === 'Enter' && e.target.id === 'welName') { e.preventDefault(); ACT['modal-close'](); }
});

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; const b = $('#installBtn'); if (b) b.style.display = 'flex'; });

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
route();
welcome();
})();
