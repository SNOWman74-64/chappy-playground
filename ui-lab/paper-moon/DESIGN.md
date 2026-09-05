# PAPER MOON — Design

## Reference

Original concept, not a reproduction of an existing café or reference screenshot. The starting points are this repository's `ui-lab/DESIGN.md`, `ui-lab/LEARNINGS.md`, and the Paper Cafe direction: a small, tangible world for the web. In particular, L-006 (static first frame), L-011 (continuous gestures), L-012 (camera framing), and L-013 (opaque structure) inform this study.

## Intent

「余白を、ひとくち。」A pocket-sized café where the user changes the light, tends a plant, makes a coffee, and keeps a postcard. The primary outcome is a complete little experience, not a landing-page screenshot. The café, blends, menu, and displayed times are fictional; this is not an ordering service.

## Visual DNA

An editorial opening, a single miniature world, and a stable thumb-level action area. Warm paper is the surface; sage is the interaction color; terracotta and honey belong to the objects. Mincho text supplies a quiet Japanese voice, with small Latin annotations acting as exhibition labels. Rotation is reserved for the seal and postcard, never for controls. Card containers are not the default layout unit.

## Tokens

- Day: paper `#f4f0e7`, ink `#2e493e`, divider `#d9ddcc`.
- Dusk: paper `#f2e4d9`, ink `#654539`.
- Night: paper `#242b3b`, ink `#eadfbe`.
- Cups: sage `#8ca994`, cream `#e7d7b5`, rose `#c78f7f`.
- Main action: 56–68 px high depending on viewport. Furniture hotspots: 44 × 44 px. Cup swatches: 46 × 46 px.
- System fonts only. No downloaded fonts, images, models, or audio.

## Layout Anatomy

Mobile: masthead → editorial title → flexible scene → time selector → primary action → quiet footer. Use dynamic viewport height and safe-area padding. At very short heights, allow a small natural scroll instead of cropping controls or disabling document scrolling globally.

Desktop: introduction and actions occupy the left column; the same world has a larger right-hand stage. The orthographic camera fits the projected world bounds with padding for the actual stage aspect ratio and current yaw. This is framing, not a clipped desktop shot.

## Interaction / Motion

- Day / dusk / night changes both interface tokens and scene lighting.
- Horizontal drag directly changes camera yaw; recent release velocity passes into an interruptible spring. Outer bounds have resistance. Arrow buttons and keyboard arrows are alternatives.
- Lamp toggles light; plant grows two additional sets of folded leaves. Both also update the SVG fallback.
- The brew sheet offers three blends and cup colors. Hold to pour for approximately 2.6 seconds, release to pause, or use one-tap automatic pouring. Closing or hiding the page stops pouring. Completion creates one record, never one record per frame.
- A postcard is generated locally at 1080 × 1440, with a 48-character message. Native sharing is shown only when file sharing is available.
- Sound starts off. Turning it on enables short, locally synthesized interaction notes.
- Reduced motion removes CSS animation and uses immediate camera settling. The WebGL renderer sleeps after changes settle; the only continuing decorative animation is the small steam in a completed, open brew sheet.

## Constraints

No build step, dependencies, external assets, analytics, account, or backend. Three runtime files: `index.html`, `styles.css`, `app.js`. `app.js` contains geometry, rendering, interaction state, and export sections. The default procedural scene has 8,663 triangles; it is not a downloaded GLB and does not currently expose GLB export.

Use a single interleaved mesh buffer, a locally drawn sign atlas, flat shading, a packed-depth shadow map, and capped DPR (2). Keep structural surfaces opaque. Avoid a permanent animation loop and avoid `preserveDrawingBuffer`; export explicitly redraws and copies the scene in the same task.

Storage is namespaced to `paper-moon:v1`, validated on read, capped at 12 records, and optional. Invalid JSON resets safely; blocked storage degrades to the current tab. Never inject user text as HTML. Keep the SVG first frame when JavaScript or WebGL is unavailable. Context restoration must rebuild buffers after clearing the lost flag.

## Adaptation from reference

This translates the shared study principles into an original interactive place rather than copying a page layout. The engineering choice of a small native WebGL renderer keeps this standalone experiment independent of a CDN. For a larger production scene or editable asset pipeline, evaluate an established rendering engine and prop-level asset formats rather than indefinitely expanding this custom renderer.

## Verification boundary

See `TEST-REPORT.md` for observed results. Browser DOM tests and an independent Mesa OpenGL ES shader/geometry render were run separately. These do not constitute an iPhone Safari end-to-end WebGL or native-share test. Actual-device performance, context-loss recovery, and the browser's download/share experience remain acceptance checks.
