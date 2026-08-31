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
**GitHub:** https://github.com/msitarzewski/agency-agents  
**状態:** Harness設計の参考資料 / 必要なロールだけ抽出候補

Engineering、Design、QA、PMなど多数の専門Agentロールをまとめたコレクション。

全部導入するというより、**「どんな専門家ロールを持たせるとAI開発が安定するか」**を研究し、自分のHarnessへ必要な思想だけ取り込む使い方が良さそう。

特に気になるロール:

- `Minimal Change Engineer`
  - 変更範囲を不用意に広げない
  - 小変更を大工事にしない思想と相性が良い
- `Code Reviewer`
- `Software Architect`
- `UI Designer`
- `UX Architect`
- `UI Finish-Gate Reviewer`

将来的な共通HarnessのAgent Role設計資料としてかなり有力。

---

### Agent-Reach
**種別:** Agent Capability / Research Tool  
**GitHub:** https://github.com/Panniantong/Agent-Reach  
**状態:** 調査・Research Pack候補

Coding AgentへWeb上の情報源を読む能力を追加するためのCapability Layer。

Agent-Reach自身が全サイトを直接読むというより、対象に応じて既存ツールを組み合わせる思想。

主な対象:

- Webページ
- GitHub
- YouTube
- X
- Reddit
- RSS
- その他SNS / 動画サイト

将来的には、

`Research Agent → Agent-Reach → Web / GitHub / YouTube / Reddit ...`

のようなResearch Packとして使えそう。

GitHub / Web / YouTube / RSS系は特に有用そう。

XやRedditなどログインセッション・Cookieを利用する経路は、アカウントリスクや認証情報の扱いを確認してから使う。

---

### Orca
**種別:** Multi-Agent IDE / Harness  
**GitHub:** https://github.com/stablyai/orca  
**状態:** 実験候補かなり高め

Codex、Claude Code、OpenCodeなど複数のCoding Agentを、独立したGit worktreeで並列実行・比較するための開発環境。

イメージ:

```text
repo
├─ worktree A → Codex
├─ worktree B → Claude Code
└─ worktree C → Codex別案
```

同じ課題を複数Agentへ渡し、実装結果やdiffを比較する用途に向く。

通常タスクを常に並列化するのではなく、

- 難しい設計判断
- UI案比較
- 実装方式が複数ある変更
- 独立案を見たいとき

だけ使うOptionalなMulti-Agent Packとして考えるのが良さそう。

UI要素をブラウザ上で指定してAgentへ渡すDesign Modeもあり、UI改善系との相性も気になる。

---

### codebase-memory-mcp
**種別:** MCP / Codebase Knowledge Graph  
**GitHub:** https://github.com/DeusData/codebase-memory-mcp  
**状態:** 実験候補かなり高め

コードベースを毎回ファイル単位で読み直す代わりに、関数・Class・Module・Call・DependencyなどをKnowledge Graphとして保持し、Agentの構造探索コストを減らすMCP。

狙い:

`毎回 grep / read_file を繰り返す → Graphから構造・影響範囲を先に取得`

特にコード量が増えたプロジェクトで、

- 影響範囲調査
- Call chain確認
- Architecture理解
- Agentの探索Token削減

に効く可能性がある。

READMEの極端なToken削減値をそのまま一般化はしない。方向性としては**少ない探索コストでかなりのコード理解を得る代わりに、必要な箇所では実ファイル確認も併用する**ものとして考える。

小規模repoでは導入コストの方が上回る可能性があるため、全project必須ではなく規模が育った後のContext Pack候補。

---

### grill-me
**種別:** Skill  
**状態:** 大きいタスク限定候補

実装前にAI側から質問を投げてもらい、暗黙の前提・未決定事項・成功条件・例外を洗い出す。

向いていそうなもの:

- 新機能
- 大規模変更
- DB / 認証 / データモデル変更
- 要件が曖昧な企画

小変更には重すぎそうなので常用はしない。

---

### Skills Hub
**種別:** Skill Manager  
**GitHub:** https://github.com/qufei1993/skills-hub  
**状態:** Skillが増えたら有力

複数のCoding Agent向けSkillを中央管理し、Global / Project単位で使い分けるための管理ツール。

現時点では必須ではないが、`Harness Architect`、`UI Architect`やプロジェクト専用Skillが増えた段階で管理先として再評価する。

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
**種別:** Agent Skill / Architecture Tool  
**GitHub:** https://github.com/tt-a1i/archify  
**状態:** Harnessテンプレート採用候補

リポジトリやシステム説明から、Architecture・Workflow・Sequence・Data Flow・Lifecycleなどを図として生成し、既存コードの理解・設計記録を助ける。

特に面白い思想:

- typed JSON IRを中間表現として使う
- validatorで図の整合性を確認する
- Git commit / 行範囲などEvidenceと結びつける
- Architecture Deltaとして変更前後を追える

LIFTLOG固有ではなく、**共通開発HarnessでArchitectureを可視化・更新する仕組み**として相性が良い。

常時実行するものではなく、

- 大きな構造変更
- 新しいSubsystem追加
- Architecture文書更新
- 節目のCASE-STUDY作成

などで使うOptional Pack候補。

---

### zoetrope
**種別:** Agent Observability Tool  
**状態:** Harness研究 / Claude観測用途

Claude CodeのJSONL transcriptを読み、Agent / Subagent / Tool callの流れをリアルタイム可視化・replayするread-only観測ツール。

正式Harnessの必須部品というより、

- Agentがどこで時間を使っているか
- Tool callが増えすぎていないか
- Subagentがどう動いているか
- Harness改善前後で動きが変わったか

を見る研究用途に面白い。

Claude Code側の内部transcript形式への依存があるため、将来互換性には注意。

---

## Media / Creative Agent

### OpenMontage
**種別:** Agent Skill Collection / Video Production Harness  
**GitHub:** https://github.com/calesthio/OpenMontage  
**状態:** 直接導入よりHarness設計教材

Codex / Claude Code / CursorなどのCoding Agentを、動画制作オーケストレーターとして使うためのSkill・Tool・Pipeline群。

動画では、

`調査 → 構成 → 台本 → Asset → 音声 → 編集 → Render → QA`

のようなProduction PipelineをAgentが進める。

今のアプリ開発へ直接必要というより、**Agent / Skill / Tool / Pipeline / Reviewをどう分離して組み立てるか**を見る教材として面白い。

共通Harnessを設計するときの「全部を1つの巨大promptに詰めず、役割と処理を分割する」参考資料として見る。

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

## 今後の共通Harnessのイメージ

個別プロジェクトごとに毎回AI開発環境をゼロから設計するのではなく、再利用可能な共通基盤を持つ。

```text
Common AI Dev Harness
├─ Core
│  ├─ Harness Architect
│  ├─ Minimal Change / Risk Policy
│  └─ 最小限のReview / Test
│
├─ Agent Roles
│  ├─ Planner
│  ├─ Implementation Agent
│  ├─ Code Reviewer
│  └─ UI / UX Reviewer
│
├─ Context Pack
│  ├─ Architecture Docs
│  ├─ Decision Log
│  └─ codebase-memory-mcp（必要な規模で）
│
├─ UI Pack
│  ├─ UI Architect
│  ├─ Taste Skill
│  ├─ product-ui-audit
│  └─ mobile-interaction-review
│
├─ Research Pack
│  └─ Agent-Reach
│
├─ Multi-Agent Pack
│  └─ Orca / CodexHost
│
├─ Architecture Pack
│  └─ archify
│
└─ Observability / Lab
   └─ zoetrope
```

重要なのは**全部入りを常時使わないこと**。

Coreだけを小さく保ち、DB / Security / UI / Research / Multi-Agentなどは、タスクのリスクや目的に応じて差し込む。

---

## 現在のざっくり整理

```text
Harness
├─ CodexHost
├─ C2C
├─ Orca
└─ Harness Architect（自作案）

Agent / Role
├─ Codex
├─ Claude Code
└─ agency-agents

Skill
├─ natural-japanese
├─ Taste Skill
├─ grill-me
├─ Desloppify
└─ thermo-nuclear

Context / Architecture
├─ codebase-memory-mcp
├─ archify
└─ zoetrope

Research
└─ Agent-Reach

UI Layer
├─ UI Architect
├─ product-ui-direction
├─ product-ui-audit
└─ mobile-interaction-review

Skill Management
└─ Skills Hub

Harness Design Reference
└─ OpenMontage

Other OSS
└─ Invidious
```

---

## 用途別おすすめ度

> ★★★★★ = 基盤候補 / ★★★★☆ = 用途が合えば積極利用 / ★★★☆☆ = 補助・実験 / ★★☆☆☆ = 限定利用 / ★☆☆☆☆ = 基本不要

| Tool / Skill | LIFTLOG | 新規Webアプリ | Webサイト / LP | DB・認証など高リスク変更 | 主な役割 |
|---|---:|---:|---:|---:|---|
| `C2C` | ★★★★★ | ★★★★☆ | ★★☆☆☆ | ★★★★★ | 設計相談・read-only独立レビュー |
| `CodexHost` | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | Agent委譲を一つのフローへまとめる |
| `Orca` | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★★★☆☆ | 独立worktreeで複数Agent案を並列比較 |
| `codebase-memory-mcp` | ★★★★☆ | ★★★★☆ | ★★☆☆☆ | ★★★★☆ | Codebase Graph・探索Token削減・影響範囲理解 |
| `Agent-Reach` | ★★☆☆☆ | ★★★★☆ | ★★★☆☆ | ★★☆☆☆ | AgentによるWeb / GitHub / YouTube等の調査 |
| `natural-japanese` | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★☆☆ | 日本語UI・文書品質 |
| `grill-me` | ★★☆☆☆ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | 曖昧な大タスクの要件詰め |
| `redesign-existing-projects` | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★☆☆☆☆ | 既存UIの監査・局所改善 |
| `design-taste-frontend` | ★★☆☆☆ | ★★★☆☆ | ★★★★★ | ★☆☆☆☆ | Webデザインの方向付け・Anti-slop |
| `imagegen-frontend-mobile` | ★★★★☆ | ★★★★☆ | ★★☆☆☆ | ★☆☆☆☆ | モバイルUIのVisual Exploration |
| `image-to-code` | ★★☆☆☆ | ★★★☆☆ | ★★★★★ | ★☆☆☆☆ | 参考画像→分析→実装 |
| `brandkit` | ★☆☆☆☆ | ★★★☆☆ | ★★★★☆ | ★☆☆☆☆ | Brand / Visual Language設計 |
| `Desloppify` | ★★☆☆☆ | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ | 必要時のコード整理 |
| `thermo-nuclear` | ★☆☆☆☆ | ★★☆☆☆ | ★☆☆☆☆ | ★★★☆☆ | 強めのコード品質レビュー |
| `archify` | ★★★☆☆ | ★★★☆☆ | ★☆☆☆☆ | ★★★★☆ | Architecture可視化・Evidence・変更差分理解 |
| `zoetrope` | ★★☆☆☆ | ★★☆☆☆ | ★☆☆☆☆ | ★★☆☆☆ | Agent挙動の観測・Harness研究 |
| `agency-agents` | ★★☆☆☆ | ★★★☆☆ | ★★★☆☆ | ★★☆☆☆ | Agentロール設計の研究材料 |
| `OpenMontage` | ★☆☆☆☆ | ★★☆☆☆ | ★★☆☆☆ | ★☆☆☆☆ | Skill / Tool / Pipeline分割のHarness教材 |
| `Harness Architect` | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★★★ | 必要な工程・Skill・Reviewを選ぶ基盤 |
| `UI Architect` | ★★★★★ | ★★★★★ | ★★★★★ | ★☆☆☆☆ | プロジェクト専用UI思想を選ぶ基盤 |
| `product-ui-audit` | ★★★★★ | ★★★★☆ | ★★☆☆☆ | ★☆☆☆☆ | 既存プロダクトUI監査 |
| `mobile-interaction-review` | ★★★★★ | ★★★★☆ | ★☆☆☆☆ | ★☆☆☆☆ | Touch / Gesture / Mobile UXレビュー |
| `Skills Hub` | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | Skill数が増えた後の中央管理 |

### 評価の読み方

- 星が高くても常時起動する意味ではない。
- `LIFTLOG ★★★★★` は「LIFTLOGの正規要件より優先する」という意味ではない。
- DB・認証の列は、UI SkillではなくHarness / Review / Architecture理解系を重く見る。
- 新しいSkillを追加したら、説明を増やすよりこの表へ用途別評価を追加すると見返しやすい。

---

## タスク別の呼び分けメモ

### 小さいCSS・文言・局所UI

基本:

`Codex単独 → 対象確認 → 完了`

原則不要:

- C2C
- grill-me
- thermo-nuclear
- Orcaによる並列実装
- 大規模回帰テスト

SkillやAgentが存在することを理由に工程を増やさない。

### LIFTLOGの既存UI改善

候補:

`UI Architect / product-ui-audit`

外部の別視点が欲しい場合だけ:

`redesign-existing-projects`

Touch / Swipe / Mobile操作を変えた場合だけ:

`mobile-interaction-review`

大きな設計判断が残る場合だけ:

`C2C`

UI案そのものを比較する価値が高い場合だけ:

`Orcaで独立案を並列比較`

### 新規Webアプリ

初期:

`Harness Architect → UI Architect / product-ui-direction`

画面が育った後:

`product-ui-audit`

Mobile-firstなら:

`imagegen-frontend-mobile` をVisual Explorationとして追加候補。

調査量が多い場合:

`Research Agent / Agent-Reach`

repoが育って探索負荷が増えた場合:

`codebase-memory-mcp`

### Webサイト / Portfolio / LP

中心候補:

`UI Architect + design-taste-frontend`

ビジュアルから作りたい場合:

`image-to-code`

ブランド自体を考える場合:

`brandkit`

実験的・Awwwards系表現は必要時だけ強いTaste / Motion系Skillを使う。

複数案を実装して比較する意味がある場合だけOrcaを使う。

### DB・認証・保存契約・Migration

中心:

`Harness Architect`

必要に応じて:

- C2C
- grill-me（未決定事項が多い場合）
- archify（大きい既存コードの理解）
- codebase-memory-mcp（影響範囲探索が重い場合）
- focused review

重要なのはSkill数ではなく、

- データ消失
- 認可境界
- 部分保存
- false success
- rollback / recovery

など今回あり得る被害を判定できる最小限の証拠を揃えること。

---

## Harnessへ昇格させる条件

外部SkillやAgentは、見つけただけでは共通Harnessへ入れない。

以下のどれかを満たしたときに昇格を検討する。

1. 複数タスク / 複数プロジェクトで同じ失敗を防げた
2. AIが繰り返し間違える判断を安定して補える
3. 手作業や確認回数を明確に減らせる
4. 被害の大きい事故を低コストで防げる

一度しか必要にならない観点や、既存ルールで十分防げるものは自由帳のまま残す。

逆に、Harnessへ入れたSkillでも使われない・重い・重複していると分かったら撤去する。

---

## 運用方針

**全部入れない。**

新しいSkillやAgentを見つけたら、まずここへメモ。

実際の開発で、

> これがあれば今の作業が明確に楽になる

となったものだけHarnessへ昇格させる。

最終的には、**大量のSkillを常時積むのではなく、タスクに応じてHarness側が必要なSkill / Agentを選ぶ構成**を目指す。

このファイル自体を、UIテンプレートとは別軸の**共通AI開発Harness情報保管庫**として育てていく。
