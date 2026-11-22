// 実技事例のレビュー用ダンプ：node tests/dump-cases.mjs jn
const s = process.argv[2];
const cs = (await import(`../data/cases/${s}.js`)).default;
for (const c of cs) {
  console.log(`\n######## ${c.id} ${c.title}`);
  for (const q of c.questions) {
    console.log(`-- ${q.id} [${q.type}] ${q.stem.replace(/\n/g, ' ').slice(0, 110)}`);
    if (q.type === 'tf') q.items.forEach((it, i) => console.log(`  ${it.a ? '〇' : '×'} ${it.s.replace(/\n/g, ' ')}`));
    if (q.type === 'blank') console.log('  ' + q.blanks.map((b) => `${b.k}=${b.a}`).join(' / ') + '   [' + q.bank.join(',') + ']');
    if (q.type === 'num') console.log('  ' + q.parts.map((p) => `${p.label}=${p.a}${p.unit || ''}`).join(' / '));
  }
}
