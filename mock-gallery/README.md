# Mock Gallery

UI / Web 表現モックを、Preview だけでなく Design / Retrospective / Shared Learnings と一緒に確認するための専用ページ。

## Pages

- `index.html` — study 一覧ダッシュボード
- `viewer.html?id=<mock-id>` — 詳細ビュー
- `catalog.json` — 登録データ

## Add a new mock

### 1. mock folder を作る

推奨:

```text
my-new-mock/
├ index.html
├ DESIGN.md
├ RETROSPECTIVE.md
└ README.md
```

### 2. `catalog.json` に1件追加

```json
{
  "id": "my-new-mock",
  "title": "My New Mock",
  "shortTitle": "new mock",
  "summary": "何を検証するモックか",
  "previewPath": "../my-new-mock/",
  "designPath": "../my-new-mock/DESIGN.md",
  "retrospectivePath": "../my-new-mock/RETROSPECTIVE.md",
  "referenceUrl": "https://example.com/reference",
  "thumbnail": null,
  "tags": ["UI STUDY"],
  "principles": ["principle 1", "principle 2"]
}
```

これだけで一覧と詳細 viewer の両方に追加される。

## Thumbnail

現在は `thumbnail: null` の場合、モック本体を iframe で縮小表示する live preview を使う。

将来静的サムネへ切り替える場合は、例:

```json
"thumbnail": "../my-new-mock/thumbnail.webp"
```

Dashboard 側のレイアウト変更とは独立している。

## Document contract

### DESIGN.md

参考元を開き直さなくても設計構成を把握できる情報を置く。

- Reference
- Intent
- Visual DNA
- Tokens
- Layout Anatomy
- Interaction / Motion
- Constraints
- Adaptation from reference

### RETROSPECTIVE.md

そのモック固有の経緯を置く。

- What worked
- What felt wrong
- Fixes
- Open questions
- Candidates for shared learnings

### Shared files

- `../ui-lab/DESIGN.md`
- `../ui-lab/LEARNINGS.md`

個別モックで得た知見のうち、別モックにも有効なものだけ Shared Learnings へ昇格する。

## Layout policy

`index.html` と `viewer.html` の見た目は暫定 shell。
今後ダッシュボード案が固まったら大きく変更してよい。

守りたい契約は `catalog.json + mock docs` 側で、Dashboard layout ではない。
