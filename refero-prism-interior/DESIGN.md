# PRISM INTERIOR — Read the Room Study

## Sources
- Spatial / optical reference: https://styles.refero.design/style/8875b14e-c59a-492f-8780-8027a480f21c
- Fluid motion reference: https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md
- Writing-motion source: `refero-daybook-notebook`
- Prior spatial studies: `refero-prism-transit`, `refero-prism-orbit`

## Goal
Test the inverse of the previous cube studies:

```text
before
camera outside
→ inspect cube

now
camera inside
→ read the room
```

The cube becomes a four-wall interior. Each wall is both a spatial direction and the information surface for that direction.

The hypothesis is that interior 3D becomes easier to understand when **location and content are the same object**.

---

## 1. Interaction Model

```text
horizontal swipe / drag
→ viewpoint rotation

release
→ nearest 90° wall

stable wall reached
→ wall text writes left-to-right

vertical gesture
→ normal page scroll
```

One gesture owns one meaning.

There is no detached detail panel in the primary experience.

---

## 2. Four Semantic Walls

The primary room uses only four readable walls:

```text
Front  / Origin
Right  / Signal
Back   / Memory
Left   / Return
```

Floor and ceiling exist only as orientation geometry.

Do not turn all six cube faces into equally important navigation targets. More directions increase freedom faster than they increase understanding.

---

## 3. Content Belongs to Geometry

Text is physically placed inside each 3D wall element.

```text
wall direction
=
wall label
=
wall copy
=
current location
```

Avoid opening a floating card merely to explain the wall the user is already facing.

This is intended to reduce the interior-view ambiguity:

> “Where am I looking?” and “What am I reading?” should have the same answer.

---

## 4. Orient First, Explain Second

Long-form text must not animate while the camera is still settling.

Sequence:

```text
swipe
→ direct viewpoint tracking
→ velocity handoff
→ critically damped 90° settle
→ camera becomes stable
→ writing begins
```

Camera motion owns the transition phase. Typography owns the reading phase.

Do not make both compete for attention at the same time.

---

## 5. Wall Writing Grammar

Borrow only the **temporal writing grammar** from `refero-daybook-notebook`, not its paper visual language.

Writing should use:
- left-to-right horizontal reveal,
- small opacity ramp,
- very small vertical lift,
- staggered semantic order.

Order:

```text
wall index
→ headline
→ body
→ small note
```

Keep vertical glyph bleed around the horizontal clip so descenders are not cut.

The reveal should feel like information being written onto the surface, not like a generic UI card fading in.

---

## 6. Fluid Viewpoint Rules

Reuse the Apple-fluid rules established in `refero-prism-orbit`:

### Direct manipulation
After a small horizontal-intent threshold:

```text
pointer dx
→ room yaw
```

The wall follows the gesture directly.

### Velocity continuity
On release:

```text
angular position
+ angular velocity
→ projected endpoint
→ nearest 90° target
→ spring settle
```

### Interruptibility
A new pointer-down during settling starts from the live rendered angle.

Never wait for the previous animation to finish.

### Stable resting points
Free movement exists while touching. Readable states exist when released.

---

## 7. Orientation Cues

Interior space needs redundant orientation because the external silhouette is gone.

Use:
- four stable 90° walls,
- persistent wall names,
- a four-dot compass,
- a visible floor grid,
- slightly different optical light direction per wall,
- explicit Return → Origin loop language.

Do not rely on RGB alone to identify direction.

---

## 8. Optical Language

Interface chrome remains monochrome.

RGB is reserved for outside-light / optical atmosphere:
- Origin: neutral / white
- Signal: slight blue
- Memory: slight green
- Return: slight red

These are secondary direction cues, not navigation colors.

---

## 9. Responsive 3D

Use the existing UI Lab rule:

> Responsive 3D means camera composition, not desktop scaling.

### Desktop
- larger room,
- lower perspective distance,
- more visible floor / side depth,
- large wall typography.

### Mobile
- smaller physical room,
- larger perspective distance,
- text begins higher on the current wall,
- headline size reduced independently from room geometry,
- HUD remains above the safe area,
- horizontal gesture covers most of the viewport while preserving `pan-y` for scrolling.

The semantic room remains identical.

---

## 10. Performance

There is no permanent animation loop.

```text
drag
→ render from pointer events

release
→ spring rAF
→ settle
→ stop rAF
```

Writing uses a short deterministic surface animation after settle.

Avoid:
- particles,
- large animated blur filters,
- idle camera movement,
- continuous shimmer loops.

When idle, the room should be still.

---

## 11. Reduced Motion

With `prefers-reduced-motion`:
- wall copy is immediately readable,
- no writing wipe is required,
- viewpoint still has clear state changes,
- avoid decorative transition layers.

Direct manipulation may remain because it is user-driven feedback, but the settle should be short and non-bouncy.

---

## Success Criteria
1. The user understands that the camera is inside a room / cube.
2. The four walls feel like stable directions rather than four unrelated screens.
3. Wall copy appears to belong to the physical wall.
4. Text waits until the viewpoint is stable before revealing.
5. Swipe / release retains the calm continuity of Prism Orbit.
6. Mobile vertical scrolling does not fight horizontal turning.
7. Returning to a previous wall restores orientation immediately.
