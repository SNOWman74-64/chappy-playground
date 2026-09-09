# CANAL — 街の余白

An original miniature canal district built in Blender and explored with Three.js. Orbit and zoom, select three places, switch day/night, and pause/resume the tram and water.

## Run

From `ui-lab/`: `python -m http.server 4173 --directory ..`

Open http://localhost:4173/ui-lab/canal-city/ or select CANAL in the UI Lab gallery. No build or dependency installation is required. Three.js and addons are reused from the tracked `../once-upon-a-cup/vendor/three/` directory, with its MIT license. Preserve that directory when hosting this study.

## Model

- `assets/canal-city.blend`: editable original Blender scene.
- `assets/canal-city.glb`: web model, approximately 808 KiB, 16 material batches.
- `create_city.py`: deterministic generator, seed 23, made with Blender 5.2.1.

Regenerate from `ui-lab/` using `blender --background --factory-startup --python canal-city/create_city.py`. The executable must be on PATH or invoked by its full path. This background process does not change an open Blender scene. Export overwrites only this study's two generated model files.

## Controls

- Drag or one-finger movement: orbit. Wheel or pinch: zoom.
- Focus the canvas: arrows orbit, +/- zoom, Home returns to overview.
- Place pins and bottom buttons update the story and visit count.
- Day/night controls change lighting and window glow.
- Motion pause stops the tram and ripples. Reduced-motion preference defaults to paused and skips camera transitions.

The visit count is session-only. The city is fictional; the clock and atmosphere labels are illustrative. No external services or analytics are used.

## Verification

See [TEST-REPORT.md](TEST-REPORT.md) for observed checks and limitations. Contract check: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-ui-study.ps1 -Study canal-city`.
