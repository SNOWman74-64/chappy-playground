"""Fetch a pinned Three.js runtime from its official repository; no installation.

Run explicitly with Python when rebuilding vendor assets. This is not executed by
the website. Each downloaded file is recorded with its source URL and SHA-256.
"""

from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1] / "vendor"
BASE = "https://raw.githubusercontent.com/mrdoob/three.js/r180/"
FILES = {
    "three/three.module.min.js": "build/three.module.min.js",
    "three/three.core.min.js": "build/three.core.min.js",
    "three/addons/controls/OrbitControls.js": "examples/jsm/controls/OrbitControls.js",
    "three/addons/loaders/GLTFLoader.js": "examples/jsm/loaders/GLTFLoader.js",
    "three/addons/loaders/DRACOLoader.js": "examples/jsm/loaders/DRACOLoader.js",
    "three/addons/utils/BufferGeometryUtils.js": "examples/jsm/utils/BufferGeometryUtils.js",
    "draco/draco_wasm_wrapper.js": "examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js",
    "draco/draco_decoder.wasm": "examples/jsm/libs/draco/gltf/draco_decoder.wasm",
    "draco/README.md": "examples/jsm/libs/draco/README.md",
    "three/LICENSE": "LICENSE",
}


def fetch(item):
    target, relative = item
    url = BASE + relative
    with urlopen(Request(url, headers={"User-Agent": "UI-Lab-asset-builder"}), timeout=45) as response:
        payload = response.read()
    if not payload:
        raise RuntimeError(f"Empty asset: {url}")
    path = ROOT / target
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)
    return {"path": target, "url": url, "bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()}


if __name__ == "__main__":
    with urlopen(BASE + "package.json", timeout=30) as response:
        package = json.load(response)
    assert package["version"] == "0.180.0", "Unexpected Three.js release"
    with ThreadPoolExecutor(max_workers=5) as pool:
        manifest = list(pool.map(fetch, FILES.items()))
    license_url = "https://raw.githubusercontent.com/google/draco/1.5.7/LICENSE"
    with urlopen(license_url, timeout=30) as response:
        license_data = response.read()
    (ROOT / "draco/LICENSE").write_bytes(license_data)
    manifest.append({"path": "draco/LICENSE", "url": license_url, "bytes": len(license_data),
                     "sha256": hashlib.sha256(license_data).hexdigest()})
    (ROOT / "manifest.json").write_text(json.dumps({"three_version": package["version"], "files": manifest}, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"three_version": package["version"], "files": len(manifest), "bytes": sum(x["bytes"] for x in manifest)}))
