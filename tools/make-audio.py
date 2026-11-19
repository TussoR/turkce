"""Generates audio/*.mp3 for tools/texts.json with Microsoft Edge neural voices.
Usage:  node tools/dump-texts.js  &&  python tools/make-audio.py
Only missing files are generated, so it is safe to re-run after adding content.
"""
import asyncio, json, os, sys
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICES = {
    'e': dict(voice='tr-TR-EmelNeural', rate='-10%', pitch='+0Hz'),
    'f': dict(voice='tr-TR-EmelNeural', rate='-10%', pitch='-12Hz'),
    'a': dict(voice='tr-TR-AhmetNeural', rate='-10%', pitch='+0Hz'),
}

async def one(item, sem, stats):
    dest = os.path.join(ROOT, item['file'])
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        stats['skip'] += 1
        return
    async with sem:
        for attempt in range(4):
            try:
                tmp = dest + '.part'
                await edge_tts.Communicate(item['spoken'], **VOICES[item['voice']]).save(tmp)
                os.replace(tmp, dest)
                stats['ok'] += 1
                return
            except Exception as e:  # network hiccups: retry
                err = e
                await asyncio.sleep(1.5 * (attempt + 1))
        stats['fail'].append((item['text'], repr(err)))

async def main():
    items = json.load(open(os.path.join(ROOT, 'tools', 'texts.json'), encoding='utf-8'))
    os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
    sem = asyncio.Semaphore(6)
    stats = {'ok': 0, 'skip': 0, 'fail': []}
    await asyncio.gather(*(one(i, sem, stats) for i in items))
    print(f"generated {stats['ok']}, skipped {stats['skip']}, failed {len(stats['fail'])}")
    for t, e in stats['fail'][:10]:
        print('  FAIL', t, e)
    sys.exit(1 if stats['fail'] else 0)

asyncio.run(main())
