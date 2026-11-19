// Collects every Turkish text the app can play and writes tools/texts.json
// Usage: node tools/dump-texts.js
const path = require('path');
const fs = require('fs');
global.window = global;
const js = f => require(path.join(__dirname, '..', 'js', f));
['audio-keys.js', 'data-words.js', 'data-words2.js', 'data-words3.js', 'data-words4.js', 'data-grammar.js', 'data-grammar2.js', 'data-daily.js', 'data-talk.js', 'data-talk-family.js'].forEach(js);

const out = new Map();
const add = (text, voice = 'e') => {
  if (!text) return;
  const file = AUDIO.file(text, voice);
  if (out.has(file) && out.get(file).text !== text) throw new Error('hash collision: ' + text);
  out.set(file, { file, voice, text, spoken: AUDIO.spoken(text) });
};
WORDS.forEach(c => c.words.forEach(w => { add(w[0]); add(w[2]); }));
GRAMMAR.forEach(g => g.ex.forEach(e => add(e[0])));
PHRASES.forEach(p => add(p[0]));
add('Merhaba! Türkçe öğreniyorum.');
DAILY_SAY.forEach(d => { add(d[0], 'e'); add(d[2], 'a'); });
DIALOGS.forEach(d => d.lines.forEach(l => add(l[1], AUDIO.voiceFor(d, l[0]))));
const list = [...out.values()];
fs.writeFileSync(path.join(__dirname, 'texts.json'), JSON.stringify(list, null, 1));
const v = list.reduce((a, x) => (a[x.voice] = (a[x.voice] || 0) + 1, a), {});
console.log('texts:', list.length, v);
