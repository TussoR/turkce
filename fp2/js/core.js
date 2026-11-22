// アプリの中核：問題バンクの索引、解答の記録、共通の描画部品。
import * as store from './store.js';
import { nextState } from './srs.js';
import { TARGET_MS, analyze } from './analytics.js';
import { today, esc } from './util.js';
import { QUESTIONS, CASES, LESSONS } from '../data/index.js';
import { SUBJ, TOPIC, LEVEL } from '../data/subjects.js';

// ===== 問題バンク =====
function buildBank() {
  const all = [], byId = {}, cases = {}, lessons = [], lessonById = {};
  for (const q of QUESTIONS) {
    const o = { exam: 'gakka', ...q, subject: q.subject || TOPIC[q.topic]?.subject };
    all.push(o); byId[o.id] = o;
  }
  for (const c of CASES) {
    cases[c.id] = c;
    c.questions.forEach((q, i) => {
      const o = { ...q, exam: 'jitsugi', case: c.id, caseNo: i + 1, subject: q.subject || TOPIC[q.topic]?.subject || c.subject, level: q.level || c.level || 5 };
      all.push(o); byId[o.id] = o;
    });
  }
  for (const l of LESSONS) { lessons.push(l); lessonById[l.id] = l; }
  return { all, byId, cases, caseList: CASES, lessons, lessonById };
}
export const bank = buildBank();

// ===== 解答の記録 =====
export function record(q, g, ms, mode) {
  const st = store.get();
  st.log.push({ q: q.id, t: Date.now(), ok: g.ok, s: Math.round(g.score * 100) / 100, ms: Math.round(ms), m: mode });
  const target = q.exam === 'jitsugi' ? TARGET_MS.jitsugi : TARGET_MS.gakka;
  st.qs[q.id] = nextState(st.qs[q.id], g.ok, ms > target * 1.25, today());
  const d = store.dayRec();
  d.q++; if (g.ok) d.ok++; d.ms += Math.min(ms, 30 * 60_000);
}

export function toggleBookmark(qid) {
  const st = store.get();
  if (st.bm[qid]) delete st.bm[qid]; else st.bm[qid] = Date.now();
  store.save();
  return !!st.bm[qid];
}

let cache = null, cacheLen = -1, cacheDay = '';
export function stats() {
  const st = store.get();
  const key = st.log.length + ':' + Object.keys(st.lessons).length;
  if (!cache || key !== cacheLen || cacheDay !== today()) {
    cache = analyze(st, bank); cacheLen = key; cacheDay = today();
  }
  return cache;
}

// ===== 共通部品 =====
export const examTag = (exam) => (exam === 'jitsugi' ? '<span class="tag jitsugi">実技</span>' : '<span class="tag gakka">学科</span>');
export const levelTag = (lv) => `<span class="tag lv">${esc(LEVEL[lv] || '—')}</span>`;
export const subjName = (id) => SUBJ[id]?.name || id;
export const topicName = (id) => TOPIC[id]?.name || id;
export const lvSteps = (lv) => `<span class="lv-steps" title="${esc(LEVEL[lv] || '')}">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= lv ? 'on' : ''}"></i>`).join('')}</span>`;
export const originTag = (q) =>
  q.origin === 'analysis'
    ? '<span class="status analysis">過去問分析に基づくオリジナル</span>'
    : '<span class="status original">オリジナル問題</span>';
export const bar = (p, cls = '', mark = null) =>
  `<div class="bar ${cls}"><i style="width:${Math.round(Math.max(0, Math.min(1, p)) * 100)}%"></i>${mark != null ? `<span class="mark" style="left:${mark * 100}%"></span>` : ''}</div>`;
