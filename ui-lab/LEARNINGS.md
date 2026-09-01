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

---

## L-006 — Critical motion visuals need a no-JS first frame

### Symptom

Canvas や runtime-generated particles を hero の唯一の visual にすると、初期化・animation loop・mobile WebView 差異のどれかで失敗した時に主役が完全に消える。

### Better rule

重要な visual は **JavaScript が一切動かなくても最低限成立する static first frame** を持つ。

Preferred progression for UI mocks:

```text
SVG / CSS
→ CSS + small JS enhancement
→ deterministic Canvas
→ Canvas physics
→ articulated particle rig
```

右へ進むほど「UI mock」から「graphics engineering」に近づく。

### Source

- `refero-collective-orbit`

---

## L-007 — Particle count does not create recognizability

### Symptom

粒子数を増やして具体的な動物や物体へ寄せても、小さい viewport では単なる particle cloud に見える。

### Why

具体物の認識を決めるのは主に：

- silhouette topology
- landmark placement
- joint continuity
- relative part scale
- motion articulation

であり、particle density だけではない。

### Better rule

具体物を particle 表現にする場合は、先に vector / solid silhouette や skeleton を成立させ、その geometry に particles を従わせる。

抽象ブランド visual なら、動物などを無理に認識させず orbit / vortex / wave / swarm のように topology が単純な motion を選ぶ。

### Source

- `refero-collective-orbit`

---

## L-008 — Mobile prototype motion should prefer deterministic behavior

### Observation

Desktop では成立する particle physics や簡易 rig でも、mobile viewport では少しの scale mismatch / joint error / initialization timing が visual failure として大きく現れる。

### Better rule

モバイル向け design prototype では、最初から physics realism を狙わず：

1. deterministic position
2. simple CSS transform
3. low-dimensional motion
4. stable silhouette

を優先する。

Motion は「止まっていても成立する visual」に追加する。

### Source

- `refero-collective-orbit`

---

## L-009 — Tiny SVG particles should not create their own viewport

### Symptom

小さい粒子を `<symbol viewBox>` + `<use>` で大量再利用したところ、iOS の実機表示で各粒子が巨大な三角形として描画され、画面全体を覆った。描画負荷も跳ね、ブラウザが落ちるケースまで発生した。

### Why

`<symbol>` は単なる path template ではなく独立した SVG viewport を持つ。`<use>` 側で `width / height` を明示しない使い方は、ブラウザ差異や transform と組み合わさると想定外のサイズ計算を起こしやすい。

### Better rule

数pxの repeated mark / particle では：

```text
<g id="particle"><path ... /></g>
```

または単純な `<path id="particle">` を再利用する。

`symbol + use` を使う場合は `width / height` を必ず明示し、実機モバイルで確認する。

さらに hero の装飾粒子では、filter / blur / drop-shadow / 大量の vector instance を一度に重ねない。

### Source

- `refero-collective-orbit`

---

## L-010 — Dense tool UIs should recompose on mobile, not compress

### Symptom

Desktop の editor / dashboard を mobile で各列だけ細くすると、overflow はしていなくても UI が窮屈になり、操作部品やラベルが互いに競合する。

Frameflow study では：

- persistent Layers rail
- timeline label column
- play / scrub / time
- multiple range controls

を desktop topology のまま縮小したことで、スマホ上で視覚的に崩れた。

### Why

Responsive design を `same structure + smaller numbers` と考えると、密度の高い tool UI では情報階層そのものが壊れる。

### Better rule

Mobile breakpoint ではまず **layout axis / persistence / grouping** を再判断する。

Examples:

```text
sidebar → horizontal toolbar / sheet
3 controls in one row → stacked controls
play + scrub + time in one row → two-row transport
2-column workspace → single-column flow
```

`min-width: 0` などの overflow 対策は必要だが、それだけを responsive design としない。

### Source

- `refero-frameflow-motion`
