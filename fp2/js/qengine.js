// 問題エンジン：出題形式ごとの描画・回答の取得・採点。
// 形式
//  mc    : 択一（学科は四肢択一、実技は三肢択一など） answer = 正解の選択肢index
//  tf    : 〇×（記述①〜③それぞれ） items = [{s, a: true/false, e}]
//  blank : 語群からの空欄補充 blanks = [{k:'ア', a:'語句'}], bank = [語群]
//  num   : 数値記入 parts = [{label, a: 数値, unit:'円'}]
import { esc, parseNumberInput } from './util.js';

const MARK = ['1', '2', '3', '4', '5'];
const CIRC = ['①', '②', '③', '④', '⑤'];

export const typeLabel = (q) =>
  ({ mc: q.choices?.length === 3 ? '三肢択一' : q.choices?.length === 4 ? '四肢択一' : '択一', tf: '〇×', blank: '空欄補充', num: '計算・数値記入' }[q.type] || q.type);

// 本文のマークアップ：**強調**、改行、表（q.table: {head:[], rows:[[]]}）
export function rich(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/〔(.+?)〕/g, '<span class="blank">$1</span>')
    .replace(/\n/g, '<br>');
}
export function tableHTML(t) {
  if (!t) return '';
  return `<div class="tbl-wrap"><table class="tbl bordered">${t.caption ? `<caption class="small muted" style="text-align:left;caption-side:top;padding-bottom:4px">${esc(t.caption)}</caption>` : ''}
    ${t.head ? `<thead><tr>${t.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>` : ''}
    <tbody>${t.rows.map((r) => `<tr>${r.map((c, i) => `<td class="${t.right && t.right.includes(i) ? 'r' : ''}">${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

// 回答欄の描画。resp = 現在の回答（復元用）。locked = 採点済みで操作不可
export function renderAnswer(q, resp, { locked = false, reveal = false } = {}) {
  const dis = locked ? 'disabled' : '';
  if (q.type === 'mc') {
    return `<div class="choices" role="radiogroup">${q.choices
      .map((c, i) => {
        let cls = resp === i ? 'sel' : '';
        if (reveal) cls = i === q.answer ? 'right' : resp === i ? 'wrong' : '';
        return `<button class="choice ${cls}" data-mc="${i}" role="radio" aria-checked="${resp === i}" ${dis}><span class="no">${MARK[i]}</span><span>${rich(c)}</span></button>`;
      })
      .join('')}</div>`;
  }
  if (q.type === 'tf') {
    const r = resp || [];
    return `<div>${q.items
      .map((it, i) => {
        const v = r[i];
        const res = reveal ? (v === it.a ? '<span class="tag ok">正</span>' : '<span class="tag ng">誤</span>') : '';
        return `<div class="tf-row"><div>${CIRC[i]} ${rich(it.s)}</div><div class="row">${res}<div class="seg" role="radiogroup">
          <button data-tf="${i}" data-v="1" class="${v === true ? 'on' : ''}" ${dis} aria-label="${CIRC[i]} 〇">〇</button>
          <button data-tf="${i}" data-v="0" class="${v === false ? 'on' : ''}" ${dis} aria-label="${CIRC[i]} ×">×</button></div></div></div>`;
      })
      .join('')}</div>`;
  }
  if (q.type === 'blank') {
    const r = resp || {};
    const opts = q.bank;
    return `<div class="wordbank"><span class="muted small" style="width:100%">〈語群〉</span>${opts.map((o) => `<span>${esc(o)}</span>`).join('')}</div>
      ${q.blanks
        .map((b) => {
          const res = reveal ? (r[b.k] === b.a ? '<span class="tag ok">正</span>' : `<span class="tag ng">正解：${esc(b.a)}</span>`) : '';
          return `<div class="blank-row"><span class="blank">${esc(b.k)}</span><div class="row" style="flex-wrap:nowrap"><select data-blank="${esc(b.k)}" ${dis} aria-label="空欄${esc(b.k)}">
            <option value="">— 選択 —</option>${opts.map((o) => `<option ${r[b.k] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>${res}</div></div>`;
        })
        .join('')}`;
  }
  if (q.type === 'num') {
    const r = resp || [];
    return q.parts
      .map((p, i) => {
        const v = r[i];
        const res = reveal ? (Number(v) === p.a ? '<span class="tag ok">正</span>' : `<span class="tag ng">正解：${p.a.toLocaleString('ja-JP')}${esc(p.unit || '')}</span>`) : '';
        return `<div class="blank-row" style="grid-template-columns:minmax(6em,auto) 1fr"><span class="small">${rich(p.label || '〈答〉')}</span>
          <div class="row" style="flex-wrap:nowrap"><div class="numin"><input type="text" inputmode="numeric" data-num="${i}" value="${v != null && !Number.isNaN(v) ? Number(v).toLocaleString('ja-JP') : ''}" ${dis} aria-label="${esc(p.label || '数値')}" autocomplete="off"><span>${esc(p.unit || '')}</span></div>${res}</div></div>`;
      })
      .join('');
  }
  return '';
}

// 回答欄から現在の回答を読み取る（DOMイベント経由）。戻り値は新しいresp
export function readEvent(q, resp, target) {
  if (q.type === 'mc') {
    const b = target.closest('[data-mc]');
    return b ? Number(b.dataset.mc) : resp;
  }
  if (q.type === 'tf') {
    const b = target.closest('[data-tf]');
    if (!b) return resp;
    const r = (resp || q.items.map(() => null)).slice();
    r[Number(b.dataset.tf)] = b.dataset.v === '1';
    return r;
  }
  if (q.type === 'blank') {
    const s = target.closest('[data-blank]');
    if (!s) return resp;
    return Object.assign({}, resp || {}, { [s.dataset.blank]: s.value || undefined });
  }
  if (q.type === 'num') {
    const s = target.closest('[data-num]');
    if (!s) return resp;
    const r = (resp || q.parts.map(() => null)).slice();
    const v = parseNumberInput(s.value);
    r[Number(s.dataset.num)] = Number.isNaN(v) ? null : v;
    return r;
  }
  return resp;
}

export function isAnswered(q, resp) {
  if (resp == null) return false;
  if (q.type === 'mc') return Number.isInteger(resp);
  if (q.type === 'tf') return resp.length === q.items.length && resp.every((v) => v === true || v === false);
  if (q.type === 'blank') return q.blanks.every((b) => resp[b.k]);
  if (q.type === 'num') return q.parts.every((_, i) => resp[i] != null && !Number.isNaN(resp[i]));
  return false;
}

// 採点：score（0〜1の部分点）と ok（完全正解）を返す
export function grade(q, resp) {
  let parts = [];
  if (q.type === 'mc') parts = [resp === q.answer];
  else if (q.type === 'tf') parts = q.items.map((it, i) => (resp || [])[i] === it.a);
  else if (q.type === 'blank') parts = q.blanks.map((b) => (resp || {})[b.k] === b.a);
  else if (q.type === 'num') parts = q.parts.map((p, i) => (resp || [])[i] != null && Math.abs(Number((resp || [])[i]) - p.a) < 0.5);
  const n = parts.filter(Boolean).length;
  return { score: parts.length ? n / parts.length : 0, ok: n === parts.length && parts.length > 0, parts };
}

// 正解の表示用テキスト
export function answerText(q) {
  if (q.type === 'mc') return `${MARK[q.answer]}`;
  if (q.type === 'tf') return q.items.map((it, i) => `${CIRC[i]}${it.a ? '〇' : '×'}`).join(' ');
  if (q.type === 'blank') return q.blanks.map((b) => `${b.k}：${b.a}`).join('、');
  if (q.type === 'num') return q.parts.map((p) => `${p.label ? p.label + ' ' : ''}${p.a.toLocaleString('ja-JP')}${p.unit || ''}`).join('、');
  return '';
}

// 解説の描画
export function renderExplain(q, g) {
  const verdict = g
    ? `<div class="verdict ${g.ok ? 'ok' : 'ng'}">${g.ok ? '正解' : g.score > 0 ? '一部正解' : '不正解'}<span class="small muted" style="font-family:var(--sans)">正解：${esc(answerText(q))}</span></div>`
    : `<div class="verdict">正解：${esc(answerText(q))}</div>`;
  let why = '';
  if (q.type === 'mc' && q.why) {
    why = `<ul class="why">${q.choices
      .map((c, i) => `<li><b style="color:${i === q.answer ? 'var(--ok)' : 'var(--ink-2)'}">選択肢${MARK[i]}${i === q.answer ? '（正解）' : ''}</b>　${rich(q.why[i] || '')}</li>`)
      .join('')}</ul>`;
  }
  if (q.type === 'tf') {
    why = `<ul class="why">${q.items.map((it, i) => `<li><b style="color:${it.a ? 'var(--ok)' : 'var(--ng)'}">${CIRC[i]} ${it.a ? '〇 適切' : '× 不適切'}</b>　${rich(it.e || '')}</li>`).join('')}</ul>`;
  }
  const steps = q.steps ? `<h4 style="margin-top:12px">計算の手順</h4><ol class="steps">${q.steps.map((s) => `<li>${rich(s)}</li>`).join('')}</ol>` : '';
  const trap = q.trap ? `<div class="note trap" style="margin-top:10px">${rich(q.trap)}</div>` : '';
  return `<div class="explain">${verdict}<div class="body">${rich(q.explain || '')}</div>${steps}${why}${trap}</div>`;
}
