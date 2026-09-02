# FOLD — Spatial Card Curtain Study

## Sources

### Visual / composition source
- Refero Steep style: `https://styles.refero.design/style/75fdb89f-ca64-41b3-af36-7a78bd09448e`

Steep explicitly supports:
- near-monochrome warm paper,
- regular-weight editorial serif headings,
- generous whitespace,
- large soft cards around 24px radius,
- hairline borders / very quiet shadow,
- one rare peach accent surface,
- product surfaces presented as **floating artifacts rather than a dashboard shell**.

### Motion source
- `refero-apple-fluid`
- original Apple Design skill used by that study

Motion principles reused:
- immediate response,
- 1:1 direct manipulation,
- release velocity handoff,
- momentum-informed target selection,
- interruptible spring settling,
- no permanent animation loop,
- reduced-motion fallback.

### Writing source
- `refero-daybook-notebook`

Only the temporal reveal grammar is reused:
- left-to-right reveal,
- small opacity ramp,
- minimal vertical lift,
- semantic stagger after the selected artifact becomes stable.

---

## Goal

Test whether Steep-like floating product surfaces can become a tactile browsing system without collapsing into a conventional carousel or dashboard.

The derived interaction is a **spatial card curtain**:

```text
rear / small artifact
      ↘
 adjacent artifact
      ↘
 FRONT / large readable artifact
      ↙
 adjacent artifact
      ↙
 rear / small artifact
```

Horizontal drag rotates the whole artifact field. The front card becomes the semantic selection.

Important source distinction:

> The cylindrical / curtain interaction is **not claimed as part of the Steep source style**. It is an interaction experiment built from Steep's floating-artifact composition and Apple-fluid motion rules.

---

## 1. Visual Grammar

### Canvas
- Paper White as the dominant page surface.
- Fog / Mist only for quiet nested analytic marks.
- Ink Black for primary copy.
- Slate / Ash for supporting labels.

### Accent discipline
Use Blush Peach on only one primary artifact.

Do not use multiple chromatic cards to communicate selection.
Selection is communicated by **depth, scale and readability**.

### Typography
- Display / section headings use a regular-weight serif fallback.
- Product UI and metadata use a neutral sans.
- Avoid bold display serif.
- Large type should feel editorial, not dashboard-like.

### Cards
- radius ≈ 24px desktop,
- hairline borders,
- low-contrast shadows,
- enough internal breathing room that each surface reads as an independent product artifact.

---

## 2. Spatial Hierarchy

The curtain has five artifacts.

At any continuous position, every card receives a relative slot value.

That slot determines:
- horizontal position,
- Z depth,
- scale,
- Y offset,
- Y rotation,
- opacity.

Conceptually:

```text
relative 0
→ front / largest / full readability

relative ±1
→ adjacent / smaller / still recognizable

relative ±2
→ rear / smaller / lower opacity / context only
```

The user should not need a colored selected state to know which card is primary.

---

## 3. Direct Manipulation

Horizontal drag maps continuously to a scalar curtain position.

```text
pointer dx
÷ card step width
→ continuous card position
```

No final swipe event decides the motion while touching.

The deck must visibly follow the pointer as soon as horizontal intent is clear.

Vertical page scrolling remains available with `touch-action: pan-y` and an intent threshold.

---

## 4. Velocity Handoff

Recent pointer velocity is converted from px/s into cards/s.

```text
pointer velocity
÷ card step width
→ curtain velocity
```

That velocity is retained on release and becomes the initial spring velocity.

The drag and settle are one continuous physical state.

---

## 5. Momentum-Informed Selection

The resting card is selected from projected position rather than release position alone.

Current compact model:

```text
projected = position + velocity * projectionTime
snapTarget = round(projected)
```

The prototype uses a short projection window so a deliberate flick can advance a card without making the deck feel loose or unpredictable.

---

## 6. Interruptibility

A new pointer-down during settling must:
1. stop the current spring,
2. keep the live rendered curtain position,
3. start manipulation from that exact position,
4. remove the previous front-card reading state.

Never wait for the old target.

This is a non-negotiable Apple-fluid rule.

---

## 7. Spring Behavior

Use a calm, high-damping runtime spring.

The goal is:
- no decorative bounce,
- small overshoot only if the release velocity naturally creates it,
- quick but not abrupt selection certainty.

The spring updates only while settling.
There is no idle animation loop.

---

## 8. Front Card as Semantic State

Only the nearest settled artifact becomes `is-front`.

While the user is dragging or the deck is still settling:
- all reading animations are cleared,
- no card claims full reading priority.

After settle:

```text
spatial hierarchy stable
→ front card selected
→ internal explanation begins
```

This reuses the prior UI Lab principle:

> **Orient first. Explain second.**

---

## 9. Internal Motion Hierarchy

The container moves first.
The selected card's internal content moves second.

For the front card:

```text
artifact kicker
→ headline
→ body
→ chart stroke if present
```

Use Daybook-style horizontal reveal for copy.
Use a short deterministic line draw for the selected chart.

Do not animate all charts on all cards while the curtain is moving.

This creates a hierarchy:

```text
1. understand which object is front
2. then inspect what that object says
```

---

## 10. Responsive Composition

### Desktop
- wider arc,
- more side artifacts visible,
- stronger depth separation,
- front card can be relatively large.

### Mobile
- narrower card width,
- shorter effective arc radius,
- preserve adjacent-card visibility without letting them cover the front copy,
- keep vertical scroll available,
- keep the card large enough to read after settle.

As with prior 3D studies:

> Responsive spatial UI recomposes the shot rather than merely shrinking desktop coordinates.

---

## 11. Accessibility

### Reduced Motion
- direct manipulation remains user-controlled,
- release may settle immediately,
- writing reveal becomes immediately readable,
- chart strokes render complete.

### Keyboard
Left / Right arrows advance the curtain through the same spring path.

### Selection
Do not rely on peach or any other color for selected state.
Depth, scale, position, text label and front-card focus communicate priority.

---

## 12. Performance

No permanent `requestAnimationFrame` loop.

```text
drag
→ pointer events render directly

release
→ spring rAF
→ settle
→ stop
```

Keep card internals mostly static while moving.
Avoid animated blur, large filters and continuous chart motion.

---

## Success Criteria

1. The front card is obvious without a selected-color treatment.
2. Horizontal drag feels physically attached to the card field.
3. Release feels like a continuation of the drag.
4. A running settle can be interrupted without jumping.
5. Adjacent / rear cards provide context without competing with the front card.
6. Copy writes only after the spatial hierarchy is stable.
7. Mobile vertical scroll and horizontal curtain movement do not fight.
8. The page still reads as editorial floating artifacts rather than a dashboard carousel.
