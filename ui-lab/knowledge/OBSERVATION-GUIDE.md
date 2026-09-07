# UI Reference Observation Guide

外部 UI を見た時に「何が好きか」「なぜ成立しているか」を再現可能な形へ分解するための観察ガイド。

これは評価基準や恒常ルールではない。共有ルールは `../DESIGN.md`、実証済み知見は `../LEARNINGS.md` が正本。

## Quick capture

最初は細かく分析せず、以下だけ残せばよい。

```text
URL:
Reference ID:

好きなところ:
-

気になった領域:
- Layout / Typography / Motion / UX / Component / 3D / Mobile / etc.

理由:
- 分からなくてもよい
```

特に好きな Reference だけ深掘りする。

## Deep observation axes

### Composition / Layout

- alignment と画面内の重心
- content max-width と余白
- Hero の構図
- grid / section rhythm
- 画像と文字の比率

### Information hierarchy

- 最初に見るもの
- 次に見るもの
- 必要な時だけ見るもの
- Primary / Secondary / Utility の強弱

### Typography

- family / weight / scale / line-height / tracking
- 日本語と英字のバランス
- 1行の長さ
- 数値の扱い

### Spacing / Density

- section 間隔
- heading と body の距離
- component 内部 padding
- どこを空け、どこを詰めているか

### Surface

- card / divider / background shift の使い分け
- border / shadow / radius の役割
- nested surface の有無

### Color

- base / accent / neutral / semantic の役割
- 色数、彩度、背景色の差

### Image / Illustration / Icon

- 主役か補助か
- crop / stroke / density
- decoration と information の分離

### Motion

各 motion を `Feedback / State transition / Hierarchy / Navigation / Storytelling / Decoration` のどれかとして観察する。

- duration / easing
- hover / press / drag
- scroll / page transition
- disclosure / loading

### Navigation / Flow

- header / sidebar / bottom nav / sheet / tabs
- 次に進める場所が迷わず分かるか

### Interaction / State

- hover / press / focus
- disabled / loading / empty / error / success
- editing / selection / search / filter

完成状態だけでなく、状態遷移の途中も見る。

### Responsive / Mobile

- mobile で構造そのものが変わるか
- navigation / typography / grouping の変化
- touch target / safe area / fixed UI
- keyboard 表示時
- horizontal interaction の扱い

### 3D / WebGL

- 3D が情報構造の主役か背景か
- camera framing
- pointer / touch の対応
- static first frame
- mobile 時の density / fidelity / fallback

## Deep-study flow

```text
Reference
→ Reproduction
→ My Version
→ RETROSPECTIVE
→ repeated preference or failure
→ LEARNINGS candidate
```

サイト固有の抽出結果は `sites/<site>/` に保存し、横断ルールへ昇格するまではそのサイトの知識として扱う。
