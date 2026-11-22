// 復習システム（間隔反復）：今日の復習・期限切れ・苦手・定着済み・科目別
import * as store from '../store.js';
import { bank, stats, topicName, subjName } from '../core.js';
import { SUBJECTS } from '../../data/subjects.js';
import { esc, today, shortDate, shuffle, toast, daysBetween } from '../util.js';
import { MASTER_IV } from '../srs.js';
import { startSession } from './session.js';

let tab = 'due';

export function renderReview(root) {
  const st = store.get();
  const a = stats();
  const lists = {
    due: { name: '今日の復習', ids: a.due, desc: '復習予定日が今日以前の問題です。' },
    overdue: { name: '期限切れ', ids: a.overdue, desc: '予定日を過ぎています。記憶が薄れる前に優先して解きましょう。' },
    difficult: { name: '苦手な問題', ids: a.difficult, desc: '2回以上間違えた、または直近で不正解の問題です。' },
    mastered: { name: '定着済み', ids: a.mastered, desc: `復習間隔が${MASTER_IV}日以上に伸び、3回以上連続で正解した問題です。` },
    bm: { name: 'ブックマーク', ids: Object.keys(st.bm).filter((id) => bank.byId[id]), desc: '自分で保存した問題です。' },
  };
  const L = lists[tab];
  const bySubj = SUBJECTS.map((s) => ({ s, ids: a.due.filter((id) => bank.byId[id].subject === s.id) })).filter((x) => x.ids.length);
  // 今後14日間の復習予定数
  const fut = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; return [k, Object.entries(st.qs).filter(([id, s]) => bank.byId[id] && s.due === k).length]; });
  const max = Math.max(1, ...fut.map((x) => x[1]));
  const sortIds = (ids) => ids.slice().sort((x, y) => (st.qs[x]?.due || '').localeCompare(st.qs[y]?.due || ''));

  root.innerHTML = `<div class="page">
    <div class="page-head"><div><div class="eyebrow">REVIEW</div><h1>復習</h1>
      <p>間違えた問題は翌日に、正解した問題は 3日 → 6日 → 約2週間 … と間隔を伸ばして再出題します。時間がかかった正解は「あいまい」として間隔を短めにします。</p></div>
      <button class="btn primary lg" data-go="due" ${a.due.length ? '' : 'disabled'}>今日の復習を始める（${a.due.length}問）</button></div>
    <div class="kpis" style="grid-template-columns:repeat(4,1fr)">
      <div class="kpi"><div class="l">今日の復習</div><div class="v">${a.due.length}<small>問</small></div></div>
      <div class="kpi"><div class="l">期限切れ</div><div class="v" style="color:${a.overdue.length ? 'var(--ng)' : ''}">${a.overdue.length}<small>問</small></div></div>
      <div class="kpi"><div class="l">苦手</div><div class="v">${a.difficult.length}<small>問</small></div></div>
      <div class="kpi"><div class="l">定着済み</div><div class="v">${a.mastered.length}<small>問</small></div></div>
    </div>
    <div class="grid g-main" style="margin-top:16px">
      <div class="panel"><div class="panel-h" style="flex-wrap:wrap"><div class="seg" id="rv-tab">${Object.entries(lists).map(([k, v]) => `<button data-v="${k}" class="${tab === k ? 'on' : ''}">${v.name} ${v.ids.length}</button>`).join('')}</div>
        ${L.ids.length ? `<button class="btn sm" data-go="${tab}">この${Math.min(L.ids.length, 30)}問を解く</button>` : ''}</div>
        <div class="panel-b tight"><p class="small muted" style="margin:8px 0">${esc(L.desc)}</p><ul class="list">
        ${sortIds(L.ids).slice(0, 60).map((id) => { const q = bank.byId[id]; const s = st.qs[id];
          return `<li><div class="grow"><div class="t">${esc(q.stem.replace(/\*\*/g, '').slice(0, 64))}…</div><div class="m">${esc(subjName(q.subject))} ・ ${esc(topicName(q.topic))} ・ ${s ? `${s.n}回中${s.ok}回正解 ・ 次回 ${shortDate(s.due)}${s.due < today() ? `（${daysBetween(s.due, today())}日超過）` : ''}` : '未解答'}</div></div></li>`; }).join('') || '<li class="empty">該当する問題はありません</li>'}
        </ul></div></div>
      <div class="stack">
        <div class="panel"><div class="panel-h"><h3>科目別の今日の復習</h3></div><div class="panel-b tight"><ul class="list">
          ${bySubj.map(({ s, ids }) => `<li><div class="grow"><div class="t">${esc(s.name)}</div><div class="m">${s.exam === 'gakka' ? '学科' : '実技'}</div></div><button class="btn sm" data-subj="${s.id}">${ids.length}問</button></li>`).join('') || '<li class="small muted">今日の復習はありません</li>'}
        </ul></div></div>
        <div class="panel"><div class="panel-h"><h3>今後14日間の復習量</h3></div><div class="panel-b">
          <div style="display:flex;align-items:flex-end;gap:4px;height:90px">${fut.map(([d, n]) => `<div title="${d}：${n}問" style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%"><span class="small muted num" style="font-size:10px">${n || ''}</span><i style="display:block;width:100%;height:${(n / max) * 70}px;background:var(--chart);border-radius:2px 2px 0 0;min-height:${n ? 2 : 0}px"></i></div>`).join('')}</div>
          <div style="display:flex;gap:4px;margin-top:4px">${fut.map(([d]) => `<span class="small muted" style="flex:1;text-align:center;font-size:10px">${Number(d.slice(8))}</span>`).join('')}</div>
        </div></div>
      </div>
    </div></div>`;
  root.querySelectorAll('#rv-tab button').forEach((b) => (b.onclick = () => { tab = b.dataset.v; renderReview(root); }));
  root.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => {
    const k = b.dataset.go;
    const ids = (k === 'due' || k === 'overdue' ? sortIds(lists[k].ids) : shuffle(lists[k].ids)).slice(0, 30);
    if (!ids.length) return toast('対象の問題がありません');
    startSession({ ids: groupCases(ids), mode: 'review', title: lists[k].name, back: '#review' });
  }));
  root.querySelectorAll('[data-subj]').forEach((b) => (b.onclick = () => {
    const ids = a.due.filter((id) => bank.byId[id].subject === b.dataset.subj).slice(0, 30);
    startSession({ ids: groupCases(ids), mode: 'review', title: `${subjName(b.dataset.subj)}の復習`, back: '#review' });
  }));
}

// 実技は同じ事例の問題が続くように並べる
function groupCases(ids) {
  const first = {};
  ids.forEach((id, i) => { const c = bank.byId[id].case || id; if (!(c in first)) first[c] = i; });
  return ids.slice().sort((x, y) => first[bank.byId[x].case || x] - first[bank.byId[y].case || y] || (bank.byId[x].caseNo || 0) - (bank.byId[y].caseNo || 0));
}
