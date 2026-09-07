const main = document.querySelector("[data-app-main]");
const primaryNav = document.querySelector("[data-primary-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const searchToggle = document.querySelector("[data-search-toggle]");
const searchPanel = document.querySelector("[data-search-panel]");
const siteSearchForm = document.querySelector("[data-site-search]");
const toast = document.querySelector("[data-toast]");

const images = {
  campus: "../assets/campus.jpg",
  classroom: "../assets/classroom.jpg",
  library: "../assets/library.jpg",
  basketball: "../assets/basketball.jpg",
  students: "../assets/students.jpg",
};

const pageMeta = {
  home: ["トップ", "学校の日常、説明会、最新のお知らせ、学びと学校生活への入口"],
  about: ["学校紹介", "教育理念、校長挨拶、沿革、学校概要、1968年創立"],
  learning: ["学び", "探究コース、総合コース、国際コース、探究授業、進路支援"],
  life: ["学校生活・施設", "1日の流れ、年間行事、図書館、教室、実験室、体育施設"],
  clubs: ["部活動", "運動部、文化部、活動日、活動場所"],
  admissions: ["入試・説明会", "2027年度入試、募集要項、費用、学校説明会、個別相談会"],
  access: ["アクセス・FAQ", "青葉みどり駅から徒歩8分、校内概略図、よくある質問"],
  contact: ["お問い合わせ・資料請求", "学校案内の資料請求、お問い合わせ"],
  students: ["在校生の方へ", "行事予定、各種届出、学習支援、保健室案内"],
  alumni: ["卒業生の方へ", "証明書、同窓会、進路相談、学校への連絡"],
  privacy: ["プライバシー", "個人情報の扱い、フォームデータの扱い"],
  sitemap: ["サイトマップ", "青葉高等学校サイト内のページ一覧"],
};

const newsItems = [
  {
    id: "n1",
    date: "2026.09.07",
    category: "入試",
    title: "第1回 学校説明会の予約受付を開始しました",
    body: "10月17日に開催する学校説明会の予約受付を開始しました。校内見学、学校紹介、在校生トークを予定しています。",
  },
  {
    id: "n2",
    date: "2026.09.03",
    category: "学校生活",
    title: "青葉祭の開催テーマが決まりました",
    body: "今年の青葉祭は『ひらく』をテーマに、各クラス・部活動が展示や発表を準備しています。",
  },
  {
    id: "n3",
    date: "2026.08.28",
    category: "学び",
    title: "2年生の探究中間発表を実施しました",
    body: "地域交通、食品ロス、子どもの居場所など、生徒自身が選んだテーマについて中間発表を行いました。",
  },
  {
    id: "n4",
    date: "2026.08.20",
    category: "部活動",
    title: "吹奏楽部が夏季合同演奏会に参加しました",
    body: "近隣校との合同演奏会で3曲を披露し、最後は参加校全員による合同ステージを行いました。",
  },
  {
    id: "n5",
    date: "2026.08.08",
    category: "入試",
    title: "2027年度 生徒募集要項（デモ）を公開しました",
    body: "推薦入試・一般入試の予定日、募集人数、受験料などを掲載しています。内容は架空のデモ情報です。",
  },
  {
    id: "n6",
    date: "2026.07.24",
    category: "学校生活",
    title: "夏休み期間中の図書館開館日について",
    body: "夏休み期間も指定日に図書館を開館します。自習席とレファレンスカウンターを利用できます。",
  },
  {
    id: "n7",
    date: "2026.07.18",
    category: "学び",
    title: "国際コースでオンライン交流授業を行いました",
    body: "海外の提携校を想定したオンライン交流授業で、英語による学校紹介と小グループ対話を実施しました。",
  },
  {
    id: "n8",
    date: "2026.07.10",
    category: "部活動",
    title: "バスケットボール部 夏季体験会のお知らせ",
    body: "中学生向けの体験会を実施します。基礎練習とミニゲームを予定しています。",
  },
  {
    id: "n9",
    date: "2026.06.30",
    category: "その他",
    title: "ウェブサイトをリニューアルしました",
    body: "受験生・保護者のみなさまが必要な情報へ進みやすいよう、サイト構成と情報の見せ方を見直しました。",
  },
];

const clubs = [
  { id: "basketball", type: "sports", label: "運動部", name: "バスケットボール部", days: "週5日", place: "第1体育館", intro: "判断の速いチームバスケットを目標に、基礎とゲーム形式をバランスよく練習します。", detail: "男女それぞれが活動し、週末は練習試合も行います。初心者向けの基礎メニューも用意し、学年を越えて声を掛け合う文化を大切にしています。" },
  { id: "soccer", type: "sports", label: "運動部", name: "サッカー部", days: "週5日", place: "第1グラウンド", intro: "ボールを動かしながら自分たちで解決策を選べるチームを目指します。", detail: "平日は技術と戦術のトレーニング、土曜は対外試合を中心に活動。分析係を生徒が担当し、試合後の振り返りまで自分たちで行います。" },
  { id: "track", type: "sports", label: "運動部", name: "陸上競技部", days: "週4日", place: "第2グラウンド", intro: "短距離・中長距離・跳躍に分かれ、それぞれの記録更新に向き合います。", detail: "個人競技だからこそ互いの挑戦を支えることを重視しています。動画によるフォーム確認や目標記録の設定も生徒主体で行います。" },
  { id: "tennis", type: "sports", label: "運動部", name: "テニス部", days: "週4日", place: "テニスコート", intro: "基本ストロークから試合運びまで、段階的に力を伸ばします。", detail: "硬式テニスで活動。経験者と初心者で練習を分ける時間を設け、基礎を身につけながら校内戦や地区大会を目指します。" },
  { id: "brass", type: "culture", label: "文化部", name: "吹奏楽部", days: "週5日", place: "音楽室", intro: "定期演奏会と学校行事を中心に、聴く人へ届く音づくりを目指します。", detail: "パート練習と合奏を組み合わせ、曲の背景や表現まで話し合います。青葉祭では中庭コンサートを開くのが恒例です。" },
  { id: "science", type: "culture", label: "文化部", name: "科学部", days: "週3日", place: "理科実験室", intro: "身近な疑問から実験テーマを決め、記録と発表まで行います。", detail: "水質調査、植物観察、電子工作などテーマは多様です。文化祭では来場者が参加できる実験展示を企画します。" },
  { id: "art", type: "culture", label: "文化部", name: "美術部", days: "週3日", place: "美術室", intro: "絵画・立体・デジタル表現を行き来しながら、自分のテーマを探します。", detail: "個人制作に加え、行事ポスターや校内展示の共同制作も担当。作品講評では技法だけでなく『何を伝えたいか』を言葉にします。" },
  { id: "media", type: "culture", label: "文化部", name: "放送メディア部", days: "週3日", place: "メディア室", intro: "校内放送、映像制作、学校行事の記録を担当します。", detail: "企画、取材、撮影、編集までを分担して制作します。学校紹介動画や生徒インタビューなど、学校の出来事を残す活動も行います。" },
  { id: "tea", type: "culture", label: "文化部", name: "茶道部", days: "週2日", place: "和室", intro: "季節のしつらえと所作を学び、落ち着いて相手を迎える時間をつくります。", detail: "外部講師の指導日を設け、基本の所作から学びます。青葉祭では在校生が案内役となる体験茶会を開きます。" },
];

const events = [
  { id: "open1", date: "2026-10-17", display: "10.17", dow: "土", title: "第1回 学校説明会", text: "学校紹介・校内見学・在校生トーク。初めての方におすすめです。" },
  { id: "open2", date: "2026-11-14", display: "11.14", dow: "土", title: "授業・部活動体験会", text: "ミニ授業と部活動体験から、青葉の普段の学びを知るプログラムです。" },
  { id: "open3", date: "2026-12-05", display: "12.05", dow: "土", title: "入試直前 個別相談会", text: "2027年度入試の流れやコース選びについて個別に相談できます。" },
];

const state = {
  clubFilter: "all",
  newsFilter: "all",
  openClub: null,
  reservationStep: "edit",
  reservation: {},
  contactStep: "edit",
  contact: {},
  toastTimer: null,
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getRoute() {
  const raw = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
  const value = raw || "/home";
  const [pathPart, queryPart = ""] = value.split("?");
  return {
    path: pathPart.startsWith("/") ? pathPart : `/${pathPart}`,
    query: new URLSearchParams(queryPart),
  };
}

function pageHero(title, eyebrow, description, image, current) {
  return `
    <section class="page-hero">
      <div class="shell">
        <nav class="breadcrumb" aria-label="パンくずリスト"><a href="#/home">トップ</a><span aria-hidden="true">/</span><span>${escapeHtml(current || title)}</span></nav>
        <div class="page-hero-grid">
          <div>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h1 class="page-title">${escapeHtml(title)}</h1>
            <p class="lead">${escapeHtml(description)}</p>
          </div>
          ${image ? `<img class="page-hero-image" src="${image}" alt="" />` : ""}
        </div>
      </div>
    </section>`;
}

function renderNewsRows(items) {
  return items.map((item) => `
    <div class="news-item">
      <time datetime="${item.date.replaceAll(".", "-")}">${item.date}</time>
      <span class="tag">${item.category}</span>
      <a href="#/news/${item.id}">${item.title}</a>
      <span class="arrow" aria-hidden="true">→</span>
    </div>`).join("");
}

function homePage() {
  return `
    <section class="hero">
      <div class="hero-media" aria-hidden="true"></div>
      <div class="shell hero-inner">
        <div class="hero-copy">
          <p class="eyebrow">AOBA HIGH SCHOOL / SINCE 1968</p>
          <h1 class="display">好きが、<br />未来をひらく。</h1>
          <p>興味を問いに変え、仲間と試し、社会へつなげる。青葉高校は、一人ひとりの「もっと知りたい」から始まる学校です。</p>
        </div>
        <aside class="hero-note" aria-label="直近の説明会情報">
          <span>OPEN SCHOOL / 01</span>
          <strong>10月17日（土）<br />第1回 学校説明会</strong>
          <a href="#/reserve?event=open1">予約する →</a>
        </aside>
      </div>
    </section>

    <div class="important-strip">
      <div class="shell important-inner">
        <span class="important-label">IMPORTANT</span>
        <p>2027年度 生徒募集要項（デモ）を公開しました</p>
        <a class="text-link" href="#/admissions">詳しく見る</a>
      </div>
    </div>

    <section class="section">
      <div class="shell split-feature">
        <div class="feature-media"><img src="${images.classroom}" alt="教室で学ぶ生徒たちのイメージ" /></div>
        <div class="feature-copy">
          <p class="eyebrow">LEARNING</p>
          <h2 class="section-title">正解より先に、<br />自分の問いを持つ。</h2>
          <p>探究・総合・国際の3コース。共通するのは、知識を受け取るだけで終わらず、自分で考えて確かめることです。地域や企業とつながる探究授業も、日々の教科学習から始まります。</p>
          <div class="button-row"><a class="button" href="#/learning">青葉の学びを見る <span aria-hidden="true">→</span></a></div>
        </div>
      </div>
    </section>

    <section class="section soft">
      <div class="shell split-feature reverse">
        <div class="feature-media"><img src="${images.students}" alt="校内で会話する生徒たちのイメージ" /></div>
        <div class="feature-copy">
          <p class="eyebrow">SCHOOL LIFE</p>
          <h2 class="section-title">やってみたいが、<br />日常の中にある。</h2>
          <p>朝のホームルームから放課後の部活動まで、生徒が選び、相談し、動く場面を増やしています。青葉祭やスポーツデイなどの学校行事も、企画段階から生徒が参加します。</p>
          <div class="button-row">
            <a class="button" href="#/life">学校生活・施設 <span aria-hidden="true">→</span></a>
            <a class="button-secondary" href="#/clubs">部活動を見る</a>
          </div>
        </div>
      </div>
    </section>

    <div class="shell stats-band" aria-label="学校概要">
      <div class="stat"><strong>1968</strong><span>創立年</span></div>
      <div class="stat"><strong>6 × 3</strong><span>各学年6クラス・3学年</span></div>
      <div class="stat"><strong>3</strong><span>探究・総合・国際コース</span></div>
      <div class="stat"><strong>8 min</strong><span>青葉みどり駅から徒歩（架空）</span></div>
    </div>

    <section class="section green">
      <div class="shell">
        <div class="section-head">
          <div><p class="eyebrow">OPEN SCHOOL 2026</p><h2 class="section-title">青葉を、見に来る。</h2></div>
          <p class="lead">校舎の空気、生徒と先生の距離、授業の進み方。ウェブだけでは伝わりにくい日常を、実際に歩いて確かめてください。</p>
        </div>
        <div class="event-grid">
          ${events.map((event) => `
            <article class="event-card">
              <div class="date"><strong>${event.display}</strong><span>(${event.dow})</span></div>
              <h3>${event.title}</h3><p>${event.text}</p>
              <a class="button-light" href="#/reserve?event=${event.id}">予約へ進む →</a>
            </article>`).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="shell">
        <div class="section-head">
          <div><p class="eyebrow">NEWS</p><h2 class="section-title">青葉のいま。</h2></div>
          <a class="text-link" href="#/news">お知らせ一覧へ</a>
        </div>
        <div class="news-list">${renderNewsRows(newsItems.slice(0, 5))}</div>
      </div>
    </section>`;
}

function aboutPage() {
  return `
    ${pageHero("学校紹介", "ABOUT AOBA", "生徒の興味を、未来を選ぶ力へ。1968年から続く青葉高校の考え方と歩みをご紹介します。", images.campus)}
    <section class="section">
      <div class="shell">
        <div class="quote-block">
          <p class="eyebrow">EDUCATIONAL PHILOSOPHY</p>
          <h2 class="quote-title">自分で見つけた問いは、<br />人を遠くまで連れていく。</h2>
          <p>私たちは、知識の量だけで高校3年間を測りません。何に心が動いたか、なぜそう思ったか、次に何を試すか。その小さな選択の積み重ねが、卒業後も自分で学び続ける力になると考えています。</p>
        </div>
      </div>
    </section>

    <section class="section soft">
      <div class="shell split-feature">
        <div class="feature-media"><img src="${images.library}" alt="図書館で学ぶ生徒のイメージ" /></div>
        <div class="feature-copy">
          <p class="eyebrow">MESSAGE</p>
          <h2 class="section-title">学校は、試していい場所です。</h2>
          <p>「好き」は、最初から進路の名前を持っているとは限りません。本を読む、友だちに話す、実験する、街へ出る。青葉では、そうした試行錯誤を学びとして支えます。先生の役割は答えを先に渡すことではなく、生徒が次の一歩を選べる材料を増やすことです。</p>
          <p class="meta">校長　青木 颯（架空）</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="shell">
        <div class="section-head"><div><p class="eyebrow">HISTORY</p><h2 class="section-title">青葉の歩み</h2></div></div>
        <div class="timeline">
          <div class="timeline-row"><strong>1968</strong><p>青葉高等学校 開校。地域に根ざした普通科教育を開始。</p></div>
          <div class="timeline-row"><strong>1987</strong><p>図書館棟と理科実験棟を増築。探究的な課外活動の基盤を整備。</p></div>
          <div class="timeline-row"><strong>2006</strong><p>国際交流プログラムを開始。校内での英語プレゼンテーション授業を拡充。</p></div>
          <div class="timeline-row"><strong>2018</strong><p>創立50周年。地域連携型の探究授業「AOBA PROJECT」を開始。</p></div>
          <div class="timeline-row"><strong>2024</strong><p>探究・総合・国際の3コース制へ。進路支援と選択科目を再編。</p></div>
        </div>
      </div>
    </section>

    <section class="section compact soft">
      <div class="shell">
        <p class="eyebrow">SCHOOL PROFILE</p><h2 class="section-title">学校概要</h2>
        <table class="info-table">
          <tbody>
            <tr><th>学校名</th><td>私立 青葉高等学校 / AOBA HIGH SCHOOL</td></tr>
            <tr><th>創立</th><td>1968年</td></tr>
            <tr><th>課程</th><td>全日制 普通科・男女共学</td></tr>
            <tr><th>学級編成</th><td>各学年6クラス（探究・総合・国際の3コース）</td></tr>
            <tr><th>所在地</th><td>青葉市みどり野2-18（架空）</td></tr>
            <tr><th>校章</th><td>若葉がひらく姿をモチーフにした「A」のシンボル（架空）</td></tr>
          </tbody>
        </table>
      </div>
    </section>`;
}

function learningPage() {
  return `
    ${pageHero("学び", "LEARNING", "3つのコースで入口は分かれても、共通するのは『自分の問いを育てる』学び方です。", images.classroom)}
    <section class="section">
      <div class="shell">
        <div class="section-head"><div><p class="eyebrow">THREE COURSES</p><h2 class="section-title">興味から選べる、3つの学び。</h2></div><p class="lead">1年次からコースの特色を活かしながら、共通教科で基礎を固めます。2・3年次は選択科目を増やし、進路に合わせて深めます。</p></div>
        <div class="course-grid">
          <article class="course"><span class="course-number">COURSE 01</span><h3>探究コース</h3><p>地域や企業とつながる課題研究を軸に、情報を集め、仮説を立て、検証して伝える力を育てます。</p><ul><li>週2時間のAOBA PROJECT</li><li>フィールドワーク</li><li>外部メンターとの発表会</li></ul></article>
          <article class="course"><span class="course-number">COURSE 02</span><h3>総合コース</h3><p>幅広い進路に対応する科目選択と基礎学力の定着を両立。一人ひとりの得意を見つけます。</p><ul><li>少人数習熟度授業</li><li>2年次から豊富な選択科目</li><li>週1回の進路ワーク</li></ul></article>
          <article class="course"><span class="course-number">COURSE 03</span><h3>国際コース</h3><p>英語を『学ぶ対象』から『使う道具』へ。多文化理解と発信を重ね、国内外の進学を視野に入れます。</p><ul><li>英語プレゼンテーション</li><li>オンライン国際交流</li><li>海外研修（希望制・架空）</li></ul></article>
        </div>
      </div>
    </section>

    <section class="section soft">
      <div class="shell">
        <div class="section-head"><div><p class="eyebrow">AOBA PROJECT</p><h2 class="section-title">問いを、教室の外へ。</h2></div></div>
        <div class="feature-grid">
          <article class="feature-box"><p class="eyebrow">01 / FIND</p><h3>気になることを見つける</h3><p>ニュース、地域観察、読書、日常の違和感から「なぜ？」を集めます。テーマ設定を急がず、問いの種を増やします。</p></article>
          <article class="feature-box"><p class="eyebrow">02 / RESEARCH</p><h3>調べ方を選ぶ</h3><p>文献、インタビュー、アンケート、実験など、問いに合う方法を考えます。情報の出典と確かさも確認します。</p></article>
          <article class="feature-box"><p class="eyebrow">03 / TRY</p><h3>小さく試す</h3><p>仮説を形にし、結果から問いを修正します。失敗も記録し、なぜそうなったかを次の判断材料にします。</p></article>
          <article class="feature-box"><p class="eyebrow">04 / SHARE</p><h3>人に伝えて更新する</h3><p>校内外の発表会で他者の視点を受け取り、自分の考えを更新します。成果だけでなく過程も説明します。</p></article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="shell career-grid">
        <div>
          <p class="eyebrow">CAREER SUPPORT</p><h2 class="section-title">進路は、3年生になってから考えない。</h2>
          <p class="lead">1年次は自分の興味と言葉を増やし、2年次は学問・仕事との接点を知り、3年次は受験方法と学びたい内容を具体化します。担任・進路担当・教科担当が情報を共有して支援します。</p>
          <div class="button-row spacer-top"><a class="button-secondary" href="#/contact?type=inquiry">進路支援について問い合わせる</a></div>
        </div>
        <div>
          <p class="eyebrow">2025 GRADUATES / FICTIONAL DATA</p>
          <div class="career-bars" aria-label="2025年度卒業生の進路データ（架空）">
            <div class="bar-row"><span>4年制大学</span><div class="bar-track"><div class="bar-fill" style="width:68%"></div></div><strong>68%</strong></div>
            <div class="bar-row"><span>短大・専門</span><div class="bar-track"><div class="bar-fill" style="width:18%"></div></div><strong>18%</strong></div>
            <div class="bar-row"><span>就職</span><div class="bar-track"><div class="bar-fill" style="width:7%"></div></div><strong>7%</strong></div>
            <div class="bar-row"><span>その他</span><div class="bar-track"><div class="bar-fill" style="width:7%"></div></div><strong>7%</strong></div>
          </div>
          <p class="meta spacer-top">※ UI検証用の架空データです。</p>
        </div>
      </div>
    </section>`;
}

function lifePage() {
  const facilities = [
    ["図書館", images.library, "約3万冊の蔵書と自習席。探究相談ができるレファレンスカウンターもあります。"],
    ["普通教室", images.classroom, "可動式机と大型モニターを備え、個人学習からグループワークまで切り替えます。"],
    ["理科実験室", images.classroom, "物理・化学・生物の実験に対応。探究活動では放課後の利用時間も設けています。"],
    ["第1体育館", images.basketball, "バスケットボール2面相当。体育授業、部活動、学校行事で使用します。"],
    ["メディア室", images.students, "映像編集とプレゼンテーション制作に使う共同スペースです。"],
    ["中庭・テラス", images.campus, "昼休みや放課後に生徒が集まる、校舎中央の緑の多い場所です。"],
  ];
  return `
    ${pageHero("学校生活・施設", "SCHOOL LIFE", "授業、昼休み、行事、部活動。青葉の一日は、人と関わりながら自分で選ぶ時間でできています。", images.students)}
    <section class="section">
      <div class="shell">
        <div class="section-head"><div><p class="eyebrow">A DAY AT AOBA</p><h2 class="section-title">青葉高校の1日</h2></div><p class="lead">50分授業を基本に、昼休みはゆったり50分。放課後は部活動、委員会、自習、探究活動など、それぞれの時間が始まります。</p></div>
        <div class="day-flow">
          <article class="day-step"><time>8:25</time><h3>登校</h3><p>8:35までに教室へ。朝読書や友人との会話から一日が始まります。</p></article>
          <article class="day-step"><time>8:40</time><h3>SHR</h3><p>連絡事項と今日の予定を確認します。</p></article>
          <article class="day-step"><time>8:50</time><h3>午前授業</h3><p>1〜4時限。実験やグループワークの日もあります。</p></article>
          <article class="day-step"><time>12:40</time><h3>昼休み</h3><p>教室、食堂、中庭、図書館など好きな場所で過ごします。</p></article>
          <article class="day-step"><time>13:30</time><h3>午後授業</h3><p>5〜6時限。曜日によって探究授業や選択科目を実施。</p></article>
          <article class="day-step"><time>15:35</time><h3>放課後</h3><p>部活動、自習、委員会、探究ミーティングへ。</p></article>
        </div>
      </div>
    </section>

    <section class="section soft">
      <div class="shell">
        <div class="section-head"><div><p class="eyebrow">YEAR AT AOBA</p><h2 class="section-title">年間行事</h2></div></div>
        <div class="calendar-grid">
          <div class="month-block"><strong>4</strong><p>入学式 / オリエンテーション / 部活動紹介</p></div>
          <div class="month-block"><strong>5</strong><p>校外探究デイ / 1学期中間考査</p></div>
          <div class="month-block"><strong>6</strong><p>スポーツデイ / 生徒総会</p></div>
          <div class="month-block"><strong>7</strong><p>1学期期末考査 / 夏季講習</p></div>
          <div class="month-block"><strong>8</strong><p>希望者研修 / 部活動合宿</p></div>
          <div class="month-block"><strong>9</strong><p>青葉祭 / 探究中間発表</p></div>
          <div class="month-block"><strong>10</strong><p>芸術鑑賞 / 学校説明会</p></div>
          <div class="month-block"><strong>11</strong><p>コース横断プレゼンテーション</p></div>
          <div class="month-block"><strong>12</strong><p>2学期期末考査 / 冬季講習</p></div>
          <div class="month-block"><strong>1</strong><p>探究最終発表 / 百人一首大会</p></div>
          <div class="month-block"><strong>2</strong><p>マラソン大会 / 学年末考査</p></div>
          <div class="month-block"><strong>3</strong><p>卒業式 / 修了式 / 進路ガイダンス</p></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="shell">
        <div class="section-head"><div><p class="eyebrow">FACILITIES</p><h2 class="section-title">学びを支える場所</h2></div><p class="lead">校舎は架空の設定です。用途ごとに場所の性格が分かるよう、学習・運動・交流の空間を紹介します。</p></div>
        <div class="facility-grid">
          ${facilities.map(([name, image, text]) => `<article class="facility"><img src="${image}" alt="${name}のイメージ" /><h3>${name}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>`;
}

function clubsPage() {
  const visible = state.clubFilter === "all" ? clubs : clubs.filter((club) => club.type === state.clubFilter);
  return `
    ${pageHero("部活動", "CLUB ACTIVITIES", "放課後に夢中になれる場所。運動部と文化部が、それぞれの目標に向かって活動しています。", images.basketball)}
    <section class="section">
      <div class="shell">
        <div class="section-head"><div><p class="eyebrow">CLUB LIST</p><h2 class="section-title">部活動一覧</h2></div><p class="lead">分類で絞り込み、各部の活動日・場所・活動内容を確認できます。</p></div>
        <div class="filters" role="group" aria-label="部活動の分類フィルター">
          <button class="filter-button" type="button" data-club-filter="all" aria-pressed="${state.clubFilter === "all"}">すべて</button>
          <button class="filter-button" type="button" data-club-filter="sports" aria-pressed="${state.clubFilter === "sports"}">運動部</button>
          <button class="filter-button" type="button" data-club-filter="culture" aria-pressed="${state.clubFilter === "culture"}">文化部</button>
        </div>
        <p class="meta" aria-live="polite">${visible.length}件を表示しています</p>
        <div class="club-list">
          ${visible.map((club) => `
            <article class="club-item">
              <div class="club-type"><span aria-hidden="true"></span><span>${club.label}</span></div>
              <div>
                <h3>${club.name}</h3><p>${club.intro}</p>
                ${state.openClub === club.id ? `<div class="detail-panel" id="club-detail-${club.id}"><h4>${club.name}について</h4><p>${club.detail}</p></div>` : ""}
              </div>
              <div class="club-meta"><span>活動日：${club.days}</span><span>場所：${club.place}</span><button class="back-link" type="button" data-club-detail="${club.id}" aria-expanded="${state.openClub === club.id}" aria-controls="club-detail-${club.id}">${state.openClub === club.id ? "閉じる" : "詳しく見る"}</button></div>
            </article>`).join("")}
        </div>
      </div>
    </section>`;
}

function admissionsPage() {
  return `
    ${pageHero("入試・説明会", "ADMISSIONS", "2027年度入試（デモ）の概要と、青葉高校を実際に知るための説明会日程をご案内します。", images.campus)}
    <section class="section">
      <div class="shell">
        <div class="admission-summary">
          <div>
            <p class="eyebrow">ADMISSIONS 2027</p><h2 class="section-title">2027年度 生徒募集要項</h2>
            <p class="lead">以下はUI検証用の架空情報です。実在の入試日程・制度ではありません。</p>
          </div>
          <div class="notice-box"><h3>募集人数</h3><p>普通科 男女216名<br />探究・総合・国際の3コース</p></div>
        </div>
        <table class="info-table">
          <tbody>
            <tr><th>推薦入試</th><td>出願：2027年1月14日（木）〜18日（月）<br />試験：2027年1月22日（金） / 面接・作文</td></tr>
            <tr><th>一般入試</th><td>出願：2027年1月25日（月）〜29日（金）<br />試験：2027年2月10日（水） / 国語・数学・英語・面接</td></tr>
            <tr><th>合格発表</th><td>推薦：1月23日（土） / 一般：2月12日（金）</td></tr>
            <tr><th>出願方法</th><td>ウェブ出願を想定したデモ設定。実際の出願機能はありません。</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="section soft">
      <div class="shell">
        <div class="section-head"><div><p class="eyebrow">FEES / FICTIONAL</p><h2 class="section-title">学費・費用（架空）</h2></div></div>
        <table class="fee-table">
          <thead><tr><th>項目</th><th>初年度</th><th>2年次以降</th></tr></thead>
          <tbody>
            <tr><td>入学金</td><td>220,000円</td><td>—</td></tr>
            <tr><td>授業料</td><td>456,000円</td><td>456,000円</td></tr>
            <tr><td>施設設備費</td><td>120,000円</td><td>120,000円</td></tr>
            <tr><td>教育活動費</td><td>72,000円</td><td>72,000円</td></tr>
            <tr><td>受験料</td><td>22,000円</td><td>—</td></tr>
          </tbody>
        </table>
        <p class="meta spacer-top">※ 金額はすべて架空です。就学支援金等の実制度を説明するものではありません。</p>
      </div>
    </section>

    <section class="section">
      <div class="shell">
        <div class="section-head"><div><p class="eyebrow">OPEN SCHOOL</p><h2 class="section-title">説明会・体験会</h2></div><p class="lead">各回は同じデモ予約フォームにつながります。予約情報は外部送信・永続保存しません。</p></div>
        <div class="event-list-light">
          ${events.map((event) => `<article class="event-row"><div class="event-date">${event.display} <small>(${event.dow})</small></div><div><h3>${event.title}</h3><p>${event.text}</p></div><a class="button" href="#/reserve?event=${event.id}">予約する</a></article>`).join("")}
        </div>
        <div class="button-row spacer-top"><a class="button-secondary" href="./school-guide.html" target="_blank" rel="noreferrer">学校案内（印刷版）を開く</a><a class="button-secondary" href="#/contact?type=materials">資料請求はこちら</a></div>
      </div>
    </section>`;
}

function newsPage() {
  const categories = ["all", ...new Set(newsItems.map((item) => item.category))];
  const visible = state.newsFilter === "all" ? newsItems : newsItems.filter((item) => item.category === state.newsFilter);
  return `
    ${pageHero("お知らせ", "NEWS", "学校生活、学び、部活動、入試に関する青葉高校からのお知らせです。", images.students)}
    <section class="section">
      <div class="shell">
        <div class="filters" role="group" aria-label="お知らせの分類フィルター">
          ${categories.map((category) => `<button class="filter-button" type="button" data-news-filter="${category}" aria-pressed="${state.newsFilter === category}">${category === "all" ? "すべて" : category}</button>`).join("")}
        </div>
        <p class="meta" aria-live="polite">${visible.length}件を表示しています</p>
        <div class="news-list">${renderNewsRows(visible)}</div>
      </div>
    </section>`;
}

function newsDetailPage(id) {
  const item = newsItems.find((news) => news.id === id);
  if (!item) return notFoundPage();
  return `
    <section class="page-hero">
      <div class="shell article-header">
        <nav class="breadcrumb" aria-label="パンくずリスト"><a href="#/home">トップ</a><span aria-hidden="true">/</span><a href="#/news">お知らせ</a><span aria-hidden="true">/</span><span>記事詳細</span></nav>
        <p class="eyebrow">NEWS / ${item.category}</p>
        <h1 class="page-title">${item.title}</h1>
        <p class="meta spacer-top">${item.date}　<span class="tag">${item.category}</span></p>
      </div>
    </section>
    <article class="section">
      <div class="shell article-body">
        <p>${item.body}</p>
        <h2>青葉高校からのお知らせ</h2>
        <p>このページは架空の高校サイトにおける記事詳細のデモです。掲載している学校名、日付、イベント内容、実績等はすべて架空で、実在の学校・団体とは関係ありません。</p>
        <p>内容について確認したい場合は、デモのお問い合わせフォームから入力・確認フローを試すことができます。外部への送信は行われません。</p>
        <button class="back-link" type="button" data-history-back>← お知らせ一覧へ戻る</button>
      </div>
    </article>`;
}

function accessPage() {
  const faqs = [
    ["最寄り駅から学校まではどのくらいかかりますか？", "架空の『青葉みどり駅』東口から徒歩約8分という設定です。駅前通りを北へ進み、みどり野公園の角を左折すると正門があります。"],
    ["自転車で通学できますか？", "校内駐輪場を利用する想定です。入学後に通学経路を届け出て、学校の定める安全ルールを確認します。"],
    ["食堂や購買はありますか？", "食堂と小さな購買コーナーがある設定です。弁当の持参もできます。"],
    ["説明会に保護者だけで参加できますか？", "はい。デモ上は受験生のみ、保護者のみ、家族での参加を想定しています。予約フォームで参加人数を選択できます。"],
    ["3つのコースはいつ選びますか？", "出願時に希望コースを選ぶ想定です。入学後も学年進行時の相談機会を設ける架空設定です。"],
    ["部活動は必ず入部しますか？", "加入は任意という設定です。部活動以外に委員会、探究活動、自習などを選ぶ生徒もいます。"],
    ["学校案内を紙で確認できますか？", "このデモでは印刷用の学校案内ページを用意しています。入試・説明会ページから開いてブラウザの印刷機能を利用できます。"],
  ];
  return `
    ${pageHero("アクセス・FAQ", "ACCESS / FAQ", "駅から学校までの想定ルート、校内の概略図、よくある質問をまとめています。", images.campus)}
    <section class="section">
      <div class="shell access-grid">
        <div>
          <p class="eyebrow">ACCESS</p><h2 class="section-title">青葉みどり駅から徒歩8分。</h2>
          <p class="lead">住所・駅名はすべて架空です。実在の場所への案内ではありません。</p>
          <ul class="route-list">
            <li><strong>1. 東口を出る</strong>青葉みどり駅の東口を出て、駅前通りを北へ進みます。</li>
            <li><strong>2. みどり野公園を左へ</strong>公園の角を左折し、緑道沿いを約300m進みます。</li>
            <li><strong>3. 正門へ</strong>右手の並木道の先に青葉高校の正門が見えます。</li>
          </ul>
        </div>
        <div class="campus-map" role="img" aria-label="青葉みどり駅、青葉高校、体育館、グラウンドの位置関係を示す架空の概略図">
          <div class="map-road" aria-hidden="true"></div>
          <div class="map-campus">青葉高校<br />校舎</div>
          <div class="map-station">青葉みどり駅</div>
          <div class="map-gym">体育館</div>
          <div class="map-field">グラウンド</div>
        </div>
      </div>
    </section>
    <section class="section soft">
      <div class="shell">
        <div class="section-head"><div><p class="eyebrow">FAQ</p><h2 class="section-title">よくある質問</h2></div><p class="lead">質問を選ぶと回答が開きます。キーボードでも操作できます。</p></div>
        <div class="faq-list">${faqs.map(([q, a]) => `<details><summary>${q}</summary><div class="faq-answer">${a}</div></details>`).join("")}</div>
      </div>
    </section>`;
}

function searchPage(query) {
  const q = query.trim().toLocaleLowerCase("ja");
  const base = Object.entries(pageMeta).map(([id, [title, body]]) => ({ type: "ページ", title, body, href: `#/${id}` }));
  const news = newsItems.map((item) => ({ type: `お知らせ / ${item.category}`, title: item.title, body: item.body, href: `#/news/${item.id}` }));
  const clubDocs = clubs.map((club) => ({ type: `部活動 / ${club.label}`, title: club.name, body: `${club.intro} ${club.detail} 活動日 ${club.days} 活動場所 ${club.place}`, href: "#/clubs" }));
  const docs = [...base, ...news, ...clubDocs];
  const results = q ? docs.filter((doc) => `${doc.title} ${doc.body}`.toLocaleLowerCase("ja").includes(q)) : [];
  return `
    ${pageHero("サイト内検索", "SEARCH", "ページ、お知らせ、部活動のタイトルと本文から検索します。", null)}
    <section class="section">
      <div class="shell">
        <form class="search-form" data-result-search>
          <label for="result-search-input">検索キーワード</label>
          <div class="search-row"><input id="result-search-input" name="q" type="search" value="${escapeHtml(query)}" placeholder="例：探究、説明会、図書館" /><button type="submit">検索</button></div>
        </form>
        ${q ? `<p class="search-summary">「<strong>${escapeHtml(query)}</strong>」の検索結果：${results.length}件</p>` : `<p class="search-summary">キーワードを入力してください。</p>`}
        ${results.length ? `<div class="search-results">${results.map((result) => `<article class="search-result"><span class="tag">${escapeHtml(result.type)}</span><h3><a class="simple-link" href="${result.href}">${escapeHtml(result.title)}</a></h3><p>${escapeHtml(result.body)}</p></article>`).join("")}</div>` : q ? `<div class="empty-state"><h3>該当する情報が見つかりませんでした</h3><p>言葉を短くするか、「入試」「学び」「部活動」など別のキーワードをお試しください。</p></div>` : ""}
      </div>
    </section>`;
}

function reservationPage(query) {
  const requested = query.get("event");
  if (requested && events.some((event) => event.id === requested) && !state.reservation.event) state.reservation.event = requested;
  if (state.reservationStep === "complete") {
    return `${pageHero("説明会予約", "OPEN SCHOOL RESERVATION", "予約デモが完了しました。入力内容は外部送信・永続保存されていません。", null)}<section class="section"><div class="shell form-wrap"><div class="complete-mark" aria-hidden="true">✓</div><h2 class="section-title">予約デモが完了しました</h2><p class="lead">ご利用ありがとうございました。この画面はUI検証用で、実際の予約は成立していません。</p><div class="button-row spacer-top"><a class="button" href="#/admissions">入試・説明会へ戻る</a><button class="button-secondary" type="button" data-reservation-reset>別の日程を試す</button></div></div></section>`;
  }
  if (state.reservationStep === "confirm") {
    const event = events.find((item) => item.id === state.reservation.event);
    return `${pageHero("説明会予約・確認", "CONFIRM", "内容をご確認ください。確定ボタンを押しても外部送信は行いません。", null)}<section class="section"><div class="shell form-wrap"><h2 class="section-title">入力内容の確認</h2><table class="confirm-table"><tbody><tr><th>参加日程</th><td>${escapeHtml(event?.title || "")} / ${escapeHtml(event?.display || "")}</td></tr><tr><th>氏名</th><td>${escapeHtml(state.reservation.name)}</td></tr><tr><th>メール</th><td>${escapeHtml(state.reservation.email)}</td></tr><tr><th>参加人数</th><td>${escapeHtml(state.reservation.people)}名</td></tr><tr><th>同意</th><td>デモ利用上の注意事項に同意済み</td></tr></tbody></table><div class="button-row"><button class="button-secondary" type="button" data-reservation-back>戻って修正</button><button class="button" type="button" data-reservation-complete>予約を確定（デモ）</button></div></div></section>`;
  }
  const data = state.reservation;
  return `
    ${pageHero("説明会予約", "OPEN SCHOOL RESERVATION", "参加日程と連絡先を入力し、確認画面へ進みます。個人情報は保存されません。", null)}
    <section class="section"><div class="shell form-wrap">
      <div class="notice-box"><h3>デモフォームです</h3><p>入力内容はこのブラウザ画面の確認にのみ使用し、外部送信・永続保存しません。</p></div>
      <form class="form-section" data-reservation-form novalidate>
        <div class="field"><label for="reserve-event">参加日程<span class="required">必須</span></label><select id="reserve-event" name="event" required aria-describedby="reserve-event-error"><option value="">選択してください</option>${events.map((event) => `<option value="${event.id}" ${data.event === event.id ? "selected" : ""}>${event.display} (${event.dow}) ${event.title}</option>`).join("")}</select><p class="field-error" id="reserve-event-error" data-error-for="event"></p></div>
        <div class="field-grid">
          <div class="field"><label for="reserve-name">氏名<span class="required">必須</span></label><input id="reserve-name" name="name" type="text" autocomplete="name" value="${escapeHtml(data.name || "")}" aria-describedby="reserve-name-error" /><p class="field-error" id="reserve-name-error" data-error-for="name"></p></div>
          <div class="field"><label for="reserve-email">メールアドレス<span class="required">必須</span></label><input id="reserve-email" name="email" type="email" autocomplete="email" value="${escapeHtml(data.email || "")}" aria-describedby="reserve-email-error" /><p class="field-error" id="reserve-email-error" data-error-for="email"></p></div>
          <div class="field"><label for="reserve-people">参加人数<span class="required">必須</span></label><select id="reserve-people" name="people" aria-describedby="reserve-people-error"><option value="">選択してください</option>${[1,2,3,4].map((num) => `<option value="${num}" ${String(data.people) === String(num) ? "selected" : ""}>${num}名</option>`).join("")}</select><p class="field-error" id="reserve-people-error" data-error-for="people"></p></div>
        </div>
        <label class="checkbox-row" for="reserve-consent"><input id="reserve-consent" name="consent" type="checkbox" ${data.consent ? "checked" : ""} /><span>このフォームが架空サイトのデモであり、入力内容が外部送信されないことを確認しました。<span class="required">必須</span></span></label><p class="field-error" data-error-for="consent"></p>
        <button class="button" type="submit">確認画面へ進む</button>
      </form>
    </div></section>`;
}

function contactPage(query) {
  const requestedType = query.get("type");
  if (["materials", "inquiry"].includes(requestedType) && !state.contact.type) state.contact.type = requestedType;
  if (state.contactStep === "complete") {
    return `${pageHero("お問い合わせ・資料請求", "CONTACT", "送信デモが完了しました。入力内容は外部送信・永続保存されていません。", null)}<section class="section"><div class="shell form-wrap"><div class="complete-mark" aria-hidden="true">✓</div><h2 class="section-title">受付デモが完了しました</h2><p class="lead">この画面はUI検証用です。実際の資料発送や学校への連絡は行われていません。</p><div class="button-row spacer-top"><a class="button" href="#/home">トップへ戻る</a><button class="button-secondary" type="button" data-contact-reset>もう一度試す</button></div></div></section>`;
  }
  if (state.contactStep === "confirm") {
    const labels = { materials: "学校案内・資料請求", inquiry: "学校へのお問い合わせ" };
    return `${pageHero("お問い合わせ・資料請求・確認", "CONFIRM", "内容をご確認ください。確定ボタンを押しても外部送信は行いません。", null)}<section class="section"><div class="shell form-wrap"><h2 class="section-title">入力内容の確認</h2><table class="confirm-table"><tbody><tr><th>種別</th><td>${labels[state.contact.type] || ""}</td></tr><tr><th>氏名</th><td>${escapeHtml(state.contact.name)}</td></tr><tr><th>メール</th><td>${escapeHtml(state.contact.email)}</td></tr><tr><th>電話番号</th><td>${escapeHtml(state.contact.phone || "未入力")}</td></tr><tr><th>内容</th><td>${escapeHtml(state.contact.message)}</td></tr></tbody></table><div class="button-row"><button class="button-secondary" type="button" data-contact-back>戻って修正</button><button class="button" type="button" data-contact-complete>内容を確定（デモ）</button></div></div></section>`;
  }
  const data = state.contact;
  return `
    ${pageHero("お問い合わせ・資料請求", "CONTACT", "学校案内の資料請求と、学校へのお問い合わせを同じフォームから試せます。", images.library)}
    <section class="section"><div class="shell form-wrap">
      <div class="notice-box"><h3>個人情報は送信されません</h3><p>このフォームはUI検証用です。入力内容は画面内の確認にのみ使用し、永続保存しません。</p></div>
      <form class="form-section" data-contact-form novalidate>
        <div class="field"><label for="contact-type">お問い合わせ種別<span class="required">必須</span></label><select id="contact-type" name="type" aria-describedby="contact-type-error"><option value="">選択してください</option><option value="materials" ${data.type === "materials" ? "selected" : ""}>学校案内・資料請求</option><option value="inquiry" ${data.type === "inquiry" ? "selected" : ""}>学校へのお問い合わせ</option></select><p class="field-error" id="contact-type-error" data-error-for="type"></p></div>
        <div class="field-grid">
          <div class="field"><label for="contact-name">氏名<span class="required">必須</span></label><input id="contact-name" name="name" type="text" autocomplete="name" value="${escapeHtml(data.name || "")}" aria-describedby="contact-name-error" /><p class="field-error" id="contact-name-error" data-error-for="name"></p></div>
          <div class="field"><label for="contact-email">メールアドレス<span class="required">必須</span></label><input id="contact-email" name="email" type="email" autocomplete="email" value="${escapeHtml(data.email || "")}" aria-describedby="contact-email-error" /><p class="field-error" id="contact-email-error" data-error-for="email"></p></div>
          <div class="field full"><label for="contact-phone">電話番号<span class="muted">（任意）</span></label><input id="contact-phone" name="phone" type="tel" autocomplete="tel" value="${escapeHtml(data.phone || "")}" /></div>
          <div class="field full"><label for="contact-message">お問い合わせ内容<span class="required">必須</span></label><textarea id="contact-message" name="message" aria-describedby="contact-message-error" placeholder="資料請求の場合は、知りたい内容などをご記入ください。">${escapeHtml(data.message || "")}</textarea><p class="field-error" id="contact-message-error" data-error-for="message"></p></div>
        </div>
        <label class="checkbox-row" for="contact-consent"><input id="contact-consent" name="consent" type="checkbox" ${data.consent ? "checked" : ""} /><span><a class="text-link" href="#/privacy">プライバシーについて</a>を確認し、デモ利用に同意します。<span class="required">必須</span></span></label><p class="field-error" data-error-for="consent"></p>
        <button class="button" type="submit">確認画面へ進む</button>
      </form>
    </div></section>`;
}

function audiencePage(kind) {
  const isStudent = kind === "students";
  const title = isStudent ? "在校生の方へ" : "卒業生の方へ";
  const eyebrow = isStudent ? "FOR STUDENTS" : "FOR ALUMNI";
  const intro = isStudent ? "学校生活でよく使う案内をまとめています。" : "卒業後の証明書や学校とのつながりに関する案内です。";
  const links = isStudent
    ? [["年間行事", "学校生活ページで年間の主な行事を確認できます。", "#/life"], ["部活動", "活動日・場所・紹介を部活動一覧から確認できます。", "#/clubs"], ["図書館案内", "施設紹介で図書館や自習環境を確認できます。", "#/life"], ["各種届出", "欠席届・住所変更などの案内を想定したデモ項目です。", "#/contact?type=inquiry"], ["保健室", "体調不良時の相談先を想定したデモ項目です。", "#/contact?type=inquiry"], ["お知らせ", "学校からの最新情報を確認できます。", "#/news"]]
    : [["証明書発行", "卒業証明書・成績証明書の申請案内を想定したデモです。", "#/contact?type=inquiry"], ["同窓会", "同窓会行事や住所変更の案内を想定したデモです。", "#/news"], ["進路相談", "卒業後の進学・就職相談窓口を想定しています。", "#/contact?type=inquiry"], ["学校への連絡", "お問い合わせフォームの入力・確認フローを利用できます。", "#/contact?type=inquiry"], ["青葉のいま", "現在の学校行事や学びの様子をお知らせから確認できます。", "#/news"], ["アクセス", "来校時の架空アクセス案内を確認できます。", "#/access"]];
  return `${pageHero(title, eyebrow, intro, isStudent ? images.students : images.campus)}<section class="section"><div class="shell"><div class="link-grid">${links.map(([name, text, href]) => `<a class="link-tile" href="${href}"><h3>${name} →</h3><p>${text}</p></a>`).join("")}</div></div></section>`;
}

function privacyPage() {
  return `${pageHero("プライバシーについて", "PRIVACY", "この架空サイトにおけるフォーム入力データの扱いを説明します。", null)}<section class="section"><div class="shell prose"><h2>デモサイトでの入力情報</h2><p>説明会予約、お問い合わせ、資料請求フォームに入力した情報は、確認画面を表示するためにブラウザのメモリ上で一時的に扱います。サーバーや外部サービスへ送信せず、ページを閉じた後に利用するための永続保存も行いません。</p><h2>アクセス情報</h2><p>このstudy自体には独自のアクセス解析や広告計測を実装していません。UI Labを動かしている環境側の挙動については、このデモページの範囲外です。</p><h2>架空サイトについて</h2><p>私立 青葉高等学校、人物名、住所、実績、日程、入試制度、費用はすべて架空です。実在の学校・団体とは関係ありません。</p></div></section>`;
}

function sitemapPage() {
  const links = [["トップ", "#/home"], ["学校紹介", "#/about"], ["学び", "#/learning"], ["学校生活・施設", "#/life"], ["部活動", "#/clubs"], ["入試・説明会", "#/admissions"], ["お知らせ", "#/news"], ["アクセス・FAQ", "#/access"], ["お問い合わせ・資料請求", "#/contact"], ["在校生の方へ", "#/students"], ["卒業生の方へ", "#/alumni"], ["プライバシー", "#/privacy"]];
  return `${pageHero("サイトマップ", "SITE MAP", "青葉高等学校デモサイトの主要ページ一覧です。", null)}<section class="section"><div class="shell"><div class="link-grid">${links.map(([name, href]) => `<a class="link-tile" href="${href}"><h3>${name} →</h3><p>ページを開く</p></a>`).join("")}<a class="link-tile" href="./school-guide.html" target="_blank" rel="noreferrer"><h3>学校案内（印刷版） →</h3><p>印刷に適した学校案内を開く</p></a></div></div></section>`;
}

function notFoundPage() {
  return `${pageHero("ページが見つかりません", "404", "指定されたページはこのデモサイトにありません。", null)}<section class="section"><div class="shell"><a class="button" href="#/home">トップへ戻る</a></div></section>`;
}

function setActiveNav(path) {
  document.querySelectorAll(".nav-inner a").forEach((link) => {
    const href = link.getAttribute("href")?.slice(1) || "";
    const active = path === href || (path.startsWith("/news/") && href === "/news") || (path === "/reserve" && href === "/admissions");
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function closeMenu() {
  primaryNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

function closeSearch() {
  searchPanel.hidden = true;
  searchToggle.setAttribute("aria-expanded", "false");
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function setFormErrors(form, errors) {
  form.querySelectorAll("[data-error-for]").forEach((node) => { node.textContent = ""; });
  form.querySelectorAll("[aria-invalid='true']").forEach((node) => node.removeAttribute("aria-invalid"));
  const names = Object.keys(errors);
  names.forEach((name) => {
    const error = form.querySelector(`[data-error-for="${name}"]`);
    const field = form.elements.namedItem(name);
    if (error) error.textContent = errors[name];
    if (field && field instanceof HTMLElement) field.setAttribute("aria-invalid", "true");
  });
  if (names.length) {
    const first = form.elements.namedItem(names[0]);
    if (first && first instanceof HTMLElement) first.focus();
  }
}

function bindPageInteractions() {
  document.querySelectorAll("[data-club-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.clubFilter = button.dataset.clubFilter;
      state.openClub = null;
      render({ preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-club-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      state.openClub = state.openClub === button.dataset.clubDetail ? null : button.dataset.clubDetail;
      render({ preserveScroll: true });
      const next = document.querySelector(`[data-club-detail="${button.dataset.clubDetail}"]`);
      next?.focus();
    });
  });

  document.querySelectorAll("[data-news-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.newsFilter = button.dataset.newsFilter;
      render({ preserveScroll: true });
    });
  });

  document.querySelector("[data-history-back]")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.hash = "#/news";
  });

  document.querySelector("[data-result-search]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get("q")?.toString().trim() || "";
    location.hash = `#/search?q=${encodeURIComponent(q)}`;
  });

  const reservationForm = document.querySelector("[data-reservation-form]");
  reservationForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(reservationForm).entries());
    data.consent = reservationForm.elements.consent.checked;
    const errors = {};
    if (!data.event) errors.event = "参加日程を選択してください。";
    if (!data.name?.trim()) errors.name = "氏名を入力してください。";
    if (!data.email?.trim()) errors.email = "メールアドレスを入力してください。";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "メールアドレスの形式を確認してください。";
    if (!data.people) errors.people = "参加人数を選択してください。";
    if (!data.consent) errors.consent = "デモ利用上の注意事項への同意が必要です。";
    if (Object.keys(errors).length) {
      setFormErrors(reservationForm, errors);
      showToast("入力内容を確認してください");
      return;
    }
    state.reservation = data;
    state.reservationStep = "confirm";
    render();
  });

  document.querySelector("[data-reservation-back]")?.addEventListener("click", () => { state.reservationStep = "edit"; render(); });
  document.querySelector("[data-reservation-complete]")?.addEventListener("click", () => { state.reservationStep = "complete"; render(); showToast("予約デモが完了しました"); });
  document.querySelector("[data-reservation-reset]")?.addEventListener("click", () => { state.reservation = {}; state.reservationStep = "edit"; render(); });

  const contactForm = document.querySelector("[data-contact-form]");
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(contactForm).entries());
    data.consent = contactForm.elements.consent.checked;
    const errors = {};
    if (!data.type) errors.type = "お問い合わせ種別を選択してください。";
    if (!data.name?.trim()) errors.name = "氏名を入力してください。";
    if (!data.email?.trim()) errors.email = "メールアドレスを入力してください。";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "メールアドレスの形式を確認してください。";
    if (!data.message?.trim()) errors.message = "お問い合わせ内容を入力してください。";
    if (!data.consent) errors.consent = "プライバシーについて確認し、デモ利用に同意してください。";
    if (Object.keys(errors).length) {
      setFormErrors(contactForm, errors);
      showToast("入力内容を確認してください");
      return;
    }
    state.contact = data;
    state.contactStep = "confirm";
    render();
  });

  document.querySelector("[data-contact-back]")?.addEventListener("click", () => { state.contactStep = "edit"; render(); });
  document.querySelector("[data-contact-complete]")?.addEventListener("click", () => { state.contactStep = "complete"; render(); showToast("受付デモが完了しました"); });
  document.querySelector("[data-contact-reset]")?.addEventListener("click", () => { state.contact = {}; state.contactStep = "edit"; render(); });
}

function render(options = {}) {
  const scrollY = window.scrollY;
  const { path, query } = getRoute();
  let html;
  let title = "私立 青葉高等学校";

  if (path === "/home" || path === "/") { html = homePage(); title = "私立 青葉高等学校 | 好きが、未来をひらく。"; }
  else if (path === "/about") { html = aboutPage(); title = "学校紹介 | 私立 青葉高等学校"; }
  else if (path === "/learning") { html = learningPage(); title = "学び | 私立 青葉高等学校"; }
  else if (path === "/life") { html = lifePage(); title = "学校生活・施設 | 私立 青葉高等学校"; }
  else if (path === "/clubs") { html = clubsPage(); title = "部活動 | 私立 青葉高等学校"; }
  else if (path === "/admissions") { html = admissionsPage(); title = "入試・説明会 | 私立 青葉高等学校"; }
  else if (path === "/news") { html = newsPage(); title = "お知らせ | 私立 青葉高等学校"; }
  else if (path.startsWith("/news/")) { html = newsDetailPage(path.split("/")[2]); title = "お知らせ詳細 | 私立 青葉高等学校"; }
  else if (path === "/access") { html = accessPage(); title = "アクセス・FAQ | 私立 青葉高等学校"; }
  else if (path === "/search") { html = searchPage(query.get("q") || ""); title = "サイト内検索 | 私立 青葉高等学校"; }
  else if (path === "/reserve") { html = reservationPage(query); title = "説明会予約 | 私立 青葉高等学校"; }
  else if (path === "/contact") { html = contactPage(query); title = "お問い合わせ・資料請求 | 私立 青葉高等学校"; }
  else if (path === "/students") { html = audiencePage("students"); title = "在校生の方へ | 私立 青葉高等学校"; }
  else if (path === "/alumni") { html = audiencePage("alumni"); title = "卒業生の方へ | 私立 青葉高等学校"; }
  else if (path === "/privacy") { html = privacyPage(); title = "プライバシー | 私立 青葉高等学校"; }
  else if (path === "/sitemap") { html = sitemapPage(); title = "サイトマップ | 私立 青葉高等学校"; }
  else { html = notFoundPage(); title = "ページが見つかりません | 私立 青葉高等学校"; }

  main.innerHTML = html;
  document.title = title;
  setActiveNav(path);
  bindPageInteractions();
  closeMenu();
  closeSearch();
  if (options.preserveScroll) window.scrollTo({ top: scrollY });
  else window.scrollTo({ top: 0 });
}

menuToggle.addEventListener("click", () => {
  const open = !primaryNav.classList.contains("is-open");
  primaryNav.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
  if (open) closeSearch();
});

searchToggle.addEventListener("click", () => {
  const open = searchPanel.hidden;
  searchPanel.hidden = !open;
  searchToggle.setAttribute("aria-expanded", String(open));
  if (open) {
    closeMenu();
    requestAnimationFrame(() => document.querySelector("#site-search-input")?.focus());
  }
});

siteSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const q = new FormData(siteSearchForm).get("q")?.toString().trim() || "";
  location.hash = `#/search?q=${encodeURIComponent(q)}`;
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (primaryNav.classList.contains("is-open")) {
    closeMenu();
    menuToggle.focus();
  } else if (!searchPanel.hidden) {
    closeSearch();
    searchToggle.focus();
  }
});

window.addEventListener("hashchange", render);

if (!location.hash) {
  history.replaceState(null, "", "#/home");
}
render();
