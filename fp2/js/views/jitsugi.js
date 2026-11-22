// 実技試験対策：事例（設例）ごとの演習。設例を読みながら《問1〜3》に回答し、まとめて採点する
import * as store from '../store.js';
import { bank, record, stats, subjName, topicName, lvSteps, toggleBookmark } from '../core.js';
import { JITSUGI } from '../../data/subjects.js';
import { EXAM, SYLLABUS_JITSUGI } from '../../data/exam.js';
import { esc, pct, $, toast, fmtTime, today } from '../util.js';
import { renderAnswer, readEvent, isAnswered, grade, renderExplain, rich, tableHTML, typeLabel } from '../qengine.js';
import { renderDoc } from './casedoc.js';

export function renderJitsugiList(root) {
  const st = store.get();
  const a = stats();
  root.innerHTML = `<div class="page">
    <div class="page-head"><div><div class="eyebrow">PRACTICAL EXAM</div><h1>実技試験対策 ― 生保顧客資産相談業務</h1>
      <p>本試験は事例形式5題（15問）・${EXAM.jitsugi.minutes}分・${EXAM.jitsugi.max}点満点中${EXAM.jitsugi.passScore}点以上で合格。解答形式は〇×・語句群/数値群からの選択・数値の記入です。</p></div>
      <a class="btn gold" href="#/mock" >本番形式の実技模擬試験（90分）</a></div>
    <div class="callout" style="margin-bottom:16px">各事例は、顧客の家族構成・年金加入歴・保険証券・財産の状況などの資料を読み取り、3問に答える構成です。左の資料を参照しながら解答し、最後にまとめて採点します。計算問題は画面の電卓を使う本試験に合わせ、途中計算を自分で書き出す練習をしてください。</div>
    ${JITSUGI.map((s) => {
      const cs = bank.caseList.filter((c) => c.subject === s.id);
      return `<div class="panel" style="margin-bottom:16px"><div class="panel-h"><div><div class="small muted">出題領域 ${esc(s.no)}</div><h3>${esc(s.name)}</h3></div><span class="small muted">推定正答率 ${pct(a.subj[s.id].p)}</span></div>
        <div class="panel-b tight"><ul class="list">${cs.map((c) => {
          const r = st.cases[c.id];
          return `<li><a class="item" href="#/jitsugi/${c.id}"><span class="tag ${r ? (r.best >= 0.6 ? 'ok' : 'warn') : ''}" style="min-width:4.2em;text-align:center">${r ? '最高' + pct(r.best) : '未着手'}</span>
            <div class="grow"><div class="t">${esc(c.title)}</div><div class="m">${lvSteps(c.level || 5)} ${esc(c.theme || '')}</div></div></a></li>`;
        }).join('') || '<li class="small muted">事例を準備中です</li>'}</ul></div></div>`;
    }).join('')}
    <div class="panel"><div class="panel-h"><h3>試験科目及びその範囲の細目（実技：生保顧客資産相談業務）</h3><span class="status verified">公式</span></div><div class="panel-b">
      <ol style="padding-left:1.3em;margin:0">${SYLLABUS_JITSUGI.map(([h, d]) => `<li style="margin-bottom:8px"><b>${esc(h)}</b><br><span class="small">${esc(d)}</span></li>`).join('')}</ol>
      <div class="src">出典：<a href="https://products.kinzai.or.jp/wp-content/uploads/2026/10/fp2_specifications.pdf" target="_blank" rel="noopener">きんざい「2級 試験科目及びその範囲の細目」</a></div></div></div>
  </div>`;
}

let C = null; // 実行中の事例 {id, resp:{}, cur, graded, started}

export function renderCase(root, id) {
  const c = bank.cases[id];
  if (!c) { root.innerHTML = `<div class="page"><div class="empty">事例が見つかりません。<a href="#/jitsugi">一覧へ</a></div></div>`; return; }
  if (!C || C.id !== id) C = { id, resp: {}, cur: 0, graded: false, started: Date.now() };
  const qs = c.questions.map((q) => bank.byId[q.id]);
  const q = qs[C.cur];
  const st = store.get();
  const gr = C.graded ? qs.map((x) => grade(x, C.resp[x.id])) : null;
  const total = gr ? gr.reduce((a, g) => a + g.score, 0) / qs.length : 0;
  root.innerHTML = `<div class="page" style="max-width:1280px">
    <div class="crumb"><a href="#/jitsugi">実技試験対策</a> ／ ${esc(subjName(c.subject))}</div>
    <div class="row between" style="margin-bottom:12px"><h1 style="font-size:19px">${esc(c.title)}</h1>
      <div class="row">${C.graded ? `<span class="tag ${total >= 0.6 ? 'ok' : 'ng'}">得点率 ${pct(total)}</span><button class="btn sm" data-act="again">もう一度解く</button>` : `<span class="small muted" id="cs-time"></span>`}</div></div>
    <div class="case">
      <div class="case-doc">${renderDoc(c)}</div>
      <div class="case-q">
        <div class="case-tabs">${qs.map((x, i) => `<button data-tab="${i}" class="${i === C.cur ? 'on' : ''} ${isAnswered(x, C.resp[x.id]) ? 'done' : ''}">《問${i + 1}》${gr ? (gr[i].ok ? ' ○' : ' ×') : ''}</button>`).join('')}</div>
        <div class="q-meta"><span class="tag">${typeLabel(q)}</span><span class="tag">${esc(topicName(q.topic))}</span>
          <button class="btn sm ghost" data-act="bm" style="margin-left:auto">${st.bm[q.id] ? '★ 保存済み' : '☆ ブックマーク'}</button></div>
        <div class="q-stem">${rich(q.stem)}</div>
        ${tableHTML(q.table)}
        <div id="ans">${renderAnswer(q, C.resp[q.id], { locked: C.graded, reveal: C.graded })}</div>
        ${C.graded ? renderExplain(q, gr[C.cur]) : ''}
        <div class="row between" style="margin-top:18px">
          <button class="btn ghost" data-act="prev" ${C.cur ? '' : 'disabled'}>← 前の問</button>
          ${C.cur < qs.length - 1 ? '<button class="btn" data-act="next">次の問 →</button>' : C.graded ? '<a class="btn" href="#/jitsugi">事例一覧へ</a>' : `<button class="btn primary" data-act="grade">採点する（${qs.filter((x) => isAnswered(x, C.resp[x.id])).length}/${qs.length}問回答済み）</button>`}
        </div>
      </div>
    </div></div>`;

  const ans = $('#ans', root);
  const upd = (e) => {
    if (C.graded) return;
    C.resp[q.id] = readEvent(q, C.resp[q.id], e.target);
    if (q.type === 'tf' || q.type === 'mc') ans.innerHTML = renderAnswer(q, C.resp[q.id]);
    root.querySelector(`[data-tab="${C.cur}"]`).classList.toggle('done', isAnswered(q, C.resp[q.id]));
  };
  ans.addEventListener('click', upd); ans.addEventListener('change', upd); ans.addEventListener('input', upd);
  root.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { C.cur = Number(b.dataset.tab); renderCase(root, id); }));
  root.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => {
    const k = b.dataset.act;
    if (k === 'prev') C.cur--;
    if (k === 'next') C.cur++;
    if (k === 'bm') { toast(toggleBookmark(q.id) ? 'ブックマークしました' : 'ブックマークを外しました'); }
    if (k === 'again') { C = { id, resp: {}, cur: 0, graded: false, started: Date.now() }; }
    if (k === 'grade') {
      const ms = (Date.now() - C.started) / qs.length;
      const gs = qs.map((x) => grade(x, C.resp[x.id]));
      qs.forEach((x, i) => record(x, gs[i], ms, 'case'));
      const sc = gs.reduce((a, g) => a + g.score, 0) / qs.length;
      const s = store.get();
      const r = (s.cases[id] ||= { best: 0, n: 0 });
      r.best = Math.max(r.best, sc); r.last = today(); r.n++;
      store.save();
      C.graded = true; C.cur = 0;
    }
    renderCase(root, id);
  }));
  const t = $('#cs-time', root);
  if (t) t.textContent = `経過 ${fmtTime((Date.now() - C.started) / 1000)}（目安：1事例18分）`;
}
