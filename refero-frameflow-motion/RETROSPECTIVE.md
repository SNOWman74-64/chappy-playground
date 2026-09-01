# Frameflow — Retrospective

## What worked
- The Lottielab-style reference naturally supports motion because the product UI itself is an animation editor.
- Keeping the editor chrome nearly static makes the authored violet object feel much more important.
- Synchronizing preview, playhead and keyframes immediately makes the fake editor feel believable without recreating a full animation product.
- A single interactive 4-second loop is enough to demonstrate the design language while staying lightweight.
- The light neutral system remains recognizably calm even with motion because color is restricted to one main accent.
- Adding `Speed / Distance / Morph` sliders made the demo much more useful as a small motion playground without turning it into a full editor.

## Why this is safer than the Orbit creature experiments
- No particle physics.
- No anatomy or silhouette recognition problem.
- No SVG micro-instance explosion.
- Motion is low-dimensional and deterministic: position, scale, rotation, radius and opacity.
- The static first frame remains a valid product mockup even if animation is disabled.

## Mobile issue found after adding controls

### Symptom
On iPhone the desktop editor composition was technically still present, but it became visually cramped:

- the permanent left `Layers` rail consumed too much width,
- timeline labels and tracks were squeezed together,
- play button / scrubber / time readout competed for one horizontal row,
- the new motion-control sliders inherited desktop horizontal assumptions,
- the result was not a horizontal overflow bug so much as a **desktop information architecture compressed into a phone**.

### Why it happened
The first responsive pass mostly reduced widths and font sizes while preserving the desktop editor topology:

```text
layers | stage
       | timeline
       | transport
       | controls
```

That approach works for simple pages, but dense tool UIs often need their **layout axis to change**, not just their measurements.

## Mobile fix
At the mobile breakpoint the editor now changes composition instead of merely shrinking:

```text
layers → horizontal chip row
stage
mobile timeline
play + time
scrubber
Speed
Distance
Morph
```

Implemented rules:

- `studio` switches from two columns to one column.
- `Layers` becomes a wrapping horizontal toolbar above the stage.
- Timeline keeps a small dedicated label column while tracks use `min-width: 0`.
- Transport becomes a two-row grid: `play + time` first, scrubber full-width below.
- `Speed / Distance / Morph` controls stack vertically on mobile.
- Hero switches to one column earlier (`900px`) so the editor gets enough horizontal space before the phone breakpoint.
- Preview artboard remains fluid instead of receiving a fixed mobile width.

### Main lesson
**Responsive tool UIs should recompose, not just compress.**

When a desktop layout contains multiple persistent rails, timelines and controls, shrinking each region preserves the structure but destroys the usable hierarchy. On mobile, decide which regions become rows, toolbars, sheets or stacked controls.

## Risks / Improvements
- The demo uses a simplified timeline rather than reproducing a real editor data model.
- The preview path is decorative rather than mathematically derived from the animated object's exact trajectory.
- `Distance` currently controls one authored path rather than editing actual spatial keyframes.
- A production animation editor would likely move layers and advanced controls into collapsible sheets or tabs instead of keeping everything visible.

## Reusable Knowledge
- For product-motion demos, animate the **content inside the tool**, not the entire tool chrome.
- Synchronized UI feedback can make a shallow prototype feel deeper than adding more visual effects.
- A simple scrubber is high-value: it lets users inspect easing and states instead of only watching a loop.
- A few meaningful sliders are enough to turn a passive demo into an exploratory one.
- When a design system uses a single accent color, motion can become the second source of emphasis without adding more hues.
- For dense interfaces, mobile responsiveness is often an information-architecture problem rather than a CSS sizing problem.

## Final State
Current visual: **Frameflow — interactive bright-paper animation editor demo with mobile recomposition**.

Primary interaction:
- play / pause / restart,
- timeline scrub,
- Speed,
- Distance,
- Morph,
- synchronized preview object, headline, playhead and keyframes over a 4-second loop.
