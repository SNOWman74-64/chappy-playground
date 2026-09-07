# Retrospective

## What worked

- The study keeps the slime as the only strong visual object and makes direct body dragging the first interaction.
- A CSS slime poster provides a useful static first frame while the 3D runtime loads or if JavaScript is unavailable.
- The deformation model preserves recent pointer velocity on release, so the slime continues moving instead of snapping immediately into a canned reset.
- Desktop and touch controls share the same locomotion state rather than maintaining separate game logic.
- Browser verification confirmed that body dragging visibly deforms the surface, release returns into a wobble, and the W / Space controls move and jump the slime.
- Runtime verification completed without console errors, exceptions, or favicon noise.
- The reset control exposes a visible keyboard focus treatment (`2px solid` outline with `3px` offset).

## What felt wrong

- The face is a lightweight surface-following plane rather than true skin-attached artwork, so extreme stretches may expose some separation.
- The surface-spring approximation can stretch volume more than a tetrahedral soft-body solver.
- Headless Chrome's ordinary `--window-size` path keeps a minimum CSS viewport width near 500px, so the 390px physical screenshot is visual evidence for the narrow composition but not exact 390 CSS-pixel emulation.

## Fixes

- Reserved a broad bounding sphere so ray picking stays available during deformation.
- Capped stretch distance, vertex velocity, DPR, and frame `dt` to keep violent input bounded.
- Added responsive camera framing and dedicated touch controls instead of shrinking the desktop composition.
- Moved the facial planes forward and adjusted depth handling after the first render showed the face partially buried in the glossy body.
- Added an inline favicon so the final browser console stays clean.

## Verification

- Static study contract: `scripts/check-ui-study.ps1 -Study blue-slime-playground` -> PASS.
- Desktop browser render: verified at a 1424 x 805 CSS viewport after page load.
- Direct manipulation: center-body drag toward the upper-right produced a visible local stretch; release produced a different recovery frame rather than a snap reset.
- Keyboard controls: W movement plus Space jump were exercised in-browser; the captured jump frame showed the slime airborne with its shadow detached from the body.
- Narrow layout: the touch-control composition rendered in a phone-shaped headless window and the directional pad / jump controls were visible in the coarse-pointer layout.
- Browser runtime: no captured `Runtime.exceptionThrown`, error-level log entry, or console error during reload and interaction checks.

## Open questions

- How much transmission is readable on mobile GPUs before the face or silhouette becomes visually muddy?
- Does the current spring coupling feel soft enough under a fast two-second drag, or should stiffness/damping become user-tunable presets?
- Is a future tetrahedral or position-based dynamics pass worth the added complexity after interaction feel is evaluated?

## Candidates for shared learnings

- Directly manipulated soft surfaces benefit from carrying pointer velocity into the release state, matching the existing motion-continuity learning.
- For playful 3D prototypes, a stylized static fallback can preserve the intended composition without requiring a prerendered image asset.
