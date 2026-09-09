# Design

## Reference
User-supplied 4 × 4 winter character sprite sheet (assets/walker.jpg).
## Intent
A quiet, mobile-first snowy world to walk through and leave footprints in.
## Visual DNA
Top-down pixel forest, blue snow shadows, dark teal firs, tiny amber windows. The world fills the screen; restrained cream interface floats at its edges.
## Tokens
Snow #e1eef0; shadow #a9c5d4; forest #30575d; ink #274b53; paper #fffdf2. Nearest-neighbor canvas rendered at half CSS resolution.
## Layout Anatomy
Title and location upper left; sound and map upper right; discovery count as a single line at the bottom edge; thumb joystick lower left and action lower right. The character's central walking area stays free of persistent overlays. No introductory toast.
## Interaction / Motion
Pointer-captured joystick, arrow/WASD navigation, four-direction sprite animation, follow camera, fading alternating footprints, layered snowfall, collision, contextual discovery and minimap. Direction selection uses a 1.35 axis threshold to resist diagonal thumb jitter. Dynamic viewport height keeps controls within mobile browser chrome.
## Constraints
No dependencies, no remote assets, no publication without explicit authority. Respect reduced motion for ambient effects. Preserve white character details by flood-filling only border-connected background pixels at runtime.
## Adaptation from reference
Use one canonical drawing (second column) per direction. Normalize bounds to a 40 × 50 pixel canvas with 48-pixel character height and a shared 17-color palette. Bake four phases per direction with only the boot region moving by one pixel; keep the upper 41 rows identical. This preserves the supplied design without cycling inconsistent face/hat drawings. All environment art is native canvas pixel geometry.
