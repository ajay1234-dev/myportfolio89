"use client";
import { useState, useEffect, useRef } from "react";
import { useScroll } from "framer-motion";
import { useScrollSection } from "@/hooks/useScrollSection";
import MobileMenu from "./MobileMenu";
import { useAuth } from "./AuthProvider";
import Link from "next/link";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const activeSection = useScrollSection();
  const navRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, isAdmin, signIn } = useAuth();

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => {
      if (!navRef.current) return;
      if (y > 80) {
        navRef.current.style.transform = "translateY(0)";
        navRef.current.style.opacity = "1";
      } else {
        navRef.current.style.transform = "translateY(-100%)";
        navRef.current.style.opacity = "0";
      }
    });
    return () => unsub();
  }, [scrollY]);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        ref={navRef}
        className="navbar"
        style={{ transform: "translateY(-100%)", opacity: 0 }}
      >
        <span className="navbar__name">Ajay Singh I</span>

        {/* Desktop Links */}
        <ul className="navbar__links">
          {NAV_LINKS.map(({ label, href }) => {
            const sectionId = href.replace("#", "");
            const isActive = activeSection === sectionId;
            return (
              <li key={label}>
                <a
                  href={href}
                  onClick={(e) => scrollTo(e, href)}
                  className={`navbar__link ${isActive ? "navbar__link--active" : ""}`}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Mobile Toggle */}
        <button
          className="navbar__toggle"
          onClick={() => setIsMenuOpen(true)}
          style={{
            background: "none",
            border: "none",
            color: "var(--white)",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          Menu
        </button>

        <div className="navbar__status">
          <span className="status-dot" />
          Available for Work
        </div>

        {/* Admin Console Button — only visible to admin */}
        {!loading && isAdmin && (
          <Link
            href="/admin"
            id="admin-console-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 16px",
              background: "linear-gradient(135deg, rgba(91,110,255,0.18), rgba(123,143,255,0.10))",
              border: "1px solid rgba(91,110,255,0.45)",
              borderRadius: "10px",
              color: "#7B8FFF",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              textDecoration: "none",
              letterSpacing: "0.04em",
              transition: "all 0.25s ease",
              boxShadow: "0 0 16px rgba(91,110,255,0.15)",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "linear-gradient(135deg, rgba(91,110,255,0.35), rgba(123,143,255,0.2))";
              el.style.borderColor = "rgba(91,110,255,0.8)";
              el.style.boxShadow = "0 0 28px rgba(91,110,255,0.4)";
              el.style.color = "#A5B4FF";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "linear-gradient(135deg, rgba(91,110,255,0.18), rgba(123,143,255,0.10))";
              el.style.borderColor = "rgba(91,110,255,0.45)";
              el.style.boxShadow = "0 0 16px rgba(91,110,255,0.15)";
              el.style.color = "#7B8FFF";
            }}
          >
            <span style={{ fontSize: "11px" }}>⚡</span>
            Admin Console
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#00E5A0",
                boxShadow: "0 0 6px #00E5A0",
                animation: "pulse 2s infinite",
              }}
            />
          </Link>
        )}

        {/* Hidden sign-in trigger — subtle lock icon, invisible to visitors */}
        {!loading && !user && (
          <button
            onClick={signIn}
            title="Owner access"
            id="owner-signin-trigger"
            style={{
              background: "none",
              border: "none",
              color: "rgba(242,244,255,0.08)",
              fontSize: "14px",
              padding: "4px 6px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "color 0.3s",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(242,244,255,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(242,244,255,0.08)";
            }}
          >
            ⬡
          </button>
        )}
      </nav>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeSection={activeSection}
      />
    </>
  );
}
