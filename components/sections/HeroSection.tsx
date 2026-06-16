"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import dynamic from "next/dynamic";

const ParticleCanvas = dynamic(() => import("@/components/ParticleCanvas"), { ssr: false });

export default function HeroSection() {
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });

    // Page load sequence
    tl.fromTo(
      eyebrowRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      0.2
    )
      .fromTo(
        line1Ref.current,
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", duration: 1, ease: "expo.out" },
        1.0
      )
      .fromTo(
        line2Ref.current,
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", duration: 1, ease: "expo.out" },
        1.15
      )
      .fromTo(
        roleRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        1.5
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        1.8
      )
      .fromTo(
        scrollIndRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        2.2
      );
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="hero" data-section-name="HERO">
      {/* Background Layers */}
      <div className="hero__noise" />
      <div className="hero__gradient" />
      <div className="hero__scanlines" />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        <ParticleCanvas />
      </div>

      {/* Main Content */}
      <div className="hero__inner container">
        <div className="hero__content">
          <p ref={eyebrowRef} className="hero__eyebrow" style={{ opacity: 0 }}>
            FULL STACK · CLOUD · DEVOPS
          </p>

          <h1 className="hero__name">
            <div
              ref={line1Ref}
              className="hero__name-line"
              style={{ clipPath: "inset(100% 0 0 0)" }}
            >
              <span style={{ display: 'inline-block', paddingRight: '0.15em' }}>Ajay</span>
            </div>
            <div
              ref={line2Ref}
              className="hero__name-line hero__name-line--indent"
              style={{ clipPath: "inset(100% 0 0 0)" }}
            >
              <span style={{ display: 'inline-block', paddingRight: '0.15em' }}>Singh</span>
            </div>
          </h1>

          <p ref={roleRef} className="hero__role" style={{ opacity: 0 }}>
            Building scalable systems that power products used by millions.
          </p>

          <div ref={ctaRef} className="hero__cta" style={{ opacity: 0 }}>
            <button
              className="btn btn--filled"
              onClick={() => scrollTo("projects")}
              data-cursor="button"
            >
              View Work
            </button>
            <button
              className="btn btn--outline"
              onClick={() => scrollTo("contact")}
              data-cursor="button"
            >
              Get In Touch
            </button>
          </div>
        </div>


      </div>

      {/* Scroll Indicator */}
      <div ref={scrollIndRef} className="hero__scroll-indicator" style={{ opacity: 0 }}>
        <div className="hero__scroll-mouse">
          <div className="hero__scroll-wheel" />
        </div>
        <span className="hero__scroll-label">scroll</span>
      </div>
    </section>
  );
}
