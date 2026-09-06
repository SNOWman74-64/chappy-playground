# Design

## Reference

- User-supplied `../docs/model/once-upon-a-cup-computer-use.blend`.
- Direct inspection: `evidence/source-reference.png` and `evidence/source-audit.json`.
- Shared rules: `../DESIGN.md`; responsive camera lesson L-012 in `../LEARNINGS.md`.
- The reference is an open teal-bound book holding a cream café, coral tiled roof, striped awning, terrace tables, pastry cart, cut-paper trees, clouds, and a sun. Preserve these identifiable details.

## Intent

Make the supplied model the centerpiece of a small, inviting Japanese-language café story. The first view should be a finished composition, with an explicit invitation to explore in 3D. Let visitors orbit, zoom, visit three viewpoints, and switch between afternoon and evening. This is a fictional café experience, with no invented ordering or reservation flow.

## Visual DNA

Warm paper, deep teal ink, restrained coral accents, generous editorial spacing, a large serif title, and small uppercase chapter annotations. The model carries the visual detail; the surrounding interface should stay quiet. Use fine rules to separate chapters rather than repeated cards.

## Tokens

- Paper: `#f6f2e9`; ink: `#263f3a`; secondary ink: `#68726a`.
- Accent: `#ae503e`; rule: `#d8d4c7`; evening paper: `#eae3d8`.
- Display: Georgia / Times New Roman; Japanese: Yu Mincho / Hiragino Mincho ProN / serif. Controls: system sans serif.
- Body copy: 15–16px with approximately 1.9 line height. Controls: at least 44px touch height.
- Layout: centered 1440px maximum, fluid 24–72px gutters, fine dividers, minimal radii.

## Layout Anatomy

1. Masthead: cup/book mark, wordmark, two anchor links, a compact fictional opening note.
2. Hero: large editorial title and Japanese invitation beside the open-book scene.
3. Scene: immediate rendered poster, on-demand 3D, a time-of-day switch, exploration controls, three chapter/viewpoint buttons, and one changing descriptive caption.
4. Story: a short typographic chapter about paper, coffee, and taking a pause, plus three numbered observations tied to the actual model.
5. Footer: return-to-top link and an explicit fictional-café note.

## Interaction / Motion

- Download the 3D engine/model only after an explicit exploration or viewpoint action; the locally rendered poster is useful with no JavaScript.
- Drag to orbit, pinch or use explicit buttons to zoom. Supply keyboard equivalents, a reset button, and a clear exit from touch exploration so mobile scrolling is never trapped.
- Viewpoints: whole book, terrace, pastry cart. Reframe by viewport aspect instead of scaling a desktop camera blindly.
- Afternoon/evening changes lighting and page tone. No automatic rotation or background motion.
- Render on demand; stop when camera and lighting are still. Pause when hidden/offscreen. Reduced motion uses immediate viewpoint changes.
- Loading and recoverable error states retain the poster and readable story. On WebGL/context failure, return to the poster and allow retry.

## Constraints

- Preserve the supplied `.blend` byte-for-byte; generate derived files only in this study.
- Optimize expensive text tessellation/curve detail and batch static geometry by material. Preserve the silhouette and semantic detail; avoid blanket decimation.
- Record actual source and exported geometry, file sizes, and source hash in the optimization report. A compressed `.blend` size is not an equivalent baseline for a GLB.
- Use pinned, locally hosted runtime assets with licenses; no font downloads, CDN dependency at runtime, telemetry, build step, or package installation.
- Use the existing Python static server. Do not edit unrelated studies, harness policies, or the external gallery catalog.
- Browser evidence must cover desktop/mobile, the primary controls, keyboard focus, fallback behavior, and runtime errors. Record limitations explicitly.

## Adaptation from reference

The model's teal binding becomes the UI ink, its roof becomes the restrained coral accent, and its book pages become the page background. Instead of rebuilding the café in HTML, retain the actual Blender geometry as the interactive artifact. The book's chapter captions inspire the viewpoint navigation and story structure.

## Technical references

- [Blender glTF export](https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html).
- [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html).
- [Three.js DRACOLoader](https://threejs.org/docs/pages/DRACOLoader.html).
- [Three.js OrbitControls](https://threejs.org/docs/pages/OrbitControls.html).
- [Three.js rendering on demand](https://threejs.org/manual/en/rendering-on-demand.html).

Three.js documentation read on 2026-09-07. The Blender manual was located through official search results, but fetching its full page was unavailable; export options were verified by the successful local Blender export and GLB inspection. The implementation pins Three.js r180 independently of the moving documentation.
