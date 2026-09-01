# daybook — Design

## Reference

- Refero Styles / Superr
- https://styles.refero.design/style/cfd0fec1-f25a-4b9b-9bd0-d5b66960f2f2
- Studied: 2026-09-01

## Intent

Superr のブランドを複製せず、公開されている design system から「同じ空気を作るルール」を抽出し、架空の notebook brand `daybook` へ変換する。

## Visual DNA

- warm cream paper base
- oversized lowercase editorial typography
- orange as handwritten annotation rather than default UI fill
- thin outlined pill CTA
- weak shadows and tactile paper objects
- slightly rotated physical objects
- generous whitespace
- large orange ending band

## Tokens

### Color roles

- `#fdfbf9` — paper / primary canvas
- `#f7efe9` — warm secondary paper
- `#171717` — primary ink
- `#2b1a07` — warm dark accent
- `#ff6f1e` — handwritten marker / accent
- muted blue / pink / green — stationery object colors

### Typography

- Display: Fraunces / editorial serif
- UI: Inter / neutral sans
- Hand: Caveat / annotation

Type hierarchy is intentionally extreme. The display headline is allowed to dominate the viewport.

### Shape / border / shadow

- filled cards are not the main composition tool
- controls use thin border before solid fill
- radius stays moderate rather than soft-app-like everywhere
- shadows are low contrast and object-oriented

## Layout Anatomy

1. Sparse header / wordmark
2. Oversized statement headline
3. Physical notebook object as visual anchor
4. Short editorial explanation
5. Small supporting elements / stationery objects
6. Strong orange ending band

## Interaction / Motion

This first study keeps motion minimal. The design test is primarily about visual translation rather than interaction.

## Constraints

- no original Superr logo
- no original product images
- no copied marketing copy
- no external illustration asset
- notebook / labels / stationery are recreated in HTML / CSS / inline SVG

## Adaptation from reference

Reference の color role / scale / tactile language を維持しつつ、題材を `daybook` へ変更。
Web UI として整理する過程で一部 card-like grouping が残った。これが次の cardless study の起点になった。
