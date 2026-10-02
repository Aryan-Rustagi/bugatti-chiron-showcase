#!/usr/bin/env python3
"""
pack_frames.py — Frame Sequence Binary Packer
==============================================
Converts JPEG frame sequences to a single high-efficiency binary blob.

Binary format (little-endian):
  Header:
    [4 bytes] Magic: 0x46524D53 ("FRMS")
    [4 bytes] Version: 1
    [4 bytes] Frame count (N)
    [4 bytes] Padding (reserved, 0)
  Index table (N x 8 bytes):
    [4 bytes] Byte offset of frame data (from start of file)
    [4 bytes] Byte length of frame data
  Frame data:
    [N x variable] WebP-encoded frames concatenated

Usage:
    python tools/pack_frames.py [--quality 75] [--workers 8]

    Processes all subfolders in public/frames/ that contain .jpg files.
    Output: public/frames/<folder>/<folder>.bin
"""

import argparse
import io
import os
import struct
import sys
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow is required. Run: pip install Pillow", file=sys.stderr)
    sys.exit(1)


MAGIC = b"FRMS"
VERSION = 1
HEADER_SIZE = 16  # magic(4) + version(4) + count(4) + padding(4)
INDEX_ENTRY_SIZE = 8  # offset(4) + length(4)


def encode_frame_webp(args):
    """Encode a single JPEG file to WebP bytes. Runs in a worker process."""
    filepath, quality = args
    try:
        img = Image.open(filepath)
        # Ensure RGB (drop alpha channel if any)
        if img.mode != "RGB":
            img = img.convert("RGB")
        buf = io.BytesIO()
        # method=4 is a good trade-off between speed and compression ratio
        img.save(buf, format="WEBP", quality=quality, method=4)
        return buf.getvalue(), None
    except Exception as e:
        return None, str(e)


def pack_folder(folder_path, quality, num_workers):
    """Pack all JPEGs in a folder into a single .bin file."""
    # Discover frames (sort numerically)
    jpg_files = sorted(folder_path.glob("*.jpg"))
    if not jpg_files:
        print(f"  [skip] No .jpg files in {folder_path.name}")
        return

    frame_count = len(jpg_files)
    output_path = folder_path / f"{folder_path.name}.bin"

    print(f"\n  Packing '{folder_path.name}': {frame_count} frames @ WebP q{quality}")
    t0 = time.perf_counter()

    # Encode all frames in parallel
    encode_args = [(str(f), quality) for f in jpg_files]
    webp_frames = [None] * frame_count
    errors = 0

    with ProcessPoolExecutor(max_workers=num_workers) as pool:
        future_to_idx = {
            pool.submit(encode_frame_webp, arg): i
            for i, arg in enumerate(encode_args)
        }
        completed = 0
        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            data, err = future.result()
            if err:
                print(f"\n    [warn] Frame {idx + 1}: {err}", file=sys.stderr)
                errors += 1
            else:
                webp_frames[idx] = data
            completed += 1
            # Progress bar
            pct = completed / frame_count
            bar = "#" * int(pct * 30) + "." * (30 - int(pct * 30))
            print(f"\r    [{bar}] {completed}/{frame_count}", end="", flush=True)

    print()  # newline after progress bar

    # Calculate index
    # Data starts after header + index table
    data_start = HEADER_SIZE + frame_count * INDEX_ENTRY_SIZE
    offsets = []
    lengths = []
    current_offset = data_start

    total_input_bytes = sum(f.stat().st_size for f in jpg_files)
    total_output_bytes = 0

    for frame_data in webp_frames:
        if frame_data is None:
            offsets.append(0)
            lengths.append(0)
        else:
            offsets.append(current_offset)
            lengths.append(len(frame_data))
            current_offset += len(frame_data)
            total_output_bytes += len(frame_data)

    # Write binary file
    with open(output_path, "wb") as f:
        # Header
        f.write(MAGIC)
        f.write(struct.pack("<I", VERSION))
        f.write(struct.pack("<I", frame_count))
        f.write(struct.pack("<I", 0))  # padding

        # Index table
        for offset, length in zip(offsets, lengths):
            f.write(struct.pack("<II", offset, length))

        # Frame data
        for frame_data in webp_frames:
            if frame_data:
                f.write(frame_data)

    t1 = time.perf_counter()
    compression = (1 - total_output_bytes / total_input_bytes) * 100
    print(
        f"    Done in {t1 - t0:.1f}s | "
        f"{total_input_bytes / 1_048_576:.1f} MB -> "
        f"{total_output_bytes / 1_048_576:.1f} MB "
        f"({compression:.0f}% smaller) | "
        f"Saved to {output_path.name}"
    )
    if errors:
        print(f"    [warn] {errors} frames had errors and will be skipped at runtime")


def main():
    parser = argparse.ArgumentParser(description="Pack JPEG frames into binary sprite files")
    parser.add_argument(
        "--quality", type=int, default=75,
        help="WebP encode quality (1-100, default: 75)"
    )
    parser.add_argument(
        "--workers", type=int, default=max(1, os.cpu_count() or 4),
        help="Number of parallel encode workers (default: CPU count)"
    )
    parser.add_argument(
        "--folder", type=str, default=None,
        help="Pack only this subfolder (default: all)"
    )
    args = parser.parse_args()

    # Resolve the frames root relative to this script's parent dir
    script_dir = Path(__file__).parent
    frames_root = script_dir.parent / "public" / "frames"

    if not frames_root.exists():
        print(f"ERROR: frames directory not found: {frames_root}", file=sys.stderr)
        sys.exit(1)

    print(f"Frame Packer -- quality={args.quality}, workers={args.workers}")
    print(f"Frames root: {frames_root}")

    if args.folder:
        folders = [frames_root / args.folder]
    else:
        folders = [d for d in sorted(frames_root.iterdir()) if d.is_dir()]

    if not folders:
        print("No frame folders found.")
        sys.exit(0)

    t_total = time.perf_counter()
    for folder in folders:
        pack_folder(folder, quality=args.quality, num_workers=args.workers)

    print(f"\nAll done in {time.perf_counter() - t_total:.1f}s total.")


if __name__ == "__main__":
    main()
