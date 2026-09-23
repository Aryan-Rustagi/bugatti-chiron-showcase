"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollFrameSequence } from "../ui/ScrollFrameSequence";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function DesignSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const section = sectionRef.current!;

      // Text sweep reveal
      gsap.fromTo(
        ".design-text",
        { clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)", x: -40, opacity: 0 },
        {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          x: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "10% 60%",
            end: "35% 40%",
            scrub: true,
          },
        }
      );

      // CTA button
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: section,
            start: "30% 50%",
            end: "45% 40%",
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Magnetic hover
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ctaRef.current) return;
    const rect = ctaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(ctaRef.current, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!ctaRef.current) return;
    gsap.to(ctaRef.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
  };

  return (
    <section ref={sectionRef} className="relative w-full" style={{ height: "300vh" }}>
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#0A0A0A]">
        {/* Frame sequence */}
        <ScrollFrameSequence
          folder="rear"
          prefix="rear_"
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

        {/* Text */}
        <div className="absolute inset-0 flex flex-col items-center md:items-start justify-center p-6 md:p-24 z-20 pointer-events-none text-center md:text-left">
          <div className="design-text opacity-0 flex flex-col items-center md:items-start">
            <h2
              className="text-white font-extrabold text-5xl md:text-8xl tracking-tighter uppercase leading-[0.9] drop-shadow-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Sculpted
              <br />
              By Air
            </h2>
            <p
              className="text-white/80 mt-6 md:mt-8 max-w-sm md:max-w-md text-sm md:text-lg leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Form follows performance. Every curve, intake, and angle serves a singular
              purpose: slicing through the atmosphere at unimaginable speeds.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 md:left-24 md:translate-x-0 z-30 w-full md:w-auto px-6 md:px-0 flex justify-center md:block">
          <button
            ref={ctaRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="relative w-full md:w-auto px-10 py-4 rounded-full bg-white/[0.08] backdrop-blur-lg border border-white/20 text-white font-semibold tracking-[0.2em] uppercase text-xs overflow-hidden pointer-events-auto transition-all duration-300 hover:bg-white hover:text-[#0A0A0A] hover:border-white opacity-0"
          >
            <span className="relative z-10">Configure Yours</span>
            <div
              className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ${isHovered ? "translate-x-[200%]" : ""}`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
