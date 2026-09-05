# PAPER MOON — Touch detail viewer v2.1

## Scope

This is an additive mobile detail viewer, not first-person walking or a new perspective camera. The existing `app.js`, geometry, brewing, local storage and postcard exporter are unchanged. `index.html` loads `explore.css` and then the deferred `explore.js` after the original deferred app.

## Interaction

- Overview: one finger retains the original horizontal rotation.
- Two fingers: pinch to zoom around their midpoint; move both fingers to pan.
- Zoomed view: one finger pans. The original left/right buttons still rotate the model.
- Double-tap without a drag or multi-touch gesture: zoom at the tap, or return to overview.
- Buttons: zoom in/out, overview, and broad window/counter/table/plant display regions.
- Keyboard on the scene: + / - zoom; 0 or Escape restores overview. Existing left/right arrow rotation remains.

Preset destinations are display regions, not world-space object picking. Their framing can vary with the current rotation. There is no wall removal, floor-level camera, collision-aware walking, or arbitrary furniture raycasting in this patch. Existing postcards still capture the original whole-scene composition rather than the cropped detail view.

## Integration details

The new layer changes layout width/height, not CSS pixel scaling. The original renderer's ResizeObserver sees the actual enlarged canvas size and redraws it; hotspot buttons retain a 44 CSS-pixel hit target. Zoom has an upper bound of 2.6x, reduced for large viewports to target a drawing-buffer budget of 4 million pixels / 4096 pixels per side. This does not reduce an already larger 1x viewport.

A second finger cancels the original one-pointer rotation through a zero-delta pointer move followed by pointercancel. The compatibility bridge is guarded against re-entry. Dropping back to one finger rebases the pan origin; pinch releases cannot be mistaken for double-taps. Blur, visibility changes and resize clear the gesture state. The integration relies on the current original pointer handlers; revisit the bridge if those handlers change.

No new dependencies, network calls, tracking, storage or account permissions were added by the viewer. It has no autonomous animation loop; pointer rendering is batched with requestAnimationFrame. Both scripts use defer in document order.

## Verification — 2026-09-05

`node --check explore.js`: PASS.

A local headless Chromium DOM/event fixture passed 28 assertions. It reproduced the original rotation handlers with a renderer test double and a ResizeObserver. Touch sequences were synthetic PointerEvents, not physical touch input.

Checked: overview, zoom buttons, enlarged viewport sizing, 44px hotspot target, four preset states, original one-finger rotation, second-finger cancellation and velocity reset, pinch zoom, two-to-one-finger continuity, release cleanup, double-tap zoom/reset, no false double-tap after pinch, pointercancel, blur cleanup, hotspot clicking, document overflow at widths 320/375/390/430/1024, fallback zoom state, reduced-motion reset, keyboard zoom/reset, and absence of fixture page errors.

**Not verified in that fixture:** actual WebGL rendering, complete production-page layout, precise furniture framing at every rotation, iPhone Safari/WebView gesture arbitration, physical-device performance, live-page interactions, or postcard export regression. GitHub publication status is checked separately after committing. Passing the fixture must not be represented as a full end-to-end or iPhone test.

## References

- Shared project principles: `../DESIGN.md` and `../LEARNINGS.md`.
- Pointer gestures: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
- Cancellation: https://developer.mozilla.org/en-US/docs/Web/API/Element/pointercancel_event
- Deferred script order: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script
