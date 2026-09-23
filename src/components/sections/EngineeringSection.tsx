"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollFrameSequence } from "../ui/ScrollFrameSequence";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function EngineeringSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const section = sectionRef.current!;

      // Callout W16
      gsap.fromTo(
        ".callout-w16",
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "10% 60%",
            end: "30% 40%",
            scrub: true,
          },
        }
      );

      // Callout 8.0L
      gsap.fromTo(
        ".callout-8l",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "25% 60%",
            end: "45% 40%",
            scrub: true,
          },
        }
      );

      // Callout Quad-Turbo
      gsap.fromTo(
        ".callout-turbo",
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "40% 60%",
            end: "60% 40%",
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full" style={{ height: "300vh" }}>
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#0A0A0A]">
        {/* Blue ambient light */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none mix-blend-screen opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(30,64,175,0.5) 0%, transparent 70%)",
          }}
        />

        {/* Frame sequence */}
        <ScrollFrameSequence
          folder="engine"
          prefix="engine_"
          frameCount={150}
          padLength={4}
        />

        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Technical callouts */}
        <div className="absolute inset-0 pointer-events-none z-20 font-mono text-sm md:text-base text-white">
          {/* W16 */}
          <div className="callout-w16 absolute top-[28%] left-[8%] md:left-[15%] flex items-center gap-3 opacity-0">
            <div className="text-right">
              <div className="text-[#C8102E] font-bold tracking-[0.2em] text-xs mb-1">
                ARCHITECTURE
              </div>
              <div className="tracking-wider text-white/80 text-sm">W16 CYLINDER</div>
            </div>
            <div className="w-20 h-px bg-gradient-to-r from-white/60 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
          </div>

          {/* 8.0L */}
          <div className="callout-8l absolute bottom-[25%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0">
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            <div className="h-14 w-px bg-gradient-to-b from-white/60 to-transparent" />
            <div className="text-center">
              <div className="text-[#C8102E] font-bold tracking-[0.2em] text-xs mb-1">
                DISPLACEMENT
              </div>
              <div className="tracking-wider text-white/80 text-sm">8.0 LITERS</div>
            </div>
          </div>

          {/* Quad-Turbo */}
          <div className="callout-turbo absolute top-[38%] right-[8%] md:right-[15%] flex items-center gap-3 opacity-0">
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            <div className="w-20 h-px bg-gradient-to-l from-white/60 to-transparent" />
            <div className="text-left">
              <div className="text-[#C8102E] font-bold tracking-[0.2em] text-xs mb-1">
                INDUCTION
              </div>
              <div className="tracking-wider text-white/80 text-sm">QUAD-TURBOCHARGED</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
