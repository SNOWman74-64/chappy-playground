# DESIGN.md / AI-readable Design System メモ

AIコーディングエージェントがUIを作る時代では、FigmaやCSSだけではなく、**デザイン判断そのものをAIが読める形で外部化する**ことが重要になっている。

このメモでは、VercelやGoogle Labs Codeなどで見られる `DESIGN.md` 的な考え方を参考にしつつ、今後自分のWebサイト / Webアプリ / UI Skillへどう取り入れるかを整理する。

---

## 基本認識

`DESIGN.md` は「見た目の設定ファイル」ではない。

役割は、

- なぜこのレイアウトにするのか
- 何を優先するのか
- どこまで動かすのか
- 何を避けるのか
- どのような画面構造を良しとするか

といった、**Design Decision / Design PrincipleをAIへ伝えること**。

色やradiusなどの具体値だけを書いても、自分のデザイン思想にはならない。

---

# 3層で考える

今後のAI開発では、次の3層を分けて持つ形を目指す。

```text
DESIGN.md
│
├─ Design Principle
├─ Layout Vocabulary
├─ UX / Interaction Policy
├─ Motion Policy
└─ Anti-pattern
        ↓
Design Tokens / CSS / Components
        ↓
実際のUI
```

## DESIGN.md

判断・思想・使い分けを記述する。

例:

- Primaryをどう決めるか
- Cardをいつ使うか
- 情報密度の考え方
- Motionに意味を要求するか
- Mobileでどう再構成するか

## Design Tokens / CSS

具体値を持つ。

例:

- Color
- Spacing
- Radius
- Typography scale
- Shadow
- Breakpoint
- Motion duration

## Components

実際の再利用単位。

例:

- Button
- Input
- Navigation
- Dialog
- Card
- List

`DESIGN.md`だけでUIを統一するのではなく、**判断 → Token → Component**まで一貫していることが重要。

---

# AGENTS.md / REQUIREMENTS.mdとの役割分担

将来的には次の3つを基本構造として考えたい。

```text
REQUIREMENTS.md
→ 何を作るか

AGENTS.md
→ AIがどう開発するか

DESIGN.md
→ AIがどうデザイン判断するか
```

### REQUIREMENTS.md

- User
- Feature
- Behavior
- Acceptance Condition

### AGENTS.md

- 作業権限
- リスク分類
- Test
- Review
- Git
- Scope

### DESIGN.md

- Visual hierarchy
- Layout
- UX
- Interaction
- Typography
- Motion
- Responsive
- Design Anti-pattern

この3つを混ぜすぎない。

---

# DESIGN.mdを先に作りすぎない

自分のDesign Languageは、最初から文章で発明しない。

基本サイクル:

```text
Reference
↓
好きだと感じる
↓
再現する
↓
構造を理解する
↓
My Versionを作る
↓
別作品でも同じ変更・判断をする
↓
Pattern候補
↓
再利用できることを確認
↓
命名
↓
DESIGN.mdへ昇格
```

一度好きだっただけの表現を共通ルールにはしない。

複数のReferenceや制作物で繰り返し現れた判断を、Design Principleへ昇格させる。

---

# 自分専用のLayout Vocabularyを作る

最終的には、個々のレイアウトパターンに自分で名前を付けたい。

例えば将来的に:

```text
Quiet Stack
Gallery Rail
Focus Deck
Stage Split
```

のような独自名を持つ。

重要なのは、名前が特定のHTMLテンプレートを意味しないこと。

**Layoutの意図・構造・使いどころを意味する言葉**にする。

---

## Layout Patternの記述例

```md
### Quiet Stack

Intent:
情報量を維持しながら視覚ノイズを減らす。

Characteristics:
- Card少なめ
- Typography hierarchy強め
- WhitespaceとDivider中心
- Shadowは原則弱い
- 中〜高Density

Use when:
- Detail
- Settings
- Dashboard
- Mobile utility UI

Avoid when:
- Visual storytelling
- Marketing Hero

Responsive:
Desktopでは横方向の余白を使う。
Mobileでは構造を維持しながら縦方向へ圧縮する。

Motion:
State transition / Disclosure / Feedbackのみ。
```

こうしたPatternをAIが理解できれば、将来的に

> Quiet Stackベースで、作品部分だけGallery Railを使う

のような指示で、要件に合わせて臨機応変にUIを構成できる状態を目指す。

---

# DESIGN.mdに将来入れたい項目

## Product / Site Read

- 何を作るか
- 誰が使うか
- 何を最優先するか
- Web App / Web Site / Mobile / Experimentalなど

## Layout Principles

- Primaryの作り方
- Alignment
- Container
- Grid
- Section rhythm
- Layout Vocabulary

## Information Hierarchy

- Primary
- Secondary
- Utility

必要に応じてWebサイト向けには別の階層モデルも使用する。

## Typography

- Font family
- Scale
- Weight
- Line height
- Tracking
- 数字
- 日本語 / 英語の扱い

## Spacing / Density

- Density方針
- Section spacing
- Component spacing
- Mobileでの密度変化

## Surface

- Card
- Border
- Divider
- Shadow
- Radius
- Background difference

## Color

- Base
- Accent
- Semantic color
- Saturation
- Dark mode

## Motion

Motionには理由を持たせる。

例:

- Feedback
- State transition
- Hierarchy
- Navigation
- Storytelling

「かっこいいから」だけでは共通ルールへ入れない。

## Interaction / States

- Hover
- Press
- Focus
- Disabled
- Loading
- Empty
- Error
- Success
- Editing
- Selection

## Responsive

PC版を縮小するだけにしない。

- Mobile navigation
- Layout change
- Typography change
- Touch target
- Safe Area
- Keyboard

## Anti-patterns

一般的な流行を禁止するのではなく、**自分の制作で何度も不要だと判断したもの**を記録する。

例:

- 理由のないCard乱用
- DecorationだけのPill
- Generic AI Purple Gradient
- 同じ構図のSection反復
- 意味のない常時Animation

---

# AIに渡す情報は「思想」と「具体値」を分ける

悪い例:

```text
カードはborder-radius 12px。
```

これだけでは、いつCardを使うか判断できない。

より良い形:

```text
Cardは独立した操作対象または状態境界に使う。
単なるGroupingではWhitespace / Dividerを優先する。
Cardを使う場合のradius tokenは12px。
```

AIが必要なのは、数値だけではなく**判断条件**。

---

# DESIGN.mdは固定仕様ではなく育てる

運用イメージ:

```text
制作
↓
AIの出力を見る
↓
「毎回ここを直している」を発見
↓
再発するか確認
↓
Design Ruleへ追加
```

逆に、

- 一度しか使わなかった
- 特定作品にしか合わない
- ルール化すると自由度を下げる

ものは共通 `DESIGN.md` へ入れない。

Harnessと同じく、**ルールが存在することで作業を増やさない**。

---

# Project-specific DESIGN.md

最終的には、自分の共通Design Languageをそのまま全Projectへ強制するのではなく、Projectごとに必要な部分を選ぶ。

```text
My Design Language
        ↓
UI Architect
        ↓
Requirementsを読む
        ↓
Project-specific DESIGN.md
```

例えば:

### Web App

- Interaction priority 高
- Information density 高
- Motion 低〜中
- State clarity 高

### Portfolio

- Typography priority 高
- Brand expression 高
- Motion 中〜高
- Visual storytelling 高

同じ自分のTasteでも、用途に合わせて適用量を変える。

---

# UI Architectとの関係

将来作りたい `UI Architect` は、巨大なDesign Rule集そのものではない。

役割:

1. REQUIREMENTSを読む
2. 自分のDesign Languageを読む
3. Project type / User contextを判断
4. 必要なLayout PatternやRuleだけ選択
5. Project-specific DESIGN.mdへ落とす

つまり:

```text
UI Architect = Design Decision Layer
DESIGN.md = Design Knowledge / Contract
```

と分ける。

---

# 今の段階

まだ自分のDesign Languageを固定する段階ではない。

現在は:

1. Refero Styles等を見る
2. 気になるReferenceを集める
3. 好きな理由を軽く記録
4. 特に好きなものを再現
5. My Versionへ変更
6. 繰り返し現れる好みを探す

を優先する。

`web-design-observation-notes.md` は観察用。
このファイルは、その観察結果を将来的に**AI-readable Design Systemへ昇格させる方法**を記録する。

---

# 参考

- Vercel: How our agents build on-brand pages with design.md
  - https://vercel.com/blog/how-our-agents-build-on-brand-pages-with-design-md
- Google Labs Code: design.md
  - https://github.com/google-labs-code/design.md
- Refero Styles
  - https://styles.refero.design/

---

# 目標

最終的に目指す状態:

> 自分が「好き」と感じるレイアウトを再現・分析し、再利用可能なPatternとして自分で命名する。
>
> AIへそのPattern名やDesign Principleを指示すると、固定テンプレートをコピーするのではなく、今回の要件に合わせて意図を理解し、臨機応変に設計できる。

`DESIGN.md` はそのための、**自分のデザイン判断をAIと共有する共通言語**として育てる。
