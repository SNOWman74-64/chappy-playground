# Glass Lab — Apple-style Glass UI Study

## Reference
- Refero: https://styles.refero.design/style/aecac5da-f397-4ddf-b71f-de1efc434cb8
- Base visual grammar: Apple-style light canvas, product-first composition, restrained blue action color, hairline borders, minimal shadow.

## Goal
Apple系の静かな design grammar を壊さず、複数種類の **foreground glass UI** を同一ページ上で比較・操作できる study にする。

ガラスをページ全体の装飾テーマとして使わず、**context を保持したまま前景へ一時的な操作レイヤーを作る素材**として扱う。

---

## Base Design Grammar

### Canvas
- Primary: `#ffffff`
- Secondary section: `#f5f5f7`
- Main text: `#1d1d1f`
- Secondary text: muted warm gray
- Blue is reserved for primary actions / selected state.

### Typography
- System / SF-like sans fallback.
- Large headings use scale and tight tracking rather than decorative weight.
- Body remains 17–21px and airy.
- Dense UI labels stay small and restrained.

### Shape
- Product / demo containers: moderate radius, roughly 24–34px in this study.
- Interactive actions: fully rounded pill.
- Hairline borders before heavy shadows.

---

## Glass Material Model

Shared material variables:

```css
--glass-alpha: .56;
--glass-blur: 24px;
--glass-edge: .72;
```

Core recipe:

```css
background: rgba(255,255,255,var(--glass-alpha));
border: 1px solid rgba(255,255,255,var(--glass-edge));
backdrop-filter: blur(var(--glass-blur)) saturate(165%);
box-shadow: inset 0 1px 0 rgba(255,255,255,.76);
```

### Important rule
**Transparency is not the main source of glass.**
The material should be explained by:
1. background context,
2. blur,
3. saturation / slight contrast,
4. edge highlight,
5. restrained translucency.

If the background contains no useful color or detail, stronger transparency does not make the result more glass-like.

---

## Demo Set

### 01 — Floating Navigation
- Glass is a foreground navigation strip over colorful content.
- The surface stays fixed.
- Selected state moves as a brighter inner pill.
- Blue remains reserved for primary action.

### 02 — Glass Dock
- One persistent glass shell.
- Inner selection material slides between destinations.
- Icons may change selected color but the entire dock should not flash or recolor.

### 03 — Control Center
- Dense controls are grouped inside one local glass layer.
- Individual tiles use lower-contrast translucent sub-surfaces.
- Toggles and range inputs are interactive.

### 04 — Modal Sheet
- Modal uses stronger blur than navigation / dock.
- Backdrop remains visible and softly blurred.
- The modal does not replace the scene with a flat gray overlay.

### 05 — Lens
- Lightweight optical approximation.
- Uses blur + stronger saturation / contrast instead of full physical refraction.
- Pointer movement supported, with range slider as non-drag alternative.

### 06 — Notification Stack
- All cards use the same material recipe.
- Hierarchy comes from spacing, typography and order rather than different glass recipes.
- Notifications can be dismissed and restored.

---

## Responsive Rules

### Desktop
- Alternating text + large demo compositions.
- Keep demos large enough that backdrop context remains visible around the glass.

### Mobile
- Recompose every study into one column.
- Keep glass interactions full-width or nearly full-width.
- Do not shrink desktop two-column demos until controls become unreadable.
- Dock and floating nav preserve touch targets even if secondary actions are removed.
- Control Center becomes one column.

---

## Motion Rules
- Motion belongs to selected material / temporary UI, not the whole page.
- Selection pills slide rather than crossfade.
- Dismiss motion is short and directional.
- Avoid decorative perpetual animation; the backdrop should remain calm.
- Respect `prefers-reduced-motion`.

---

## Fallback Rule
When `backdrop-filter` is unsupported, glass becomes a high-opacity white surface rather than disappearing or becoming illegible.

---

## Do
- Let background color and content show through glass.
- Use stronger glass only when the layer needs more separation.
- Keep blue scarce.
- Use edge light and surface contrast before adding drop shadow.
- Treat glass as foreground hierarchy.

## Don't
- Turn every section into a translucent card.
- Make every glass object use a different blur recipe.
- Use transparency so high that text contrast collapses.
- Add heavy shadows just to signal elevation.
- Use glass where no underlying context needs to remain visible.
