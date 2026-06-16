"use client";

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "24px", fontWeight: 800, color: "var(--white)", marginBottom: "8px" }}>
          Settings
        </h2>
        <p style={{ color: "rgba(242,244,255,0.35)", fontSize: "13px" }}>
          System configuration and API integrations.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Auth Setup */}
        <div style={{
          borderRadius: "16px", padding: "28px",
          background: "rgba(12,13,18,0.7)", border: "1px solid rgba(242,244,255,0.06)",
        }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, color: "var(--white)", fontSize: "16px", marginBottom: "8px" }}>
            Administrator Email
          </h3>
          <p style={{ color: "rgba(242,244,255,0.35)", fontSize: "13px", marginBottom: "20px", lineHeight: 1.6 }}>
            The Google account mapped to this email is automatically granted admin access to this dashboard without any login screens.
          </p>
          <div style={{
            background: "rgba(6,6,8,0.8)", border: "1px solid rgba(242,244,255,0.08)",
            padding: "14px 16px", borderRadius: "12px", color: "rgba(242,244,255,0.6)",
            fontFamily: "var(--font-mono)", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px"
          }}>
            <span style={{ color: "#00E5A0" }}>🔒</span>
            {process.env.NEXT_PUBLIC_ADMIN_EMAIL || "Not configured"}
          </div>
        </div>

        {/* API Integrations */}
        <div style={{
          borderRadius: "16px", padding: "28px",
          background: "rgba(12,13,18,0.7)", border: "1px solid rgba(242,244,255,0.06)",
        }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, color: "var(--white)", fontSize: "16px", marginBottom: "20px" }}>
            Active Integrations
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { name: "Firebase Firestore", status: "Connected", color: "#00E5A0", bg: "rgba(0,229,160,0.1)" },
              { name: "Gemini 2.0 AI Engine", status: "Connected", color: "#00E5A0", bg: "rgba(0,229,160,0.1)" },
              { name: "Cloudinary Image CDN", status: "Connected", color: "#00E5A0", bg: "rgba(0,229,160,0.1)" },
              { name: "GitHub API Sync", status: "Connected", color: "#00E5A0", bg: "rgba(0,229,160,0.1)" },
            ].map(item => (
              <div key={item.name} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 16px", background: "rgba(6,6,8,0.6)",
                border: "1px solid rgba(242,244,255,0.04)", borderRadius: "12px",
              }}>
                <span style={{ fontSize: "13px", color: "rgba(242,244,255,0.8)" }}>{item.name}</span>
                <span style={{
                  fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700,
                  padding: "4px 10px", borderRadius: "6px",
                  color: item.color, background: item.bg,
                }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          
          <p style={{ color: "rgba(242,244,255,0.3)", fontSize: "12px", marginTop: "20px", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
            Webhooks are no longer needed. The system now uses manual, on-demand synchronization to prevent unnecessary API usage and give you full control over when to pull updates.
          </p>
        </div>

      </div>
    </div>
  );
}
