"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    // Check if device supports hover
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsDesktop(false);
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Set up GSAP quick setter for performance
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      // Center the cursor
      xTo(e.clientX - 6);
      yTo(e.clientY - 6);
    };

      const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if interactive
      if (
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        gsap.to(cursor, { scale: 3, backgroundColor: "transparent", border: "1px solid #C8102E", duration: 0.2 });
      }
    };

    const handleMouseOut = () => {
      gsap.to(cursor, { scale: 1, backgroundColor: "#C8102E", border: "0px solid transparent", duration: 0.2 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  if (!isDesktop) return null;

  return (
    <div 
      ref={cursorRef} 
      className="fixed top-0 left-0 w-3 h-3 bg-[#C8102E] rounded-full pointer-events-none z-[9999] mix-blend-difference"
      style={{
        transform: "translate(-100px, -100px)" // Hide initially
      }}
    />
  );
}
