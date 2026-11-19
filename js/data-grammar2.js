// Unit 5 grammar lessons. Same format as data-grammar.js (first choice = correct).
window.GRAMMAR.push(
{ id:'g24', title:'「〜します」(習慣・一般)', sub:'geniş zaman -r', body:`
<p>習慣、一般的なこと、そして<b>「〜する?」「〜してくれますか?」</b>というお願いや申し出に使う、会話でとてもよく出てくる形です。</p>
<h4>作り方</h4>
<table><tr><th>動詞の形</th><th>語尾</th><th>例</th></tr>
<tr><td>母音で終わる</td><td class="tr">-r</td><td class="tr">oku → oku<b>r</b>、söyle → söyle<b>r</b></td></tr>
<tr><td>1音節</td><td class="tr">-ar / -er</td><td class="tr">yap → yap<b>ar</b>、iç → iç<b>er</b></td></tr>
<tr><td>2音節以上</td><td class="tr">-ır / -ir / -ur / -ür</td><td class="tr">konuş → konuş<b>ur</b>、çalış → çalış<b>ır</b></td></tr></table>
<p class="tip">💡 例外:<span class="tr">gel → gel<b>ir</b>、al → al<b>ır</b>、bil → bil<b>ir</b>、ol → ol<b>ur</b>、gör → gör<b>ür</b>、ver → ver<b>ir</b>、kal → kal<b>ır</b>、bul → bul<b>ur</b></span> など、よく使う1音節の動詞の一部は -ir 型です。</p>
<table><tr><th colspan="2">sevmek(好きだ)</th></tr>
<tr><td class="tr">sever<b>im</b></td><td>私は好きです</td></tr><tr><td class="tr">sever<b>sin</b></td><td>あなたは好き</td></tr>
<tr><td class="tr">sever</td><td>彼は好き</td></tr><tr><td class="tr">sever<b>iz</b></td><td>私たちは好き</td></tr>
<tr><td class="tr">sever<b>siniz</b></td><td>あなたたちは好き</td></tr><tr><td class="tr">sever<b>ler</b></td><td>彼らは好き</td></tr></table>
<h4>否定:-mez / -maz(私は -mem、私たちは -meyiz)</h4>
<p><span class="tr">sev<b>mem</b></span>(好きじゃない)、<span class="tr">sev<b>mezsin</b></span>、<span class="tr">sev<b>mez</b></span>、<span class="tr">sev<b>meyiz</b></span></p>
<h4>質問 = お願い・申し出</h4>
<p><span class="tr">Çay içer misin?</span>(チャイ飲む?)<br><span class="tr">Bakar mısınız?</span>(すみません、ちょっと…/店員さんを呼ぶ)<br><span class="tr">Yardım eder misiniz?</span>(手伝っていただけますか?)</p>`,
ex:[['Kahve içer misin?','コーヒー飲む?'],['Her sabah çay içerim.','毎朝チャイを飲みます。'],['Japonlar balık sever.','日本人は魚が好きです。'],['Ben et yemem.','私は肉を食べません。'],['Kapıyı açar mısın?','ドアを開けてくれる?']],
quiz:[
 ['içmek → ben(私は飲みます)',['içerim','içirim','içarım'],'1音節 iç は -er 型 → içerim。'],
 ['yapmak → o(彼はする)',['yapar','yapır','yaper'],'1音節 yap は -ar 型 → yapar。'],
 ['gelmek → ben(私は来ます)',['gelirim','gelerim','gelarım'],'gel は例外の -ir 型 → gelirim。'],
 ['「私は肉を食べません」',['Ben et yemem.','Ben et yemezim.','Ben et yemem değil.'],'否定の「私」は -mem。'],
 ['「コーヒー飲む?」(申し出)',['Kahve içer misin?','Kahve içer sin mi?','Kahve içmek misin?'],'geniş zaman + mi + 人称 = 「〜する?」'],
]},

{ id:'g25', title:'「〜しなければ」', sub:'-meli / lazım / gerek', body:`
<h4>① -meli / -malı(〜すべき・〜しなければ)</h4>
<p>語幹 + <b>-meli / -malı</b> + 人称語尾(y をはさむ)</p>
<table><tr><td class="tr">git<b>meliyim</b></td><td>私は行かなければ</td></tr>
<tr><td class="tr">dinlen<b>melisin</b></td><td>あなたは休むべきだよ</td></tr>
<tr><td class="tr">çalış<b>malıyız</b></td><td>私たちは勉強しなければ</td></tr></table>
<h4>② lazım(会話で一番よく使う!)</h4>
<p>動詞の <b>-mek</b> を <b>-me/-ma</b> にして所有語尾 + <b>lazım</b></p>
<table><tr><td class="tr">Gitme<b>m lazım</b>.</td><td>(私は)行かないと。</td></tr>
<tr><td class="tr">Kalkma<b>n lazım</b>.</td><td>(あなたは)起きないと。</td></tr>
<tr><td class="tr">Ekmek <b>lazım</b>.</td><td>パンが必要。(名詞 + lazım)</td></tr></table>
<h4>③ gerek(必要)</h4>
<p><span class="tr">Gerek yok.</span> 必要ないよ。 / <span class="tr">Endişelenmene gerek yok.</span> 心配する必要はないよ。</p>`,
ex:[['Eve gitmem lazım.','家に帰らないと。'],['Doktora gitmelisin.','お医者さんに行くべきだよ。'],['Yarın erken kalkmam lazım.','明日早く起きなきゃ。'],['Endişelenmene gerek yok.','心配する必要はないよ。'],['Ne yapmalıyım?','私はどうしたらいい?']],
quiz:[
 ['gitmek + 「私は行かなければ」(-meli)',['gitmeliyim','gitmelim','gitmeliyiz'],'git + meli + y + im。'],
 ['「家に帰らないと」(lazım)',['Eve gitmem lazım.','Eve gitmek lazımım.','Eve gidiyorum lazım.'],'gitme + m(私の)+ lazım。'],
 ['「必要ないよ」',['Gerek yok.','Lazım var.','Gerek değil yok.'],'gerek yok = 必要ない。'],
 ['okumak + 「あなたは読むべき」',['okumalısın','okumelisin','okumalısin'],'a の後なので -malı → okumalısın。'],
]},

{ id:'g26', title:'「〜らしい」「〜だって」', sub:'伝聞・驚きの -miş', body:`
<p><b>-di</b> は自分で見た過去。<b>-miş</b> は<b>人から聞いたこと</b>や、<b>あとから気づいて驚いたこと</b>に使います。</p>
<table><tr><td class="tr">Mehmet gel<b>di</b>.</td><td>メフメットが来た。(見た)</td></tr>
<tr><td class="tr">Mehmet gel<b>miş</b>.</td><td>メフメットが来たらしい。(聞いた)</td></tr>
<tr><td class="tr">Ne kadar büyü<b>müşsün</b>!</td><td>大きくなったね!(会って気づいた)</td></tr></table>
<p>母音調和は4タイプ:<span class="tr">-miş / -mış / -muş / -müş</span></p>
<h4>名詞・形容詞にも</h4>
<p><span class="tr">Hasta<b>ymış</b>.</span> 病気なんだって。 / <span class="tr">Hava güzel<b>miş</b>.</span> いい天気らしい。 / <span class="tr">Yok<b>muş</b>.</span> ないんだって。</p>
<h4>未来 + miş</h4>
<p><span class="tr">Yağmur yağacak<b>mış</b>.</span> 雨が降るらしい。(天気予報で見た)</p>
<p class="tip">💡 昔話の「むかしむかし」も -miş:<span class="tr">Bir varmış, bir yokmuş...</span></p>`,
ex:[['Yarın yağmur yağacakmış.','明日は雨が降るらしい。'],['Ayşe hastaymış.','アイシェは病気なんだって。'],['Ne kadar büyümüşsün!','大きくなったね!'],['Bu restoran çok güzelmiş.','このレストラン、すごくいいね。(来てみてわかった)'],['Anahtarı evde unutmuşum!','鍵を家に忘れてきちゃった!']],
quiz:[
 ['「雨が降るらしい」',['Yağmur yağacakmış.','Yağmur yağacaktı.','Yağmur yağdı.'],'未来 -acak + 伝聞 -mış。'],
 ['-di と -miş の違いは?',['-miş は人から聞いた・あとで気づいたこと','-miş は未来のこと','-miş は丁寧な言い方'],'-di = 自分で見た過去、-miş = 聞いた/気づいた。'],
 ['hasta +「(彼女は)病気なんだって」',['hastaymış','hastamış','hastaydı'],'母音で終わるので y をはさむ → hastaymış。'],
 ['「大きくなったね!」',['Ne kadar büyümüşsün!','Ne kadar büyüdün mü!','Ne kadar büyüyorsun!'],'会って気づいた驚きは -miş。'],
]},

{ id:'g27', title:'「〜のとき」「〜したら」', sub:'-ken / -ince', body:`
<h4>-ken(〜しているとき・〜のころ)</h4>
<p><b>-ken は母音調和しません</b>。名詞や geniş zaman につけます。</p>
<table><tr><td class="tr">çocuk<b>ken</b></td><td>子どものころ</td></tr>
<tr><td class="tr">evde<b>yken</b></td><td>家にいるとき(母音の後は y)</td></tr>
<tr><td class="tr">yemek yer<b>ken</b></td><td>ごはんを食べながら</td></tr>
<tr><td class="tr">ben yok<b>ken</b></td><td>私がいない間</td></tr></table>
<h4>-ince(〜したら・〜すると)</h4>
<p>語幹 + <b>-(y)ince</b>(4タイプ:-ince / -ınca / -unca / -ünce)</p>
<table><tr><td class="tr">eve gel<b>ince</b></td><td>家に帰ったら</td></tr>
<tr><td class="tr">yemek bit<b>ince</b></td><td>ごはんが終わったら</td></tr>
<tr><td class="tr">seni gör<b>ünce</b></td><td>あなたを見ると</td></tr>
<tr><td class="tr">oku<b>yunca</b></td><td>読んだら(母音の後は y)</td></tr></table>`,
ex:[['Çocukken Osaka\'da yaşadım.','子どものころ大阪に住んでいました。'],['Eve gelince beni ara.','家に着いたら電話して。'],['Yemek yerken televizyon izlemeyelim.','食べながらテレビを見るのはやめよう。'],['Seni görünce çok mutlu oluyorum.','あなたに会うと、とても幸せになる。'],['Ben yokken ne yaptın?','私がいない間、何してたの?']],
quiz:[
 ['「子どものころ」',['çocukken','çocukkan','çocukunca'],'-ken は母音調和しない。'],
 ['「家に着いたら電話して」',['Eve gelince beni ara.','Eve gelken beni ara.','Eve geldiken beni ara.'],'〜したら = -ince。'],
 ['görmek +「見ると」(-ince)',['görünce','görince','görken'],'ö の後なので -ünce。'],
 ['-ken の特徴は?',['母音調和で形が変わらない','いつも -kan になる','過去にしか使わない'],'-ken はいつも -ken。'],
]},

{ id:'g28', title:'「もし〜なら」', sub:'条件の -se / -sa', body:`
<p>geniş zaman などに <b>-se / -sa</b> + 人称語尾をつけると「もし〜なら」。</p>
<table><tr><th colspan="2">gelmek(geniş zaman: gelir)</th></tr>
<tr><td class="tr">gelir<b>sem</b></td><td>私が来たら</td></tr><tr><td class="tr">gelir<b>sen</b></td><td>あなたが来たら</td></tr>
<tr><td class="tr">gelir<b>se</b></td><td>彼が来たら</td></tr><tr><td class="tr">gelir<b>sek</b></td><td>私たちが来たら</td></tr></table>
<p class="tip">💡 <span class="tr"><b>İstersen</b></span> = 「よかったら」(もし望むなら)。とても便利!</p>
<h4>名詞・形容詞 + -(y)se</h4>
<p><span class="tr">Müsait<b>sen</b></span> 都合がよければ / <span class="tr">Aç<b>san</b></span> お腹がすいてるなら / <span class="tr">Zamanın var<b>sa</b></span> 時間があれば</p>
<h4>keşke(〜ならいいのに)</h4>
<p><span class="tr">Keşke burada ol<b>san</b>.</span> あなたがここにいたらいいのに。</p>`,
ex:[['İstersen birlikte gidelim.','よかったら一緒に行こう。'],['Zamanın varsa bana yardım eder misin?','時間があったら手伝ってくれる?'],['Yağmur yağarsa evde kalırız.','雨が降ったら家にいよう。'],['Keşke annem de burada olsa.','母もここにいたらいいのに。'],['Açsan yemek hazır.','お腹すいてるなら、ごはんできてるよ。']],
quiz:[
 ['「よかったら(もし望むなら)」',['istersen','isterse misin','istersin'],'ister + sen = istersen。'],
 ['「雨が降ったら」',['yağmur yağarsa','yağmur yağınca mı','yağmur yağdıse'],'yağar + sa。'],
 ['「〜だったらいいのに」',['keşke','belki','çünkü'],'keşke + -se。'],
 ['gelmek +「私が来たら」',['gelirsem','gelersem','gelirsam'],'gelir(例外の -ir 型)+ sem。'],
]},

{ id:'g29', title:'「私が〜した…」', sub:'-dik + 所有(名詞を説明する)', body:`
<p>「私が好きな料理」のように、名詞を説明する形です。<b>日本語と同じく、説明が名詞の前に来ます!</b></p>
<p>語幹 + <b>-dik</b>(4タイプ、f s t k ç ş h p の後は -tik)+ 所有語尾 + 名詞</p>
<table><tr><td class="tr">sev<b>diğim</b> yemek</td><td>私が好きな料理</td></tr>
<tr><td class="tr">yap<b>tığın</b> kek</td><td>あなたが作ったケーキ</td></tr>
<tr><td class="tr">annemin yap<b>tığı</b> mantı</td><td>母が作るマントゥ</td></tr>
<tr><td class="tr">otur<b>duğumuz</b> ev</td><td>私たちが住んでいる家</td></tr></table>
<p>(k は母音の前で ğ に変わります:-dik → -diğim)</p>
<p class="tip">💡 <span class="tr"><b>en sevdiğim</b></span> = 「一番好きな」:<span class="tr">En sevdiğim renk mavi.</span>(一番好きな色は青)</p>
<p>未来なら <b>-eceği</b>:<span class="tr">gid<b>eceğimiz</b> yer</span>(私たちが行く場所)</p>`,
ex:[['En sevdiğim yemek mantı.','一番好きな料理はマントゥです。'],['Annemin yaptığı börek çok lezzetli.','母が作るボレキはとてもおいしい。'],['Dün izlediğimiz film güzeldi.','昨日見た映画はよかった。'],['Tanıdığın biri var mı?','知っている人はいる?'],['Gideceğimiz yer uzak mı?','私たちが行く場所は遠い?']],
quiz:[
 ['「私が好きな料理」',['sevdiğim yemek','yemek sevdiğim','sevdim yemek'],'説明が名詞の前。sev + diğ + im。'],
 ['「あなたが作ったケーキ」',['yaptığın kek','yaptın kek','yapdığın kek'],'p の後なので -tığ。'],
 ['「母が作るマントゥ」',['annemin yaptığı mantı','annem yaptığı mantı','annemin yaptım mantı'],'主語は annemin、動詞は -tığı。'],
 ['「一番好きな色は?」',['En sevdiğin renk ne?','En sevdin renk ne?','Sevdiğin en renk ne?'],'en + sevdiğin + renk。'],
]},

{ id:'g30', title:'「もっと」「一番」', sub:'daha / en / -den daha', body:`
<table><tr><td class="tr">daha</td><td>もっと・より</td></tr>
<tr><td class="tr">en</td><td>一番・最も</td></tr>
<tr><td class="tr">A, B<b>-den</b> daha 〜</td><td>AはBより〜</td></tr></table>
<div class="ex-big"><span class="tr">Çay kahve<b>den</b> daha ucuz.</span><br>チャイはコーヒーより安い。</div>
<p><span class="tr">Bu <b>daha</b> güzel.</span> これのほうがきれい。<br><span class="tr">İstanbul Türkiye'nin <b>en</b> büyük şehri.</span> イスタンブールはトルコで一番大きい町。</p>
<h4>便利な表現</h4>
<p><span class="tr">biraz daha</span> もう少し / <span class="tr">bir daha</span> もう一回・二度と / <span class="tr">daha iyi</span> もっといい</p>`,
ex:[['Bu daha güzel.','これのほうがきれい。'],['İstanbul, Ankara\'dan daha büyük.','イスタンブールはアンカラより大きい。'],['En sevdiğim mevsim ilkbahar.','一番好きな季節は春です。'],['Biraz daha çay?','チャイ、もう少しどう?'],['Türkçe Japoncadan daha kolay mı?','トルコ語は日本語よりやさしい?']],
quiz:[
 ['「これのほうがきれい」',['Bu daha güzel.','Bu en güzel.','Bu güzelden.'],'daha = より。'],
 ['「チャイはコーヒーより安い」',['Çay kahveden daha ucuz.','Çay kahveye daha ucuz.','Çay daha kahve ucuz.'],'比べる相手に -den。'],
 ['「一番」',['en','daha','çok'],'en = 一番。'],
 ['「もう少し」',['biraz daha','daha en','çok az'],'biraz daha = もう少し。'],
]}
);
