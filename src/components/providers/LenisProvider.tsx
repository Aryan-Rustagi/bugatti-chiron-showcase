"use client";

import { useEffect, useRef } from "react";
import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * LenisProvider — wraps the app in smooth scrolling and syncs
 * the Lenis RAF loop with GSAP's ticker so ScrollTrigger stays
 * perfectly in phase with the smooth-scroll position.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<InstanceType<typeof import("lenis").default> | null>(null);
  const rafCallbackRef = useRef<((time: number) => void) | null>(null);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.4,
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.5,
      }}
      ref={(instance: any) => {
        // ReactLenis exposes the lenis instance
        if (instance && instance.lenis && !lenisRef.current) {
          lenisRef.current = instance.lenis;
          const lenis = instance.lenis;

          // Sync lenis scroll → ScrollTrigger
          lenis.on("scroll", ScrollTrigger.update);

          // Drive Lenis from GSAP's ticker (single RAF loop)
          const callback = (time: number) => {
            lenis.raf(time * 1000);
          };
          rafCallbackRef.current = callback;
          gsap.ticker.add(callback);
          gsap.ticker.lagSmoothing(0);
        }
      }}
    >
      {children}
    </ReactLenis>
  );
}
