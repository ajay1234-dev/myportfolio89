"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

interface Project {
  techStack: string[];
  stars?: number;
  forks?: number;
  isPrivate?: boolean;
  status: string;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRepos: 0,
    publicRepos: 0,
    privateRepos: 0,
    totalStars: 0,
    totalForks: 0,
    liveDeployments: 0,
    topLanguages: [] as { lang: string; count: number }[],
  });

  useEffect(() => {
    const q = query(collection(db, "projects"));
    return onSnapshot(q, (snap) => {
      let totalStars = 0;
      let totalForks = 0;
      let publicRepos = 0;
      let privateRepos = 0;
      let liveDeployments = 0;
      const langCounts: Record<string, number> = {};

      snap.docs.forEach((doc) => {
        const data = doc.data() as Project;
        totalStars += data.stars || 0;
        totalForks += data.forks || 0;
        
        if (data.isPrivate) privateRepos++;
        else publicRepos++;

        if (data.status === "approved") liveDeployments++;

        if (data.techStack && data.techStack.length > 0) {
          // Typically the first item in techStack is the main language when imported
          const mainLang = data.techStack[0];
          langCounts[mainLang] = (langCounts[mainLang] || 0) + 1;
        }
      });

      const topLanguages = Object.entries(langCounts)
        .map(([lang, count]) => ({ lang, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // top 5 languages

      setStats({
        totalRepos: snap.docs.length,
        publicRepos,
        privateRepos,
        totalStars,
        totalForks,
        liveDeployments,
        topLanguages,
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ borderRadius: "16px", height: "180px", background: "rgba(12,13,18,0.6)", border: "1px solid rgba(242,244,255,0.06)", animation: "shimmer 1.6s ease-in-out infinite" }} />
        ))}
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "24px", fontWeight: 800, color: "var(--white)", marginBottom: "8px" }}>
          GitHub Analysis
        </h2>
        <p style={{ color: "rgba(242,244,255,0.35)", fontSize: "13px" }}>
          Real-time metrics calculated from your imported GitHub repositories.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        {/* Total Stars Card */}
        <div style={{
          borderRadius: "16px", padding: "24px", position: "relative", overflow: "hidden",
          background: "rgba(12,13,18,0.7)", border: "1px solid rgba(242,244,255,0.06)",
        }}>
          <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: "#F5A623", opacity: 0.08, filter: "blur(20px)" }} />
          <h3 style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "rgba(242,244,255,0.4)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Stars</h3>
          <div style={{ fontSize: "40px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "#F5A623" }}>{stats.totalStars}</div>
        </div>

        {/* Total Repos Card */}
        <div style={{
          borderRadius: "16px", padding: "24px", position: "relative", overflow: "hidden",
          background: "rgba(12,13,18,0.7)", border: "1px solid rgba(242,244,255,0.06)",
        }}>
          <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: "#5B6EFF", opacity: 0.08, filter: "blur(20px)" }} />
          <h3 style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "rgba(242,244,255,0.4)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Repositories</h3>
          <div style={{ fontSize: "40px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "#5B6EFF", display: "flex", alignItems: "baseline", gap: "10px" }}>
            {stats.totalRepos}
            <span style={{ fontSize: "14px", fontWeight: 500, color: "rgba(242,244,255,0.4)" }}>
              ({stats.publicRepos} public)
            </span>
          </div>
        </div>

        {/* Live Deployments Card */}
        <div style={{
          borderRadius: "16px", padding: "24px", position: "relative", overflow: "hidden",
          background: "rgba(12,13,18,0.7)", border: "1px solid rgba(242,244,255,0.06)",
        }}>
          <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: "#00E5A0", opacity: 0.08, filter: "blur(20px)" }} />
          <h3 style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "rgba(242,244,255,0.4)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Live on Portfolio</h3>
          <div style={{ fontSize: "40px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "#00E5A0" }}>{stats.liveDeployments}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Languages Breakdown */}
        <div style={{
          borderRadius: "16px", padding: "28px",
          background: "rgba(12,13,18,0.7)", border: "1px solid rgba(242,244,255,0.06)",
        }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: 700, color: "var(--white)", marginBottom: "20px" }}>
            Top Languages
          </h3>
          {stats.topLanguages.length === 0 ? (
             <p style={{ color: "rgba(242,244,255,0.3)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>No language data available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {stats.topLanguages.map((item, idx) => {
                const percentage = Math.round((item.count / stats.totalRepos) * 100);
                const colors = ["#5B6EFF", "#c084fc", "#00E5A0", "#F5A623", "#FF4D6D"];
                const color = colors[idx % colors.length];
                return (
                  <div key={item.lang}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", fontFamily: "var(--font-dm)", fontWeight: 500, color: "var(--white)" }}>
                      <span>{item.lang}</span>
                      <span style={{ color: "rgba(242,244,255,0.4)" }}>{percentage}%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(242,244,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${percentage}%`, height: "100%", background: color, borderRadius: "3px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Engagement Stats */}
        <div style={{
          borderRadius: "16px", padding: "28px",
          background: "rgba(12,13,18,0.7)", border: "1px solid rgba(242,244,255,0.06)",
        }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: 700, color: "var(--white)", marginBottom: "20px" }}>
            Engagement
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(242,244,255,0.03)", borderRadius: "12px", border: "1px solid rgba(242,244,255,0.04)" }}>
                <span style={{ fontSize: "14px", color: "rgba(242,244,255,0.6)", fontFamily: "var(--font-dm)" }}>Total Forks</span>
                <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--font-syne)", color: "#c084fc" }}>{stats.totalForks}</span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(242,244,255,0.03)", borderRadius: "12px", border: "1px solid rgba(242,244,255,0.04)" }}>
                <span style={{ fontSize: "14px", color: "rgba(242,244,255,0.6)", fontFamily: "var(--font-dm)" }}>Private Repositories</span>
                <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--font-syne)", color: "#FF4D6D" }}>{stats.privateRepos}</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
