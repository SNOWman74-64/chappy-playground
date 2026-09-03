# codex-chatgpt-web メモ

**GitHub:** https://github.com/miuuyy/codex-chatgpt-web  
**種別:** Codex / ChatGPT Web Bridge  
**状態:** **Browser-only Pilot候補かなり高め / Full harnessはPilot後に再評価**  
**更新:** 2026-09-03

## 概要

Codex Desktop / CLIのnative model pickerにChatGPT Web側のモデルを追加し、CodexのTask / Context / UIを維持したまま、選択した推論をChatGPT Webへ流す非公式Bridge。

```text
Codex Task
    ↓ Responses / SSE
codex-chatgpt-web
    ↓ embedded browser
ChatGPT Web / Temporary Chat
```

Codexを操作する別Agentというより、**ChatGPT WebをCodexのModel Providerのように見せる**方向。

Free / GoではLuna、PlusではInstant〜High、ProではExtra High / Proまで、ChatGPT accountに露出しているmodeをCodex側へ出す。

---

## 2026-09-03時点で以前のメモから変わった重要点

### 1. Task単位のContinuous Chatへ進化

現在のREADMEでは、最初に現在のcompiled Codex task contextからfresh ChatGPT Temporary Chatを作り、**同一Taskのsequential messageはそのtask-bound Temporary Chatを再利用する**。

Context boundaryではcheckpointを書いた後にclean chatへ切り替え、必要ならcanonical Codex historyをfallbackとして使う。

つまり以前の単純な

```text
毎Turn fresh Chatへ全Context投入
```

という理解ではない。

**Task lifecycle / native compactionまでCodex側と合わせようとしている。**

### 2. Full harnessのPro制限が無くなった

以前のメモでは、ChatGPT ProはContextを受け取れる一方でlocal MCP tool callがread-only寄りという制約を書いていた。

現在は明確に:

- Instant
- Medium
- High
- Extra High
- **Pro**

の全listed effortで、Full harnessならcurrent Codex taskのlocal toolsを利用可能。

READMEにも **Pro has no separate restriction or reduced tool contract** と明記されている。

古いPro制限のメモは撤回。

### 3. Full harnessはOpenAI tunnel-client + ChatGPT connector

Full modeではofficial `openai/tunnel-client` を利用し、ChatGPTのtool callを現在のCodex Taskへ戻す。

Tunnelはoutboundで、public IP公開 / inbound port / router forwardingは不要。

一方で:

- ChatGPT Developer Mode
- Tunnel
- API key
- `Codex Native2` connector
- Allow all actions
- Browser login state

などTrust boundary / setup要素はBrowser-onlyよりかなり増える。

### 4. Subagent protocolも進んでいる

現在は:

```text
Compatibility V1
Native
```

のprotocolを持ち、NativeではCodex本来のfeature settingを維持しつつWeb-to-Web V2 delegationを扱う方向へ進んでいる。

単なる「Webへ1回質問するBridge」より、Codex Harnessへかなり深く統合されてきている。

---

## Browser-only

- Codex ContextをChatGPT Temporary Chatへ渡す
- ChatGPT Webで推論し、結果を同じCodex Taskへstream
- Codex Task / UI / Context lifecycleを維持
- local filesystem / shell / Codex toolsはWeb側から呼ばない
- Tunnel / MCP connector不要

現時点ではこれが最も試しやすい。

---

## Full harness

```text
ChatGPT Web
    ↓ MCP / Tunnel
codex-chatgpt-web
    ↓
current Codex Task tools
```

- filesystem
- shell
- image
- approvals
- configured tools / apps

まで現在のCodex Taskへ接続できる。

機能的にはかなり魅力的になったが、Browser automation + login state + Tunnel + Connectorという追加境界を持つ。

**まずBrowser-onlyでProvider切替自体の価値を確認してからで良い。**

---

# C2Cとの役割分離

現在使っているC2Cとは向きが違う。

```text
C2C
ChatGPT → Codex workspaceをread-only確認
→ PLAN / Independent Review

codex-chatgpt-web
Codex → ChatGPT WebをModel Providerとして利用
→ 同じCodex Task内で推論
```

したがって競合というより:

```text
Designer / Initial Reasoning
→ ChatGPT Web

Executor
→ Codex native

Independent Reviewer
→ C2C / ChatGPT
```

と分けられる。

C2CはCodex側のactive modelを切り替えずに独立レビューを差し込めるので、**独立性とmodel continuityを守る役として残す価値が高い。**

---

# 現時点で一番きれいそうな運用

## 1 Phase = 1 fresh Codex session

長いSessionの途中で何度もWeb / native modelを往復させない。

```text
Phase開始
    ↓
ChatGPT Web Pro / Extra High
要件整理・設計・Plan
    ↓
一度だけhandoff
    ↓
Codex native model
実装・Test・修正
    ↓
C2C Independent Review
    ↓
必要なら同じCodex nativeで修正
    ↓
C2C
    ↓
PHASE_COMPLETE
    ↓
Session終了

次Phase = fresh session
```

### 狙い

- Web版の推論枠をPhase冒頭の設計へ使う
- Codex native modelの途中切替を最小化
- 長寿命SessionのContext肥大化を避ける
- C2Cは外部reviewなのでCodex model continuityを壊さない
- Phase boundaryで必要Knowledgeだけ次へ持ち越す

頻繁な:

```text
Web → Codex → Web → Codex → 別Codex model → Web
```

は避ける。

---

# Phase間のContext handoff

次Phaseへは会話履歴全体ではなく、圧縮されたArtifactを持っていく。

最低限:

```text
- 完了したこと
- Decision
- Current architecture / contract
- 未解決事項
- 次Phaseの入口
- 必要なEvidence / Test result
```

だけ。

将来的には `Beads (bd)` のようなpersistent Task / Memory layerを使い、

```text
Phase complete
→ Task close / insight保存
→ fresh session
→ bd primeで必要情報だけ復元
```

も実験候補。

---

# 最初のPilot案

## Pilot A — Browser-only + Phase boundary

小さめProjectで2 Phaseだけ行う。

### Phase 1

1. Codex Task開始
2. ChatGPT Web Pro / Extra Highで設計
3. Planが固まったらnative Codexへ**1回だけ**切替
4. 実装 / Test
5. C2C independent review
6. 修正
7. `PHASE_COMPLETE`
8. Session終了

### Phase 2

完全fresh session。

前Phaseからはhandoff Artifactだけ読む。

### 比較するもの

- Codex usage消費
- Web側rate limit
- Web → native handoff時の認識ズレ
- Context再読量
- C2C loopの自然さ
- native-only Taskと比較した実装速度 / 品質

**Usage回避を目的化せず、Provider分離が本当に開発体験を改善するかを見る。**

---

# Full harnessを再評価する条件

Browser-only Pilotで以下が確認できたらFull harnessを試す価値が上がる。

1. Web modelの設計 / 推論品質が明確に役立つ
2. Codex Taskへのhandoffが安定する
3. Web側のrate limitが実用上問題にならない
4. Web modelから直接Toolを使いたい場面が繰り返し出る
5. Tunnel / Connectorの追加Trust boundaryを受け入れる価値がある

その時点で:

```text
Web Designer
→ Web Executor / Subagent
→ Codex native
→ C2C independent review
```

まで拡張する。

---

# 注意点

- OpenAI公式のCodex機能ではない
- ChatGPT Web UIのbrowser automationに依存するため、UI / selector変更で壊れる可能性がある
- fail-closedを重視しているが、追加runtime自体が故障点になる
- Browser login stateは機密情報として扱う
- loopbackは同一OS userのprocessから到達可能な境界を持つ
- 仕事PC / 会社コードへ安易に入れない
- Temporary Chatもlocal inferenceではなくOpenAIへ処理される
- Usage / quotaを「回避するツール」としてではなく、別Provider / Harness実験として扱う

---

# 現時点の判断

以前:

> **メモのみ。導入しない。**

現在:

> **Browser-onlyは小さいLab ProjectでPilotする価値がかなり高い。Full harnessはPilot後。**

理由:

1. Codex native model pickerへかなり深く統合されている
2. task-bound Temporary Chat / native compaction対応が進み、単純BridgeよりSession continuityが良くなった
3. Full harnessではProを含む全listed effortでTool contractが揃った
4. Web → Codex → C2Cという現在の理想フローとRole分離できる
5. 1 Phase = 1 fresh session運用なら、頻繁なmodel switchingを避けながら評価できる

まずは**Browser-only + 2 Phaseの小規模Project**で実測する。
