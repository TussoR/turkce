// ルーター・画面の外枠
import * as store from './store.js';
import { $, $$, esc } from './util.js';
import { stats } from './core.js';
import { renderSession } from './views/session.js';
import { renderDashboard } from './views/dashboard.js';
import { renderLearnList, renderLesson } from './views/learn.js';
import { renderPractice } from './views/practice.js';
import { renderJitsugiList, renderCase } from './views/jitsugi.js';
import { renderMockHome, renderMockRun, renderMockResult, leaveMock } from './views/mock.js';
import { renderReview } from './views/review.js';
import { renderAnalysis } from './views/analysis.js';
import { renderReference } from './views/reference.js';
import { renderCalendar } from './views/calendar.js';
import { renderExamInfo } from './views/examinfo.js';
import { renderSettings } from './views/settings.js';

store.load();

const NAV = [
  ['学習', [
    ['', 'ダッシュボード', '◧', renderDashboard],
    ['learn', '学習モード', '◫', renderLearnList],
    ['practice', '問題演習', '✎', renderPractice],
    ['jitsugi', '実技試験対策', '▤', renderJitsugiList],
    ['mock', '模擬試験', '⏱', renderMockHome],
  ]],
  ['復習と分析', [
    ['review', '復習', '↻', renderReview],
    ['analysis', '弱点分析', '◔', renderAnalysis],
  ]],
  ['資料', [
    ['reference', '公式・数値集', '§', renderReference],
    ['calendar', '学習カレンダー', '▦', renderCalendar],
    ['exam', '試験情報（公式）', 'ⓘ', renderExamInfo],
    ['settings', '設定・データ', '⚙', renderSettings],
  ]],
];
const TABS = [['', 'ホーム', '◧'], ['learn', '学習', '◫'], ['practice', '演習', '✎'], ['jitsugi', '実技', '▤'], ['mock', '模試', '⏱']];

function shell() {
  const app = $('#app');
  app.innerHTML = `
    <div class="topbar"><button id="menu-btn" aria-label="メニュー">☰</button><div class="mark">FP2級 <b>MASTER</b></div></div>
    <div class="scrim" id="scrim"></div>
    <div class="shell">
      <aside class="side" id="side">
        <div class="brand"><div class="mark">FP2級 <b>MASTER</b></div><div class="sub">きんざい 学科 ＋ 実技（生保顧客資産相談業務）</div></div>
        <nav class="nav" aria-label="メイン">
          ${NAV.map(([g, items]) => `<div class="grp">${g}</div>${items.map(([k, name, ico]) => `<a href="#/${k}" data-nav="${k}"><span class="ico">${ico}</span>${name}${k === 'review' ? '<span class="badge" id="due-badge" hidden></span>' : ''}</a>`).join('')}`).join('')}
        </nav>
        <div class="foot">本アプリの問題はすべてオリジナルです。数値は各出典の基準日時点。試験の公式情報は「試験情報」をご確認ください。</div>
      </aside>
      <main class="main" id="view" tabindex="-1"></main>
    </div>
    <nav class="tabbar" aria-label="タブ">${TABS.map(([k, n, i]) => `<a href="#/${k}" data-nav="${k}"><span class="ico">${i}</span>${n}</a>`).join('')}</nav>`;
  const side = $('#side'), scrim = $('#scrim');
  const close = () => { side.classList.remove('open'); scrim.classList.remove('open'); };
  $('#menu-btn').onclick = () => { side.classList.add('open'); scrim.classList.add('open'); };
  scrim.onclick = close;
  side.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
}

let prevMockRun = false;
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [p, a, b] = h.split('/');
  const view = $('#view');
  document.onkeydown = null;
  const top = p || '';
  // 模擬試験の画面を離れたら時間を保存して一時停止
  const isMockRun = p === 'mock' && a === 'run';
  if (prevMockRun && !isMockRun) leaveMock();
  prevMockRun = isMockRun;
  // CBT画面は外枠なしの全画面
  document.body.classList.toggle('cbt-mode', p === 'mock' && a === 'run');
  $$('[data-nav]').forEach((el) => el.classList.toggle('on', el.dataset.nav === top || (top === 'session' && el.dataset.nav === 'practice')));
  try {
    if (p === 'session') renderSession(view);
    else if (p === 'learn' && a) renderLesson(view, a);
    else if (p === 'jitsugi' && a) renderCase(view, a);
    else if (p === 'mock' && a === 'run') renderMockRun(view);
    else if (p === 'mock' && a === 'result') renderMockResult(view, b);
    else {
      const item = NAV.flatMap((g) => g[1]).find((x) => x[0] === top) || NAV[0][1][0];
      item[3](view, a);
    }
  } catch (err) {
    console.error(err);
    view.innerHTML = `<div class="page"><div class="callout warn">画面の表示中にエラーが発生しました：${esc(err.message)}</div></div>`;
  }
  const due = stats().due.length;
  const badge = $('#due-badge');
  if (badge) { badge.hidden = !due; badge.textContent = due; }
}

shell();
window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });
window.addEventListener('fp2:render', route);
route();
