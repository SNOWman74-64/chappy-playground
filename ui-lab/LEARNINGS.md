# UI Lab — Shared Learnings

複数モックへ再利用できる失敗・修正知見だけを置く。
具体的な経緯は各モックの `RETROSPECTIVE.md` に残し、ここでは一般化したルールを書く。

---

## L-001 — Card is not the default grouping tool

### Symptom

情報を整理すると、ほぼ全てが角丸カードになる。

### Why it happens

`information group = container` を早い段階で決めてしまい、余白・文字・線による階層設計を飛ばすため。

### Better rule

まず以下で分ける。

1. whitespace
2. typography
3. alignment
4. divider / rule
5. background shift
6. annotation

Card は「独立した物体 / 操作単位」であること自体に意味がある時に使う。

### Source

- `refero-daybook-notebook`

---

## L-002 — Scroll writing works better with a shared sight line

### Symptom

要素ごとに viewport trigger を細かく設定すると、画面に十分見えているのにまだ書かれない箇所が生まれる。

### Better rule

要素ごとの arbitrary delay を大量に持たせず、ユーザーの視線より少し下に共通の writing line を置く。

現在の notebook study では viewport 上端から約 62% を基準にしている。
要素自身の縦位置が自然な順番を作る。

### Source

- `refero-daybook-notebook`

---

## L-003 — Horizontal reveal needs vertical glyph bleed

### Symptom

左→右の `clip-path` reveal で `g / y / p / q / j` の descender が切れる。

### Better rule

横方向だけ隠したい場合でも、clip 領域の上下には font-relative な余白を持たせる。

Example:

```css
clip-path: inset(-.30em var(--clip) -.48em 0);
```

### Source

- `refero-daybook-notebook`

---

## L-004 — Preserve color roles, not only color values

### Observation

Reference の配色を真似るだけより、「その色が何のために使われているか」を維持した方が別ブランドへ変換しても空気が残りやすい。

### Example

Superr study では orange を primary CTA fill にせず、handwritten annotation / marker / accent ending に限定した。

### Better rule

Design extraction では hex 値と一緒に role を保存する。

### Source

- `refero-daybook`
- `refero-daybook-notebook`

---

## L-005 — Extract design grammar before copying layout

### Observation

Reference のスクリーン構成をそのまま複製しなくても、以下を揃えると同系統の見た目へかなり近づける。

- type scale
- spacing rhythm
- color roles
- border vs fill policy
- object-first composition
- imperfection level
- motion language

### Better rule

`Reference → visual grammar → new content` の順で作る。

### Source

- `refero-daybook`
