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
The correction was architectural rather than cosmetic.

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

### What improved
- The motion became materially lighter on mobile.
- The intended idea became clearer: the cubes are locations and the viewpoint travels through them.
- Curved camera motion created more spatial consistency than independent cube transforms.

### New problem found on real mobile
The second mobile check exposed a different class of failure.

The page no longer felt primarily slow, but parts of Station C became a huge cropped cube edge near the bottom of the viewport. The scene technically remained inside `overflow:hidden`; the composition itself was wrong.

This happened because the desktop camera path approached the station too aggressively for a tall narrow viewport.

The important distinction:

```text
2D overflow problem
≠
3D camera-framing problem
```

Making the cube smaller or hiding the overflow alone would not solve the spatial composition.

## V3 — responsive camera composition
The world remains shared, but the shot is now platform-specific.

```text
shared station world
├ desktop route
└ mobile route
```

### Desktop route
Keeps the stronger spatial drama:
- deeper Z approach,
- wider lateral passes,
- stronger yaw / pitch,
- more willingness to let a cube partially leave the frame.

### Mobile route
Uses a calmer camera:
- shallower Z movement,
- narrower lateral travel,
- lower yaw / pitch limits,
- smaller cube presentation,
- Station B / C remain farther from the virtual camera,
- active cube should remain readable as a whole object rather than becoming a giant plane.

The viewport also now uses dynamic viewport height where supported, and the bottom progress / station labels reserve more space for safe-area and mobile browser chrome.

## Performance correction
The render loop remains event-driven.

```text
scroll / resize
→ update target progress
→ wake rAF
→ lerp until target is reached
→ stop rAF
```

When stationary, there is no per-frame JavaScript work.

V3 additionally treats compositor hints as temporary:

```text
motion starts
→ will-change enabled
→ camera settles
→ will-change returns to auto
```

Additional reductions retained:
- cube transforms are static,
- only one world transform changes for the 3D scene,
- large `filter: blur()` glows are absent,
- optical fields use gradients,
- only the nearest station gets the strong halo,
- mobile reduces spectrum size / opacity and grain density,
- later content uses `content-visibility` where supported.

## Why CSS 3D is still useful
The purpose of this stage is not rendering fidelity. It is to decide whether the navigation model itself works across viewport classes.

If V3 communicates clear spatial travel on both desktop and mobile, the same architecture can later move to Three.js / R3F:

```text
fixed world coordinates
+ desktop camera path
+ mobile camera path
+ real glass geometry
+ lightweight RGB dispersion
```

without redesigning the navigation model.

## General lessons
For spatial web interfaces:

> **Move the viewpoint through stable landmarks before animating every landmark to imitate a viewpoint.**

For responsive 3D:

> **Do not shrink the desktop shot. Recompose the camera.**

For motion prototypes:

> **A render loop should sleep when the interface is still.**

Rendering fidelity comes after spatial grammar, responsive composition and runtime cost are all good enough.
