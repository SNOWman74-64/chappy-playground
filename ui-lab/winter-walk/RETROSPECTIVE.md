# Retrospective

## What worked
Original walking frames and three scenery speeds convey travel while keeping the character readable.
## What felt wrong
The original GIF has a white rectangular background that obscures the environment.
## Fixes
Composite frames with border-connected background removal; preserve enclosed white clothing. Synchronize scenery and walking through a single animation clock.
Remove small disconnected fragments touching crop edges to prevent adjacent poses from appearing beside the character.

Validation: real Chrome rendering at 1440 × 900 and emulated 390 × 844, no horizontal overflow; all eight frames loaded; clock progression and pause verified; keyboard Tab focus and Enter pause verified; no console warnings/errors on the study. Integrated viewer iframe loaded the new study. Targeted study contract check passed.
## Open questions
The source poses differ in stride and drawing, so the eight-frame loop retains some natural discontinuity. Actual iPhone playback remains for user verification.
## Candidates for shared learnings
None yet; this is a single side-scrolling study.
