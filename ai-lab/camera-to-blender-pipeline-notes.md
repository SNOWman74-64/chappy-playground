# Camera-to-Blender Pipeline Notes

Reference: https://github.com/ahujasid/camera-to-blender

Status: **Reference / future candidate only**. Not an adoption decision.

## Why keep this

A useful reference architecture for a future Blender / Paper Cafe asset-generation workflow.

The interesting part is the end-to-end UX rather than a new 3D model itself:

```text
Phone camera / image
  -> image preprocessing / background removal
  -> Image-to-3D service
  -> GLB generation
  -> relay / WebSocket
  -> Blender add-on
  -> automatic import into the Blender scene
```

## Possible use in our system

If the Blender generation environment becomes stable, this pattern could provide a simple real-world asset input path:

```text
Take a photo of an object
  -> generate a rough 3D asset
  -> import into Blender automatically
  -> AI / Blender automation performs cleanup
     - scale normalization
     - origin adjustment
     - polygon reduction / Decimate
     - material replacement
     - Paper Cafe style conversion
     - scene placement
  -> export GLB for Web / R3F
```

This could be especially useful for Paper Cafe / paper-diorama experiments where exact reconstruction is less important than quickly obtaining a stylized Web-ready asset.

## Important limitation

A single photo does not contain the hidden sides of an object. Image-to-3D therefore has to infer missing geometry. Treat this as **asset generation from a photo**, not an accurate physical scan.

## Future investigation

- Whether the Image-to-3D provider should be Tripo3D or another model/service.
- Whether background removal is actually needed for the chosen 3D model.
- Whether BlenderMCP / Blender Python can replace or extend the custom Blender add-on step.
- Automatic Web optimization: polygon budget, texture compression, material simplification, GLB export.
- Whether the relay should remain local or move to a Cloudflare-first architecture.

Keep this lightweight until there is a concrete need for photo-to-3D ingestion.
