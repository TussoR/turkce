// 学習カレンダー：試験日・1日の目標・学習履歴・残り日数・学習計画の自動作成
import * as store from '../store.js';
import { bank, stats, subjName } from '../core.js';
import { SUBJECTS } from '../../data/subjects.js';
import { EXAM, FACTS } from '../../data/exam.js';
import { esc, today, addDays, daysBetween, jpDate, fmtDur, toast } from '../util.js';

const SUBJ_ORDER = Object.fromEntries(SUBJECTS.map((s, i) => [s.id, i]));
let month = null;

// 学習計画：未修了レッスンを「難易度 → 科目」の順に、仕上げ期間（最後の14日）より前へ均等配分。
// 仕上げ期間は模擬試験と復習。理解度が低い科目のレッスンは同じ難易度帯の中で前に出す。
export function buildPlan(st, a) {
  const start = today();
  const exam = st.profile.examDate && st.profile.examDate > start ? st.profile.examDate : addDays(start, 60);
  const days = daysBetween(start, exam);
  const finalDays = Math.min(14, Math.max(3, Math.round(days * 0.2)));
  const learnDays = Math.max(1, days - finalDays);
  const undone = bank.lessons.filter((l) => !st.lessons[l.id]?.done)
    .sort((x, y) => x.level - y.level || (a.subj[x.subject]?.p ?? 0.5) - (a.subj[y.subject]?.p ?? 0.5) || SUBJ_ORDER[x.subject] - SUBJ_ORDER[y.subject]);
  const per = Math.ceil(undone.length / learnDays);
  const plan = [];
  for (let i = 0; i < learnDays; i++) {
    const d = addDays(start, i);
    const ls = undone.slice(i * per, (i + 1) * per);
    if (ls.length) plan.push({ date: d, kind: 'lesson', ids: ls.map((l) => l.id), label: ls.map((l) => l.title).join('／') });
    else if (i % 3 === 2) plan.push({ date: d, kind: 'practice', label: '弱点科目の問題演習（20問）' });
    if (i > 0 && i % 7 === 6) plan.push({ date: d, kind: 'mock', label: i < learnDays / 2 ? '実技の事例演習（1事例）' : '学科模擬試験（60問・120分）' });
  }
  for (let i = 0; i < finalDays; i++) {
    const d = addDays(start, learnDays + i);
    const k = i % 4;
    plan.push({ date: d, kind: k === 0 ? 'mock' : 'review', label: k === 0 ? (i % 8 === 0 ? '総合模擬試験（学科＋実技）' : '実技模擬試験（90分）') : k === 1 ? '模擬試験の見直し・弱点レッスンの再読' : '今日の復習＋苦手問題' });
  }
  plan.push({ date: exam, kind: 'exam', label: '試験日' });
  return plan;
}

export function renderCalendar(root) {
  const st = store.get();
  const a = stats();
  const p = st.profile;
  const t = today();
  if (!month) month = t.slice(0, 7);
  const plan = buildPlan(st, a);
  const planBy = {};
  for (const x of plan) (planBy[x.date] ||= []).push(x);
  const left = p.examDate ? daysBetween(t, p.examDate) : null;
  // 必要学習時間の見積り（レッスン所要時間 + 全問題を2周 + 模擬試験3回）
  const lessonMin = bank.lessons.filter((l) => !st.lessons[l.id]?.done).reduce((s, l) => s + (l.minutes || 15), 0);
  const qMin = bank.all.reduce((s, q) => s + (st.qs[q.id] && st.qs[q.id].n >= 2 ? 0 : q.exam === 'jitsugi' ? 6 : 2) * (st.qs[q.id] ? 1 : 2), 0);
  const needMin = lessonMin + qMin + 3 * (EXAM.gakka.minutes + EXAM.jitsugi.minutes + 60);
  const haveMin = left != null && left > 0 ? left * p.dailyMin : null;
  const hist = Object.entries(st.days).sort((x, y) => y[0].localeCompare(x[0])).slice(0, 14);

  const [y, m] = month.split('-').map(Number);
  const first = new Date(y, m - 1, 1).getDay();
  const nd = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push('<div class="d out"></div>');
  for (let d = 1; d <= nd; d++) {
    const k = `${month}-${String(d).padStart(2, '0')}`;
    const rec = st.days[k];
    const pl = planBy[k];
    const isExam = p.examDate === k;
    cells.push(`<div class="d ${k === t ? 'today' : ''} ${isExam ? 'exam' : ''}" title="${esc([rec ? `解答${rec.q}問・正解${rec.ok}問` : '', ...(pl || []).map((x) => x.label)].filter(Boolean).join('\n'))}">${d}${isExam ? '<div class="small" style="font-size:9.5px">試験</div>' : ''}
      ${rec && rec.q ? '<span class="dot"></span>' : pl && k >= t && !isExam ? '<span class="dot p"></span>' : ''}</div>`);
  }
  const holidays = FACTS.find((f) => f.k.startsWith('休止期間'));

  root.innerHTML = `<div class="page">
    <div class="page-head"><div><div class="eyebrow">STUDY PLANNER</div><h1>学習カレンダー</h1>
      <p>試験日と1日の学習量から、残り期間に合わせた計画を自動で作成します（学習の進み具合に応じて毎日更新）。</p></div></div>
    <div class="grid g-main">
      <div class="stack">
        <div class="panel"><div class="panel-h"><h3>${y}年${m}月</h3><div class="row"><button class="btn sm ghost" data-mv="-1">← 前月</button><button class="btn sm ghost" data-mv="0">今月</button><button class="btn sm ghost" data-mv="1">翌月 →</button></div></div>
          <div class="panel-b"><div class="cal">${'日月火水木金土'.split('').map((w) => `<div class="h">${w}</div>`).join('')}${cells.join('')}</div>
          <div class="legend"><span><i style="background:var(--ok)"></i>学習した日</span><span><i style="background:var(--gold-2)"></i>計画あり</span><span><i style="background:var(--accent)"></i>試験日</span></div></div></div>
        <div class="panel"><div class="panel-h"><h3>これからの学習計画（14日分）</h3></div><div class="panel-b tight"><ul class="list">
          ${plan.filter((x) => x.date >= t).slice(0, 16).map((x) => `<li><span class="tag ${x.kind === 'mock' || x.kind === 'exam' ? 'jitsugi' : x.kind === 'review' ? 'warn' : 'gakka'}" style="min-width:4.5em;text-align:center">${{ lesson: 'レッスン', practice: '演習', mock: '模試', review: '復習', exam: '試験' }[x.kind]}</span>
            <div class="grow"><div class="t">${esc(x.label)}</div><div class="m">${jpDate(x.date)}</div></div>${x.kind === 'lesson' ? `<a class="btn sm" href="#lesson-${x.ids[0]}">開く</a>` : x.kind === 'mock' ? '<a class="btn sm" href="#mock">模試へ</a>' : x.kind === 'review' ? '<a class="btn sm" href="#review">復習へ</a>' : ''}</li>`).join('')}
        </ul></div></div>
      </div>
      <div class="stack">
        <div class="panel"><div class="panel-h"><h3>試験日と目標</h3></div><div class="panel-b">
          <label class="f"><span>受検予定日（CBT）</span><input type="date" id="c-exam" value="${esc(p.examDate)}" min="${t}"></label>
          <div class="row" style="gap:12px"><label class="f" style="flex:1"><span>1日の目標問題数</span><input type="number" id="c-q" min="5" max="200" value="${p.dailyQ}"></label>
          <label class="f" style="flex:1"><span>1日の学習時間（分）</span><input type="number" id="c-min" min="10" max="600" step="10" value="${p.dailyMin}"></label></div>
          <label class="f"><span>お名前（任意）</span><input type="text" id="c-name" value="${esc(p.name)}" maxlength="20"></label>
          <button class="btn primary" id="c-save">保存して計画を更新</button>
          <p class="small muted" style="margin-top:10px">休止期間（受検不可）：${esc(holidays ? holidays.v : '')}。${p.examDate && inHoliday(p.examDate) ? '<b style="color:var(--ng)">選択した日は休止期間です。</b>' : ''}</p>
        </div></div>
        <div class="panel"><div class="panel-h"><h3>残りの準備時間</h3></div><div class="panel-b">
          ${left != null ? `<div class="serif" style="font-size:30px;color:var(--heading)">あと${Math.max(0, left)}日</div>` : '<div class="small muted">試験日が未設定です（計画は60日後を仮の試験日として作成しています）</div>'}
          <table class="tbl" style="margin-top:8px"><tbody>
            <tr><td>未修了レッスン</td><td class="r">${bank.lessons.filter((l) => !st.lessons[l.id]?.done).length}件（約${fmtDur(lessonMin * 60000)}）</td></tr>
            <tr><td>必要学習時間の見積り</td><td class="r">約${Math.round(needMin / 60)}時間</td></tr>
            <tr><td>確保できる時間</td><td class="r">${haveMin != null ? `約${Math.round(haveMin / 60)}時間` : '—'}</td></tr></tbody></table>
          ${haveMin != null ? `<div class="callout ${haveMin >= needMin ? '' : 'warn'} small" style="margin-top:10px">${haveMin >= needMin ? '現在の学習ペースで計画を終えられる見込みです。' : `このままでは約${Math.round((needMin - haveMin) / 60)}時間不足します。1日の学習時間を${Math.ceil(needMin / Math.max(1, left) / 10) * 10}分程度に増やすか、試験日の変更を検討してください。`}</div>` : ''}
          <p class="small muted" style="margin-top:8px">見積りは「未修了レッスンの所要時間＋未定着の問題を2回ずつ（学科2分・実技6分）＋模擬試験3回」の合計で、本アプリ独自の目安です。</p>
        </div></div>
        <div class="panel"><div class="panel-h"><h3>学習履歴</h3></div><div class="panel-b tight"><table class="tbl"><thead><tr><th>日付</th><th class="r">解答</th><th class="r">正答率</th><th class="r">時間</th><th class="r">レッスン</th></tr></thead><tbody>
          ${hist.map(([d, r]) => `<tr><td>${jpDate(d)}</td><td class="r">${r.q}</td><td class="r">${r.q ? Math.round((r.ok / r.q) * 100) + '%' : '—'}</td><td class="r">${r.ms ? fmtDur(r.ms) : '—'}</td><td class="r">${r.les || 0}</td></tr>`).join('') || '<tr><td colspan="5" class="muted small">まだ記録がありません</td></tr>'}
        </tbody></table></div></div>
      </div>
    </div></div>`;
  root.querySelectorAll('[data-mv]').forEach((b) => (b.onclick = () => {
    const v = Number(b.dataset.mv);
    if (!v) month = t.slice(0, 7);
    else { const d = new Date(y, m - 1 + v, 1); month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
    renderCalendar(root);
  }));
  root.querySelector('#c-save').onclick = () => {
    const s = store.get();
    s.profile.examDate = root.querySelector('#c-exam').value;
    s.profile.dailyQ = Math.max(5, Number(root.querySelector('#c-q').value) || 30);
    s.profile.dailyMin = Math.max(10, Number(root.querySelector('#c-min').value) || 60);
    s.profile.name = root.querySelector('#c-name').value.trim();
    store.save(); toast('保存しました'); renderCalendar(root);
  };
}

// 2026年度の休止期間（きんざい公表）
const HOLIDAYS = [['2026-05-24', '2026-05-31'], ['2026-12-28', '2027-01-05'], ['2027-03-25', '2027-03-31']];
export const inHoliday = (d) => HOLIDAYS.some(([a, b]) => d >= a && d <= b);
