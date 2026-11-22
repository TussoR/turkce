// ダッシュボード：何を学ぶべきか／何が理解できていないか／合格できる状態か、を常に示す
import * as store from '../store.js';
import { bank, stats, bar, subjName } from '../core.js';
import { nextLesson, readinessLabel } from '../analytics.js';
import { GAKKA, JITSUGI, LEVEL } from '../../data/subjects.js';
import { EXAM } from '../../data/exam.js';
import { esc, pct, today, daysBetween, jpDate, num, addDays } from '../util.js';
import { startSession } from './session.js';
import { buildPlan } from './calendar.js';

export function renderDashboard(root) {
  const st = store.get();
  const a = stats();
  const nl = nextLesson(st, bank, a);
  const left = st.profile.examDate ? daysBetween(today(), st.profile.examDate) : null;
  const [rl, rc] = readinessLabel(a.readiness);
  const d = store.dayRec();
  const streak = store.streak();
  const weak = Object.values(a.subj).filter((s) => s.n >= 5).sort((x, y) => x.p - y.p).slice(0, 3);
  const plan = buildPlan(st, a).filter((x) => x.date >= today()).slice(0, 5);
  const fresh = st.log.length === 0;

  root.innerHTML = `<div class="page">
    <div class="page-head">
      <div><div class="eyebrow">DASHBOARD</div><h1>${st.profile.name ? esc(st.profile.name) + 'さんの' : ''}学習状況</h1>
      <p>${left != null ? (left >= 0 ? `試験日 ${jpDate(st.profile.examDate)} まで <b class="num">あと${left}日</b>` : '設定した試験日を過ぎています。新しい試験日を設定してください。') : '<a href="#/calendar">試験日を設定</a>すると、残り日数に合わせた学習計画を作成します。'}</p></div>
      <div class="row"><a class="btn" href="#/review">今日の復習 <span class="num">${a.due.length}</span>問</a><a class="btn primary" href="${nl ? '#/learn/' + nl.lesson.id : '#/practice'}">${nl ? '次のレッスンへ' : '演習を続ける'}</a></div>
    </div>

    ${fresh ? `<div class="callout gold" style="margin-bottom:16px"><b>はじめての方へ：</b>まず「<a href="#/exam">試験情報</a>」で試験の仕組みを確認し、学習モードの入門レッスンから始めましょう。最初に<a href="#" data-act="diag">診断テスト（学科12問）</a>を解くと、現在の実力に合わせて推奨が調整されます。</div>` : ''}

    <div class="kpis">
      <div class="kpi"><div class="l">総合進捗</div><div class="v">${Math.round(a.overall * 100)}<small>%</small></div>${bar(a.overall, 'gold')}<div class="d">レッスン・演習・定着の合成</div></div>
      <div class="kpi"><div class="l">解答数</div><div class="v">${num(a.totalN)}<small>問</small></div><div class="d">今日 ${d.q}問 ／ 目標 ${st.profile.dailyQ}問</div></div>
      <div class="kpi"><div class="l">正答率</div><div class="v">${a.acc == null ? '—' : Math.round(a.acc * 100)}<small>${a.acc == null ? '' : '%'}</small></div><div class="d">計算問題 ${a.calc.acc == null ? '—' : pct(a.calc.acc)}</div></div>
      <div class="kpi"><div class="l">学習継続</div><div class="v">${streak}<small>日連続</small></div><div class="d">今日 ${d.q ? '学習済み' : '未学習'}</div></div>
    </div>

    <div class="grid g-main" style="margin-top:16px">
      <div class="stack">
        <div class="panel">
          <div class="panel-h"><h2>合格可能性の推定</h2><span class="status estimate">解答ログからの推定値</span></div>
          <div class="panel-b">
            <div class="row" style="gap:28px;align-items:center;flex-wrap:wrap">
              <div class="ring" style="--p:${Math.round(a.readiness * 100)};--c:${rc === 'ok' ? 'var(--ok)' : rc === 'warn' ? 'var(--gold)' : 'var(--ng)'}"><div><div><div class="v">${Math.round(a.readiness * 100)}<small>%</small></div><div class="l">両試験の合格見込み</div></div></div></div>
              <div style="flex:1;min-width:240px">
                <div class="row between"><b>学科試験</b><span class="small muted">推定 <b class="num">${a.gakka.mean.toFixed(1)}</b> / 60点（基準 ${EXAM.gakka.passScore}点）</span></div>
                ${bar(a.gakka.mean / 60, '', EXAM.gakka.passScore / 60)}
                <div class="small muted" style="margin:2px 0 12px">合格見込み ${pct(a.gakka.pass)} ・ 進捗 ${pct(a.gakka.prog.total)}</div>
                <div class="row between"><b>実技試験（生保顧客資産相談業務）</b><span class="small muted">推定 <b class="num">${a.jitsugi.mean.toFixed(1)}</b> / 50点（基準 ${EXAM.jitsugi.passScore}点）</span></div>
                ${bar(a.jitsugi.mean / 50, 'gold', EXAM.jitsugi.passScore / 50)}
                <div class="small muted" style="margin-top:2px">合格見込み ${pct(a.jitsugi.pass)} ・ 進捗 ${pct(a.jitsugi.prog.total)}</div>
              </div>
            </div>
            <p class="small muted" style="margin:14px 0 0">判定：<span class="tag ${rc}">${rl}</span>　未学習の論点は「当て推量」水準として計算するため、学習初期は低く表示されます。公式の合否とは無関係の目安です。<a href="#/analysis">算出方法</a></p>
          </div>
        </div>

        <div class="grid g2">
          <div class="panel"><div class="panel-h"><h3>学科 ― 科目別の推定正答率</h3></div><div class="panel-b tight">
            ${GAKKA.map((s) => subjRow(a.subj[s.id])).join('')}</div></div>
          <div class="panel"><div class="panel-h"><h3>実技 ― 領域別の推定正答率</h3></div><div class="panel-b tight">
            ${JITSUGI.map((s) => subjRow(a.subj[s.id])).join('')}</div></div>
        </div>
      </div>

      <div class="stack">
        <div class="panel">
          <div class="panel-h"><h3>次に学ぶこと</h3></div>
          <div class="panel-b">
            ${nl ? `<a href="#/learn/${nl.lesson.id}" style="text-decoration:none;color:inherit"><div class="small muted">${esc(subjName(nl.lesson.subject))} ・ ${esc(LEVEL[nl.lesson.level])}</div>
              <div class="serif" style="font-size:16.5px;color:var(--navy-900);margin:2px 0 4px">${esc(nl.lesson.title)}</div></a>
              <div class="small muted">理由：${esc(nl.reason)}</div>
              <a class="btn primary sm" style="margin-top:10px" href="#/learn/${nl.lesson.id}">レッスンを開く</a>`
            : '<div class="small">全レッスンを修了しました。模擬試験で仕上げましょう。</div>'}
          </div>
        </div>
        <div class="panel">
          <div class="panel-h"><h3>苦手な科目</h3><a class="act" href="#/analysis">詳しく</a></div>
          <div class="panel-b tight"><ul class="list">
            ${weak.length ? weak.map((s) => `<li><div class="grow"><div class="t">${esc(s.name)}</div><div class="m">推定正答率 ${pct(s.p)} ・ ${s.n}問解答</div></div><button class="btn sm" data-weak="${s.id}">10問演習</button></li>`).join('')
              : '<li class="small muted">各科目5問以上解くと表示されます</li>'}
          </ul></div>
        </div>
        <div class="panel">
          <div class="panel-h"><h3>今後の復習・学習予定</h3><a class="act" href="#/calendar">カレンダー</a></div>
          <div class="panel-b tight"><ul class="list">
            <li><div class="grow"><div class="t">今日の復習</div><div class="m">期限切れ ${a.overdue.length}問を含む</div></div><a class="btn sm" href="#/review">${a.due.length}問</a></li>
            ${[1, 2, 3].map((k) => { const dd = addDays(today(), k); const n = Object.values(st.qs).filter((s) => s.due === dd).length; return `<li><div class="grow"><div class="t">${jpDate(dd)}</div></div><span class="small muted">復習 ${n}問</span></li>`; }).join('')}
            ${plan.length ? `<li><div class="grow"><div class="t">計画：${esc(plan[0].label)}</div><div class="m">${jpDate(plan[0].date)}</div></div></li>` : ''}
          </ul></div>
        </div>
      </div>
    </div>
  </div>`;

  root.querySelectorAll('[data-weak]').forEach((b) => (b.onclick = () => {
    const sid = b.dataset.weak;
    const ids = pickWeak(sid, 10);
    startSession({ ids, title: `${subjName(sid)}の弱点演習`, back: '#/' });
  }));
  const diag = root.querySelector('[data-act=diag]');
  if (diag) diag.onclick = (e) => {
    e.preventDefault();
    const ids = GAKKA.flatMap((s) => bank.all.filter((q) => q.subject === s.id && q.level <= 3).sort(() => Math.random() - 0.5).slice(0, 2).map((q) => q.id));
    startSession({ ids, title: '診断テスト', back: '#/' });
  };
}

function subjRow(s) {
  return `<div class="subj-row"><span class="n">${esc(s.short)}</span>${bar(s.p, s.p < 0.6 ? 'ng' : s.p >= 0.75 ? 'ok' : '')}<span class="p">${Math.round(s.p * 100)}%</span><span class="s">${s.n}問</span></div>`;
}

// 弱点優先の出題：不正解が多い・未出題の問題を優先
export function pickWeak(sid, n) {
  const st = store.get();
  const qs = bank.all.filter((q) => q.subject === sid);
  const score = (q) => {
    const s = st.qs[q.id];
    if (!s) return 0.5 + Math.random() * 0.2;
    return (s.ok / s.n) + (s.wrongLast ? -0.5 : 0) + Math.random() * 0.15;
  };
  return qs.map((q) => [q.id, score(q)]).sort((x, y) => x[1] - y[1]).slice(0, n).map((x) => x[0]);
}
