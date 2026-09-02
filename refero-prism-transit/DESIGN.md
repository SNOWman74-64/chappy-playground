# PRISM TRANSIT — Spatial Cube Study

## Reference
- Refero style: https://styles.refero.design/style/8875b14e-c59a-492f-8780-8027a480f21c

## Goal
Translate the reference's dark monochrome canvas + chromatic glass/prism signature into a spatial web study.

The cube is not treated as an animated mascot. It is a **waypoint in space**. Ordinary vertical sections become locations that the viewpoint travels between.

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

### 4. Camera-first world model
Waypoints remain fixed in one shared 3D world.

```text
Cube A ─┐
Cube B ─┼─ fixed world
Cube C ─┘
        ↑
   camera path
```

For the CSS prototype there is no literal WebGL camera, so the inverse camera transform is applied to a single `world` wrapper.

**Do not animate each cube independently to fake camera travel.** Independent object transforms make every station appear to approach from the same screen-space logic and weaken spatial orientation.

### 5. Curved route, not one repeated angle
The camera path bends around the waypoints rather than moving only forward on Z.

Desktop route:
- begin near Station A,
- move to the right of A while advancing,
- curve toward Station B from a different angle,
- pass left / below B,
- turn again toward Station C.

View yaw / pitch are derived from the local path direction so the scene subtly turns as the route bends.

### 6. Responsive 3D means camera recomposition
The world / station identity stays shared, but desktop and mobile do **not** share the same camera route.

```text
same world
├ desktop camera composition
└ mobile camera composition
```

A desktop pass-by path can become a giant cropped plane on a tall phone viewport. This is a composition failure, not ordinary CSS overflow.

#### Desktop
- stronger Z approach,
- wider lateral passes,
- larger yaw / pitch changes,
- cubes may partially leave frame when that improves the feeling of passage.

#### Mobile
- shallower Z approach,
- narrower X / Y movement,
- gentler yaw / pitch,
- smaller cube presentation,
- keep the active station mostly or entirely visible,
- preserve bottom safe space for progress / station labels / browser chrome.

Mobile should feel like a different shot of the same physical set, not a scaled-down desktop render.

### 7. Motion is spatial, not busy
- Cubes themselves stay stable landmarks.
- Most perceived motion comes from camera-relative scale / translation / perspective.
- Avoid bounce and playful scale-pop.
- RGB optical effects remain secondary to spatial movement.
- Stronger optical glow belongs only to the nearest station.

### 8. Reversible path
Scrolling upward retraces the exact same platform-specific spatial route because all presentation state derives from one scroll progress value.

There is no separate exit animation.

### 9. Apple Fluid influence
The spatial concept comes from the Refero study; motion continuity borrows the shared Apple Fluid lesson:
- do not teleport between stations,
- keep progress continuous,
- smooth presentation value toward the user's current scroll intent,
- preserve the same route in reverse,
- stop rendering when there is no state left to settle.

This is not a spring-heavy gesture UI. The Apple influence is used for **predictability and continuity**, not visual style.

## Performance Rules

### Event-driven render
Do not run a permanent animation loop.

```text
scroll / resize
→ update target progress
→ wake requestAnimationFrame
→ settle presentation progress
→ stop requestAnimationFrame
```

When the page is still, the spatial scene should do no per-frame JavaScript work.

### `will-change` lifecycle
`will-change` is enabled while the camera is settling and returned to `auto` when the scene sleeps.

Do not reserve compositor layers permanently just because an object may move later.

### Transform budget
The scroll path updates:
1. one `world` transform,
2. hero copy transform / opacity,
3. progress-bar transform.

Cube transforms are static CSS.

### Optical cost
- Avoid large per-cube `filter: blur()` layers.
- Use gradient-based halos.
- Only the active / nearest station receives the stronger halo.
- Avoid particles and heavy SVG filters in this phase.
- Mobile uses a smaller / quieter spectrum field and lower grain opacity.

## Viewport / Safe-area Rules
- Sticky spatial viewport uses dynamic viewport height where supported.
- Maintain fallbacks for mobile browser differences.
- Mobile progress / station labels sit above bottom safe-area and browser chrome assumptions.
- Never treat `overflow:hidden` as the fix for a camera framing problem.

## Prototype constraints
This version deliberately uses CSS 3D rather than Three.js/WebGL.

Reason:
- validate spatial navigation before graphics engineering,
- keep mobile failure modes small,
- establish whether fixed cubes + platform-specific camera paths + restrained RGB light are enough to communicate travel.

If the concept succeeds, a later version may replace the CSS world with WebGL / R3F while keeping the **same fixed-waypoint / responsive-camera architecture**.

## Success criteria
1. The user can identify three spatial stations.
2. Scrolling feels like the viewpoint approaches / passes / leaves fixed objects.
3. The route visibly changes viewing angle between stations.
4. RGB reads as an optical event, not a UI palette.
5. Returning upward feels spatially consistent.
6. The scene stops doing animation work when scrolling has settled.
7. Mobile never turns a station into an unintentionally giant cropped plane.
8. Desktop and mobile feel like coherent views of the same world, not one layout mechanically scaled.
