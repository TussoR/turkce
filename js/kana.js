// Approximate Turkish -> Katakana reading guide (目安). Turkish spelling is phonetic,
// so a rule-based converter works well enough for beginners.
(function () {
  const V = 'aeıioöuü';
  // order of vowel keys in each row: a e ı i o ö u ü
  const ROW = {
    '':  ['ア','エ','ウ','イ','オ','オ','ウ','ユ'],
    b: ['バ','ベ','ブ','ビ','ボ','ビョ','ブ','ビュ'],
    c: ['ジャ','ジェ','ジュ','ジ','ジョ','ジョ','ジュ','ジュ'],
    'ç': ['チャ','チェ','チュ','チ','チョ','チョ','チュ','チュ'],
    d: ['ダ','デ','ドゥ','ディ','ド','ド','ドゥ','デュ'],
    f: ['ファ','フェ','フ','フィ','フォ','フォ','フ','フュ'],
    g: ['ガ','ゲ','グ','ギ','ゴ','ギョ','グ','ギュ'],
    h: ['ハ','ヘ','フ','ヒ','ホ','ヒョ','フ','ヒュ'],
    j: ['ジャ','ジェ','ジュ','ジ','ジョ','ジョ','ジュ','ジュ'],
    k: ['カ','ケ','ク','キ','コ','キョ','ク','キュ'],
    l: ['ラ','レ','ル','リ','ロ','リョ','ル','リュ'],
    m: ['マ','メ','ム','ミ','モ','ミョ','ム','ミュ'],
    n: ['ナ','ネ','ヌ','ニ','ノ','ニョ','ヌ','ニュ'],
    p: ['パ','ペ','プ','ピ','ポ','ピョ','プ','ピュ'],
    r: ['ラ','レ','ル','リ','ロ','リョ','ル','リュ'],
    s: ['サ','セ','ス','スィ','ソ','ソ','ス','スュ'],
    'ş': ['シャ','シェ','シュ','シ','ショ','ショ','シュ','シュ'],
    t: ['タ','テ','トゥ','ティ','ト','ト','トゥ','テュ'],
    v: ['ヴァ','ヴェ','ヴ','ヴィ','ヴォ','ヴォ','ヴ','ヴュ'],
    y: ['ヤ','イェ','ユ','イ','ヨ','ヨ','ユ','ユ'],
    z: ['ザ','ゼ','ズ','ズィ','ゾ','ゾ','ズ','ズュ'],
  };
  const CODA = { b:'ブ', c:'ジ', 'ç':'チ', d:'ト', f:'フ', g:'グ', h:'フ', j:'ジュ', k:'ク',
    l:'ル', m:'ム', n:'ン', p:'プ', r:'ル', s:'ス', 'ş':'シュ', t:'ト', v:'ヴ', y:'イ', z:'ズ' };
  const NORM = { 'â':'a', 'î':'i', 'û':'u' };

  function lower(s) {
    return s.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();
  }

  function word(w) {
    let s = '';
    for (const ch of lower(w)) s += NORM[ch] || ch;
    let out = '';
    for (let i = 0; i < s.length; i++) {
      const c = s[i], n = s[i + 1];
      const vi = V.indexOf(c);
      if (vi >= 0) { out += ROW[''][vi]; continue; }
      if (c === 'ğ') {
        if (n && V.includes(n)) continue;          // silent glide
        out += 'ー'; continue;                       // lengthen
      }
      if (ROW[c]) {
        if (n === c && c !== 'n' && c !== 'm') { out += 'ッ'; continue; }
        if (n && V.includes(n)) { out += ROW[c][V.indexOf(n)]; i++; continue; }
        out += CODA[c]; continue;
      }
      if (c === "'" || c === '’') continue;
      if (c === ',') { out += '、'; continue; }
      if (c === '.') { out += '。'; continue; }
      out += c;
    }
    return out;
  }

  window.toKana = function (text) {
    return String(text).split(/(\s+)/).map(p => /\s/.test(p) ? ' ' : word(p)).join('');
  };
})();
