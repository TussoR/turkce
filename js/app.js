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

/* ================= data ================= */
const ALL = [];
const BYKEY = {};
WORDS.forEach(cat => cat.words.forEach(w => {
  const o = { key: cat.id + ':' + w[0], cat: cat.id, tr: w[0], ja: w[1], ex: w[2] || '', exJa: w[3] || '', note: w[4] || '' };
  ALL.push(o); BYKEY[o.key] = o;
}));
const CAT = Object.fromEntries(WORDS.map(c => [c.id, c]));

/* ================= state ================= */
const KEY = 'merhaba-tr-v1';
const DEFAULT = {
  srs: {}, newDay: { date: '', n: 0 }, grammar: {}, dialogs: {},
  streak: { last: '', n: 0, best: 0 }, xp: 0, log: {},
  settings: { daily: 10, kana: true, name: '' }
};
let st;
function load() {
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { st = {}; }
  st = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT)), st);
  st.settings = Object.assign({}, DEFAULT.settings, st.settings);
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
load();
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

function gainXP(n) {
  const t = today();
  st.xp += n;
  st.log[t] = (st.log[t] || 0) + n;
  if (st.streak.last !== t) {
    st.streak.n = st.streak.last === addDays(t, -1) ? st.streak.n + 1 : 1;
    st.streak.last = t;
    st.streak.best = Math.max(st.streak.best, st.streak.n);
  }
  save();
}
const streakNow = () => (st.streak.last === today() || st.streak.last === addDays(today(), -1)) ? st.streak.n : 0;
const newToday = () => st.newDay.date === today() ? st.newDay.n : 0;
const dueKeys = () => { const t = today(); return Object.keys(st.srs).filter(k => BYKEY[k] && st.srs[k].d <= t); };
const learnedCount = () => Object.keys(st.srs).filter(k => BYKEY[k]).length;
const masterCount = () => Object.values(st.srs).filter(s => s.i >= 21).length;
const wordStatus = k => { const s = st.srs[k]; return !s ? 'new' : s.i >= 21 ? 'master' : 'learning'; };
const DAILY_GOAL = 50;
const nameFix = s => st.settings.name ? s.replace(/Hana/g, st.settings.name).replace(/ハナ/g, st.settings.name) : s;

const kana = t => st.settings.kana ? `<div class="kana">${esc(toKana(t))}</div>` : '';

/* ================= toast ================= */
let toastT;
function toast(msg, ms = 2200) {
  const t = $('#toast'); t.innerHTML = esc(msg).replace(/\n/g, '<br>'); t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
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

/* ================= session (flashcards) ================= */
let S = null;   // current flashcard session
let Q = null;   // current quiz

function startDaily(extra = 0) {
  const due = shuffle(dueKeys()).slice(0, 60);
  const nNew = Math.max(0, st.settings.daily - newToday()) + extra;
  const fresh = ALL.filter(w => !st.srs[w.key]).slice(0, nNew).map(w => w.key);
  const queue = [...due.map(k => ({ key: k, mode: 'review', dir: dirFor(k) })), ...fresh.map(k => ({ key: k, mode: 'new' }))];
  if (!queue.length) { toast('今日の学習はすべて完了です 🎉'); return; }
  S = { title: '今日の単語', queue, idx: 0, shown: false, xp: 0, newN: fresh.length, revN: due.length };
  go('#/study');
}
function startCategory(id) {
  const ws = CAT[id].words.map(w => id + ':' + w[0]);
  const fresh = ws.filter(k => !st.srs[k]), seen = shuffle(ws.filter(k => st.srs[k]));
  const queue = [...fresh.map(k => ({ key: k, mode: 'new' })), ...seen.map(k => ({ key: k, mode: 'review', dir: dirFor(k) }))];
  S = { title: CAT[id].name, queue, idx: 0, shown: false, xp: 0, newN: fresh.length, revN: seen.length };
  go('#/study');
}
function dirFor(k) { const s = st.srs[k]; return s && s.r >= 2 && Math.random() < .35 ? 'ja' : 'tr'; }

function viewStudy() {
  if (!S) return go('#/', true);
  if (S.idx >= S.queue.length) return studyDone();
  const it = S.queue[S.idx], w = BYKEY[it.key];
  const pct = Math.round(S.idx / S.queue.length * 100);
  const top = `<div class="session-top"><button class="close-btn" data-act="quit">✕</button><div class="bar"><i style="width:${pct}%"></i></div><span class="small muted">${S.idx + 1}/${S.queue.length}</span></div>`;
  const example = w.ex ? `<div class="divider"></div><div class="example"><div class="row"><div class="grow"><div class="tr">${esc(w.ex)}</div>${kana(w.ex)}<div class="small muted">${esc(w.exJa)}</div></div></div></div>` : '';
  const note = w.note ? `<div class="note">💡 ${esc(w.note)}</div>` : '';
  const trBlock = `<div class="big tr">${esc(w.tr)}</div>${kana(w.tr)}`;
  let html;
  if (it.mode === 'new') {
    html = `${top}<div class="flash pop"><div><span class="badge">NEW ✨</span> <span class="small muted">${esc(CAT[w.cat].icon + ' ' + CAT[w.cat].name)}</span></div>
      ${trBlock}<div class="mean">${esc(w.ja)}</div>${note}${example}</div>
      <button class="btn btn-main btn-block btn-lg" style="margin-top:16px" data-act="learned">覚えた!次へ →</button>`;
  } else if (!S.shown) {
    const front = it.dir === 'ja'
      ? `<div class="small muted">トルコ語で言うと?</div><div class="big ja">${esc(w.ja)}</div>`
      : `<div class="small muted">意味は?</div>${trBlock}`;
    html = `${top}<div class="flash pop">${front}</div>
      <button class="btn btn-teal btn-block btn-lg" style="margin-top:16px" data-act="reveal">答えを見る</button>`;
  } else {
    html = `${top}<div class="flash">${trBlock}<div class="mean">${esc(w.ja)}</div>${note}${example}</div>
      <div class="rate">
        <button class="r-again" data-act="rate" data-arg="0">もう一度<small>忘れた</small></button>
        <button class="r-hard" data-act="rate" data-arg="1">難しい<small>${ivl(it.key, 1)}</small></button>
        <button class="r-good" data-act="rate" data-arg="2">正解<small>${ivl(it.key, 2)}</small></button>
        <button class="r-easy" data-act="rate" data-arg="3">簡単<small>${ivl(it.key, 3)}</small></button>
      </div>`;
  }
  render(html, true);
}
function ivl(key, r) {
  const s = st.srs[key] || { i: 0, e: 2.5 };
  const i = r === 1 ? Math.max(1, Math.round(s.i * 1.2)) : r === 2 ? (s.i === 0 ? 1 : s.i === 1 ? 3 : Math.round(s.i * s.e)) : (s.i === 0 ? 3 : Math.round(s.i * s.e * 1.3));
  return i < 30 ? `${i}日後` : i < 365 ? `${Math.round(i / 30)}か月後` : `${(i / 365).toFixed(1)}年後`;
}
function studyDone() {
  const msg = S.xp >= 30 ? 'Harika! すばらしい!' : 'Aferin! よくできました!';
  const more = ALL.some(w => !st.srs[w.key]);
  render(`<div class="done-screen pop"><div class="emoji">🎉</div><h1>${msg}</h1>
    <p class="muted">新しい単語 ${S.newN} ・ 復習 ${S.revN}</p><p><span class="badge teal">+${S.xp} XP</span></p></div>
    <button class="btn btn-main btn-block btn-lg" data-act="home">ホームへ</button>
    ${more ? `<button class="btn btn-block" style="margin-top:10px" data-act="daily-more">もう5語覚える</button>` : ''}
    <button class="btn btn-block" style="margin-top:10px" data-act="quiz-learned">クイズで確認する</button>`, true);
  S = null;
}

/* ================= word quiz ================= */
const QTYPES = { tr2ja: 'トルコ語 → 日本語', ja2tr: '日本語 → トルコ語', type: '書き取り' };
function startQuiz(pool, type, title) {
  if (pool.length < 4) { toast('まず単語を4つ以上覚えましょう'); return; }
  const items = pick(pool, Math.min(10, pool.length)).map(w => {
    const t = type === 'mix' ? pick(['tr2ja', 'ja2tr', 'tr2ja', 'type'], 1)[0] : type;
    return { w, t, choices: t === 'type' ? null : makeChoices(w, t) };
  });
  Q = { kind: 'word', title, items, idx: 0, ok: 0, answered: null, missed: [] };
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
function viewQuiz() {
  if (!Q) return go('#/', true);
  if (Q.idx >= Q.items.length) return quizDone();
  const pct = Math.round(Q.idx / Q.items.length * 100);
  const top = `<div class="session-top"><button class="close-btn" data-act="quit">✕</button><div class="bar"><i style="width:${pct}%"></i></div><span class="small muted">${Q.idx + 1}/${Q.items.length}</span></div>`;
  if (Q.kind === 'grammar') return viewGQuiz(top);
  const it = Q.items[Q.idx], w = it.w, a = Q.answered;
  let prompt;
  if (it.t === 'tr2ja') prompt = `<div class="small muted">意味はどれ?</div><div class="big tr">${esc(w.tr)}</div>${kana(w.tr)}`;
  else prompt = `<div class="small muted">トルコ語で言うと?</div><div class="big">${esc(w.ja)}</div>`;
  let body;
  if (it.t === 'type') {
    body = a ? '' : `<input type="text" id="typed" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="トルコ語を入力">
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
    fb = `<div class="feedback ${a.ok ? 'ok' : 'ng'} pop"><b>${a.ok ? (a.close ? '⭕ 正解(つづりに注意!)' : '⭕ 正解!') : '❌ 残念…'}</b>
      <div class="row" style="margin-top:6px"><div class="grow"><span class="tr">${esc(w.tr)}</span> = ${esc(w.ja)}${a.typed ? `<div class="small muted">あなたの答え:${esc(a.typed)}</div>` : ''}</div></div></div>
      <button class="btn btn-main btn-block btn-lg" style="margin-top:14px" data-act="next">次へ →</button>`;
  }
  render(`${top}<div class="card q-prompt pop">${prompt}</div>${body}${fb}`, true);
  if (!a && it.t === 'type') setTimeout(() => { const i = $('#typed'); i && i.focus(); }, 100);
}
function answerWord(ok, extra = {}) {
  const it = Q.items[Q.idx];
  Q.answered = Object.assign({ ok }, extra);
  if (ok) { Q.ok++; gainXP(3); } else { Q.missed.push(it.w); if (st.srs[it.w.key]) { st.srs[it.w.key].d = today(); save(); } }
  viewQuiz();
}
function quizDone() {
  const n = Q.items.length, ok = Q.ok, rate = ok / n;
  const emoji = rate === 1 ? '🏆' : rate >= .7 ? '🎉' : rate >= .4 ? '💪' : '🌱';
  let extra = '';
  if (Q.kind === 'grammar') {
    const g = GRAMMAR.find(x => x.id === Q.gid);
    const prev = st.grammar[Q.gid] || {};
    if (rate >= .6 && !prev.done) gainXP(20);
    st.grammar[Q.gid] = { done: prev.done || rate >= .6, best: Math.max(prev.best || 0, Math.round(rate * 100)) }; save();
    const idx = GRAMMAR.indexOf(g), nx = GRAMMAR[idx + 1];
    extra = rate >= .6
      ? (nx ? `<a class="btn btn-main btn-block btn-lg" href="#/grammar/${nx.id}">次のレッスンへ →</a>` : '')
      : `<a class="btn btn-main btn-block btn-lg" href="#/grammar/${g.id}">レッスンを復習する</a>`;
  } else if (Q.missed.length) {
    extra = `<div class="card"><h3>復習しよう</h3>${Q.missed.map(w => `<div class="word-row"><div class="grow"><span class="tr">${esc(w.tr)}</span><div class="small muted">${esc(w.ja)}</div></div></div>`).join('')}</div>`;
  }
  render(`<div class="done-screen pop"><div class="emoji">${emoji}</div><h1>${ok} / ${n} 正解</h1>
    <p class="muted">${rate === 1 ? 'Mükemmel! 完璧です!' : rate >= .6 ? 'Aferin! よくできました' : 'Devam! この調子で続けよう'}</p></div>
    ${extra}<button class="btn btn-block" style="margin-top:10px" data-act="home">ホームへ</button>`, true);
  Q = null;
}

/* ================= grammar quiz ================= */
function startGQuiz(id) {
  const g = GRAMMAR.find(x => x.id === id);
  const items = shuffle(g.quiz).map(q => ({ q: q[0], correct: q[1][0], choices: shuffle(q[1]), e: q[2] }));
  Q = { kind: 'grammar', gid: id, title: g.title, items, idx: 0, ok: 0, answered: null, missed: [] };
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
  render(`${top}<div class="card lesson pop"><div class="small muted">${esc(Q.title)}</div><div style="font-size:18px;margin-top:6px">${it.q}</div></div><div class="choices">${choices}</div>${fb}`, true);
}

/* ================= views ================= */
function render(html, focus = false) {
  $('#app').innerHTML = html;
  document.body.classList.toggle('focus', focus);
  window.scrollTo(0, 0);
}
function setTab(name) { document.querySelectorAll('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === name)); }

function viewHome() {
  setTab('home');
  const t = today(), xpToday = st.log[t] || 0;
  const due = dueKeys().length, nNew = Math.min(Math.max(0, st.settings.daily - newToday()), ALL.filter(w => !st.srs[w.key]).length);
  const pct = Math.min(1, xpToday / DAILY_GOAL), C = 2 * Math.PI * 26;
  const nextG = GRAMMAR.find(g => !(st.grammar[g.id] || {}).done);
  const ph = PHRASES[Math.floor(Date.now() / 864e5) % PHRASES.length];
  const wod = ALL[(Math.floor(Date.now() / 864e5) * 7) % ALL.length];
  const hour = new Date().getHours();
  const hello = hour < 11 ? 'Günaydın!' : hour < 18 ? 'Merhaba!' : 'İyi akşamlar!';
  const todo = due + nNew;
  render(`
  <div class="top"><div><div class="muted small">${new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}${st.settings.name ? ' ・ ' + esc(st.settings.name) + 'さん' : ''}</div><h1 class="tr">${hello}</h1></div>
    <div class="streak">🔥 ${streakNow()}日</div></div>

  <div class="card hero">
    <div class="row">
      <svg class="ring" viewBox="0 0 64 64"><circle class="bg" cx="32" cy="32" r="26"/><circle class="fg" cx="32" cy="32" r="26" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/>
        <text x="32" y="37" text-anchor="middle" fill="#fff" font-size="15" font-weight="800">${Math.round(pct * 100)}%</text></svg>
      <div class="grow"><h3>今日の単語</h3>
        <div class="muted small">${todo ? `復習 ${due} ・ 新しい単語 ${nNew}` : '今日の分は完了!すばらしい 🎉'}</div>
        <div class="muted small">今日 ${xpToday} / ${DAILY_GOAL} XP</div></div>
    </div>
    <button class="btn btn-white btn-block btn-lg" style="margin-top:14px" data-act="${todo ? 'daily' : 'daily-more'}">${todo ? 'はじめる ▶' : 'もう5語覚える'}</button>
  </div>

  ${nextG ? `<a class="item" href="#/grammar/${nextG.id}"><div class="emoji">📘</div><div class="grow"><div class="small muted">次の文法レッスン</div><b>${esc(nextG.title)}</b><div class="small muted">${esc(nextG.sub)}</div></div><div class="chev">›</div></a>` : ''}

  <div class="card"><div class="small muted">今日のひとこと</div>
    <div class="row" style="margin-top:4px"><div class="grow"><div class="tr" style="font-size:20px">${esc(ph[0])}</div>${kana(ph[0])}
      <div><b>${esc(ph[1])}</b></div><div class="small muted">${esc(ph[2])}</div></div></div></div>

  <div class="card"><div class="small muted">今日の単語ピックアップ</div>
    <div class="row" style="margin-top:4px"><div class="grow"><div class="tr" style="font-size:20px">${esc(wod.tr)}</div>${kana(wod.tr)}<div><b>${esc(wod.ja)}</b></div>
    ${wod.ex ? `<div class="small" style="margin-top:6px"><span class="tr">${esc(wod.ex)}</span><br><span class="muted">${esc(wod.exJa)}</span></div>` : ''}</div></div></div>

  <div class="grid2">
    <a class="card stat" href="#/words" style="text-decoration:none;color:inherit"><b>${learnedCount()}</b><span>覚えた単語 / ${ALL.length}</span></a>
    <a class="card stat" href="#/grammar" style="text-decoration:none;color:inherit"><b>${Object.values(st.grammar).filter(g => g.done).length}</b><span>文法レッスン / ${GRAMMAR.length}</span></a>
  </div>`);
}

function viewWords() {
  setTab('words');
  const learned = ALL.filter(w => st.srs[w.key]);
  render(`<h1>単語</h1><p class="muted small">カテゴリを選んで学ぶか、クイズで確認しよう。</p>
  <div class="card"><h3>🎯 クイズ(覚えた単語 ${learned.length}語)</h3>
    <div class="grid2" style="margin-top:10px">
      ${Object.entries(QTYPES).map(([k, v]) => `<button class="btn" data-act="quiz" data-arg="${k}">${v}</button>`).join('')}
    </div>
    <button class="btn btn-teal btn-block" style="margin-top:10px" data-act="quiz" data-arg="mix">ミックス10問</button>
  </div>
  <h2>カテゴリ</h2>
  ${WORDS.map(c => {
    const n = c.words.length, k = c.words.filter(w => st.srs[c.id + ':' + w[0]]).length;
    return `<a class="item" href="#/words/${c.id}"><div class="emoji">${c.icon}</div><div class="grow"><b>${esc(c.name)}</b>
      <div class="bar"><i style="width:${k / n * 100}%"></i></div><div class="small muted">${k} / ${n}</div></div><div class="chev">›</div></a>`;
  }).join('')}`);
}
function viewCategory(id) {
  setTab('words');
  const c = CAT[id]; if (!c) return go('#/words', true);
  const ws = ALL.filter(w => w.cat === id);
  render(`<a href="#/words" class="small muted" style="text-decoration:none">‹ 単語</a>
  <h1>${c.icon} ${esc(c.name)}</h1>
  <div class="row"><button class="btn btn-main grow" data-act="cat-study" data-arg="${id}">カードで学ぶ</button>
    <button class="btn btn-teal grow" data-act="cat-quiz" data-arg="${id}">クイズ</button></div>
  <p class="small muted" style="margin-top:12px"><span class="dot" style="display:inline-block"></span> 未学習 <span class="dot learning" style="display:inline-block;margin-left:8px"></span> 学習中 <span class="dot master" style="display:inline-block;margin-left:8px"></span> マスター</p>
  <div class="card">${ws.map(w => `<div class="word-row"><span class="dot ${wordStatus(w.key)}"></span>
    <div class="grow"><span class="tr" style="font-size:17px">${esc(w.tr)}</span>${kana(w.tr)}<div class="small">${esc(w.ja)}</div>
    ${w.ex ? `<div class="small muted"><span class="tr">${esc(w.ex)}</span> — ${esc(w.exJa)}</div>` : ''}</div></div>`).join('')}</div>`);
}

function viewGrammarList() {
  setTab('grammar');
  const done = GRAMMAR.filter(g => (st.grammar[g.id] || {}).done).length;
  render(`<h1>文法</h1><p class="muted small">上から順番に進めるのがおすすめ。各レッスンの最後に練習問題があります。</p>
  <div class="bar" style="height:8px"><i style="width:${done / GRAMMAR.length * 100}%"></i></div><p class="small muted">${done} / ${GRAMMAR.length} 完了</p>
  ${GRAMMAR.map((g, i) => { const s = st.grammar[g.id] || {};
    return `<a class="item" href="#/grammar/${g.id}"><div class="num ${s.done ? 'done' : ''}">${s.done ? '✓' : i + 1}</div>
    <div class="grow"><b>${esc(g.title)}</b><div class="small muted">${esc(g.sub)}${s.best ? ` ・ 最高 ${s.best}%` : ''}</div></div><div class="chev">›</div></a>`; }).join('')}`);
}
function viewLesson(id) {
  setTab('grammar');
  const g = GRAMMAR.find(x => x.id === id); if (!g) return go('#/grammar', true);
  const i = GRAMMAR.indexOf(g);
  render(`<a href="#/grammar" class="small muted" style="text-decoration:none">‹ 文法</a>
  <div class="small muted" style="margin-top:8px">レッスン ${i + 1}</div><h1>${esc(g.title)}</h1>
  <div class="card lesson">${g.body}</div>
  <h2>例文</h2><div class="card">${g.ex.map(e => `<div class="ex-line"><div class="grow"><div class="tr" style="font-size:17px">${esc(nameFix(e[0]))}</div>${kana(nameFix(e[0]))}<div class="small muted">${esc(nameFix(e[1]))}</div></div></div>`).join('')}</div>
  <button class="btn btn-main btn-block btn-lg" data-act="gquiz" data-arg="${g.id}">練習問題(${g.quiz.length}問)▶</button>
  <div class="row" style="margin-top:12px">${i > 0 ? `<a class="btn grow" href="#/grammar/${GRAMMAR[i - 1].id}">‹ 前へ</a>` : ''}${GRAMMAR[i + 1] ? `<a class="btn grow" href="#/grammar/${GRAMMAR[i + 1].id}">次へ ›</a>` : ''}</div>`);
}

let talkSeg = 'dialogs';
function viewTalk() {
  setTab('talk');
  const seg = `<div class="seg"><button class="${talkSeg === 'dialogs' ? 'on' : ''}" data-act="seg" data-arg="dialogs">場面別の会話</button><button class="${talkSeg === 'phrases' ? 'on' : ''}" data-act="seg" data-arg="phrases">決まり文句</button></div>`;
  let body;
  if (talkSeg === 'dialogs') {
    body = DIALOGS.map(d => `<a class="item" href="#/talk/${d.id}"><div class="emoji">${d.icon}</div><div class="grow"><b>${esc(d.title)}</b><div class="small muted">${esc(d.desc)}</div></div>${st.dialogs[d.id] ? '<span class="badge teal">練習済</span>' : ''}<div class="chev">›</div></a>`).join('');
  } else {
    body = `<p class="small muted">トルコ人がよく使う、場面ごとの決まり文句。覚えると一気に「トルコ通」に!</p><div class="card">${PHRASES.map(p => `<div class="word-row"><div class="grow"><span class="tr" style="font-size:17px">${esc(p[0])}</span>${kana(p[0])}<div><b>${esc(p[1])}</b></div><div class="small muted">${esc(p[2])}</div></div></div>`).join('')}</div>`;
  }
  render(`<h1>会話</h1>${seg}${body}`);
}
let dlgHide = 'none';
function viewDialog(id) {
  setTab('talk');
  const d = DIALOGS.find(x => x.id === id); if (!d) return go('#/talk', true);
  const lines = d.lines.map((l, i) => {
    const me = l[0] === 'B';
    const hide = dlgHide === 'tr' && me ? 'hide-tr' : dlgHide === 'ja' ? 'hide-ja' : '';
    return `<button class="bubble ${me ? 'me' : ''} ${hide}" data-act="line" data-arg="${i}" id="ln${i}"><span class="who">${esc(me ? (st.settings.name || d.who.B) : d.who[l[0]])}</span>
      <span class="tr">${esc(nameFix(l[1]))}</span>${kana(nameFix(l[1]))}<span class="ja">${esc(nameFix(l[2]))}</span></button>`;
  }).join('');
  render(`<a href="#/talk" class="small muted" style="text-decoration:none">‹ 会話</a>
  <h1>${d.icon} ${esc(d.title)}</h1>  <div class="seg"><button class="${dlgHide === 'none' ? 'on' : ''}" data-act="hide" data-arg="none">全部表示</button><button class="${dlgHide === 'tr' ? 'on' : ''}" data-act="hide" data-arg="tr">自分のセリフを隠す</button><button class="${dlgHide === 'ja' ? 'on' : ''}" data-act="hide" data-arg="ja">日本語を隠す</button></div>
  ${dlgHide === 'tr' ? '<p class="small muted">🎭 ロールプレイ:緑のセリフを自分で言ってから、タップして答え合わせ!</p>' : ''}
  <div class="bubbles">${lines}</div>
  ${d.tips && d.tips.length ? `<h2>ポイント</h2><div class="card">${d.tips.map(t => `<div class="word-row"><div class="grow"><span class="tr">${esc(t[0])}</span><div class="small muted">${esc(t[1])}</div></div></div>`).join('')}</div>` : ''}
  <button class="btn btn-main btn-block btn-lg" data-act="dlg-done" data-arg="${d.id}">練習した!(+10 XP)</button>`);
}


function viewMe() {
  setTab('me');
  const days = [...Array(14)].map((_, i) => addDays(today(), i - 13));
  const max = Math.max(DAILY_GOAL, ...days.map(d => st.log[d] || 0));
  const s = st.settings;
  const sw = (key, label, sub = '') => `<div class="setting"><div><b>${label}</b>${sub ? `<div class="small muted">${sub}</div>` : ''}</div><label class="switch"><input type="checkbox" data-set="${key}" ${s[key] ? 'checked' : ''}><span></span></label></div>`;
  render(`<h1>記録</h1>
  <div class="grid2">
    <div class="card stat"><b>🔥 ${streakNow()}</b><span>連続日数(最高 ${st.streak.best})</span></div>
    <div class="card stat"><b>${st.xp}</b><span>合計 XP</span></div>
    <div class="card stat"><b>${learnedCount()}</b><span>覚えた単語</span></div>
    <div class="card stat"><b>${masterCount()}</b><span>マスターした単語</span></div>
  </div>
  <div class="card"><h3>最近2週間</h3><div class="week">${days.map(d => { const v = st.log[d] || 0;
    return `<div><i class="${v ? '' : 'zero'}" style="height:${Math.max(3, v / max * 70)}px"></i><span>${+d.slice(8)}</span></div>`; }).join('')}</div></div>

  <h2>設定</h2>
  <div class="card">
    <div class="setting"><div><b>あなたの名前</b><div class="small muted">会話の例文の「Hana」があなたの名前になります</div></div></div>
    <input type="text" id="nameIn" value="${esc(s.name)}" placeholder="例:Yuki" maxlength="20">
    <div class="setting"><div><b>1日の新しい単語</b></div><select data-set="daily">${[5, 10, 15, 20].map(n => `<option value="${n}" ${s.daily === n ? 'selected' : ''}>${n}語</option>`).join('')}</select></div>
    ${sw('kana', 'カタカナ読みを表示', '発音の目安です')}
  </div>

  <h2>アプリとして使う</h2>
  <div class="card small">
    <p><b>iPhone:</b>Safariで開き、共有ボタン <b>⬆️</b> →「<b>ホーム画面に追加</b>」</p>
    <p><b>Android:</b>Chromeのメニュー <b>⋮</b> →「<b>アプリをインストール</b>」または「ホーム画面に追加」</p>
    <p class="muted">ホーム画面に追加すると、オフラインでも使え、学習記録も消えにくくなります。</p>
    <button class="btn btn-main btn-block" id="installBtn" data-act="install" style="display:${deferredPrompt ? 'flex' : 'none'}">📲 インストール</button>
  </div>

  <h2>バックアップ</h2>
  <div class="card">
    <p class="small muted">学習記録はこの端末のブラウザに保存されています。機種変更の前にコピーして保存しておきましょう。</p>
    <div class="row"><button class="btn grow" data-act="export">記録をコピー</button><button class="btn grow" data-act="import">記録を読み込む</button></div>
    <textarea id="backup" rows="3" style="margin-top:10px;display:none" placeholder="ここにバックアップを貼り付け"></textarea>
    <button class="btn btn-teal btn-block" id="importGo" data-act="import-go" style="margin-top:8px;display:none">読み込む</button>
    <button class="btn btn-block btn-sm" style="margin-top:16px;color:var(--bad)" data-act="reset">すべての記録をリセット</button>
  </div>
  <p class="center small muted" style="margin-top:20px">Kolay gelsin! 💗 毎日すこしずつ。</p>`);
  const ni = $('#nameIn');
  ni.addEventListener('change', () => { st.settings.name = ni.value.trim(); save(); toast('保存しました'); });
}

/* ================= router ================= */
function go(hash, replace) {
  if (replace) { history.replaceState(null, '', hash); route(); }
  else if (location.hash === hash) route();
  else location.hash = hash;
}
function route() {
  const h = location.hash.replace(/^#\/?/, '').split('/');
  const [a, b] = h;
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
  learned: () => {
    const it = S.queue[S.idx];
    introduce(it.key); gainXP(5); S.xp += 5;
    S.queue.push({ key: it.key, mode: 'review', dir: 'tr', fromNew: true });
    S.idx++; S.shown = false; viewStudy();
  },
  reveal: () => { S.shown = true; viewStudy(); },
  rate: arg => {
    const r = +arg, it = S.queue[S.idx];
    rate(it.key, r);
    const xp = r === 0 ? 0 : r === 1 ? 1 : 2; if (xp) { gainXP(xp); S.xp += xp; }
    if (r === 0) S.queue.splice(Math.min(S.queue.length, S.idx + 4), 0, { key: it.key, mode: 'review', dir: 'tr' });
    S.idx++; S.shown = false; viewStudy();
  },
  'cat-study': id => startCategory(id),
  'cat-quiz': id => startQuiz(ALL.filter(w => w.cat === id), 'mix', CAT[id].name),
  quiz: type => startQuiz(ALL.filter(w => st.srs[w.key]), type, QTYPES[type] || 'ミックス'),
  'quiz-learned': () => startQuiz(ALL.filter(w => st.srs[w.key]), 'mix', 'ミックス'),
  answer: arg => {
    if (Q.answered) return;
    const it = Q.items[Q.idx], c = it.choices[+arg];
    const correct = it.t === 'ja2tr' ? it.w.tr : it.w.ja;
    answerWord(c === correct, { pick: +arg });
  },
  key: k => { const i = $('#typed'); if (!i) return; const p = i.selectionStart ?? i.value.length; i.value = i.value.slice(0, p) + k + i.value.slice(i.selectionEnd ?? p); i.focus(); i.setSelectionRange(p + 1, p + 1); },
  'type-check': () => {
    const v = ($('#typed') || {}).value || ''; if (!v.trim()) return;
    const w = Q.items[Q.idx].w;
    const answers = w.tr.split('/').map(s => s.trim());
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
    if (ok) { Q.ok++; gainXP(2); }
    viewQuiz();
  },
  seg: s => { talkSeg = s; viewTalk(); },
  hide: h => { dlgHide = h; viewDialog(location.hash.split('/')[2]); },
  line: (i, el) => {
    const d = DIALOGS.find(x => x.id === location.hash.split('/')[2]); const l = d.lines[+i];
    el.classList.remove('hide-tr', 'hide-ja');
  },
  'dlg-done': id => { if (!st.dialogs[id]) { st.dialogs[id] = true; save(); } gainXP(10); toast('Aferin! +10 XP 🎉'); setTimeout(() => go('#/talk'), 700); },
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
      localStorage.setItem(KEY, JSON.stringify(obj)); load(); toast('読み込みました ✅'); viewMe();
    } catch (e) { toast('読み込めませんでした。コピーした文字を確認してください'); }
  },
  reset: () => { if (confirm('すべての学習記録を削除します。本当によろしいですか?')) { localStorage.removeItem(KEY); load(); toast('リセットしました'); viewMe(); } },
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
});

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; const b = $('#installBtn'); if (b) b.style.display = 'flex'; });

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
route();
})();
