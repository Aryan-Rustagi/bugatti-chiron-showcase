"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollFrameSequence } from "../ui/ScrollFrameSequence";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function PerformanceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const hpRef = useRef<HTMLSpanElement>(null);
  const mphRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const section = sectionRef.current!;

      // --- Headline reveal ---
      gsap.fromTo(
        ".perf-headline",
        { y: 60, opacity: 0, filter: "blur(8px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "20% 50%",
            scrub: true,
          },
        }
      );

      // --- HP counter ---
      gsap.fromTo(
        { val: 0 },
        { val: 0 },
        {
          val: 1500,
          ease: "power1.out",
          scrollTrigger: {
            trigger: section,
            start: "10% 70%",
            end: "40% 50%",
            scrub: true,
            onUpdate: function (self) {
              const v = Math.round(self.progress * 1500);
              if (hpRef.current) hpRef.current.textContent = v.toLocaleString();
            },
          },
        }
      );

      // --- MPH counter ---
      gsap.fromTo(
        { val: 0 },
        { val: 0 },
        {
          val: 304,
          ease: "power1.out",
          scrollTrigger: {
            trigger: section,
            start: "10% 70%",
            end: "40% 50%",
            scrub: true,
            onUpdate: function (self) {
              const v = Math.round(self.progress * 304);
              if (mphRef.current) mphRef.current.textContent = String(v);
            },
          },
        }
      );

      // --- Stats fade in ---
      gsap.fromTo(
        ".perf-stats",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "5% 70%",
            end: "25% 50%",
            scrub: true,
          },
        }
      );

      // --- Speed lines ---
      gsap.fromTo(
        ".speed-line",
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 0.4,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "15% 60%",
            end: "50% 40%",
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
        {/* Frame sequence */}
        <ScrollFrameSequence
          folder="speed"
          prefix="speed_"
          frameCount={135}
          padLength={4}
        />

        {/* Speed lines */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-center gap-20 px-0">
          {[15, 35, 55, 75, 90].map((top, i) => (
            <div
              key={i}
              className="speed-line absolute left-0 w-full origin-left"
              style={{
                top: `${top}%`,
                height: "1px",
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.15 + i * 0.05}) 30%, transparent 100%)`,
                transform: "scaleX(0)",
              }}
            />
          ))}
        </div>

        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none select-none">
          <h2
            className="perf-headline text-white font-extrabold text-4xl md:text-6xl tracking-tighter uppercase text-center leading-tight drop-shadow-2xl mb-14"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Engineered for
            <br />
            the Impossible
          </h2>

          <div className="perf-stats flex gap-16 md:gap-28">
            <div className="flex flex-col items-center">
              <span
                ref={hpRef}
                className="text-5xl md:text-8xl font-extrabold tracking-tighter text-[#C8102E]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                0
              </span>
              <span className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mt-2 text-white/70">
                Horsepower
              </span>
            </div>

            <div className="w-px h-20 bg-white/20 self-center" />

            <div className="flex flex-col items-center">
              <span
                ref={mphRef}
                className="text-5xl md:text-8xl font-extrabold tracking-tighter text-[#C8102E]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                0
              </span>
              <span className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mt-2 text-white/70">
                Top Speed (MPH)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
