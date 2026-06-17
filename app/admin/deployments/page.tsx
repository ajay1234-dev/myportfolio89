"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface Project {
  id: string;
  title: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  status: string;
  techStack: string[];
  createdAt: string;
}

import { auth } from "@/lib/firebase";

export default function DeploymentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)));
      setLoading(false);
    });
    return unsub;
  }, []);

  // Auto-sync with GitHub whenever the page is opened
  useEffect(() => {
    // Small delay to ensure auth is ready
    const timer = setTimeout(() => syncWithGitHub(false), 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const syncWithGitHub = async (showMsg = true) => {
    try {
      setRefreshing(true);
      if (showMsg) setRefreshMsg('Syncing with GitHub...');
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/sync/deployments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const parts = [];
      if (data.updatedCount > 0) parts.push(`Updated ${data.updatedCount} URL(s)`);
      if (data.deletedCount > 0) parts.push(`Removed ${data.deletedCount} deleted repo(s)`);
      if (showMsg) {
        setRefreshMsg(
          parts.length > 0
            ? `✓ ${parts.join(' · ')}`
            : '✓ Everything is up to date.'
        );
      }
    } catch (err: any) {
      if (showMsg) setRefreshMsg(`✕ ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => syncWithGitHub(true);


  // Deployed = has a live URL
  const deployed = projects.filter((p) => p.liveUrl && p.liveUrl.trim() !== "");
  const notDeployed = projects.filter((p) => !p.liveUrl || p.liveUrl.trim() === "");

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ borderRadius: "14px", height: "80px", background: "rgba(12,13,18,0.6)", border: "1px solid rgba(242,244,255,0.06)", animation: "shimmer 1.6s ease-in-out infinite" }} />
        ))}
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "24px", fontWeight: 800, color: "var(--white)", marginBottom: "8px" }}>
            Deployments
          </h2>
          <p style={{ color: "rgba(242,244,255,0.35)", fontSize: "13px" }}>
            Projects with live deployment URLs from GitHub.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: "10px 16px", borderRadius: "10px", border: "none",
            background: refreshing ? "rgba(242,244,255,0.08)" : "linear-gradient(135deg, #00E5A0, #00A674)",
            color: "#fff", fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-dm)",
            cursor: refreshing ? "not-allowed" : "pointer", opacity: refreshing ? 0.6 : 1,
            display: "flex", alignItems: "center", gap: "8px",
            boxShadow: refreshing ? "none" : "0 0 20px rgba(0,229,160,0.2)"
          }}
        >
          {refreshing ? <div style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "↻"}
          Refresh URLs
        </button>
      </div>

      {refreshMsg && (
        <div style={{
          marginBottom: "24px", padding: "10px 14px", borderRadius: "10px",
          fontSize: "12px", fontFamily: "var(--font-mono)",
          color: refreshMsg.startsWith("✕") ? "#FF4D6D" : "#00E5A0",
          background: refreshMsg.startsWith("✕") ? "rgba(255,77,109,0.08)" : "rgba(0,229,160,0.08)",
          border: refreshMsg.startsWith("✕") ? "1px solid rgba(255,77,109,0.2)" : "1px solid rgba(0,229,160,0.2)",
        }}>
          {refreshMsg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <div style={{
          padding: "14px 20px", borderRadius: "12px",
          background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)",
        }}>
          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "rgba(242,244,255,0.4)" }}>DEPLOYED</span>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-syne)", color: "#00E5A0" }}>{deployed.length}</div>
        </div>
        <div style={{
          padding: "14px 20px", borderRadius: "12px",
          background: "rgba(242,244,255,0.03)", border: "1px solid rgba(242,244,255,0.06)",
        }}>
          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "rgba(242,244,255,0.4)" }}>NO URL</span>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-syne)", color: "rgba(242,244,255,0.3)" }}>{notDeployed.length}</div>
        </div>
      </div>

      {/* Deployed Projects */}
      {deployed.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "300px", borderRadius: "16px", background: "rgba(12,13,18,0.5)",
          border: "1px dashed rgba(242,244,255,0.08)", textAlign: "center", padding: "40px",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚀</div>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: 700, color: "var(--white)", marginBottom: "6px" }}>
            No Deployed Projects
          </h3>
          <p style={{ color: "rgba(242,244,255,0.3)", fontSize: "13px" }}>
            Sync your GitHub repos first, then projects with live URLs will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {deployed.map((project) => (
            <div
              key={project.id}
              style={{
                borderRadius: "14px", padding: "16px 20px",
                background: "rgba(12,13,18,0.7)",
                border: "1px solid rgba(242,244,255,0.06)",
                display: "flex", alignItems: "center", gap: "16px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,160,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(242,244,255,0.06)"; }}
            >
              {/* Status dot */}
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#00E5A0", boxShadow: "0 0 8px rgba(0,229,160,0.5)",
                flexShrink: 0,
              }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h4 style={{
                    fontFamily: "var(--font-syne)", fontSize: "14px", fontWeight: 700,
                    color: "var(--white)", margin: 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {project.title}
                  </h4>
                  {/* Status badge */}
                  <span style={{
                    fontSize: "9px", padding: "2px 6px", borderRadius: "4px",
                    fontFamily: "var(--font-mono)", fontWeight: 700,
                    background: project.status === "approved" ? "rgba(0,229,160,0.15)" : project.status === "pending" ? "rgba(245,166,35,0.15)" : "rgba(91,110,255,0.15)",
                    color: project.status === "approved" ? "#00E5A0" : project.status === "pending" ? "#F5A623" : "#7B8FFF",
                  }}>
                    {project.status === "approved" ? "LIVE" : project.status === "pending" ? "PENDING" : project.status?.toUpperCase()}
                  </span>
                </div>

                {/* Tech stack */}
                {project.techStack?.length > 0 && (
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {project.techStack.slice(0, 3).map((t) => (
                      <span key={t} style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: "rgba(91,110,255,0.08)", color: "#7B8FFF", fontFamily: "var(--font-mono)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Live URL */}
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "11px", fontFamily: "var(--font-mono)", color: "#00E5A0",
                  textDecoration: "none", flexShrink: 0,
                  padding: "6px 12px", borderRadius: "8px",
                  background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,229,160,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,229,160,0.06)"; }}
              >
                {project.liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, "").substring(0, 30)} ↗
              </a>

              {/* GitHub URL */}
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "11px", fontFamily: "var(--font-mono)", color: "rgba(242,244,255,0.3)",
                  textDecoration: "none", flexShrink: 0,
                }}
              >
                GitHub ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
