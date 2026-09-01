# Orbit — Dark Constellation Study

## Reference
- Refero: https://styles.refero.design/style/e5f5f8cf-e68d-4ed1-bbf5-6b67569af648
- Reference theme: Dala / “constellation floating on black velvet”.

## Visual DNA
- Pure `#000000` is the actual surface, not dark gray.
- Massive weight-400 sans headlines; hierarchy comes from scale and negative tracking rather than bold weight.
- Body copy stays unusually light and airy.
- One saturated violet is reserved for primary action.
- Amber appears as tiny editorial emphasis, not another CTA color.
- No cards, borders, shadows or dashboard surfaces.
- Colored triangle particles act as the brand image.
- Spacious asymmetric composition keeps the particle field visually dominant without turning the page into a dashboard.

## Adaptation
The mock is an original fictional product named **Orbit**: an ambient collective-memory system that connects distant notes and unfinished ideas. The reference's design grammar is preserved while all branding, copy and concept are replaced.

## Layout Anatomy
1. Transparent navigation on black
2. Giant typographic hero
3. Large constellation / memory-field visual
4. Sparse four-part feature strip
5. Minimal testimonial
6. Single violet CTA repeated only at major decision points

## Core Principles
- **The void is the design.** Do not add dark cards just because the canvas is black.
- **Scale before weight.** Large text remains regular weight.
- **One visual signature beats many illustrations.** Triangle particles carry the identity.
- **Color has strict jobs.** Violet = action; amber = emphasis; chromatic variety belongs mostly to the particle field.
- **One or two ideas per viewport.** Density should remain extremely low.

## Final Visual — Memory Vortex

The final hero visual is a deterministic **SVG + CSS particle vortex** rather than a Canvas physics system.

Structure:
- outer triangle orbit
- middle counter-rotating orbit
- inner faster orbit
- breathing central cluster
- soft radial halo
- subtle whole-object vertical drift

The vortex represents fragments circling a shared semantic center: notes, conversations, ideas and references gradually becoming connected knowledge.

## Why SVG/CSS

Several deeper motion experiments were attempted — free Canvas particles, touch repulsion, an eagle silhouette, an articulated eagle rig and a jellyfish-like organism. These were valuable experiments but became fragile on small mobile viewports.

The current visual intentionally prioritizes:
- reliable first frame
- mobile stability
- stable topology
- low implementation complexity
- preservation of the original constellation language

The critical hero visual therefore exists even if JavaScript does not run.

## Motion Language
- very slow
- ambient
- no sudden acceleration
- opposite rotational directions create life without chaos
- the center breathes rather than pulses aggressively
- motion should remain secondary to the typography

If motion is disabled through `prefers-reduced-motion`, the same particle composition remains visible as a static constellation.

## Responsive Rule
On mobile, the asymmetric desktop hero becomes sequential: statement → explanation → constellation. The oversized typography remains intentionally oversized instead of being normalized into ordinary mobile SaaS sizing.

The particle field keeps the same SVG topology at every viewport size, avoiding mobile-specific geometry reconstruction.