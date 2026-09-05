# PAPER MOON — Test report

Date: 2026-09-05. This report distinguishes observations from unverified browser/device behavior.

## Executed

`node --check app.js`: PASS.

Isolated Chromium DOM tests used the exact HTML, CSS and script, inlined into a test document because the runner blocked local navigation and did not supply WebGL. They are not tests of a live deployed URL.

| Viewport | Document size | Result |
| --- | --- | --- |
| 320×568 | 320×602 | No horizontal overflow; 34 px intentional vertical scroll |
| 375×667 | 375×667 | Fits |
| 390×844 | 390×844 | Fits |
| 430×932 | 430×932 | Fits |
| 768×1024 | 768×1024 | Fits |
| 1440×900 | 1440×900 | Fits |

Observed PASS: Escape closes the native dialog and restores the trigger's focus; a partial hold pauses after release; closing during automatic pouring produces no record; a completed pour produces exactly one record; a postcard PNG is generated at 1080×1440; changing its message regenerates the image; fallback lamp/plant controls update the SVG; reduced-motion styling reports zero transition duration; no-JavaScript first frame is visible with inactive controls; no uncaught JavaScript errors occurred.

Controlled storage-adapter tests passed for restoring valid preferences, keeping only 12 records, writing changed preferences, and recovering from malformed JSON. The opaque-origin test document also exercised storage-unavailable behavior. These are not evidence of native persistence across a real browser restart.

## Independent graphics validation

Exported the actual procedural vertex array, vertex/fragment shader sources, and view/light matrices into a Mesa 25.0.7 OpenGL ES 3.2 / llvmpipe offscreen test. Both shader programs compiled and linked, the shadow framebuffer was complete, and day/night images rendered with no GL error. The default scene contained 8,663 triangles. Sign text in that independent render used an equivalent locally drawn atlas, not the browser's exact font rasterization.

This exposed and verified the correction for the clipped upper wall. It validates the shader/geometry pipeline separately from browser integration.

## Not executed / remaining acceptance checks

- Physical iPhone Safari / iOS WebView testing.
- Browser WebGL end-to-end gesture, export, and context-loss/restoration testing.
- Native file-download and Web Share sheet completion.
- Native persistent storage across actual reload/restart.
- GPU frame-time, memory, battery, or thermal measurements on a phone.
- Full screen-reader and WCAG audit.

## Local use

Serve the repository root with any static HTTP server and open `/ui-lab/paper-moon/`. There is no dependency installation or build step. The read-only `PaperMoon.diagnostics()` reports renderer mode, triangle count, draw count, pending animation, mood, record count, and storage availability. In a working WebGL browser, the draw count should stop increasing when no interaction or transition remains.
