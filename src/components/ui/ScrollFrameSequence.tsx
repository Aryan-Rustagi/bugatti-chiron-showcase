"use client";

import React, { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollFrameSequenceProps {
  /** Subfolder under /frames/, e.g. "hero" → /frames/hero/ */
  folder: string;
  /** Filename prefix, e.g. "hero_" → hero_0001.jpg */
  prefix: string;
  /** Total number of frames (1-indexed) */
  frameCount: number;
  /** File extension including dot */
  extension?: string;
  /** Zero-pad width for the frame number */
  padLength?: number;
  /** Called during loading with 0..1 progress */
  onLoadProgress?: (progress: number) => void;
  /** Called when all frames are loaded */
  onLoaded?: () => void;
}

/**
 * ScrollFrameSequence
 *
 * Renders a sequence of JPEG frames to an HTML5 <canvas> element,
 * scrubbed by scroll position via GSAP ScrollTrigger.
 *
 * Architecture:
 * 1. The component expects to be placed inside a <section> with a
 *    tall height (e.g. 200vh) and a sticky inner container (100vh).
 * 2. A ScrollTrigger on the parent <section> maps scroll progress
 *    (0..1) → frame index (1..frameCount).
 * 3. Frames are preloaded in batches of 30 ahead of the current
 *    scroll position, with the first batch loaded eagerly.
 * 4. The canvas uses an "object-cover" draw algorithm so the frame
 *    always fills the viewport regardless of aspect ratio.
 * 5. All updates happen via refs (zero React re-renders during scroll).
 */
export function ScrollFrameSequence({
  folder,
  prefix,
  frameCount,
  extension = ".jpg",
  padLength = 4,
  onLoadProgress,
  onLoaded,
}: ScrollFrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Store all images in a ref to avoid re-renders
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(1);
  const hasInitRef = useRef(false);
  const loadedCountRef = useRef(0);

  // Build the URL for a given 1-indexed frame number
  const getFrameUrl = useCallback(
    (index: number) => {
      const num = String(index).padStart(padLength, "0");
      return `/frames/${folder}/${prefix}${num}${extension}`;
    },
    [folder, prefix, padLength, extension]
  );

  /**
   * Draw a single frame to the canvas using object-cover scaling.
   * This is called from requestAnimationFrame so it's fast.
   */
  const renderFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clamp frame index
      const idx = Math.max(1, Math.min(frameCount, frameIndex));

      // Find the closest loaded image (fall back to nearest lower frame)
      let img = imagesRef.current[idx] ?? null;
      if (!img) {
        for (let i = idx - 1; i >= 1; i--) {
          if (imagesRef.current[i]) {
            img = imagesRef.current[i];
            break;
          }
        }
      }
      if (!img) return;

      // --- Object-cover draw ---
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;

      const canvasRatio = cw / ch;
      const imgRatio = iw / ih;

      let sw: number, sh: number, sx: number, sy: number;

      if (imgRatio > canvasRatio) {
        // Image is wider than canvas → crop sides
        sh = ih;
        sw = ih * canvasRatio;
        sx = (iw - sw) / 2;
        sy = 0;
      } else {
        // Image is taller than canvas → crop top/bottom
        sw = iw;
        sh = iw / canvasRatio;
        sx = 0;
        sy = (ih - sh) / 2;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
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

      // Re-draw current frame at new size
      renderFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderFrame]);

  // --- Image preloading ---
  useEffect(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;

    // Allocate array (1-indexed, slot 0 unused)
    const arr = new Array<HTMLImageElement | null>(frameCount + 1).fill(null);
    imagesRef.current = arr;
    loadedCountRef.current = 0;

    const loadImage = (i: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.onload = () => {
          arr[i] = img;
          loadedCountRef.current++;
          onLoadProgress?.(loadedCountRef.current / frameCount);

          // Draw first frame as soon as it loads
          if (i === 1) {
            currentFrameRef.current = 1;
            renderFrame(1);
          }

          resolve();
        };
        img.onerror = () => {
          loadedCountRef.current++;
          resolve();
        };
      });
    };

    // Load in sequential batches of 30
    const loadBatch = async (start: number) => {
      const end = Math.min(start + 30, frameCount + 1);
      const promises: Promise<void>[] = [];
      for (let i = start; i < end; i++) {
        promises.push(loadImage(i));
      }
      await Promise.all(promises);

      if (end <= frameCount) {
        // Small yield to let the browser breathe
        setTimeout(() => loadBatch(end), 16);
      } else {
        onLoaded?.();
      }
    };

    loadBatch(1);
  }, [frameCount, getFrameUrl, onLoadProgress, onLoaded, renderFrame]);

  // --- ScrollTrigger setup ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Walk up the DOM to find the parent <section>
    const section = container.closest("section");
    if (!section) return;

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        // Map progress 0..1 → frame 1..frameCount
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
