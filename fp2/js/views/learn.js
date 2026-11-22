// 学習モード：科目×難易度のカリキュラムと、レッスン本文・確認テスト
import * as store from '../store.js';
import { bank, stats, lvSteps, examTag, subjName } from '../core.js';
import { SUBJECTS, LEVELS, LEVEL } from '../../data/subjects.js';
import { REF } from '../../data/reference.js';
import { esc, today, pct, toast } from '../util.js';
import { rich, tableHTML } from '../qengine.js';
import { startSession } from './session.js';

let filt = { exam: 'all', level: 0 };

export function renderLearnList(root) {
  const st = store.get();
  const a = stats();
  const ls = bank.lessons;
  const done = ls.filter((l) => st.lessons[l.id]?.done).length;
  const subs = SUBJECTS.filter((s) => filt.exam === 'all' || s.exam === filt.exam);
  root.innerHTML = `<div class="page">
    <div class="page-head"><div><div class="eyebrow">LEARN</div><h1>学習モード</h1>
      <p>入門 → 基礎 → 標準 → 応用 → 試験レベルの順に、科目ごとに積み上げます。各レッスンの最後に確認テストがあります。</p></div>
      <div class="small muted">修了 <b class="num">${done}</b> / ${ls.length} レッスン</div></div>
    <div class="row" style="margin-bottom:16px">
      <div class="seg" id="f-exam">${[['all', 'すべて'], ['gakka', '学科'], ['jitsugi', '実技']].map(([k, n]) => `<button data-v="${k}" class="${filt.exam === k ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="seg" id="f-lv"><button data-v="0" class="${!filt.level ? 'on' : ''}">全レベル</button>${LEVELS.map(([k, n]) => `<button data-v="${k}" class="${filt.level === k ? 'on' : ''}">${n}</button>`).join('')}</div>
    </div>
    <div class="grid g2">
      ${subs.map((s) => {
        const items = ls.filter((l) => l.subject === s.id && (!filt.level || l.level === filt.level));
        const all = ls.filter((l) => l.subject === s.id);
        const dn = all.filter((l) => st.lessons[l.id]?.done).length;
        const p = a.subj[s.id]?.p ?? 0;
        return `<div class="panel"><div class="panel-h"><div><div class="small muted">${s.exam === 'gakka' ? '学科' : '実技'} ${esc(s.no)}</div><h3>${esc(s.name)}</h3></div>
          <div class="small muted" style="text-align:right">修了 ${dn}/${all.length}<br>推定正答率 ${Math.round(p * 100)}%</div></div>
          <div class="panel-b tight"><ul class="list">
          ${items.map((l) => {
            const r = st.lessons[l.id];
            return `<li><a class="item" href="#/learn/${l.id}"><span class="tag ${r?.done ? 'ok' : ''}" style="min-width:3.6em;text-align:center">${r?.done ? '修了' : esc(LEVEL[l.level])}</span>
              <div class="grow"><div class="t">${esc(l.title)}</div><div class="m">${lvSteps(l.level)} 約${l.minutes || 15}分${r?.quiz != null ? ` ・ 確認テスト ${pct(r.quiz)}` : ''}</div></div></a></li>`;
          }).join('') || '<li class="small muted">該当するレッスンはありません</li>'}
          </ul></div></div>`;
      }).join('')}
    </div></div>`;
  root.querySelectorAll('#f-exam button').forEach((b) => (b.onclick = () => { filt.exam = b.dataset.v; renderLearnList(root); }));
  root.querySelectorAll('#f-lv button').forEach((b) => (b.onclick = () => { filt.level = Number(b.dataset.v); renderLearnList(root); }));
}

// レッスン本文のブロック
function block(b) {
  if (b.h) return `<h2 id="${esc(b.id || '')}">${esc(b.h)}</h2>`;
  if (b.h3) return `<h3>${esc(b.h3)}</h3>`;
  if (b.p) return `<p>${html(b.p)}</p>`;
  if (b.ul) return `<ul>${b.ul.map((x) => `<li>${html(x)}</li>`).join('')}</ul>`;
  if (b.ol) return `<ol>${b.ol.map((x) => `<li>${html(x)}</li>`).join('')}</ol>`;
  if (b.table) return tableHTML(b.table);
  if (b.formula) return `<div class="formula">${html(b.formula)}</div>`;
  if (b.point) return `<div class="note point" style="margin:10px 0">${html(b.point)}</div>`;
  if (b.trap) return `<div class="note trap" style="margin:10px 0">${html(b.trap)}</div>`;
  if (b.example) {
    const e = b.example;
    return `<div class="panel" style="margin:12px 0"><div class="panel-h"><h4>計算例：${esc(e.title)}</h4></div><div class="panel-b">
      ${e.given ? `<p class="small">${html(e.given)}</p>` : ''}<ol class="steps">${e.steps.map((s) => `<li>${html(s)}</li>`).join('')}</ol>
      ${e.answer ? `<div class="callout gold" style="margin-top:8px"><b>答え：</b>${html(e.answer)}</div>` : ''}</div></div>`;
  }
  return '';
}
// レッスンでは<ruby>等の限定的なタグを許可する（データはアプリ同梱の固定コンテンツ）
const html = (s) => String(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

export function renderLesson(root, id) {
  settleQuiz();
  const l = bank.lessonById[id];
  if (!l) { root.innerHTML = `<div class="page"><div class="empty">レッスンが見つかりません。<a href="#/learn">一覧へ</a></div></div>`; return; }
  const st = store.get();
  const rec = st.lessons[l.id];
  const same = bank.lessons.filter((x) => x.subject === l.subject);
  const idx = same.indexOf(l);
  const next = same[idx + 1];
  const quiz = (l.quiz || []).filter((q) => bank.byId[q]);
  const refs = (l.refs || []).map((r) => REF.find((x) => x.id === r)).filter(Boolean);
  const heads = (l.body || []).filter((b) => b.h);
  root.innerHTML = `<div class="page">
    <div class="crumb"><a href="#/learn">学習モード</a> ／ ${esc(subjName(l.subject))}</div>
    <div class="grid" style="grid-template-columns:minmax(0,1fr) 240px;gap:28px" id="lesson-grid">
      <article class="lesson">
        <div class="q-meta">${examTag(l.exam)}<span class="tag lv">${esc(LEVEL[l.level])}</span>${lvSteps(l.level)}<span class="small muted">約${l.minutes || 15}分</span>${rec?.done ? '<span class="tag ok">修了</span>' : ''}</div>
        <h1 style="margin-bottom:12px">${esc(l.title)}</h1>
        ${l.intro ? `<div class="callout" style="margin-bottom:6px">${html(l.intro)}</div>` : ''}
        ${(l.body || []).map(block).join('')}
        ${l.terms?.length ? `<h2>重要用語</h2><dl class="terms">${l.terms.map(([t, r, d]) => `<dt>${r ? `<ruby>${esc(t)}<rt>${esc(r)}</rt></ruby>` : esc(t)}</dt><dd>${html(d)}</dd>`).join('')}</dl>` : ''}
        ${l.traps?.length ? `<h2>試験でのひっかけ</h2>${l.traps.map((t) => `<div class="note trap" style="margin:8px 0">${html(t)}</div>`).join('')}` : ''}
        ${refs.length ? `<h2>根拠となる数値・出典</h2><ul>${refs.map((r) => `<li><a href="#/reference/${r.id}">${esc(r.title)}</a> <span class="small muted">（基準：${esc(r.asOf || '—')}）</span></li>`).join('')}</ul>` : ''}
        <h2>確認テスト</h2>
        ${quiz.length ? `<p>このレッスンの内容から${quiz.length}問。8割以上の正解で修了になります（解答は復習スケジュールに登録されます）。</p>
          <div class="row"><button class="btn primary" data-act="quiz">確認テストを始める（${quiz.length}問）</button>${rec?.quiz != null ? `<span class="small muted">前回 ${pct(rec.quiz)}</span>` : ''}</div>`
          : '<p class="small muted">このレッスンには確認テストがありません。</p>'}
        <div class="row" style="margin-top:22px;border-top:1px solid var(--line);padding-top:16px">
          <button class="btn" data-act="done">${rec?.done ? '修了を取り消す' : '読了にする'}</button>
          ${next ? `<a class="btn primary" href="#/learn/${next.id}">次のレッスン：${esc(next.title)}</a>` : ''}
        </div>
      </article>
      <aside class="toc" style="position:sticky;top:20px;align-self:start" id="lesson-toc">
        <div class="small muted" style="letter-spacing:.1em;margin-bottom:6px">目次</div>
        ${heads.map((h, i) => `<a href="javascript:void 0" data-h="${i}">${esc(h.h)}</a>`).join('')}
        <hr class="sep"><div class="small muted">同じ科目のレッスン</div>
        ${same.map((x) => `<a href="#/learn/${x.id}" style="${x === l ? 'color:var(--navy-900);font-weight:600' : ''}">${st.lessons[x.id]?.done ? '✓ ' : ''}${esc(x.title)}</a>`).join('')}
      </aside>
    </div></div>`;
  if (matchMedia('(max-width: 860px)').matches) { root.querySelector('#lesson-grid').style.gridTemplateColumns = '1fr'; root.querySelector('#lesson-toc').style.position = 'static'; }
  root.querySelectorAll('[data-h]').forEach((a) => (a.onclick = () => root.querySelectorAll('.lesson h2')[Number(a.dataset.h)]?.scrollIntoView({ behavior: 'smooth' })));
  const qb = root.querySelector('[data-act=quiz]');
  if (qb) qb.onclick = () => {
    pendingQuiz = { lesson: l.id, ids: quiz, since: store.get().log.length };
    startSession({ ids: quiz, mode: 'lesson', title: `確認テスト：${l.title}`, back: `#/learn/${l.id}` });
  };
  root.querySelector('[data-act=done]').onclick = () => {
    const s = store.get();
    if (s.lessons[l.id]?.done) { delete s.lessons[l.id].done; toast('修了を取り消しました'); }
    else { s.lessons[l.id] = { ...(s.lessons[l.id] || {}), done: today() }; store.dayRec().les++; toast('レッスンを修了しました'); }
    store.save(); renderLesson(root, id);
  };
}

// 確認テスト終了後に戻ってきたとき、結果をレッスンに反映する
let pendingQuiz = null;
function settleQuiz() {
  if (!pendingQuiz) return;
  const s = store.get();
  const logs = s.log.slice(pendingQuiz.since).filter((e) => pendingQuiz.ids.includes(e.q));
  if (!logs.length) { pendingQuiz = null; return; }
  const score = logs.filter((e) => e.ok).length / pendingQuiz.ids.length;
  const id = pendingQuiz.lesson;
  pendingQuiz = null;
  const r = (s.lessons[id] ||= {});
  r.quiz = score;
  if (score >= 0.8 && !r.done) { r.done = today(); store.dayRec().les++; toast(`確認テスト ${pct(score)}：レッスン修了です`); }
  store.save();
}
