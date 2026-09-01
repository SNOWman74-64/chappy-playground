# UI Lab — Shared Design Harness

このファイルは `chappy-playground` 内の UI / Web 表現モックを作る前に読む共通設計ルール。
個別モックの `DESIGN.md` より上位の、横断的な方針を置く。

## Purpose

- 見た目だけでなく「なぜこの構成なのか」を再利用可能な形で残す
- 参考元を毎回開かなくても、抽出した design DNA を repo 内で確認できるようにする
- Agent / Skill の有無に依存せず、DESIGN.md と過去知見から一定品質のモックを作れる状態を目指す
- モックを完成品ではなく、UI 仮説を素早く比較する実験単位として扱う

## Default workflow

1. Reference を観察する
2. 見た目ではなく Visual DNA / Layout / Interaction Rule を抽出する
3. 個別 `DESIGN.md` に保存する
4. Mock を実装する
5. 実機で見る
6. `RETROSPECTIVE.md` に具体的な失敗と修正を書く
7. 他でも使える知見だけ `ui-lab/LEARNINGS.md` に昇格する

## Design principles

### Rule before component

「カード」「モーダル」「タブ」などの部品名から考え始めず、まず情報の役割と視線の流れを定義する。

### Use the smallest hierarchy tool

情報を分けたい時は、最初に以下で解決できないか確認する。

- whitespace
- typography
- alignment
- divider / rule
- background shift
- annotation

それでも独立性を示す必要がある時だけ container / card を使う。

### Visual roles must be explicit

色・影・角丸・手書き・motion には役割を持たせる。
「なんとなくそれっぽい」で追加しない。

### Intentional imperfection is a tool

紙、手書き、editorial、tactile 系では完全整列を崩すことが有効。ただし、操作位置や読み順まで不規則にしない。

### Motion explains state or material

motion は装飾量を増やすためではなく、操作・状態変化・素材感を伝えるために使う。

## Required files for study mocks

新しく design study を追加する時は、可能なら以下を揃える。

- `index.html` — 実装
- `DESIGN.md` — Reference / Visual DNA / Tokens / Layout Anatomy / Principles / Adaptation
- `RETROSPECTIVE.md` — このモック固有の失敗・修正・未解決点
- `README.md` — 短い概要（任意。既存互換用）

一覧への登録は `mock-gallery/catalog.json` で行う。

## DESIGN.md minimum sections

```md
# Design

## Reference
## Intent
## Visual DNA
## Tokens
## Layout Anatomy
## Interaction / Motion
## Constraints
## Adaptation from reference
```

## RETROSPECTIVE.md minimum sections

```md
# Retrospective

## What worked
## What felt wrong
## Fixes
## Open questions
## Candidates for shared learnings
```

## Gallery contract

`mock-gallery` はモック本体に依存したレイアウトを持たない。
カタログ情報とドキュメントパスを読み、Preview / Design / Learnings を表示する薄い shell として扱う。

Dashboard の見た目は後で大きく入れ替えてよい。`catalog.json` と各モックのドキュメント契約はなるべく維持する。
