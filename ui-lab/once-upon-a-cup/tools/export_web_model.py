"""Create a reproducible web derivative without saving or changing the source blend.

Run with Blender (from any working directory):
  blender --background --factory-startup --disable-autoexec --python <this file>

The unoptimized baseline is an evaluated, uncompressed GLB of the same café,
excluding the studio floor, lights, and camera. Its temporary file is discarded
after measuring it. Use -- --skip-baseline or -- --skip-poster for iteration.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import struct
import sys
import tempfile
import time
from collections import defaultdict

import bpy


ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "docs/model/once-upon-a-cup-computer-use.blend"
ASSETS = ROOT / "assets"
EVIDENCE = ROOT / "evidence"


def sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def glb_stats(path: pathlib.Path) -> dict:
    data = path.read_bytes()
    magic, version, length = struct.unpack_from("<4sII", data)
    assert magic == b"glTF" and version == 2 and length == len(data)
    chunk_length, chunk_type = struct.unpack_from("<II", data, 12)
    assert chunk_type == 0x4E4F534A
    document = json.loads(data[20:20 + chunk_length])
    primitives = [p for m in document.get("meshes", []) for p in m["primitives"]]
    return {
        "bytes": len(data),
        "meshes": len(document.get("meshes", [])),
        "primitives": len(primitives),
        "materials": len(document.get("materials", [])),
        "triangles": sum(document["accessors"][p["indices"]]["count"] // 3 for p in primitives),
        "vertices": sum(document["accessors"][p["attributes"]["POSITION"]]["count"] for p in primitives),
        "extensions_required": document.get("extensionsRequired", []),
        "sha256": sha256(path),
    }


def evaluated_copies(objects: list, label: str) -> list:
    collection = bpy.data.collections.new(label)
    bpy.context.scene.collection.children.link(collection)
    depsgraph = bpy.context.evaluated_depsgraph_get()
    result = []
    for original in objects:
        mesh = bpy.data.meshes.new_from_object(
            original.evaluated_get(depsgraph), preserve_all_data_layers=False,
            depsgraph=depsgraph,
        )
        mesh.transform(original.matrix_world)
        copy = bpy.data.objects.new(original.name + "_web", mesh)
        collection.objects.link(copy)
        result.append(copy)
    return result


def select_only(objects: list) -> None:
    bpy.context.view_layer.update()
    # Operators skip hidden objects. Clear selection explicitly, including those.
    for obj in bpy.context.view_layer.objects:
        obj.select_set(False)
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]


def export_glb(objects: list, path: pathlib.Path, compressed: bool) -> dict:
    select_only(objects)
    bpy.ops.export_scene.gltf(
        filepath=str(path), export_format="GLB", use_selection=True, use_active_scene=True,
        export_animations=False, export_skins=False, export_morph=False,
        export_cameras=False, export_lights=False, export_texcoords=False,
        export_tangents=False, export_normals=True, export_extras=False,
        export_materials="EXPORT", export_yup=True,
        export_draco_mesh_compression_enable=compressed,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=16,
        export_draco_normal_quantization=10,
    )
    stats = glb_stats(path)
    assert stats["meshes"] == len(objects), "Unexpected objects in GLB export"
    if compressed:
        assert "KHR_draco_mesh_compression" in stats["extensions_required"], "Draco export unavailable"
    return stats


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-baseline", action="store_true")
    parser.add_argument("--skip-poster", action="store_true")
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    ASSETS.mkdir(parents=True, exist_ok=True)
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    original_hash = sha256(SOURCE)
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
    scene = bpy.context.scene
    originals = [o for o in scene.objects if o.type in {"MESH", "CURVE", "FONT", "SURFACE"}
                 and not o.hide_render and o.name != "Studio ground"]
    report = {
        "source": str(SOURCE.relative_to(ROOT.parent)).replace("\\", "/"),
        "source_sha256": original_hash,
        "source_bytes": SOURCE.stat().st_size,
        "source_scene_objects": len(scene.objects),
        "source_renderable_objects_excluding_studio": len(originals),
        "blender_version": bpy.app.version_string,
        "baseline_definition": "Evaluated uncompressed GLB of the same cafe; studio floor, lights and camera excluded.",
        "operations": [
            "Print text flat: preserve glyph outlines, remove extrusion/bevel, resolution 4.",
            "Reduce curve resolution to 4 and bevel resolution to at most 1.",
            "Reduce bevel modifier segments to 1; preserve widths and cardstock thickness.",
            "Evaluate modifiers, apply world transforms, merge static meshes by material slots.",
            "Omit unused UVs, animations, cameras and studio setup; Draco position16/normal10 level6.",
        ],
    }
    report_path = EVIDENCE / "optimization-report.json"
    if args.skip_baseline:
        previous = json.loads(report_path.read_text("utf-8")) if report_path.exists() else {}
        if previous.get("source_sha256") == original_hash:
            report["baseline"] = previous.get("baseline")
    else:
        baseline_objects = evaluated_copies(originals, "Temporary baseline")
        with tempfile.TemporaryDirectory(prefix="cup-glb-baseline-") as temp_dir:
            report["baseline"] = export_glb(baseline_objects, pathlib.Path(temp_dir) / "baseline.glb", False)
        for obj in baseline_objects:
            mesh = obj.data
            bpy.data.objects.remove(obj, do_unlink=True)
            bpy.data.meshes.remove(mesh)

    for obj in originals:
        if obj.type == "FONT":
            obj.data.resolution_u = 4
            obj.data.render_resolution_u = 4
            obj.data.extrude = 0
            obj.data.bevel_depth = 0
            obj.data.bevel_resolution = 0
        elif obj.type == "CURVE":
            obj.data.resolution_u = min(obj.data.resolution_u, 4)
            obj.data.render_resolution_u = 4
            obj.data.bevel_resolution = min(obj.data.bevel_resolution, 1)
        for modifier in obj.modifiers:
            if modifier.type == "BEVEL":
                modifier.segments = 1
    bpy.context.view_layer.update()
    optimized = evaluated_copies(originals, "Web model")
    groups = defaultdict(list)
    for obj in optimized:
        groups[tuple(m.name if m else "" for m in obj.data.materials)].append(obj)
    merged = []
    for names, objects in groups.items():
        select_only(objects)
        if len(objects) > 1:
            bpy.ops.object.join()
        obj = bpy.context.view_layer.objects.active
        obj.name = "Paper / " + " + ".join(names)
        merged.append(obj)
    report["optimized"] = export_glb(merged, ASSETS / "cafe.glb", True)
    if report.get("baseline"):
        report["reductions_percent"] = {
            key: round((1 - report["optimized"][key] / report["baseline"][key]) * 100, 2)
            for key in ("bytes", "triangles", "primitives")
        }

    if not args.skip_poster:
        for obj in originals:
            obj.hide_render = True
        studio = scene.objects.get("Studio ground")
        if studio:
            studio.hide_render = True
        scene.render.engine = "CYCLES"
        scene.cycles.samples = 32
        scene.cycles.use_denoising = True
        scene.render.film_transparent = True
        scene.render.resolution_x = 1440
        scene.render.resolution_y = 1080
        scene.render.resolution_percentage = 100
        scene.render.image_settings.file_format = "WEBP"
        scene.render.image_settings.color_mode = "RGBA"
        scene.render.image_settings.quality = 88
        scene.render.filepath = str(ASSETS / "cafe-poster.webp")
        bpy.ops.render.render(write_still=True)

    report["source_hash_after"] = sha256(SOURCE)
    assert report["source_hash_after"] == original_hash, "Source blend changed"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("WEB_MODEL_RESULT=" + json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
