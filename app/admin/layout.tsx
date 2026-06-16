"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "◈", exact: true },
  { href: "/admin/pending-projects", label: "Pending Approvals", icon: "⏳", exact: false },
  { href: "/admin/projects", label: "Projects", icon: "⬡", exact: false },
  { href: "/admin/deployments", label: "Deployments", icon: "🚀", exact: false },
  { href: "/admin/analytics", label: "Analytics", icon: "◉", exact: false },
  { href: "/admin/settings", label: "Settings", icon: "⚙", exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAdmin, signIn, signOut } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      // Not signed in — trigger popup automatically
      setSigningIn(true);
      signIn().finally(() => setSigningIn(false));
    } else if (!isAdmin) {
      // Signed in but not admin — redirect home
      document.cookie = "admin_session=; max-age=0; path=/";
      router.replace("/");
    }
  }, [user, loading, isAdmin, signIn, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  if (loading || signingIn || !isAdmin) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--black)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "2px solid rgba(91,110,255,0.2)",
          borderTop: "2px solid #5B6EFF",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "rgba(242,244,255,0.35)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>
          {signingIn ? "Authenticating…" : "Verifying access…"}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: "260px",
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "rgba(12,13,18,0.85)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(242,244,255,0.06)",
        zIndex: 40,
      }}>

        {/* Brand */}
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(242,244,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "9px",
              background: "linear-gradient(135deg, #5B6EFF, #7B8FFF)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: "18px",
              boxShadow: "0 0 20px rgba(91,110,255,0.4)",
            }}>🧠</div>
            <div>
              <div style={{ color: "var(--white)", fontWeight: 700, fontSize: "14px", fontFamily: "var(--font-syne)", lineHeight: 1.2 }}>
                Admin Console
              </div>
              <div style={{ color: "rgba(242,244,255,0.35)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                Portfolio OS
              </div>
            </div>
          </div>

          {/* Admin badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            background: "rgba(0,229,160,0.06)",
            border: "1px solid rgba(0,229,160,0.15)",
            borderRadius: "10px",
          }}>
            <span style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: "#00E5A0",
              boxShadow: "0 0 8px #00E5A0",
              display: "inline-block",
              animation: "pulse 2s infinite",
              flexShrink: 0,
            }} />
            <span style={{
              color: "#00E5A0", fontSize: "11px",
              fontFamily: "var(--font-mono)", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.email}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV.map(({ href, label, icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href) && href !== "/admin";
            const isExactDash = href === "/admin" && pathname === "/admin";
            const isActive = isExactDash || (!exact && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: "var(--font-dm)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  color: isActive ? "#A5B4FF" : "rgba(242,244,255,0.45)",
                  background: isActive ? "rgba(91,110,255,0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(91,110,255,0.25)" : "1px solid transparent",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(242,244,255,0.8)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(242,244,255,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(242,244,255,0.45)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: "15px", width: "18px", textAlign: "center" }}>{icon}</span>
                {label}
                {isActive && (
                  <span style={{
                    marginLeft: "auto",
                    width: "4px", height: "4px", borderRadius: "50%",
                    background: "#5B6EFF",
                    boxShadow: "0 0 6px #5B6EFF",
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(242,244,255,0.06)" }}>
          <a
            href="/"
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", borderRadius: "10px",
              fontSize: "12px", color: "rgba(242,244,255,0.35)",
              textDecoration: "none", transition: "all 0.2s",
              fontFamily: "var(--font-mono)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(242,244,255,0.7)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(242,244,255,0.35)"; }}
          >
            ← Portfolio
          </a>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", borderRadius: "10px", fontSize: "12px",
              color: "rgba(255,77,109,0.5)", background: "none", border: "none",
              cursor: "pointer", transition: "all 0.2s", textAlign: "left",
              fontFamily: "var(--font-mono)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#FF4D6D";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,77,109,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,77,109,0.5)";
              (e.currentTarget as HTMLElement).style.background = "none";
            }}
          >
            ↩ Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, marginLeft: "260px", display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          borderBottom: "1px solid rgba(242,244,255,0.06)",
          background: "rgba(6,6,8,0.85)", backdropFilter: "blur(20px)",
          padding: "16px 36px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{
              color: "var(--white)", fontFamily: "var(--font-syne)",
              fontWeight: 700, fontSize: "18px", lineHeight: 1.2,
            }}>
              {NAV.find(n => n.href === pathname)?.label ?? "Admin Console"}
            </h1>
            <p style={{ color: "rgba(242,244,255,0.3)", fontSize: "12px", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
              portfolio-me-ae525 · production
            </p>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "6px 14px", borderRadius: "999px",
            border: "1px solid rgba(91,110,255,0.2)",
            background: "rgba(91,110,255,0.06)",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#00E5A0", boxShadow: "0 0 6px #00E5A0",
              display: "inline-block", animation: "pulse 2s infinite",
            }} />
            <span style={{ fontSize: "11px", color: "#7B8FFF", fontFamily: "var(--font-mono)" }}>
              {user?.displayName ?? user?.email}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: "36px", flex: 1 }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
