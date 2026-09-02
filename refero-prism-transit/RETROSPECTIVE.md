# PRISM TRANSIT — Retrospective

## Initial hypothesis
The interesting part of the Vivid-like reference is not simply rotating glass cubes. The stronger interpretation is to make each cube a location and turn section navigation into spatial travel.

## V1 — per-cube motion
The first prototype used CSS 3D transforms only and moved all three cubes independently from a shared scroll progress.

Minimum experiment:

```text
3 cubes
+ one perspective field
+ scroll progress
+ reversible transforms
+ restrained RGB light
```

### What worked
- The idea of moving between cube-like stations was visible.
- The same scroll progress made reverse navigation coherent.
- RGB could stay optical rather than becoming a generic UI accent.

### What did not work well
Two problems became obvious on mobile.

#### 1. Viewpoint felt too similar
Although each cube had different transform values, all three were still being animated relative to a fixed camera. The result read as multiple objects moving toward the viewer from broadly the same screen-space logic.

The user could see motion, but not enough **change of viewpoint**.

#### 2. The scene was heavier than the idea justified
V1 combined:
- a permanent `requestAnimationFrame` loop,
- three independently updated cube transforms,
- 18 translucent cube faces,
- large blurred RGB pseudo-elements,
- grain / gradients / perspective at the same time.

The loop also continued while the page was completely still.

## V2 — camera-first world
The correction is architectural rather than cosmetic.

```text
V1
fixed camera
├ move Cube A
├ move Cube B
└ move Cube C

V2
fixed Cube A
fixed Cube B
fixed Cube C
      ↑
move one world / inverse camera transform
```

### Why this is better
Spatial landmarks should remain stable if the concept is that the user is travelling through one world.

V2 gives every cube a fixed coordinate and changes only the shared `world` transform. In CSS 3D this acts as an inverse camera transform.

The path also curves:
- around Station A,
- toward Station B from another angle,
- past B on a different side,
- then toward Station C.

Yaw and pitch are derived from the local path direction, so the viewport turns as the route bends instead of keeping one repeated viewing angle.

## Performance correction
The render loop is now event-driven.

```text
scroll / resize
→ update target progress
→ wake rAF
→ lerp until target is reached
→ stop rAF
```

When stationary, there is no per-frame JavaScript work.

Additional reductions:
- cube transforms are static,
- only one world transform changes for the 3D scene,
- large `filter: blur()` glows were removed,
- optical fields use gradients instead,
- only the nearest station gets the strong halo,
- later content uses `content-visibility` where supported.

## Why CSS 3D is still useful
The purpose of this stage is not rendering fidelity. It is to decide whether the navigation model itself works.

If V2 communicates clear approach / pass-by / turn / arrival motion and performs acceptably on mobile, the same architecture can later move to Three.js / R3F:

```text
fixed world coordinates
+ real camera path
+ glass geometry
+ lightweight RGB dispersion
```

without redesigning the interaction model.

## General lesson
For spatial web interfaces:

> **Move the viewpoint through stable landmarks before animating every landmark to imitate a viewpoint.**

And for motion prototypes:

> **A render loop should sleep when the interface is still.**

Rendering fidelity comes after spatial grammar and runtime cost are both good enough.
