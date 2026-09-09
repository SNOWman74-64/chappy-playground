# CANAL verification — 2026-09-09

Scope: new `canal-city/` and one `catalog.json` entry. Existing user edits to harness documents were preserved. Browser: connected Chromium, local Python static server on port 4173. Source: files in this study after water/pin/iframe fixes, before the accompanying commit.

## Observed results

| Condition | Result | Evidence |
| --- | --- | --- |
| Blender model generation/export | PASS | Blender 5.2.1 background run ended with `CITY_EXPORT_COMPLETE`, exit 0; editable blend and 827,188-byte GLB generated |
| Direct load and desktop rendering, 1440×900 | PASS | `evidence/desktop-day.png`, inspected; WebGL ready, 52 draw calls including moving items |
| Mobile rendering, 390×844 | PASS | `evidence/mobile-day.png`, inspected; no horizontal document overflow |
| Clock tower pin and market/garden navigation | PASS | Clicked visible clock pin and both destination buttons; all corresponding story titles observed; count reached `3 / 3` |
| Night lighting and mobile selected story | PASS | `evidence/desktop-night.png`, `evidence/mobile-night-place.png`, inspected; windows emit warm light and controls remain readable |
| Pause / resume | PASS | Tram position unchanged after 250ms while paused, changed after resume |
| Camera controls | PASS | Zoom button, canvas ArrowLeft and mouse drag each changed observed camera coordinates; overview cleared selection and restored framing |
| Keyboard focus | PASS | Canvas Tab led to named clock pin with solid visible focus outline; arrow key changed camera |
| Reduced motion | PASS | Emulated `reduce` before reload: motion starts paused; selection camera is immediately at destination on next frame |
| Model error / retry | PASS | Isolated test page aborted GLB request, displayed readable error and retry; removing the abort and clicking retry restored ready state |
| Gallery integration | PASS | CANAL link opened viewer `?id=canal-city&tab=preview`; embedded scene ready; Design/Intent and Learnings/Fixes visible in corresponding tabs |
| Short gallery viewport | PASS | `evidence/gallery-preview.png`, inspected after fix; discovery bottom 692px, navigation top 724px inside iframe |
| Runtime console | PASS | Direct study page: zero errors/warnings; exercised actions: zero page errors |
| JavaScript syntax | PASS | `node --check canal-city/app.js` |
| Study contract | PASS | `scripts/check-ui-study.ps1 -Study canal-city`: `UI_STUDY_CHECK_PASS: canal-city` |

## Existing failures and limits

- Full repository study check still reports only `winter-walk` missing from the catalog. That study was deliberately hidden in the existing history, and this task does not change it.
- The existing gallery requested a missing `/favicon.ico` (404). The new study supplies its own inline favicon; no new-study asset failed during normal loading.
- A combined browser-test invocation timed out in a polling wait. Checks were rerun as individual interactions with observed state and screenshots; the table reports those completed checks.
- Mobile results are viewport emulation, not physical iOS/Android testing. Real-device pinch behavior and performance on other GPUs/browsers are not verified. No claim of formal accessibility conformance.

The requested local implementation, responsive samples, interactive controls and gallery integration are accepted within this tested scope. Push/public deployment is checked separately after commit.
