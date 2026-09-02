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

This follows the existing responsive-3D lesson rather than shrinking desktop coordinates.

---

## Performance constraint
The room has four text walls plus floor / ceiling, but no permanent motion loop.

Only the settle spring uses `requestAnimationFrame`.

Idle state is intentionally static.

No particle system, animated blur, continuous refraction or autoplay orbit is present in this phase.

---

## What to test on device
- Does the first frame clearly read as being inside a room?
- Does left / right swipe feel like turning the viewpoint rather than rotating a card?
- Is the currently readable wall obvious?
- Does the text reveal begin at the right moment?
- Is the wall writing readable while still feeling physically attached to the surface?
- Does vertical page scrolling remain available on iPhone?
- Do compass + floor + wall labels feel sufficient, or redundant / noisy?

---

## General lesson candidate
For spatial information interfaces:

> **Bind information to stable geometry when the geometry already carries location.**

And for sequencing:

> **Do not animate navigation and long-form reading at the same time. Orient first, explain second.**

Both remain hypotheses until tested on the real phone viewport.
