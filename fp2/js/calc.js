// FP計算ライブラリ。問題の正答を独立に再計算して検証するため（tests/validate.mjs）と、
// 参考資料の計算機で使用する。年度依存の数値は FIG にまとめ、出典は data/reference.js に記載。
// 端数処理は各制度の原則に従う（所得税：課税所得1,000円未満切捨て、税額100円未満切捨て等）。

export const FIG = {
  // 所得税の速算表（所得税法89条。平成27年分以降）
  incomeTax: [
    [1_950_000, 0.05, 0],
    [3_300_000, 0.10, 97_500],
    [6_950_000, 0.20, 427_500],
    [9_000_000, 0.23, 636_000],
    [18_000_000, 0.33, 1_536_000],
    [40_000_000, 0.40, 2_796_000],
    [Infinity, 0.45, 4_796_000],
  ],
  // 相続税の速算表（相続税法16条。平成27年以降）
  inheritanceTax: [
    [10_000_000, 0.10, 0],
    [30_000_000, 0.15, 500_000],
    [50_000_000, 0.20, 2_000_000],
    [100_000_000, 0.30, 7_000_000],
    [200_000_000, 0.40, 17_000_000],
    [300_000_000, 0.45, 27_000_000],
    [600_000_000, 0.50, 42_000_000],
    [Infinity, 0.55, 72_000_000],
  ],
  // 贈与税（暦年課税）：基礎控除後の課税価格に対する速算表
  giftGeneral: [
    [2_000_000, 0.10, 0],
    [3_000_000, 0.15, 100_000],
    [4_000_000, 0.20, 250_000],
    [6_000_000, 0.30, 650_000],
    [10_000_000, 0.40, 1_250_000],
    [15_000_000, 0.45, 1_750_000],
    [30_000_000, 0.50, 2_500_000],
    [Infinity, 0.55, 4_000_000],
  ],
  giftSpecial: [ // 特例税率（直系尊属から18歳以上の者への贈与）
    [2_000_000, 0.10, 0],
    [4_000_000, 0.15, 100_000],
    [6_000_000, 0.20, 300_000],
    [10_000_000, 0.30, 900_000],
    [15_000_000, 0.40, 1_900_000],
    [30_000_000, 0.45, 2_650_000],
    [45_000_000, 0.50, 4_150_000],
    [Infinity, 0.55, 6_400_000],
  ],
};

const bracket = (table, x) => {
  for (const [lim, rate, ded] of table) if (x <= lim) return x * rate - ded;
  return 0;
};
const floorTo = (x, unit) => Math.floor(x / unit) * unit;

/* ===== 所得税 ===== */
// 課税総所得金額（1,000円未満切捨て）→ 所得税額（復興特別所得税を含まない）
export function incomeTax(taxable) {
  const t = floorTo(Math.max(0, taxable), 1000);
  return Math.max(0, Math.round(bracket(FIG.incomeTax, t)));
}

// 給与所得控除額（令和7年分以降）
export function salaryDeduction(rev) {
  if (rev <= 1_900_000) return Math.min(rev, 650_000);
  if (rev <= 3_600_000) return rev * 0.3 + 80_000;
  if (rev <= 6_600_000) return rev * 0.2 + 440_000;
  if (rev <= 8_500_000) return rev * 0.1 + 1_100_000;
  return 1_950_000;
}
// 給与所得（※実務の「所得税法別表第五」による1,000円/4,000円単位の端数調整は、
//  試験では原則として算式どおりで出題されるため本ライブラリは算式どおり計算する）
export const salaryIncome = (rev) => Math.max(0, rev - salaryDeduction(rev));

// 退職所得（一般の退職手当等）。years は1年未満切上げ後の勤続年数
export function retirementDeduction(years, disability = false) {
  let d = years <= 20 ? Math.max(800_000, 400_000 * years) : 8_000_000 + 700_000 * (years - 20);
  if (disability) d += 1_000_000;
  return d;
}
export function retirementIncome(amount, years, { officerShort = false, disability = false } = {}) {
  const ded = retirementDeduction(years, disability);
  const rest = Math.max(0, amount - ded);
  // 特定役員退職手当等（役員等勤続年数5年以下）は1/2課税なし
  const v = officerShort ? rest : rest / 2;
  return floorTo(v, 1000);
}

// 一時所得の金額（特別控除50万円）。総所得金額に算入されるのはこの1/2
export const temporaryIncome = (income, cost) => Math.max(0, income - cost - 500_000);

// 生命保険料控除（所得税）：新契約（平成24年1月1日以後）一般/介護医療/個人年金 それぞれ
export function lifeInsDeductionNew(p) {
  if (p <= 20_000) return p;
  if (p <= 40_000) return p / 2 + 10_000;
  if (p <= 80_000) return p / 4 + 20_000;
  return 40_000;
}
// 令和8・9年分の特例：23歳未満の扶養親族がいる場合の新契約の一般生命保険料（所得税・最高6万円）
export function lifeInsDeductionNewU23(p) {
  if (p <= 30_000) return p;
  if (p <= 60_000) return p / 2 + 15_000;
  if (p <= 120_000) return p / 4 + 30_000;
  return 60_000;
}
// 旧契約
export function lifeInsDeductionOld(p) {
  if (p <= 25_000) return p;
  if (p <= 50_000) return p / 2 + 12_500;
  if (p <= 100_000) return p / 4 + 25_000;
  return 50_000;
}
// 住民税：新契約
export function lifeInsDeductionNewResident(p) {
  if (p <= 12_000) return p;
  if (p <= 32_000) return p / 2 + 6_000;
  if (p <= 56_000) return p / 4 + 14_000;
  return 28_000;
}

// 個人年金保険の雑所得：年金額 −（年金額 × 払込保険料総額 / 年金支給総額見込額）
// 必要経費率は小数点以下2位未満切上げ（所得税法施行令183条）
export function pensionMiscIncome(annual, premiumsTotal, expectedTotal) {
  const ratio = Math.ceil((premiumsTotal / expectedTotal) * 100) / 100;
  return Math.round(annual - annual * Math.min(1, ratio));
}

/* ===== 公的年金 ===== */
// 老齢基礎年金：満額 × (保険料納付済月数 + 免除月数×反映率) / 480
// 計算結果は円未満四捨五入（令和以降の年金額改定ルール）
export function oldAgeBasic(full, paidMonths, exemptWeighted = 0) {
  return Math.round((full * Math.min(480, paidMonths + exemptWeighted)) / 480);
}
// 繰上げ（1か月0.4%減額）・繰下げ（1か月0.7%増額、最大120月）
export const earlyFactor = (months) => 1 - 0.004 * months;
export const deferFactor = (months) => 1 + 0.007 * Math.min(120, months);

// 老齢厚生年金 報酬比例部分（本来水準）
//  平成15年3月以前：平均標準報酬月額 × 7.125/1000 × 月数
//  平成15年4月以後：平均標準報酬額 × 5.481/1000 × 月数
export function earningsRelated(avgMonthlyPre, monthsPre, avgPost, monthsPost) {
  return Math.round(avgMonthlyPre * 7.125 / 1000 * monthsPre + avgPost * 5.481 / 1000 * monthsPost);
}
// 遺族厚生年金（短期要件・被保険者期間300月未満は300月みなし）
export function survivorEmployees(earningsRel, months, shortReq = true) {
  const base = shortReq && months < 300 ? (earningsRel * 300) / months : earningsRel;
  return Math.round(base * 0.75);
}

/* ===== 相続税・贈与税 ===== */
export const inheritanceBasicDeduction = (heirs) => 30_000_000 + 6_000_000 * heirs;
export const insuranceExempt = (heirs) => 5_000_000 * heirs;

// 相続税の総額：課税遺産総額を法定相続分で按分（各人1,000円未満切捨て）→ 速算表 → 合計（100円未満切捨て）
export function inheritanceTaxTotal(taxableEstate, shares) {
  let total = 0;
  for (const sh of shares) {
    const part = floorTo(taxableEstate * sh, 1000);
    total += Math.max(0, bracket(FIG.inheritanceTax, part));
  }
  return floorTo(Math.round(total), 100);
}
export const inheritanceTaxOnPart = (part) => Math.round(Math.max(0, bracket(FIG.inheritanceTax, floorTo(part, 1000))));

// 暦年課税の贈与税（基礎控除110万円）
export function giftTax(amount, special = false) {
  const base = Math.max(0, amount - 1_100_000);
  return floorTo(Math.round(Math.max(0, bracket(special ? FIG.giftSpecial : FIG.giftGeneral, floorTo(base, 1000)))), 100);
}
// 相続時精算課税：(累計 − 年110万の基礎控除後の金額 − 特別控除2,500万) × 20%
export function seisanGiftTax(amountAfterBasic, usedSpecial = 0) {
  const rem = Math.max(0, 25_000_000 - usedSpecial);
  return floorTo(Math.max(0, amountAfterBasic - rem) * 0.2, 100);
}

/* ===== 法人・その他 ===== */
// 役員退職金の適正額（功績倍率法）
export const officerRetirement = (finalMonthly, years, multiplier) => finalMonthly * years * multiplier;

// 高額療養費（69歳以下、区分ウ：標準報酬月額28万〜50万円）
export const highCostCareU = (medical) => Math.round(80_100 + Math.max(0, medical - 267_000) * 0.01);
// 区分イ（53万〜79万円）
export const highCostCareI = (medical) => Math.round(167_400 + Math.max(0, medical - 558_000) * 0.01);
// 区分ア（83万円以上）
export const highCostCareA = (medical) => Math.round(252_600 + Math.max(0, medical - 842_000) * 0.01);

// 傷病手当金（日額）：支給開始日以前12か月の標準報酬月額平均 ÷ 30 × 2/3
//  ÷30は10円単位で四捨五入、2/3は1円単位で四捨五入
export function sicknessAllowanceDaily(avgStdMonthly) {
  const daily = Math.round(avgStdMonthly / 30 / 10) * 10;
  return Math.round((daily * 2) / 3);
}

/* ===== ライフプランニング（係数） ===== */
export const fvFactor = (r, n) => (1 + r) ** n;             // 終価係数
export const pvFactor = (r, n) => 1 / (1 + r) ** n;          // 現価係数
export const crf = (r, n) => (r * (1 + r) ** n) / ((1 + r) ** n - 1); // 資本回収係数
export const sinkingFund = (r, n) => r / ((1 + r) ** n - 1);   // 減債基金係数
export const annuityFV = (r, n) => ((1 + r) ** n - 1) / r;     // 年金終価係数
export const annuityPV = (r, n) => ((1 + r) ** n - 1) / (r * (1 + r) ** n); // 年金現価係数

/* ===== 不動産・金融 ===== */
export const yieldSimple = (coupon, price, years, face = 100) => ((coupon + (face - price) / years) / price) * 100;
export const ownerYield = (coupon, buyPrice, sellPrice, years) => ((coupon + (sellPrice - buyPrice) / years) / buyPrice) * 100;
export const netYieldRE = (rent, expenses, invest) => ((rent - expenses) / invest) * 100;
// 建蔽率・容積率
export const maxFloorArea = (site, ratio) => site * ratio;
export const roadFloorRatio = (roadWidth, residential = true) => roadWidth * (residential ? 0.4 : 0.6);
