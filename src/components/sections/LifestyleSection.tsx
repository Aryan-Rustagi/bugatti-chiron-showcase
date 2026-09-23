"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollFrameSequence } from "../ui/ScrollFrameSequence";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function LifestyleSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const section = sectionRef.current!;

      // Fade in text block on scroll
      gsap.fromTo(
        ".lifestyle-text",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "15% 60%",
            end: "35% 40%",
            scrub: true,
          },
        }
      );
      
      // Parallax effect on the line separator
      gsap.fromTo(
        ".lifestyle-line",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: section,
            start: "20% 60%",
            end: "50% 40%",
            scrub: true,
          }
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
          folder="lifestyle"
          prefix="frame_"
          frameCount={150}
          padLength={3}
        />

        {/* Dark Vignette/Gradient overlay for text legibility */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#0A0A0A]/90 via-transparent to-transparent" />
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#0A0A0A]/80 via-transparent to-transparent md:w-1/2" />

        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Text Content */}
        <div 
          ref={textRef}
          className="absolute inset-0 flex flex-col justify-end md:justify-center p-10 md:p-24 z-20 pointer-events-none pb-32 md:pb-24"
        >
          <div className="lifestyle-text opacity-0 flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
            <div>
              <h2
                className="text-white font-extrabold text-4xl md:text-7xl tracking-tighter uppercase leading-[0.9] drop-shadow-2xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Beyond
                <br />
                The Drive
              </h2>
            </div>
            
            <div className="lifestyle-line hidden md:block w-px h-32 bg-gradient-to-b from-white/60 to-transparent origin-top"></div>
            
            <p
              className="text-white/80 max-w-sm text-sm md:text-base leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ownership is an entry into an exclusive world. It is the culmination of a century of uncompromising luxury, where every arrival makes history.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
