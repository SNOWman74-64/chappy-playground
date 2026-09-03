# UI Reference Resources

Webサイト / Webアプリ / モバイルUIを観察するときの参照先メモ。

目的は、外部のデザインをそのまま正解として採用することではなく、**自分が何を好きだと感じるか、どの表現を再現・応用したいかを見つけること**。

`web-design-observation-notes.md` と合わせて使う。

---

## 1. Composition / Web Design Reference

完成したWebサイト全体を見て、レイアウト、空気感、Typography、余白、Visual hierarchyを観察する。

### SEESAW
https://www.seesaw.website/

ジャンル横断で「なんか好き」を発見する入口。

### Recent.design
https://recent.design/

最近のWebデザインやレイアウト表現を見る。

### Landing Love
https://landing.love/

Landing Page、Hero、Section rhythm、CTA、Motionの観察向け。

### SaaSpo
https://saaspo.com/

SaaS系Webサイトの構成やProduct presentationを見る。

### Curations
https://curations.supply/

Webに限らず、幅広いDesign referenceを探す。

### Posts.design
https://posts.design/

UI / Webデザイン事例の発掘。

### Refero Styles
https://styles.refero.design/

完成サイトを「なぜこう見えるか」というDesign Language側から分析する用途。

Color / Typography / Spacing / Surface / Design Tokens等を見る。

---

## 2. Product UX / Real UI Reference

実際のプロダクトで、画面構造、Flow、State、Interactionがどう設計されているかを見る。

### Mobbin
https://mobbin.com/

モバイルアプリのScreen / Flow / Navigation研究。

### Refero
https://refero.design/

実プロダクトのScreen / Flow / Patternを確認する。

### Spotted in Prod
https://spottedinprod.com/

実サービスで使われている細かいUI・Interaction表現を見る。

### Collect UI
https://collectui.com/

画面やComponent単位でUI Patternを探す。

### Sleek
https://sleek.design/

モバイルUIやAIを使ったデザイン探索の参考。

---

## 3. Component / Interaction Reference

完成サイトをコピーするのではなく、Button、Card、Input、Background、Motionなどの**実装可能な部品・Interactionの引き出し**として見る。

### Magic UI
https://magicui.design/

React系の視覚効果・Motion・Component表現。

見るときは「このComponentを使いたい」だけでなく、何が好きなのかを一段抽象化する。

例:

`Pointerに光が追従するCardが好き`
→ `操作にSurfaceが反応する表現が好き`

### Aceternity UI
https://ui.aceternity.com/

Hero、Background、Card、Scroll演出など、Visual expressionの研究向け。

Webサイト系の表現の引き出しとして使う。

### Uiverse
https://uiverse.io/

Button、Input、Toggle、Loaderなど大量の小さなUI部品。

Micro Interactionや状態表現を探すときに便利。

### shadcn/ui
https://ui.shadcn.com/

見た目のネタ帳というより、実用的なWebアプリUIのComponent基盤候補。

- Accessibility
- Dialog / Sheet
- Form
- Dropdown
- Command
- Table
- Tabs

など、Product UIの実装基盤として見る。

特殊なVisual Styleをそのまま学ぶ場所とは分けて扱う。

---

## 4. Typography

### Uncut
https://uncut.wtf/

FontやTypography表現の観察。

見るポイント:

- Headline / Bodyの差
- Font family
- Weight
- Tracking
- Line height
- 数字
- Serif / Sans / Mono

---

## 5. Motion / Animation

### 60fps.design
https://60fps.design/

Web Motion / Interaction研究。

動いていること自体ではなく、

- Feedback
- State transition
- Hierarchy
- Navigation
- Storytelling

のどれを目的にしているかを見る。

---

## 6. Visual Effect / Decorative Tools

サイト全体のDesign Systemではなく、HeroやSection、背景、視線誘導などに使える**小さな視覚表現の引き出し**として扱う。

### Design Minis — Light Stroke Tails
https://www.designminis.com/tools/light-stroke-tails

光の軌跡・流線のようなStroke表現を作るVisual Effect Tool。

参考用途:

- Hero背景
- CTA周辺の視線誘導
- Section間の流れ
- Dark UI上の発光表現
- Brandを象徴するMotion Line

「Light Strokeを使う」こと自体をDesign Principleにはしない。

例:

`Light Strokeが好き`
→ `細いMotion Lineで視線や流れを誘導する表現が好き`

のように、気に入った理由を一段抽象化して残す。

Mock GalleryでHero Effect / Decorative Motionの単体Studyとして試す候補。

---

## 7. Browser QA / UI Exploration Tools

Referenceを見る場所ではなく、**作ったUIをAIが実ブラウザで触り、UX・Interaction・表示を観察するための道具**。

### ego-browser / ego-lite
https://github.com/citrolabs/ego-lite/blob/main/skills/ego-browser/SKILL.md

Coding Agentへ専用Chromiumのブラウザ操作能力を与え、ページ操作・Screenshot・DOM観察・Exploratory Testing・Dogfooding・Bug Huntingなどを行うSkill / Browser。

UI研究での将来用途:

- Mock Galleryのモックを実際に触らせる
- Desktop / MobileでInteractionを観察する
- Overflow / State / Motion / Navigationの違和感を探す
- `product-ui-audit` の目と手として使う
- LIFTLOGなど実アプリのUX監査

役割イメージ:

```text
UI Architect / UI Audit Skill
        ↓ 何を見るか判断
ego-browser
        ↓ 実際に触る
Playwright
        ↓ 再現可能な仕様保証
```

Playwrightの代替ではなく、Exploratory UX Reviewを補う位置づけ。

現時点ではego lite本体のWindows対応状況を確認してから導入する。Windows環境では「今すぐ必須」ではなく、将来のUI Harness候補として記録。

---

## 8. Brand

### Rebrand Gallery
https://rebrand.gallery/

Logo、Color、Typography、Photography等を含むBrand全体のVisual Language研究。

---

## 9. Icon

### Hugeicons
https://hugeicons.com/

Iconの形、Stroke、密度、UIへの馴染ませ方を見る。

---

# 基本的な使い分け

```text
SEESAW / Recent / Landing Love
        ↓
「好き」を発見

Refero Styles
        ↓
「なぜ好きか」を分解

Mobbin / Refero / Spotted in Prod
        ↓
実際のUX / Flow / Stateを見る

Magic UI / Aceternity / Uiverse / shadcn
        ↓
実装できるComponent / Interactionを研究

Design Minisなど
        ↓
小さなVisual Effectを試す

ego-browserなど
        ↓
作ったUIを実ブラウザで探索・観察する
```

---

# Referenceを保存するとき

最初から細かく分析しなくてよい。

```text
URL:

好きなところ:
- 

カテゴリ:
- Layout / Typography / Motion / UX / Component / Brand / etc.

理由:
- 分からなくてもOK
```

特に好きなものだけ、後から `Reference → Reproduction → My Version` へ進める。

最終的には、複数のReferenceで繰り返し好きになる構造を抽出し、自分独自のLayout / Interaction Patternとして名前を付ける。
