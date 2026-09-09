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
Title and location upper left; sound and map upper right; contextual discoveries below; thumb joystick lower left and action lower right.
## Interaction / Motion
Pointer-captured joystick, arrow/WASD navigation, four-direction sprite animation, follow camera, fading alternating footprints, layered snowfall, collision, contextual discovery and minimap.
## Constraints
No dependencies, no remote assets, no publication without explicit authority. Respect reduced motion for ambient effects. Preserve white character details by flood-filling only border-connected background pixels at runtime.
## Adaptation from reference
Use the first three consistent poses per direction; ignore the mirrored fourth column. All environment art is native canvas pixel geometry.
