# Frameflow — Retrospective

## What worked
- The Lottielab-style reference naturally supports motion because the product UI itself is an animation editor.
- Keeping the editor chrome nearly static makes the authored violet object feel much more important.
- Synchronizing preview, playhead and keyframes immediately makes the fake editor feel believable without recreating a full animation product.
- A single interactive 4-second loop is enough to demonstrate the design language while staying lightweight.
- The light neutral system remains recognizably calm even with motion because color is restricted to one main accent.

## Why this is safer than the Orbit creature experiments
- No particle physics.
- No anatomy or silhouette recognition problem.
- No SVG micro-instance explosion.
- Motion is low-dimensional and deterministic: position, scale, rotation, radius and opacity.
- The static first frame remains a valid product mockup even if animation is disabled.

## Risks / Improvements
- The demo uses a simplified timeline rather than reproducing a real editor data model.
- On very narrow screens the layer column is intentionally compressed; a production editor would need a dedicated mobile interaction model.
- The preview path is decorative rather than mathematically derived from the animated object's exact trajectory.

## Reusable Knowledge
- For product-motion demos, animate the **content inside the tool**, not the entire tool chrome.
- Synchronized UI feedback can make a shallow prototype feel deeper than adding more visual effects.
- A simple scrubber is high-value: it lets users inspect easing and states instead of only watching a loop.
- When a design system uses a single accent color, motion can become the second source of emphasis without adding more hues.

## Final State
Current visual: **Frameflow — interactive bright-paper animation editor demo**.

Primary interaction: play / pause / restart / timeline scrub, with the preview object, headline, playhead and keyframes synchronized over a 4-second loop.