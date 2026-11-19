// Shared by the app and tools/dump-texts.js: maps a Turkish text + voice to its mp3 file name.
// Voices: 'e' = Emel (learner / default), 'f' = Emel lower pitch (other women), 'a' = Ahmet (men)
(function (root) {
  function fnv(str) {
    const bytes = new TextEncoder().encode(str);
    let h = 0x811c9dc5;
    for (const b of bytes) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  }
  const FEMALE = /母|おばさん|姉|ゼイネプ|アイシェ/;
  root.AUDIO = {
    file: (text, voice = 'e') => 'audio/' + fnv(voice + '|' + text) + '.mp3',
    voiceFor: (d, spk) => spk === 'B' ? 'e' : FEMALE.test(d.who[spk] || '') ? 'f' : 'a',
    // what the TTS engine should actually read
    spoken: text => String(text).replace(/\([^)]*\)/g, ' ').replace(/\s\/\s/g, ', ').replace(/—/g, ', ').replace(/\s+/g, ' ').replace(/^[\s,]+/, '').trim(),
  };
})(typeof window !== 'undefined' ? window : globalThis);
