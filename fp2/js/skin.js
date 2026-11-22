// 表示テーマ（スキン）。<html data-skin="..."> で切り替える。auto はビューア／OSの明暗設定に従う。
// ビューア側が付ける data-theme とは別の属性を使い、互いに干渉しないようにしている。
const KEY = 'fp2-skin';
export const SKINS = [
  ['auto', '自動（端末に合わせる）', '#f7f4ee', '#0e1520'],
  ['light', 'ライト', '#f7f4ee', '#16263d'],
  ['dark', 'ダーク（ネイビー）', '#0e1520', '#35558a'],
  ['black', 'ブラック（有機EL向け）', '#000000', '#d9b877'],
  ['sepia', 'セピア（紙の質感）', '#efe6d4', '#5a3e22'],
];
export function getSkin() {
  try { const v = localStorage.getItem(KEY); return SKINS.some((s) => s[0] === v) ? v : 'auto'; } catch (e) { return 'auto'; }
}
export function applySkin(v = getSkin()) {
  const r = document.documentElement;
  if (v === 'auto') r.removeAttribute('data-skin'); else r.setAttribute('data-skin', v);
  const meta = document.querySelector('meta[name=theme-color]');
  if (meta) meta.content = getComputedStyle(r).getPropertyValue('--side-bg').trim() || '#0f1b2d';
}
export function setSkin(v) {
  try { localStorage.setItem(KEY, v); } catch (e) { /* 保存できなくても表示は切り替える */ }
  applySkin(v);
  window.dispatchEvent(new Event('fp2:skin'));
}
export const skinName = (v = getSkin()) => (SKINS.find((s) => s[0] === v) || SKINS[0])[1].replace(/（.+）/, '');
