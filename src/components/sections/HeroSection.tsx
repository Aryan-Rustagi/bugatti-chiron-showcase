"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollFrameSequence } from "../ui/ScrollFrameSequence";
import { ChevronDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !textRef.current) return;

    const ctx = gsap.context(() => {
      // --- Entrance animation (plays once on mount, not scroll-driven) ---
      const entrance = gsap.timeline({ delay: 0.8 });

      entrance.fromTo(
        ".hero-letter",
        { y: 80, opacity: 0, filter: "blur(12px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          stagger: 0.04,
          ease: "power3.out",
        }
      );

      entrance.fromTo(
        ".hero-subtitle",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.4"
      );

      entrance.fromTo(
        scrollHintRef.current,
        { opacity: 0 },
        { opacity: 0.6, duration: 0.6 },
        "-=0.3"
      );

      // --- Scroll-driven: fade out text as user scrolls ---
      gsap.to(textRef.current, {
        opacity: 0,
        y: -120,
        scale: 0.95,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "40% top",
          scrub: true,
        },
      });

      // Fade out scroll hint faster
      gsap.to(scrollHintRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "15% top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const title = "BUGATTI CHIRON";

  return (
    <section ref={sectionRef} className="relative w-full" style={{ height: "300vh" }}>
      {/* Sticky viewport — stays pinned while section scrolls */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#0A0A0A]">
        {/* Frame Sequence */}
        <ScrollFrameSequence
          folder="hero"
          prefix="hero_"
          frameCount={200}
          padLength={4}
          extension=".jpg"
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(10,10,10,0.7) 100%)",
          }}
        />

        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Title + subtitle */}
        <div
          ref={textRef}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none select-none"
        >
          <h1
            className="text-white font-extrabold text-6xl md:text-[7rem] leading-none tracking-tight flex overflow-hidden"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title.split("").map((char, i) => (
              <span key={i} className="hero-letter inline-block will-change-transform">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>

          <p
            className="hero-subtitle mt-6 text-white/90 text-base md:text-xl font-medium tracking-[0.2em] uppercase text-center"
            style={{ fontFamily: "var(--font-body)" }}
          >
            1,500 HP &middot; 304 MPH &middot; Pure Obsession
          </p>
        </div>

        {/* Scroll hint */}
        <div
          ref={scrollHintRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-white opacity-0"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase mb-2 font-medium">
            Scroll to explore
          </span>
          <ChevronDown className="animate-bounce" size={20} strokeWidth={1.5} />
        </div>
      </div>
    </section>
  );
}
