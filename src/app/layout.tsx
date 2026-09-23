import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { CustomCursor } from "@/components/ui/CustomCursor";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

// Fallback to Inter for display to ensure it builds correctly. 
// User can replace with Neue Haas Grotesk later.
const displayFont = Inter({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Bugatti Chiron | Sculpted by Air",
  description: "1,500 HP. 304 MPH. Pure obsession. The ultimate cinematic landing page.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${displayFont.variable}`}>
      <body className="antialiased bg-[#0A0A0A] text-[#F5F5F5] cursor-none">
        <CustomCursor />
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
