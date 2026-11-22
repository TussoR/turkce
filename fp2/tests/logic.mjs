// ロジックの単体テスト：計算ライブラリ（公表資料の計算例と照合）、SRS、採点、模擬試験の採点・出題構成
import assert from 'node:assert/strict';
import * as C from '../js/calc.js';
import { nextState, isMastered, isDifficult } from '../js/srs.js';
import { grade, isAnswered } from '../js/qengine.js';
import { parseNumberInput, normJa } from '../js/util.js';

let n = 0;
const t = (name, f) => { try { f(); n++; } catch (e) { console.error('✗', name, '\n ', e.message); process.exitCode = 1; } };

// ===== 所得税 =====
t('所得税 速算表 500万', () => assert.equal(C.incomeTax(5_000_000), 572_500));
t('所得税 1,000円未満切捨て', () => assert.equal(C.incomeTax(1_950_999), C.incomeTax(1_950_000)));
t('所得税 195万ちょうど=5%', () => assert.equal(C.incomeTax(1_950_000), 97_500));
t('所得税 330万', () => assert.equal(C.incomeTax(3_300_000), 232_500));
t('所得税 900万', () => assert.equal(C.incomeTax(9_000_000), 1_434_000));
t('給与所得控除 最低65万（令和7）', () => assert.equal(C.salaryDeduction(1_500_000), 650_000));
t('給与所得控除 600万', () => assert.equal(C.salaryDeduction(6_000_000), 1_640_000));
t('給与所得控除 上限195万', () => assert.equal(C.salaryDeduction(12_000_000), 1_950_000));
t('給与所得控除 区分境界の連続性 190万', () => assert.equal(C.salaryDeduction(1_900_000), 650_000));
t('給与所得控除 区分境界の連続性 360万', () => assert.equal(1_900_000 * 0, 0) || assert.equal(C.salaryDeduction(3_600_000), 1_160_000));
t('退職所得控除 勤続30年', () => assert.equal(C.retirementDeduction(30), 15_000_000));
t('退職所得控除 最低80万', () => assert.equal(C.retirementDeduction(1), 800_000));
t('退職所得 2,000万・30年', () => assert.equal(C.retirementIncome(20_000_000, 30), 2_500_000));
t('退職所得 特定役員は1/2なし', () => assert.equal(C.retirementIncome(10_000_000, 4, { officerShort: true }), 8_400_000));
// 分析で確認した公表問題の計算例：勤続26年2か月→27年、控除1,290万円
t('退職所得控除 27年', () => assert.equal(C.retirementDeduction(27), 12_900_000));
t('退職所得控除 31年', () => assert.equal(C.retirementDeduction(31), 15_700_000));
t('一時所得 特別控除50万', () => assert.equal(C.temporaryIncome(9_200_000, 8_000_000), 700_000));
t('一時所得 マイナスは0', () => assert.equal(C.temporaryIncome(3_000_000, 2_800_000), 0));
t('生命保険料控除 新・8万超', () => assert.equal(C.lifeInsDeductionNew(100_000), 40_000));
t('生命保険料控除 新・6万', () => assert.equal(C.lifeInsDeductionNew(60_000), 35_000));
t('生命保険料控除 23歳未満特例（令和8・9年分）96,000円', () => assert.equal(C.lifeInsDeductionNewU23(96_000), 54_000));
t('生命保険料控除 23歳未満特例 上限6万', () => assert.equal(C.lifeInsDeductionNewU23(150_000), 60_000));
t('生命保険料控除 旧・10万超', () => assert.equal(C.lifeInsDeductionOld(120_000), 50_000));
t('生命保険料控除 住民税・新', () => assert.equal(C.lifeInsDeductionNewResident(100_000), 28_000));
t('個人年金 雑所得', () => assert.equal(C.pensionMiscIncome(1_000_000, 6_000_000, 10_000_000), 400_000));

// ===== 年金 =====
t('老齢基礎年金 満額', () => assert.equal(C.oldAgeBasic(847_300, 480), 847_300));
t('老齢基礎年金 444月', () => assert.equal(C.oldAgeBasic(847_300, 444), Math.round(847_300 * 444 / 480)));
// 公表問題の計算例（2024年度満額816,000円）：解答例 1,328,544円など。ここでは算式の再現性のみ確認
t('報酬比例部分', () => assert.equal(C.earningsRelated(300_000, 120, 400_000, 300), 914_220));
t('繰下げ 70歳 = 42%増', () => assert.ok(Math.abs(C.deferFactor(60) - 1.42) < 1e-9));
t('繰下げ 上限120月', () => assert.ok(Math.abs(C.deferFactor(200) - 1.84) < 1e-9));
t('繰上げ 60歳 = 24%減', () => assert.ok(Math.abs(C.earlyFactor(60) - 0.76) < 1e-9));
t('遺族厚生年金 300月みなし', () => assert.equal(C.survivorEmployees(600_000, 200), 675_000));
t('遺族厚生年金 300月以上はそのまま', () => assert.equal(C.survivorEmployees(800_000, 360), 600_000));

// ===== 相続・贈与 =====
t('基礎控除 3人', () => assert.equal(C.inheritanceBasicDeduction(3), 48_000_000));
t('非課税 3人', () => assert.equal(C.insuranceExempt(3), 15_000_000));
// 公表問題の解説例：課税価格4億円・配偶者＋子2人 → 相続税の総額 9,220万円
t('相続税の総額 4億 配偶者+子2', () => assert.equal(C.inheritanceTaxTotal(400_000_000 - 48_000_000, [1 / 2, 1 / 4, 1 / 4]), 92_200_000));
// 課税価格1.7億・子2人 → 総額 2,440万円
t('相続税の総額 1.7億 子2', () => assert.equal(C.inheritanceTaxTotal(170_000_000 - 42_000_000, [1 / 2, 1 / 2]), 24_400_000));
// 課税価格5億・配偶者＋子2人 → 13,110万円
t('相続税の総額 5億 配偶者+子2', () => assert.equal(C.inheritanceTaxTotal(500_000_000 - 48_000_000, [1 / 2, 1 / 4, 1 / 4]), 131_100_000));
t('贈与税 一般 500万', () => assert.equal(C.giftTax(5_000_000), 530_000));
t('贈与税 特例 500万', () => assert.equal(C.giftTax(5_000_000, true), 485_000));
t('贈与税 110万以下は0', () => assert.equal(C.giftTax(1_100_000), 0));
t('精算課税 3,000万', () => assert.equal(C.seisanGiftTax(30_000_000 - 1_100_000), 780_000));
t('役員退職金 功績倍率', () => assert.equal(C.officerRetirement(1_000_000, 30, 3), 90_000_000));
t('高額療養費 区分ウ 100万', () => assert.equal(C.highCostCareU(1_000_000), 87_430));
t('傷病手当金 日額', () => assert.equal(C.sicknessAllowanceDaily(300_000), 6_667));
t('係数 逆数関係', () => assert.ok(Math.abs(C.crf(0.02, 10) * C.annuityPV(0.02, 10) - 1) < 1e-12));
t('最終利回り', () => assert.ok(Math.abs(C.yieldSimple(1, 98, 4) - 1.5306) < 1e-3));

// ===== SRS =====
t('SRS 不正解は翌日', () => { const s = nextState(null, false, false, '2026-11-22'); assert.equal(s.due, '2026-11-23'); assert.equal(s.lp, 1); });
t('SRS 正解の間隔 3→6→伸長', () => {
  let s = nextState(null, true, false, '2026-11-01'); assert.equal(s.iv, 3);
  s = nextState(s, true, false, '2026-11-04'); assert.equal(s.iv, 6);
  s = nextState(s, true, false, '2026-11-10'); assert.ok(s.iv > 6);
});
t('SRS あいまい正解は短め', () => { const a = nextState(null, true, true); const b = nextState(null, true, false); assert.ok(a.iv < b.iv); });
t('SRS 定着判定', () => { let s = null; let d = '2026-01-01'; for (let i = 0; i < 6; i++) s = nextState(s, true, false, d); assert.ok(isMastered(s)); });
t('SRS 苦手判定', () => { let s = nextState(null, false); s = nextState(s, true); s = nextState(s, false); assert.ok(isDifficult(s)); });

// ===== 採点 =====
const mc = { type: 'mc', choices: ['a', 'b', 'c', 'd'], answer: 2 };
t('択一 正解', () => assert.ok(grade(mc, 2).ok));
t('択一 不正解', () => assert.ok(!grade(mc, 1).ok));
t('択一 未回答', () => assert.ok(!isAnswered(mc, null)));
const tf = { type: 'tf', items: [{ a: true }, { a: false }, { a: true }] };
t('〇× 部分点', () => { const g = grade(tf, [true, true, true]); assert.ok(!g.ok); assert.ok(Math.abs(g.score - 2 / 3) < 1e-9); });
t('〇× 全問正解', () => assert.ok(grade(tf, [true, false, true]).ok));
t('〇× 未回答判定', () => assert.ok(!isAnswered(tf, [true, null, true])));
const bl = { type: 'blank', blanks: [{ k: '①', a: 'X' }, { k: '②', a: 'Y' }], bank: ['X', 'Y', 'Z'] };
t('空欄 採点', () => assert.equal(grade(bl, { '①': 'X', '②': 'Z' }).score, 0.5));
const nm = { type: 'num', parts: [{ a: 847300 }, { a: 1200 }] };
t('数値 採点', () => assert.ok(grade(nm, [847300, 1200]).ok));
t('数値 入力の正規化', () => { assert.equal(parseNumberInput('８４７，３００円'), 847300); assert.equal(parseNumberInput('1,290万'), 12_900_000); assert.ok(Number.isNaN(parseNumberInput('abc'))); });
t('検索の正規化 カタカナ=ひらがな', () => assert.equal(normJa('ソウゾク税'), normJa('そうぞく税')));

// ===== 模擬試験 =====
const { scoreSection, buildGakka, buildJitsugi } = await import('../js/views/mock.js');
const { bank } = await import('../js/core.js');
const { EXAM } = await import('../data/exam.js');
t('学科模試 60問・各科目10問', () => {
  const ids = buildGakka();
  if (bank.all.filter((q) => q.exam === 'gakka').length < 60) return; // コンテンツ未投入時はスキップ
  assert.equal(ids.length, 60);
  assert.equal(new Set(ids).size, 60);
  const per = {}; ids.forEach((id) => { const s = bank.byId[id].subject; per[s] = (per[s] || 0) + 1; });
  assert.deepEqual(Object.values(per), [10, 10, 10, 10, 10, 10]);
});
t('実技模試 5題15問', () => {
  if (bank.caseList.length < 5) return;
  const ids = buildJitsugi();
  assert.equal(ids.length, 15);
  const subs = [...new Set(ids.map((id) => bank.byId[id].subject))];
  assert.deepEqual(subs, ['jn', 'jk', 'jh', 'js', 'jz']);
});
t('学科採点 全問正解=60点・合格', () => {
  const ids = buildGakka();
  if (ids.length < 60) return;
  const resp = Object.fromEntries(ids.map((id) => [id, bank.byId[id].answer]));
  const r = scoreSection({ kind: 'gakka', ids }, resp);
  assert.equal(r.score, 60); assert.ok(r.passed);
});
t('学科採点 35点は不合格・36点は合格', () => {
  const ids = buildGakka();
  if (ids.length < 60) return;
  const mk = (k) => Object.fromEntries(ids.map((id, i) => [id, i < k ? bank.byId[id].answer : (bank.byId[id].answer + 1) % 4]));
  assert.equal(scoreSection({ kind: 'gakka', ids }, mk(35)).passed, false);
  assert.equal(scoreSection({ kind: 'gakka', ids }, mk(36)).passed, true);
  assert.equal(scoreSection({ kind: 'gakka', ids }, mk(36)).score, EXAM.gakka.passScore);
});
t('実技採点 満点=50点', () => {
  if (bank.caseList.length < 5) return;
  const ids = buildJitsugi();
  const resp = {};
  for (const id of ids) {
    const q = bank.byId[id];
    resp[id] = q.type === 'tf' ? q.items.map((x) => x.a) : q.type === 'blank' ? Object.fromEntries(q.blanks.map((b) => [b.k, b.a])) : q.type === 'num' ? q.parts.map((p) => p.a) : q.answer;
  }
  const r = scoreSection({ kind: 'jitsugi', ids }, resp);
  assert.equal(r.score, 50); assert.ok(r.passed);
  assert.equal(scoreSection({ kind: 'jitsugi', ids }, {}).score, 0);
});

console.log(`${n} 件のテストに合格${process.exitCode ? '（失敗あり）' : ''}`);
