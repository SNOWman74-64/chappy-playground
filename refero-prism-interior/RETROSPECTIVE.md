# PRISM INTERIOR — Retrospective

## Initial hypothesis
The outside-cube studies became easier to understand once stable semantic faces and predictable orbit motion were introduced.

The next question is whether an **inside-the-cube** view can stay equally understandable.

The proposed fix for interior disorientation is structural:

> Put the information on the wall itself.

If the wall is both the spatial direction and the content surface, the user should need fewer abstract orientation cues.

---

## Why this is not just Prism Orbit inverted
A literal inversion would place the camera inside and reuse the same detached HUD / detail card model.

That would preserve the biggest interior risk:

```text
camera direction
≠
information layer
```

PRISM INTERIOR instead binds copy to geometry:

```text
Front wall  = Origin content
Right wall  = Signal content
Back wall   = Memory content
Left wall   = Return content
```

The room itself becomes the navigation model.

---

## Motion stack
Three earlier UI Lab lessons are combined here.

### From Prism Orbit
- horizontal drag = direct viewpoint control,
- release velocity continues into settle,
- 90° semantic resting states,
- settling remains interruptible.

### From Apple Fluid
- current presentation value is the source of every new interaction,
- no input lock while motion is active,
- movement should feel like one continuous physical state.

### From Daybook Notebook
- information is not simply faded in,
- writing is revealed left-to-right,
- small lift / opacity changes support the reveal,
- the writing sequence follows semantic reading order.

---

## Important sequencing decision
The writing does **not** run during the orbit settle.

```text
camera moving
→ no long-form reading animation

camera stable
→ wall writing begins
```

This prevents two visual systems from competing for attention at once.

The general principle is:

> **Orient first. Explain second.**

---

## Orientation strategy
An interior removes the external silhouette that previously told the user where they were relative to the cube.

This version compensates with several low-cost cues:
- exactly four primary walls,
- wall labels,
- floor grid,
- compass dots,
- subtle per-wall optical atmosphere,
- a semantic loop where Return leads back to Origin.

No single cue is expected to solve orientation alone.

---

## Why only four walls
Floor and ceiling are rendered, but not used as equal content destinations.

A six-face free-look interface would introduce vertical camera control and create additional gesture ambiguity with page scrolling.

For the first interior prototype:

```text
horizontal orientation only
+
four semantic walls
```

is intentionally restrictive.

Freedom can be expanded later only if it earns its complexity.

---

## Device feedback — rear wall flicker
The interior concept matched the intended mental model on device, but a new visual defect became obvious during turns:

> the wall behind the current face could briefly show through / flicker against the wall being read.

This was useful feedback because the interaction itself remained stable. The problem was not the Apple-fluid orbit; it was the scene's depth composition.

### Root cause
V1 treated the structural room walls as translucent visual surfaces.

That works for an exterior glass object, but it is a poor default for an information room where each wall owns readable text.

During rotation:

```text
translucent current wall
+
rear wall still participating in compositing
→
rear content becomes visible through the current surface
```

The result reads as a flicker even when the 3D transforms are mathematically continuous.

---

## V2 — deliberate occlusion
The correction uses three separate responsibilities.

### 1. Structural walls become opaque
The wall itself now establishes depth and hides unrelated geometry behind it.

The RGB atmosphere remains in a separate pseudo-element / light layer.

This changes the material rule from:

```text
transparent wall carries both structure and optics
```

to:

```text
opaque wall = structure / occlusion
transparent light = optics / atmosphere
```

This is a better fit for text-bearing interior surfaces.

### 2. Backfaces are explicitly hidden
Both standard and WebKit-prefixed properties are used:

```css
backface-visibility: hidden;
-webkit-backface-visibility: hidden;
```

This removes the reverse side of a wall once rotation carries it past the camera-facing side.

### 3. The clearly opposite wall is culled by view angle
Each semantic wall owns a yaw direction:

```text
Origin 0°
Signal 90°
Memory 180°
Return 270°
```

During the existing drag / spring render, the shortest angular distance between the current view and each wall is calculated.

A wall more than about **136°** behind the current direction is set to `visibility:hidden`.

Why 136° instead of 90°?
- adjacent walls should remain visible while turning,
- the room needs corner / side continuity,
- switching exactly at the halfway point would create a more noticeable pop.

The culling therefore removes only the wall that is clearly behind the viewer.

No new animation loop is introduced; the four culling checks run only when the room is already being rendered because of user movement or spring settle.

---

## Generalizable debugging order
For CSS 3D interiors with translucent-surface flicker, use this order before adding more effects:

```text
1. verify whether structural surfaces should actually be transparent
2. establish opaque occlusion where appropriate
3. add backface-visibility
4. separate optical translucency from structural material
5. add angle-aware opposite-surface culling only if needed
```

Do not start by fading the offending wall or adding blur. Those approaches can mask the symptom while leaving the scene's depth model ambiguous.

---

## Responsive concern
Mobile is expected to be the harder case because:
- the viewport is tall,
- the wall can become too large at close perspective,
- long wall headlines can crowd the room edges,
- horizontal gesture and vertical page scroll coexist.

The current strategy keeps the same semantic room but changes:
- room size,
- perspective distance,
- wall typography,
- copy placement,
- HUD layout.

The occlusion model is shared across desktop and mobile because it describes scene structure rather than viewport composition.

---

## Performance constraint
The room has four text walls plus floor / ceiling, but no permanent motion loop.

Only the settle spring uses `requestAnimationFrame`.

Angle-aware culling adds four cheap comparisons to frames that already exist. It does not wake rendering on its own.

Idle state is intentionally static.

No particle system, animated blur, continuous refraction or autoplay orbit is present in this phase.

---

## What to test next on device
- Is the rear-wall flicker gone during both slow drag and fast swipe?
- Does hiding the opposite wall ever create an obvious pop near a 45° corner view?
- Do opaque walls still feel spatial rather than like flat full-screen slides?
- Are adjacent walls / floor enough to preserve the sense of being inside one room?
- Does wall writing remain readable and physically attached after the material change?
- Does vertical page scrolling remain available on iPhone?

---

## General lessons
For spatial information interfaces:

> **Bind information to stable geometry when the geometry already carries location.**

For sequencing:

> **Do not animate navigation and long-form reading at the same time. Orient first, explain second.**

For interior depth composition:

> **Let structure establish occlusion; let separate optical layers carry translucency.**

And when a hidden surface still intrudes:

> **Cull surfaces by camera relationship, not by arbitrary screen-space opacity.**
