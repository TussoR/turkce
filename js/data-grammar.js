// Grammar lessons. quiz: [question, [correct, wrong, wrong, ...], explanation]
// (the first choice is always the correct one; choices are shuffled at runtime)
window.GRAMMAR = [
{ id:'g1', title:'トルコ語ってどんな言葉?', sub:'日本語とそっくりな語順', body:`
<p>うれしいお知らせ:<b>トルコ語は日本語とよく似ています!</b></p>
<h4>① 語順が同じ(主語・目的語・動詞)</h4>
<div class="ex-big"><span class="tr">Ben elma yiyorum.</span><br>私は りんごを 食べています。</div>
<p>動詞は文の最後に来ます。日本語の感覚のまま並べればOK。</p>
<h4>② 助詞のかわりに「語尾」をつける</h4>
<p>日本語の「で・に・から・を」にあたるものを、単語の後ろにくっつけます。</p>
<table><tr><td class="tr">ev</td><td>家</td></tr>
<tr><td class="tr">ev<b>de</b></td><td>家<b>で</b></td></tr>
<tr><td class="tr">ev<b>den</b></td><td>家<b>から</b></td></tr>
<tr><td class="tr">ev<b>ler</b>imiz<b>de</b></td><td>私たちの家々<b>で</b></td></tr></table>
<h4>③ 簡単なところ</h4>
<ul><li>男性名詞・女性名詞がない</li><li>a / the のような冠詞がない</li><li>「彼」と「彼女」の区別もない(どちらも <span class="tr">o</span>)</li><li>ほぼローマ字のとおりに読める</li></ul>`,
ex:[['Ben Japonum.','私は日本人です。'],['İstanbul\'da yaşıyorum.','イスタンブールに住んでいます。'],['Türkçe öğreniyorum.','トルコ語を勉強しています。']],
quiz:[
 ['「私は りんごを 食べる」の自然な語順は?',['Ben elma yiyorum.','Yiyorum ben elma.','Ben yiyorum elma.'],'日本語と同じく、動詞が最後です。'],
 ['<span class="tr">evde</span> の <b>-de</b> は日本語の何に近い?',['で・に','を','から','の'],'<span class="tr">-de</span> は場所を表す「で・に」です。'],
 ['「彼女」をトルコ語で言うと?',['o','ona','sen'],'彼も彼女も <span class="tr">o</span> です。'],
]},

{ id:'g2', title:'アルファベットと発音', sub:'ローマ字読みでほぼOK', body:`
<p>トルコ語は29文字。基本はローマ字読みですが、次の文字に注意しましょう。</p>
<table class="letters">
<tr><th>文字</th><th>音</th><th>例</th></tr>
<tr><td class="tr">c</td><td>ジ(ヂ)</td><td class="tr">cami (ジャミ=モスク)</td></tr>
<tr><td class="tr">ç</td><td>チ</td><td class="tr">çay (チャイ)</td></tr>
<tr><td class="tr">ş</td><td>シ</td><td class="tr">şeker (シェケル=砂糖)</td></tr>
<tr><td class="tr">ğ</td><td>発音しない/前の母音を伸ばす</td><td class="tr">dağ (ダー=山)</td></tr>
<tr><td class="tr">ı</td><td>口を横に引いた「ウ」</td><td class="tr">kırmızı (クルムズ=赤)</td></tr>
<tr><td class="tr">i</td><td>イ</td><td class="tr">iki (イキ=2)</td></tr>
<tr><td class="tr">ö</td><td>「オ」の口で「エ」</td><td class="tr">göz (ギョズ=目)</td></tr>
<tr><td class="tr">ü</td><td>「ウ」の口で「イ」</td><td class="tr">üç (ユチ=3)</td></tr>
<tr><td class="tr">j</td><td>ジ(やわらかく)</td><td class="tr">jandarma</td></tr>
<tr><td class="tr">v</td><td>ヴ(下唇をかむ)</td><td class="tr">ev (エヴ=家)</td></tr>
<tr><td class="tr">y</td><td>ヤ行</td><td class="tr">yok (ヨク=ない)</td></tr>
<tr><td class="tr">r</td><td>軽い巻き舌のラ行</td><td class="tr">bir (ビル=1)</td></tr>
</table>
<p class="tip">💡 <b>ı(点なし)</b>と <b>i(点あり)</b>は別の文字です。大文字は <b>I</b> と <b>İ</b>。</p>
<p class="tip">💡 アクセントはたいてい単語の<b>最後</b>の音節にきます。</p>
<p>カタカナ読みは発音の目安です。</p>`,
ex:[['çay','チャイ(紅茶)'],['şeker','砂糖'],['göz','目'],['üç','3'],['kırmızı','赤'],['dağ','山']],
quiz:[
 ['<span class="tr">çay</span> の読み方は?',['チャイ','カイ','サイ','ジャイ'],'<span class="tr">ç</span> は「チ」の音です。'],
 ['<span class="tr">cami</span> の <b>c</b> の音は?',['ジ','ク','ス','チ'],'<span class="tr">c</span> は「ジ」。cami = ジャミ(モスク)。'],
 ['<span class="tr">şeker</span> の読み方は?',['シェケル','セケル','チェケル'],'<span class="tr">ş</span> は「シ」の音です。'],
 ['<span class="tr">ğ</span> はどう発音する?',['ほとんど発音せず、前の母音を伸ばす','強い「グ」','「ニ」'],'<span class="tr">dağ</span> = ダー、<span class="tr">öğretmen</span> = オーレトメン。'],
]},

{ id:'g3', title:'母音調和', sub:'語尾の母音が変わるルール', body:`
<p>トルコ語の一番大切なルールです。語尾の母音は、<b>直前の母音に合わせて変わります</b>。</p>
<h4>2タイプ(e / a)</h4>
<table><tr><th>最後の母音</th><th>語尾</th><th>例(複数形 -ler/-lar)</th></tr>
<tr><td class="tr">e i ö ü</td><td class="tr">e</td><td class="tr">ev → ev<b>ler</b></td></tr>
<tr><td class="tr">a ı o u</td><td class="tr">a</td><td class="tr">kitap → kitap<b>lar</b></td></tr></table>
<h4>4タイプ(i / ı / ü / u)</h4>
<table><tr><th>最後の母音</th><th>語尾</th><th>例(私の -im)</th></tr>
<tr><td class="tr">e i</td><td class="tr">i</td><td class="tr">ev → ev<b>im</b></td></tr>
<tr><td class="tr">a ı</td><td class="tr">ı</td><td class="tr">kız → kız<b>ım</b></td></tr>
<tr><td class="tr">o u</td><td class="tr">u</td><td class="tr">okul → okul<b>um</b></td></tr>
<tr><td class="tr">ö ü</td><td class="tr">ü</td><td class="tr">göz → göz<b>üm</b></td></tr></table>
<p class="tip">💡 前の母音と「口の形」をそろえる、と覚えると楽です。最初は完璧でなくても通じます!</p>`,
ex:[['evler','家々'],['arabalar','車(複数)'],['evim','私の家'],['okulum','私の学校'],['gözüm','私の目']],
quiz:[
 ['<span class="tr">kalem</span>(ペン)の複数形は?',['kalemler','kalemlar','kalemlır'],'最後の母音が e なので -ler。'],
 ['<span class="tr">araba</span>(車)の複数形は?',['arabalar','arabaler','arabalur'],'最後の母音が a なので -lar。'],
 ['<span class="tr">okul</span> +「私の」は?',['okulum','okulim','okulım','okulüm'],'最後の母音が u なので -um。'],
 ['<span class="tr">göz</span> +「私の」は?',['gözüm','gözim','gözum'],'最後の母音が ö なので -üm。'],
]},

{ id:'g4', title:'「私は〜です」', sub:'人称の語尾', body:`
<p>「〜です」は名詞・形容詞の後ろに<b>人称語尾</b>をつけて表します。母音調和(4タイプ)に従います。</p>
<table><tr><th>主語</th><th>語尾</th><th>例:öğretmen(先生)</th></tr>
<tr><td class="tr">ben 私</td><td class="tr">-(y)im</td><td class="tr">öğretmen<b>im</b></td></tr>
<tr><td class="tr">sen あなた</td><td class="tr">-sin</td><td class="tr">öğretmen<b>sin</b></td></tr>
<tr><td class="tr">o 彼/彼女</td><td>なし</td><td class="tr">öğretmen</td></tr>
<tr><td class="tr">biz 私たち</td><td class="tr">-(y)iz</td><td class="tr">öğretmen<b>iz</b></td></tr>
<tr><td class="tr">siz あなたたち</td><td class="tr">-siniz</td><td class="tr">öğretmen<b>siniz</b></td></tr>
<tr><td class="tr">onlar 彼ら</td><td class="tr">-ler</td><td class="tr">öğretmen<b>ler</b></td></tr></table>
<p>母音で終わる単語には <b>y</b> をはさみます:<span class="tr">hasta → hasta<b>yım</b></span>(私は病気です)</p>
<p class="tip">💡 語尾で主語がわかるので、<span class="tr">ben</span> などは省略することが多いです。<span class="tr">Yorgunum.</span> = (私は)疲れています。</p>`,
ex:[['Ben Japonum.','私は日本人です。'],['Sen çok güzelsin.','あなたはとてもきれいです。'],['Yorgunum.','疲れています。'],['Biz evliyiz.','私たちは結婚しています。'],['Hastayım.','具合が悪いです。']],
quiz:[
 ['Ben yorgun___. (私は疲れています)',['um','sun','uz','lar'],'ben → -um(u は前の u に合わせて)。'],
 ['Sen güzel___. (あなたはきれい)',['sin','im','iz'],'sen → -sin。'],
 ['Biz Japon___. (私たちは日本人です)',['uz','um','sunuz'],'biz → -uz。'],
 ['Ben hasta___. (私は病気です)',['yım','ım','sın'],'母音で終わるので y をはさむ → hastayım。'],
]},

{ id:'g5', title:'これは何?', sub:'bu / şu / o', body:`
<table><tr><td class="tr">bu</td><td>これ・この(近い)</td></tr>
<tr><td class="tr">şu</td><td>それ・その(少し離れた、指さして)</td></tr>
<tr><td class="tr">o</td><td>あれ・あの/彼・彼女</td></tr></table>
<p>名詞の前に置くと「この〜」になります:<span class="tr">bu ev</span>(この家)、<span class="tr">o kadın</span>(あの女性)</p>
<p>複数:<span class="tr">bunlar</span>(これら)、<span class="tr">şunlar</span>、<span class="tr">onlar</span></p>
<h4>よく使う形</h4>
<div class="ex-big"><span class="tr">Bu ne?</span> — これは何?<br><span class="tr">Bu bir çay bardağı.</span> — これはチャイグラスです。</div>
<p><span class="tr">bir</span> は「一つの」=英語の a のような意味でも使います。</p>`,
ex:[['Bu ne?','これは何?'],['Bu benim kocam.','こちらは私の夫です。'],['O kim?','あの人は誰?'],['Şu elbise çok güzel.','そのワンピースはとても素敵。']],
quiz:[
 ['「これは何?」',['Bu ne?','Bu kim?','O nerede?'],'ne = 何、kim = 誰。'],
 ['「あの人は誰?」',['O kim?','O ne?','Bu nasıl?'],'kim = 誰。'],
 ['「この家」',['bu ev','ev bu','evi bu'],'日本語と同じく「この」が前に来ます。'],
]},

{ id:'g6', title:'複数形', sub:'-ler / -lar', body:`
<p>名詞に <b>-ler</b> または <b>-lar</b> をつけます(母音調和・2タイプ)。</p>
<table><tr><td class="tr">ev → ev<b>ler</b></td><td>家々</td></tr>
<tr><td class="tr">kedi → kedi<b>ler</b></td><td>猫たち</td></tr>
<tr><td class="tr">kitap → kitap<b>lar</b></td><td>本(複数)</td></tr>
<tr><td class="tr">çocuk → çocuk<b>lar</b></td><td>子どもたち</td></tr></table>
<p class="tip">💡 <b>数字のあとは複数形にしません!</b> 日本語と同じ感覚です。<br><span class="tr">iki kitap</span>(本2冊) ⭕ / <span class="tr">iki kitaplar</span> ❌</p>`,
ex:[['Çocuklar bahçede.','子どもたちは庭にいます。'],['Üç kedim var.','猫を3匹飼っています。'],['Arkadaşlarım geliyor.','友達が来ます。']],
quiz:[
 ['<span class="tr">elma</span>(りんご)の複数形は?',['elmalar','elmaler','elmalır'],'a で終わるので -lar。'],
 ['<span class="tr">göz</span>(目)の複数形は?',['gözler','gözlar','gözlür'],'ö は前の母音グループなので -ler。'],
 ['「りんご3個」は?',['üç elma','üç elmalar','elmalar üç'],'数字の後は単数のままです。'],
]},

{ id:'g7', title:'「〜ですか?」', sub:'疑問の mi / mı / mu / mü', body:`
<p>はい/いいえで答える質問は、<b>mi</b> を後ろに置くだけ。日本語の「か?」と同じ!</p>
<p><b>mi</b> は母音調和(4タイプ)で <b>mi / mı / mu / mü</b> に変わり、<b>離して書きます</b>。</p>
<table><tr><td class="tr">Güzel <b>mi</b>?</td><td>きれい?</td></tr>
<tr><td class="tr">Pahalı <b>mı</b>?</td><td>高い?</td></tr>
<tr><td class="tr">Doğru <b>mu</b>?</td><td>本当?</td></tr>
<tr><td class="tr">Türk <b>mü</b>?</td><td>トルコ人?</td></tr></table>
<h4>人称語尾は mi のほうにつく</h4>
<table><tr><td class="tr">Sen öğrenci <b>misin</b>?</td><td>あなたは学生?</td></tr>
<tr><td class="tr">Siz Japon <b>musunuz</b>?</td><td>日本人ですか?</td></tr>
<tr><td class="tr">Yorgun <b>musun</b>?</td><td>疲れてる?</td></tr></table>
<p>答え:<span class="tr">Evet</span>(はい)/ <span class="tr">Hayır</span>(いいえ)</p>`,
ex:[['Çay mı, kahve mi?','チャイ?それともコーヒー?'],['Aç mısın?','お腹すいてる?'],['İyi misin?','大丈夫?'],['Japon musunuz?','日本人ですか?']],
quiz:[
 ['Bu çay ___? (これはチャイ?)',['mı','mi','mu','mü'],'çay の最後の母音 a → mı。'],
 ['Güzel ___? (きれい?)',['mi','mı','mu'],'e → mi。'],
 ['Sen yorgun ___? (疲れてる?)',['musun','misin','musunuz'],'u → mu、sen なので musun。'],
 ['Türk ___sünüz? (トルコ人ですか?)',['mü','mi','mu'],'ü → mü → müsünüz。'],
]},

{ id:'g8', title:'「〜ではない」', sub:'değil', body:`
<p>名詞・形容詞の否定は <b>değil</b> を後ろに置きます。人称語尾は <b>değil</b> につけます。</p>
<table><tr><td class="tr">Ben doktor <b>değilim</b>.</td><td>私は医者ではありません。</td></tr>
<tr><td class="tr">Sen yorgun <b>değilsin</b>.</td><td>あなたは疲れていない。</td></tr>
<tr><td class="tr">Bu kahve <b>değil</b>.</td><td>これはコーヒーではない。</td></tr>
<tr><td class="tr">Biz Türk <b>değiliz</b>.</td><td>私たちはトルコ人ではない。</td></tr></table>
<p>質問にもできます:<span class="tr">Pahalı değil mi?</span>(高くない?)</p>
<p class="tip">💡 文末の <span class="tr">..., değil mi?</span> は「〜でしょ?」「〜だよね?」という確認によく使います。<br><span class="tr">Hava güzel, değil mi?</span> いい天気だよね?</p>`,
ex:[['Ben Türk değilim, Japonum.','私はトルコ人ではなく、日本人です。'],['Önemli değil.','大したことないよ。'],['Acı değil.','辛くないです。'],['Güzel, değil mi?','きれいでしょ?']],
quiz:[
 ['「私は医者ではありません」',['Ben doktor değilim.','Ben değil doktorum.','Ben doktorum değil.'],'人称語尾は değil につけます。'],
 ['「辛くない」',['Acı değil.','Değil acı.','Acı yok.'],'形容詞の否定は değil。'],
 ['「いい天気だよね?」',['Hava güzel, değil mi?','Hava güzel mi değil?','Değil hava güzel?'],'文末の değil mi? = 「〜だよね?」'],
]},

{ id:'g9', title:'「私の〜」', sub:'所有の語尾', body:`
<p>「私の家」は、<b>名詞の後ろに語尾</b>をつけて表します。</p>
<table><tr><th></th><th>子音で終わる<br><span class="tr">ev</span></th><th>母音で終わる<br><span class="tr">araba</span></th></tr>
<tr><td class="tr">(benim) 私の</td><td class="tr">ev<b>im</b></td><td class="tr">araba<b>m</b></td></tr>
<tr><td class="tr">(senin) あなたの</td><td class="tr">ev<b>in</b></td><td class="tr">araba<b>n</b></td></tr>
<tr><td class="tr">(onun) 彼の</td><td class="tr">ev<b>i</b></td><td class="tr">araba<b>sı</b></td></tr>
<tr><td class="tr">(bizim) 私たちの</td><td class="tr">ev<b>imiz</b></td><td class="tr">araba<b>mız</b></td></tr>
<tr><td class="tr">(sizin) あなたたちの</td><td class="tr">ev<b>iniz</b></td><td class="tr">araba<b>nız</b></td></tr>
<tr><td class="tr">(onların) 彼らの</td><td class="tr">ev<b>leri</b></td><td class="tr">araba<b>ları</b></td></tr></table>
<p class="tip">💡 子音の変化:単語が <b>k / p / ç / t</b> で終わると、母音の前で <b>ğ / b / c / d</b> に変わることがあります。<br><span class="tr">çocuk → çocu<b>ğ</b>um</span>(私の子ども)、<span class="tr">kitap → kita<b>b</b>ım</span>(私の本)</p>
<div class="ex-big"><span class="tr">Benim adım Hana.</span><br>私の名前はハナです。<br><span class="tr">Senin adın ne?</span><br>あなたの名前は?</div>`,
ex:[['Benim adım Hana.','私の名前はハナです。'],['Adın ne?','名前は何?'],['Annem çok tatlı.','母はとてもやさしい。'],['Kocamın ailesi','夫の家族'],['Çocuğum üç yaşında.','うちの子は3歳です。']],
quiz:[
 ['<span class="tr">araba</span> +「私の」',['arabam','arabaım','arabim'],'母音で終わるので -m だけ。'],
 ['<span class="tr">ev</span> +「あなたの」',['evin','evim','evi'],'あなたの = -in。'],
 ['<span class="tr">ad</span>(名前)+「私の」',['adım','adim','adum'],'a → ı なので adım。'],
 ['<span class="tr">anne</span> +「彼の」',['annesi','annei','annesin'],'母音の後の「彼の」は -si。'],
]},

{ id:'g10', title:'「ある・ない」', sub:'var / yok', body:`
<p><b>var</b> = ある・いる、<b>yok</b> = ない・いない。とても便利な言葉です。</p>
<table><tr><td class="tr">Evde süt <b>var</b>.</td><td>家に牛乳がある。</td></tr>
<tr><td class="tr">Burada wifi <b>yok</b>.</td><td>ここはWi-Fiがない。</td></tr>
<tr><td class="tr">Su <b>var mı</b>?</td><td>水はありますか?</td></tr></table>
<h4>「持っている」も var / yok で!</h4>
<p>所有の語尾 + var/yok で「〜を持っている」になります。</p>
<table><tr><td class="tr">Araba<b>m var</b>.</td><td>車を持っています(私の車がある)。</td></tr>
<tr><td class="tr">Zaman<b>ım yok</b>.</td><td>時間がありません。</td></tr>
<tr><td class="tr">Kardeş<b>in var mı</b>?</td><td>兄弟はいる?</td></tr>
<tr><td class="tr">Sorun <b>yok</b>!</td><td>問題ない!</td></tr></table>`,
ex:[['Bugün zamanım yok.','今日は時間がありません。'],['Sorun yok!','問題なし!'],['İki kardeşim var.','兄弟が二人います。'],['Ekmek var mı?','パンはありますか?']],
quiz:[
 ['「水はありますか?」',['Su var mı?','Su yok mu?','Su mı var?'],'var mı? = ありますか?'],
 ['「時間がない」',['Zamanım yok.','Zamanım var.','Zaman değil.'],'yok = ない。'],
 ['「車を持っています」',['Arabam var.','Araba benim.','Arabayım.'],'「私の車がある」と表現します。'],
]},

{ id:'g11', title:'疑問詞', sub:'何・誰・どこ・いつ', body:`
<table><tr><td class="tr">ne</td><td>何</td></tr><tr><td class="tr">kim</td><td>誰</td></tr>
<tr><td class="tr">nerede</td><td>どこに/で</td></tr><tr><td class="tr">nereye</td><td>どこへ</td></tr>
<tr><td class="tr">nereden</td><td>どこから</td></tr><tr><td class="tr">ne zaman</td><td>いつ</td></tr>
<tr><td class="tr">nasıl</td><td>どう</td></tr><tr><td class="tr">neden / niye</td><td>なぜ</td></tr>
<tr><td class="tr">kaç</td><td>いくつ</td></tr><tr><td class="tr">ne kadar</td><td>いくら・どれくらい</td></tr>
<tr><td class="tr">hangi</td><td>どの</td></tr></table>
<p class="tip">💡 疑問詞がある文には <b>mi</b> をつけません。<br><span class="tr">Nerede?</span> ⭕ / <span class="tr">Nerede mi?</span> ❌</p>
<p>語順も日本語と同じで、疑問詞は動詞の前に来ます:<span class="tr">Ne zaman geliyorsun?</span>(いつ来るの?)</p>`,
ex:[['Adın ne?','名前は?'],['Nerelisin?','どこの出身?'],['Tuvalet nerede?','トイレはどこ?'],['Bu ne kadar?','これはいくら?'],['Nasılsın?','元気?']],
quiz:[
 ['「トイレはどこ?」',['Tuvalet nerede?','Tuvalet nereye?','Tuvalet ne?'],'nerede = どこに(場所)。'],
 ['「いつ来るの?」',['Ne zaman geliyorsun?','Nasıl geliyorsun?','Nereden geliyorsun?'],'ne zaman = いつ。'],
 ['「これはいくら?」',['Bu ne kadar?','Bu kaç?','Bu nasıl?'],'ne kadar = いくら。'],
 ['「なぜ?」',['Neden?','Nerede?','Ne?'],'neden / niye = なぜ。'],
]},

{ id:'g12', title:'「〜で・〜に(場所)」', sub:'-de / -da', body:`
<p>場所を表す語尾。日本語の「(どこ)<b>で</b>/<b>に</b>いる」にあたります。</p>
<table><tr><td class="tr">ev<b>de</b></td><td>家で/家に</td></tr>
<tr><td class="tr">okul<b>da</b></td><td>学校で</td></tr>
<tr><td class="tr">İstanbul'<b>da</b></td><td>イスタンブールで</td></tr>
<tr><td class="tr">Japonya'<b>da</b></td><td>日本で</td></tr></table>
<p>固有名詞(地名・人名)にはアポストロフィ <b>'</b> をつけます。</p>
<p class="tip">💡 単語が <b>f s t k ç ş h p</b> で終わると、<b>-te / -ta</b> になります。<br>覚え方:「<b>fıstıkçı şahap</b>」(ピスタチオ売りのシャハプ)<br><span class="tr">mutfak → mutfak<b>ta</b></span>(台所で)、<span class="tr">sokak → sokak<b>ta</b></span></p>
<h4>「〜にいます」</h4>
<p>人称語尾と組み合わせて:<span class="tr">Ev<b>deyim</b>.</span>(家にいます)、<span class="tr">Nere<b>desin</b>?</span>(どこにいるの?)</p>
<p>時間にも使えます:<span class="tr">saat üç<b>te</b></span>(3時に)</p>`,
ex:[['Neredesin?','どこにいるの?'],['Evdeyim.','家にいるよ。'],['Annem mutfakta.','母は台所にいます。'],['İstanbul\'da yaşıyoruz.','イスタンブールに住んでいます。'],['Saat beşte buluşalım.','5時に会おう。']],
quiz:[
 ['ev___ (家で)',['de','da','te'],'e → -de。'],
 ['okul___ (学校で)',['da','de','ta'],'u → -da。'],
 ['mutfak___ (台所で)',['ta','da','te'],'k で終わる(fıstıkçı şahap)ので -ta。'],
 ['「どこにいるの?」',['Neredesin?','Nereyesin?','Nedesin?'],'nerede + sin。'],
]},

{ id:'g13', title:'「〜へ・〜に(方向)」', sub:'-e / -a', body:`
<p>行き先や相手を表す語尾。「(どこ)<b>へ</b>行く」「(誰)<b>に</b>あげる」。</p>
<table><tr><td class="tr">ev<b>e</b></td><td>家へ</td></tr>
<tr><td class="tr">okul<b>a</b></td><td>学校へ</td></tr>
<tr><td class="tr">market<b>e</b></td><td>スーパーへ</td></tr>
<tr><td class="tr">Japonya'<b>ya</b></td><td>日本へ(母音の後は y をはさむ)</td></tr></table>
<h4>代名詞は形が特別</h4>
<table><tr><td class="tr">bana</td><td>私に</td></tr><tr><td class="tr">sana</td><td>あなたに</td></tr><tr><td class="tr">ona</td><td>彼/彼女に</td></tr></table>
<p class="tip">💡 子音の変化:<span class="tr">sokak → soka<b>ğ</b>a</span>、<span class="tr">kitap → kita<b>b</b>a</span></p>`,
ex:[['Eve gidiyorum.','家に帰ります。'],['Markete gidelim.','スーパーに行こう。'],['Bana bak!','私を見て!(私の方を見て)'],['Sana bir hediye aldım.','あなたにプレゼントを買ったよ。'],['Japonya\'ya ne zaman gidiyorsun?','いつ日本へ行くの?']],
quiz:[
 ['okul___ gidiyorum. (学校へ行く)',['a','e','da'],'u → -a。'],
 ['market___ gidelim. (スーパーへ行こう)',['e','a','de'],'e → -e。'],
 ['Japonya___ (日本へ)',['\'ya','\'a','\'da'],'母音で終わるので y をはさむ。'],
 ['「私に」',['bana','bene','benim'],'ben + e は特別に bana。'],
]},

{ id:'g14', title:'「〜から」', sub:'-den / -dan', body:`
<p>出発点を表す語尾。「(どこ)<b>から</b>」。</p>
<table><tr><td class="tr">ev<b>den</b></td><td>家から</td></tr>
<tr><td class="tr">okul<b>dan</b></td><td>学校から</td></tr>
<tr><td class="tr">Japonya'<b>dan</b></td><td>日本から</td></tr>
<tr><td class="tr">iş<b>ten</b></td><td>仕事から(ş の後は -ten)</td></tr></table>
<p>-de と同じく、<b>fıstıkçı şahap</b> の子音の後は <b>-ten / -tan</b> になります。</p>
<h4>「〜より」にも使える!</h4>
<p><span class="tr">Çay kahve<b>den</b> ucuz.</span> チャイはコーヒー<b>より</b>安い。</p>`,
ex:[['Japonya\'dan geliyorum.','日本から来ました。'],['İşten yeni geldim.','仕事から帰ってきたところ。'],['Sabahtan beri bekliyorum.','朝から待っています。'],['Türkçe Japoncadan kolay mı?','トルコ語は日本語より簡単?']],
quiz:[
 ['Japonya___ geliyorum. (日本から来ました)',['\'dan','\'den','\'da'],'a → -dan。'],
 ['ev___ (家から)',['den','dan','de'],'e → -den。'],
 ['iş___ (仕事から)',['ten','den','tan'],'ş で終わるので -ten。'],
 ['「チャイはコーヒーより安い」',['Çay kahveden ucuz.','Çay kahvede ucuz.','Çay kahveye ucuz.'],'-den は「より」にもなります。'],
]},

{ id:'g15', title:'現在形「〜している」', sub:'-iyor', body:`
<p>今していること・習慣・近い予定を表す、会話で一番よく使う形です。</p>
<p><b>作り方:</b>動詞の <span class="tr">-mek / -mak</span> を取る → <b>-iyor</b> + 人称語尾</p>
<table><tr><th colspan="2">gelmek(来る)</th></tr>
<tr><td class="tr">gel<b>iyorum</b></td><td>私は来る/行く</td></tr>
<tr><td class="tr">gel<b>iyorsun</b></td><td>あなたは来る</td></tr>
<tr><td class="tr">gel<b>iyor</b></td><td>彼は来る</td></tr>
<tr><td class="tr">gel<b>iyoruz</b></td><td>私たちは来る</td></tr>
<tr><td class="tr">gel<b>iyorsunuz</b></td><td>あなたたちは来る</td></tr>
<tr><td class="tr">gel<b>iyorlar</b></td><td>彼らは来る</td></tr></table>
<p><b>-iyor</b> の i は母音調和で変わります:<span class="tr">al → al<b>ıyor</b>、gör → gör<b>üyor</b>、otur → otur<b>uyor</b></span></p>
<p>母音で終わる語幹:<span class="tr">oku → oku<b>yor</b>、başla → başl<b>ıyor</b>、ye → <b>yiyor</b></span></p>
<p class="tip">💡 例外:<span class="tr">gitmek → <b>gid</b>iyor</span>、<span class="tr">etmek → <b>ed</b>iyor</span>(t → d)</p>`,
ex:[['Ne yapıyorsun?','何してるの?'],['Türkçe öğreniyorum.','トルコ語を勉強しています。'],['Eve geliyorum.','今家に向かってるよ。'],['Yağmur yağıyor.','雨が降っています。'],['Seni seviyorum.','愛してる。']],
quiz:[
 ['içmek → ben (私は飲んでいる)',['içiyorum','içyorum','içiyorsun'],'iç + iyor + um。'],
 ['okumak → sen',['okuyorsun','okuiyorsun','okuyorum'],'母音で終わるので oku + yor + sun。'],
 ['gitmek → biz',['gidiyoruz','gitiyoruz','gidiyorlar'],'gitmek は t → d になる例外。'],
 ['bakmak → o',['bakıyor','bakiyor','bakıyorum'],'a → ı なので bakıyor。'],
]},

{ id:'g16', title:'否定と疑問(現在形)', sub:'-miyor / -iyor mu?', body:`
<h4>否定:語幹 + <b>m</b> + iyor</h4>
<table><tr><td class="tr">gel<b>m</b>iyorum</td><td>来ない/行かない</td></tr>
<tr><td class="tr">anla<b>m</b>ıyorum</td><td>わかりません</td></tr>
<tr><td class="tr">bil<b>m</b>iyorum</td><td>知りません</td></tr>
<tr><td class="tr">iste<b>m</b>iyorum</td><td>いりません</td></tr></table>
<h4>疑問:-iyor + <b>mu</b> + 人称語尾</h4>
<table><tr><td class="tr">Geliyor <b>musun</b>?</td><td>来る?</td></tr>
<tr><td class="tr">Anlıyor <b>musunuz</b>?</td><td>わかりますか?</td></tr>
<tr><td class="tr">Biliyor <b>mu</b>?</td><td>彼は知ってる?</td></tr></table>
<p class="tip">💡 <span class="tr">Anlamıyorum.</span> と <span class="tr">Bilmiyorum.</span> は今日から使える超便利フレーズ!</p>`,
ex:[['Anlamıyorum, tekrar eder misiniz?','わかりません、もう一度言ってくれますか?'],['Bilmiyorum.','知りません。'],['Türkçe konuşuyor musun?','トルコ語を話しますか?'],['Et yemiyorum.','肉は食べません。']],
quiz:[
 ['「わかりません」',['Anlamıyorum.','Anlıyorum.','Anlamıyor musun?'],'否定は m をはさみます。'],
 ['「知らない」',['Bilmiyorum.','Biliyorum.','Bilmiyorsun.'],'bil + m + iyor + um。'],
 ['「来る?」(あなたに)',['Geliyor musun?','Geliyorsun mu?','Gelmiyor musun?'],'人称語尾は mu のほうにつく。'],
]},

{ id:'g17', title:'「〜を」', sub:'-i / -ı / -u / -ü', body:`
<p>「〜を」の語尾ですが、<b>特定のもの(その〜)</b>を指すときだけつけます。</p>
<table><tr><td class="tr">Bir elma yedim.</td><td>(ある)りんごを1つ食べた。 ← つけない</td></tr>
<tr><td class="tr">Elma<b>yı</b> yedim.</td><td>(その)りんごを食べた。 ← つける</td></tr>
<tr><td class="tr">Kitap okuyorum.</td><td>読書している。 ← つけない</td></tr>
<tr><td class="tr">Bu kitab<b>ı</b> okuyorum.</td><td>この本を読んでいる。 ← つける</td></tr></table>
<p>母音の後は <b>y</b> をはさみます:<span class="tr">elma → elma<b>yı</b>、su → su<b>yu</b></span></p>
<h4>代名詞</h4>
<table><tr><td class="tr">beni</td><td>私を</td></tr><tr><td class="tr">seni</td><td>あなたを</td></tr><tr><td class="tr">onu</td><td>彼/それを</td></tr></table>
<div class="ex-big"><span class="tr">Seni seviyorum.</span><br>あなたを愛しています。</div>`,
ex:[['Seni seviyorum.','愛してる。'],['Kapıyı kapat.','ドアを閉めて。'],['Bu filmi izledin mi?','この映画見た?'],['Suyu verir misin?','その水を取ってくれる?'],['Beni ara.','私に電話して。']],
quiz:[
 ['「あなたを愛してる」',['Seni seviyorum.','Sen seviyorum.','Sana seviyorum.'],'sen + i = seni。'],
 ['Kapı___ kapat. (ドアを閉めて)',['yı','ı','yu'],'母音で終わるので y + ı。'],
 ['「(何か)本を読んでいる」',['Kitap okuyorum.','Kitabı okuyorum.','Kitaba okuyorum.'],'特定の本ではないので語尾なし。'],
]},

{ id:'g18', title:'過去形「〜した」', sub:'-di', body:`
<p>語幹 + <b>-di</b>(母音調和4タイプ)+ 人称語尾。f s t k ç ş h p の後は <b>-ti</b>。</p>
<table><tr><th colspan="2">gelmek</th></tr>
<tr><td class="tr">gel<b>dim</b></td><td>私は来た</td></tr>
<tr><td class="tr">gel<b>din</b></td><td>あなたは来た</td></tr>
<tr><td class="tr">gel<b>di</b></td><td>彼は来た</td></tr>
<tr><td class="tr">gel<b>dik</b></td><td>私たちは来た</td></tr>
<tr><td class="tr">gel<b>diniz</b></td><td>あなたたちは来た</td></tr>
<tr><td class="tr">gel<b>diler</b></td><td>彼らは来た</td></tr></table>
<p>例:<span class="tr">aldım</span>(買った)、<span class="tr">gördüm</span>(見た)、<span class="tr">oldu</span>(なった)、<span class="tr">gittim</span>(行った)</p>
<p>否定:<span class="tr">gel<b>me</b>dim</span>(来なかった)/ 疑問:<span class="tr">Geldin <b>mi</b>?</span>(来た?)</p>
<p class="tip">💡 <span class="tr">Oldu!</span>(できた!/OK!)、<span class="tr">Anladım.</span>(わかった)、<span class="tr">Geç kaldım.</span>(遅れた)はよく使います。</p>`,
ex:[['Dün ne yaptın?','昨日何したの?'],['Çok güzel bir gün geçirdim.','とてもいい一日を過ごしました。'],['Anladım!','わかった!'],['Yemek yedin mi?','ごはん食べた?'],['Seni çok özledim.','すごく会いたかった。']],
quiz:[
 ['almak → ben (私は買った)',['aldım','aldim','alıdım'],'al + dı + m。'],
 ['gitmek → ben',['gittim','gitdim','gidtim'],'t の後なので -ti。'],
 ['「ごはん食べた?」',['Yemek yedin mi?','Yemek yedim mi?','Yemek yiyor musun?'],'yedin = あなたは食べた。'],
 ['「来なかった」(私は)',['gelmedim','geldimme','gelmiyorum'],'否定の me をはさむ。'],
]},

{ id:'g19', title:'未来形「〜するつもり」', sub:'-ecek / -acak', body:`
<p>語幹 + <b>-ecek / -acak</b> + 人称語尾。母音の後は y をはさみます。</p>
<table><tr><th colspan="2">gelmek</th></tr>
<tr><td class="tr">gel<b>eceğim</b></td><td>私は来るつもり</td></tr>
<tr><td class="tr">gel<b>eceksin</b></td><td>あなたは来る</td></tr>
<tr><td class="tr">gel<b>ecek</b></td><td>彼は来る</td></tr>
<tr><td class="tr">gel<b>eceğiz</b></td><td>私たちは来る</td></tr>
<tr><td class="tr">gel<b>eceksiniz</b></td><td>あなたたちは来る</td></tr>
<tr><td class="tr">gel<b>ecekler</b></td><td>彼らは来る</td></tr></table>
<p>(k は母音の前で ğ に変わります)</p>
<p>否定:<span class="tr">gel<b>meyeceğim</b></span> / 疑問:<span class="tr">Gelecek <b>misin</b>?</span></p>
<p class="tip">💡 話し言葉では <span class="tr">geleceğim → gelicem</span>、<span class="tr">yapacağım → yapıcam</span> のように短く発音されることが多いです。</p>`,
ex:[['Yarın ne yapacaksın?','明日何するの?'],['Seni arayacağım.','電話するね。'],['Hava güzel olacak.','いい天気になるでしょう。'],['Yaz tatilinde Japonya\'ya gideceğiz.','夏休みに日本へ行きます。']],
quiz:[
 ['yapmak → ben (私はするつもり)',['yapacağım','yapeceğim','yapacakım'],'a なので -acak、k → ğ。'],
 ['gelmek → o',['gelecek','gelacak','geleceğim'],'彼 = 語尾なし。'],
 ['「明日何するの?」',['Yarın ne yapacaksın?','Yarın ne yaptın?','Yarın ne yapıyordun?'],'未来 + sen = yapacaksın。'],
]},

{ id:'g20', title:'「〜したい」「〜できる」', sub:'istemek / -ebilmek', body:`
<h4>〜したい:動詞の原形(-mek)+ istiyorum</h4>
<table><tr><td class="tr">Çay iç<b>mek istiyorum</b>.</td><td>チャイが飲みたい。</td></tr>
<tr><td class="tr">Türkçe öğren<b>mek istiyorum</b>.</td><td>トルコ語を学びたい。</td></tr>
<tr><td class="tr">Ne yemek <b>istersin</b>?</td><td>何が食べたい?</td></tr></table>
<p>名詞なら:<span class="tr">Su istiyorum.</span>(水が欲しい)</p>
<h4>〜できる:語幹 + <b>-ebilir / -abilir</b></h4>
<table><tr><td class="tr">Gel<b>ebilirim</b>.</td><td>来られます。</td></tr>
<tr><td class="tr">Biraz Türkçe konuş<b>abilirim</b>.</td><td>少しトルコ語が話せます。</td></tr>
<tr><td class="tr">Yardım ed<b>ebilir misiniz</b>?</td><td>手伝っていただけますか?</td></tr>
<tr><td class="tr">Sorabilir miyim?</td><td>聞いてもいいですか?</td></tr></table>
<h4>〜できない:語幹 + <b>-eme / -ama</b></h4>
<p><span class="tr">Gel<b>emem</b>.</span>(行けない)、<span class="tr">Konuş<b>amıyorum</b>.</span>(話せません)</p>`,
ex:[['Ne yapmak istersin?','何がしたい?'],['Kartla ödeyebilir miyim?','カードで払えますか?'],['Bugün gelemem, özür dilerim.','今日は行けません、ごめんなさい。'],['Fotoğraf çekebilir miyim?','写真を撮ってもいいですか?']],
quiz:[
 ['「チャイが飲みたい」',['Çay içmek istiyorum.','Çay istiyorum içmek.','Çay içiyorum istemek.'],'動詞の原形 + istiyorum。'],
 ['「聞いてもいいですか?」',['Sorabilir miyim?','Sorar mıyım?','Soruyor muyum?'],'-abilir + mi + yim。'],
 ['「行けません」',['Gelemem.','Gelmem.','Gelebilirim.'],'-eme = できない。'],
]},

{ id:'g21', title:'お願い・命令・「〜しよう」', sub:'Gel! / Gelin! / Gidelim!', body:`
<h4>命令(親しい相手):語幹だけ</h4>
<p><span class="tr">Gel!</span> 来て! / <span class="tr">Bak!</span> 見て! / <span class="tr">Otur!</span> 座って!</p>
<h4>丁寧なお願い:語幹 + <b>-in / -ın / -un / -ün</b></h4>
<p><span class="tr">Gelin.</span> 来てください / <span class="tr">Oturun.</span> お座りください / <span class="tr">Buyurun.</span> どうぞ</p>
<h4>否定:-me / -ma</h4>
<p><span class="tr">Gitme!</span> 行かないで! / <span class="tr">Merak etme.</span> 心配しないで</p>
<h4>「〜しよう」:-elim / -alım</h4>
<p><span class="tr">Gidelim!</span> 行こう! / <span class="tr">Yiyelim.</span> 食べよう / <span class="tr">Çay içelim mi?</span> チャイ飲まない?</p>
<h4>やわらかいお願い:-ir misin?(〜してくれる?)</h4>
<p><span class="tr">Bakar mısınız?</span> すみません(店員を呼ぶ) / <span class="tr">Verir misin?</span> 取ってくれる?</p>`,
ex:[['Buyurun, oturun.','どうぞ、お座りください。'],['Hadi gidelim!','さあ行こう!'],['Merak etme.','心配しないで。'],['Tuzu verir misin?','塩を取ってくれる?'],['Bakar mısınız?','すみません!(店員さん)']],
quiz:[
 ['「行こう!」',['Gidelim!','Git!','Gidiyorum!'],'-elim = 〜しよう。'],
 ['「お座りください」(丁寧)',['Oturun.','Otur.','Oturalım.'],'丁寧な命令 -un。'],
 ['「心配しないで」',['Merak etme.','Merak et.','Merak ediyorum.'],'否定命令 -me。'],
 ['「取ってくれる?」',['Verir misin?','Ver misin?','Veriyor musun?'],'-ir misin = 〜してくれる?'],
]},

{ id:'g22', title:'数字・時間・値段', sub:'Saat kaç? / Ne kadar?', body:`
<p>数字は日本語と同じく、大きい順に並べるだけ!</p>
<table><tr><td class="tr">on bir</td><td>11(10+1)</td></tr>
<tr><td class="tr">yirmi beş</td><td>25</td></tr>
<tr><td class="tr">yüz elli</td><td>150</td></tr>
<tr><td class="tr">iki bin yirmi altı</td><td>2026</td></tr></table>
<h4>時間</h4>
<table><tr><td class="tr">Saat kaç?</td><td>何時?</td></tr>
<tr><td class="tr">Saat üç.</td><td>3時です。</td></tr>
<tr><td class="tr">Saat üç buçuk.</td><td>3時半です。</td></tr>
<tr><td class="tr">Saat kaçta?</td><td>何時に?</td></tr>
<tr><td class="tr">Saat beşte.</td><td>5時に。</td></tr></table>
<h4>値段・年齢</h4>
<table><tr><td class="tr">Bu ne kadar?</td><td>これはいくら?</td></tr>
<tr><td class="tr">Kaç lira?</td><td>何リラ?</td></tr>
<tr><td class="tr">Kaç yaşındasın?</td><td>何歳?</td></tr>
<tr><td class="tr">Otuz yaşındayım.</td><td>30歳です。</td></tr></table>`,
ex:[['Saat kaç?','何時?'],['Saat yedi buçuk.','7時半です。'],['Bu ne kadar?','これはいくら?'],['Yüz elli lira.','150リラです。'],['Kaç yaşındasın?','何歳?']],
quiz:[
 ['「25」',['yirmi beş','beş yirmi','iki beş'],'大きい順:20 + 5。'],
 ['「3時半」',['saat üç buçuk','saat buçuk üç','yarım saat üç'],'buçuk = 〜半。'],
 ['「5時に」',['saat beşte','saat beş','saat beşe'],'時刻 + -te(場所の語尾)。'],
 ['「何歳?」',['Kaç yaşındasın?','Ne yaşındasın?','Kaç yaşın var mı?'],'kaç yaş + ında + sın。'],
]},

{ id:'g23', title:'「〜と一緒に・〜で(手段)」', sub:'ile / -le / -la', body:`
<p><b>ile</b> は「〜と一緒に」「〜で(手段)」の意味。単語にくっつけて <b>-le / -la</b> にすることが多いです。</p>
<table><tr><td class="tr">kocam<b>la</b></td><td>夫と一緒に</td></tr>
<tr><td class="tr">annem<b>le</b></td><td>母と</td></tr>
<tr><td class="tr">otobüs<b>le</b></td><td>バスで</td></tr>
<tr><td class="tr">araba<b>yla</b></td><td>車で(母音の後は y)</td></tr>
<tr><td class="tr">kart<b>la</b></td><td>カードで</td></tr>
<tr><td class="tr">seninle / benimle</td><td>あなたと / 私と</td></tr></table>
<p class="tip">💡 <span class="tr">ve</span> は単に「AとB」を並べるとき、<span class="tr">ile</span> は「〜と一緒に」。</p>`,
ex:[['Kocamla İstanbul\'a geldim.','夫と一緒にイスタンブールに来ました。'],['Metroyla gidelim.','地下鉄で行こう。'],['Seninle çok mutluyum.','あなたといてとても幸せ。'],['Kartla ödeyebilir miyim?','カードで払えますか?']],
quiz:[
 ['「夫と一緒に」',['kocamla','kocama','kocamda'],'-la = 〜と一緒に。'],
 ['araba___ (車で)',['yla','la','le'],'母音で終わるので y + la。'],
 ['「あなたと」',['seninle','senle','sana'],'代名詞は seninle の形。'],
]},
];
