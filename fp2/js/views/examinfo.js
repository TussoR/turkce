// 試験情報：公式に確認した情報／過去問分析／オリジナル問題／推定 を明確に区別して表示
import { EXAM, FACTS, SOURCES, SYLLABUS_GAKKA, SYLLABUS_JITSUGI, CHECKED } from '../../data/exam.js';
import { ANALYZED, JITSUGI_STRUCTURE, JITSUGI_MIX, CALC_PATTERNS, JITSUGI_TRAPS, GAKKA_FREQ, GAKKA_TRAPS } from '../../data/analysis.js';
import { GAKKA, SUBJ } from '../../data/subjects.js';
import { esc, jpDate } from '../util.js';

const ST = { verified: ['公式情報（確認済み）', 'verified'], index: ['公式発表の抜粋（ページ本体は未確認）', 'unverified'], estimate: ['本アプリの推定・仮定', 'estimate'], secondary: ['二次情報', 'unverified'] };

export function renderExamInfo(root) {
  root.innerHTML = `<div class="page">
    <div class="page-head"><div><div class="eyebrow">EXAM GUIDE</div><h1>試験情報</h1>
      <p>${esc(EXAM.name)}（${esc(EXAM.org)}）。学科試験と実技試験「生保顧客資産相談業務」は<b>別々の試験</b>で、両方に合格すると2級FP技能士となります。</p></div>
      <span class="small muted">公式サイトでの確認日：${jpDate(CHECKED)}</span></div>

    <div class="panel" style="margin-bottom:16px"><div class="panel-b"><div class="row" style="gap:18px">
      <span class="status verified">公式情報（きんざい等の公式ページで確認）</span><span class="status analysis">過去問分析（出題傾向の要約）</span>
      <span class="status original">オリジナル問題（本アプリで作成）</span><span class="status estimate">推定（合格可能性・配点など）</span></div></div></div>

    <div class="grid g2">
      ${['gakka', 'jitsugi'].map((k) => { const e = EXAM[k]; return `<div class="panel"><div class="panel-h"><h2>${esc(e.label)}</h2><span class="status verified">公式</span></div><div class="panel-b">
        <table class="tbl"><tbody>
          <tr><th>実施方式</th><td>${esc(e.format)}（通年・休止期間を除く）</td></tr>
          <tr><th>出題形式</th><td>${esc(e.type)}${k === 'jitsugi' ? '<br><span class="small">〇×の判定／〈語句群〉〈数値群〉からの選択／数値の記入</span>' : ''}</td></tr>
          <tr><th>試験時間</th><td>${e.minutes}分</td></tr>
          <tr><th>合格基準</th><td>${e.max}点満点で${e.passScore}点以上</td></tr>
          <tr><th>実施機関</th><td>${k === 'gakka' ? 'きんざい・日本FP協会（共通問題）' : 'きんざいのみ'}</td></tr>
        </tbody></table></div></div>`; }).join('')}
    </div>

    <div class="panel" style="margin-top:16px"><div class="panel-h"><h2>確認した事実と出典</h2></div><div class="panel-b tight"><div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:22%">項目</th><th>内容</th><th style="width:16%">区分</th></tr></thead><tbody>
      ${FACTS.map((f) => `<tr><td><b>${esc(f.k)}</b></td><td>${esc(f.v)}${f.src ? `<div class="src" style="margin-top:2px"><a href="${esc(SOURCES[f.src].url)}" target="_blank" rel="noopener">${esc(SOURCES[f.src].name)}</a></div>` : ''}</td><td><span class="status ${ST[f.s][1]}">${ST[f.s][0]}</span></td></tr>`).join('')}
    </tbody></table></div></div></div>

    <div class="panel" style="margin-top:16px"><div class="panel-h"><h2>実技「生保顧客資産相談業務」の出題構成</h2><span class="status analysis">過去問分析</span></div><div class="panel-b">
      <p class="small muted">分析対象：${ANALYZED.jitsugi.map(esc).join('、')}</p>
      <div class="tbl-wrap"><table class="tbl bordered"><thead><tr><th style="width:12%">大問</th><th style="width:22%">設例の顧客像</th><th style="width:26%">毎回出題される問</th><th>入れ替わる論点</th></tr></thead><tbody>
        ${JITSUGI_STRUCTURE.map((r) => `<tr><td><b>${esc(r.no)}</b><br><span class="small muted">${esc(SUBJ[r.subject].name)}</span></td><td class="small">${esc(r.client)}</td><td class="small">${esc(r.fixed)}</td><td class="small">${esc(r.rotate)}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="small" style="margin-top:10px">${esc(JITSUGI_MIX)}</p>
      <h3 style="margin-top:16px">頻出の計算手順</h3>
      <table class="tbl"><tbody>${CALC_PATTERNS.map(([k, v]) => `<tr><th style="width:24%">${esc(k)}</th><td class="small">${esc(v)}</td></tr>`).join('')}</tbody></table>
      <h3 style="margin-top:16px">繰り返し出題されるひっかけ</h3>
      <ul class="small" style="padding-left:1.2em">${JITSUGI_TRAPS.map(([k, v]) => `<li><span class="tag">${esc(k)}</span> ${esc(v)}</li>`).join('')}</ul>
    </div></div>

    <div class="panel" style="margin-top:16px"><div class="panel-h"><h2>学科試験の頻出論点</h2><span class="status analysis">過去問分析</span></div><div class="panel-b">
      <p class="small muted">分析対象：${ANALYZED.gakka.map(esc).join('、')}（各分野10問ずつ、計60問。カッコ内は9回中の出題回数）</p>
      <div class="grid g3">${GAKKA.map((s) => `<div><h4 style="margin-bottom:4px">${esc(s.no)}. ${esc(s.name)}</h4><ul class="small" style="padding-left:1.2em;margin:0">${GAKKA_FREQ[s.id].map(([t, n]) => `<li>${esc(t)} <span class="muted">(${n})</span></li>`).join('')}</ul></div>`).join('')}</div>
      <h3 style="margin-top:16px">学科のひっかけの型</h3><ul class="small" style="padding-left:1.2em">${GAKKA_TRAPS.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </div></div>

    <div class="grid g2" style="margin-top:16px">
      <div class="panel"><div class="panel-h"><h3>学科試験の範囲（公式）</h3><span class="status verified">公式</span></div><div class="panel-b small">
        ${GAKKA.map((s) => `<p style="margin-bottom:8px"><b>${esc(s.no)} ${esc(s.name)}</b><br>${SYLLABUS_GAKKA[s.id].map((x, i) => `${i + 1}.${esc(x)}`).join('　')}</p>`).join('')}
        <div class="src"><a href="${SOURCES.kinzaiSpec.url}" target="_blank" rel="noopener">${esc(SOURCES.kinzaiSpec.name)}</a></div></div></div>
      <div class="panel"><div class="panel-h"><h3>実技試験の範囲（公式）</h3><span class="status verified">公式</span></div><div class="panel-b small">
        <ol style="padding-left:1.3em">${SYLLABUS_JITSUGI.map(([h, d]) => `<li style="margin-bottom:6px"><b>${esc(h)}</b><br>${esc(d)}</li>`).join('')}</ol>
        <div class="callout small">公式の範囲は「業務能力」の形で示されています。具体的な論点（年金・保険・法人経理・所得税・相続）は、上の過去問分析から整理したものです。</div>
        <div class="src"><a href="${SOURCES.kinzaiSpec.url}" target="_blank" rel="noopener">${esc(SOURCES.kinzaiSpec.name)}</a></div></div></div>
    </div>

    <div class="panel" style="margin-top:16px"><div class="panel-h"><h3>公式の過去問題について</h3></div><div class="panel-b small">
      <p>きんざいは、CBT化に伴い毎年5月下旬頃に1セット分の試験問題と解答を公表しています（2025年5月公表分・2026年5月公表分）。紙試験の問題（2024年9月・2025年1月・2025年5月）も掲載されています。本アプリの問題は、これらを分析して作成した<b>オリジナル問題</b>であり、公式問題の転載ではありません。実際の問題は公式サイトでご確認ください。</p>
      <p>なお、公表されている2026年5月公表分は2025年4月1日現在の法令に基づくため、現在の受検（2026年4月1日基準）とは一部の数値が異なる場合があります。</p>
      <div class="src"><a href="${SOURCES.kinzaiPast.url}" target="_blank" rel="noopener">${esc(SOURCES.kinzaiPast.name)}</a>　<a href="${SOURCES.kinzaiUse.url}" target="_blank" rel="noopener">${esc(SOURCES.kinzaiUse.name)}</a></div></div></div>
  </div>`;
}
