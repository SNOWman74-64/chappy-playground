# DIAL / Apple Fluid Tuning Lab — DESIGN

## Purpose

Test DialKit as a reusable tuning layer for the UI Lab without rewriting existing vanilla prototypes into a framework app.

The experiment intentionally combines three existing study threads:

- Apple Fluid: direct manipulation, velocity handoff, momentum projection, interruptible spring.
- Soft Clear: blur 6px / opacity 11% / edge light 36% as the starting material.
- DialKit: real-time parameter tuning, browser persistence, presets and JSON copy.

This is not a new visual reference study. DialKit is the tooling subject.

## Core workflow hypothesis

Instead of:

1. edit a constant in source,
2. commit,
3. wait for Pages,
4. reload on phone,
5. decide the value is wrong,
6. repeat,

use:

1. open the real prototype,
2. manipulate it normally,
3. tune values in DialKit while the behavior remains live,
4. save a preset or copy JSON,
5. promote the chosen values back into source / DESIGN.md.

The design decision should be discovered by feel first and recorded as numbers second.

## Integration model

The repository is currently a no-build static GitHub Pages collection.

Do not convert the whole repository to React just to use DialKit.

Use a small React island:

- existing prototype remains HTML / CSS / vanilla JS,
- React mounts only `DialRoot` and `useDialKit`,
- DialKit values are bridged into the vanilla prototype through a shared runtime object and a custom event,
- CSS/material values are exposed as custom properties,
- motion values are read by the existing gesture loop.

This keeps the experiment reversible and makes the pattern reusable for older mocks.

## Dependency strategy

For this static experiment:

- DialKit is pinned to `1.4.3`.
- React / ReactDOM are pinned to `18.3.1` through esm.sh.
- DialKit CSS is loaded from jsDelivr.
- `productionEnabled` is explicitly enabled because GitHub Pages is a production environment but this page is intentionally a tuning lab.

If the UI Lab later gets a real build pipeline, replace CDN imports with normal npm dependencies.

## Tunable groups

### Motion

`dragGain`
- How directly horizontal pointer movement maps into deck movement.
- Default: `1`.
- Do not lower this merely to create softness; direct manipulation should still feel immediate.

`projectionMs`
- How far release velocity is projected when deciding the destination card.
- Default: `220ms`.

`stiffness`
- Attraction toward the selected card.
- Default: `.12` in the prototype's normalized spring.

`damping`
- Velocity decay during settling.
- Default: `.84`.

`releaseBoost`
- Multiplier applied to release momentum before target selection.
- Default: `1`.

### Depth

`spacing`
- Horizontal spacing between cards.
- Default: `270px`.

`sideScale`
- Scale of a card one position away from the front card.
- Default: `.78`.

`rotateY`
- Side-card perspective rotation.
- Default: `16deg`.

`sideOpacity`
- Opacity of a card one position away.
- Default: `.58`.

`perspective`
- Stage perspective distance.
- Default: `950px`.

### Material

Soft Clear is the baseline rather than a neutral midpoint.

- Blur: `6px`
- Opacity: `11%`
- Edge light: `36%`
- Radius: `32px`

The purpose is to discover whether these values still feel right once the same material is moving through depth.

## Motion rules

DialKit may tune the response, but it must not break the Apple Fluid rules already learned:

1. Pointer-down interrupts any in-flight spring immediately.
2. Drag follows the pointer continuously.
3. Release velocity participates in destination selection.
4. The spring begins from the current on-screen state.
5. The animation loop stops when settled.
6. Reduced Motion resolves immediately to the target instead of simulating the spring.

### Important distinction

Do not manufacture softness by adding input latency.

Tune:

- projection,
- damping,
- stiffness,
- depth response,
- geometry/material,

before making direct manipulation less direct.

## Mobile behavior

DialKit is collapsed by default below 820px so it does not cover the experiment when the page opens.

The user can open and drag the DialKit bubble when tuning.

The stage keeps `touch-action: pan-y`, so horizontal deck manipulation should coexist with normal vertical page scrolling.

Persist values in the browser so iPhone tuning survives reloads.

## Success criteria

The experiment succeeds if:

- DialKit works on GitHub Pages without converting the repo to a build system.
- Tuning a value changes the live interaction immediately.
- Gesture interruption remains reliable while values are being changed.
- Values persist on reload.
- A useful parameter set can be copied from DialKit and promoted into the design record.
- The tuning panel does not become part of the final product UI by accident.

## What this experiment does not prove yet

- That every UI parameter should be exposed.
- That DialKit belongs in production products.
- That a tuned value is reusable across devices without validation.
- That the current parameter ranges are optimal.

The first practical question is simply whether it shortens the design-feedback loop enough to change how we prototype.
