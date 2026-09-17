# Retrospective

## What worked

An existing full vector sequence makes the full-length choreography possible without downloading or decoding a video. The static site can use native Canvas paths and a separately clocked audio file without adding a package dependency.

## What felt wrong

The source SVG declares 640×480 while its full-screen black path covers only 480×360 after its transform. Accepting the wrapper without inspecting the paths would introduce empty margins. The source SMIL timestamps increment by 0.0333 seconds, slowly diverging from 30fps. At 390px, the side-by-side title and introduction forced awkward line breaks, and the narrow Japanese heading left a single character on its final line.

## Fixes

The importer validates the actual transform and uses 480×360. Playback derives time from frame index / 30 and follows the separate audio clock. It retains every available frame, including the opening and ending black frames. Paused playback compiles only inspected paths; the Path2D cache has a fixed bound. Mobile titles and headings now use the full width, while controls retain 44px activation height. Responsive assertions compare document width with client width so a scrollbar is not mistaken for horizontal overflow.

Fullscreen exit uses a shared handler for the button and Escape. Browser verification exposed Escape leaving native fullscreen active when only the CSS theater class was cleared; the handler now requests native fullscreen exit as well. F followed by Escape restored the normal page after the fix. Focused form controls keep their native keyboard behavior.

## Open questions

Reload verification also exposed audio seeks resetting to zero on the local SimpleHTTP server. A direct range probe returned HTTP 200 and the full file instead of a partial response. Fetching the complete WAV into a Blob and waiting for media readiness removes that server dependency; browser acceptance checks the full seekable range before exercising playback.

Browser acceptance is recorded separately in `TEST-REPORT.md`. Original-video pixel equivalence is not verified or claimed; the request is fulfilled through existing vector geometry. Physical iPhone and Safari testing require those devices. Upstream assets do not include an explicit asset license; no public deployment is part of this work.

## Candidates for shared learnings

Validate geometry extents independently of a third-party SVG's viewBox. Use an audio clock or monotonic elapsed time instead of incrementing one frame on every requestAnimationFrame callback. No shared rule changes are needed for this isolated study.
