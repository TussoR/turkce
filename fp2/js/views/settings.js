// 設定・データ管理：学習記録のバックアップ（書き出し・読み込み）と初期化
import * as store from '../store.js';
import { bank } from '../core.js';
import { esc, toast, confirmDialog, today } from '../util.js';

export function renderSettings(root) {
  const st = store.get();
  const size = new Blob([store.exportJSON()]).size;
  root.innerHTML = `<div class="page page-narrow">
    <div class="page-head"><div><div class="eyebrow">SETTINGS</div><h1>設定・データ</h1>
      <p>学習記録はこの端末のブラウザ（localStorage）に保存されます。端末の変更やブラウザのデータ削除に備えて、定期的にバックアップしてください。</p></div></div>
    <div class="panel"><div class="panel-h"><h3>学習記録</h3></div><div class="panel-b">
      <table class="tbl"><tbody>
        <tr><th>記録開始日</th><td>${esc(st.created)}</td></tr>
        <tr><th>解答ログ</th><td>${st.log.length.toLocaleString()}件</td></tr>
        <tr><th>解答済みの問題</th><td>${Object.keys(st.qs).length} / ${bank.all.length}問</td></tr>
        <tr><th>修了レッスン</th><td>${Object.values(st.lessons).filter((l) => l.done).length} / ${bank.lessons.length}</td></tr>
        <tr><th>模擬試験の受験回数</th><td>${st.mocks.length}回</td></tr>
        <tr><th>データサイズ</th><td>${(size / 1024).toFixed(1)} KB</td></tr>
      </tbody></table>
      <div class="row" style="margin-top:14px"><button class="btn primary" id="s-exp">バックアップを書き出す（JSON）</button>
        <label class="btn" style="cursor:pointer">バックアップから復元<input type="file" accept="application/json,.json" id="s-imp" hidden></label></div>
    </div></div>
    <div class="panel" style="margin-top:16px"><div class="panel-h"><h3>コンテンツについて</h3></div><div class="panel-b small">
      <p>問題 ${bank.all.length}問（学科 ${bank.all.filter((q) => q.exam === 'gakka').length}問・実技 ${bank.caseList.length}事例 ${bank.all.filter((q) => q.exam === 'jitsugi').length}問）、レッスン ${bank.lessons.length}件を収録しています。すべての問題・解説はアプリに同梱されており、通信やAIを使わずに動作します。</p>
      <p>問題はすべて、きんざいが公表した過去問題の出題傾向を分析して作成したオリジナル問題です。数値は法令基準日（2026年4月1日）現在の法令等に基づき、出典は「公式・数値集」に記載しています。</p>
    </div></div>
    <div class="panel" style="margin-top:16px;border-color:#e4b9b3"><div class="panel-h"><h3 style="color:var(--ng)">学習記録の初期化</h3></div><div class="panel-b">
      <p class="small">すべての解答記録・復習スケジュール・模擬試験の結果・設定を削除します。元に戻せません。</p>
      <button class="btn" id="s-reset" style="border-color:var(--ng);color:var(--ng)">すべて削除する</button></div></div>
  </div>`;
  root.querySelector('#s-exp').onclick = () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fp2-master-backup-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
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
    if (await confirmDialog('すべて削除しますか？', '学習記録を完全に削除します。この操作は取り消せません。', '削除する')) { store.reset(); toast('初期化しました'); location.hash = '#/'; }
  };
}
