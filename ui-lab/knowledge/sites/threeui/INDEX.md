# SITE-THREEUI — ThreeUI

Status: `seed`

Source: https://threeui.com/browse

## Tags

- Three.js
- WebGL
- shader
- hero
- background
- interaction
- mobile adaptation

## Purpose in UI Lab

Three.js / shader / interactive Hero など、通常 UI に特殊表現を重ねる時の Reference 候補。

現時点では UI Lab 内で特定 component の再現 evidence がまだ紐付いていないため、**ThreeUI 固有の見た目を shared rule として扱わない。**

## Routed files

- `VISUAL-GRAMMAR.md` — hierarchy / composition / typography / surface / color
- `INTERACTIONS.md` — pointer / scroll / tap / drag / state transitions
- `MOBILE.md` — mobile への再構成・touch adaptation
- `PERFORMANCE.md` — WebGL / shader / density / fallback の観察
- `AVOID.md` — 再現時に避けるべき source-specific failure

AI は task に関係するファイルだけ読む。

## Promotion

ThreeUI の特定表現を study で再現したら、その結果をこの profile と study `RETROSPECTIVE.md` に紐付ける。

別 Reference / study でも同じ判断が有効だった場合のみ `../../../LEARNINGS.md` へ一般化する。
