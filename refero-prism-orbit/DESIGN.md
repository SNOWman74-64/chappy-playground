# PRISM ORBIT — Fluid Camera Cube Study

## Sources
- Spatial / optical reference: https://styles.refero.design/style/8875b14e-c59a-492f-8780-8027a480f21c
- Motion / interaction reference: https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md
- Prior internal studies: `refero-prism-transit`, `refero-apple-fluid`

## Goal
Build a new cube study where the visual can feel dynamic while the controls remain predictable.

The main interaction model is deliberately simple:

```text
vertical scroll
→ camera distance

horizontal swipe / drag
→ camera orbit

tap cube
→ current face details
```

Each gesture owns one spatial meaning.

---

## 1. Visual Grammar

### Monochrome interface
- Near-black canvas.
- White / gray typography.
- Hairline neutral chrome.
- No generic colored buttons or tags.

### RGB belongs to optics
Red / green / blue are reserved for:
- spectral lines,
- refraction-like glow,
- optical emphasis around the cube.

Color is the visual spectacle. It is not the navigation system.

### Cube as stable landmark
The cube should read as one persistent object in space.

The user changes their relationship to it instead of watching the cube perform unrelated animations.

---

## 2. Gesture Roles

### Vertical — distance
Vertical scrolling moves the viewpoint from far to near.

Desktop may approach more strongly. Mobile uses a shallower Z range and larger perspective distance so the full cube remains readable.

### Horizontal — viewpoint
Horizontal pointer movement or touch swipe changes the orbit angle.

After an intent threshold, the mapping is 1:1:

```text
pointer dx
→ orbit angle
```

Do not begin with a canned animation.

### Tap — information
A tap does not change spatial position. It opens information for the currently selected face.

This prevents one gesture from carrying multiple meanings.

---

## 3. Apple-fluid Motion Rules

### Immediate response
Once horizontal intent is clear, the camera follows the pointer immediately.

### Velocity handoff
Release velocity is preserved into the settling spring.

```text
pointer movement
→ angular velocity
→ projected angle
→ nearest 90° face
→ spring with release velocity
```

The spring does not restart from zero velocity.

### Interruptibility
A new pointer-down during the spring:
- stops the existing spring,
- uses the current rendered angle,
- begins a new direct manipulation from that presentation value.

Never wait for the old animation to finish.

### Critically damped default
The resting motion should feel calm and decisive rather than playful.

No decorative bounce is required for ordinary orbit snapping.

---

## 4. Stable Face Targets

The orbit can move freely while the user is touching it, but release settles to 90° increments.

```text
0°   → Origin
-90° → Signal
-180°→ Memory
-270°→ Return
```

This gives physical freedom during manipulation while preserving wayfinding after release.

The selected face name is always visible in the HUD.

---

## 5. Dynamic Visual / Predictable UX Split

Use spectacle in:
- RGB optical field,
- changing perspective,
- depth,
- the feeling of orbiting a large object.

Keep interaction conservative:
- one gesture = one meaning,
- no surprise camera cuts,
- no automatic orbit while the user is inactive,
- same path when reversing,
- stable face snap points,
- interruptible settling.

> Dynamic presentation is allowed. Unpredictable control is not.

---

## 6. Responsive 3D

Reuse the Prism Transit lesson:

> Responsive 3D means camera recomposition, not shrinking the desktop shot.

### Desktop
- stronger depth approach,
- larger cube,
- more dramatic perspective.

### Mobile
- larger perspective distance,
- shallower Z approach,
- smaller maximum cube size,
- bottom HUD kept above browser / safe-area chrome,
- face detail sheet sits above the HUD,
- horizontal gesture zone remains large enough for a thumb.

The interaction semantics remain identical even when the composition changes.

---

## 7. Performance

No permanent animation loop.

### Scroll
```text
scroll
→ wake depth rAF
→ settle presentation depth
→ stop
```

### Orbit
```text
drag
→ direct render only on pointermove

release
→ wake spring rAF
→ settle to face
→ stop
```

When the user is not scrolling or orbiting, JavaScript should perform no per-frame animation work.

`will-change` is enabled only while a surface is actively moving.

Avoid particles, large blur filters and expensive shader-like CSS in this prototype.

---

## 8. Material

The detail surface borrows the preferred Soft Clear material direction:

```text
Opacity ≈ 11%
Blur ≈ 6px
Edge light ≈ 36%
```

Glass is only used for the temporary face-detail layer, not the entire page.

---

## 9. Accessibility

- `prefers-reduced-motion`: shorten the depth journey and remove large slide motion from the detail panel.
- `prefers-reduced-transparency`: replace Soft Clear with a solid dark surface.
- Arrow keys can rotate between faces on desktop.
- Escape closes face details.
- Face identity is communicated with text, not RGB color alone.

---

## Success Criteria
1. Horizontal swipe feels directly connected to camera orbit.
2. Release feels like a continuation of the swipe, not a new animation.
3. A user can interrupt a settling orbit without a visual jump.
4. The four faces remain understandable resting states.
5. Vertical scrolling and horizontal orbit do not feel like competing gestures on mobile.
6. The cube remains visually contained on both phone and desktop.
7. Dynamic optical presentation does not reduce spatial predictability.
