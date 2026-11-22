// 問題演習：学科/実技・科目・論点・難易度・出題方法・時間制限を選んで演習
import * as store from '../store.js';
import { bank, stats } from '../core.js';
import { SUBJECTS, LEVELS } from '../../data/subjects.js';
import { esc, shuffle, toast } from '../util.js';
import { startSession } from './session.js';

const F = { exam: 'gakka', subjects: [], topics: [], levels: [], order: 'smart', n: 10, timed: false, status: 'all' };

export function renderPractice(root) {
  const st = store.get();
  const subs = SUBJECTS.filter((s) => s.exam === F.exam);
  const pool = filterPool(st);
  const bmN = Object.keys(st.bm).filter((id) => bank.byId[id]).length;
  const wrongN = Object.entries(st.qs).filter(([id, s]) => bank.byId[id] && s.wrongLast).length;
  root.innerHTML = `<div class="page">
    <div class="page-head"><div><div class="eyebrow">PRACTICE</div><h1>問題演習</h1>
      <p>過去の出題傾向を分析して作成したオリジナル問題です。回答するとすぐに正誤と、各選択肢が誤りである理由が表示されます。</p></div></div>
    <div class="grid g-main">
      <div class="panel"><div class="panel-b" style="padding:20px 22px">
        <label class="f"><span>試験区分</span><div class="seg" data-k="exam">${[['gakka', '学科'], ['jitsugi', '実技（生保顧客資産相談業務）']].map(([k, n]) => `<button data-v="${k}" class="${F.exam === k ? 'on' : ''}">${n}</button>`).join('')}</div></label>
        <label class="f"><span>科目（未選択＝すべて）</span><div class="chips" data-k="subjects">${subs.map((s) => `<button class="chip ${F.subjects.includes(s.id) ? 'on' : ''}" data-v="${s.id}">${esc(s.name)}</button>`).join('')}</div></label>
        ${F.subjects.length === 1 ? `<label class="f"><span>論点</span><div class="chips" data-k="topics">${subs.find((s) => s.id === F.subjects[0]).topics.map(([id, n]) => `<button class="chip ${F.topics.includes(id) ? 'on' : ''}" data-v="${id}">${esc(n)} <span class="muted">${bank.all.filter((q) => q.topic === id).length}</span></button>`).join('')}</div></label>` : ''}
        <label class="f"><span>難易度</span><div class="chips" data-k="levels">${LEVELS.map(([k, n]) => `<button class="chip ${F.levels.includes(k) ? 'on' : ''}" data-v="${k}">${n}</button>`).join('')}</div></label>
        <label class="f"><span>対象</span><div class="seg" data-k="status">${[['all', 'すべて'], ['new', '未解答'], ['wrong', '前回不正解'], ['bm', 'ブックマーク']].map(([k, n]) => `<button data-v="${k}" class="${F.status === k ? 'on' : ''}">${n}</button>`).join('')}</div></label>
        <label class="f"><span>出題順</span><div class="seg" data-k="order">${[['smart', '弱点優先'], ['random', 'ランダム'], ['seq', '論点順']].map(([k, n]) => `<button data-v="${k}" class="${F.order === k ? 'on' : ''}">${n}</button>`).join('')}</div></label>
        <div class="row" style="gap:20px">
          <label class="f" style="width:140px"><span>問題数</span><select id="f-n">${[5, 10, 20, 30, 60].map((n) => `<option ${F.n === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          <label class="check" style="margin-top:8px"><input type="checkbox" id="f-timed" ${F.timed ? 'checked' : ''}> 時間制限あり（本試験ペース：${F.exam === 'gakka' ? '1問2分' : '1問6分'}）</label>
        </div>
        <div class="row between" style="margin-top:8px;border-top:1px solid var(--line);padding-top:14px">
          <span class="small muted">条件に合う問題：<b class="num">${pool.length}</b>問</span>
          <button class="btn primary lg" id="go" ${pool.length ? '' : 'disabled'}>演習を始める</button>
        </div>
      </div></div>
      <div class="stack">
        <div class="panel"><div class="panel-h"><h3>クイック演習</h3></div><div class="panel-b tight"><ul class="list">
          <li><div class="grow"><div class="t">前回不正解の問題</div><div class="m">${wrongN}問</div></div><button class="btn sm" data-q="wrong" ${wrongN ? '' : 'disabled'}>解き直す</button></li>
          <li><div class="grow"><div class="t">ブックマークした問題</div><div class="m">${bmN}問</div></div><button class="btn sm" data-q="bm" ${bmN ? '' : 'disabled'}>演習</button></li>
          <li><div class="grow"><div class="t">計算問題だけ</div><div class="m">${bank.all.filter((q) => q.calc || q.type === 'num').length}問</div></div><button class="btn sm" data-q="calc">10問</button></li>
          <li><div class="grow"><div class="t">学科ランダム10問</div><div class="m">全科目から</div></div><button class="btn sm" data-q="rand">開始</button></li>
        </ul></div></div>
        <div class="panel"><div class="panel-h"><h3>問題バンク</h3></div><div class="panel-b tight">
          ${SUBJECTS.map((s) => { const n = bank.all.filter((q) => q.subject === s.id).length; const seen = bank.all.filter((q) => q.subject === s.id && st.qs[q.id]).length; return `<div class="subj-row" style="grid-template-columns:1fr 4em 4em"><span class="n">${s.exam === 'gakka' ? '学科' : '実技'}・${esc(s.short)}</span><span class="p">${seen}/${n}</span><span class="s">解答済</span></div>`; }).join('')}
        </div></div>
      </div>
    </div></div>`;

  root.querySelectorAll('[data-k]').forEach((g) => g.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-v]'); if (!b) return;
    const k = g.dataset.k, v = k === 'levels' ? Number(b.dataset.v) : b.dataset.v;
    if (Array.isArray(F[k])) F[k] = F[k].includes(v) ? F[k].filter((x) => x !== v) : [...F[k], v];
    else F[k] = v;
    if (k === 'exam') { F.subjects = []; F.topics = []; }
    if (k === 'subjects') F.topics = [];
    renderPractice(root);
  }));
  root.querySelector('#f-n').onchange = (e) => { F.n = Number(e.target.value); };
  root.querySelector('#f-timed').onchange = (e) => { F.timed = e.target.checked; };
  root.querySelector('#go').onclick = () => {
    const ids = order(filterPool(store.get()), st).slice(0, F.n);
    const per = F.exam === 'gakka' ? 120 : 360;
    startSession({ ids, title: '問題演習', timeLimit: F.timed ? ids.length * per : 0, back: '#/practice' });
  };
  root.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => {
    const k = b.dataset.q;
    let ids = [];
    if (k === 'wrong') ids = shuffle(Object.entries(st.qs).filter(([id, s]) => bank.byId[id] && s.wrongLast).map(([id]) => id)).slice(0, 20);
    if (k === 'bm') ids = shuffle(Object.keys(st.bm).filter((id) => bank.byId[id])).slice(0, 20);
    if (k === 'calc') ids = shuffle(bank.all.filter((q) => q.calc || q.type === 'num').map((q) => q.id)).slice(0, 10);
    if (k === 'rand') ids = shuffle(bank.all.filter((q) => q.exam === 'gakka').map((q) => q.id)).slice(0, 10);
    if (!ids.length) return toast('対象の問題がありません');
    startSession({ ids, title: { wrong: '前回不正解の解き直し', bm: 'ブックマーク演習', calc: '計算問題演習', rand: '学科ランダム演習' }[k], back: '#/practice' });
  }));
}

function filterPool(st) {
  return bank.all.filter((q) => {
    if (q.exam !== F.exam) return false;
    if (F.subjects.length && !F.subjects.includes(q.subject)) return false;
    if (F.topics.length && !F.topics.includes(q.topic)) return false;
    if (F.levels.length && !F.levels.includes(q.level)) return false;
    const s = st.qs[q.id];
    if (F.status === 'new' && s) return false;
    if (F.status === 'wrong' && !(s && s.wrongLast)) return false;
    if (F.status === 'bm' && !st.bm[q.id]) return false;
    return true;
  });
}

function order(pool, st) {
  if (F.order === 'random') return shuffle(pool).map((q) => q.id);
  if (F.order === 'seq') return pool.slice().sort((a, b) => (a.topic + a.level + a.id).localeCompare(b.topic + b.level + b.id)).map((q) => q.id);
  // 弱点優先：前回不正解 → 未解答 → 正答率の低い順。実技は同じ事例の問題をまとめる
  const a = stats();
  const sc = (q) => {
    const s = st.qs[q.id];
    const subjP = a.subj[q.subject]?.p ?? 0.5;
    if (!s) return 1 + subjP + Math.random() * 0.5;
    return (s.wrongLast ? 0 : 2) + s.ok / s.n + subjP + Math.random() * 0.3;
  };
  const sorted = shuffle(pool).map((q) => [q, sc(q)]).sort((x, y) => x[1] - y[1]).map((x) => x[0]);
  if (F.exam === 'jitsugi') {
    const first = {};
    sorted.forEach((q, i) => { if (!(q.case in first)) first[q.case] = i; });
    sorted.sort((x, y) => first[x.case] - first[y.case] || x.caseNo - y.caseNo);
  }
  return sorted.map((q) => q.id);
}
