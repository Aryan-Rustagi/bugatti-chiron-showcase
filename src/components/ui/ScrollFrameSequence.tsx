"use client";

import React, { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollFrameSequenceProps {
  /** Subfolder under /frames/, e.g. "hero" → /frames/hero/hero.bin */
  folder: string;
  /** Total number of frames (1-indexed) */
  frameCount: number;
  /** Called during loading with 0..1 progress */
  onLoadProgress?: (progress: number) => void;
  /** Called when all frames are loaded */
  onLoaded?: () => void;
}

/**
 * ScrollFrameSequence — High-Performance Binary Frame Player
 *
 * Architecture (zero main-thread decode):
 *
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │  Build time: pack_frames.py                                         │
 *  │  200 × 900 KB JPEGs → hero.bin (single ~20 MB WebP sprite file)   │
 *  └─────────────────────────────────────────────────────────────────────┘
 *                              ↓ 1 HTTP fetch
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │  frame-worker.js (Web Worker)                                       │
 *  │  createImageBitmap() per frame → GPU decode, off main thread        │
 *  │  Transfers ImageBitmap[] back via postMessage (zero copy)           │
 *  └─────────────────────────────────────────────────────────────────────┘
 *                              ↓ rAF
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │  Canvas drawImage(ImageBitmap) — GPU blit, zero decode overhead     │
 *  └─────────────────────────────────────────────────────────────────────┘
 *
 * - Zero re-renders during scroll (all state in refs)
 * - Object-cover canvas scaling
 * - Falls back gracefully if .bin is missing (tries /frames/<folder>/<folder>.bin)
 */
export function ScrollFrameSequence({
  folder,
  frameCount,
  onLoadProgress,
  onLoaded,
}: ScrollFrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ImageBitmap[] array — slot 0 unused (1-indexed)
  const bitmapsRef = useRef<(ImageBitmap | null)[]>(
    new Array(frameCount + 1).fill(null)
  );
  const currentFrameRef = useRef(1);
  const loadedCountRef = useRef(0);
  const workerRef = useRef<Worker | null>(null);

  /**
   * Draw a single frame using object-cover scaling.
   * ImageBitmap.drawImage is a GPU blit — no decode, no copy.
   */
  const renderFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const idx = Math.max(1, Math.min(frameCount, frameIndex));

      // Find the closest loaded bitmap (fall back to nearest lower frame)
      let bmp = bitmapsRef.current[idx] ?? null;
      if (!bmp) {
        for (let i = idx - 1; i >= 1; i--) {
          if (bitmapsRef.current[i]) {
            bmp = bitmapsRef.current[i];
            break;
          }
        }
      }
      if (!bmp) return;

      // --- Object-cover draw ---
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = bmp.width;
      const ih = bmp.height;

      const canvasRatio = cw / ch;
      const imgRatio = iw / ih;

      let sw: number, sh: number, sx: number, sy: number;
      if (imgRatio > canvasRatio) {
        sh = ih;
        sw = ih * canvasRatio;
        sx = (iw - sw) / 2;
        sy = 0;
      } else {
        sw = iw;
        sh = iw / canvasRatio;
        sx = 0;
        sy = (ih - sh) / 2;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, cw, ch);
    },
    [frameCount]
  );

  // --- Resize handler: keeps canvas crisp at native DPR ---
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      renderFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderFrame]);

  // --- Worker-based binary frame loader ---
  useEffect(() => {
    // Only load once and only in the browser
    if (typeof window === "undefined") return;

    // Initialize the bitmaps array fresh
    bitmapsRef.current = new Array(frameCount + 1).fill(null);
    loadedCountRef.current = 0;

    const binUrl = `/frames/${folder}/${folder}.bin`;

    // Spawn the Web Worker
    const worker = new Worker("/workers/frame-worker.js");
    workerRef.current = worker;

    worker.addEventListener("message", (evt) => {
      const msg = evt.data;

      switch (msg.type) {
        case "frame": {
          // ImageBitmap arrives transferred (zero copy)
          const { index, bitmap } = msg as { index: number; bitmap: ImageBitmap };
          // Worker uses 0-indexed; our array is 1-indexed
          bitmapsRef.current[index + 1] = bitmap;
          loadedCountRef.current++;
          onLoadProgress?.(loadedCountRef.current / frameCount);

          // Show first frame immediately
          if (index === 0 && currentFrameRef.current === 1) {
            renderFrame(1);
          }
          break;
        }

        case "progress": {
          // Already handled per-frame above
          break;
        }

        case "done": {
          onLoaded?.();
          worker.terminate();
          workerRef.current = null;
          break;
        }

        case "error": {
          console.error("[ScrollFrameSequence] Worker error:", msg.message);
          worker.terminate();
          workerRef.current = null;
          break;
        }
      }
    });

    // Start loading
    worker.postMessage({ type: "load", binUrl });

    return () => {
      worker.terminate();
      workerRef.current = null;
      // Release all GPU bitmaps
      bitmapsRef.current.forEach((bmp) => bmp?.close());
      bitmapsRef.current = new Array(frameCount + 1).fill(null);
    };
  }, [folder, frameCount, onLoadProgress, onLoaded, renderFrame]);

  // --- ScrollTrigger setup ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const section = container.closest("section");
    if (!section) return;

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const frame = Math.round(self.progress * (frameCount - 1)) + 1;
        if (frame !== currentFrameRef.current) {
          currentFrameRef.current = frame;
          renderFrame(frame);
        }
      },
    });

    return () => st.kill();
  }, [frameCount, renderFrame]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  );
}
