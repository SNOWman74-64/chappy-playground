# Retrospective

## What worked
Border-connected white removal preserves the supplied character's white clothing. Canvas depth sorting makes trees occlude the walker naturally. Footprints alternate and fade over 85 seconds.
## What felt wrong
The initial mobile scale showed too little surrounding landscape. The first cabin placement clipped the roof at spawn. A user's phone screenshot exposed the persistent discovery panel covering the character on a short viewport. The source drawings also change facial and clothing details between steps.
## Fixes
Mobile rendering uses 1.3 CSS pixels per world pixel, versus 2 on desktop. Moved landmarks to compose the arrival view. Added an inline favicon to eliminate the incidental 404. Replaced the discovery panel with a bottom-edge text counter, removed the opening toast, and constrained interaction messages below the header. Rebuilt animation from one palette-normalized drawing per direction, moving boots only. Added axis hysteresis to stabilize diagonal facing.
## Open questions
Real iOS/Android hardware and audible playback have not been verified. Exploration resets on refresh. WebMCP read-only registry is feature-detected, but no compatible registry was available to validate it. The user authorized integration and push to the existing GitHub Pages site. Boot-only animation intentionally favors stable character identity over large full-body pose changes.
## Candidates for shared learnings
For opaque sprite sheets, border flood fill is safer than global white removal. A smaller mobile world scale reveals nearby destinations without shrinking touch controls.
