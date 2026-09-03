# AI開発ツール最新ウォッチ — 2026-09-03

既存の `ai-dev-toolbox-notes.md` を置き換えるものではなく、**「今触ると開発環境そのものが変わる可能性があるもの」**を優先して、2026-09-03時点の最新候補を追加で調べたメモ。

方針:

- 既存メモにある C2C / CodexHost / Orca / codebase-memory-mcp / ECC / Taste Skill 等とはなるべく重複させない
- 公式リポジトリ・公式ドキュメントを優先
- 全部導入しない
- 小さいLab projectで1機能ずつ検証し、明確に効いたものだけ共通Harnessへ昇格

---

## 今回の結論

| 候補 | 環境への影響 | 導入コスト | 今の開発フローとの相性 | まず試す度 |
|---|---:|---:|---:|---:|
| **Beads (`bd`)** | ★★★★★ | 中 | ★★★★★ | ★★★★★ |
| **Chrome DevTools for agents** | ★★★★★ | 低〜中 | ★★★★★ | ★★★★★ |
| **GitHub Spec Kit** | ★★★★★ | 中 | ★★★★☆ | ★★★★☆ |
| **Serena** | ★★★★☆ | 中 | ★★★★☆ | ★★★★☆ |
| **Context7** | ★★★☆☆ | 低 | ★★★★☆ | ★★★★☆ |
| **OpenAI codex-plugin-cc** | ★★★★☆ | 低〜中 | ★★★★☆ | ★★★★☆ |
| **OpenSpec** | ★★★★☆ | 中 | ★★★★☆ | ★★★☆☆ |
| **WebMCP** | ★★★★☆（将来性） | 中 | ★★★☆☆ | ★★★☆☆ |
| **Superpowers / Gas Town** | ★★★★★（思想） | 高 | ★★☆☆☆ | ★★☆☆☆ |

現時点で特に気になるのは、**Beads + Chrome DevTools for agents**。

- Beads: Phaseごとにfresh sessionへ切り替える運用の「外部記憶 / Task graph」候補
- Chrome DevTools for agents: UI実装後のブラウザ検証・Network・Console・Performance・MemoryをAgent自身に観測させる候補

Spec Kit / OpenSpecは、今の自作Harnessへすぐ混ぜるより**小さい新規Projectでワークフローそのものを比較**するのが良さそう。

---

# 1. Beads (`bd`)

**種別:** Agent Task Graph / Persistent Memory  
**GitHub:** https://github.com/gastownhall/beads  
**状態:** 最優先Lab候補

AI Agent向けの、依存関係を持つIssue / Task graph + 永続メモリ。

単なるTODO管理ではなく、長いAgent作業で問題になりやすい

- Sessionを跨ぐと前提が消える
- MarkdownのTODO / SESSION-NOTESが肥大化する
- 何がBlockerで何が今実行可能かをAgentが毎回読み解く
- 古い完了タスクがContextを圧迫する

を、構造化されたTask graphとして外へ逃がす方向。

主なコマンド:

```text
bd ready                  # blockerの無い実行可能Task
bd show <id>              # Task詳細
bd update <id> --claim    # Taskをclaim
bd close <id>             # 完了
bd prime                  # Agent向けworkflow context / memoryを取得
bd remember "insight"     # Project memoryを保存
```

特に面白い点:

- Doltベースのversion-controlled SQL storage
- Task間のdependency graph
- `bd remember` によるProject memory
- `bd prime` でfresh sessionへ必要情報を再注入
- 完了済み古いTaskを要約する **semantic memory decay / compaction**
- Codex向け `bd setup codex` が用意されている
- Windows対応
- `--stealth` でProject本体へ強く侵入させず個人用途にもできる

### 今のPhase運用との噛み合わせ

理想:

```text
Phase A
Web設計
  ↓
Codex実装
  ↓
C2C review
  ↓
bd close / bd remember
  ↓
Session終了

Phase B = fresh Codex session
  ↓
bd prime
  ↓
必要なTask / Decisionだけ復元
  ↓
実装
```

今考えている**「1 Phase = 1 fresh Codex session」**を成立させる外部記憶としてかなり面白い。

### 注意

小さい変更まで全てBeadsへ登録すると逆に重くなる可能性がある。

まずは:

- 2〜3 Phase以上あるLab project
- Sessionを跨ぐタスク
- dependencyが実際に存在する変更

だけで試す。

**評価したいこと:** `SESSION-NOTES.md` + 手動handoffより本当に再開が軽くなるか。

---

# 2. Chrome DevTools for agents (`chrome-devtools-mcp`)

**種別:** Browser Debugging / Performance / MCP + CLI  
**GitHub:** https://github.com/ChromeDevTools/chrome-devtools-mcp  
**公式Docs:** https://developer.chrome.com/docs/devtools/agents  
**状態:** 最優先Lab候補

Chrome DevToolsをCoding Agentへ直接渡す公式系ツール。

Agentがlive Chromeに対して:

- Network request確認
- Console error確認（source mapを含む）
- Screenshot
- Performance trace取得 + insight抽出
- Browser操作
- Puppeteerによるautomation
- Memory / heap関連の診断

などを行える。

### 今のUI開発に効きそうな理由

これまでのUI検証は主に:

```text
Codex
↓
Playwright / Browser確認
↓
Screenshot / test result
```

だった。

Chrome DevTools for agentsを足すと:

```text
症状を見る
↓
Network / Console / Performance traceで原因を観測
↓
Codexが修正
↓
同じBrowserで再確認
```

という**診断レイヤー**をAgent自身に渡せる。

Playwrightと競合というより:

- Playwright = 再現可能なAcceptance / Interaction test
- Chrome DevTools = 原因調査 / Performance / Network / Console / Memory

として併用するのが良さそう。

`--slim` / `--headless` もあり、毎回フル機能を積む必要はない。

### 注意

Browser内の情報をMCP clientへ見せられるので、個人情報やログイン済みサービスを開いたProfileと混ぜない。

Usage statisticsは既定ONなので、必要なら `--no-usage-statistics` を使う。

---

# 3. GitHub Spec Kit

**種別:** Spec-Driven Development Harness  
**GitHub:** https://github.com/github/spec-kit  
**Docs:** https://github.github.io/spec-kit/  
**状態:** 新規mini projectで評価したい

GitHub公式のSpec-Driven Development toolkit。

2026-08に1.0.0へ到達しており、現在の基本フローは:

```text
Constitution
↓
Specify
↓
Plan
↓
Tasks
↓
Implement
↓
Converge
↓
必要なら Implement ↔ Converge
```

つまりPromptの会話履歴を主な状態にせず、**Spec / Plan / TasksなどのArtifactをProject側へ残してAgentを進める**。

これはPhaseごとfresh sessionにする考えとかなり近い。

### 面白い追加要素

- Bug extension: assess → fix → test
- Idea assessment: intake → research → define → shape → decide
- Extensions / Presets / Bundles
- Codexを含む複数Coding Agentへ統合可能

### 今のHarnessとの関係

自作Harnessが目指している

- Role分離
- Phase boundary
- Durable knowledge
- Focused verification

と重なる部分が多い。

ただし、LIFTLOGへいきなり入れると**既存Harnessとの評価軸が混ざる**。

まずは小さい新規ProjectをSpec Kitだけで1周させ、

- 仕様Artifactが本当にSession跨ぎに効くか
- Plan / Taskが過剰にならないか
- C2C independent reviewをどこへ差すと自然か

を観察する。

---

# 4. Serena

**種別:** Semantic Code Retrieval / Editing / Refactoring MCP  
**GitHub:** https://github.com/oraios/serena  
**状態:** 大きめrepo用の実験候補

AgentへIDE相当のsymbol-level toolingを渡すMCP。

主な能力:

- Symbol検索
- File outline
- Reference探索
- Declaration / Implementation探索
- Diagnostics
- Symbol rename
- Symbol body単位の編集
- Safe delete
- Project memory

LSP backendは40以上の言語を扱う。

### `codebase-memory-mcp` との違い

既存メモの `codebase-memory-mcp` と似て見えるが、役割は少し違う。

```text
codebase-memory-mcp
= 構造をGraphとして保持し、探索 / Context取得を軽くする

Serena
= 現在のコードへIDE的なsemantic navigation / refactor / editを行う
```

つまりSerenaの方が**Executorの手そのものを変える**。

特に:

- cross-file rename
- 参照関係を見た修正
- Java / TypeScriptの大きめrepo
- text searchだけでは事故りやすいrefactor

で効く可能性がある。

小規模Projectの文言変更などには重いので、常時必須にはしない。

---

# 5. Context7

**種別:** Latest Library Docs / CLI + Skill / MCP  
**GitHub:** https://github.com/upstash/context7  
**状態:** 低コスト実験候補

Coding Agentへ、version-specificな最新Library docs / code examplesを取得させる仕組み。

CLI + SkillとMCPの両方がある。

```text
古いTraining knowledgeでAPIを推測
↓
Context7から対象VersionのDocsを取得
↓
実装
```

Cloudflare / Supabase / React / Next.jsなど、APIや設定が変わりやすいものと相性が良い。

### 良さそうな使い方

常にContextを大量投入するのではなく、

```text
「外部Library/API仕様が必要」
↓
Context7で該当部分だけ取得
```

というResearch / Docs Packとして使う。

### 注意

Context7内のProject docsはcommunity-contributedなものも含まれるため、Security / Migrationなど高リスク領域では最終的に公式一次情報も確認する。

---

# 6. OpenAI `codex-plugin-cc`

**種別:** Official Claude Code ↔ Codex Bridge / Review / Delegation  
**GitHub:** https://github.com/openai/codex-plugin-cc  
**状態:** Claudeを再びHarnessへ入れるならかなり面白い

OpenAI公式のClaude Code plugin。

Claude Code側から:

- `/codex:review`
- `/codex:adversarial-review`
- `/codex:rescue`
- `/codex:transfer`
- `/codex:status`
- `/codex:result`
- `/codex:cancel`

を利用できる。

特に面白いのは **`/codex:transfer`**。

現在のClaude Code sessionからpersistent Codex threadを作り、`codex resume <session-id>` でCodex App / TUIへそのまま継続できる。

```text
Claude Code
設計 / 調査
  ↓ /codex:transfer
Codex persistent thread
  ↓
Codex App / CLIでresume
```

これは「Agent間handoffをMarkdown copy-pasteではなく、Harnessの正式なSession importで行う」実例としてかなり参考になる。

### 今のC2Cとの関係

C2Cは:

```text
Codex実装 → ChatGPT independent read-only review
```

`codex-plugin-cc` は逆方向に近く:

```text
Claude → Codexへdelegation / transfer
```

なので競合しない。

ただしCodexへ委譲した分はCodex usageを消費する。usage節約目的ではない。

Review gateは便利そうだが、自動loopが長くなりusageを大量消費し得るという公式警告もあるため、常時ONにはしない。

---

# 7. OpenSpec

**種別:** Spec-Driven / Change-Oriented Workflow  
**GitHub:** https://github.com/Fission-AI/OpenSpec  
**状態:** Brownfield用のSpec Kit比較候補

Spec Kitと同じく、会話だけで進めずspec / task artifactを残す方向。

違いとして特に面白いのは**brownfield-first**な考え方。

既存Project全体を最初から文書化するのではなく、変更する領域だけspecを育てていく。

概念:

```text
Explore
↓
Propose change
↓
Apply
↓
Archive
↓
Current behavior specへ反映
```

LIFTLOGのような既存Projectでは、Spec Kitより自然な可能性がある。

### 試し方

Spec KitとOpenSpecを同じProjectへ同時導入しない。

- 新規mini project → Spec Kit
- 小さい既存demoへ機能追加 → OpenSpec

で別々に比較する。

---

# 8. WebMCP

**種別:** Experimental Web Standard / Agent-ready Web UI  
**公式:** https://developer.chrome.com/docs/ai/webmcp  
**状態:** 今すぐHarness基盤ではないが、かなり面白いLab題材

Webサイト側がBrowser Agentへ、DOMをクリックさせる代わりに**構造化されたTool**を公開するための提案規格。

イメージ:

```text
従来
Agent → DOMを見てボタンを探す → click

WebMCP
Web app → structured toolを公開
Agent → toolとして直接操作
```

JavaScript APIによるimperativeなtool定義と、HTML annotationによるdeclarativeな方向が検討されている。

Chrome側では実験的に進んでおり、Chrome DevTools for agentsからWebMCP toolを確認・実行する流れも出てきている。

### なぜ面白いか

今後、Webアプリを

- 人間向けUI
- Agent向けstructured interface

の両方を持つように設計する可能性がある。

Rabbit Holeや将来のAI操作前提の個人Webアプリにも繋がる。

### 注意

まだexperimental。

Tool manifest / output経由のprompt injection、悪意あるTool、権限境界などSecurity論点が大きいので、本番データを扱うProjectへ早期導入しない。

---

# 9. Superpowers / Gas Town — 直接導入より観測

## Superpowers

**GitHub:** https://github.com/obra/superpowers

強いSkill-driven development methodology。

Brainstorm / Plan / TDD / Reviewなどをかなり厳格にSkillとして適用する。

完成度・人気とも非常に高いが、現在の

> 小変更までHarnessが重くならないようRisk-basedに工程を選ぶ

という思想とは衝突しやすい。

**丸ごと導入より、Skillの評価方法やWorkflow設計を採掘する資料。**

## Gas Town

**GitHub:** https://github.com/gastownhall/gastown

多数のAgent、Task、Session lifecycle、handoff、merge queueなどを扱う大規模multi-agent orchestration。

Orca / CodexHostよりさらに上の「Agent組織」寄り。

今の個人開発には過剰だが、BeadsがこのecosystemのTask / memory層なので、まずBeadsだけ触れば十分。

---

# まず作るならこの3つのLab

## Lab A — `phase-handoff-lab`

**目的:** fresh session運用が本当に軽くなるか検証

使うもの:

- Beads
- Spec Kit **または** OpenSpec
- Codex
- C2C

流れ:

```text
Phase 1
Web / Specで設計
↓
Codex実装
↓
C2C review
↓
BeadsへTask close + 学び保存
↓
Session終了

Phase 2
完全fresh Codex session
↓
bd prime / Artifactだけ読む
↓
実装
↓
C2C
```

見るもの:

- 再開時に必要なread量
- handoff漏れ
- Codex usage
- Sessionが長寿命化しないか
- Markdown handoffより楽か

---

## Lab B — `browser-agent-lab`

**目的:** Agentに「画面を見る」だけでなく「原因を診断」させる

使うもの:

- Chrome DevTools for agents
- Playwright（必要なら）
- Codex

わざと:

- 失敗するAPI request
- Console error
- 重いrender
- 小さいmemory leak

などを入れ、Agentだけで原因→修正→再検証まで行えるかを見る。

LIFTLOGへ持ち込む価値を最も短時間で判定できそう。

---

## Lab C — `webmcp-lab`

**目的:** 「Agentが操作しやすいWebアプリ」を体験する

小さいCRUD / メモアプリなどで:

```text
Human UI
+ WebMCP tool 2〜3個
```

だけ作る。

例:

- `create_note`
- `search_notes`
- `archive_note`

DOM automationとの安定性の違いを見る。

---

# 現時点の導入順

```text
1. Chrome DevTools for agents
   → 既存のWeb開発へ直接効きやすく、効果判定も速い

2. Beads
   → 2 Phase以上のmini projectでfresh session handoffを評価

3. Spec Kit
   → 新規mini projectを最初から最後まで1周

4. Context7
   → API / Library調査時だけoptionalで試す

5. Serena
   → 大きめrepoでsemantic refactorを比較

6. OpenSpec
   → Brownfield変更でSpec Kitと比較

7. WebMCP
   → 将来向けの遊び / 研究Project
```

`codex-plugin-cc` はClaude Codeを開発フローへ戻したくなった時点で割り込ませる。

---

# Harnessへ昇格させる判断

今回も「面白い」だけではCoreへ入れない。

昇格条件:

1. Session跨ぎのContext量を実際に減らした
2. 手動確認 / copy-pasteを減らした
3. Agentが観測できなかったFailureを観測可能にした
4. 同じ種類の失敗を2回以上防いだ
5. 追加ToolのTrust boundary / maintenance costより利益が大きい

特にBeads / Spec Kit / SerenaはHarnessを肥大化させる可能性もあるので、**Labで勝ったものだけ残す。**

---

## Source links

- Beads: https://github.com/gastownhall/beads
- Chrome DevTools for agents: https://github.com/ChromeDevTools/chrome-devtools-mcp
- Chrome DevTools docs: https://developer.chrome.com/docs/devtools/agents
- GitHub Spec Kit: https://github.com/github/spec-kit
- Serena: https://github.com/oraios/serena
- Context7: https://github.com/upstash/context7
- OpenAI codex-plugin-cc: https://github.com/openai/codex-plugin-cc
- OpenSpec: https://github.com/Fission-AI/OpenSpec
- WebMCP: https://developer.chrome.com/docs/ai/webmcp
- Superpowers: https://github.com/obra/superpowers
- Gas Town: https://github.com/gastownhall/gastown
