// 弱点分析：頻出ミス論点、繰り返す誤解（ひっかけタグ）、計算の弱さ、時間がかかる論点、未復習の知識
import * as store from '../store.js';
import { bank, stats, bar, subjName } from '../core.js';
import { SUBJECTS } from '../../data/subjects.js';
import { EXAM } from '../../data/exam.js';
import { esc, pct, fmtDur, shuffle } from '../util.js';
import { TARGET_MS } from '../analytics.js';
import { startSession } from './session.js';

export function renderAnalysis(root) {
  const st = store.get();
  const a = stats();
  const lessonFor = (topic) => bank.lessons.find((l) => l.topics?.includes(topic));
  const topicRow = (t, extra) => {
    const l = lessonFor(t.id);
    return `<li><div class="grow"><div class="t">${esc(t.name)}</div><div class="m">${esc(subjName(t.subject))} ・ ${extra}</div></div>
      ${l ? `<a class="btn sm ghost" href="#/learn/${l.id}">レッスン</a>` : ''}<button class="btn sm" data-topic="${t.id}">演習</button></li>`;
  };
  root.innerHTML = `<div class="page">
    <div class="page-head"><div><div class="eyebrow">ANALYSIS</div><h1>弱点分析</h1>
      <p>すべての解答（${a.totalN}回）から、理解できていない論点・繰り返す誤解・時間がかかる問題を特定し、次の学習を提案します。</p></div></div>

    <div class="panel"><div class="panel-h"><h2>科目別の詳細</h2><span class="status estimate">推定正答率は直近の解答を重視（半減期21日）</span></div>
      <div class="panel-b tight"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>科目</th><th class="r">解答数</th><th class="r">正答率</th><th style="width:22%">推定正答率</th><th class="r">論点カバー</th><th class="r">平均時間</th><th class="r">定着</th></tr></thead><tbody>
      ${SUBJECTS.map((s) => { const x = a.subj[s.id]; const tgt = s.exam === 'jitsugi' ? TARGET_MS.jitsugi : TARGET_MS.gakka;
        return `<tr><td><span class="tag ${s.exam}">${s.exam === 'gakka' ? '学科' : '実技'}</span> ${esc(s.name)}</td><td class="r">${x.n}</td><td class="r">${x.acc == null ? '—' : pct(x.acc)}</td>
        <td><div class="row" style="flex-wrap:nowrap">${bar(x.p, x.p < 0.6 ? 'ng' : x.p >= 0.75 ? 'ok' : '')}<span class="small num">${pct(x.p)}</span></div></td><td class="r">${pct(x.cov)}</td>
        <td class="r ${x.avgMs > tgt ? '' : ''}" style="color:${x.avgMs > tgt ? 'var(--ng)' : ''}">${x.avgMs ? fmtDur(x.avgMs) : '—'}</td><td class="r">${x.mastered}/${x.total}</td></tr>`; }).join('')}
      </tbody></table></div></div></div>

    <div class="grid g2" style="margin-top:16px">
      <div class="panel"><div class="panel-h"><h3>よく間違える論点</h3></div><div class="panel-b tight"><ul class="list">
        ${a.weakTopics.slice(0, 8).map((t) => topicRow(t, `推定正答率 ${pct(t.pw)}（${t.n}回解答）`)).join('') || '<li class="small muted">3回以上解いた論点で、正答率7割未満のものはありません</li>'}
      </ul></div></div>
      <div class="panel"><div class="panel-h"><h3>繰り返している誤解</h3></div><div class="panel-b tight"><ul class="list">
        ${a.misconceptions.slice(0, 8).map((g) => `<li><div class="grow"><div class="t">${esc(g.tag)}</div><div class="m">${g.n}回中${g.ng}回ミス（${pct(g.rate)}）</div></div><button class="btn sm" data-tag="${esc(g.tag)}">関連問題</button></li>`).join('') || '<li class="small muted">同じ概念で2回以上間違えたものはありません。問題には「法定相続人の数」「契約形態と課税」などの概念タグがついており、ここに集計されます。</li>'}
      </ul></div></div>
      <div class="panel"><div class="panel-h"><h3>計算問題</h3></div><div class="panel-b">
        <div class="row between"><span>計算問題の正答率</span><b class="num">${a.calc.acc == null ? '—' : pct(a.calc.acc)}</b></div>
        ${bar(a.calc.acc || 0, (a.calc.acc ?? 1) < 0.6 ? 'ng' : 'ok')}
        <p class="small muted" style="margin-top:8px">${a.calc.n}回解答。${a.calc.acc != null && a.calc.acc < (a.acc || 0) - 0.1 ? '知識問題より計算問題の正答率が明らかに低い状態です。計算例のあるレッスンで手順を確認し、計算問題だけの演習で反復しましょう。' : '計算問題は実技で必ず出題されます。手順を声に出して確認する練習が効果的です。'}</p>
        <button class="btn sm" data-calc>計算問題を10問</button></div></div>
      <div class="panel"><div class="panel-h"><h3>時間がかかっている論点</h3></div><div class="panel-b tight"><ul class="list">
        ${a.slowTopics.slice(0, 6).map((t) => topicRow(t, `目安時間超過 ${t.slow}回・平均 ${t.avgMs ? fmtDur(t.avgMs) : '—'}`)).join('') || `<li class="small muted">目安（学科 1問${TARGET_MS.gakka / 60000}分、実技 1問${TARGET_MS.jitsugi / 60000}分）の1.25倍を超えた解答が2回以上ある論点はありません</li>`}
      </ul></div></div>
      <div class="panel"><div class="panel-h"><h3>しばらく復習していない論点</h3></div><div class="panel-b tight"><ul class="list">
        ${a.staleTopics.slice(0, 6).map((t) => topicRow(t, `最終解答から${t.stale}日`)).join('') || '<li class="small muted">14日以上空いている論点はありません</li>'}
      </ul></div></div>
      <div class="panel"><div class="panel-h"><h3>まだ一度も解いていない論点</h3><span class="small muted">${a.untouched.length}論点</span></div><div class="panel-b tight"><ul class="list">
        ${a.untouched.slice(0, 6).map((t) => topicRow(t, `${t.total}問`)).join('') || '<li class="small muted">すべての論点に着手済みです</li>'}
      </ul></div></div>
    </div>

    <div class="panel" style="margin-top:16px"><div class="panel-h"><h3>合格可能性の算出方法</h3><span class="status estimate">推定</span></div><div class="panel-b small">
      <ol style="padding-left:1.3em;margin:0">
        <li>科目ごとに、直近の解答ほど重く（21日で重み半減）正答率を計算し、事前分布（学科は四択の当て推量25%、実技は40%）で補正します。</li>
        <li>まだ解いていない論点の割合だけ、当て推量の水準に引き下げます（知らない論点は解けない、とみなすため）。</li>
        <li>学科は各科目10問×推定正答率の合計を期待得点とし、正規近似で${EXAM.gakka.passScore}点以上となる確率を求めます。実技は5題×10点相当（配点は非公表のため均等と仮定）で${EXAM.jitsugi.passScore}点以上の確率を求めます。</li>
        <li>この値は学習の目安であり、公式の合否判定・合格率とは関係ありません。模擬試験の得点とあわせて判断してください。</li>
      </ol></div></div>
  </div>`;
  root.querySelectorAll('[data-topic]').forEach((b) => (b.onclick = () => {
    const ids = shuffle(bank.all.filter((q) => q.topic === b.dataset.topic).map((q) => q.id)).slice(0, 10);
    startSession({ ids, title: '論点別の弱点演習', back: '#/analysis' });
  }));
  root.querySelectorAll('[data-tag]').forEach((b) => (b.onclick = () => {
    const ids = shuffle(bank.all.filter((q) => (q.tags || []).includes(b.dataset.tag)).map((q) => q.id)).slice(0, 10);
    startSession({ ids, title: `「${b.dataset.tag}」の確認`, back: '#/analysis' });
  }));
  const c = root.querySelector('[data-calc]');
  if (c) c.onclick = () => startSession({ ids: shuffle(bank.all.filter((q) => q.calc || q.type === 'num').map((q) => q.id)).slice(0, 10), title: '計算問題演習', back: '#/analysis' });
}
