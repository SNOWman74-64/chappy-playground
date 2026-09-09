# Design

## Reference
User-provided eight-frame winter walking sheet, stored as assets/walker.jpg.
## Intent
Watch the character walk through a snowy forest directly from the integrated gallery.
## Visual DNA
Soft blue winter light, distant lavender mountains, layered fir silhouettes, white snow and restrained typography.
## Tokens
Sky #dce9f1; snow #f7f9fc; forest #78949f; ink #344d60.
## Layout Anatomy
Full viewport landscape, character at the snow line, title above and playback controls below. Fit narrow gallery iframes without horizontal scrolling.
## Interaction / Motion
Eight original frames at 110ms each. Background travels left at three depth speeds. Pause and speed controls affect both the character and the environment. Reduced motion starts paused.
## Constraints
No dependencies or remote assets. Remove only border-connected near-white pixels so white clothing remains intact. User authorized commit and push to the existing repository.
## Adaptation from reference
Crop the original sheet in reading order. Preserve the original drawing; use canvas compositing for the snow environment rather than regenerate the character.
