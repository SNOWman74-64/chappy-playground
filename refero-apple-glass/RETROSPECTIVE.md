# Glass Lab — Retrospective

## Initial implementation
Created a single Apple-style glass material study with six interactive variants:

1. Floating Navigation
2. Glass Dock
3. Control Center
4. Modal Sheet
5. Lens
6. Notification Stack

A shared `Blur / Opacity / Edge light` tuner changes the main material variables across the whole page.

## What the study is testing
- Whether Apple-like restrained layout can support stronger glass treatment without becoming a generic glassmorphism dashboard.
- Which UI roles benefit from translucent context-preserving surfaces.
- How much interaction is needed before glass feels functional rather than decorative.
- How the same material recipe behaves across navigation, dense controls, temporary overlays and repeated notifications.

## Deliberate constraints
- No WebGL / shader refraction in v1.
- No external product photography.
- No heavy drop shadows.
- No global glass card system.
- Blue remains an interaction color rather than decoration.

## Implementation choices
- `backdrop-filter` + `-webkit-backdrop-filter` for Safari.
- CSS custom properties for shared material tuning.
- Native `dialog` for modal behavior.
- Pointer-follow lens with range-slider fallback.
- Button / range based interactions so every demo works on touch screens.
- One-column mobile recomposition rather than shrinking desktop demo layouts.

## Known limitation
The Lens demo is an optical approximation. CSS backdrop filters can create blur / saturation / contrast changes but do not provide convincing physical refraction or lens distortion. A future shader-based study should be separate from this UI material baseline.

## Reusable conclusion
**Glass UI is strongest when it preserves useful context behind temporary controls.**

The important hierarchy is:

```text
content / product
→ contextual foreground layer
→ selected / active material inside that layer
```

If every section is glass, there is no meaningful background for the material to reveal and the effect becomes decorative noise.

## Final state
Current visual: **Glass Lab — Apple-style multi-pattern interactive glass UI study**.
