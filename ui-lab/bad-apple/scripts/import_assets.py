"""Import existing vector geometry and standalone audio, without processing video.

Python 3.10+, standard library only. Run from any directory. Pins upstream commits,
validates the SVG frame sequence, and records hashes for reproducibility. Does not
run upstream scripts. Runtime assets are self-contained after this command.
"""

from __future__ import annotations

import array
import gzip
import hashlib
import io
import json
import re
import sys
import urllib.request
import wave
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SVG_COMMIT = "b79ba6796d66c224f901cf24c7faeb2954cd1c1a"
AUDIO_COMMIT = "fd0c5ba5f4bf925c9110be5c6e2f1c13f3c0b98b"
SVG_URL = f"https://raw.githubusercontent.com/toxxic407/badapplesvg/{SVG_COMMIT}/bad_apple.svg"
AUDIO_URL = f"https://raw.githubusercontent.com/buzzbyte/BadApple.SVG/{AUDIO_COMMIT}/bad-apple.wav"
NS = {"s": "http://www.w3.org/2000/svg"}


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "UI-Lab-BadApple-Study"})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    assets = ROOT / "assets"
    assets.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=2) as executor:
        svg_future = executor.submit(fetch, SVG_URL)
        audio_future = executor.submit(fetch, AUDIO_URL)
        svg_data, audio_data = svg_future.result(), audio_future.result()

    svg = ET.fromstring(svg_data)
    view_box = [float(value) for value in svg.attrib["viewBox"].split()]
    groups = [group for group in svg.findall("s:g", NS) if group.get("id", "").startswith("frame-")]
    if len(groups) < 6000:
        raise ValueError(f"Expected a full-length 30fps sequence, found {len(groups)} frames")

    frames: list[str] = []
    transforms: set[str] = set()
    for index, group in enumerate(groups):
        if group.get("id") != f"frame-{index}":
            raise ValueError(f"Non-contiguous frame sequence at {index}")
        for item in group.iter():
            if item.get("transform"):
                transforms.add(item.attrib["transform"])
        paths = [path.get("d", "") for path in group.findall(".//s:path", NS)]
        frames.append(" ".join(re.sub(r"\s+", " ", path).strip() for path in paths))

    # The source wrapper says 640x480, but the traced frames are 480x360.
    # Frame 0 is the full black rectangle x=0..4800, y=0..3600 before scale.
    expected_transform = "translate(0.000000,360.000000) scale(0.100000,-0.100000)"
    if transforms != {expected_transform} or view_box != [0.0, 0.0, 640.0, 480.0]:
        raise ValueError(f"Review unexpected SVG geometry: {view_box}, {transforms}")

    packed = json.dumps({"version": 1, "width": 480, "height": 360, "fps": 30,
                         "transform": [0.1, 0, 0, -0.1, 0, 360], "frames": frames},
                        separators=(",", ":")).encode()
    compressed = gzip.compress(packed, compresslevel=9, mtime=0)
    (assets / "frames.json.gz").write_bytes(compressed)

    # Preserve the source sample rate. Only downmix the two channels to mono;
    # no resampling, video decode, or platform-specific codec is involved.
    with wave.open(io.BytesIO(audio_data), "rb") as source:
        channels, sample_width, sample_rate, samples = (
            source.getnchannels(), source.getsampwidth(), source.getframerate(), source.getnframes())
        if channels != 2 or sample_width != 2 or source.getcomptype() != "NONE":
            raise ValueError("Expected stereo 16-bit PCM WAV")
        pcm = array.array("h", source.readframes(samples))
    if sys.byteorder != "little":
        pcm.byteswap()
    mono = array.array("h", ((int(pcm[i]) + int(pcm[i + 1])) // 2 for i in range(0, len(pcm), 2)))
    if sys.byteorder != "little":
        mono.byteswap()
    with wave.open(str(assets / "soundtrack.wav"), "wb") as output:
        output.setparams((1, 2, sample_rate, samples, "NONE", "not compressed"))
        output.writeframes(mono.tobytes())

    poster_index = 360
    poster = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360">'
              f'<rect width="480" height="360" fill="white"/>'
              f'<path fill="black" transform="{expected_transform}" d="{frames[poster_index]}"/></svg>')
    (assets / "poster.svg").write_text(poster, encoding="utf-8")
    manifest = {
        "version": 1, "width": 480, "height": 360, "fps": 30,
        "frameCount": len(frames), "duration": len(frames) / 30,
        "audioDuration": samples / sample_rate, "audioSampleRate": sample_rate,
        "audioChannels": 1, "posterFrame": poster_index,
        "framesBytes": len(compressed), "framesSha256": sha256(compressed),
        "uncompressedFramesBytes": len(packed),
        "audioBytes": (assets / "soundtrack.wav").stat().st_size,
        "audioSha256": sha256((assets / "soundtrack.wav").read_bytes()),
        "sources": [
            {"kind": "vector", "url": SVG_URL, "commit": SVG_COMMIT, "sha256": sha256(svg_data)},
            {"kind": "audio", "url": AUDIO_URL, "commit": AUDIO_COMMIT, "sha256": sha256(audio_data)},
        ],
        "notes": "Existing traced vector frames, not pixel-identical video. No video downloaded or decoded. No explicit upstream asset license supplied.",
    }
    (assets / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
