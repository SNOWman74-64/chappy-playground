# UI / Mobile 検証ツール メモ

AI開発Harnessとは別に、UI Template / UI Verificationで使えそうな軽量ツールを置いておく。

> 方針: 日常確認は軽く、Agentによる自動検証は必要時、実機検証は本当に必要な変更だけ。

---

## Mobile View — Mobile Simulator & Preview

**種別:** Chrome Extension / Responsive Preview  
**状態:** 人間側の軽量モバイルUI確認候補

Chrome上で複数のスマートフォン・Tablet相当のViewportを並べ、レスポンシブUIを素早く確認するための拡張機能。

向いている用途:

- Mobile-first画面の崩れ確認
- 複数Viewportの比較
- 縦幅・overflow確認
- Desktop / Mobileを並べた目視確認
- 軽微なCSS変更後のQuick Check
- Screenshotや簡単な操作確認

重要:

- 本物のiPhone / Android OSを再現するものではない
- Safari固有挙動、soft keyboard、safe-area、実機performance、PWA standalone、Gesture差などの最終保証には使わない
- 軽微なUI変更ではこれで十分な場合が多く、Evidence Budget上必要がなければ毎回実機確認へ進まない

---

## Chrome DevTools MCP

**種別:** MCP / Browser Debugging / UI Verification  
**GitHub:** https://github.com/ChromeDevTools/chrome-devtools-mcp  
**状態:** Agent側のBrowser / UI Verification候補

Chrome DevTools公式チームのMCP Server。

Coding Agentから実際のChromeを操作・検査し、UI AutomationだけでなくDevToolsレベルのDebug / Performance解析を行える。

主な用途:

- Click / Form / Keyboard等のBrowser操作
- Viewport / Mobile / Touch emulation
- Screenshot / Page snapshot
- Console error確認
- Network request確認
- Performance trace / Core Web Vitals
- Lighthouse audit
- Memory / Heap snapshot解析

Harness v2ではCore dependencyにはせず、将来の `Browser / UI Verification Pack` 候補とする。

`codebase-memory-mcp` が「コード上の構造探索」を担当するなら、Chrome DevTools MCPは「実際のBrowser挙動のEvidence取得」を担当するイメージ。

---

## 想定する検証レイヤー

```text
日常の軽い目視確認
→ Mobile View

Agent自身によるBrowser検証
→ Chrome DevTools MCP

OS / Browser固有挙動や重要変更
→ 実iPhone / Android
```

すべてのUI変更で3段階を通すわけではない。

変更のFailure ModeとEvidence Budgetに応じて最小のレイヤーでSTOPする。

例:

- spacing / color / lightweight CSS → Mobile Viewだけで十分な場合あり
- click flow / console / network / responsive behavior → Chrome DevTools MCP候補
- iOS Safari / keyboard / PWA / gesture / real-device performance → 実機確認

---

## UI Templateとの将来接続

UI Template側は「どう作るか」の設計原則を持ち、検証ツール側は「実際にどうなっているか」のEvidenceを取る。

```text
UI Template
→ Design / Interaction Principle

実装
→ Codex

Verification
├─ Mobile View（Human quick check）
├─ Chrome DevTools MCP（Agent browser evidence）
└─ Real Device（必要時）
```

UI Template自体に特定ExtensionやMCPを必須依存させず、利用可能な検証Adapterとして扱う。
