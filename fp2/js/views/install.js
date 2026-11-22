// ホーム画面に追加（PWAとしてインストール）の案内。端末を判定し、その端末の手順を先頭に表示する。
// Android/PCのChrome・Edgeでは beforeinstallprompt を受け取れた場合に「インストール」ボタンを出す。
import { esc, toast } from '../util.js';

let deferred = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e;
  window.dispatchEvent(new Event('fp2:installable'));
});
window.addEventListener('appinstalled', () => { deferred = null; toast('ホーム画面に追加しました'); });

const ua = navigator.userAgent;
export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = () => /Android/.test(ua);
const isMobile = () => isIOS() || isAndroid() || matchMedia('(max-width: 860px)').matches;
export const platform = () => (isIOS() ? 'ios' : isAndroid() ? 'android' : 'pc');

const KEY = 'fp2-install-hint';
export function hintDismissed() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
export function dismissHint() { try { localStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ } }
// ダッシュボードの案内カードを出すか（スマホで、まだホーム画面から開いていないとき）
export const shouldShowHint = () => isMobile() && !isStandalone() && !hintDismissed();

const SHARE_ICON = '<span class="kbd" aria-label="共有ボタン">□↑</span>';
const GUIDES = {
  ios: {
    name: 'iPhone・iPad',
    note: 'Safari で開いてください（iOS 16.4 以降は Chrome などからも追加できます）。',
    steps: [
      `画面下（iPadは右上）の共有ボタン ${SHARE_ICON} をタップします。`,
      '一覧を下にスクロールし、「<b>ホーム画面に追加</b>」をタップします。',
      '名前が「FP2級」になっていることを確認し、右上の「<b>追加</b>」をタップします。',
      'ホーム画面に「FP2級」のアイコンができます。次からはこのアイコンから開いてください。',
    ],
  },
  android: {
    name: 'Android',
    note: 'Chrome で開いてください。',
    steps: [
      '画面右上の「<b>⋮</b>」（メニュー）をタップします。',
      '「<b>ホーム画面に追加</b>」または「<b>アプリをインストール</b>」をタップします。',
      '確認画面で「<b>インストール</b>」（または「追加」）をタップします。',
      'ホーム画面とアプリ一覧に「FP2級」のアイコンができます。',
    ],
  },
  pc: {
    name: 'パソコン（Chrome・Edge）',
    note: 'Safari・Firefox では、ブックマークに登録してご利用ください。',
    steps: [
      'アドレスバーの右端にあるインストールのアイコン（モニターに↓の形）をクリックします。',
      '「<b>インストール</b>」をクリックすると、専用のウィンドウで開けるようになります。',
    ],
  },
};

const guideHTML = (k, open) => {
  const g = GUIDES[k];
  return `<details class="panel" style="margin-top:12px" ${open ? 'open' : ''}><summary class="panel-h" style="cursor:pointer;list-style:none"><h3>${esc(g.name)}${open ? '<span class="tag gakka" style="margin-left:8px;font-family:var(--sans)">お使いの端末</span>' : ''}</h3><span class="small muted">${open ? '' : '開く'}</span></summary>
    <div class="panel-b"><p class="small muted" style="margin-top:0">${esc(g.note)}</p><ol class="steps">${g.steps.map((s) => `<li>${s}</li>`).join('')}</ol></div></details>`;
};

export function renderInstall(root) {
  const p = platform();
  const order = [p, ...['ios', 'android', 'pc'].filter((x) => x !== p)];
  const standalone = isStandalone();
  root.innerHTML = `<div class="page page-narrow">
    <div class="page-head"><div><div class="eyebrow">INSTALL</div><h1>ホーム画面に追加</h1>
      <p>ホーム画面に追加すると、アプリのように全画面で開けます。一度開いた後は、電波のない場所でも学習できます。</p></div></div>
    ${standalone ? '<div class="callout gold">いまホーム画面のアプリとして開いています。追加は完了しています。</div>' : `
    <div class="panel"><div class="panel-b" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
      <img src="icons/icon-192.png" alt="" width="64" height="64" style="border-radius:14px;flex:none">
      <div style="flex:1;min-width:200px"><div class="serif" style="font-size:17px;color:var(--heading)">FP2級</div>
        <div class="small muted">追加すると、このアイコンがホーム画面に表示されます。</div></div>
      <button class="btn primary" id="ins-btn" ${deferred ? '' : 'hidden'}>インストール</button>
    </div></div>
    ${order.map((k, i) => guideHTML(k, i === 0)).join('')}`}
    <div class="panel" style="margin-top:16px"><div class="panel-h"><h3>学習記録について</h3></div><div class="panel-b small">
      <ul style="padding-left:1.2em;margin:0">
        <li>学習記録は、開いているブラウザ（またはホーム画面のアプリ）の中に保存されます。</li>
        <li><b>iPhone・iPad では、ホーム画面のアプリと Safari の記録は別々です。</b>先にホーム画面に追加し、以後はアイコンから開いて学習するのがおすすめです。</li>
        <li>すでに Safari などで学習を進めている場合は、「<a href="#data">設定・テーマ</a>」の「バックアップを表示」でコピーし、ホーム画面のアプリ側で「貼り付けて復元」すると記録を移せます。</li>
      </ul></div></div>
  </div>`;
  const btn = root.querySelector('#ins-btn');
  if (btn) {
    btn.onclick = async () => {
      if (!deferred) return;
      deferred.prompt();
      const r = await deferred.userChoice.catch(() => null);
      deferred = null; btn.hidden = true;
      if (r && r.outcome === 'accepted') toast('ホーム画面に追加しました');
    };
    window.addEventListener('fp2:installable', () => { if (document.body.contains(btn)) btn.hidden = false; }, { once: true });
  }
}
