"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import Link from "next/link";

interface Stats {
  total: number;
  imported: number;
  pending: number;
  approved: number;
  rejected: number;
}

function SkeletonCard() {
  return (
    <div style={{
      borderRadius: "16px", padding: "24px",
      background: "rgba(12,13,18,0.6)",
      border: "1px solid rgba(242,244,255,0.06)",
      animation: "shimmer 1.6s ease-in-out infinite",
    }}>
      <div style={{ width: "60%", height: "10px", borderRadius: "4px", background: "rgba(242,244,255,0.06)", marginBottom: "16px" }} />
      <div style={{ width: "40%", height: "36px", borderRadius: "8px", background: "rgba(242,244,255,0.06)" }} />
    </div>
  );
}

function StatCard({
  label, value, color, accent, href, icon, loading
}: {
  label: string; value: number; color: string; accent: string;
  href: string; icon: string; loading: boolean;
}) {
  if (loading) return <SkeletonCard />;
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          borderRadius: "16px", padding: "24px",
          background: "rgba(12,13,18,0.7)",
          border: `1px solid ${accent}22`,
          cursor: "pointer",
          transition: "all 0.25s ease",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.border = `1px solid ${accent}55`;
          el.style.background = `rgba(12,13,18,0.95)`;
          el.style.boxShadow = `0 0 32px ${accent}18`;
          el.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.border = `1px solid ${accent}22`;
          el.style.background = "rgba(12,13,18,0.7)";
          el.style.boxShadow = "none";
          el.style.transform = "translateY(0)";
        }}
      >
        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: accent, opacity: 0.06, filter: "blur(20px)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "rgba(242,244,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {label}
          </span>
          <span style={{ fontSize: "18px", opacity: 0.6 }}>{icon}</span>
        </div>

        <div style={{ fontSize: "42px", fontWeight: 800, fontFamily: "var(--font-syne)", color, lineHeight: 1 }}>
          {value}
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ imported: 0, pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncMessage("Fetching repositories from GitHub…");
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch("/api/sync/github", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch(e) {}
      
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      
      setSyncMessage(data.syncedCount === 0
        ? `✓ Up to date — all ${data.totalRepos} repos already imported.`
        : `✓ Imported ${data.syncedCount} new repo${data.syncedCount > 1 ? "s" : ""} from GitHub! Go to Projects to review.`);
    } catch (error: any) {
      setSyncMessage(`✕ ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "projects"));
    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => d.data());
      setStats({
        total: docs.length,
        imported: docs.filter(d => d.status === "imported").length,
        pending: docs.filter(d => d.status === "pending").length,
        approved: docs.filter(d => d.status === "approved").length,
        rejected: docs.filter(d => d.status === "rejected").length,
      });
      setLoading(false);
    });
  }, []);

  const CARDS = [
    { label: "Imported Repos", value: stats.imported, color: "#7B8FFF", accent: "#7B8FFF", href: "/admin/projects", icon: "📦" },
    { label: "Pending Review", value: stats.pending, color: "#F5A623", accent: "#F5A623", href: "/admin/projects", icon: "⏳" },
    { label: "Live on Portfolio", value: stats.approved, color: "#00E5A0", accent: "#00E5A0", href: "/admin/projects", icon: "◉" },
    { label: "Total", value: stats.total, color: "var(--white)", accent: "#7B8FFF", href: "/admin/projects", icon: "⬡" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: 800, color: "var(--white)" }}>
            Overview
          </h2>
          <span style={{
            fontSize: "11px", padding: "3px 10px", borderRadius: "999px",
            background: "rgba(0,229,160,0.1)", color: "#00E5A0",
            fontFamily: "var(--font-mono)", border: "1px solid rgba(0,229,160,0.2)",
          }}>Live</span>
        </div>
        <p style={{ color: "rgba(242,244,255,0.35)", fontSize: "14px", fontFamily: "var(--font-dm)" }}>
          Your portfolio automation system at a glance.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "36px" }}>
        {CARDS.map(card => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Actions Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Workflow Guide */}
        <div style={{
          borderRadius: "16px", padding: "28px",
          background: "rgba(12,13,18,0.7)",
          border: "1px solid rgba(242,244,255,0.06)",
        }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, color: "var(--white)", fontSize: "16px", marginBottom: "20px" }}>
            Workflow
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { step: "1", label: "Sync repos from GitHub", desc: "Fast — just imports names and metadata", accent: "#7B8FFF" },
              { step: "2", label: "Generate AI content", desc: "Click ✨ on each project you want", accent: "#c084fc" },
              { step: "3", label: "Review & approve", desc: "Approve to make live on your portfolio", accent: "#00E5A0" },
            ].map(({ step, label, desc, accent }) => (
              <div key={step} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "8px", flexShrink: 0,
                  background: `${accent}20`, color: accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-mono)",
                }}>
                  {step}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--white)", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "11px", color: "rgba(242,244,255,0.3)" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub Sync */}
        <div style={{
          borderRadius: "16px", padding: "28px",
          background: "rgba(12,13,18,0.7)",
          border: "1px solid rgba(242,244,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, color: "var(--white)", fontSize: "16px" }}>
              GitHub Import
            </h3>
            <span style={{
              fontSize: "10px", padding: "2px 8px", borderRadius: "999px",
              background: "rgba(91,110,255,0.1)", color: "#7B8FFF",
              fontFamily: "var(--font-mono)", border: "1px solid rgba(91,110,255,0.2)",
            }}>Fast</span>
          </div>

          <p style={{ color: "rgba(242,244,255,0.35)", fontSize: "13px", fontFamily: "var(--font-dm)", lineHeight: 1.6, marginBottom: "24px" }}>
            Import all your repositories from GitHub. This is instant — no AI processing happens here.
          </p>

          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "12px 24px",
              background: syncing ? "rgba(242,244,255,0.08)" : "linear-gradient(135deg, #5B6EFF, #7B8FFF)",
              border: "none", borderRadius: "12px",
              color: "#fff", fontSize: "13px", fontWeight: 700,
              fontFamily: "var(--font-dm)", cursor: syncing ? "not-allowed" : "pointer",
              transition: "all 0.25s", opacity: syncing ? 0.6 : 1,
              boxShadow: syncing ? "none" : "0 0 24px rgba(91,110,255,0.35)",
            }}
          >
            {syncing
              ? <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Importing…</>
              : <><span style={{ fontSize: "16px" }}>↻</span> Sync GitHub Repos</>
            }
          </button>

          {syncMessage && (
            <p style={{
              marginTop: "16px", fontSize: "12px",
              fontFamily: "var(--font-mono)",
              color: syncMessage.startsWith("✕") ? "#FF4D6D" : "#00E5A0",
              padding: "10px 14px", borderRadius: "8px",
              background: syncMessage.startsWith("✕") ? "rgba(255,77,109,0.08)" : "rgba(0,229,160,0.08)",
              border: syncMessage.startsWith("✕") ? "1px solid rgba(255,77,109,0.2)" : "1px solid rgba(0,229,160,0.2)",
            }}>
              {syncMessage}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
