// 設定・データ管理：表示テーマ、学習記録のバックアップ（書き出し・読み込み）と初期化
import * as store from '../store.js';
import { SKINS, getSkin, setSkin } from '../skin.js';
import { bank } from '../core.js';
import { esc, toast, confirmDialog } from '../util.js';

export function renderSettings(root) {
  const st = store.get();
  const size = new Blob([store.exportJSON()]).size;
  root.innerHTML = `<div class="page page-narrow">
    <div class="page-head"><div><div class="eyebrow">SETTINGS</div><h1>設定・テーマ</h1>
      <p>表示テーマの切り替えと、学習記録の管理を行います。</p></div></div>
    <div class="panel"><div class="panel-h"><h3>表示テーマ</h3><span class="small muted">画面上部の ◐ でも切り替えられます</span></div><div class="panel-b">
      <div class="skins" role="radiogroup" aria-label="表示テーマ">${SKINS.map(([k, name, bg, ac]) => `<button type="button" class="skin ${getSkin() === k ? 'on' : ''}" data-skin-pick="${k}" role="radio" aria-checked="${getSkin() === k}">
        <span class="sw" style="${k === 'auto' ? `background:linear-gradient(135deg,${bg} 50%,${ac} 50%)` : `background:${bg}`}"><i style="background:${k === 'auto' ? '#c8a96e' : ac}"></i><i style="background:${k === 'auto' ? '#c8a96e' : ac};opacity:.5"></i></span>
        <span class="nm">${esc(name)}</span></button>`).join('')}</div>
      <p class="small muted" style="margin:10px 0 0">「自動」は端末（またはビューア）の明るさ設定に合わせます。「ブラック」は有機ELのスマートフォンで電池の消費を抑えられます。</p>
    </div></div>
    <div class="panel" style="margin-top:16px"><div class="panel-h"><h3>学習記録</h3></div><div class="panel-b">
      <p class="small" style="margin-top:0">学習記録はこの端末のブラウザに保存されます。端末の変更やブラウザのデータ削除に備えて、定期的にバックアップしてください。</p>
      <table class="tbl"><tbody>
        <tr><th>記録開始日</th><td>${esc(st.created)}</td></tr>
        <tr><th>解答ログ</th><td>${st.log.length.toLocaleString()}件</td></tr>
        <tr><th>解答済みの問題</th><td>${Object.keys(st.qs).length} / ${bank.all.length}問</td></tr>
        <tr><th>修了レッスン</th><td>${Object.values(st.lessons).filter((l) => l.done).length} / ${bank.lessons.length}</td></tr>
        <tr><th>模擬試験の受験回数</th><td>${st.mocks.length}回</td></tr>
        <tr><th>データサイズ</th><td>${(size / 1024).toFixed(1)} KB</td></tr>
      </tbody></table>
      <div class="row" style="margin-top:14px"><button class="btn primary" id="s-exp">バックアップを表示（コピー用）</button>
        <label class="btn" style="cursor:pointer">ファイルから復元<input type="file" accept="application/json,.json,text/plain" id="s-imp" hidden></label>
        <button class="btn ghost" id="s-paste">貼り付けて復元</button></div>
      <div id="s-box" hidden style="margin-top:12px"><textarea id="s-json" rows="6" readonly style="font-family:var(--mono);font-size:12px"></textarea>
        <div class="row" style="margin-top:8px"><button class="btn sm" id="s-copy">すべてコピー</button><span class="small muted">メモアプリなどに貼り付けて保存してください。</span></div></div>
      <div id="s-pbox" hidden style="margin-top:12px"><textarea id="s-pjson" rows="6" placeholder="バックアップの内容をここに貼り付け" style="font-family:var(--mono);font-size:12px"></textarea>
        <div class="row" style="margin-top:8px"><button class="btn sm primary" id="s-restore">この内容で復元する</button></div></div>
    </div></div>
    <div class="panel" style="margin-top:16px"><div class="panel-h"><h3>コンテンツについて</h3></div><div class="panel-b small">
      <p>問題 ${bank.all.length}問（学科 ${bank.all.filter((q) => q.exam === 'gakka').length}問・実技 ${bank.caseList.length}事例 ${bank.all.filter((q) => q.exam === 'jitsugi').length}問）、レッスン ${bank.lessons.length}件を収録しています。すべての問題・解説はアプリに同梱されており、通信やAIを使わずに動作します。</p>
      <p>問題はすべて、きんざいが公表した過去問題の出題傾向を分析して作成したオリジナル問題です。数値は法令基準日（2026年4月1日）現在の法令等に基づき、出典は「公式・数値集」に記載しています。</p>
    </div></div>
    <div class="panel" style="margin-top:16px;border-color:var(--ng-line)"><div class="panel-h"><h3 style="color:var(--ng)">学習記録の初期化</h3></div><div class="panel-b">
      <p class="small">すべての解答記録・復習スケジュール・模擬試験の結果・設定を削除します。元に戻せません。</p>
      <button class="btn" id="s-reset" style="border-color:var(--ng);color:var(--ng)">すべて削除する</button></div></div>
  </div>`;
  root.querySelectorAll('[data-skin-pick]').forEach((b) => (b.onclick = () => { setSkin(b.dataset.skinPick); renderSettings(root); }));
  // ダウンロードが使えない環境（共有ページ等）でも保存できるよう、テキストとして表示してコピーする
  root.querySelector('#s-exp').onclick = () => {
    const box = root.querySelector('#s-box');
    root.querySelector('#s-json').value = store.exportJSON();
    box.hidden = false;
  };
  root.querySelector('#s-copy').onclick = async () => {
    const ta = root.querySelector('#s-json');
    try { await navigator.clipboard.writeText(ta.value); toast('コピーしました'); }
    catch (e) { ta.focus(); ta.select(); toast('選択しました。コピーしてください'); }
  };
  root.querySelector('#s-paste').onclick = () => { root.querySelector('#s-pbox').hidden = false; root.querySelector('#s-pjson').focus(); };
  root.querySelector('#s-restore').onclick = async () => {
    const text = root.querySelector('#s-pjson').value.trim();
    if (!text) return toast('バックアップの内容を貼り付けてください');
    if (!(await confirmDialog('バックアップから復元', '現在の学習記録は、貼り付けたデータで置き換えられます。', '復元する'))) return;
    try { store.importJSON(text); toast('復元しました'); renderSettings(root); } catch (err) { toast('復元できませんでした：' + err.message); }
  };
  root.querySelector('#s-imp').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const text = await f.text();
      if (!(await confirmDialog('バックアップから復元', '現在の学習記録は、読み込んだデータで置き換えられます。', '復元する'))) return;
      store.importJSON(text); toast('復元しました'); renderSettings(root);
    } catch (err) { toast('読み込みに失敗しました：' + err.message); }
  };
  root.querySelector('#s-reset').onclick = async () => {
    if (await confirmDialog('すべて削除しますか？', '学習記録を完全に削除します。この操作は取り消せません。', '削除する')) { store.reset(); toast('初期化しました'); location.hash = '#home'; }
  };
}
