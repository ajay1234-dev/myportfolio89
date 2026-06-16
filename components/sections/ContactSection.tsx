"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useMagneticText } from "@/hooks/useMagneticText";

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const magneticRef = useMagneticText();

  const headingRef = useRef<HTMLDivElement>(null);

  const noiseRef = useRef<HTMLDivElement>(null);
  const subWrapRef = useRef<HTMLParagraphElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);

  const EMAIL = "inderajay82@gmail.com";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // We use IntersectionObserver to guarantee triggering at ~20% visibility
    // instead of ScrollTrigger, as requested for this specific feel.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);

            const tl = gsap.timeline();

            // 0.0s: Background noise grain intensifies briefly
            tl.fromTo(
              noiseRef.current,
              { opacity: 0.035 },
              { opacity: 0.07, duration: 0.5, ease: "power2.inOut" },
              0
            ).to(
              noiseRef.current,
              { opacity: 0.035, duration: 0.5, ease: "power2.inOut" },
              0.5
            );

            // 0.2s: "Let's Build" unmasked
            const line1Words = headingRef.current?.querySelectorAll(
              ".contact__heading-line:first-child .contact__word"
            );
            if (line1Words) {
              tl.fromTo(
                line1Words,
                { clipPath: "inset(100% 0 0 0)", y: 40 },
                {
                  clipPath: "inset(0% 0 0 0)",
                  y: 0,
                  duration: 0.8,
                  stagger: 0.12,
                  ease: "expo.out",
                },
                0.2
              );
            }

            // 0.6s: "Something Great." unmasked
            const line2Words = headingRef.current?.querySelectorAll(
              ".contact__heading-line--indent .contact__word"
            );
            if (line2Words) {
              tl.fromTo(
                line2Words,
                { clipPath: "inset(100% 0 0 0)", y: 40 },
                {
                  clipPath: "inset(0% 0 0 0)",
                  y: 0,
                  duration: 0.8,
                  stagger: 0.12,
                  ease: "expo.out",
                },
                0.6
              );
            }

            // 1.1s: Subtext fades
            tl.fromTo(
              subWrapRef.current,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
              1.1
            );

            // 1.5s: Email block slides up
            tl.fromTo(
              emailRef.current,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
              1.5
            );

            // 1.8s: Social row scales in
            const socials = socialsRef.current?.querySelectorAll(".btn-glass");
            if (socials) {
              tl.fromTo(
                socials,
                { opacity: 0, scale: 0.9 },
                {
                  opacity: 1,
                  scale: 1,
                  duration: 0.5,
                  stagger: 0.08,
                  ease: "back.out(1.5)",
                },
                1.8
              );
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="contact"
      className="contact section"
      ref={sectionRef}
      data-section-name="CONTACT"
      style={{ position: "relative" }}
    >
      <div
        ref={noiseRef}
        className="contact__noise"
        style={{
          opacity: 0.035,
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />

      <div
        className="container contact__inner"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div ref={magneticRef}>
          <div ref={headingRef} className="contact__heading-wrap">
            <div className="contact__heading-line">
              {["Let's", "Build"].map((word) => (
                <span
                  key={word}
                  data-magnetic
                  data-cursor="contact"
                  className="contact__word"
                  style={{ clipPath: "inset(100% 0 0 0)" }}
                >
                  {word}
                </span>
              ))}
            </div>
            <div className="contact__heading-line contact__heading-line--indent">
              {["Something", "Great."].map((word) => (
                <span
                  key={word}
                  data-magnetic
                  data-cursor="contact"
                  className="contact__word"
                  style={{ clipPath: "inset(100% 0 0 0)" }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p ref={subWrapRef} className="contact__sub" style={{ opacity: 0 }}>
          Open to full-time roles, freelance, and cloud consulting.
        </p>
        <a
          ref={emailRef}
          className="contact__email"
          href={`mailto:${EMAIL}`}
          data-cursor="button"
          style={{
            opacity: 0,
            display: "inline-block",
            textDecoration: "none",
          }}
        >
          {EMAIL}
        </a>
        <div ref={socialsRef} className="contact__socials">
          {[
            { label: "GitHub", href: "https://github.com/ajay1234-dev" },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/in/ajay-singh-9969a82a1/",
            },
            { label: "Twitter", href: "https://x.com/StillAbove48" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass"
              data-cursor="button"
              style={{ opacity: 0 }}
            >
              {label}
            </a>
          ))}
        </div>{" "}
        <footer className="contact__footer">
          Ajay Singh · 2025 · Built with Next.js, GSAP &amp; Canvas API
        </footer>
      </div>
    </section>
  );
}
