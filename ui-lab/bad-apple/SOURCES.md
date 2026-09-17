# Sources and implementation

## Geometry

Published SVG: https://github.com/toxxic407/badapplesvg

Pinned commit: `b79ba6796d66c224f901cf24c7faeb2954cd1c1a`.

`scripts/import_assets.py` downloads only the existing SVG, parses it without executing embedded content, verifies contiguous `frame-0` through `frame-6571`, and extracts path geometry. All 6,572 frames are retained at 30fps (219.0667 seconds). The outer source SVG is 640×480 but its actual paths occupy 480×360; the importer corrects the viewport. It also avoids the source SMIL timing's rounding error by deriving timing directly from the frame index.

This is traced geometry derived upstream from the original PV. It is not an original, fully procedural recreation, and vectorization changes some edge details. No original video is downloaded, decoded, or used by this study's import process or runtime.

## Audio

Standalone WAV: https://github.com/buzzbyte/BadApple.SVG

Pinned commit: `fd0c5ba5f4bf925c9110be5c6e2f1c13f3c0b98b`.

The importer reads only the WAV and downmixes stereo PCM to mono at the source sample rate. Audio remains separate from the drawing. The browser fetches the complete WAV into a Blob before enabling playback, so seeking does not depend on HTTP byte-range support from the static server. This retains roughly 19.3 MB of source audio in browser-managed storage, in addition to decoder memory. The audio clock selects each frame; if audio fails, a monotonic clock supports silent playback. No third-party services are contacted at runtime.

## Attribution

Bad Apple!! feat. nomico; Alstroemeria Records. Original composition: ZUN / Team Shanghai Alice. Arrangement: Masayoshi Minoshima. Vocal: nomico. Silhouette PV: あにら. Vector conversion and audio packaging are credited to the repositories above.

The two upstream repositories do not include an explicit asset license. Their availability is not a claim of public-domain, MIT, or other redistribution rights. This local study does not grant rights to the underlying music, artwork, or characters. No publication or deployment was performed as part of this task.

## Web platform references

- https://developer.mozilla.org/en-US/docs/Web/API/Path2D
- https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime
- https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/buffering_seeking_time_ranges
- https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
- https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame

## Run

From `ui-lab/`: `python -m http.server 4173 --directory ..`

Open `http://localhost:4173/ui-lab/bad-apple/`.

Assets are already included. To rebuild them with Python's standard library: `python bad-apple/scripts/import_assets.py`. Source and output SHA-256 hashes, lengths, duration, dimensions and commits are recorded in `assets/manifest.json`.

The new interface is `index.html`, `styles.css`, and `app.js`; it has no package dependencies. `frames.json.gz` contains only path commands and metadata. A 150-frame Path2D cache bounds memory. `poster.svg` is a single static vector preview, not an animated image sequence.
