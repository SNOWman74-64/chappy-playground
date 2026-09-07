# Design

## Reference

- UI Lab shared `../DESIGN.md`, observation notes, and learnings L-006 / L-008 / L-010.
- SATISFY official site, https://satisfyrunning.com/ (2026-09-07): running culture, photography-led collections, and short editorial headlines are content references. This study is an original composition, not a visual clone.
- Anton type specimen, https://fonts.google.com/specimen/Anton: condensed display typography for poster-like headlines.
- Photography is selected from Unsplash, with individual sources recorded in `README.md`.

## Intent

Build a stylish, mobile-first black-and-green website as requested. AFTERHOURS RUN CLUB is a fictional, welcoming night-running community. The reading sequence is atmosphere, next run, route choice, club philosophy, and a demo participation flow.

## Visual DNA

- Near-black canvas, warm white type, and sharp acid-green highlights.
- Oversized condensed English headlines paired with readable Japanese supporting copy.
- Full-bleed, dark photographic imagery; generous editorial whitespace; thin dividers instead of repeated rounded cards.
- Green marks action, the selected route, and the main brand statement. A green manifesto section changes the page rhythm.
- Small uppercase labels and monospaced metrics evoke a race bib and route notes.

## Tokens

- Canvas: `#10120f`; raised surface: `#1a1e18`; ink: `#f1f2ea`; muted: `#a4ab9e`; accent: `#c1fa51`; line: `#343a2e`.
- Display: Anton with Impact / condensed sans fallback. Body: system Japanese sans. Labels: system monospace.
- Spacing: 8 / 12 / 16 / 24 / 32 / 48 / 72 / 104 px.
- Controls: minimum 44 px targets, visible focus outlines, clear text labels.
- Radius: mostly square; pill tags only for status, and a rounded mobile sheet because it overlays another surface.

## Layout Anatomy

1. Compact brand header and accessible navigation.
2. Poster-like hero with large OWN THE NIGHT headline, running photography, and primary route CTA.
3. Editorial next-run strip with distance, meeting time, and participation CTA.
4. Route chooser: three selectable routes and a static-first SVG schematic with matching route details.
5. Acid-green club manifesto with three simple community principles.
6. Photography-led closing invitation, FAQ, and restrained footer.
7. Small-screen persistent join action, without obscuring final content.

## Interaction / Motion

- Route buttons update the visible map, distance, pace, meeting point, and selected state.
- Join actions open a native dialog, composed as a bottom sheet on phones. Select a route and pace, optionally enter a nickname, then show a local demo run pass.
- Clearly state that the demo does not submit or reserve anything. Do not request email, write user data to storage, or contact a service.
- Mobile menu supports close, Escape, focus return, and navigation. FAQ uses native details controls.
- Modest hover / press feedback and short transition durations. Primary visuals and content exist before JavaScript; reduced-motion removes movement.

## Constraints

- Writer scope: this new study directory only. Preserve existing untracked harness files and unrelated studies. No gallery registration, dependencies, git writes, or deployment.
- Vanilla HTML, CSS, and JavaScript, compatible with the existing Python static server.
- Local optimized photography, optional remote Google Fonts with useful fallbacks.
- Fictional routes are illustrative, not geographic navigation or actual scheduled events.
- Acceptance evidence: real browser at mobile and desktop sizes, route switch, join form validation and completion, keyboard / focus / Escape, reduced motion, overflow, and runtime errors; existing study contract checker.

## Adaptation from reference

Use the running-culture editorial approach for a welcoming community instead of a storefront. The black-and-green palette, Tokyo-night concept, page composition, map, copy, and interactions are original design decisions. On mobile, recompose the hero as a portrait poster and the route view as a vertical sequence; the dialog becomes a bottom sheet.
