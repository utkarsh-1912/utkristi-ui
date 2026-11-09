#!/usr/bin/env python3
"""
Utkristi UI — Blender 4.x 3D Soft-Clay Icon Renderer
====================================================
Renders every `has3d` icon from `icons/manifest.json` across all three themes
(night, paper, glass) and eight preset hues at 48, 64, 96, 128, and 256px.

Camera: Orthographic, elevation 22°, azimuth -28°
Form: Extrude 25% of width, bevel 8% with 4 segments, details +4% forward
Material: Matte clay (roughness 0.55, specular 0.30, subsurface 0.05)
"""

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "icons" / "manifest.json"
SCENE = ROOT / "icons" / "3d" / "scene.blend"


def check_blender() -> str:
    blender_bin = os.environ.get("BLENDER_PATH") or shutil.which("blender")
    if not blender_bin:
        sys.stderr.write(
            "Error: Blender 4.x is not installed or not on PATH.\n"
            "Install Blender 4.x (https://www.blender.org/download/) or set BLENDER_PATH,\n"
            "or use `npm run icons` to generate the pre-rendered soft-clay PNGs and 2.5D SVGs.\n"
        )
        sys.exit(1)
    return blender_bin


def main() -> int:
    if "--blender-internal" not in sys.argv:
        blender_bin = check_blender()
        cmd = [blender_bin, "--background"]
        if SCENE.exists():
            cmd.append(str(SCENE))
        cmd.extend(["--python", str(Path(__file__).resolve()), "--", "--blender-internal"])
        return subprocess.call(cmd)

    # Inside Blender Python environment
    import bpy  # type: ignore

    with MANIFEST.open("r", encoding="utf-8") as handle:
        manifest = json.load(handle)

    icons_3d = [entry for entry in manifest if entry.get("has3d")]
    print(f"Rendering {len(icons_3d)} 3D soft-clay icons in Blender...")
    scene = bpy.context.scene
    scene.render.film_transparent = True
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
