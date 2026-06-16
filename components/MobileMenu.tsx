"use client";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
}

export default function MobileMenu({ isOpen, onClose, activeSection }: MobileMenuProps) {
  const { isAdmin, signIn, loading } = useAuth();

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="mobile-menu glass"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(6, 6, 8, 0.97)",
            backdropFilter: "blur(32px)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "24px",
              right: "40px",
              background: "none",
              border: "none",
              color: "var(--white)",
              fontSize: "32px",
              cursor: "pointer",
            }}
          >
            ×
          </button>

          <ul style={{ listStyle: "none", textAlign: "center", display: "flex", flexDirection: "column", gap: "32px" }}>
            {NAV_LINKS.map(({ label, href }, i) => {
              const sectionId = href.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <a
                    href={href}
                    onClick={(e) => scrollTo(e, href)}
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontSize: "32px",
                      fontWeight: 700,
                      color: isActive ? "var(--accent-bright)" : "var(--white)",
                      textDecoration: "none",
                    }}
                  >
                    {label}
                  </a>
                </motion.li>
              );
            })}
          </ul>

          <div style={{ position: "absolute", bottom: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            {/* Admin Console link — only for admin */}
            {!loading && isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href="/admin"
                  onClick={onClose}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 22px",
                    background: "linear-gradient(135deg, rgba(91,110,255,0.18), rgba(123,143,255,0.10))",
                    border: "1px solid rgba(91,110,255,0.45)",
                    borderRadius: "12px",
                    color: "#7B8FFF",
                    fontSize: "13px",
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                    boxShadow: "0 0 20px rgba(91,110,255,0.2)",
                  }}
                >
                  <span>⚡</span>
                  Admin Console
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00E5A0", display: "inline-block" }} />
                </Link>
              </motion.div>
            )}

            <div className="navbar__status" style={{ margin: "0 auto" }}>
              <span className="status-dot" />
              Available for Work
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
