"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { datacenterNodes } from "@/data/skills";
import GlobeSkillsCanvas from "../GlobeSkillsCanvas";
import SkillPanel from "../SkillPanel";

export default function SkillsSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rotationY, setRotationY] = useState(0);

  const selectedNode = datacenterNodes.find(n => n.id === selectedId) || null;

  return (
    <section 
      id="skills" 
      className="skills section--no-pad" 
      data-section-name="04 — SKILLS"
      style={{ 
        background: "#060608", 
        padding: "120px 0 80px 0",
        overflow: "hidden"
      }}
    >
      <div className="container" style={{ paddingInline: "clamp(24px, 5vw, 80px)", marginBottom: "64px" }}>
        <p style={{ 
          fontFamily: "var(--font-mono)", 
          fontSize: "12px", 
          color: "#5B6EFF", 
          letterSpacing: "0.14em", 
          marginBottom: "16px",
          textTransform: "uppercase"
        }}>
          04 — SKILLS
        </p>
        <h2 style={{ 
          fontFamily: "var(--font-syne)", 
          fontWeight: 700, 
          fontSize: "clamp(40px, 5vw, 64px)", 
          color: "#F2F4FF",
          letterSpacing: "-0.02em",
          marginBottom: "12px"
        }}>
          Global Infrastructure
        </h2>
        <p style={{
          fontFamily: "var(--font-dm)",
          fontSize: "16px",
          fontWeight: 300,
          color: "rgba(242, 244, 255, 0.55)",
          maxWidth: "480px",
          lineHeight: 1.6
        }}>
          Click any datacenter node to explore the technology stack deployed in that region.
        </p>
      </div>

      <div className="container" style={{ paddingInline: "clamp(24px, 5vw, 80px)" }}>
        <div className="skills__layout" style={{ 
          display: "flex", 
          gap: "48px", 
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Globe Wrapper */}
          <div style={{ 
            flex: 1, 
            minWidth: 0, 
            maxWidth: "600px", 
            aspectRatio: "1", 
            position: "relative" 
          }}>
            <GlobeSkillsCanvas 
              rotationY={rotationY} 
              onRotationChange={setRotationY}
              selectedId={selectedId}
              onNodeClick={setSelectedId}
            />
          </div>

          {/* Panel Wrapper */}
          <div className="skills-panel-wrapper" style={{ 
            width: "320px", 
            flexShrink: 0, 
            minHeight: "440px",
            display: "flex",
            alignItems: "center"
          }}>
            <AnimatePresence mode="wait">
              {!selectedId ? (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    color: "rgba(242, 244, 255, 0.2)"
                  }}
                >
                  <motion.div
                    animate={{ x: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    style={{ marginBottom: "12px", fontSize: "24px" }}
                  >
                    ←
                  </motion.div>
                  Click a glowing node<br />to explore skills
                </motion.div>
              ) : (
                <SkillPanel 
                  key="panel"
                  node={selectedNode} 
                  onClose={() => setSelectedId(null)} 
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Legend buttons */}
        <div style={{ 
          marginTop: "40px", 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "12px" 
        }}>
          {datacenterNodes.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedId(node.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: selectedId === node.id ? `${node.color}22` : "transparent",
                border: "1px solid",
                borderColor: selectedId === node.id ? node.color : "rgba(242, 244, 255, 0.10)",
                borderRadius: "99px",
                padding: "8px 16px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: node.color }} />
              <span style={{ 
                fontFamily: "var(--font-dm)", 
                fontSize: "12px", 
                fontWeight: 500, 
                color: "#F2F4FF" 
              }}>
                {node.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .skills__layout {
            flex-direction: column !important;
            align-items: center !important;
          }
          .skills__layout > div {
            width: 100% !important;
            max-width: 500px !important;
          }
          .skills-panel-wrapper {
            min-height: auto !important;
            margin-top: -24px;
          }
        }
      `}</style>
    </section>
  );
}
