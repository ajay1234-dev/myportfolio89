"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Skill {
  name: string;
  level: number;
  years: number;
}

interface DatacenterNode {
  id: string;
  region: string;
  provider: string;
  category: string;
  description: string;
  color: string;
  skills: Skill[];
}

interface SkillPanelProps {
  node: DatacenterNode | null;
  onClose: () => void;
}

export default function SkillPanel({ node, onClose }: SkillPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {node && (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, x: 20, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="skill-panel glass"
          style={{
            width: "320px",
            background: "rgba(6, 6, 8, 0.94)",
            border: `1px solid ${node.color}55`,
            borderRadius: "20px",
            padding: "28px",
            backdropFilter: "blur(20px)",
            boxShadow: `0 0 40px ${node.color}1e`,
            maxHeight: "100%",
            overflowY: "auto"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: node.color }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: node.color }}>
                {node.provider}
              </span>
            </div>
            <button 
              onClick={onClose}
              style={{ 
                background: "none", 
                border: "none", 
                color: "rgba(242,244,255,0.4)", 
                cursor: "pointer", 
                fontSize: "20px",
                padding: "0",
                lineHeight: "1"
              }}
            >
              ×
            </button>
          </div>

          <h3 style={{ 
            fontFamily: "var(--font-syne)", 
            fontSize: "22px", 
            fontWeight: 700, 
            color: "#F2F4FF", 
            marginTop: "10px" 
          }}>
            {node.region}
          </h3>
          <p style={{ 
            fontFamily: "var(--font-dm)", 
            fontSize: "14px", 
            fontWeight: 500, 
            color: node.color, 
            marginTop: "4px" 
          }}>
            {node.category}
          </p>
          <p style={{ 
            fontFamily: "var(--font-dm)", 
            fontSize: "13px", 
            fontWeight: 300, 
            color: "rgba(242,244,255,0.55)", 
            marginTop: "8px", 
            lineHeight: 1.6 
          }}>
            {node.description}
          </p>

          <div style={{ height: "1px", background: "rgba(242,244,255,0.08)", margin: "20px 0" }} />

          {/* Skills List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {node.skills.map((skill, i) => (
              <div key={skill.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "var(--font-dm)", fontSize: "14px", fontWeight: 500, color: "#F2F4FF" }}>
                    {skill.name}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: node.color }}>
                    {skill.level}%
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: "4px", borderRadius: "99px", background: "rgba(242,244,255,0.06)", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                    style={{ 
                      height: "100%", 
                      background: `linear-gradient(90deg, ${node.color}, ${node.color}AA)`,
                      borderRadius: "99px"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: "1px", background: "rgba(242,244,255,0.08)", margin: "20px 0" }} />

          {/* Footer stats */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
             <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(242,244,255,0.35)" }}>
               {node.skills.length} TECHNOLOGIES
             </span>
             <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(242,244,255,0.35)" }}>
               READY TO SCALE
             </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
