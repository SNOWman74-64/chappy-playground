# PRISM ORBIT — Fluid Camera + Face Writing Study

## Sources
- Spatial / optical reference: https://styles.refero.design/style/8875b14e-c59a-492f-8780-8027a480f21c
- Motion / interaction reference: https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md
- Writing-motion source: `refero-daybook-notebook`
- Prior internal studies: `refero-prism-transit`, `refero-apple-fluid`

## Goal
Keep the stable PRISM ORBIT gesture model, but change the content layout so each semantic cube face becomes a readable close-up state.

```text
vertical scroll
→ approach cube
→ hold close framing

horizontal swipe / drag
→ orbit camera
→ velocity-preserving 90° snap

face settles
→ narrative writes from left to right
```

The visual can stay dynamic while reading moments become calm.

---

## 1. Stable Gesture Model

### Vertical — distance
Vertical scrolling owns distance only.

The important change in v2 is that the depth curve **saturates early**:

```text
far
→ approach
→ close framing reached
→ distance stays nearly fixed
```

Do not keep zooming throughout the entire sticky section. Once the useful close-up is reached, preserve it so face changes can be read without the object continually changing scale.

### Horizontal — viewpoint
Horizontal pointer movement owns orbit only.

After the intent threshold:

```text
pointer dx
→ orbit angle 1:1
```

Release preserves angular velocity, projects a destination and settles to the nearest 90° semantic face.

### New pointer-down
Always interrupts the existing spring from the current rendered angle.

Never wait for settling motion to finish.

---

## 2. Face as Reading State

The cube has four semantic resting faces:

```text
0°    Origin
-90°  Signal
-180° Memory
-270° Return
```

A face is not considered a reading state until the camera has settled near its 90° target.

While the user is dragging, the HUD may preview the nearest face name, but **narrative writing begins only after settle**.

This prevents text animation from fighting the gesture.

---

## 3. Writing Motion

Borrow the motion grammar from `refero-daybook-notebook`, not its paper visual style.

The source study uses horizontal clipping + opacity + a tiny vertical lift so text feels written rather than simply faded in.

PRISM ORBIT adapts that as:

```css
clip-path: inset(-.3em var(--clip) -.48em 0);
opacity: var(--ink-alpha);
transform: translateY(var(--ink-lift));
```

Sequence:

```text
face settles
→ kicker writes
→ heading writes
→ body writes
→ note writes
```

Writing is presentation only. It never locks orbit input.

A new settled face cancels the old writing sequence and starts the new face copy immediately.

---

## 4. Layout Composition

### Desktop
Use an asymmetric composition:

```text
left                       right
narrative                   cube
narrative                   cube
narrative                   cube
```

The cube sits right of center. The active-face story occupies the left reading column.

This preserves the feeling that the user is inspecting an object while receiving context alongside it.

### Mobile
Do not squeeze the desktop two-column shot.

```text
upper viewport
→ close cube

lower viewport
→ active-face narrative

bottom safe area
→ distance + face HUD
```

The cube and story must remain simultaneously legible.

Responsive 3D still follows the prior rule:

> Responsive 3D means camera recomposition, not shrinking the desktop shot.

---

## 5. Dynamic Visual / Predictable UX Split

Use spectacle in:
- RGB optical field,
- perspective,
- close-up cube presence,
- the act of orbiting.

Keep control behavior conservative:
- one gesture = one meaning,
- no surprise camera cut,
- no automatic idle orbit,
- stable 90° resting faces,
- same route in reverse,
- interruptible spring,
- narrative begins after spatial motion settles.

> Dynamic presentation is allowed. Unpredictable control is not.

---

## 6. Motion Continuity

Orbit keeps the Apple-fluid rules:

```text
pointer position
→ presentation angle
→ release velocity
→ projected face target
→ critically damped spring
→ interrupt from live angle
```

The writing motion deliberately starts **after** the spatial motion becomes calm. This creates a hierarchy:

```text
first: orientation
then: reading
```

Do not animate camera and long-form copy aggressively at the same time.

---

## 7. Performance

No permanent animation loop.

### Depth
```text
scroll
→ wake depth rAF
→ settle
→ stop
```

### Orbit
```text
drag
→ render from pointermove
release
→ spring rAF
→ stop
```

### Writing
```text
face settle
→ temporary writing rAF
→ finish
→ stop
```

All three systems sleep when idle.

Avoid particles, large blur filters and shader-like CSS in this prototype.

---

## 8. Accessibility

- `prefers-reduced-motion`: reveal narrative immediately and shorten depth travel.
- Face identity is always visible as text in the HUD.
- Arrow keys can rotate between faces on desktop.
- Vertical scroll must remain available even over the cube gesture zone.
- Narrative animation must never be required to access the content.

---

## Success Criteria
1. The close-up state feels intentionally held rather than continuously zooming.
2. Horizontal swipe remains as stable as the original PRISM ORBIT prototype.
3. Face settling creates a clear pause before reading begins.
4. Writing feels like information arriving from the selected face, not a generic fade animation.
5. A new swipe can interrupt at any time without waiting for writing.
6. Desktop keeps cube + narrative balanced side-by-side.
7. Mobile keeps cube + narrative + HUD simultaneously usable.
