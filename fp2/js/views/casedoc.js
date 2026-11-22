// 実技の設例（顧客情報・表）の描画
import { esc } from '../util.js';
import { rich, tableHTML } from '../qengine.js';

export function renderBlocks(blocks = []) {
  return blocks.map((b) => {
    if (b.h) return `<h3>${esc(b.h)}</h3>`;
    if (b.p) return `<p>${rich(b.p)}</p>`;
    if (b.ul) return `<ul>${b.ul.map((x) => `<li>${rich(x)}</li>`).join('')}</ul>`;
    if (b.table) return tableHTML(b.table);
    if (b.note) return `<p class="small muted">${rich(b.note)}</p>`;
    return '';
  }).join('');
}

export function renderDoc(c, activeNo) {
  return `<div class="small" style="color:var(--gold);letter-spacing:.12em">《設例》${activeNo ? ` ／ 解答中：《問${activeNo}》` : ''}</div>
    <h2 style="font-size:16.5px;margin:4px 0 12px">${esc(c.title)}</h2>
    ${renderBlocks(c.doc)}`;
}
