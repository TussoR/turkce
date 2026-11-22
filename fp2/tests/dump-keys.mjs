// 正答キーのレビュー用ダンプ：node tests/dump-keys.mjs lp
const s = process.argv[2];
const q = (await import(`../data/q/${s}.js`)).default;
for (const x of q) {
  console.log(`\n## ${x.id} L${x.level} ${x.stem.replace(/\n/g, ' ').slice(0, 140)}`);
  x.choices.forEach((c, i) => console.log(`${i === x.answer ? '★' : ' '}${i + 1} ${c.replace(/\n/g, ' ')}`));
}
