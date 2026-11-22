// 間隔反復（SM-2を試験対策向けに簡略化）。純粋関数として実装し、テスト可能にしている。
//  - 不正解：翌日に再出題、易しさ係数(ef)を下げる、ラプス数を加算
//  - 正解：1日 → 3日 → 前回間隔×ef と伸ばす。時間がかかった正解は「あいまい」として伸びを抑える
//  - 間隔21日以上かつ連続正解3回以上で「定着」
import { addDays, today } from './util.js';

export const MASTER_IV = 21;

export function nextState(prev, ok, slow, date = today()) {
  const s = Object.assign({ n: 0, ok: 0, iv: 0, ef: 2.3, st: 0, lp: 0 }, prev || {});
  s.n += 1;
  s.last = date;
  if (ok) {
    s.ok += 1;
    s.st += 1;
    let iv;
    if (s.iv <= 0) iv = slow ? 1 : 3;
    else if (s.iv <= 3) iv = slow ? 3 : 6;
    else iv = Math.round(s.iv * (slow ? Math.max(1.3, s.ef - 0.6) : s.ef));
    if (slow) s.ef = Math.max(1.3, s.ef - 0.05);
    s.iv = Math.min(iv, 120);
    s.wrongLast = false;
  } else {
    s.st = 0;
    s.lp += 1;
    s.ef = Math.max(1.3, s.ef - 0.2);
    s.iv = 0;
    s.wrongLast = true;
  }
  s.due = addDays(date, s.iv <= 0 ? 1 : s.iv);
  return s;
}

export const isMastered = (s) => !!s && s.iv >= MASTER_IV && s.st >= 3;
export const isDue = (s, date = today()) => !!s && !!s.due && s.due <= date;
export const isOverdue = (s, date = today()) => !!s && !!s.due && s.due < date;
// 「苦手」：ラプス2回以上、または直近不正解かつ正答率60%未満
export const isDifficult = (s) => !!s && (s.lp >= 2 || (s.wrongLast && s.ok / s.n < 0.6));
