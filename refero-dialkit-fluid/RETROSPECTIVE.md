# DIAL / Apple Fluid Tuning Lab — RETROSPECTIVE

## Status

Initial implementation complete. Awaiting phone / desktop feel test.

## Why this prototype exists

The UI Lab had already discovered several preferred values by repeatedly editing source and redeploying, especially Soft Clear (`6px / 11% / 36%`) and Apple Fluid motion behavior.

DialKit is being tested as a faster feedback loop: tune the running UI first, then save the chosen numbers.

## Implementation choice

The repository has no package/build setup, so the prototype deliberately avoids introducing one.

Instead:

- the visual / gesture demo remains vanilla HTML, CSS and JS,
- a tiny React island mounts DialKit,
- DialKit values are copied into a shared runtime config,
- a custom `dialkit-values` event asks the vanilla renderer to redraw,
- material values are also mapped to CSS custom properties.

This is an important part of the experiment. A tuning tool is less useful if adopting it forces every old prototype to be rewritten.

## What is currently exposed

### Motion

- drag gain
- release projection time
- spring stiffness
- damping
- release momentum boost

### Depth

- card spacing
- side-card scale
- side-card rotation
- side-card opacity
- perspective

### Material

- blur
- opacity
- edge light
- radius

### Diagnostics

- live position / velocity / target readout

## Existing knowledge reused

### Apple Fluid

The interaction remains direct and interruptible.

DialKit is allowed to change the spring response, but pointer-down still cancels an active settle and dragging still starts from the current visual position.

### Soft Clear

The known preferred material is used as the default rather than making the user rediscover it from arbitrary midpoint values.

### UI Lab prototype philosophy

The tuning UI is clearly a development instrument, not product chrome.

## Initial technical risks

### CDN dependency

This page loads React, DialKit and styles remotely because the repository has no build pipeline.

That is appropriate for a learning prototype, but a long-lived production implementation should install and pin packages in the project's build system.

### Mobile panel obstruction

An open tuning panel can consume a large part of a phone viewport. The panel therefore starts collapsed on smaller screens.

### Too many dials

Exposing every CSS property would make the tool slower rather than faster.

The current grouping tries to expose parameters with a clear perceptual meaning: response, depth, material.

## Validation questions

Test on the actual phone:

1. Does the DialKit bubble open reliably inside the in-app browser?
2. Can a slider be adjusted without accidentally dragging the card deck underneath it?
3. Do values persist after reload?
4. Does JSON Copy make a chosen state easy to bring back into DESIGN.md?
5. Which dials materially change the feel, and which are noise?
6. Is tuning the spring live meaningfully faster than the previous edit / deploy loop?

## Candidate learning — not promoted yet

> A design-tuning tool is most valuable when controls are organized by perceptual effect, not by implementation property.

For example, `stiffness + damping + projection` belongs under **Motion**, while `blur + opacity + edge` belongs under **Material**.

Do not promote this to shared LEARNINGS until the live workflow has been tested.
