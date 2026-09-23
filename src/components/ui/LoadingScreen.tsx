"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoPathRef = useRef<SVGPathElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait for window load
    const handleLoad = () => {
      if (isLoaded) return;
      setIsLoaded(true);
      
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
          if (containerRef.current) {
            containerRef.current.style.display = 'none';
          }
        }
      });
      
      // Calculate length for stroke animation
      const path = logoPathRef.current;
      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        
        // Draw the path
        tl.to(path, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "power2.inOut"
        });
        
        // Fill the shape
        tl.to(path, {
          fill: "#F5F5F5",
          stroke: "transparent",
          duration: 0.5
        }, "-=0.3");
      }

      // Split open animation
      tl.to(".loading-panel-top", { yPercent: -100, duration: 1, ease: "power4.inOut" }, "+=0.2");
      tl.to(".loading-panel-bottom", { yPercent: 100, duration: 1, ease: "power4.inOut" }, "<");
      tl.to(".loading-logo-container", { scale: 1.5, opacity: 0, duration: 0.8, ease: "power3.in" }, "<");
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      // Fallback timeout in case images take too long
      const timeout = setTimeout(handleLoad, 3000);
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(timeout);
      };
    }
  }, [isLoaded, onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] flex flex-col pointer-events-none">
      
      <div className="loading-panel-top w-full h-1/2 bg-[#0A0A0A] border-b border-[#C8102E]/20 relative overflow-hidden">
        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')"
        }}></div>
      </div>
      
      <div className="loading-panel-bottom w-full h-1/2 bg-[#0A0A0A] relative overflow-hidden">
        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')"
        }}></div>
      </div>

      <div className="loading-logo-container absolute inset-0 flex items-center justify-center">
        {/* Simplified Bugatti EB logo as SVG */}
        <svg width="80" height="120" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            ref={logoPathRef}
            d="M 10,10 L 70,10 C 70,10 70,110 40,110 C 10,110 10,10 10,10 Z M 20,20 L 40,20 L 40,50 L 20,50 Z M 20,60 L 40,60 L 40,90 L 20,90 Z M 45,20 C 60,20 60,50 45,50 Z M 45,60 C 65,60 65,90 45,90 Z" 
            stroke="#F5F5F5" 
            strokeWidth="2" 
            fill="transparent"
            strokeLinejoin="round"
          />
        </svg>
      </div>

    </div>
  );
}
