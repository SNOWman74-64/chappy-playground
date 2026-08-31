# AI開発ツール・Skill メモ

AI開発まわりで見つけた Skill / Agent / Plugin / Harness / OSS を、とりあえず忘れないように置いておく場所。

厳密な選定リストではなく、**「これ面白そう」「今後使うかも」を一旦放り込む自由帳**。

> 方針: 全部入れない。まずメモして、実際の開発で明確に役立つものだけHarnessへ昇格させる。

---

## 導入・利用中

### natural-japanese
**種別:** Skill  
**状態:** 導入済み

AIが生成する日本語を、より自然な日本語へ寄せるためのSkill。

- 日本語UI・説明文の品質改善
- 不自然なAI文体を抑える

---

### codex-with-chatgpt / C2C
**種別:** Plugin / Harness  
**状態:** 利用中

Codex workspaceをChatGPT側からread-onlyで確認し、計画や独立レビューを分担する仕組み。

主な流れ:

`ChatGPTで計画・独立レビュー → Codexで実装`

---

## 試したい / 有力

### CodexHost
**種別:** Harness / Host  
**GitHub:** https://github.com/BytePioneer-AI/codex-host  
**状態:** 導入候補かなり高め

Codex Desktopを共通フロントエンドとして、Codex以外のCoding Agentも扱えるようにするOSS。

特に気になるのはAgentへのタスク委譲。

例:

`Codexで実装 → Claude Codeにレビューを委譲 → Codexで修正`

Claudeを毎回別で開く手間を減らせそうで、現在の開発フローとかなり相性が良さそう。

---

### Taste Skill
**種別:** Skill Collection  
**状態:** 必要な思想 / Skillだけ採用候補

AIに単純なUI生成ではなく、**デザイン上の判断基準やTasteを持たせる**方向のSkill群。

気になっているもの:

- `redesign-existing-projects`
  - 既存プロダクトのUI改善
  - LIFTLOGのような既存アプリと相性が良さそう
- `design-taste-frontend`
  - Webフロントエンド全般のデザイン品質向上
- `image-to-code`
  - 参考画像からUI実装へ落とし込む
- `imagegen-frontend-mobile`
  - モバイルUIのビジュアル検討
- `brandkit`
  - ブランド・ビジュアル方向性の設計
- `web-design-study`
  - Webデザインの分析・学習

---

### agency-agents
**種別:** Agent Collection  
**状態:** Harness設計の参考資料

UI、QA、PM、Engineeringなど、多数の専門Agentロールをまとめたもの。

全部使うというより、**「Agentにどんな役割を持たせると有効か」**を研究する資料として面白い。

将来のHarness設計にも使えそう。

---

### grill-me
**種別:** Skill  
**状態:** 大きいタスク限定候補

実装前にAI側から質問を投げてもらい、曖昧な仕様や設計を潰す。

向いていそうなもの:

- 新機能
- 大規模変更
- 要件が曖昧な企画

小変更には重すぎそうなので常用はしない。

---

## コード品質系

### Desloppify
**種別:** Skill / Workflow  
**状態:** 評価対象

AI生成コードにありがちな、不要な複雑化・雑な抽象化・重複・過剰実装などを整理する方向。

常時組み込むより、リファクタリングや最終チェック用途候補。

---

### thermo-nuclear
**種別:** Skill / Review系  
**状態:** 評価対象

コード品質をかなり強めにチェック・改善する方向。

強力そうだが、レビューやテストを重くしすぎないことも重要なので、常用するかは慎重に判断する。

---

### deslop
**種別:** Skill  
**状態:** 現状は不要寄り

AI生成物の「AIっぽい雑さ」を減らす方向。

他Skillや現在のHarnessである程度カバーできそうなので、今のところ優先度は低い。

---

## コード理解 / Architecture

### archify
**種別:** Developer Tool  
**GitHub:** https://github.com/tt-a1i/archify  
**状態:** 調査候補

コードベースの構造やArchitecture理解を助けるツール。

既存プロジェクトへAIを参加させる際の、

`コード探索 → 構造理解 → 計画`

部分を改善できる可能性あり。

---

## AI以外の面白いOSS

### Invidious
**種別:** OSS / API  
**GitHub:** https://github.com/iv-org/invidious  
**状態:** 別プロジェクト候補

OSSのYouTubeフロントエンド。

YouTube検索や動画情報取得の基盤として利用でき、将来考えている**曖昧な自然言語から動画を探す「Rabbit Hole」的な検索システム**のYouTube探索部分として使える可能性がある。

---

## 自作Skill / Harness案

### Harness Architect
**種別:** 自作Harness / Skill案

変更内容を見て、

- 計画をどこまで作るか
- 独立レビューが必要か
- テストをどこまで行うか
- どのAgent / Skillを使うか

を判断する上位役。

特に、**小変更まで大規模変更と同じ工程を踏んで開発速度が落ちる問題**を防ぐことが目的。

---

### UI Architect
**種別:** 自作Skill / Orchestrator案

UIタスクを見て、必要なUI Skill・レビュー方法・設計思想を選択する上位役。

Taste Skillなどを大量に常時ロードするのではなく、

`UI Architect → 必要なSkillだけ選択`

という構造にする案。

---

### product-ui-direction
**種別:** 自作UI Skill案

新規WebアプリのUI方向性を決める。

情報設計、Visual hierarchy、Interactionなど、実装前の方向付け担当。

---

### product-ui-audit
**種別:** 自作UI Skill案

既存UIをレビューして、情報密度・Hierarchy・操作負担・一貫性・不要なCard・モバイル表示などから改善点を探す。

LIFTLOGとの相性が良さそう。

---

### mobile-interaction-review
**種別:** 自作UI Skill案

スマートフォン操作専用レビュー。

主に見るもの:

- Swipe
- Tap target
- Scroll
- Gesture競合
- 縦幅
- Thumb reach
- Fixed navigation

---

## 現在のざっくり整理

```text
Harness
├─ CodexHost
├─ C2C
└─ Harness Architect（自作案）

Agent
├─ Codex
├─ Claude Code
└─ agency-agents

Skill
├─ natural-japanese
├─ Taste Skill
├─ grill-me
├─ Desloppify
└─ thermo-nuclear

UI Layer
├─ UI Architect
├─ product-ui-direction
├─ product-ui-audit
└─ mobile-interaction-review

Other OSS
├─ Invidious
└─ archify
```

---

## 運用方針

**全部入れない。**

新しいSkillやAgentを見つけたら、まずここへメモ。

実際の開発で、

> これがあれば今の作業が明確に楽になる

となったものだけHarnessへ昇格させる。

最終的には、**大量のSkillを常時積むのではなく、タスクに応じてHarness側が必要なSkill / Agentを選ぶ構成**を目指す。
