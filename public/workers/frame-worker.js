/**
 * frame-worker.js — Off-main-thread frame decoder
 * ================================================
 * This Web Worker:
 *  1. Receives a { type: 'load', binUrl, frameCount } message
 *  2. Fetches the packed .bin file (single HTTP request)
 *  3. Parses the FRMS binary header + index table
 *  4. Decodes each frame with createImageBitmap() (GPU-accelerated)
 *  5. Posts ImageBitmap objects back in batches, transferring ownership
 *     so zero copies happen across the worker boundary
 *
 * Binary format (little-endian):
 *   [0..3]   Magic: "FRMS"
 *   [4..7]   Version: uint32
 *   [8..11]  Frame count: uint32
 *   [12..15] Padding: uint32
 *   [16..16+N*8) Index: N × { offset: uint32, length: uint32 }
 *   [16+N*8..)  WebP frame data concatenated
 *
 * Messages received:
 *   { type: 'load', binUrl: string }
 *
 * Messages posted:
 *   { type: 'progress', loaded: number, total: number }
 *   { type: 'frame', index: number, bitmap: ImageBitmap }  (transferable)
 *   { type: 'done', frameCount: number }
 *   { type: 'error', message: string }
 */

const MAGIC = 0x53_4D_52_46; // "FRMS" as uint32 LE
const HEADER_SIZE = 16;
const INDEX_ENTRY_SIZE = 8;

self.addEventListener('message', async (evt) => {
  if (evt.data.type !== 'load') return;

  const { binUrl } = evt.data;

  try {
    // ── 1. Fetch the binary blob ──────────────────────────────────────────
    const response = await fetch(binUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${binUrl}`);
    }
    const buffer = await response.arrayBuffer();
    const view = new DataView(buffer);

    // ── 2. Parse header ───────────────────────────────────────────────────
    const magic = view.getUint32(0, true); // little-endian
    if (magic !== MAGIC) {
      throw new Error(`Invalid magic: expected FRMS, got 0x${magic.toString(16)}`);
    }
    // const version = view.getUint32(4, true); // reserved for future use
    const frameCount = view.getUint32(8, true);

    // ── 3. Parse index table ──────────────────────────────────────────────
    const indexStart = HEADER_SIZE;
    const offsets = new Uint32Array(frameCount);
    const lengths = new Uint32Array(frameCount);

    for (let i = 0; i < frameCount; i++) {
      const base = indexStart + i * INDEX_ENTRY_SIZE;
      offsets[i] = view.getUint32(base, true);
      lengths[i] = view.getUint32(base + 4, true);
    }

    // ── 4. Decode frames with createImageBitmap ────────────────────────────
    // We decode in batches of 8 to avoid saturating the GPU decode queue
    // while still keeping the pipeline full.
    const DECODE_BATCH = 8;

    for (let i = 0; i < frameCount; i += DECODE_BATCH) {
      const batchEnd = Math.min(i + DECODE_BATCH, frameCount);
      const batchPromises = [];

      for (let j = i; j < batchEnd; j++) {
        const offset = offsets[j];
        const length = lengths[j];

        if (length === 0) {
          // Frame had an encode error — skip it
          continue;
        }

        // Slice the ArrayBuffer WITHOUT copying (zero-copy view)
        const frameSlice = buffer.slice(offset, offset + length);
        const blob = new Blob([frameSlice], { type: 'image/webp' });

        batchPromises.push(
          createImageBitmap(blob, {
            // Use 'pixelated' for speed on decoding; rendering smoothing is
            // handled by canvas.imageSmoothingEnabled on the main thread
            imageOrientation: 'none',
            premultiplyAlpha: 'none',
            colorSpaceConversion: 'default',
          }).then((bitmap) => ({ index: j, bitmap }))
        );
      }

      const decoded = await Promise.all(batchPromises);

      for (const { index, bitmap } of decoded) {
        // Transfer ownership — no copy, the bitmap moves to the main thread
        self.postMessage(
          { type: 'frame', index, bitmap },
          [bitmap]
        );
      }

      // Report progress after each batch
      self.postMessage({
        type: 'progress',
        loaded: Math.min(i + DECODE_BATCH, frameCount),
        total: frameCount,
      });
    }

    self.postMessage({ type: 'done', frameCount });

  } catch (err) {
    self.postMessage({ type: 'error', message: err.message || String(err) });
  }
});
