// 演習セッション（問題演習・復習・レッスン確認テスト・実技事例の演習で共通）
// 1問ずつ出題 → 回答 → 即時採点と解説 → 次へ。結果は解答ログとSRSに記録する。
import { bank, record, toggleBookmark, examTag, levelTag, topicName, originTag } from '../core.js';
import * as store from '../store.js';
import { renderAnswer, readEvent, isAnswered, grade, renderExplain, rich, tableHTML, typeLabel } from '../qengine.js';
import { esc, fmtTime, pct, $, toast } from '../util.js';
import { renderDoc } from './casedoc.js';

let S = null; // 実行中のセッション
let tick = null;

export function startSession({ ids, mode = 'practice', title = '問題演習', timeLimit = 0, back = '#practice' }) {
  ids = ids.filter((id) => bank.byId[id]);
  S = { ids, i: 0, resp: null, graded: null, results: [], mode, title, back, started: Date.now(), qStart: Date.now(), timeLimit, done: false };
  if (location.hash === '#session') window.dispatchEvent(new Event('fp2:render'));
  else location.hash = '#session';
}
export const hasSession = () => !!S;

export function renderSession(root) {
  clearInterval(tick);
  if (!S) { root.innerHTML = `<div class="page"><div class="empty">実行中の演習はありません。<br><a href="#practice">問題演習へ</a></div></div>`; return; }
  if (S.done) return renderSummary(root);
  const q = bank.byId[S.ids[S.i]];
  const st = store.get();
  const c = q.case ? bank.cases[q.case] : null;
  const marked = !!st.bm[q.id];
  const qs = st.qs[q.id];
  const hist = qs ? `<span class="small muted">これまで ${qs.n}回中${qs.ok}回正解</span>` : '<span class="small muted">初めての問題</span>';
  root.innerHTML = `<div class="page ${c ? '' : 'page-narrow'}">
    <div class="row between" style="margin-bottom:12px">
      <div class="crumb" style="margin:0"><a href="${esc(S.back)}">${esc(S.title)}</a> ／ ${S.i + 1} / ${S.ids.length}問</div>
      <div class="row">${S.timeLimit ? `<span class="tag warn num" id="sess-timer">残り ${fmtTime(S.timeLimit - (Date.now() - S.started) / 1000)}</span>` : ''}
        <button class="btn sm ghost" data-act="quit">終了して結果を見る</button></div>
    </div>
    ${progressDots()}
    ${c ? `<div class="case" style="min-height:0;margin-top:14px"><div class="case-doc">${renderDoc(c, q.caseNo)}</div><div class="case-q">${qBody(q, marked, hist)}</div></div>`
        : `<div class="panel" style="margin-top:14px"><div class="panel-b" style="padding:22px 24px">${qBody(q, marked, hist)}</div></div>`}
  </div>`;
  bind(root, q);
  if (S.timeLimit) {
    tick = setInterval(() => {
      const left = S.timeLimit - (Date.now() - S.started) / 1000;
      const el = $('#sess-timer');
      if (!el) return clearInterval(tick);
      el.textContent = `残り ${fmtTime(left)}`;
      if (left <= 0) { clearInterval(tick); toast('制限時間になりました'); finish(); renderSession(root); }
    }, 1000);
  }
}

function progressDots() {
  return `<div class="row" style="gap:3px">${S.ids.map((id, i) => {
    const r = S.results.find((x) => x.i === i);
    const bg = r ? (r.ok ? 'var(--ok)' : r.score > 0 ? 'var(--warn)' : 'var(--ng)') : i === S.i ? 'var(--gold)' : 'var(--track)';
    return `<i style="flex:1;max-width:28px;height:4px;border-radius:2px;background:${bg}"></i>`;
  }).join('')}</div>`;
}

function qBody(q, marked, hist) {
  const g = S.graded;
  return `<div class="q-meta">${examTag(q.exam)}${levelTag(q.level)}<span class="tag">${esc(topicName(q.topic))}</span><span class="tag">${typeLabel(q)}</span>
      ${q.case ? `<span class="tag jitsugi">《問${q.caseNo}》</span>` : ''}
      <button class="btn sm ghost" data-act="bm" style="margin-left:auto" aria-pressed="${marked}">${marked ? '★ 保存済み' : '☆ ブックマーク'}</button></div>
    <div class="q-stem">${rich(q.stem)}</div>
    ${tableHTML(q.table)}
    <div id="ans">${renderAnswer(q, S.resp, { locked: !!g, reveal: !!g })}</div>
    <div class="row between" style="margin-top:16px">
      <div>${hist}　${originTag(q)}</div>
      <div class="row">${g ? `<button class="btn primary" data-act="next">${S.i + 1 < S.ids.length ? '次の問題へ' : '結果を見る'}</button>`
          : `<button class="btn ghost sm" data-act="skip">わからない（解説を見る）</button><button class="btn primary" data-act="check" ${isAnswered(q, S.resp) ? '' : 'disabled'}>回答する</button>`}</div>
    </div>
    ${g ? renderExplain(q, g) + refLinks(q) : ''}`;
}

function refLinks(q) {
  const ls = bank.lessons.filter((l) => l.topics?.includes(q.topic)).slice(0, 2);
  if (!ls.length) return '';
  return `<div class="src">関連レッスン：${ls.map((l) => `<a href="#lesson-${l.id}">${esc(l.title)}</a>`).join('　')}</div>`;
}

function bind(root, q) {
  const ans = $('#ans', root);
  const update = (e) => {
    if (S.graded) return;
    S.resp = readEvent(q, S.resp, e.target);
    if (q.type === 'mc' || q.type === 'tf') ans.innerHTML = renderAnswer(q, S.resp);
    const btn = $('[data-act=check]', root);
    if (btn) btn.disabled = !isAnswered(q, S.resp);
  };
  ans.addEventListener('click', update);
  ans.addEventListener('change', update);
  ans.addEventListener('input', update);
  root.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => act(b.dataset.act, root, q)));
  document.onkeydown = (e) => {
    if (location.hash !== '#session' || e.target.matches('input,select,textarea')) {
      if (e.key === 'Enter' && e.target.matches('input')) { const c = $('[data-act=check]', root); if (c && !c.disabled) c.click(); }
      return;
    }
    if (!S.graded && q.type === 'mc' && /^[1-5]$/.test(e.key) && Number(e.key) <= q.choices.length) {
      S.resp = Number(e.key) - 1; ans.innerHTML = renderAnswer(q, S.resp);
      $('[data-act=check]', root).disabled = false;
    } else if (e.key === 'Enter') {
      const b = $(S.graded ? '[data-act=next]' : '[data-act=check]', root);
      if (b && !b.disabled) { e.preventDefault(); b.click(); }
    }
  };
}

function act(a, root, q) {
  if (a === 'bm') { const on = toggleBookmark(q.id); toast(on ? 'ブックマークに追加しました' : 'ブックマークを外しました'); return renderSession(root); }
  if (a === 'check' || a === 'skip') {
    const ms = Date.now() - S.qStart;
    S.graded = a === 'skip' ? { score: 0, ok: false, parts: [], skipped: true } : grade(q, S.resp);
    S.results.push({ i: S.i, q: q.id, ok: S.graded.ok, score: S.graded.score, ms });
    record(q, S.graded, ms, S.mode);
    store.save();
    return renderSession(root);
  }
  if (a === 'next') {
    S.i++; S.resp = null; S.graded = null; S.qStart = Date.now();
    if (S.i >= S.ids.length) finish();
    renderSession(root);
    window.scrollTo(0, 0);
    return;
  }
  if (a === 'quit') { finish(); renderSession(root); }
}

function finish() { S.done = true; clearInterval(tick); document.onkeydown = null; }

function renderSummary(root) {
  const r = S.results;
  const ok = r.filter((x) => x.ok).length;
  const wrong = r.filter((x) => !x.ok).map((x) => x.q);
  const avg = r.length ? r.reduce((a, x) => a + x.ms, 0) / r.length / 1000 : 0;
  root.innerHTML = `<div class="page page-narrow">
    <div class="page-head"><div><div class="eyebrow">RESULT</div><h1>${esc(S.title)}の結果</h1></div></div>
    <div class="kpis" style="grid-template-columns:repeat(3,1fr)">
      <div class="kpi"><div class="l">正解数</div><div class="v">${ok}<small>/ ${r.length}問</small></div></div>
      <div class="kpi"><div class="l">正答率</div><div class="v">${r.length ? pct(ok / r.length) : '—'}</div></div>
      <div class="kpi"><div class="l">1問あたり</div><div class="v">${Math.round(avg)}<small>秒</small></div></div>
    </div>
    <div class="panel" style="margin-top:16px"><div class="panel-h"><h3>解答一覧</h3></div><div class="panel-b tight"><ul class="list">
      ${r.map((x) => { const q = bank.byId[x.q]; return `<li><span class="tag ${x.ok ? 'ok' : 'ng'}">${x.ok ? '正解' : '不正解'}</span><div class="grow"><div class="t">${esc(q.stem.replace(/\*\*/g, '').slice(0, 70))}${q.stem.length > 70 ? '…' : ''}</div><div class="m">${esc(topicName(q.topic))}・${Math.round(x.ms / 1000)}秒</div></div></li>`; }).join('') || '<li class="empty">解答はありません</li>'}
    </ul></div></div>
    <div class="row" style="margin-top:18px">
      ${wrong.length ? `<button class="btn primary" data-act="retry">間違えた${wrong.length}問をもう一度</button>` : ''}
      <a class="btn" href="${esc(S.back)}">戻る</a><a class="btn ghost" href="#home">ダッシュボード</a>
    </div>
    <p class="small muted" style="margin-top:14px">間違えた問題は復習スケジュール（翌日）に自動で追加されました。</p>
  </div>`;
  const rb = $('[data-act=retry]', root);
  if (rb) rb.onclick = () => { startSession({ ids: wrong, mode: S.mode, title: '間違えた問題の再挑戦', back: S.back }); };
}
