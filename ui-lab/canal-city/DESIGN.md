# Design

## Reference
Original miniature canal city; no single source recreated.
Technical sources: [Blender glTF export](https://docs.blender.org/api/main/bpy.ops.export_scene.html), [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html).

## Intent
Explore a small imaginary city immediately, with orbit/zoom, three discoverable places, day/night light and a moving tram. Integrate with the existing UI Lab gallery and push only this task's files.

## Visual DNA
An architectural scale model on an ivory drawing board. Deep forest typography, acid-yellow route markers, teal water, terracotta roofs. The city occupies the main viewport; an editorial side rail gives each place a short story.

## Tokens
Paper #f3f2ec; ink #183d35; muted #61716a; accent #dbef74. Serif Japanese display heading, system sans controls, monospaced map annotations. Thin rules instead of repeated cards.

## Layout Anatomy
Header: identity, gallery return, time control. Desktop: left narrative rail, large 3D city, right camera controls. Bottom: three place selectors and movement instructions. Mobile: compact header/story, full-width city, horizontal place list and bottom controls.

## Interaction / Motion
Drag rotates; wheel/pinch zooms; keyboard arrows rotate and +/- zoom with the canvas focused. Selecting a pin or place frames that destination and updates story/progress. Overview resets camera. Day/night switches lighting, water and window glow. Pause stops tram and water motion; reduced motion defaults to paused and instant camera transitions. No automatic camera rotation.

## Constraints
Static hosting, local existing Three.js modules, no external asset requests. Blender background generation is isolated from any open user scene. Export by material to bound draw calls; capped pixel ratio and shadow map. Loading/error UI must remain legible without WebGL. Browser verification at 1440×900 and 390×844 plus gallery integration. No unrelated changes staged.

## Adaptation from reference
Original procedural buildings, clock tower, market, park and bridges. Blender source and reproducible Python generator are included alongside GLB.
