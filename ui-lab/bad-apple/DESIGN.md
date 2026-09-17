# Design

## Reference

- Animation: Bad Apple!! feat. nomico, the familiar monochrome silhouette PV.
- Vector source: https://github.com/toxxic407/badapplesvg at `b79ba6796d66c224f901cf24c7faeb2954cd1c1a`. Its `apple.sh` specifies 30 frames per second. Import only its existing SVG; never download or decode a video.
- Separate audio source: https://github.com/buzzbyte/BadApple.SVG at `fd0c5ba5f4bf925c9110be5c6e2f1c13f3c0b98b`.
- Canvas paths: https://developer.mozilla.org/en-US/docs/Web/API/Path2D.

## Intent

Recreate the complete silhouette sequence on a web canvas without a video file, video element, animated bitmap, embedded player, or runtime video decoder. Preserve every available vector frame and the original 4:3 composition. This is a vector reconstruction of existing animation data, not an independently authored procedural animation or a claim of pixel-identical source-video reproduction.

## Visual DNA

An understated monochrome screening room: warm paper surrounding a large, uncropped black-and-white stage; strong condensed typography; small editorial rules. A restrained green accent identifies the current playback state. The animation is the primary content.

## Tokens

- Background: warm white `#f2f1ed`; ink `#171816`; subdued text `#62655e`.
- Stage: pure white and pure black, with no filters or overlays while playing.
- Accent: `#bedb71`, reserved for playback and selection.
- Font: local system sans-serif; monospace for time and frame counters.
- Space: 8px base, 24–48px major gaps. Controls have at least 44px touch targets.

## Layout Anatomy

Header with gallery return, study label and rendering status. Large title followed by a 4:3 canvas and a compact supporting panel. Timeline and primary transport belong directly beneath the stage. On narrow screens the title and Japanese heading span the available width; the short introduction sits below the title, and the stage comes before the supporting controls and credits. Buttons, ranges, selects and the credits disclosure keep at least 44px activation height. Fullscreen presents the uncropped stage and transport without surrounding page chrome.

## Interaction / Motion

Explicit start; never autoplay sound or rapid motion. Play/pause, restart, exact frame seek, previous/next frame, speed, mute, repeat, and fullscreen. Use the separate audio clock while sound is available; a monotonic elapsed-time clock supports playback if audio fails. Paused frames remain available for inspection. Silhouette and outline modes use the same paths, making the drawing method inspectable. Keyboard shortcuts must not intercept native form controls. Reduced-motion users retain explicit control and receive no decorative motion.

## Constraints

- Static HTML, CSS and ES modules; no new packages or build tooling.
- All runtime assets served locally; keep source URLs, commits and checksums in `assets/manifest.json` and `SOURCES.md`.
- Do not relabel third-party artwork or audio as original or openly licensed code. Preserve attribution and state that upstream repositories do not supply an explicit asset license.
- New work is confined to this study plus its catalog entry. Preserve existing uncommitted changes elsewhere.
- Acceptance: complete frame sequence imported without gaps, no video resources, observed canvas playback and controls, responsive screenshots inspected, and study contract checked. Pixel-identical comparison with the original video is outside the no-video workflow and must not be claimed.

## Adaptation from reference

Extract path geometry from the published SVG into compressed JSON and render it with Canvas Path2D at the intended 30fps. Reconstruct timing as frame index / 30 instead of reusing the source SVG's rounded 0.0333-second SMIL timestamps. The site UI and playback controller are new implementations.
