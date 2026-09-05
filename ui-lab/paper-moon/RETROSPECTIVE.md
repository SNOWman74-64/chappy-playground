# PAPER MOON — Retrospective

Date: 2026-09-05

## What worked

The same visual identity survives the main scene, the cup-making sheet, and the exported postcard. The interaction has a small complete arc: choose a time, make a cup, leave with a keepsake. The page also remains recognizable without JavaScript because its first frame is inline SVG.

The main layout fit 375×667, 390×844, 430×932, 768×1024, and 1440×900 test viewports without document overflow. At 320×568, the page deliberately uses 34 px of vertical scrolling rather than hiding controls. No tested width had horizontal overflow after the fixes.

## What felt wrong

The initial 3D camera used a fixed vertical span. The independent geometry render exposed a clipped upper wall even though the CSS layout itself was not overflowing. A decorative sun also extended one pixel beyond a 320 px viewport. The first fallback implementation did not visually reflect lamp and plant changes.

## Fixes

- Fit projected world bounds for the current camera yaw and actual stage aspect ratio, then add 9% padding.
- Reduce the sun's maximum width so the decorative layer stays within the viewport.
- Update fallback cup, lamp, leaves, and time-of-day treatment alongside the WebGL state.
- Separate unavailable storage from malformed JSON. Corrupt data must not falsely label working storage as unavailable.
- Stop pouring on release, cancel, close, blur, and page hiding. Guard completion against duplicate records.
- Set the renderer's lost flag to false before rebuilding restored-context buffers. The order was corrected during code review; recovery still needs an actual-browser test.

## Open questions

The controlled Chromium environment could not provide a WebGL context. UI interaction tests therefore exercised the SVG path. The actual shader sources and generated vertex data did compile and render in Mesa OpenGL ES, including shadows and both day/night lighting, but this is not a substitute for Safari WebGL integration testing.

Test on a physical iPhone: sustained drag responsiveness, safe-area/browser-toolbar behavior, WebGL context recovery after backgrounding, VoiceOver navigation, real persistent storage across reloads, native PNG download, and file sharing. No frame-rate, battery, full accessibility, or cross-browser certification is claimed.

The default scene is intentionally compact. Larger content should move toward reusable prop assets and a standard renderer rather than increasing this experiment's custom engine surface.

## Candidates for shared learnings

A camera crop is a projection problem, not necessarily a CSS overflow problem. Fallbacks should preserve meaningful state, not only a recognizable illustration. A keepsake can give a small interactive study a satisfying ending without adding an unrelated dashboard.

These are candidates only; no new cross-project rule was promoted without further examples. Detailed checks are in `TEST-REPORT.md`.
