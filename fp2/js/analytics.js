// 学習分析：科目別の推定正答率、合格可能性（推定）、弱点、時間がかかる問題、未復習の論点。
// 推定は「解答ログ」からの統計的推定であり、公式の合否判定ではない（画面にも明示する）。
import { SUBJECTS, GAKKA, JITSUGI, TOPIC } from '../data/subjects.js';
import { today, daysBetween, dstr } from './util.js';
import { isMastered, isDue, isOverdue, isDifficult } from './srs.js';

export const GUESS = { gakka: 0.25, jitsugi: 0.4 };
export const TARGET_MS = { gakka: 120_000, jitsugi: 240_000 }; // 学科120分/60問、実技は事例読解込みの目安
const HALF_LIFE = 21; // 日
const PRIOR_K = 8;

// 標準正規分布の累積分布関数
function phi(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export function analyze(st, bank) {
  const now = today();
  const bySubj = {}, byTopic = {}, byTag = {};
  for (const s of SUBJECTS) bySubj[s.id] = { id: s.id, w: 0, wok: 0, n: 0, ok: 0, seen: new Set(), mastered: 0, total: 0, ms: 0, msn: 0, last: '' };
  for (const id in TOPIC) byTopic[id] = { id, n: 0, ok: 0, w: 0, wok: 0, last: '', total: 0, seen: new Set(), ms: 0, msn: 0, slow: 0 };
  for (const q of bank.all) {
    if (bySubj[q.subject]) bySubj[q.subject].total++;
    if (byTopic[q.topic]) byTopic[q.topic].total++;
  }
  let calcN = 0, calcOk = 0;
  for (const e of st.log) {
    const q = bank.byId[e.q];
    if (!q) continue;
    const dk = dstr(new Date(e.t));
    const age = Math.max(0, daysBetween(dk, now));
    const w = Math.pow(0.5, age / HALF_LIFE);
    const ok = e.ok ? 1 : 0;
    const S = bySubj[q.subject], T = byTopic[q.topic];
    for (const R of [S, T]) {
      if (!R) continue;
      R.n++; R.ok += ok; R.w += w; R.wok += w * ok; R.seen.add(q.id);
      if (e.ms && e.ms < 30 * 60_000) { R.ms += e.ms; R.msn++; }
      if (dk > R.last) R.last = dk;
    }
    const target = q.exam === 'jitsugi' ? TARGET_MS.jitsugi : TARGET_MS.gakka;
    if (T && e.ms > target * 1.25) T.slow++;
    if (q.calc || q.type === 'num') { calcN++; calcOk += ok; }
    for (const tag of q.tags || []) {
      const G = (byTag[tag] ||= { tag, n: 0, ng: 0, qs: new Set() });
      G.n++; if (!ok) { G.ng++; G.qs.add(q.id); }
    }
  }
  for (const [qid, s] of Object.entries(st.qs)) {
    const q = bank.byId[qid];
    if (q && isMastered(s) && bySubj[q.subject]) bySubj[q.subject].mastered++;
  }

  // 科目ごとの推定正答率
  const subj = {};
  for (const s of SUBJECTS) {
    const R = bySubj[s.id];
    const g = GUESS[s.exam];
    const pObs = (R.wok + PRIOR_K * g) / (R.w + PRIOR_K);
    // 論点カバー率：一度も解いていない論点は「推測（当て推量）」水準とみなす
    const tps = s.topics.map(([id]) => byTopic[id]).filter((t) => t.total > 0);
    const cov = tps.length ? tps.filter((t) => t.n > 0).length / tps.length : 0;
    const p = cov * pObs + (1 - cov) * g;
    subj[s.id] = {
      ...R, seen: R.seen.size, acc: R.n ? R.ok / R.n : null, p, cov,
      avgMs: R.msn ? R.ms / R.msn : null, exam: s.exam, name: s.name, short: s.short,
    };
  }

  // 学科：各科目10問 × 推定正答率。合格基準 36/60
  const gMean = GAKKA.reduce((a, s) => a + 10 * subj[s.id].p, 0);
  const gVar = GAKKA.reduce((a, s) => a + 10 * subj[s.id].p * (1 - subj[s.id].p), 0);
  const gPass = 1 - phi((35.5 - gMean) / Math.sqrt(Math.max(gVar, 1e-6)));
  // 実技：5領域 × 10点相当（配点は非公表のため均等と仮定）。合格基準 30/50
  const jMean = JITSUGI.reduce((a, s) => a + 10 * subj[s.id].p, 0);
  const jVar = JITSUGI.reduce((a, s) => a + (100 / 3) * subj[s.id].p * (1 - subj[s.id].p), 0);
  const jPass = 1 - phi((29.5 - jMean) / Math.sqrt(Math.max(jVar, 1e-6)));

  // 進捗：レッスン修了率 40% + 問題カバー率 30% + 定着率 30%
  const prog = (exam) => {
    const ls = bank.lessons.filter((l) => l.exam === exam);
    const lDone = ls.filter((l) => st.lessons[l.id]?.done).length / Math.max(1, ls.length);
    const qs = bank.all.filter((q) => q.exam === exam);
    const seen = qs.filter((q) => st.qs[q.id]).length / Math.max(1, qs.length);
    const mast = qs.filter((q) => isMastered(st.qs[q.id])).length / Math.max(1, qs.length);
    return { lesson: lDone, seen, mast, total: 0.4 * lDone + 0.3 * seen + 0.3 * mast };
  };
  const pg = prog('gakka'), pj = prog('jitsugi');

  // 弱点論点（3問以上解答し、正答率が低い順）
  const topics = Object.values(byTopic).filter((t) => t.total > 0).map((t) => ({
    ...t, seen: t.seen.size, acc: t.n ? t.ok / t.n : null, pw: t.w ? t.wok / t.w : null,
    name: TOPIC[t.id].name, subject: TOPIC[t.id].subject, avgMs: t.msn ? t.ms / t.msn : null,
    stale: t.last ? daysBetween(t.last, now) : null,
  }));
  const weakTopics = topics.filter((t) => t.n >= 3 && t.pw < 0.7).sort((a, b) => a.pw - b.pw);
  const staleTopics = topics.filter((t) => t.stale != null && t.stale >= 14).sort((a, b) => b.stale - a.stale);
  const untouched = topics.filter((t) => t.n === 0);
  const slowTopics = topics.filter((t) => t.slow >= 2).sort((a, b) => b.slow - a.slow);
  const misconceptions = Object.values(byTag).filter((g) => g.ng >= 2).map((g) => ({ ...g, qs: [...g.qs], rate: g.ng / g.n })).sort((a, b) => b.ng - a.ng);

  // 復習キュー
  const due = [], overdue = [], difficult = [], mastered = [];
  for (const [qid, s] of Object.entries(st.qs)) {
    if (!bank.byId[qid]) continue;
    if (isOverdue(s, now)) overdue.push(qid);
    if (isDue(s, now)) due.push(qid);
    if (isDifficult(s)) difficult.push(qid);
    if (isMastered(s)) mastered.push(qid);
  }

  const totalN = st.log.length, totalOk = st.log.filter((e) => e.ok).length;
  return {
    subj, topics, weakTopics, staleTopics, untouched, slowTopics, misconceptions,
    gakka: { mean: gMean, sd: Math.sqrt(gVar), pass: gPass, prog: pg },
    jitsugi: { mean: jMean, sd: Math.sqrt(jVar), pass: jPass, prog: pj },
    overall: 0.6 * pg.total + 0.4 * pj.total,
    readiness: Math.min(gPass, jPass),
    due, overdue, difficult, mastered,
    totalN, totalOk, acc: totalN ? totalOk / totalN : null,
    calc: { n: calcN, ok: calcOk, acc: calcN ? calcOk / calcN : null },
  };
}

// 次に学ぶべきレッスン：弱点科目の未修了レッスン → カリキュラム順の未修了レッスン
export function nextLesson(st, bank, a) {
  const undone = bank.lessons.filter((l) => !st.lessons[l.id]?.done);
  if (!undone.length) return null;
  const weak = Object.values(a.subj).filter((s) => s.n >= 5).sort((x, y) => x.p - y.p)[0];
  if (weak && weak.p < 0.65) {
    const l = undone.find((l) => l.subject === weak.id);
    if (l) return { lesson: l, reason: `「${weak.name}」の推定正答率が${Math.round(weak.p * 100)}%と低いため` };
  }
  return { lesson: undone[0], reason: 'カリキュラム順の次のレッスン' };
}

export const readinessLabel = (p) =>
  p >= 0.85 ? ['合格圏', 'ok'] : p >= 0.6 ? ['合格ライン付近', 'warn'] : p >= 0.3 ? ['あと一歩', 'warn'] : ['準備段階', 'ng'];
