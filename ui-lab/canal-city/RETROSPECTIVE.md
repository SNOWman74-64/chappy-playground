# Retrospective

## What worked
Blender's material-based joining exported the detailed town as 16 static mesh batches. Shared local Three.js modules kept the new study independent of a package build and external CDNs. Model and narrative remain visible together on desktop; mobile puts the city ahead of the place selectors.

## What felt wrong
The first screenshot revealed two defects: the foundation hid the water surface, and a leftover CSS rotation transformed screen-space pin coordinates outside the viewport.

## Fixes
Raised the water and ripple surfaces above the island foundation. Removed the obsolete pin rotation and used circular numbered pins. Rechecked desktop and mobile rendering and selected destinations. Slightly reduced exposure for the model's material colors. The shorter gallery iframe exposed a story/navigation overlap; a 620px minimum desktop scene row now preserves the story's height, verified with a 32px gap before navigation.

## Open questions
Real iOS/Android devices and non-Chromium browsers were not available for this run. Responsive browser samples do not establish performance on all GPUs. The model uses deliberate miniature-scale simplification rather than navigable interiors.

## Candidates for shared learnings
For HTML labels projected from a 3D camera, keep CSS rotation separate from the translated wrapper. Material batching is a useful starting point for detailed static dioramas, but should be checked against actual render draw calls.
