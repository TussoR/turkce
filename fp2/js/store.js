// 学習記録の永続化（localStorage）。スキーマはバージョン管理し、読み込み時に欠損を補完する。
import { today, addDays } from './util.js';

const KEY = 'fp2-master-v1';
const MAX_LOG = 20000;

const DEFAULT = () => ({
  v: 1,
  created: today(),
  profile: { examDate: '', dailyQ: 30, dailyMin: 60, target: 'both', name: '' },
  log: [],        // 解答ログ {q, t, ok, ms, m}  m=モード
  qs: {},         // 問題ごとの統計とSRS {n, ok, last, due, iv, ef, st, lp, wrongLast}
  bm: {},         // ブックマーク {qid: ts}
  lessons: {},    // {lessonId: {done: 'YYYY-MM-DD', quiz: 0..1}}
  days: {},       // {'YYYY-MM-DD': {q, ok, ms, les}}
  mocks: [],      // 完了した模擬試験の結果
  active: null,   // 実施中の模擬試験（中断再開用）
  cases: {},      // 実技事例の完了記録 {caseId: {best, last, n}}
});

let st = null;
const listeners = new Set();

export function load() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(KEY)); } catch (e) { raw = null; }
  const d = DEFAULT();
  st = Object.assign(d, raw || {});
  st.profile = Object.assign(DEFAULT().profile, st.profile || {});
  for (const k of ['qs', 'bm', 'lessons', 'days', 'cases']) if (!st[k] || typeof st[k] !== 'object') st[k] = {};
  for (const k of ['log', 'mocks']) if (!Array.isArray(st[k])) st[k] = [];
  return st;
}

export function get() { return st || load(); }

export function save() {
  if (st.log.length > MAX_LOG) st.log = st.log.slice(-MAX_LOG);
  try {
    localStorage.setItem(KEY, JSON.stringify(st));
  } catch (e) {
    console.warn('保存に失敗しました', e);
  }
  listeners.forEach((f) => f(st));
}

export function onChange(f) { listeners.add(f); return () => listeners.delete(f); }

export function exportJSON() { return JSON.stringify(get(), null, 0); }

export function importJSON(text) {
  const obj = JSON.parse(text);
  if (!obj || obj.v !== 1 || !Array.isArray(obj.log)) throw new Error('形式が正しくありません');
  try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) { /* 保存できない環境でもメモリ上で復元する */ }
  st = null;
  load();
  if (!raw0(KEY)) Object.assign(st, obj);
  save();
}

const raw0 = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

export function reset() {
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  load();
  save();
}

export function dayRec(date = today()) {
  const s = get();
  return (s.days[date] ||= { q: 0, ok: 0, ms: 0, les: 0 });
}

// 学習継続日数（今日または昨日まで連続していれば継続中）
export function streak() {
  const s = get();
  const active = (d) => s.days[d] && (s.days[d].q > 0 || s.days[d].les > 0);
  let d = today();
  if (!active(d)) {
    d = addDays(d, -1);
    if (!active(d)) return 0;
  }
  let n = 0;
  while (active(d)) { n++; d = addDays(d, -1); }
  return n;
}
