# Design

## Reference

- Interaction and material reference: `https://github.com/scottstts/Jelly-Baby`.
- The reference is used to study the combination of a small tabletop world, elastic character deformation, direct grabbing, release momentum, camera orbit, jumping, and touch-friendly play.
- No Jelly Baby source code, character mesh, textures, or authored assets are copied into this study.
- Shared UI Lab rules: `../DESIGN.md`; motion continuity and responsive-camera notes in `../LEARNINGS.md`.

## Intent

Create an original blue slime character that can be touched like a soft object instead of merely watched as an animation. The first interaction should be obvious without a tutorial: grab the body, stretch it, let go, and watch the deformation travel through the surface. Movement and jumping are secondary ways to create more wobble.

The character direction is a familiar cheerful blue slime archetype: saturated blue, a pointed droplet silhouette, large expressive eyes, and a small happy mouth. It should feel adjacent to classic game slimes while remaining an original character rather than a one-to-one reproduction of a specific copyrighted design.

## Visual DNA

Warm tabletop, soft daylight, translucent saturated blue material, simple dark face, and very little interface chrome. The slime is the only visual protagonist. UI sits at the edges as small lab notation so the center remains free for direct manipulation.

The static fallback uses the same silhouette and face logic as the 3D version so the page still has a meaningful first frame before JavaScript initializes.

## Tokens

- Paper / room: `#ede8df`; ink: `#1a2130`; muted ink: `#686b6e`.
- Slime: `#1d82ff` with deeper optical attenuation near `#1269df`.
- Table: warm oak around `#c49a6e` with generated low-contrast grain.
- Interface rules: one-pixel dark alpha dividers; glass controls only on touch where controls must float over the scene.
- Display accents stay under 12px except the short interaction title. The 3D object provides the visual hierarchy.

## Layout Anatomy

1. Thin masthead: study name, index, reset.
2. Full-viewport 3D stage: tabletop and slime centered in a camera composition that changes for tall mobile screens.
3. Lower-left interaction note: one sentence explaining the core grab/stretch behavior.
4. Desktop edge hint: WASD, jump, body drag, camera orbit.
5. Mobile controls: compact directional pad plus jump button, placed above the safe area.

## Interaction / Motion

- Pointer down on the slime creates a local grab field around the hit point.
- Pointer movement follows one-to-one in camera space with a bounded stretch distance.
- Release transfers recent pointer velocity into nearby vertices so the handoff does not stop dead.
- Neighbor coupling propagates deformation through the surface while spring and damping forces return it toward the authored rest shape.
- WASD / arrow keys or touch directions move the character across the table and inject small lateral deformation pulses.
- Space / jump adds root vertical motion plus an internal impulse; landing adds a compression-and-spread impulse.
- Dragging empty stage space orbits the camera through OrbitControls; pinch/wheel controls distance.
- Reduced-motion preference removes CSS transitions; direct manipulation remains because it is the core function rather than decorative motion.

## Constraints

- Keep the study standalone and static-server compatible: no build step and no package installation.
- Three.js r180 is copied from the existing licensed local vendor and keeps its MIT license beside the runtime files.
- Do not copy Jelly Baby's unlicensed code or authored assets. Recreate behavior with a separate lightweight deformation model.
- This study intentionally does not claim physical equivalence with Jelly Baby's tetrahedral XPBD/WASM solver. It is a surface spring approximation aimed at interaction feel and visual study.
- Cap DPR and total drawing-buffer pixels for mobile stability.
- Recompose the camera for narrow screens instead of shrinking a desktop framing.
- Browser verification must cover desktop, a phone-sized viewport, body grabbing, release, movement/jump controls, focus visibility, and runtime console errors.

## Adaptation from reference

The reference's small translucent character on a wooden tabletop becomes a blue droplet-like slime with a different face and silhouette. The grab/release idea is preserved as the primary learning target, but the implementation uses a compact vertex spring network rather than the reference project's generated tetrahedral cage, WASM accelerator, optical worker, or source assets.

The surrounding interface is reduced to a lab label and interaction hints so the study reads as an interaction specimen instead of a game UI clone.
