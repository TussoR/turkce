// 模擬試験（CBT形式）：カウントダウン・問題ナビゲーション・見直しマーク・解答一覧・自動採点。
// 試験終了まで正誤・解答は一切表示しない。実施中の状態は保存され、再読み込みしても再開できる。
import * as store from '../store.js';
import { bank, record, subjName, topicName } from '../core.js';
import { GAKKA, JITSUGI, SUBJ } from '../../data/subjects.js';
import { EXAM } from '../../data/exam.js';
import { esc, shuffle, fmtTime, pct, uid, confirmDialog, today, jpDate, toast, $ } from '../util.js';
import { renderAnswer, readEvent, isAnswered, grade, renderExplain, rich, tableHTML, typeLabel } from '../qengine.js';
import { renderDoc } from './casedoc.js';

const KINDS = {
  gakka: { name: '学科模擬試験', desc: `四答択一式${EXAM.gakka.questions}問・${EXAM.gakka.minutes}分`, sections: ['gakka'] },
  jitsugi: { name: '実技模擬試験（生保顧客資産相談業務）', desc: `事例形式5題（15問）・${EXAM.jitsugi.minutes}分`, sections: ['jitsugi'] },
  sogo: { name: '総合模擬試験', desc: `学科${EXAM.gakka.minutes}分 → 実技${EXAM.jitsugi.minutes}分（連続実施）`, sections: ['gakka', 'jitsugi'] },
};

// ===== 出題の組み立て =====
// 学科：6科目×10問。各科目の論点に散らし、標準以上の難易度を優先。直近の模試で出た問題は避ける
export function buildGakka(recent = new Set()) {
  const ids = [];
  for (const s of GAKKA) {
    const pool = bank.all.filter((q) => q.exam === 'gakka' && q.subject === s.id);
    const pref = shuffle(pool).sort((a, b) => (recent.has(a.id) - recent.has(b.id)) || ((b.level >= 3) - (a.level >= 3)));
    const byTopic = {};
    for (const q of pref) (byTopic[q.topic] ||= []).push(q);
    const picked = [];
    const topics = shuffle(Object.keys(byTopic));
    while (picked.length < 10 && topics.some((t) => byTopic[t].length)) {
      for (const t of topics) { if (picked.length < 10 && byTopic[t].length) picked.push(byTopic[t].shift()); }
    }
    ids.push(...picked.map((q) => q.id));
  }
  return ids;
}
// 実技：出題領域ごとに1事例（第1問〜第5問）
export function buildJitsugi(recent = new Set()) {
  const ids = [];
  for (const s of JITSUGI) {
    const cs = shuffle(bank.caseList.filter((c) => c.subject === s.id)).sort((a, b) => recent.has(a.questions[0].id) - recent.has(b.questions[0].id));
    if (cs[0]) ids.push(...cs[0].questions.map((q) => q.id));
  }
  return ids;
}

function recentIds() {
  const st = store.get();
  return new Set(st.mocks.slice(-3).flatMap((m) => m.sections.flatMap((s) => s.ids)));
}

// ===== 採点 =====
// 学科：1問1点。実技：1問 50/15 点、〇×・空欄は正解した項目の割合で部分点（配点非公表のため推定）
export function scoreSection(sec, resp) {
  const per = sec.kind === 'gakka' ? 1 : EXAM.jitsugi.max / EXAM.jitsugi.questions;
  let score = 0;
  const items = sec.ids.map((id) => {
    const q = bank.byId[id];
    const g = grade(q, resp[id]);
    const pts = sec.kind === 'gakka' ? (g.ok ? 1 : 0) : per * g.score;
    score += pts;
    return { id, ok: g.ok, score: g.score, pts, answered: isAnswered(q, resp[id]) };
  });
  const max = sec.kind === 'gakka' ? EXAM.gakka.max : EXAM.jitsugi.max;
  const pass = sec.kind === 'gakka' ? EXAM.gakka.passScore : EXAM.jitsugi.passScore;
  score = Math.round(score * 10) / 10;
  const bySubj = {};
  for (const it of items) {
    const sid = bank.byId[it.id].subject;
    const b = (bySubj[sid] ||= { n: 0, pts: 0, max: 0 });
    b.n++; b.pts += it.pts; b.max += per;
  }
  return { score, max, pass, passed: score >= pass, items, bySubj };
}

// ===== ホーム =====
export function renderMockHome(root) {
  const st = store.get();
  const act = st.active;
  root.innerHTML = `<div class="page">
    <div class="page-head"><div><div class="eyebrow">MOCK EXAM</div><h1>模擬試験</h1>
      <p>本試験（CBT方式）と同じ問題数・制限時間で実施します。終了するまで正解・解説は表示されません。</p></div></div>
    ${act ? `<div class="callout gold" style="margin-bottom:16px"><b>実施中の模擬試験があります：</b>${esc(KINDS[act.kind].name)}（${jpDate(act.date)}開始）
      <div class="row" style="margin-top:8px"><a class="btn primary sm" href="#mock-run">再開する</a><button class="btn sm ghost" data-act="discard">破棄する</button></div></div>` : ''}
    <div class="grid g3">${Object.entries(KINDS).map(([k, v]) => `<div class="panel"><div class="panel-b" style="padding:20px">
      <div class="small muted">${k === 'sogo' ? '学科＋実技' : k === 'gakka' ? '学科試験' : '実技試験'}</div>
      <h3 style="margin:4px 0 6px">${esc(v.name)}</h3><p class="small">${esc(v.desc)}<br>合格基準：${k === 'jitsugi' ? `${EXAM.jitsugi.passScore}/${EXAM.jitsugi.max}点` : k === 'gakka' ? `${EXAM.gakka.passScore}/${EXAM.gakka.max}点` : `学科${EXAM.gakka.passScore}点・実技${EXAM.jitsugi.passScore}点の両方`}</p>
      <button class="btn ${k === 'sogo' ? 'gold' : 'primary'} block" data-start="${k}" ${act ? 'disabled' : ''}>開始する</button></div></div>`).join('')}</div>
    <div class="panel" style="margin-top:16px"><div class="panel-h"><h3>受験履歴</h3></div><div class="panel-b tight">
      ${st.mocks.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>実施日</th><th>種類</th><th class="r">学科</th><th class="r">実技</th><th>判定</th><th>所要時間</th><th></th></tr></thead><tbody>
        ${st.mocks.slice().reverse().map((m) => { const g = m.sections.find((s) => s.kind === 'gakka'), j = m.sections.find((s) => s.kind === 'jitsugi');
          return `<tr><td>${jpDate(m.date)}</td><td>${esc(KINDS[m.kind].name)}</td><td class="r">${g ? `${g.result.score}/${g.result.max}` : '—'}</td><td class="r">${j ? `${j.result.score}/${j.result.max}` : '—'}</td>
          <td>${m.passed ? '<span class="tag ok">合格基準到達</span>' : '<span class="tag ng">基準未達</span>'}</td><td class="small">${m.sections.map((s) => fmtTime(s.used)).join(' / ')}</td><td><a href="#result-${m.id}">結果と解説</a></td></tr>`; }).join('')}
      </tbody></table></div>` : '<div class="empty">まだ模擬試験を受けていません</div>'}</div></div>
    <p class="small muted" style="margin-top:12px">※ 実技の1問あたりの配点は公表されていないため、均等配点（50点÷15問）と部分点で推定採点しています。学科は1問1点です。</p>
  </div>`;
  root.querySelectorAll('[data-start]').forEach((b) => (b.onclick = async () => {
    const k = b.dataset.start;
    const ok = await confirmDialog(KINDS[k].name, `<p>${esc(KINDS[k].desc)}。開始するとタイマーが動きます。</p><p>途中で画面を離れた場合はタイマーが一時停止し、結果に「中断あり」と記録されます。本番同様、時間を通して解くことをおすすめします。</p>`, '開始する');
    if (!ok) return;
    const recent = recentIds();
    const st2 = store.get();
    st2.active = {
      id: uid(), kind: k, date: today(), resp: {}, flags: {}, sec: 0, i: 0, paused: 0,
      sections: KINDS[k].sections.map((s) => ({ kind: s, ids: s === 'gakka' ? buildGakka(recent) : buildJitsugi(recent), minutes: s === 'gakka' ? EXAM.gakka.minutes : EXAM.jitsugi.minutes, used: 0 })),
      resumed: Date.now(),
    };
    store.save();
    location.hash = '#mock-run';
  }));
  const d = root.querySelector('[data-act=discard]');
  if (d) d.onclick = async () => { if (await confirmDialog('模擬試験を破棄', '実施中の解答はすべて失われます。', '破棄する')) { store.get().active = null; store.save(); renderMockHome(root); } };
}

// ===== 実施画面 =====
let timer = null;
function elapsed(a) { const s = a.sections[a.sec]; return s.used + (Date.now() - a.resumed) / 1000; }
function persistTime(a) { const s = a.sections[a.sec]; s.used = elapsed(a); a.resumed = Date.now(); }

export function renderMockRun(root) {
  clearInterval(timer);
  const st = store.get();
  const a = st.active;
  if (!a) { location.hash = '#mock'; return; }
  // 問題データが更新されて保存中の模試の問題が見つからない場合は、実施中の模試を破棄する
  if (!a.sections?.length || a.sections.some((s) => !s.ids.length || s.ids.some((id) => !bank.byId[id]))) {
    st.active = null; store.save(); toast('問題データが更新されたため、実施中の模擬試験を終了しました'); location.hash = '#mock'; return;
  }
  if (!a.resumed || a.left) { a.resumed = Date.now(); if (a.left) { a.paused++; a.left = false; } }
  const sec = a.sections[a.sec];
  const q = bank.byId[sec.ids[a.i]];
  const c = q.case ? bank.cases[q.case] : null;
  const limit = sec.minutes * 60;
  const nAns = sec.ids.filter((id) => isAnswered(bank.byId[id], a.resp[id])).length;
  root.innerHTML = `<div class="cbt">
    <div class="cbt-head"><div class="ttl">${esc(KINDS[a.kind].name)}${a.sections.length > 1 ? ` ／ ${sec.kind === 'gakka' ? '学科' : '実技'}` : ''}</div>
      <div class="small" style="opacity:.75">${a.i + 1} / ${sec.ids.length}問 ・ 回答済 <span id="mk-count">${nAns}</span></div>
      <div class="timer" id="mk-timer" aria-live="off">${fmtTime(limit - elapsed(a))}</div></div>
    <div class="cbt-body">
      <div class="cbt-q">
        <div class="row between" style="margin-bottom:10px"><div class="serif" style="font-size:17px;color:var(--heading)">問題 ${a.i + 1}${q.case ? `<span class="small muted" style="font-family:var(--sans)">　【第${Math.floor(a.i / 3) + 1}問】《問${a.i + 1}》</span>` : ''}</div>
          <label class="check small"><input type="checkbox" id="mk-flag" ${a.flags[q.id] ? 'checked' : ''}> 見直しマークをつける</label></div>
        ${c ? `<details class="note" style="margin-bottom:14px" ${a.docOpen !== false ? 'open' : ''} id="mk-doc"><summary style="cursor:pointer;font-weight:600">《設例》${esc(c.title)}（クリックで開閉）</summary><div style="margin-top:8px">${renderDoc(c)}</div></details>` : ''}
        <div class="q-stem">${rich(q.stem)}</div>${tableHTML(q.table)}
        <div id="ans">${renderAnswer(q, a.resp[q.id])}</div>
      </div>
      <aside class="cbt-side">
        <div class="small muted" style="margin-bottom:6px">問題一覧</div>
        <div class="qgrid">${a.sections.map((s, si) => (si === a.sec ? sectionGrid(a, s) : '')).join('')}</div>
        <div class="legend"><span><i style="background:var(--accent-soft)"></i>回答済</span><span><i></i>未回答</span><span><i style="border-color:var(--ng);background:linear-gradient(225deg,var(--ng) 30%,var(--surface) 30%)"></i>見直し</span></div>
        <hr class="sep">
        <button class="btn block sm" data-act="sheet">解答一覧（見直し）</button>
        <button class="btn block sm" style="margin-top:6px" data-act="suspend">中断して保存</button>
      </aside>
    </div>
    <div class="cbt-foot">
      <button class="btn" data-act="prev" ${a.i ? '' : 'disabled'}>← 前へ</button>
      <button class="btn" data-act="next" ${a.i < sec.ids.length - 1 ? '' : 'disabled'}>次へ →</button>
      <button class="btn primary" data-act="end">${a.sec < a.sections.length - 1 ? 'この試験を終了して次へ' : '試験を終了する'}</button>
    </div></div>`;

  const ans = $('#ans', root);
  const upd = (e) => {
    a.resp[q.id] = readEvent(q, a.resp[q.id], e.target);
    if (q.type === 'mc' || q.type === 'tf') ans.innerHTML = renderAnswer(q, a.resp[q.id]);
    persistTime(a); store.save();
    const cell = root.querySelector(`[data-go="${a.i}"]`);
    if (cell) cell.classList.toggle('ans', isAnswered(q, a.resp[q.id]));
    const cnt = $('#mk-count', root);
    if (cnt) cnt.textContent = sec.ids.filter((id) => isAnswered(bank.byId[id], a.resp[id])).length;
  };
  ans.addEventListener('click', upd); ans.addEventListener('change', upd);
  ans.addEventListener('input', (e) => { a.resp[q.id] = readEvent(q, a.resp[q.id], e.target); });
  const doc = $('#mk-doc', root);
  if (doc) doc.addEventListener('toggle', () => { a.docOpen = doc.open; });
  $('#mk-flag', root).onchange = (e) => { if (e.target.checked) a.flags[q.id] = true; else delete a.flags[q.id]; persistTime(a); store.save(); renderMockRun(root); };
  root.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => go(root, a, Number(b.dataset.go))));
  root.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => action(root, a, b.dataset.act)));
  document.onkeydown = (e) => {
    if (e.target.matches('input,select,textarea')) return;
    if (e.key === 'ArrowRight' && a.i < sec.ids.length - 1) go(root, a, a.i + 1);
    if (e.key === 'ArrowLeft' && a.i > 0) go(root, a, a.i - 1);
    if (q.type === 'mc' && /^[1-4]$/.test(e.key) && Number(e.key) <= q.choices.length) { a.resp[q.id] = Number(e.key) - 1; persistTime(a); store.save(); renderMockRun(root); }
  };
  const tEl = $('#mk-timer', root);
  timer = setInterval(() => {
    if (!document.body.contains(tEl)) { clearInterval(timer); return; }
    const left = limit - elapsed(a);
    tEl.textContent = fmtTime(left);
    tEl.classList.toggle('low', left < 600);
    if (left <= 0) { clearInterval(timer); toast('試験時間が終了しました'); endSection(root, a, true); }
  }, 1000);
  // 画面を離れたら時間を保存して一時停止
  window.onbeforeunload = () => { persistTime(a); a.left = true; store.save(); };
}

export function leaveMock() {
  clearInterval(timer);
  window.onbeforeunload = null;
  const a = store.get().active;
  if (a && !a.left) { persistTime(a); a.left = true; store.save(); }
}

function sectionGrid(a, s) {
  return s.ids.map((id, i) => {
    const q = bank.byId[id];
    const head = s.kind === 'gakka' && i % 10 === 0 ? `<div class="sec">${esc(SUBJ[q.subject].name)}</div>` : s.kind === 'jitsugi' && i % 3 === 0 ? `<div class="sec">第${i / 3 + 1}問</div>` : '';
    return `${head}<button data-go="${i}" class="${isAnswered(q, a.resp[id]) ? 'ans' : ''} ${a.flags[id] ? 'flag' : ''} ${i === a.i ? 'cur' : ''}" aria-label="問題${i + 1}">${i + 1}</button>`;
  }).join('');
}

function go(root, a, i) { persistTime(a); a.i = i; store.save(); renderMockRun(root); window.scrollTo(0, 0); }

async function action(root, a, k) {
  const sec = a.sections[a.sec];
  if (k === 'prev') return go(root, a, a.i - 1);
  if (k === 'next') return go(root, a, a.i + 1);
  if (k === 'suspend') { persistTime(a); a.left = true; store.save(); clearInterval(timer); window.onbeforeunload = null; location.hash = '#mock'; return; }
  if (k === 'sheet') return sheet(root, a);
  if (k === 'end') {
    const un = sec.ids.filter((id) => !isAnswered(bank.byId[id], a.resp[id])).length;
    const fl = sec.ids.filter((id) => a.flags[id]).length;
    const ok = await confirmDialog('試験を終了しますか？', `<p>未回答：<b>${un}問</b>　見直しマーク：<b>${fl}問</b></p><p>終了すると、この試験の解答は変更できません。</p>`, '終了する', '問題に戻る');
    if (ok) endSection(root, a, false);
  }
}

function sheet(root, a) {
  const sec = a.sections[a.sec];
  const m = document.getElementById('modal');
  m.innerHTML = `<div class="modal-back"></div><div class="modal-card" style="max-width:640px;margin-top:8vh"><h3>解答一覧</h3>
    <div class="modal-body" style="max-height:60vh;overflow:auto"><table class="tbl"><thead><tr><th>問題</th><th>科目・論点</th><th>状態</th></tr></thead><tbody>
    ${sec.ids.map((id, i) => { const q = bank.byId[id]; const ans = isAnswered(q, a.resp[id]); return `<tr><td><button class="link" data-g="${i}">問題${i + 1}</button></td><td class="small">${esc(topicName(q.topic))}</td><td>${ans ? '<span class="tag">回答済</span>' : '<span class="tag ng">未回答</span>'} ${a.flags[id] ? '<span class="tag warn">見直し</span>' : ''}</td></tr>`; }).join('')}
    </tbody></table></div><div class="modal-actions"><button class="btn" data-x>閉じる</button></div></div>`;
  m.classList.add('open');
  const close = () => { m.classList.remove('open'); m.innerHTML = ''; };
  m.querySelector('.modal-back').onclick = close;
  m.querySelector('[data-x]').onclick = close;
  m.querySelectorAll('[data-g]').forEach((b) => (b.onclick = () => { close(); go(root, a, Number(b.dataset.g)); }));
}

function endSection(root, a, timeout) {
  persistTime(a);
  const sec = a.sections[a.sec];
  sec.used = Math.min(sec.used, sec.minutes * 60);
  sec.timeout = timeout;
  if (a.sec < a.sections.length - 1) {
    a.sec++; a.i = 0; a.resumed = Date.now(); store.save();
    confirmDialog('学科試験が終了しました', `<p>続いて実技試験（${EXAM.jitsugi.minutes}分）を開始します。準備ができたら開始してください。</p>`, '実技試験を開始', 'あとで再開').then((go2) => {
      a.resumed = Date.now(); if (!go2) { a.left = true; store.save(); location.hash = '#mock'; return; }
      store.save(); renderMockRun(root);
    });
    return;
  }
  finishMock(a);
}

function finishMock(a) {
  const st = store.get();
  window.onbeforeunload = null;
  clearInterval(timer);
  const sections = a.sections.map((s) => {
    const result = scoreSection(s, a.resp);
    return { kind: s.kind, ids: s.ids, used: Math.round(s.used), timeout: !!s.timeout, result };
  });
  // 解答ログ・復習スケジュールへの反映（1問あたりの時間は区分の平均）
  for (const s of sections) {
    const per = (s.used * 1000) / s.ids.length;
    s.result.items.forEach((it) => { if (it.answered) record(bank.byId[it.id], { ok: it.ok, score: it.score }, per, 'mock'); });
  }
  const m = { id: a.id, kind: a.kind, date: a.date, end: today(), sections, resp: a.resp, paused: a.paused || 0, passed: sections.every((s) => s.result.passed) };
  st.mocks.push(m);
  if (st.mocks.length > 30) st.mocks = st.mocks.slice(-30);
  st.active = null;
  store.save();
  location.hash = `#result-${m.id}`;
}

// ===== 結果 =====
export function renderMockResult(root, id) {
  const st = store.get();
  const m = st.mocks.find((x) => x.id === id);
  if (!m) { root.innerHTML = `<div class="page"><div class="empty">結果が見つかりません。<a href="#mock">模擬試験へ</a></div></div>`; return; }
  const view = new URLSearchParams(location.hash.split('?')[1] || '');
  root.innerHTML = `<div class="page">
    <div class="crumb"><a href="#mock">模擬試験</a> ／ 結果</div>
    <div class="page-head"><div><div class="eyebrow">RESULT</div><h1>${esc(KINDS[m.kind].name)}の結果</h1><p>${jpDate(m.date)}実施${m.paused ? `（中断${m.paused}回あり）` : ''}</p></div>
      <div>${m.passed ? '<span class="tag ok" style="font-size:15px;padding:4px 14px">合格基準に到達</span>' : '<span class="tag ng" style="font-size:15px;padding:4px 14px">合格基準に未達</span>'}</div></div>
    <div class="grid ${m.sections.length > 1 ? 'g2' : ''}">${m.sections.map((s) => sectionSummary(s)).join('')}</div>
    <div class="callout" style="margin-top:16px">${advice(m)}</div>
    ${m.sections.map((s, si) => `<div class="panel" style="margin-top:16px"><div class="panel-h"><h3>${s.kind === 'gakka' ? '学科' : '実技'}：全問題の解答と解説</h3><span class="small muted">クリックで解説を表示</span></div>
      <div class="panel-b tight">${s.result.items.map((it, i) => reviewItem(m, s, it, i)).join('')}</div></div>`).join('')}
    <div class="row" style="margin-top:18px"><a class="btn primary" href="#review">間違えた問題を復習する</a><a class="btn" href="#analysis">弱点分析を見る</a><a class="btn ghost" href="#mock">模擬試験トップ</a></div>
  </div>`;
  root.querySelectorAll('details[data-q]').forEach((d) => d.addEventListener('toggle', () => {
    if (!d.open || d.dataset.loaded) return;
    d.dataset.loaded = 1;
    const q = bank.byId[d.dataset.q];
    const c = q.case ? bank.cases[q.case] : null;
    d.querySelector('.ex').innerHTML = `${c && q.caseNo === 1 ? `<details class="note" style="margin-bottom:10px"><summary>設例を表示</summary>${renderDoc(c)}</details>` : ''}
      <div class="q-stem">${rich(q.stem)}</div>${tableHTML(q.table)}${renderAnswer(q, m.resp[q.id], { locked: true, reveal: true })}${renderExplain(q, grade(q, m.resp[q.id]))}`;
  }));
}

function sectionSummary(s) {
  const r = s.result;
  const isG = s.kind === 'gakka';
  const rows = Object.entries(r.bySubj).map(([sid, b]) => `<tr><td>${esc(SUBJ[sid].name)}</td><td class="r">${isG ? `${b.pts}/${b.n}` : `${b.pts.toFixed(1)}/${b.max.toFixed(1)}`}</td><td style="width:40%"><div class="bar ${b.pts / b.max < 0.6 ? 'ng' : 'ok'}"><i style="width:${(b.pts / b.max) * 100}%"></i></div></td></tr>`).join('');
  return `<div class="panel"><div class="panel-h"><h3>${isG ? '学科試験' : '実技試験（生保顧客資産相談業務）'}</h3>${r.passed ? '<span class="tag ok">基準到達</span>' : '<span class="tag ng">基準未達</span>'}</div>
    <div class="panel-b"><div class="row" style="gap:24px;align-items:baseline"><div class="serif" style="font-size:36px;color:var(--heading)">${r.score}<span class="small muted"> / ${r.max}点</span></div>
      <div class="small muted">合格基準 ${r.pass}点 ・ 所要 ${fmtTime(s.used)}${s.timeout ? '（時間切れ）' : ''}<br>未回答 ${r.items.filter((x) => !x.answered).length}問${isG ? '' : ' ・ 推定配点'}</div></div>
    <div class="bar" style="margin:10px 0 14px"><i style="width:${(r.score / r.max) * 100}%"></i><span class="mark" style="left:${(r.pass / r.max) * 100}%"></span></div>
    <table class="tbl"><thead><tr><th>${isG ? '科目' : '出題領域'}</th><th class="r">得点</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function reviewItem(m, s, it, i) {
  const q = bank.byId[it.id];
  return `<details data-q="${q.id}" style="border-bottom:1px solid var(--line);padding:8px 0"><summary style="cursor:pointer;display:flex;gap:10px;align-items:center;list-style:none">
    <span class="tag ${it.ok ? 'ok' : it.score > 0 ? 'warn' : 'ng'}" style="min-width:3.4em;text-align:center">${it.ok ? '正解' : !it.answered ? '未回答' : it.score > 0 ? '部分' : '不正解'}</span>
    <span class="num small muted" style="width:3em">問${i + 1}</span><span class="small" style="flex:1">${esc(topicName(q.topic))}</span><span class="small muted">${esc(typeLabel(q))}</span></summary>
    <div class="ex" style="padding:10px 4px"></div></details>`;
}

function advice(m) {
  const parts = [];
  for (const s of m.sections) {
    const r = s.result;
    const weak = Object.entries(r.bySubj).filter(([, b]) => b.pts / b.max < 0.6).map(([sid]) => SUBJ[sid].name);
    const margin = r.score - r.pass;
    parts.push(`<b>${s.kind === 'gakka' ? '学科' : '実技'}：</b>${margin >= 0 ? `合格基準を${margin.toFixed(s.kind === 'gakka' ? 0 : 1)}点上回りました。` : `合格基準まであと${(-margin).toFixed(s.kind === 'gakka' ? 0 : 1)}点です。`}${weak.length ? `得点率6割未満：${weak.map(esc).join('、')}。` : '全科目で6割以上を確保しています。'}`);
  }
  return parts.join('<br>') + '<br><span class="small muted">間違えた問題は翌日の復習に自動登録されています。模擬試験の得点は本試験の結果を保証するものではありません。</span>';
}
