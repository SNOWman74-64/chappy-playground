# codex-chatgpt-web メモ

**GitHub:** https://github.com/miuuyy/codex-chatgpt-web  
**種別:** Codex / ChatGPT Web Bridge  
**状態:** 技術メモ / 要ウォッチ。現時点では導入優先度低め

## 概要

Codex Desktop / CLIのモデル選択にChatGPT Web側のモデルを追加し、CodexのTask / Context / UIを維持したまま、選択した推論ターンをChatGPT Webへ流す非公式Bridge。

概念的には:

```text
Codex Desktop / CLI
        ↓
codex-chatgpt-web
        ↓
Embedded browser
        ↓
ChatGPT Temporary Chat
```

Codex側を操作する別Agentというより、**ChatGPT WebをCodexのModel Providerのように見せる**方向。

## モード

### Browser-only

- Codex ContextをfreshなChatGPT Temporary Chatへ送る
- ChatGPT Webで推論し、結果をCodex Taskへstreamする
- local filesystem / shell / Codex toolsはChatGPT側から呼ばない
- setupが比較的軽い

### Full harness

OpenAI Tunnel + MCP connectorを介し、ChatGPT Webから現在のCodex TaskのToolへ接続する。

```text
ChatGPT Web
    ↓ MCP / Tunnel
codex-chatgpt-web
    ↓
Codex Task tools
```

Instant〜Extra HighはTool利用可能。ChatGPT ProはContextを受け取れるがlocal MCP tool callはread-only側に制約がある。

## C2Cとの違い

現在利用しているC2Cとは向きが逆に近い。

```text
C2C
ChatGPT → Codex workspaceをread-only確認
→ PLAN / Independent Review

codex-chatgpt-web
Codex → ChatGPT WebをModelとして利用
```

現状C2Cで、

- workspace確認
- PLAN
- diff review
- independent review

が十分機能しているため、**同じ問題をもう一度解く目的では導入しない**。

## Harness v2との関係

Harness v2ではReviewer Roleと具体Providerを分離しているため、将来的には概念上:

```text
Independent Reviewer
├─ C2C / ChatGPT
├─ Claude CLI Adapter
└─ ChatGPT Web Adapter候補
```

のようなProvider / Access Path候補にはできる。

ただし現時点ではCoreへ組み込まない。

## 面白い点

- Codex UI / Task lifecycleを維持したままChatGPT Webを利用する設計
- ChatGPT Temporary ChatをTaskごとに使う
- Browser-onlyとFull harnessを分離している
- MCP / OpenAI Tunnel経由でCodex Toolへ戻す構造
- Model selectionやselector driftでfail-closedを重視している

HarnessのProvider Adapter設計やTool boundaryを考える資料として面白い。

## 注意点

- OpenAI公式のCodex機能ではない
- ChatGPT Web UIのbrowser automationに依存するため、UI / DOM変更で壊れる可能性がある
- Browser login state、Tunnel、MCP、local toolsを接続するFull modeはtrust boundaryが増える
- 同一OS userのprocessからloopback経由で触れ得る境界にも注意
- Usage limit / quota回避用途として扱わない

## 現時点の判断

**メモのみ。導入しない。**

理由:

1. C2Cが既にChatGPTによる設計・Independent Review経路として実用になっている
2. Harness v2 Pilot前にProviderを増やすと評価軸が混ざる
3. 非公式Web Bridgeという追加故障点を増やすほどの未解決課題が現在はない

再評価条件:

- Codex内からChatGPTへ直接委譲したい要求が明確に増える
- C2Cの往復が実際のボトルネックになる
- Reviewer Providerを複数切り替える価値が実運用で確認される

それまでは、**面白いProvider Bridge実装例 / Harness設計資料**として保存する。
