# AERO — Apple Fluid Interaction Study

## Source

Primary source:
- `https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md`

This study does not treat “Apple-like” as a visual skin. The source skill defines Apple-style quality primarily through **response, direct manipulation, continuity, interruptibility, momentum, spatial consistency, material hierarchy, typography and restraint**.

---

## 1. Goal

Build a fictional product-marketing page that feels calm when untouched and physically responsive when touched.

The site should demonstrate:

- immediate press feedback,
- 1:1 pointer tracking,
- release velocity handoff,
- momentum projection,
- interruptible spring motion,
- rubber-band resistance at boundaries,
- reversible same-path sheet motion,
- restrained translucent material,
- size-aware typography,
- reduced-motion / reduced-transparency fallbacks.

The important question is not “does it animate like Apple?” but:

> Does the interface continuously respond to the user's current intent?

---

## 2. Product Fiction

### Brand
`AERO`

### Product
`AERO One`

A deliberately vague premium personal device. The visual is abstract enough that the study can focus on interaction grammar rather than a specific real-world Apple product.

### Tone
- quiet
- precise
- optimistic
- low-chrome
- product-first

---

## 3. Visual Grammar

### Canvas
- White primary sections.
- `#f5f5f7` secondary sections.
- `#1d1d1f` main ink.
- Muted warm gray secondary text.
- Blue is reserved for selected / primary action.

### Typography
Use system / SF-like fallback first.

Do not use one global tracking value.

Starting relationship:

```text
Hero display
→ very tight tracking
→ tight leading

Section heading
→ tight tracking
→ tight leading

Body / descriptive copy
→ near-neutral tracking
→ looser leading
```

The hierarchy should come from size + weight + leading together, not decorative styling.

### Shape
- Marketing scene: large soft radius.
- Interactive actions: full pill.
- Product object: strong but simple silhouette.
- Avoid card-everything composition.

---

## 4. Preferred Glass Material

Small floating controls reuse the previously selected `Soft Clear` preference:

```css
--soft-alpha: .11;
--soft-blur: 6px;
--soft-edge: .36;
```

This is intentionally clear rather than heavily frosted.

Use for:
- sticky navigation,
- small floating product label,
- lightweight “Explore details” affordance.

### Large sheet material

Large surfaces should read slightly thicker than small controls.

Starting point:

```css
--sheet-alpha: .22;
--sheet-blur: 16px;
```

This is a hierarchy change, not a separate glass theme.

Do not stack multiple light translucent surfaces on top of each other when legibility suffers.

---

## 5. Response Rule

Feedback begins on press, not after click completion.

```css
.pressable:active {
  transform: scale(.97);
}
```

No artificial delay is allowed in the direct input path.

---

## 6. Direct Manipulation

The finish carousel must track pointer displacement 1:1 during drag.

Rules:
- preserve grab position,
- use Pointer Events,
- use pointer capture,
- do not wait for a final swipe event,
- keep vertical page scrolling available (`touch-action: pan-y`),
- update with compositor-friendly transforms.

---

## 7. Velocity Handoff

A drag release is not treated as a stop.

Track recent pointer position + timestamp samples, calculate px/s release velocity, and use that velocity as the spring's initial velocity.

The drag and spring should feel like one continuous event.

---

## 8. Momentum Projection

Snap target is selected from projected movement, not only the release position.

Source-derived projection model:

```js
function project(velocity, decelerationRate = .99) {
  return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
}
```

This study uses `.99` for a relatively compact, snappy carousel.

---

## 9. Interruptibility

This is a core requirement.

A moving carousel or moving bottom sheet must be grabbable before it settles.

On new pointer-down:
1. stop the current spring,
2. keep the current presentation value,
3. start 1:1 manipulation from that current value,
4. never jump to the previous target.

Input is never locked just because a transition is in progress.

---

## 10. Spring Behavior

Gesture-driven motion uses a small runtime spring instead of fixed CSS keyframes.

Designer-facing parameters:
- damping ratio,
- response.

Starting values:

```text
Carousel settle
Damping ≈ .84
Response ≈ .38s

Bottom sheet
Damping ≈ .82
Response ≈ .32s
```

These values are starting points, not fixed brand constants.

Momentum-driven interactions may slightly overshoot. Non-gesture transitions should remain closer to critically damped behavior.

---

## 11. Rubber-band Boundaries

Carousel ends and sheet bounds should resist rather than hard-stop.

```js
function rubberband(overshoot, dimension, constant = .55) {
  return (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot));
}
```

The user should still feel continuous response even when there is nowhere further to go.

---

## 12. Spatial Consistency

The details sheet:
- enters from the bottom,
- is dragged vertically,
- dismisses to the bottom,
- can be interrupted while opening or closing.

Enter and exit use the same spatial path.

The page behind the modal sheet scales back slightly and dims proportionally to sheet progress so the hierarchy remains continuous during the drag.

---

## 13. Motion Scope

Do not make the entire marketing page constantly animate.

Motion belongs primarily to:
- pressed controls,
- dragged objects,
- selection / snap state,
- temporary sheet hierarchy.

No perpetual decorative motion is required.

The untouched state should still look complete.

---

## 14. Accessibility

### Reduced Motion
When `prefers-reduced-motion: reduce` is active:
- preserve direct-manipulation feedback,
- remove unnecessary spring travel where possible,
- settle immediately rather than overshoot.

### Reduced Transparency
When `prefers-reduced-transparency: reduce` is available:
- raise material opacity,
- remove backdrop blur,
- preserve hierarchy and readability.

### Increased Contrast
When `prefers-contrast: more` is active:
- strengthen borders,
- darken secondary text where needed.

---

## 15. Responsive Rule

Do not compress the desktop layout until it becomes unusable.

On narrow screens:
- hide nonessential nav links,
- preserve full-width drag area,
- keep product imagery large enough to read,
- stack principle/spec regions,
- keep bottom-sheet handle and primary actions comfortably tappable.

---

## 16. Source Principle Mapping

```text
Response
→ press feedback + no input delay

Direct manipulation
→ 1:1 carousel / sheet drag

Interruptibility
→ pointer-down stops spring at live position

Behavior over animation
→ runtime spring instead of prescribed keyframe clips

Velocity handoff
→ pointer history → px/s → spring velocity

Momentum projection
→ release target uses projected endpoint

Spatial consistency
→ sheet returns along same bottom path

Rubber-banding
→ soft resistance at carousel/sheet bounds

Materials & depth
→ Soft Clear small UI + thicker modal sheet

Typography
→ size-specific tracking / leading

Reduced motion / transparency / contrast
→ explicit platform media-query fallbacks
```

---

## 17. Design Priority

When principles conflict, use this order:

```text
1. Response / directness
2. User agency and interruptibility
3. Readability / accessibility
4. Spatial consistency
5. Visual material fidelity
6. Decorative polish
```

A visually perfect animation that cannot be interrupted is considered a design failure for this study.
