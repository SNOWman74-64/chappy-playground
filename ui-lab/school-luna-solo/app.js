(() => {
  'use strict';

  const img = '../school-comparison/assets/';
  const main = document.querySelector('#main-content');
  const header = document.querySelector('[data-header]');
  const toast = document.querySelector('[data-toast]');
  const state = {
    form: 'contact',
    phase: 'input',
    contact: {},
    reserve: {},
    faqOpen: 0
  };

  const news = [
    { id: 1, date: '2026.09.05', category: '学校行事', title: '秋の学校説明会 予約受付を開始しました', body: '11月までの説明会日程を公開しました。授業見学と在校生とのミニトークを通して、青葉の一日をお確かめください。各回の定員は80組です。' },
    { id: 2, date: '2026.09.01', category: '入試', title: '2027年度 生徒募集要項（デモ版）を公開', body: '募集区分、出願期間、選考方法、入学手続きの流れをまとめた2027年度入試のデモ要項を公開しました。詳細は入試・説明会ページをご覧ください。' },
    { id: 3, date: '2026.08.25', category: '学び', title: '探究発表会「問いの森」を開催しました', body: '2年生が地域の商店街、河川環境、メディア表現をテーマに、半年間の問いを発表しました。保護者と地域の方にも成果を見ていただきました。' },
    { id: 4, date: '2026.08.19', category: '学校生活', title: '夏季講座と図書館の利用時間について', body: '夏季講座期間中は図書館を平日8時から18時まで開館します。自習席の予約方法と、熱中症対策のお願いを更新しました。' },
    { id: 5, date: '2026.07.30', category: '部活動', title: '青葉祭のクラブ展示・発表スケジュール', body: '9月20日開催の青葉祭では、運動部の体験会と文化部の展示を行います。参加には事前登録が必要な企画があります。' },
    { id: 6, date: '2026.07.12', category: '学び', title: '夏の海外オンライン交流が始まりました', body: '国際コースの生徒がニュージーランドの提携校と、気候変動をテーマにした全4回のオンライン交流を始めました。' },
    { id: 7, date: '2026.06.28', category: '学校行事', title: '保護者向け進路講演会のお知らせ', body: '7月18日（土）に本校ホールで、卒業後の学びを考える進路講演会を開催します。高校1・2年生の保護者の方も参加できます。' },
    { id: 8, date: '2026.06.11', category: 'お知らせ', title: '熱中症予防と登下校時の服装について', body: '気温の高い時期の水分補給、日傘、体育授業の見学基準について、生徒・保護者向けの案内を掲載しました。' }
  ];
  const clubs = [
    { id: 1, type: '運動部', name: 'バスケットボール部', schedule: '火・木・土', place: '第一体育館', text: '走る、考える、声を出す。経験者も初心者も、一人ひとりの成長をチームの力につなげています。', detail: '週3回の練習では、基礎技術とゲームの振り返りを大切にしています。大会前は自主練習の時間も設け、学年を越えて声を掛け合う文化があります。' },
    { id: 2, type: '運動部', name: '陸上競技部', schedule: '月・水・金', place: 'グラウンド', text: '自分の記録と向き合い、昨日の自分を一歩越える部活動です。', detail: '短距離・跳躍・長距離の各ブロックで練習します。フォーム撮影と記録ノートを使い、目標を自分で組み立てます。' },
    { id: 3, type: '運動部', name: '女子サッカー部', schedule: '火・金・土', place: '第二グラウンド', text: 'ボールを通して、判断力と仲間を信じる力を育てます。', detail: '少人数から始まったクラブですが、近隣校との合同練習も行います。試合後のミーティングで気づきを言葉にします。' },
    { id: 4, type: '運動部', name: 'バドミントン部', schedule: '月・木・土', place: '第二体育館', text: 'フットワークとラリーを磨き、互いに教え合う部です。', detail: '基礎打ちから試合形式まで、レベル別に取り組みます。体育館の使い方や道具の手入れも部員が分担します。' },
    { id: 5, type: '文化部', name: '吹奏楽部', schedule: '月・水・金', place: '音楽室', text: '音を重ねて、聴く人の記憶に残る演奏を目指します。', detail: '基礎合奏とパート練習を組み合わせ、青葉祭と地域の演奏会に向けて活動します。楽器未経験者も歓迎しています。' },
    { id: 6, type: '文化部', name: '写真部', schedule: '水・隔週土', place: 'メディア室', text: '日常の小さな発見を、写真と言葉で記録します。', detail: '校内や街の撮影会、作品講評会、青葉祭での展示を行います。スマートフォンから始める参加もできます。' },
    { id: 7, type: '文化部', name: '科学研究部', schedule: '火・木', place: '理科実験室', text: '身近な不思議を実験し、仮説を確かめていきます。', detail: '水質調査や植物の成長観察など、校内外の題材で研究します。探究授業との共同発表も予定しています。' },
    { id: 8, type: '文化部', name: '茶道部', schedule: '金', place: '和室', text: '季節を感じる所作と、相手を思うもてなしを学びます。', detail: '講師の先生と一緒に、道具の扱いと基本の点前を練習します。文化祭では来場者にお茶をお出しします。' }
  ];
  const faq = [
    ['最寄り駅から学校までどのくらいかかりますか？', '青葉中央駅から徒歩12分です。駅からは川沿いの遊歩道と商店街を通る、明るく見通しのよい道順です。'],
    ['授業見学はいつできますか？', '説明会の予約時に「授業見学あり」の回をお選びください。平日の個別見学はお問い合わせフォームからご相談いただけます。'],
    ['制服はありますか？', 'あります。式典用のジャケットに加え、季節に合わせてニットやポロシャツを選べるスタイルです。詳細は説明会でご案内します。'],
    ['昼食はお弁当だけですか？', 'お弁当の持参に加えて、校内カフェテリアの軽食を利用できます。アレルギー対応については入学後に個別確認します。'],
    ['部活動は必ず参加しますか？', '必修ではありません。複数の部を見学してから選ぶことも、学外の活動と両立することもできます。'],
    ['入試の過去問題はもらえますか？', '説明会でデモ版の出題方針とサンプル問題をお渡ししています。実際の入試情報は必ず最新の募集要項をご確認ください。'],
    ['スクールバスはありますか？', '現在、スクールバスの運行はありません。青葉中央駅と緑ヶ丘駅から公共交通機関で通学できます。']
  ];
  const pages = [
    { key: 'about', label: '学校紹介', title: 'ひとりの「好き」を、学びの出発点に。', text: '1968年創立。変わり続ける社会の中で、自分の問いを持ち、他者とともに答えを探す人を育てます。' },
    { key: 'learning', label: '学び', title: '学ぶことが、世界の見え方を変える。', text: '3つのコースと教科横断の探究で、興味を深めながら進路を描きます。' },
    { key: 'life', label: '学校生活・施設', title: '毎日の風景が、思い出になる。', text: '授業の前後、行事、放課後。人と場所が交わる学校生活をご紹介します。' },
    { key: 'clubs', label: '部活動', title: '夢中になれる場所が、ここにある。', text: '運動部と文化部、8つのクラブ。活動の時間も場所も、それぞれの色があります。' },
    { key: 'admissions', label: '入試・説明会', title: '知りたいことから、会いに来てください。', text: '2027年度入試のデモ要項と、学校の空気を感じられる説明会をご案内します。' },
    { key: 'news', label: 'お知らせ', title: '青葉の今を、お知らせします。', text: '学校行事、学び、入試に関する最新のお知らせです。' },
    { key: 'access', label: 'アクセス・FAQ', title: '学校への道と、よくある質問。', text: 'アクセス方法と、受験生・保護者の皆さまから寄せられる質問をまとめました。' },
    { key: 'contact', label: 'お問い合わせ・資料請求', title: 'わからないことは、気軽に聞いてください。', text: '説明会、入試、学校生活に関するご質問や資料請求を承ります。' }
  ];

  const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const attr = esc;
  const page = key => pages.find(p => p.key === key) || pages[0];
  const paramsOf = raw => new URLSearchParams(raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : '');
  const currentHash = () => (location.hash || '#home').slice(1);
  const currentRoute = () => currentHash().split('?')[0].split('/')[0] || 'home';
  const routeParam = name => paramsOf(currentHash()).get(name) || '';

  function pageHero(key, title, text, eyebrow = '') {
    return `<section class="page-hero"><div class="page-wrap"><div class="breadcrumbs"><a href="#home">トップ</a><span aria-hidden="true">/</span><span>${esc(page(key).label)}</span></div><p class="eyebrow">${esc(eyebrow || page(key).label)}</p><h1>${esc(title)}</h1><p>${esc(text)}</p></div></section>`;
  }
  function cta(text, href, cls = 'primary-button') { return `<a class="${cls}" href="${attr(href)}">${esc(text)} <span aria-hidden="true">↗</span></a>`; }
  function sectionHead(eyebrow, title, copy = '', href = '', linkText = '') {
    return `<div class="section-head"><div><span class="kicker">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${copy ? `<p>${esc(copy)}</p>` : ''}</div>${href ? `<a class="text-button" href="${attr(href)}">${esc(linkText || '詳しく見る')} ↗</a>` : ''}</div>`;
  }
  function newsRows(items) {
    return `<div class="news-list">${items.map(item => `<a class="news-row" href="#news/${item.id}"><time datetime="${item.date.replace(/\./g, '-')}">${item.date}</time><span class="tag">${esc(item.category)}</span><span class="news-title">${esc(item.title)}</span><span class="arrow" aria-hidden="true">→</span></a>`).join('')}</div>`;
  }
  function clubCards(items) {
    return `<div class="club-grid">${items.map(c => `<article class="club-card"><span class="club-kind">${esc(c.type)}</span><h3>${esc(c.name)}</h3><p>${esc(c.text)}</p><dl><dt>活動日</dt><dd>${esc(c.schedule)}</dd><dt>場所</dt><dd>${esc(c.place)}</dd></dl><a class="text-button" href="#clubs/${c.id}">活動詳細 ↗</a></article>`).join('')}</div>`;
  }

  function homeView() {
    return `<section class="hero"><img class="hero-image" src="${img}campus.jpg" alt="湖畔に建つ校舎と歩く人々" /><div class="hero-stamp">EST.<br>1968<br><small>AOBA</small></div><div class="hero-content"><p class="eyebrow">AOBA HIGH SCHOOL / FICTIONAL DEMO</p><h1>好きが、<br>未来をひらく。</h1><p class="hero-lead">問いを持つ。人と出会う。<br>ここで見つけた好奇心を、未来への一歩に。</p><div class="hero-actions">${cta('学校を知る', '#about')}${cta('説明会に参加する', '#admissions', 'outline-button')}</div></div></section>
      <div class="notice-bar"><div class="notice-bar-inner page-wrap"><span class="label">IMPORTANT</span><a href="#news/1"><time datetime="2026-09-05">2026.09.05</time>秋の学校説明会の予約受付を開始しました</a><a class="text-button" href="#news">一覧を見る ↗</a></div></div>
      <section class="section"><div class="page-wrap"><div class="feature-grid"><img class="feature-image" src="${img}students.jpg" alt="校舎の前で談笑する生徒たち" /><div class="feature-copy"><span class="kicker">OUR PROMISE</span><h2>「やってみたい」が、<br>学びになる学校。</h2><p>青葉高等学校では、教室の中だけでなく、地域や仲間との出会いも学びと考えています。自分の興味を出発点に、考え、試し、伝える。その積み重ねが、自分らしい進路をつくります。</p>${cta('青葉の教育を知る', '#learning', 'outline-button')}<ul class="number-list"><li><span class="number">01</span><div><strong>問いを育てる</strong><span>教科の知識を、自分の疑問とつなげる</span></div></li><li><span class="number">02</span><div><strong>人と学ぶ</strong><span>違う視点に出会い、考えを深める</span></div></li><li><span class="number">03</span><div><strong>未来を描く</strong><span>好きなことを、社会との接点へ広げる</span></div></li></ul></div></div></div></section>
      <section class="section section-tint"><div class="page-wrap">${sectionHead('EXPLORE AOBA', '知るほど、会いたくなる。', '学校の空気を、写真とことばでご紹介します。')}<div class="cards-3"><a class="link-card photo-card photo-classroom" href="#learning"><span class="card-index">01 / LEARNING</span><h3>学び</h3><p>3つのコースと、探究する授業。</p><span class="arrow">↗</span></a><a class="link-card photo-card photo-library" href="#life"><span class="card-index">02 / DAILY LIFE</span><h3>学校生活</h3><p>一日の流れと、6つの施設。</p><span class="arrow">↗</span></a><a class="link-card photo-card photo-basketball" href="#clubs"><span class="card-index">03 / AFTER SCHOOL</span><h3>部活動</h3><p>放課後の8つの居場所。</p><span class="arrow">↗</span></a></div></div></section>
      <section class="section"><div class="page-wrap">${sectionHead('LATEST NEWS', '青葉の今を、お知らせします。', '', '#news', 'お知らせ一覧')} ${newsRows(news.slice(0, 4))}</div></section>
      <section class="section section-deep"><div class="page-wrap">${sectionHead('OPEN SCHOOL', 'まずは、見に来てください。', '授業のこと、部活動のこと、どんな小さな疑問も歓迎します。', '#admissions', '説明会日程を見る')}<div class="stats"><div class="stat"><strong>6</strong><span>各学年クラス数</span></div><div class="stat"><strong>3</strong><span>選べるコース</span></div><div class="stat"><strong>8</strong><span>活動中のクラブ</span></div><div class="stat"><strong>12<span>分</span></strong><span>青葉中央駅から徒歩</span></div></div></div></section>`;
  }

  function aboutView() {
    return pageHero('about', 'ひとりの「好き」を、学びの出発点に。', '1968年創立。変わり続ける社会の中で、自分の問いを持ち、他者とともに答えを探す人を育てます。', 'ABOUT AOBA') + `<section class="section"><div class="page-wrap two-col"><div class="prose"><span class="kicker">EDUCATIONAL PHILOSOPHY</span><h2>自分の未来を、<br>自分の問いから。</h2><p>青葉高等学校が大切にしているのは、知識を覚えることだけではありません。「なぜだろう」「やってみたい」という小さな気持ちを起点に、調べ、対話し、表現すること。答えが一つではない問いに向き合う経験が、変化の中で考え続ける力になります。</p><div class="quote">好きなことを深めると、<br>まだ知らない世界に出会える。</div><p>生徒と教員、地域の人たちがそれぞれの専門性を持ち寄り、教室の境界を越えた学びをつくっています。</p></div><aside class="side-note"><h2>校長メッセージ</h2><p>青葉で過ごす時間が、皆さんの「これから」を考える小さな灯りになればと思います。得意なことも、迷うことも、そのまま持ってきてください。対話の中で、自分だけの問いを見つける学校でありたいと願っています。</p><p class="serif">校長　佐伯 直子</p></aside></div></section><section class="section section-tint"><div class="page-wrap"><div class="section-head"><div><span class="kicker">HISTORY & PROFILE</span><h2>青葉の歩みと概要</h2></div></div><div class="two-col"><ol class="timeline"><li><time>1968年</time><div><strong>青葉女子高等学校として創立</strong><p>緑ヶ丘の丘に校舎を開設。</p></div></li><li><time>1987年</time><div><strong>共学化、「青葉高等学校」へ</strong><p>多様な個性が学び合う学校へ。</p></div></li><li><time>2012年</time><div><strong>探究プログラムを開始</strong><p>地域と連携した課題研究をスタート。</p></div></li><li><time>2024年</time><div><strong>新図書館棟が完成</strong><p>ラーニングコモンズを中心に再編。</p></div></li></ol><table class="fact-table"><tbody><tr><th>学校名</th><td>私立 青葉高等学校</td></tr><tr><th>創立</th><td>1968年（昭和43年）</td></tr><tr><th>課程</th><td>全日制・普通科</td></tr><tr><th>学年・クラス</th><td>1〜3年 / 各学年6クラス</td></tr><tr><th>コース</th><td>探究・総合・国際</td></tr><tr><th>所在地</th><td>〒000-0000 架空県青葉市緑ヶ丘1-2-3</td></tr></tbody></table></div></div></section>`;
  }

  function learningView() {
    return pageHero('learning', '学ぶことが、世界の見え方を変える。', '3つのコースと教科横断の探究で、興味を深めながら進路を描きます。', 'LEARNING') + `<section class="section"><div class="page-wrap">${sectionHead('THREE PATHS', '3つのコースから選ぶ', '2年次から、自分の関心と進路に合わせて学びを深めます。')}<div class="course-grid"><article class="course-card"><span class="course-no">COURSE 01</span><h3>探究コース</h3><p>身近な問いを社会の課題へ。調査と発表を繰り返し、考えを形にします。</p><ul><li>地域課題フィールドワーク</li><li>データで読む社会</li><li>卒業研究発表</li></ul><a class="mini-link" href="#contact?type=お問い合わせ">コースについて聞く ↗</a></article><article class="course-card"><span class="course-no">COURSE 02</span><h3>総合コース</h3><p>基礎学力を土台に、文理を越えて幅広い選択科目から学びます。</p><ul><li>選択型の演習授業</li><li>資格・検定サポート</li><li>進路別の少人数講座</li></ul><a class="mini-link" href="#contact?type=お問い合わせ">コースについて聞く ↗</a></article><article class="course-card"><span class="course-no">COURSE 03</span><h3>国際コース</h3><p>言語と文化の違いを越え、世界と協働するための視点を育てます。</p><ul><li>英語でのプレゼンテーション</li><li>オンライン国際交流</li><li>短期海外研修</li></ul><a class="mini-link" href="#contact?type=お問い合わせ">コースについて聞く ↗</a></article></div></div></section><section class="section section-tint"><div class="page-wrap two-col"><div class="prose"><span class="kicker">PROJECT LEARNING</span><h2>教科の先に、<br>自分の問いがある。</h2><p>週1回の探究時間「問いの森」では、生徒がテーマを決め、仮説を立て、調査し、発表します。国語の文章力、数学のデータ分析、理科の検証、英語の発信。複数の教科が、一つの問いの中でつながります。</p><ul><li>1年：観察して問いを見つける</li><li>2年：地域と社会を調査する</li><li>3年：進路と問いを接続する</li></ul></div><img class="feature-image" src="${img}classroom.jpg" alt="教室で学ぶ生徒たち" /></div></section><section class="section"><div class="page-wrap">${sectionHead('PATHWAYS', '進路を、一緒に設計する', '担任・進路室・卒業生が、選択のタイミングに寄り添います。')}<div class="stats" style="background:var(--deep);color:white"><div class="stat"><strong>82<span>%</span></strong><span>4年制大学進学（デモ値）</span></div><div class="stat"><strong>14<span>%</span></strong><span>短大・専門学校進学</span></div><div class="stat"><strong>4<span>%</span></strong><span>その他の進路</span></div><div class="stat"><strong>1:4</strong><span>進路担当と生徒の目安</span></div></div><p class="form-note" style="margin-top:14px">※上記は学校紹介用の架空データです。実在の進学実績を示すものではありません。</p></div></section>`;
  }

  function lifeView() {
    return pageHero('life', '毎日の風景が、思い出になる。', '授業の前後、行事、放課後。人と場所が交わる学校生活をご紹介します。', 'DAILY LIFE') + `<section class="section"><div class="page-wrap"><div class="two-col"><div><span class="kicker">A DAY AT AOBA</span><h2 class="serif" style="font-size:38px">一日の流れ</h2><ol class="timeline"><li><time>08:20</time><div><strong>登校・朝の時間</strong><p>教室で準備をしたり、図書館で本を読んだり。</p></div></li><li><time>08:45</time><div><strong>午前の授業</strong><p>対話と演習を組み合わせた50分授業。</p></div></li><li><time>12:35</time><div><strong>昼休み</strong><p>カフェテリアや中庭で、思い思いに過ごします。</p></div></li><li><time>13:25</time><div><strong>午後の授業・探究</strong><p>コースの学びと、問いを深める時間。</p></div></li><li><time>16:20</time><div><strong>放課後</strong><p>部活動、委員会、自習。帰る時間も自分で選ぶ。</p></div></li></ol></div><img class="feature-image" src="${img}library.jpg" alt="本棚が並ぶ学校図書館" /></div></div></section><section class="section section-tint"><div class="page-wrap">${sectionHead('FACILITIES', '学びを支える6つの場所', '集中する場所、交わる場所、試す場所。学校の中に多様な居場所があります。')}<div class="facility-grid"><article class="facility-card"><img src="${img}library.jpg" alt="本棚のある図書館" /><div><h3>森の図書館</h3><p>約3万冊。静かな閲覧席と会話のできるラーニングコモンズ。</p></div></article><article class="facility-card"><img src="${img}classroom.jpg" alt="明るい教室" /><div><h3>対話型教室</h3><p>机を動かして、個人学習からグループワークまで。</p></div></article><article class="facility-card"><img src="${img}classroom.jpg" alt="実験に使える教室" style="object-position:70% 50%" /><div><h3>理科実験室</h3><p>観察・測定・制作に対応した探究のための実験室。</p></div></article><article class="facility-card"><img src="${img}basketball.jpg" alt="屋内体育館" /><div><h3>第一体育館</h3><p>バスケットボール2面。雨の日も思いきり体を動かせます。</p></div></article><article class="facility-card"><img src="${img}students.jpg" alt="校舎周辺の緑" /><div><h3>ひだまり中庭</h3><p>季節の木々に囲まれた、昼休みの人気スポット。</p></div></article><article class="facility-card"><img src="${img}campus.jpg" alt="湖畔の校舎" /><div><h3>青葉ホール</h3><p>講演会、発表会、式典を行う300席の多目的ホール。</p></div></article></div></div></section><section class="section"><div class="page-wrap">${sectionHead('ANNUAL EVENTS', '季節をめぐる行事')}<div class="cards-4"><a class="link-card" href="#news/5"><span class="card-index">04.18</span><h3>新入生歓迎会</h3><p>先輩から学校の歩き方を受け取る日。</p><span class="arrow">→</span></a><a class="link-card" href="#news/3"><span class="card-index">06.21</span><h3>探究発表会</h3><p>問いの成果を、社会にひらく。</p><span class="arrow">→</span></a><a class="link-card" href="#news/5"><span class="card-index">09.20</span><h3>青葉祭</h3><p>展示も舞台も、主役は生徒たち。</p><span class="arrow">→</span></a><a class="link-card" href="#news/7"><span class="card-index">02.07</span><h3>合唱コンクール</h3><p>クラスの声がひとつになる日。</p><span class="arrow">→</span></a></div></div></section>`;
  }

  function clubsView() {
    const filter = routeParam('filter') || 'すべて';
    const items = filter === 'すべて' ? clubs : clubs.filter(c => c.type === filter);
    return pageHero('clubs', '夢中になれる場所が、ここにある。', '運動部と文化部、8つのクラブ。活動の時間も場所も、それぞれの色があります。', 'CLUB ACTIVITIES') + `<section class="section"><div class="page-wrap">${sectionHead('AFTER SCHOOL', '放課後の選択肢', '見学・体験はいつでも歓迎しています。') }<div class="filter-bar" role="group" aria-label="部活動の分類"><button class="filter-button" type="button" data-filter="すべて" data-filter-group="clubs" aria-pressed="${filter === 'すべて'}">すべて <span>8</span></button><button class="filter-button" type="button" data-filter="運動部" data-filter-group="clubs" aria-pressed="${filter === '運動部'}">運動部 <span>4</span></button><button class="filter-button" type="button" data-filter="文化部" data-filter-group="clubs" aria-pressed="${filter === '文化部'}">文化部 <span>4</span></button></div><p class="result-count" aria-live="polite">${items.length}件の部活動を表示中</p>${clubCards(items)}</div></section><section class="section section-tint"><div class="page-wrap two-col"><div class="prose"><span class="kicker">TRY SOMETHING NEW</span><h2>まずは、見学から。</h2><p>活動日や場所が合わなくても、短時間の見学や体験参加をご相談いただけます。入学後に改めて選ぶこともできるので、気になるクラブをいくつか比べてみてください。</p>${cta('見学について問い合わせる', '#contact?type=お問い合わせ', 'outline-button')}</div><img class="feature-image" src="${img}basketball.jpg" alt="体育館のバスケットゴール" /></div></div>`;
  }

  function clubDetailView(id) {
    const c = clubs.find(x => String(x.id) === String(id));
    if (!c) return notFoundView();
    return pageHero('clubs', c.name, c.text, c.type) + `<section class="section"><div class="page-wrap club-detail-layout"><div class="prose"><a class="back-link" href="#clubs">← 部活動一覧に戻る</a><h2>活動について</h2><p>${esc(c.detail)}</p><p>青葉高等学校の部活動は、競技や作品だけでなく、準備や振り返りも含めて学びの場と考えています。先輩・後輩で相談しながら、自分たちの活動をつくっています。</p><h2>見学のご案内</h2><p>見学を希望される方は、下記の活動日を目安にお問い合わせください。大会や校外活動で予定が変わる場合があります。</p><table class="fact-table"><tbody><tr><th>活動日</th><td>${esc(c.schedule)}</td></tr><tr><th>活動場所</th><td>${esc(c.place)}</td></tr><tr><th>対象</th><td>本校生徒・入学を検討中の方</td></tr></tbody></table>${cta('見学を問い合わせる', '#contact?type=お問い合わせ', 'outline-button')}</div><aside class="detail-aside"><h2>ほかの部活動</h2>${clubs.filter(x => x.id !== c.id).slice(0, 5).map(x => `<a href="#clubs/${x.id}">${esc(x.name)} <span aria-hidden="true">→</span></a>`).join('')}<a href="#clubs">すべて見る ↗</a></aside></div></section>`;
  }

  function admissionsView() {
    return pageHero('admissions', '知りたいことから、会いに来てください。', '2027年度入試のデモ要項と、学校の空気を感じられる説明会をご案内します。', 'ADMISSIONS & EVENTS') + `<section class="section"><div class="page-wrap"><div class="admission-note"><div><span class="kicker">2027 ADMISSIONS / DEMO</span><h2>入試の全体像を、わかりやすく。</h2><p>このページの要項・日程・費用は、UI検証のために作成した架空情報です。実際の出願には利用できません。</p></div><div>${cta('学校案内を印刷する', 'guide.html', 'outline-button')}</div></div><div class="two-col" style="margin-top:45px"><div><h2 class="serif" style="font-size:30px">募集要項（デモ）</h2><table class="fact-table fee-table"><tbody><tr><th>募集区分</th><td>普通科（探究・総合・国際）</td></tr><tr><th>募集人数</th><td>180名（各コース60名）</td></tr><tr><th>出願期間</th><td>2027年1月12日〜1月22日</td></tr><tr><th>選考日</th><td>2027年2月5日（土）</td></tr><tr><th>選考方法</th><td>国語・数学・英語、面接、調査書</td></tr><tr><th>合格発表</th><td>2027年2月9日（火）</td></tr></tbody></table></div><div><h2 class="serif" style="font-size:30px">費用（デモ）</h2><table class="fact-table fee-table"><tbody><tr><th>入学金</th><td>¥250,000</td></tr><tr><th>授業料（月額）</th><td>¥38,000</td></tr><tr><th>施設費（月額）</th><td>¥8,000</td></tr><tr><th>制服・教材</th><td>約¥120,000</td></tr></tbody></table><p class="form-note">※減免・奨学金制度は説明会でご案内します。</p></div></div></div></section><section class="section section-tint"><div class="page-wrap">${sectionHead('OPEN SCHOOL', '説明会の日程', '学校のことを知るには、実際に空気を感じるのがいちばんです。')}<div class="date-cards"><article class="date-card"><span class="month">OCTOBER 18 / SAT</span><h3>秋の学校説明会</h3><p>学校紹介、授業見学、在校生トーク</p><span class="capacity">10:00〜12:00 / 定員80組</span>${cta('この回に予約する', '#reserve?event=秋の学校説明会')}</article><article class="date-card"><span class="month">NOVEMBER 08 / SAT</span><h3>コース体験会</h3><p>3コースから選べるミニ授業</p><span class="capacity">13:30〜16:00 / 定員60組</span>${cta('この回に予約する', '#reserve?event=コース体験会')}</article><article class="date-card"><span class="month">DECEMBER 06 / SAT</span><h3>入試相談会</h3><p>入試説明、個別相談、校内見学</p><span class="capacity">10:00〜12:30 / 定員50組</span>${cta('この回に予約する', '#reserve?event=入試相談会')}</article></div></div></section><section class="section"><div class="page-wrap two-col"><div class="prose"><span class="kicker">HOW TO VISIT</span><h2>予約から当日まで</h2><div class="step-line"><div class="active">日程を選ぶ</div><div>フォーム入力</div><div>当日受付</div></div><p>予約フォームはこのデモ内で完結します。実在の予約・個人情報の送信は行いません。入力した内容は画面を閉じるまで一時的に保持されます。</p></div><aside class="side-note"><h3>持ち物</h3><p>筆記用具、上履き、必要な方はメモ用紙。保護者の方は公共交通機関をご利用ください。</p><a href="#access">アクセス・FAQを見る ↗</a></aside></div></section>`;
  }

  function newsView() {
    const filter = routeParam('filter') || 'すべて';
    const items = filter === 'すべて' ? news : news.filter(n => n.category === filter);
    const categories = ['すべて', '学校行事', '学び', '入試', '学校生活', '部活動'];
    return pageHero('news', '青葉の今を、お知らせします。', '学校行事、学び、入試に関する最新のお知らせです。', 'NEWS') + `<section class="section"><div class="page-wrap">${sectionHead('NEWS ARCHIVE', 'お知らせ一覧') }<div class="filter-bar" role="group" aria-label="お知らせの分類">${categories.map(c => `<button class="filter-button" type="button" data-filter="${attr(c)}" data-filter-group="news" aria-pressed="${filter === c}">${esc(c)}</button>`).join('')}</div><p class="result-count" aria-live="polite">${items.length}件のお知らせを表示中</p>${newsRows(items)}</div></section>`;
  }

  function newsDetailView(id) {
    const item = news.find(n => String(n.id) === String(id));
    if (!item) return notFoundView();
    return pageHero('news', item.title, item.body, `${item.category} / ${item.date}`) + `<section class="section"><div class="page-wrap article-layout"><article class="prose"><a class="back-link" href="#news">← お知らせ一覧に戻る</a><div class="detail-meta"><span class="tag">${esc(item.category)}</span><time datetime="${item.date.replace(/\./g, '-')}">${item.date}</time></div><h2>お知らせ本文</h2><p>${esc(item.body)}</p><p>青葉高等学校では、受験生・保護者の皆さまに向けて、学校行事や学びの様子を随時お届けしています。ご不明点がありましたら、いつでもお問い合わせください。</p>${cta('お問い合わせ・資料請求', '#contact', 'outline-button')}</article><aside class="detail-aside"><h2>最近のお知らせ</h2>${news.filter(n => n.id !== item.id).slice(0, 4).map(n => `<a href="#news/${n.id}">${esc(n.title)} <span aria-hidden="true">→</span></a>`).join('')}</aside></div></section>`;
  }

  function accessView() {
    return pageHero('access', '学校への道と、よくある質問。', '青葉中央駅から徒歩12分。初めての方にもわかりやすい道順と、よくある質問をまとめました。', 'ACCESS & FAQ') + `<section class="section"><div class="page-wrap two-col"><div><span class="kicker">ACCESS</span><h2 class="serif" style="font-size:34px">青葉高等学校へのアクセス</h2><div class="map-box" role="img" aria-label="青葉中央駅から青葉高等学校までの概略図"><span class="map-river"></span><span class="map-road one"></span><span class="map-road two"></span><span class="map-station">青葉中央駅</span><span class="map-pin">● 青葉高等学校</span></div></div><div class="prose"><h3>電車でお越しの方</h3><p>青葉中央駅・西口から川沿いに進み、緑ヶ丘商店街を抜けて徒歩12分。駅前に案内サインがあります。</p><h3>バスでお越しの方</h3><p>架空市営バス「緑ヶ丘一丁目」下車、徒歩3分です。</p><table class="fact-table"><tbody><tr><th>住所</th><td>〒000-0000<br>架空県青葉市緑ヶ丘1-2-3</td></tr><tr><th>電話</th><td>000-0000-0000（デモ）</td></tr><tr><th>受付</th><td>平日 9:00〜17:00</td></tr></tbody></table></div></div></section><section class="section section-tint"><div class="page-wrap"><div class="section-head"><div><span class="kicker">QUESTIONS</span><h2>よくある質問</h2><p>質問をクリックすると回答が開きます。</p></div></div><div class="faq-list">${faq.map((item, index) => `<div class="faq-item"><button class="faq-question" type="button" data-faq="${index}" aria-expanded="${state.faqOpen === index}" aria-controls="faq-answer-${index}"><span>${index + 1}. ${esc(item[0])}</span><span aria-hidden="true">${state.faqOpen === index ? '−' : '+'}</span></button>${state.faqOpen === index ? `<div class="faq-answer" id="faq-answer-${index}">${esc(item[1])}</div>` : ''}</div>`).join('')}</div></div></section>`;
  }

  function contactView(kind = 'contact') {
    state.form = kind;
    const isReserve = kind === 'reserve';
    const data = isReserve ? state.reserve : state.contact;
    const event = routeParam('event') || data.event || '';
    if (isReserve && event && !data.event) data.event = event;
    const contactType = routeParam('type');
    if (!isReserve && contactType && !data.kind) data.kind = contactType;
    const title = isReserve ? '説明会の予約' : 'お問い合わせ・資料請求';
    const intro = isReserve ? '参加希望日と連絡先を入力してください。これは送信しないローカルデモです。' : '学校生活、入試、説明会などについてお聞かせください。';
    return pageHero(isReserve ? 'admissions' : 'contact', title, intro, isReserve ? 'RESERVATION / DEMO' : 'CONTACT') + `<section class="section"><div class="page-wrap form-layout"><div class="form-panel">${state.phase === 'confirm' ? confirmationView(isReserve, data) : state.phase === 'complete' ? completeView(isReserve) : formView(isReserve, data)}</div><aside class="side-note"><h2>このフォームについて</h2><p>入力内容はブラウザ内だけで確認画面に表示されます。外部送信・データベース保存・メール送信は行いません。</p><p>架空サイトデモのため、実在の個人情報は入力しないでください。</p><a href="#privacy">プライバシーについて ↗</a></aside></div></section>`;
  }

  function formView(isReserve, data) {
    return `<form data-demo-form data-form-kind="${isReserve ? 'reserve' : 'contact'}" novalidate><h2>${isReserve ? '参加内容を入力' : 'お問い合わせフォーム'}</h2><p class="form-note">${isReserve ? 'すべての項目に入力してください。' : '必須項目をご入力ください。'}</p>${isReserve ? `<div class="field"><label for="event">参加する説明会<span class="required">必須</span></label><select id="event" name="event" required><option value="">選択してください</option>${['秋の学校説明会', 'コース体験会', '入試相談会'].map(e => `<option value="${attr(e)}" ${data.event === e ? 'selected' : ''}>${esc(e)}</option>`).join('')}</select><p class="field-error" data-error-for="event"></p></div>` : `<div class="field"><label for="kind">お問い合わせ種別<span class="required">必須</span></label><select id="kind" name="kind" required><option value="">選択してください</option>${['お問い合わせ', '資料請求', '説明会について', '入試について'].map(e => `<option value="${attr(e)}" ${data.kind === e ? 'selected' : ''}>${esc(e)}</option>`).join('')}</select><p class="field-error" data-error-for="kind"></p></div>`}<div class="field"><label for="name">お名前<span class="required">必須</span></label><input id="name" name="name" type="text" value="${attr(data.name || '')}" placeholder="青葉 花子" required><p class="field-error" data-error-for="name"></p></div><div class="field"><label for="email">メールアドレス<span class="required">必須</span></label><input id="email" name="email" type="email" value="${attr(data.email || '')}" placeholder="example@example.jp" required><p class="field-error" data-error-for="email"></p></div>${isReserve ? `<div class="field"><label for="people">参加人数<span class="required">必須</span></label><select id="people" name="people" required><option value="">選択してください</option>${['1名', '2名', '3名', '4名以上'].map(e => `<option value="${e}" ${data.people === e ? 'selected' : ''}>${e}</option>`).join('')}</select><p class="field-error" data-error-for="people"></p></div>` : `<div class="field"><label for="message">お問い合わせ内容<span class="required">必須</span></label><textarea id="message" name="message" rows="5" placeholder="ご質問をご入力ください" required>${attr(data.message || '')}</textarea><p class="field-error" data-error-for="message"></p></div>`}<label class="check-line"><input name="agree" type="checkbox" ${data.agree ? 'checked' : ''} required> <span>デモ利用に関する注意事項を確認しました<span class="required">必須</span></span></label><p class="field-error" data-error-for="agree"></p><div class="form-actions"><button class="primary-button" type="submit">確認画面へ <span aria-hidden="true">→</span></button><a class="outline-button" href="${isReserve ? '#admissions' : '#home'}">戻る</a></div></form>`;
  }

  function confirmationView(isReserve, data) {
    const labels = isReserve ? [['参加する説明会', data.event], ['お名前', data.name], ['メールアドレス', data.email], ['参加人数', data.people]] : [['お問い合わせ種別', data.kind], ['お名前', data.name], ['メールアドレス', data.email], ['お問い合わせ内容', data.message]];
    return `<div class="confirmation"><h3>入力内容をご確認ください</h3><p>この内容でデモ上の完了画面へ進みます。</p><table class="summary-table"><tbody>${labels.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</tbody></table></div><div class="form-actions"><button class="primary-button" type="button" data-form-complete>この内容で完了する ✓</button><button class="outline-button" type="button" data-form-edit>入力画面に戻る</button></div>`;
  }

  function completeView(isReserve) {
    return `<div class="success-mark" aria-hidden="true">✓</div><h2>${isReserve ? '予約デモが完了しました' : 'お問い合わせデモが完了しました'}</h2><p>ご入力ありがとうございました。これは架空サイトのデモのため、実際の予約・送信は行われていません。</p><div class="form-actions"><a class="primary-button" href="${isReserve ? '#admissions' : '#home'}">${isReserve ? '入試・説明会へ戻る' : 'トップへ戻る'} ↗</a><button class="outline-button" type="button" data-form-reset>もう一度試す</button></div>`;
  }

  function staticView(route) {
    const staticData = {
      students: ['在校生の方へ', '毎日の手続きと学校生活の案内です。', '時間割、図書館利用、各種届出は校内ポータルから確認できます。困ったときは担任または生徒支援室へ相談してください。', ['図書館：平日 8:00〜18:00', '保健室：平日 8:30〜17:00', '生徒支援室：予約制']],
      alumni: ['卒業生の方へ', '卒業後も、青葉は皆さんの帰る場所です。', '証明書の発行、同窓会、キャリア講座についてご案内します。各種証明書は事務室へ事前にお問い合わせください。', ['卒業証明書：3営業日', '成績証明書：5営業日', '窓口：平日 9:00〜16:30']],
      privacy: ['プライバシーについて', 'このデモにおける情報の扱いについて', 'このサイトは架空の学校を題材にしたローカルデモです。フォームに入力した内容は外部へ送信されず、サーバーやデータベースにも保存されません。画面を閉じると破棄されます。', ['実在の個人情報を入力しないでください。', '写真の出典はフッターに記載しています。', '掲載している学校名・人物・連絡先は架空です。']],
      sitemap: ['サイトマップ', '青葉高等学校デモの全ページ', '目的のページを選択してください。', []]
    }[route];
    if (!staticData) return notFoundView();
    const [title, lead, body, list] = staticData;
    return pageHero(route === 'sitemap' ? 'about' : 'contact', title, lead, 'INFORMATION') + `<section class="section"><div class="page-wrap two-col"><div class="prose"><h2>${esc(title)}</h2><p>${esc(body)}</p>${list.length ? `<ul>${list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</div>${route === 'sitemap' ? `<div class="sitemap-grid"><section><h2>学校を知る</h2><a href="#about">学校紹介</a><a href="#learning">学び</a><a href="#life">学校生活・施設</a><a href="#clubs">部活動</a></section><section><h2>受験生の方へ</h2><a href="#admissions">入試・説明会</a><a href="#news">お知らせ</a><a href="#contact">お問い合わせ・資料請求</a><a href="guide.html">学校案内を印刷</a></section><section><h2>案内</h2><a href="#access">アクセス・FAQ</a><a href="#students">在校生の方へ</a><a href="#alumni">卒業生の方へ</a><a href="#privacy">プライバシー</a></section></div>` : `<aside class="side-note"><h2>ご案内</h2><p>内容についてのお問い合わせは、専用フォームからお知らせください。</p><a href="#contact">お問い合わせへ ↗</a></aside>`}</div></section>`;
  }

  function searchView(query) {
    const q = query.trim().toLowerCase();
    const records = [
      ...pages.filter(p => p.key !== 'news').map(p => ({ type: 'ページ', title: p.label, text: `${p.title} ${p.text}`, href: `#${p.key}` })),
      ...news.map(n => ({ type: `お知らせ・${n.category}`, title: n.title, text: n.body, href: `#news/${n.id}` })),
      ...clubs.map(c => ({ type: `部活動・${c.type}`, title: c.name, text: `${c.text} ${c.detail}`, href: `#clubs/${c.id}` }))
    ].filter(x => `${x.title} ${x.text}`.toLowerCase().includes(q));
    return pageHero('news', `「${query}」の検索結果`, 'サイト内の見出しと本文から検索しました。', 'SEARCH') + `<section class="section"><div class="page-wrap">${records.length ? `<p class="result-count">${records.length}件見つかりました</p><div class="search-results">${records.map(r => `<a class="result-card" href="${r.href}"><span class="result-type">${esc(r.type)}</span><h2>${esc(r.title)}</h2><p>${esc(r.text.slice(0, 108))}${r.text.length > 108 ? '…' : ''}</p></a>`).join('')}</div>` : `<div class="empty-state"><h2>該当するページがありません</h2><p>別のキーワードでお試しください。例：探究、説明会、図書館</p><a class="outline-button" href="#home">トップへ戻る</a></div>`}</div></section>`;
  }

  function notFoundView() { return pageHero('about', 'ページが見つかりません', 'お探しのページは移動したか、まだ公開されていません。', '404') + `<section class="section"><div class="page-wrap empty-state"><p>URLを確認するか、トップページへお戻りください。</p><a class="primary-button" href="#home">トップへ戻る ↗</a></div></section>`; }

  function render({ focus = true } = {}) {
    const raw = currentHash();
    const route = currentRoute();
    const detailId = raw.split('/')[1]?.split('?')[0] || '';
    let view;
    if (route === 'home') view = homeView();
    else if (route === 'about') view = aboutView();
    else if (route === 'learning') view = learningView();
    else if (route === 'life') view = lifeView();
    else if (route === 'clubs') view = detailId ? clubDetailView(detailId) : clubsView();
    else if (route === 'admissions') view = admissionsView();
    else if (route === 'news') view = detailId ? newsDetailView(detailId) : newsView();
    else if (route === 'access') view = accessView();
    else if (route === 'contact') view = contactView('contact');
    else if (route === 'reserve') view = contactView('reserve');
    else if (route === 'search') view = searchView(routeParam('q'));
    else if (['students', 'alumni', 'privacy', 'sitemap'].includes(route)) view = staticView(route);
    else view = notFoundView();
    main.innerHTML = view;
    const titleLabel = route === 'reserve' ? '説明会の予約' : route === 'search' ? '検索結果' : (detailId && route === 'news' ? (news.find(n => String(n.id) === detailId)?.title || 'お知らせ') : page(route).label);
    document.title = route === 'home' ? '私立 青葉高等学校 | 好きが、未来をひらく。' : `${titleLabel} | 私立 青葉高等学校`;
    document.querySelectorAll('.desktop-nav a').forEach(a => a.removeAttribute('aria-current'));
    const active = document.querySelector(`.desktop-nav a[href="#${route}"]`);
    if (active) active.setAttribute('aria-current', 'page');
    closeMobileMenu();
    if (focus) { main.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'auto' }); }
  }

  function closeMobileMenu() {
    const menu = document.querySelector('[data-mobile-nav]');
    const toggle = document.querySelector('[data-menu-toggle]');
    if (menu) menu.hidden = true;
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'メニューを開く'); }
    document.body.classList.remove('menu-open');
  }
  function toggleMobileMenu() {
    const menu = document.querySelector('[data-mobile-nav]');
    const toggle = document.querySelector('[data-menu-toggle]');
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.classList.toggle('menu-open', open);
  }
  function showToast(text) { toast.textContent = text; toast.classList.add('show'); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2600); }

  function readForm(form) { const data = {}; new FormData(form).forEach((v, k) => { data[k] = v; }); data.agree = form.querySelector('[name="agree"]').checked; return data; }
  function validateForm(form, data, isReserve) {
    const fields = isReserve ? ['event', 'name', 'email', 'people'] : ['kind', 'name', 'email', 'message'];
    const errors = {};
    fields.forEach(f => { if (!String(data[f] || '').trim()) errors[f] = '入力してください。'; });
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'メールアドレスの形式を確認してください。';
    if (!data.agree) errors.agree = '確認のうえ、チェックしてください。';
    form.querySelectorAll('.field-error').forEach(el => { el.textContent = errors[el.dataset.errorFor] || ''; });
    fields.forEach(f => { const el = form.querySelector(`[name="${f}"]`); if (el) el.classList.toggle('input-error', Boolean(errors[f])); });
    const agree = form.querySelector('[name="agree"]'); if (agree) agree.classList.toggle('input-error', Boolean(errors.agree));
    const first = Object.keys(errors)[0]; if (first) form.querySelector(`[name="${first}"]`)?.focus();
    return Object.keys(errors).length === 0;
  }

  document.addEventListener('click', e => {
    const menuToggle = e.target.closest('[data-menu-toggle]');
    if (menuToggle) { toggleMobileMenu(); return; }
    const searchToggle = e.target.closest('[data-search-toggle]');
    if (searchToggle) { const drawer = document.querySelector('[data-search-drawer]'); const open = searchToggle.getAttribute('aria-expanded') !== 'true'; drawer.hidden = !open; searchToggle.setAttribute('aria-expanded', String(open)); if (open) document.querySelector('#site-search')?.focus(); return; }
    const filter = e.target.closest('[data-filter]');
    if (filter) { const group = filter.dataset.filterGroup; location.hash = `#${group}?filter=${encodeURIComponent(filter.dataset.filter)}`; return; }
    const faqButton = e.target.closest('[data-faq]');
    if (faqButton) { state.faqOpen = state.faqOpen === Number(faqButton.dataset.faq) ? -1 : Number(faqButton.dataset.faq); render({ focus: false }); return; }
    const complete = e.target.closest('[data-form-complete]');
    if (complete) { state.phase = 'complete'; render(); showToast('デモの完了画面を表示しました'); return; }
    const edit = e.target.closest('[data-form-edit]');
    if (edit) { state.phase = 'input'; render(); return; }
    const reset = e.target.closest('[data-form-reset]');
    if (reset) { state.phase = 'input'; if (state.form === 'reserve') state.reserve = {}; else state.contact = {}; render(); return; }
    if (e.target.closest('[data-mobile-nav] a')) closeMobileMenu();
  });
  document.addEventListener('submit', e => {
    const form = e.target.closest('[data-demo-form]');
    if (form) { e.preventDefault(); const data = readForm(form); const isReserve = form.dataset.formKind === 'reserve'; if (!validateForm(form, data, isReserve)) { showToast('未入力または形式が正しくない項目があります'); return; } if (isReserve) state.reserve = data; else state.contact = data; state.phase = 'confirm'; render(); return; }
    const search = e.target.closest('[data-search-form]');
    if (search) { e.preventDefault(); const q = new FormData(search).get('q')?.toString().trim() || ''; if (!q) { showToast('検索キーワードを入力してください'); document.querySelector('#site-search')?.focus(); return; } location.hash = `#search?q=${encodeURIComponent(q)}`; document.querySelector('[data-search-drawer]').hidden = true; document.querySelector('[data-search-toggle]').setAttribute('aria-expanded', 'false'); }
  });
  window.addEventListener('hashchange', () => { state.phase = 'input'; render(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMobileMenu(); const drawer = document.querySelector('[data-search-drawer]'); const toggle = document.querySelector('[data-search-toggle]'); if (drawer && !drawer.hidden) { drawer.hidden = true; toggle?.setAttribute('aria-expanded', 'false'); } } });
  window.addEventListener('error', e => { if (e.target?.tagName === 'IMG') e.target.classList.add('image-error'); });
  render({ focus: false });
})();
