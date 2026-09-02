# PRISM TRANSIT — Retrospective

## Initial hypothesis
The interesting part of the Vivid-like reference is not simply rotating glass cubes. The stronger interpretation is to make each cube a location and turn section navigation into spatial travel.

## Implementation choice
The first prototype uses CSS 3D transforms only.

This is intentional. Previous UI Lab experiments showed that jumping directly to complex Canvas / particle / graphics systems can make a visual prototype fragile before the core idea has been validated.

The minimum experiment is therefore:

```text
3 cubes
+ one perspective field
+ scroll progress
+ reversible transforms
+ restrained RGB light
```

## What this version tests
- Does scale/depth alone create an approach/pass/leave sensation?
- Can RGB remain an optical signature rather than becoming a UI palette?
- Does using one shared scroll progress preserve orientation when scrolling backward?
- Is the concept still understandable on mobile without WebGL?

## Known simplification
This is not physically correct glass/refraction. Cube faces are translucent CSS planes and RGB light is approximated with gradients/glow.

If the spatial concept works, the next technical step is WebGL / Three.js with real geometry and a lightweight refraction/dispersion treatment. Do not add shader complexity merely to make the current mock more impressive.

## General lesson candidate
For 3D web concepts, validate **spatial grammar before rendering fidelity**.

A simple object with convincing camera/path logic can communicate more than a sophisticated shader attached to an unclear navigation model.
