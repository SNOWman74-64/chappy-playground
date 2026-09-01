# daybook — Cardless Notebook Design

## Reference

- Refero Styles / Superr
- https://styles.refero.design/style/cfd0fec1-f25a-4b9b-9bd0-d5b66960f2f2
- Studied: 2026-09-01

## Intent

同じ Superr 系の visual language を維持しながら、UI card / panel / dashboard の文法を禁止し、「本当にノートへ書いている」状態そのものをレイアウトにする。

## Visual DNA

- ruled notebook paper as the canvas
- red margin line and page numbers
- visible center binding / page edge
- handwritten annotation in orange / green
- paper tape, sticker, pencil, coffee ring
- editorial serif for strong statements
- handwriting for personal / informal text
- intentional imperfection without breaking reading order

## Tokens

### Color roles

- `#fffdf8` — notebook paper
- `#f8f1e8` — warm paper / mobile chrome
- `rgba(79,132,183,.20)` — blue rule lines
- `rgba(224,92,78,.48)` — red margin line
- `#1c1917` — main ink
- `#ff6f1e` — handwritten emphasis / accent
- `#598a62` — secondary handwritten note
- `#7098c8` — physical notebook object

### Typography

- Display: Fraunces
- UI: Inter
- Handwriting: Caveat

Large display text is used as written page content rather than as a card heading.

### Shape policy

- no rounded information cards
- no dashboard tiles
- no panel containers for ordinary content
- grouping comes from rule lines, whitespace, alignment, margin notes and type scale

## Layout Anatomy

### Desktop

1. Desk note above the notebook
2. Two-page notebook spread
3. Left page: opening statement + physical notebook object + editorial note
4. Right page: checklist + quote + index + orange ending area
5. Page tabs / tape / accidental marks as tactile details

### Mobile

The spread collapses into a single vertical notebook page.
Center binding disappears; red margin and blue rules remain.

## Interaction / Motion

### Scroll writing

Scroll position acts as pen progress.
Text is revealed left-to-right using horizontal clipping rather than a simple fade.

Current shared writing line:

- viewport top + ~62%
- once an element crosses that line, it writes over a short scroll distance
- vertical position naturally creates ordering; per-element arbitrary delays are avoided

### Drawn elements

SVG arrows use stroke-dashoffset so the line itself appears to be drawn.
Marker highlight grows left-to-right after the related text begins to appear.

### Checklist

A tiny JS interaction toggles handwritten orange check marks and strike-through.

## Constraints

- UI card components prohibited
- external images prohibited
- physical objects are CSS / HTML / inline SVG
- tactile imperfection should not randomize interaction targets or reading order

## Adaptation from reference

The original study translated reference design rules into a polished web landing page.
This version instead treats the notebook itself as the layout system.
The biggest translation is from `web containers` to `page grammar`:

- card → whitespace / ruled line
- badge → handwritten note
- section panel → page region
- UI accent → marker / annotation
- reveal animation → writing gesture
