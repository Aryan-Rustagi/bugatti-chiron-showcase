"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!progressRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(progressRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.1, // slight smooth scrub
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed right-0 top-0 h-full w-1.5 md:w-2 z-50 pointer-events-none mix-blend-difference">
      {/* Background track */}
      <div className="absolute inset-0 w-full h-full bg-white/10" />
      
      {/* Progress fill */}
      <div 
        ref={progressRef}
        className="absolute top-0 right-0 w-full h-full bg-white origin-top"
        style={{ transform: "scaleY(0)" }}
      />
    </div>
  );
}
