# Retrospective

## What worked
Border-connected white removal preserves the supplied character's white clothing. Canvas depth sorting makes trees occlude the walker naturally. Footprints alternate and fade over 85 seconds.
## What felt wrong
The initial mobile scale showed too little surrounding landscape. The first cabin placement clipped the roof at spawn.
## Fixes
Mobile rendering uses 1.3 CSS pixels per world pixel, versus 2 on desktop. Moved landmarks to compose the arrival view. Added an inline favicon to eliminate the incidental 404.
## Open questions
Real iOS/Android hardware and audible playback have not been verified. Exploration resets on refresh. WebMCP read-only registry is feature-detected, but no compatible registry was available to validate it. Hosting is not performed: project instructions require explicit deployment authority.
## Candidates for shared learnings
For opaque sprite sheets, border flood fill is safer than global white removal. A smaller mobile world scale reveals nearby destinations without shrinking touch controls.
