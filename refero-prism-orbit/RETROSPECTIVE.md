# PRISM ORBIT — Retrospective

## Initial hypothesis
A cube can support multiple spatial interactions if each gesture keeps one stable meaning.

The first PRISM ORBIT version established:

```text
scroll = distance
swipe = orbit
release = semantic face snap
```

The main success was not the cube itself. It was the calmness of the control model:
- direct horizontal tracking,
- velocity-preserving release,
- 90° stable faces,
- critically damped settling,
- interruption from the live presentation angle.

The user reported that this version felt stable.

## V2 — Hold the close-up, then write
The next request was not for more dramatic camera movement. It was for a different information layout while keeping the successful gesture behavior.

Reference inspiration came from `refero-daybook-notebook`, specifically its **left-to-right writing reveal**.

The new composition is:

```text
approach cube
→ close framing saturates
→ user orbits to another face
→ face settles
→ left-side narrative writes in
```

## Why stop the zoom early
A continuous depth change makes the object feel dynamic, but it also means the reading context never fully settles.

V2 compresses the approach into the early part of the sticky journey, then holds the close distance.

This creates two distinct modes without an explicit mode switch:

```text
early scroll = arrive
later interaction = inspect / read
```

The user gets spectacle once, then stability.

## Why writing starts after face settle
Starting the narrative while the user is still dragging would create two simultaneous motion stories:
- camera orientation,
- text reveal.

That weakens both.

V2 therefore treats spatial orientation as higher priority:

```text
camera settles
→ selected face becomes certain
→ writing begins
```

If the user swipes again, orbit input remains available immediately. Writing never locks the gesture.

## Daybook lesson reused
The notebook study's useful part here was not its paper texture or handwritten aesthetic.

The transferable technique was:
- horizontal `clip-path` reveal,
- opacity rising slightly faster than clip progress,
- a tiny vertical lift,
- staggered lines.

That motion can be reused in a dark optical interface without copying the original layout or theme.

This is a good example of extracting **motion grammar instead of visual skin**.

## Responsive composition
Desktop and mobile intentionally diverge.

### Desktop
- story on the left,
- cube right of center,
- close framing maintained.

### Mobile
- cube in the upper portion,
- story below it,
- HUD stays near the bottom safe area.

This extends the previous shared lesson:

> Responsive 3D means camera and composition recomposition, not desktop scaling.

## Performance
V2 still has no permanent animation loop.

Temporary `requestAnimationFrame` work exists only for:
1. depth settling,
2. orbit settling,
3. narrative writing.

All stop when finished.

## General lesson
For interactive product-style 3D:

> **Use dynamic motion to arrive, then preserve a stable framing for reading.**

And when combining interaction motion with content motion:

> **Orient first. Explain second.**

A visually dramatic world can still feel calm if information waits until the user's spatial action has resolved.
