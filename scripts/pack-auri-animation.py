"""Convert offline GLB animation frames into lightweight animated WebP assets."""
from pathlib import Path
from PIL import Image, features
assert features.check("webp"), "Pillow must support WebP"
root = Path(__file__).resolve().parents[1] / "media" / "auri"
frames_dir = root / "frames"
out_dir = root / "anim"
out_dir.mkdir(parents=True, exist_ok=True)
phases = ("idle", "welcome", "thinking", "working", "speaking", "success")
total = 0
for level in range(1, 8):
    for phase in phases:
        paths = sorted(frames_dir.glob(f"level-{level}-{phase}-??.png"))
        if len(paths) != 12:
            raise RuntimeError(f"Expected 12 frames for level={level} phase={phase}, got {len(paths)}")
        frames = [Image.open(p).convert("RGBA") for p in paths]
        target = out_dir / f"level-{level}-{phase}.webp"
        frames[0].save(target, "WEBP", save_all=True,
            append_images=frames[1:], duration=120, loop=0,
            method=4, quality=85, lossless=False)
        with Image.open(target) as check:
            assert check.n_frames == len(frames), f"WebP frame count mismatch: {target}"
        print(f"{target.name}: {target.stat().st_size:,} bytes")
        total += target.stat().st_size
print(f"DONE: {len(phases)*7} animations, {total:,} bytes in total")
