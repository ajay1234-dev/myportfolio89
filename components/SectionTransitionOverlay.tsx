"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SectionTransitionOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const whiteFlashRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  
  const [activeSection, setActiveSection] = useState({ number: "01", name: "HERO" });

  useEffect(() => {
    // Slight delay to ensure DOM is fully painted with data attributes
    const timer = setTimeout(() => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section-name]"));
      if (sections.length === 0) return;

      const triggers: ScrollTrigger[] = [];
      let flashTl: gsap.core.Timeline | null = null;
      
      const playFlash = (idx: number, name: string) => {
        // Only run if advancing past the first load, to avoid flashing on initial page paint
        // and only play on meaningful transitions.
        
        const numStr = (idx + 1).toString().padStart(2, "0");
        setActiveSection({ number: numStr, name: name });

        if (flashTl) flashTl.kill();
        flashTl = gsap.timeline();

        gsap.set(infoRef.current, { opacity: 1 });

        flashTl
          // White overlay flash
          .fromTo(
            whiteFlashRef.current,
            { opacity: 0 },
            { opacity: 0.04, duration: 0.1 },
            0
          )
          .to(
            whiteFlashRef.current,
            { opacity: 0, duration: 0.1 },
            0.1
          )
          // Label slide in
          .fromTo(
            labelRef.current,
            { x: 20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
            0.1
          )
          // Fade out entire info block after 2s
          .to(infoRef.current, { opacity: 0, duration: 0.4, delay: 1.5 });
      };

      sections.forEach((section, idx) => {
        const name = section.getAttribute("data-section-name") || "SECTION";
        
        const st = ScrollTrigger.create({
          trigger: section,
          start: "top 50%", // Trigger when section hits middle of screen
          onEnter: () => {
             // Don't flash hero on page load
             if (idx > 0) playFlash(idx, name);
          },
          onEnterBack: () => {
             playFlash(idx, name);
          },
        });
        triggers.push(st);
      });

      return () => {
        triggers.forEach((t) => t.kill());
        if (flashTl) flashTl.kill();
      };
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top info area */}
      <div 
        ref={infoRef}
        style={{ 
          padding: "24px 40px", 
          display: "flex", 
          gap: "12px", 
          opacity: 0,
          alignItems: "baseline",
          position: "absolute",
          top: "80px", // Below navbar placeholder
          left: 0
        }}
      >
        <span 
          ref={numberRef}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--white-dim)",
          }}
        >
          {activeSection.number}
        </span>
        <span 
          ref={labelRef}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--white)",
            letterSpacing: "0.14em",
          }}
        >
          — {activeSection.name}
        </span>
      </div>

      {/* Full white flash overlay */}
      <div
        ref={whiteFlashRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--white)",
          opacity: 0,
        }}
      />
    </div>
  );
}
