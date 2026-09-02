# PRISM TRANSIT — Spatial Cube Study

## Reference
- Refero style: https://styles.refero.design/style/8875b14e-c59a-492f-8780-8027a480f21c

## Goal
Translate the reference's dark monochrome canvas + chromatic glass/prism signature into a spatial web study.

The cube is not treated as an animated mascot. It is a **waypoint in space**. Ordinary vertical sections become locations that the viewport appears to travel between.

## Core Grammar

### 1. Monochrome owns the interface
- Near-black canvas.
- White / gray typography.
- Hairline neutral borders.
- UI chrome stays colorless.

### 2. RGB belongs to optics
Red / green / blue are reserved for:
- refraction,
- beams,
- chromatic separation,
- the cube's optical field.

Do not use RGB colors as generic CTA fills, tags or decorative UI accents.

### 3. Object as location
The visual hierarchy is:

```text
space
→ cube / station
→ passage
→ next cube / station
```

The user should feel that the viewpoint changed location, not that a new content block slid in.

### 4. Motion is spatial, not busy
- Cubes rotate slowly enough to remain readable as stable landmarks.
- Most perceived motion comes from relative scale / translation / depth.
- Avoid bounce and playful scale-pop.
- RGB shimmer is secondary to camera-like movement.

### 5. Reversible path
Scrolling upward retraces the same route. Enter and exit do not use unrelated animations.

The current prototype uses a continuously sampled scroll progress and derives all cube transforms from that same progress value.

### 6. Apple Fluid influence
The spatial concept comes from the Refero study; motion continuity borrows the shared Apple Fluid lesson:
- do not teleport between stations,
- keep progress continuous,
- smooth presentation value toward the user's scroll intent,
- preserve the same spatial path in reverse.

This is not a spring-heavy gesture UI. The Apple influence is used for **predictability and continuity**, not visual style.

## Prototype constraints
This first version deliberately uses CSS 3D rather than Three.js/WebGL.

Reason:
- validate the spatial-navigation idea before graphics engineering,
- keep mobile failure modes small,
- establish whether three cubes + depth + RGB light are enough to communicate travel.

If the concept succeeds, a later version may replace the CSS cubes with WebGL glass geometry / refraction shaders while keeping the same spatial route.

## Mobile
- Fewer visual assumptions than desktop.
- Cubes remain large landmarks.
- Text stays readable independently of the 3D field.
- Avoid heavy filters and particle systems.
- Reduced Motion shortens the scroll travel and removes smoothing.

## Success criteria
1. The user can identify three spatial stations.
2. Scrolling feels like approaching / passing / leaving objects.
3. RGB reads as an optical event, not a UI palette.
4. Returning upward feels spatially consistent.
5. The page remains meaningful even if the 3D illusion is subtle on mobile.
