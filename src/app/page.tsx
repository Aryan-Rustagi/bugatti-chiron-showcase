"use client";

import { useState } from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { PerformanceSection } from "@/components/sections/PerformanceSection";
import { EngineeringSection } from "@/components/sections/EngineeringSection";
import { DesignSection } from "@/components/sections/DesignSection";
import { OutroSection } from "@/components/sections/OutroSection";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <LoadingScreen onComplete={() => setIsLoaded(true)} />
      
      <main className={`w-full bg-[#0A0A0A] transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <ScrollProgress />
        <HeroSection />
        <PerformanceSection />
        <EngineeringSection />
        <DesignSection />
        <OutroSection />
      </main>
    </>
  );
}
