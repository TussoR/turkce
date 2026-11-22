// 科目・論点の体系。学科は試験科目（6分野）、実技は生保顧客資産相談業務の出題領域。
export const SUBJECTS = [
  { id: 'lp', exam: 'gakka', no: 'A', name: 'ライフプランニングと資金計画', short: 'ライフ', topics: [
    ['lp.fp', 'FPの業務と関連法規・職業倫理'],
    ['lp.keisu', '6つの係数・ライフプランの手法'],
    ['lp.kenpo', '公的医療保険・介護保険'],
    ['lp.koyo', '雇用保険・労災保険'],
    ['lp.nenkin', '公的年金の仕組み・老齢給付'],
    ['lp.izoku', '障害給付・遺族給付'],
    ['lp.kigyo', '企業年金・iDeCo・小規模企業共済'],
    ['lp.shikin', '教育資金・住宅資金・ローン'],
    ['lp.chusho', '中小企業の資金計画・カード'],
  ] },
  { id: 'risk', exam: 'gakka', no: 'B', name: 'リスク管理', short: 'リスク', topics: [
    ['risk.seido', '保険制度・契約者保護・保険法'],
    ['risk.seiho', '生命保険の仕組みと商品'],
    ['risk.seizei', '生命保険と税金（個人）'],
    ['risk.hojin', '法人契約の生命保険・経理処理'],
    ['risk.sonpo', '損害保険の仕組みと商品'],
    ['risk.sonzei', '損害保険と税金'],
    ['risk.daisan', '第三分野の保険'],
  ] },
  { id: 'kinyu', exam: 'gakka', no: 'C', name: '金融資産運用', short: '金融', topics: [
    ['kinyu.keizai', '経済・金融の基礎（指標・金融政策）'],
    ['kinyu.yokin', '預貯金・セーフティネット・関連法規'],
    ['kinyu.saiken', '債券'],
    ['kinyu.kabu', '株式・投資指標'],
    ['kinyu.toshin', '投資信託'],
    ['kinyu.gaika', '外貨建商品・デリバティブ'],
    ['kinyu.port', 'ポートフォリオ理論'],
    ['kinyu.zei', '金融商品の税制・NISA'],
  ] },
  { id: 'tax', exam: 'gakka', no: 'D', name: 'タックスプランニング', short: 'タックス', topics: [
    ['tax.kihon', '所得税の仕組み'],
    ['tax.shotoku', '各種所得の計算'],
    ['tax.tsusan', '損益通算・繰越控除'],
    ['tax.kojo', '所得控除'],
    ['tax.zeigaku', '税額控除（住宅ローン控除等）'],
    ['tax.shinkoku', '申告・納付・青色申告・源泉徴収'],
    ['tax.hojin', '法人税・会社と役員の取引'],
    ['tax.shohi', '消費税・決算書'],
  ] },
  { id: 'fd', exam: 'gakka', no: 'E', name: '不動産', short: '不動産', topics: [
    ['fd.kakaku', '不動産の価格・登記・調査'],
    ['fd.torihiki', '不動産の取引・宅建業法・借地借家法'],
    ['fd.ho', '都市計画法・建築基準法・区分所有法'],
    ['fd.zei', '不動産の取得・保有・譲渡の税金'],
    ['fd.katsuyo', '不動産の有効活用・投資判断'],
  ] },
  { id: 'sz', exam: 'gakka', no: 'F', name: '相続・事業承継', short: '相続', topics: [
    ['sz.minpo', '相続と民法（相続人・遺言・遺留分）'],
    ['sz.zoyo', '贈与と贈与税'],
    ['sz.sozokuzei', '相続税の計算'],
    ['sz.hyoka', '財産評価（宅地・株式等）'],
    ['sz.jigyo', '事業承継・相続対策・納税'],
  ] },
  // 実技：生保顧客資産相談業務
  { id: 'jn', exam: 'jitsugi', no: '1', name: '公的年金・社会保険', short: '年金', topics: [
    ['jn.rorei', '老齢基礎年金・老齢厚生年金の計算'],
    ['jn.kuriage', '繰上げ・繰下げ・在職老齢年金・加給年金'],
    ['jn.izoku', '遺族年金・障害年金'],
    ['jn.shaho', '健康保険・雇用保険・介護保険'],
  ] },
  { id: 'jk', exam: 'jitsugi', no: '2', name: '個人の生命保険', short: '個人保険', topics: [
    ['jk.hitsuyo', '必要保障額・保障の見直し'],
    ['jk.shohin', '生命保険・医療保険の商品性'],
    ['jk.zei', '保険金・給付金の課税関係'],
  ] },
  { id: 'jh', exam: 'jitsugi', no: '3', name: '法人の生命保険・退職金', short: '法人保険', topics: [
    ['jh.keiri', '法人契約の経理処理（仕訳）'],
    ['jh.taishoku', '役員退職金・弔慰金'],
    ['jh.shohin', '法人向け商品の活用'],
  ] },
  { id: 'js', exam: 'jitsugi', no: '4', name: '所得税・個人の税務', short: '所得税', topics: [
    ['js.shotoku', '総所得金額・各種所得'],
    ['js.kojo', '所得控除・生命保険料控除'],
    ['js.shinkoku', '確定申告・年末調整'],
  ] },
  { id: 'jz', exam: 'jitsugi', no: '5', name: '相続・贈与と生命保険', short: '相続', topics: [
    ['jz.sozoku', '相続人・相続税の総額'],
    ['jz.hoken', '死亡保険金と相続税（非課税）'],
    ['jz.zoyo', '贈与・相続対策'],
  ] },
];

export const SUBJ = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));
export const TOPIC = {};
for (const s of SUBJECTS) for (const [id, name] of s.topics) TOPIC[id] = { id, name, subject: s.id };
export const GAKKA = SUBJECTS.filter((s) => s.exam === 'gakka');
export const JITSUGI = SUBJECTS.filter((s) => s.exam === 'jitsugi');
export const LEVELS = [
  [1, '入門'], [2, '基礎'], [3, '標準'], [4, '応用'], [5, '試験レベル'],
];
export const LEVEL = Object.fromEntries(LEVELS);
