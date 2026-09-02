# PRISM ORBIT — Retrospective

## Initial hypothesis
A cube can support more than one kind of spatial interaction if each gesture has a stable role.

This study tests whether the following feels natural rather than gimmicky:

```text
scroll = distance
swipe = orbit
snap = face
 tap = details
```

## Why this is a new study
`refero-prism-transit` focused on moving between multiple fixed waypoints.

PRISM ORBIT focuses on one object and asks a different question:

> Can the user inspect one spatial landmark dynamically without losing orientation?

## Motion choice
The visual language may be dramatic, but the interaction behavior borrows the calmer Apple-fluid rules established in `refero-apple-fluid`.

The orbit therefore uses:
- a small intent threshold,
- direct pointer tracking,
- measured release velocity,
- projected resting direction,
- 90° stable face targets,
- a critically damped spring,
- interruption from the live presentation angle.

No automatic idle rotation is used.

## Why face snapping exists
A completely free 360° camera offers freedom but weak wayfinding.

This prototype uses a hybrid model:

```text
while touching
→ free orbit

when released
→ stable semantic face
```

The goal is to preserve the tactile feeling without leaving the user at an arbitrary hard-to-read angle.

## Responsive constraint
The same gesture model is shared across devices, but the camera depth composition is not.

Mobile uses:
- shallower approach,
- smaller cube presentation,
- larger perspective distance,
- a larger thumb gesture zone,
- HUD and detail placement above the safe area.

This follows the prior lesson that responsive 3D requires camera recomposition rather than desktop scaling.

## Performance constraint
This study intentionally avoids a permanent render loop.

Only two moments may wake `requestAnimationFrame`:
1. depth settling after scroll,
2. orbit settling after release.

Direct dragging renders from pointer events.

When idle, there should be no animation loop.

## What to evaluate on device
- Does horizontal swipe get confused with vertical page scroll?
- Does the cube stay visually contained at the nearest depth?
- Does the 90° snap feel helpful or restrictive?
- Does release preserve the apparent swipe energy?
- Can a settling camera be grabbed again without a jump?
- Does the face-detail panel feel like useful context rather than extra chrome?

## General lesson candidate
For spatial inspection UI:

> **Give free manipulation a small number of stable semantic resting states.**

And for dramatic visual design:

> **Put spectacle in the world; keep control behavior predictable.**

These remain hypotheses until the interaction is tested on a real phone and desktop pointer.
