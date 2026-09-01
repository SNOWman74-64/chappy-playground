# AERO — Retrospective

## Summary

This study uses `emilkowalski/skills/apple-design` as an interaction source rather than treating Apple-like design as a visual preset.

The page deliberately reuses the quiet Apple-style canvas and the previously selected Soft Clear material, but the main experiment is **behavior**:

- direct manipulation,
- velocity continuity,
- momentum projection,
- interruptible spring motion,
- rubber-band boundaries,
- same-path sheet dismissal.

---

## What worked conceptually

### 1. Apple-like feel is easier to explain as behavior than as styling

The strongest difference from the earlier Glass Lab is that translucency is no longer the main experiment.

Glass now supports hierarchy while the experience is carried by:

```text
pointer movement
→ presentation value
→ release velocity
→ projected endpoint
→ spring settle
```

This produces a much more concrete definition of “fluid” than choosing a particular easing curve.

### 2. Interruptibility creates a useful implementation constraint

The carousel and sheet do not disable input while springing.

A new pointer-down cancels the active spring but preserves the current rendered value. This prevents the common jump where an interrupted UI restarts from its previous logical target.

### 3. Rubber-band is useful feedback even when movement is impossible

At carousel edges, movement continues with increasing resistance rather than freezing. This communicates “there is no more content” without removing direct response.

### 4. Material hierarchy works better when glass is not global

The navigation and small floating controls use the preferred Soft Clear values:

```text
Blur 6px
Opacity 11%
Edge 36%
```

The bottom sheet is intentionally heavier because its role requires more separation.

This keeps the material language consistent while allowing hierarchy.

---

## Implementation choices

### Vanilla runtime spring

The prototype uses a small `requestAnimationFrame` spring rather than a library.

Reason:
- keeps the demo self-contained,
- makes velocity handoff explicit,
- makes interruption mechanics visible in the implementation,
- avoids dependency cost for a one-page study.

For a production app, a well-tested spring library may be preferable.

### Momentum projection

The carousel uses projected release position before choosing a snap index. The study uses a relatively snappy deceleration rate (`.99`) rather than a long scroll-like coast.

### Bottom sheet

Sheet progress continuously controls:
- sheet Y position,
- scrim opacity,
- background scale,
- background corner radius.

The hierarchy therefore follows the finger instead of appearing only after release.

---

## Risks / things to validate on device

This version has JavaScript syntax validation but still needs real-device interaction review.

Especially validate:

1. iOS horizontal drag while preserving vertical page scroll.
2. Fast repeated grab → release → grab interruptions.
3. Sheet flick velocity sensitivity.
4. Safari fixed-position + body scroll locking behavior.
5. Orientation / viewport resize while sheet is open.
6. High refresh-rate displays and whether spring integration still feels stable.

The spring timestep is capped to reduce large-frame instability, but feel must still be judged on hardware.

---

## What to tune after real-device review

Do not tune by arbitrary duration first.

Preferred order:

```text
1. direct tracking correctness
2. release velocity correctness
3. snap target selection
4. spring response
5. damping / overshoot
6. decorative polish
```

If the UI feels slow, verify latency and target selection before simply shortening the spring response.

---

## Reusable conclusion

**Fluid UI is a state-continuity problem, not an easing-selection problem.**

A polished cubic-bezier can still feel dead if:
- the object waits before responding,
- drag does not track 1:1,
- release velocity disappears,
- input is locked during animation,
- interruption jumps to a logical target.

Conversely, relatively simple visuals can feel physical when presentation position, user velocity and new input remain continuous.

---

## Final State

Current visual: **AERO — Apple-style fluid product marketing study**.

Primary interactive demos:
- 3-finish momentum carousel,
- interruptible spring snapping,
- rubber-band carousel edges,
- draggable glass bottom sheet,
- velocity-aware sheet settle / dismissal,
- continuous background depth response,
- immediate press feedback,
- reduced-motion / transparency / contrast fallbacks.
