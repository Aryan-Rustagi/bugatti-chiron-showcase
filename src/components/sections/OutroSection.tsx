"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function OutroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".bugatti-logo",
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1,
          scale: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "40% 50%",
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        ".outro-footer",
        { opacity: 0, y: 20 },
        {
          opacity: 0.6,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "30% 70%",
            end: "60% 50%",
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#0A0A0A] flex flex-col items-center justify-center"
      style={{ height: "100vh" }}
    >
      {/* Logo */}
      <div className="bugatti-logo flex-1 flex items-center justify-center opacity-0">
        <div className="flex flex-col items-center">
          <div className="w-20 h-28 border-[3px] border-white/90 rounded-t-full rounded-b-sm flex items-center justify-center mb-5">
            <span
              className="font-bold text-4xl text-white italic tracking-tighter"
              style={{ fontFamily: "var(--font-display)" }}
            >
              EB
            </span>
          </div>
          <h2
            className="text-white font-bold text-2xl tracking-[0.35em] uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            BUGATTI
          </h2>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="outro-footer w-full px-8 py-10 md:px-12 flex flex-col md:flex-row justify-between items-center text-white text-[10px] md:text-xs tracking-[0.2em] uppercase font-medium opacity-0"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <div className="flex gap-6 mb-3 md:mb-0">
          <a href="#" className="hover:text-white/100 text-white/50 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white/100 text-white/50 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-white/100 text-white/50 transition-colors">
            Contact
          </a>
        </div>

        <div className="text-white/40">
          &copy; {new Date().getFullYear()} Bugatti Automobiles S.A.S.
        </div>

        <div className="mt-3 md:mt-0 text-[#C8102E]/80">Built with Google Antigravity</div>
      </footer>
    </section>
  );
}
