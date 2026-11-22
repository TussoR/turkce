// 共通ユーティリティ（DOM・日付・文字列・数値）
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const pad = (n) => String(n).padStart(2, '0');
export const dstr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => dstr(new Date());
export const addDays = (s, n) => {
  const [y, m, d] = s.split('-').map(Number);
  return dstr(new Date(y, m - 1, d + n));
};
export const daysBetween = (a, b) => {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5);
};
export const jpDate = (s) => {
  if (!s) return '—';
  const [y, m, d] = s.split('-').map(Number);
  const w = '日月火水木金土'[new Date(y, m - 1, d).getDay()];
  return `${y}年${m}月${d}日（${w}）`;
};
export const shortDate = (s) => {
  if (!s) return '—';
  const [, m, d] = s.split('-').map(Number);
  return `${m}/${d}`;
};

export const shuffle = (a, rnd = Math.random) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const sum = (a) => a.reduce((x, y) => x + y, 0);
export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const pct = (x) => `${Math.round(x * 100)}%`;
export const yen = (n) => `${Math.round(n).toLocaleString('ja-JP')}円`;
export const num = (n) => Math.round(n).toLocaleString('ja-JP');

export const fmtTime = (sec) => {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};
export const fmtDur = (ms) => {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}秒`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}分${s % 60 ? (s % 60) + '秒' : ''}` : `${Math.floor(m / 60)}時間${m % 60}分`;
};

// 検索用の正規化：全角英数→半角、カタカナ→ひらがな、空白・記号の除去、小文字化
export const normJa = (s) =>
  String(s ?? '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s・、。，．,.\-ー－（）()「」『』【】]/g, '')
    .toLowerCase();

// 数値入力の正規化（全角数字・カンマ・「円」「万円」を許容）
export const parseNumberInput = (s) => {
  if (s == null) return NaN;
  let t = String(s)
    .replace(/[０-９．－]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[,，\s円]/g, '');
  let mul = 1;
  if (/万$/.test(t)) { mul = 10000; t = t.replace(/万$/, ''); }
  if (t === '' || !/^-?\d+(\.\d+)?$/.test(t)) return NaN;
  return Number(t) * mul;
};

// 決定的な疑似乱数（模擬試験の再現用）
export const seeded = (seed) => {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17;
    x ^= x << 5; x >>>= 0;
    return x / 4294967296;
  };
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

let toastTimer;
export function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

export function confirmDialog(title, body, okLabel = 'OK', cancelLabel = 'キャンセル') {
  return new Promise((resolve) => {
    const m = $('#modal');
    m.innerHTML = `<div class="modal-back"></div><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="mdl-t">
      <h3 id="mdl-t">${esc(title)}</h3><div class="modal-body">${body}</div>
      <div class="modal-actions"><button class="btn ghost" data-r="0">${esc(cancelLabel)}</button><button class="btn primary" data-r="1">${esc(okLabel)}</button></div></div>`;
    m.classList.add('open');
    const done = (v) => { m.classList.remove('open'); m.innerHTML = ''; resolve(v); };
    m.querySelector('.modal-back').onclick = () => done(false);
    m.querySelectorAll('[data-r]').forEach((b) => (b.onclick = () => done(b.dataset.r === '1')));
    m.querySelector('[data-r="1"]').focus();
  });
}
