# Bad Apple!! — verification report

Date: 2026-09-17 (Asia/Tokyo).

Preview: `http://localhost:4173/ui-lab/bad-apple/`

## Scope and result

The complete imported vector sequence is implemented: 6,572 frames at 30fps, with a 480×360 composition rendered on a responsive Canvas. Visual duration is 219.0667 seconds; the separate mono WAV lasts 219.149932 seconds. No video file, video element, animated bitmap sequence, embedded video player, or video decoder is used by the study.

The browser acceptance suite passed **25 of 25 checks** at `2026-09-17T12:20:44.104Z`. The saved results cover the audio-loading and responsive-layout fixes. The subsequent fullscreen-exit change was verified separately through the browser controls. This report distinguishes those observed results from the limits below; it does not claim pixel-identical reproduction of the original PV.

## Automated browser evidence

Harness: [browser-check.html](evidence/browser-check.html). Recorded output: [browser-check-results.json](evidence/browser-check-results.json).

| Condition | Observed result |
| --- | --- |
| Complete, valid vector data | All 6,572 paths parsed; 65 intentionally empty, full-white frames retained. |
| No video playback | No video/player embeds inside the app and no video network requests. Runtime resources were CSS, JavaScript, a static SVG poster, WAV, manifest JSON, and compressed path JSON. The verification harness itself uses an iframe to host the app. |
| Audio ready before transport is enabled | `readyState=4`; seekable range `[0, 219.149932]`. |
| Responsive layout | 390×844 and 1440×900 specimens had no horizontal overflow. Visible stages measured 339×254.25 and 760×570 respectively, preserving 4:3. |
| Opening and blank frames | Frame 0 was fully black; frame 364 was fully white. |
| Outline mode | Frame 1400 used the same geometry; measured white fraction changed from 0.142553 to 0.988310. |
| Single-frame controls | 1400 → 1401 → 1400, remaining paused. |
| Seeking and audio synchronization | Frames 30, 900, 2700, 4500, 6300, and 6571 matched `frame / 30` audio time within 0.002 seconds. |
| Playback and pause | Playback advanced with the audio clock; pause froze both frame and audio position. |
| Rate and sound controls | 2× playback rate and mute/unmute passed. |
| Ending and repeat | Stopped on frame 6571 at the end; repeat wrapped to the opening sequence. |
| Accessible controls and post-interaction layout | Six transport buttons had accessible names; no horizontal overflow after interactions. |

## Inspected rendering and interaction evidence

The following screenshots were opened and visually inspected, including the lower mobile controls. These are browser iframe specimens, not physical-device screenshots.

- [Desktop, 1440×900](evidence/desktop-1440x900.png)
- [Mobile, 390×844](evidence/mobile-390x844.png)
- [Mobile lower controls, 390×844](evidence/mobile-bottom-390x844.png)

The stage was uncropped, the mobile title remained on one line, and the Japanese heading used the available width. Transport, settings, frame controls, and attribution were readable without horizontal clipping.

Additional observations from the browser session:

| Route or state | Action and observed result |
| --- | --- |
| Direct player, page focused | Left/Right moved frame 5641 ↔ 5642 while paused. Space resumed and then paused playback. |
| Focused seek range | Native Right moved one frame; Space did not activate the page shortcut. A visible 2px focus outline was inspected. |
| Other focused controls | Tab exposed the play-button focus ring. Native keyboard selection changed speed 1× → 1.5× → 1×. Space toggled the focused repeat checkbox without starting playback. |
| Native fullscreen | The fullscreen button entered and exited native fullscreen. An inspected fullscreen screenshot showed the complete 4:3 stage and transport. |
| Fullscreen regression after the final JavaScript change | F entered fullscreen; Escape restored the normal page and changed the fullscreen control to its unpressed state. A preceding read-only locator query timed out; no dimensions are inferred from that failed query. |
| Attribution disclosure | Expanded the disclosure; vector provenance, pixel-equivalence caveat, mono-audio note, and source links appeared. |
| Gallery navigation | The return link opened UI Lab, where the Bad Apple card was present. Selecting the card opened `viewer.html?id=bad-apple&tab=preview`. The final session inspected the fully loaded embedded player, paused it, and observed its drawing. |
| Direct deliverable | Returned to `/ui-lab/bad-apple/`; assets loaded and the canvas advanced during playback. Temporary viewport override was reset. |

## Runtime diagnostics and verification limits

The final log read returned two older `MutationObserver.observe` errors at `2026-09-17T12:34:41.180Z` and `2026-09-17T12:34:41.394Z`, without source URLs. They precede the final direct-page navigation. Earlier harness-tab logs contained the same unattributed message. The study source uses `ResizeObserver`, and a source search found no `MutationObserver` in the app. The origin remains unverified; these observations do not establish an entirely clean session console or justify attributing the errors to a particular component. The final page visibly continued drawing.

A further batch of optional restart/default-setting interactions was blocked by the tool's automatic safety check, which supplied no detailed reason. A preceding R-key attempt had focus on the mute button and did not verify the page-level restart shortcut. Consequently this final pass makes no additional R-shortcut claim. No alternate input mechanism was used to bypass the block.

The CSS theater fallback, audio-failure/data-retry paths, physical iPhone/Safari behavior, audible quality, and perceptual audio/PV alignment were not exercised. Timing checks verify the implemented audio clock, not a listening comparison with the original video. Opening the local `SOURCES.md` link did not demonstrate in-browser Markdown rendering; the file itself was read successfully. Source-video pixel equivalence is neither tested nor claimed. Imported vector outlines have different edge details from the source footage.

## Final local checks

Final command results are saved in [final-check-results.txt](evidence/final-check-results.txt):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-ui-study.ps1 -Study bad-apple
git diff --check
```

The target study check covers the study artifacts and its single catalog registration. `git diff --check` covers tracked changes; the new study is still untracked and is covered by its study check and the browser evidence above. The reviewed catalog diff adds only the Bad Apple entry. Existing unrelated workspace changes were preserved. No commit, push, dependency installation, or deployment was performed during finalization.
