// データ検証：スキーマ・正答キー・計算問題の独立再計算・レッスンの参照整合性
// 実行：node fp2/tests/validate.mjs [--file data/q/lp.js]
import * as calc from '../js/calc.js';
import { SUBJECTS, TOPIC } from '../data/subjects.js';
import { REF } from '../data/reference.js';
import { QUESTIONS, CASES, LESSONS } from '../data/index.js';

const errors = [], warns = [];
const err = (id, m) => errors.push(`${id}: ${m}`);
const warn = (id, m) => warns.push(`${id}: ${m}`);
const ids = new Set();
const fmt = (n) => Number(n).toLocaleString('ja-JP');
const fnNames = Object.keys(calc);
const fnVals = Object.values(calc);
const evalExpr = (expr) => new Function(...fnNames, `return (${expr});`)(...fnVals);
const subjIds = new Set(SUBJECTS.map((s) => s.id));
const refIds = new Set(REF.map((r) => r.id));
const MARK = /〔[^〕]+〕/g;

function checkVerify(id, q, getTarget) {
  for (const v of q.verify || []) {
    let got;
    try { got = evalExpr(v.expr); } catch (e) { err(id, `verify式エラー ${v.expr}: ${e.message}`); continue; }
    const target = getTarget(v);
    if (target == null) { err(id, `verifyの比較対象がありません ${JSON.stringify(v)}`); continue; }
    if (Math.abs(got - target) > (v.tol ?? 0.5)) err(id, `計算不一致：${v.expr} = ${got}（期待値 ${target}）`);
  }
}

function checkQ(q, ctx) {
  const id = q.id || '(idなし)';
  if (!q.id) err(id, 'idがありません');
  if (ids.has(q.id)) err(id, 'idが重複'); ids.add(q.id);
  if (!TOPIC[q.topic]) err(id, `論点id不正 ${q.topic}`);
  if (ctx.exam === 'gakka' && TOPIC[q.topic] && !TOPIC[q.topic].subject.match(/^(lp|risk|kinyu|tax|fd|sz)$/)) err(id, '学科問題に実技の論点');
  if (!q.stem || q.stem.length < 10) err(id, '問題文が短すぎます');
  if (!q.explain) err(id, '解説(explain)がありません');
  if (ctx.exam === 'gakka' && ![1, 2, 3, 4, 5].includes(q.level)) err(id, 'level不正');
  if (q.type === 'mc') {
    if (!Array.isArray(q.choices) || q.choices.length !== (ctx.exam === 'gakka' ? 4 : q.choices.length)) err(id, '学科は選択肢4つ');
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) err(id, 'answer不正');
    if (!q.why || q.why.length !== q.choices.length) err(id, 'whyの数が選択肢と不一致');
    if (new Set(q.choices).size !== q.choices.length) err(id, '同じ選択肢があります');
    if (/不適切/.test(q.stem) && q.why && !/^不適切|誤り|×/.test(q.why[q.answer] || '')) warn(id, '「不適切」問題だが正解のwhyが「不適切」で始まっていない');
    if (/最も適切/.test(q.stem) && q.why && /^不適切/.test(q.why[q.answer] || '')) err(id, '「最も適切」を問うのに正解のwhyが「不適切」');
    if (q.why) q.why.forEach((w, i) => {
      if (i === q.answer) return;
      if (/最も不適切/.test(q.stem) && /^不適切/.test(w)) err(id, `「最も不適切」で正解以外の選択肢${i + 1}も不適切`);
      if (/最も適切/.test(q.stem) && /^適切/.test(w)) err(id, `「最も適切」で正解以外の選択肢${i + 1}も適切`);
    });
    if (q.calc) {
      if (!q.verify?.length) err(id, '計算問題にverifyがありません');
      if (!q.steps?.length) warn(id, '計算問題にstepsがありません');
      checkVerify(id, q, (v) => v.value);
      for (const v of q.verify || []) {
        if (v.value != null && !String(q.choices[q.answer]).replace(/[,，]/g, '').includes(String(v.value)) && !String(q.choices[q.answer]).includes(fmt(v.value))) err(id, `正解の選択肢に計算結果 ${fmt(v.value)} が含まれていません`);
        // 他の選択肢に正解値が含まれていないか
        q.choices.forEach((c, i) => { if (i !== q.answer && v.value != null && String(c).includes(fmt(v.value)) && fmt(v.value).length > 3) warn(id, `選択肢${i + 1}にも正解値 ${fmt(v.value)} が含まれる`); });
      }
    }
  } else if (q.type === 'tf') {
    if (!Array.isArray(q.items) || q.items.length < 2) err(id, 'tfの記述が不足');
    (q.items || []).forEach((it, i) => { if (typeof it.a !== 'boolean') err(id, `記述${i + 1}のaがboolean以外`); if (!it.e) err(id, `記述${i + 1}の理由(e)なし`); });
  } else if (q.type === 'blank') {
    if (!q.blanks?.length || !q.bank?.length) err(id, 'blanks/bankなし');
    for (const b of q.blanks || []) if (!q.bank.includes(b.a)) err(id, `空欄${b.k}の正解「${b.a}」が語群にありません`);
    if (new Set(q.bank).size !== q.bank.length) err(id, '語群に重複');
    const marks = (q.stem.match(MARK) || []).map((m) => m.slice(1, -1));
    for (const b of q.blanks || []) if (!marks.includes(b.k)) err(id, `問題文に空欄〔${b.k}〕がありません`);
  } else if (q.type === 'num') {
    if (!q.parts?.length) err(id, 'partsなし');
    (q.parts || []).forEach((p, i) => { if (typeof p.a !== 'number' || !Number.isFinite(p.a)) err(id, `part${i}のaが数値でない`); });
    if (!q.verify?.length) err(id, '数値問題にverifyがありません');
    else {
      checkVerify(id, q, (v) => q.parts[v.part]?.a);
      const covered = new Set(q.verify.map((v) => v.part));
      q.parts.forEach((p, i) => { if (!covered.has(i)) err(id, `part ${i}（${p.label}）の検算がありません`); });
    }
    if (!q.steps?.length) warn(id, '数値問題にstepsがありません');
  } else err(id, `type不正 ${q.type}`);
}

for (const q of QUESTIONS) checkQ(q, { exam: 'gakka' });
for (const c of CASES) {
  if (!subjIds.has(c.subject)) err(c.id, 'subject不正');
  if (!Array.isArray(c.doc) || !c.doc.length) err(c.id, '設例なし');
  if (c.questions?.length !== 3) err(c.id, `事例の問は3問（現在${c.questions?.length}）`);
  if (ids.has(c.id)) err(c.id, '事例idが重複');
  for (const q of c.questions || []) {
    if (q.type === 'mc') warn(q.id, '実技でmc形式（本試験は〇×・語群・数値記入）');
    if (TOPIC[q.topic] && TOPIC[q.topic].subject !== c.subject) warn(q.id, `論点の領域が事例と異なる（${q.topic}）`);
    checkQ(q, { exam: 'jitsugi' });
  }
}
const allIds = new Set([...QUESTIONS.map((q) => q.id), ...CASES.flatMap((c) => c.questions.map((q) => q.id))]);
const lids = new Set();
for (const l of LESSONS) {
  if (lids.has(l.id)) err(l.id, 'レッスンid重複'); lids.add(l.id);
  if (!subjIds.has(l.subject)) err(l.id, 'subject不正');
  if (!['gakka', 'jitsugi'].includes(l.exam)) err(l.id, 'exam不正');
  if (![1, 2, 3, 4, 5].includes(l.level)) err(l.id, 'level不正');
  for (const t of l.topics || []) if (!TOPIC[t]) err(l.id, `topic不正 ${t}`);
  for (const q of l.quiz || []) if (!allIds.has(q)) err(l.id, `確認テストの問題 ${q} が存在しません`);
  for (const r of l.refs || []) if (!refIds.has(r)) err(l.id, `参照 ${r} が reference.js にありません`);
  if (!l.body?.length) err(l.id, '本文なし');
  const len = JSON.stringify(l.body).length;
  if (len < 1000) warn(l.id, `本文が短い（${len}字）`);
}

// 集計
const per = {};
for (const q of QUESTIONS) { const s = TOPIC[q.topic]?.subject; per[s] = (per[s] || 0) + 1; }
for (const c of CASES) per[c.subject] = (per[c.subject] || 0) + c.questions.length;
const lper = {};
for (const l of LESSONS) lper[l.subject] = (lper[l.subject] || 0) + 1;
console.log('問題数:', JSON.stringify(per), '合計', QUESTIONS.length + CASES.reduce((a, c) => a + c.questions.length, 0));
console.log('事例数:', CASES.length, ' レッスン数:', LESSONS.length, JSON.stringify(lper));
const calcN = QUESTIONS.filter((q) => q.calc).length + CASES.flatMap((c) => c.questions).filter((q) => q.type === 'num').length;
console.log('計算問題（独立検算あり）:', calcN);
if (warns.length) { console.log(`\n警告 ${warns.length}件`); warns.slice(0, 80).forEach((w) => console.log('  ⚠ ' + w)); }
if (errors.length) { console.log(`\nエラー ${errors.length}件`); errors.forEach((e) => console.log('  ✗ ' + e)); process.exit(1); }
console.log('\n✓ 検証エラーなし');
