// 公式・数値集：日本語（ひらがな・カタカナ・漢字）で検索。時期により変わる数値には出典と基準日を表示
import { REF, REF_CATS } from '../../data/reference.js';
import { esc, normJa } from '../util.js';
import { tableHTML } from '../qengine.js';

let q = '', cat = '';
const STATUS = { verified: ['公式資料で確認', 'verified'], law: ['法令の定め', 'verified'], unverified: ['未確認（要確認）', 'unverified'] };

export function renderReference(root, focus) {
  root.innerHTML = `<div class="page">
    <div class="page-head"><div><div class="eyebrow">REFERENCE</div><h1>公式・数値集</h1>
      <p>税率・控除額・年金額・保険の経理処理などを検索できます。年度により変わる数値には<b>基準日と出典</b>を表示しています。試験は法令基準日（2026年6月〜2027年3月24日の試験は2026年4月1日）現在の法令に基づきます。</p></div></div>
    <div class="row" style="margin-bottom:14px;gap:12px">
      <input type="search" id="rf-q" placeholder="例：退職所得、そうぞくぜい、ハイグウシャ、生命保険料控除" value="${esc(q)}" style="max-width:420px" aria-label="検索">
      <select id="rf-cat" style="max-width:220px"><option value="">すべての分類</option>${REF_CATS.map((c) => `<option ${cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
      <span class="small muted" id="rf-n"></span>
    </div>
    <div id="rf-list"></div></div>`;
  const list = root.querySelector('#rf-list');
  const draw = () => {
    const nq = normJa(q);
    const hits = REF.filter((r) => (!cat || r.cat === cat) && (!nq || normJa([r.title, r.kw, r.cat, r.text || '', strip(r.body)].join(' ')).includes(nq)));
    root.querySelector('#rf-n').textContent = `${hits.length}件`;
    list.innerHTML = hits.map((r) => card(r, r.id === focus)).join('') || '<div class="empty">見つかりませんでした。別の言葉（ひらがな・略称など）でお試しください。</div>';
    if (focus) { const el = list.querySelector(`[data-id="${focus}"]`); if (el) { el.scrollIntoView({ block: 'start' }); focus = null; } }
  };
  root.querySelector('#rf-q').addEventListener('input', (e) => { q = e.target.value; draw(); });
  root.querySelector('#rf-cat').addEventListener('change', (e) => { cat = e.target.value; draw(); });
  draw();
}

const strip = (s) => String(s || '').replace(/<[^>]+>/g, ' ');

function card(r, hi) {
  const [sl, sc] = STATUS[r.status] || STATUS.unverified;
  return `<div class="panel" data-id="${esc(r.id)}" style="margin-bottom:12px;${hi ? 'border-color:var(--gold);box-shadow:0 0 0 2px var(--gold-soft)' : ''}">
    <div class="panel-h"><div><div class="small muted">${esc(r.cat)}</div><h3>${esc(r.title)}</h3></div><span class="status ${sc}">${sl}</span></div>
    <div class="panel-b">
      ${r.formula ? `<div class="formula">${r.formula}</div>` : ''}
      ${r.table ? tableHTML(r.table) : ''}
      ${r.body ? `<div class="small" style="margin-top:6px">${r.body}</div>` : ''}
      ${r.change ? `<div class="callout warn small" style="margin-top:8px"><b>改正点：</b>${r.change}</div>` : ''}
      <div class="src">基準：${esc(r.asOf || '—')}${r.src?.length ? ' ／ 出典：' + r.src.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join('、') : ''}</div>
    </div></div>`;
}
