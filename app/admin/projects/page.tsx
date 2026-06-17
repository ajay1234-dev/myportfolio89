"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface Project {
  id: string;
  title: string;
  description: string;
  tagline?: string;
  features: string[];
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  status: string; // imported | pending | approved | rejected
  featured: boolean;
  stars?: number;
  forks?: number;
  isPrivate?: boolean;
}

type Tab = "imported" | "pending" | "approved" | "rejected";

const TABS: { key: Tab; label: string; accent: string }[] = [
  { key: "imported", label: "Imported", accent: "#7B8FFF" },
  { key: "pending", label: "Pending Review", accent: "#F5A623" },
  { key: "approved", label: "Live", accent: "#00E5A0" },
  { key: "rejected", label: "Rejected", accent: "#FF4D6D" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("imported");
  const [generating, setGenerating] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [capturingScreenshot, setCapturingScreenshot] = useState(false);
  const [capturingRow, setCapturingRow] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)));
      setLoading(false);
    });
  }, []);

  const filteredProjects = projects.filter((p) => p.status === activeTab);

  const handleGenerateAndPublish = async (project: Project) => {
    try {
      setGenerating(project.id);
      setActionMsg(`Generating AI content for "${project.title}"...`);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/projects/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId: project.id }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {}

      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      setActionMsg(`✓ "${data.title}" generated successfully! Moved to Pending Review.`);
    } catch (err: any) {
      setActionMsg(`✕ ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setActionMsg(`✓ Project status updated to ${status}.`);
    } catch (err: any) {
      setActionMsg(`✕ ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      await fetch("/api/projects", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      setActionMsg(`✓ Project deleted successfully.`);
    } catch (err: any) {
      setActionMsg(`✕ ${err.message}`);
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setEditForm({
      ...project,
      techStack: project.techStack || [],
      features: project.features || [],
    });
  };

  const closeEditModal = () => {
    setEditingProject(null);
    setIsCreatingCustom(false);
    setEditForm({});
  };

  const saveProjectEdits = async (publish: boolean) => {
    try {
      setActionMsg("Saving changes...");
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      if (isCreatingCustom) {
        // Create new project
        const payload = {
          ...editForm,
          status: publish ? "approved" : "pending",
        };
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create project");
        setActionMsg(publish ? `✓ Custom project published live!` : `✓ Custom project saved as pending.`);
      } else {
        // Update existing project
        const payload = {
          ...editForm,
          id: editingProject!.id,
          status: publish ? "approved" : editingProject!.status,
        };
        const res = await fetch("/api/projects", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to save changes");
        setActionMsg(publish ? `✓ Project published to live portfolio!` : `✓ Draft saved successfully.`);
      }
      
      closeEditModal();
    } catch (err: any) {
      setActionMsg(`✕ ${err.message}`);
    }
  };

  const handleCaptureScreenshot = async () => {
    if (!editForm.liveUrl) {
      alert("Please enter a Live URL first.");
      return;
    }
    try {
      setCapturingScreenshot(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/screenshot", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: editForm.liveUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to capture");
      setEditForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
    } catch (err: any) {
      alert(`✕ ${err.message}`);
    } finally {
      setCapturingScreenshot(false);
    }
  };

  const handleCaptureScreenshotRow = async (project: Project) => {
    const targetUrl = project.liveUrl || project.githubUrl;
    if (!targetUrl) {
      alert("No URL available to capture.");
      return;
    }
    try {
      setCapturingRow(project.id);
      setActionMsg(`Capturing screenshot for "${project.title}"... (Takes ~5-8s)`);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/screenshot", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to capture");
      
      // Save directly to Firestore
      await fetch("/api/projects", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: project.id, imageUrl: data.imageUrl }),
      });

      setActionMsg(`✓ Screenshot captured and saved for "${project.title}"!`);
    } catch (err: any) {
      setActionMsg(`✕ ${err.message}`);
    } finally {
      setCapturingRow(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ borderRadius: "16px", height: "100px", background: "rgba(12,13,18,0.6)", border: "1px solid rgba(242,244,255,0.06)", animation: "shimmer 1.6s ease-in-out infinite" }} />
        ))}
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "24px", fontWeight: 800, color: "var(--white)", marginBottom: "8px" }}>
            Projects
          </h2>
          <p style={{ color: "rgba(242,244,255,0.35)", fontSize: "13px" }}>
            Manage your GitHub repositories. Generate AI content and publish to your portfolio.
          </p>
        </div>
        <button 
          onClick={() => { setIsCreatingCustom(true); setEditForm({}); }}
          style={{ padding: "10px 16px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #5B6EFF, #7B8FFF)", color: "#fff", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-dm)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >
          + Custom Project
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {TABS.map((tab) => {
          const count = projects.filter((p) => p.status === tab.key).length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "8px 16px", borderRadius: "10px", border: "none",
                background: isActive ? `${tab.accent}20` : "rgba(242,244,255,0.04)",
                color: isActive ? tab.accent : "rgba(242,244,255,0.4)",
                fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-mono)",
                cursor: "pointer", transition: "all 0.2s",
                outline: isActive ? `1px solid ${tab.accent}40` : "1px solid transparent",
              }}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Status message */}
      {actionMsg && (
        <div style={{
          marginBottom: "16px", padding: "10px 14px", borderRadius: "10px",
          fontSize: "12px", fontFamily: "var(--font-mono)",
          color: actionMsg.startsWith("✕") ? "#FF4D6D" : "#00E5A0",
          background: actionMsg.startsWith("✕") ? "rgba(255,77,109,0.08)" : "rgba(0,229,160,0.08)",
          border: actionMsg.startsWith("✕") ? "1px solid rgba(255,77,109,0.2)" : "1px solid rgba(0,229,160,0.2)",
        }}>
          {actionMsg}
        </div>
      )}

      {/* Project list */}
      {filteredProjects.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "300px", borderRadius: "16px", background: "rgba(12,13,18,0.5)",
          border: "1px dashed rgba(242,244,255,0.08)", textAlign: "center", padding: "40px",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: 700, color: "var(--white)", marginBottom: "6px" }}>
            No {activeTab} projects
          </h3>
          <p style={{ color: "rgba(242,244,255,0.3)", fontSize: "13px" }}>
            {activeTab === "imported"
              ? "Click 'Sync Latest Projects' on the Dashboard to import your GitHub repos."
              : activeTab === "pending"
              ? "Generate AI content for imported repos to move them here."
              : activeTab === "approved"
              ? "Approve pending projects to make them live on your portfolio."
              : "No rejected projects."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              style={{
                borderRadius: "14px", padding: "20px",
                background: "rgba(12,13,18,0.7)",
                border: "1px solid rgba(242,244,255,0.06)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                {/* Left side — info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <h3 style={{
                      fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: 700,
                      color: "var(--white)", margin: 0,
                    }}>
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: "rgba(91,110,255,0.15)", color: "#7B8FFF", fontFamily: "var(--font-mono)" }}>
                        FEATURED
                      </span>
                    )}
                    {project.isPrivate && (
                      <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: "rgba(245,166,35,0.15)", color: "#F5A623", fontFamily: "var(--font-mono)" }}>
                        PRIVATE
                      </span>
                    )}
                    {project.stars ? (
                      <span style={{ fontSize: "11px", color: "rgba(242,244,255,0.3)", fontFamily: "var(--font-mono)" }}>
                        ⭐ {project.stars}
                      </span>
                    ) : null}
                  </div>

                  <p style={{ color: "rgba(242,244,255,0.35)", fontSize: "12px", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                    {project.description || "No description available."}
                  </p>

                  {project.techStack?.length > 0 && (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
                      {project.techStack.map((t) => (
                        <span key={t} style={{
                          fontSize: "10px", padding: "2px 8px", borderRadius: "6px",
                          background: "rgba(91,110,255,0.1)", color: "#7B8FFF",
                          fontFamily: "var(--font-mono)",
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ color: "rgba(242,244,255,0.3)", textDecoration: "none" }}>
                        GitHub ↗
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ color: "rgba(0,229,160,0.6)", textDecoration: "none" }}>
                        Live ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Right side — image preview */}
                {project.imageUrl && (
                  <div style={{
                    width: "120px", height: "75px", borderRadius: "8px", overflow: "hidden",
                    border: "1px solid rgba(242,244,255,0.06)", flexShrink: 0,
                  }}>
                    <img src={project.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
                {activeTab === "imported" && (
                  <>
                    <button
                      onClick={() => handleGenerateAndPublish(project)}
                      disabled={generating === project.id || capturingRow === project.id}
                      style={{
                        padding: "7px 14px", borderRadius: "8px", border: "none",
                        background: generating === project.id ? "rgba(242,244,255,0.08)" : "linear-gradient(135deg, #5B6EFF, #7B8FFF)",
                        color: "#fff", fontSize: "11px", fontWeight: 700,
                        fontFamily: "var(--font-dm)", cursor: (generating === project.id || capturingRow === project.id) ? "not-allowed" : "pointer",
                        opacity: (generating === project.id || capturingRow === project.id) ? 0.6 : 1,
                        boxShadow: generating === project.id ? "none" : "0 0 16px rgba(91,110,255,0.3)",
                        display: "flex", alignItems: "center", gap: "6px",
                      }}
                    >
                      {generating === project.id ? (
                        <><div style={{ width: "10px", height: "10px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Generating...</>
                      ) : (
                        <>✨ Generate AI Content</>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleCaptureScreenshotRow(project)}
                      disabled={capturingRow === project.id || generating === project.id}
                      style={{
                        padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(0,229,160,0.4)",
                        background: capturingRow === project.id ? "rgba(0,229,160,0.05)" : "rgba(0,229,160,0.1)",
                        color: "#00E5A0", fontSize: "11px", fontWeight: 700,
                        fontFamily: "var(--font-dm)", cursor: (capturingRow === project.id || generating === project.id) ? "not-allowed" : "pointer",
                        opacity: (capturingRow === project.id || generating === project.id) ? 0.6 : 1,
                        display: "flex", alignItems: "center", gap: "6px",
                      }}
                    >
                      {capturingRow === project.id ? "Capturing..." : "📷 Capture Screenshot"}
                    </button>
                  </>
                )}

                {activeTab === "pending" && (
                  <>
                    <button onClick={() => openEditModal(project)} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "rgba(0,229,160,0.15)", color: "#00E5A0", fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-dm)", cursor: "pointer" }}>
                      ✓ Review & Publish
                    </button>
                    <button
                      onClick={() => handleCaptureScreenshotRow(project)}
                      disabled={capturingRow === project.id}
                      style={{
                        padding: "7px 14px", borderRadius: "8px", border: "none",
                        background: "rgba(91,110,255,0.1)", color: "#7B8FFF", fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-dm)", 
                        cursor: capturingRow === project.id ? "not-allowed" : "pointer", opacity: capturingRow === project.id ? 0.6 : 1
                      }}
                    >
                      {capturingRow === project.id ? "Capturing..." : "📷 Retake Screenshot"}
                    </button>
                    <button onClick={() => handleStatusChange(project.id, "rejected")} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "rgba(255,77,109,0.1)", color: "#FF4D6D", fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-dm)", cursor: "pointer" }}>
                      ✕ Reject
                    </button>
                  </>
                )}

                {activeTab === "approved" && (
                  <>
                    <button onClick={() => openEditModal(project)} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "rgba(242,244,255,0.08)", color: "rgba(242,244,255,0.7)", fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-dm)", cursor: "pointer" }}>
                      Edit
                    </button>
                    <button onClick={() => handleStatusChange(project.id, "pending")} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "rgba(245,166,35,0.1)", color: "#F5A623", fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-dm)", cursor: "pointer" }}>
                      ↩ Unpublish
                    </button>
                  </>
                )}

                {activeTab === "rejected" && (
                  <button onClick={() => handleStatusChange(project.id, "imported")} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "rgba(91,110,255,0.1)", color: "#7B8FFF", fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-dm)", cursor: "pointer" }}>
                    ↩ Re-import
                  </button>
                )}

                <button onClick={() => handleDelete(project.id)} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "rgba(242,244,255,0.04)", color: "rgba(242,244,255,0.3)", fontSize: "11px", fontWeight: 600, fontFamily: "var(--font-dm)", cursor: "pointer" }}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL OVERLAY */}
      {(editingProject || isCreatingCustom) && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(6,6,8,0.8)", backdropFilter: "blur(8px)", padding: "24px"
        }}>
          <div style={{
            background: "#0c0d12", width: "100%", maxWidth: "600px", borderRadius: "20px",
            border: "1px solid rgba(242,244,255,0.1)", display: "flex", flexDirection: "column", maxHeight: "90vh"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(242,244,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontFamily: "var(--font-syne)", fontSize: "18px", color: "#F2F4FF" }}>
                {isCreatingCustom ? "Create Custom Project" : `Review Project: ${editingProject?.title}`}
              </h3>
              <button onClick={closeEditModal} style={{ background: "none", border: "none", color: "rgba(242,244,255,0.4)", cursor: "pointer", fontSize: "20px" }}>×</button>
            </div>
            
            <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "11px", color: "rgba(242,244,255,0.4)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>Title</label>
                  <input 
                    type="text" value={editForm.title || ""} 
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "rgba(242,244,255,0.03)", border: "1px solid rgba(242,244,255,0.1)", borderRadius: "8px", color: "#F2F4FF", fontFamily: "var(--font-dm)", outline: "none" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "11px", color: "rgba(242,244,255,0.4)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>Tagline</label>
                  <input 
                    type="text" value={editForm.tagline || ""} 
                    onChange={e => setEditForm({ ...editForm, tagline: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "rgba(242,244,255,0.03)", border: "1px solid rgba(242,244,255,0.1)", borderRadius: "8px", color: "#F2F4FF", fontFamily: "var(--font-dm)", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "rgba(242,244,255,0.4)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>Description</label>
                <textarea 
                  rows={4} value={editForm.description || ""} 
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", background: "rgba(242,244,255,0.03)", border: "1px solid rgba(242,244,255,0.1)", borderRadius: "8px", color: "#F2F4FF", fontFamily: "var(--font-dm)", outline: "none", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "11px", color: "rgba(242,244,255,0.4)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>GitHub URL</label>
                  <input 
                    type="text" value={editForm.githubUrl || ""} 
                    onChange={e => setEditForm({ ...editForm, githubUrl: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "rgba(242,244,255,0.03)", border: "1px solid rgba(242,244,255,0.1)", borderRadius: "8px", color: "#F2F4FF", fontFamily: "var(--font-dm)", outline: "none" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "11px", color: "rgba(242,244,255,0.4)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>Live URL</label>
                  <input 
                    type="text" value={editForm.liveUrl || ""} 
                    onChange={e => setEditForm({ ...editForm, liveUrl: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "rgba(242,244,255,0.03)", border: "1px solid rgba(242,244,255,0.1)", borderRadius: "8px", color: "#F2F4FF", fontFamily: "var(--font-dm)", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(242,244,255,0.4)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
                  <span>Image URL (Screenshot)</span>
                  <button 
                    onClick={handleCaptureScreenshot} 
                    disabled={capturingScreenshot}
                    style={{ background: "none", border: "none", color: "#00E5A0", cursor: capturingScreenshot ? "wait" : "pointer", fontSize: "11px", fontFamily: "var(--font-mono)", padding: 0 }}
                  >
                    {capturingScreenshot ? "Capturing..." : "📷 Capture from Live URL"}
                  </button>
                </label>
                <input 
                  type="text" value={editForm.imageUrl || ""} 
                  onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", background: "rgba(242,244,255,0.03)", border: "1px solid rgba(242,244,255,0.1)", borderRadius: "8px", color: "#F2F4FF", fontFamily: "var(--font-dm)", outline: "none" }}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "rgba(242,244,255,0.4)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>Tech Stack (comma separated)</label>
                <input 
                  type="text" value={Array.isArray(editForm.techStack) ? editForm.techStack.join(", ") : editForm.techStack || ""} 
                  onChange={e => setEditForm({ ...editForm, techStack: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  style={{ width: "100%", padding: "10px 12px", background: "rgba(242,244,255,0.03)", border: "1px solid rgba(242,244,255,0.1)", borderRadius: "8px", color: "#F2F4FF", fontFamily: "var(--font-dm)", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "rgba(242,244,255,0.4)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>Metrics / Features (comma separated)</label>
                <input 
                  type="text" value={Array.isArray(editForm.features) ? editForm.features.join(", ") : editForm.features || ""} 
                  onChange={e => setEditForm({ ...editForm, features: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  style={{ width: "100%", padding: "10px 12px", background: "rgba(242,244,255,0.03)", border: "1px solid rgba(242,244,255,0.1)", borderRadius: "8px", color: "#F2F4FF", fontFamily: "var(--font-dm)", outline: "none" }}
                  placeholder="e.g. 92% Accuracy, 3-level Stages, < 2s Response"
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "8px" }}>
                <input 
                  type="checkbox" 
                  checked={editForm.featured || false} 
                  onChange={e => setEditForm({ ...editForm, featured: e.target.checked })} 
                  style={{ accentColor: "#5B6EFF", width: "16px", height: "16px" }}
                />
                <span style={{ fontSize: "13px", color: "#F2F4FF", fontFamily: "var(--font-dm)" }}>
                  Featured Project (Display large row mockup)
                </span>
              </label>

            </div>

            <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(242,244,255,0.06)", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => saveProjectEdits(false)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(242,244,255,0.1)", background: "rgba(242,244,255,0.03)", color: "rgba(242,244,255,0.7)", fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-dm)", cursor: "pointer" }}>
                Save Draft
              </button>
              <button onClick={() => saveProjectEdits(true)} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #00E5A0, #00B880)", color: "#060608", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-dm)", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,229,160,0.3)" }}>
                Publish (Go Live)
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
