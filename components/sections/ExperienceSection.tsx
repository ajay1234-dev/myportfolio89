'use client';

import { experiences } from "@/data/experience";

export default function ExperienceSection() {
  return (
    <section id="experience" className="experience" data-section-name="EXPERIENCE" style={{ position: 'relative', background: '#060608', paddingBottom: '120px' }}>
      
      {/* HEADER */}
      <div style={{ padding: '120px clamp(24px,5vw,80px) 60px', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.14em', marginBottom: '16px', textTransform: 'uppercase' }}>
            05 — UPTIME LOG
          </p>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(40px,5vw,80px)', color: '#F2F4FF', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Experience.
          </h2>
        </div>
      </div>

      {/* VERTICAL TIMELINE */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 80px)', position: 'relative' }}>
        
        {/* The vertical glowing line */}
        <div 
          className="timeline-track"
          style={{ 
            position: 'absolute', 
            top: '0', 
            bottom: '0', 
            left: 'clamp(16px, 5vw, 80px)', 
            width: '2px', 
            background: 'linear-gradient(180deg, transparent, rgba(242,244,255,0.1) 10%, rgba(242,244,255,0.1) 90%, transparent)',
            marginLeft: '7px' // Center line under the 16px dots
          }} 
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {experiences.map((exp, idx) => (
            <div key={exp.id} className="timeline-item" style={{ display: 'flex', position: 'relative', gap: 'clamp(24px, 4vw, 48px)' }}>
              
              {/* Timeline Node Dot */}
              <div 
                className="timeline-node"
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  background: 'var(--accent)', 
                  border: '4px solid #060608', 
                  boxShadow: '0 0 16px var(--accent)',
                  position: 'absolute',
                  left: '0',
                  top: '32px',
                  zIndex: 2,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }} 
              />

              {/* Left Side Spacer (Desktop Only) */}
              <div className="timeline-year-desktop" style={{ width: '140px', flexShrink: 0, paddingTop: '28px', textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'rgba(242,244,255,0.5)', fontWeight: 500 }}>
                  {exp.years}
                </span>
              </div>

              {/* Experience Card */}
              <div 
                className="experience-card"
                style={{ 
                  flex: 1, 
                  background: 'rgba(12, 13, 18, 0.6)', 
                  border: '1px solid rgba(242,244,255,0.06)', 
                  borderRadius: '24px', 
                  padding: 'clamp(24px, 4vw, 40px)', 
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  cursor: 'default'
                }}
              >
                {/* Mobile Year */}
                <div className="timeline-year-mobile" style={{ marginBottom: '16px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', background: 'rgba(91, 110, 255, 0.1)', padding: '4px 12px', borderRadius: '99px' }}>
                    {exp.years}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(24px, 3vw, 32px)', color: '#F2F4FF', marginBottom: '8px' }}>
                  {exp.role}
                </h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'rgba(242,244,255,0.6)', marginBottom: '24px', letterSpacing: '0.05em' }}>
                  @ {exp.company}
                </p>

                <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 300, fontSize: '15px', color: 'rgba(242,244,255,0.7)', lineHeight: 1.7, marginBottom: '24px' }}>
                  {exp.description}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {exp.wins.map((win, i) => (
                    <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--green)', fontSize: '14px', marginTop: '2px' }}>✓</span>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 300, fontSize: '14px', color: 'rgba(242,244,255,0.5)', lineHeight: 1.5 }}>
                        {win}
                      </span>
                    </li>
                  ))}
                </ul>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {exp.tech.map((t) => (
                    <span key={t} style={{ background: 'rgba(242,244,255,0.03)', border: '1px solid rgba(242,244,255,0.05)', borderRadius: '6px', padding: '6px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(242,244,255,0.6)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html:`
        .experience-card:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 12px 40px rgba(0,0,0,0.5); 
          border-color: rgba(242,244,255,0.12) !important; 
        }
        .experience-card:hover ~ .timeline-node,
        .timeline-item:hover .timeline-node {
          transform: scale(1.3);
          box-shadow: 0 0 24px var(--accent);
          background: #F2F4FF;
        }

        /* Mobile Adjustments */
        @media (min-width: 769px) {
          .timeline-year-mobile { display: none; }
          .timeline-track { left: calc(clamp(16px, 5vw, 80px) + 140px + clamp(24px, 4vw, 48px) / 2) !important; margin-left: -1px !important; }
          .timeline-node { left: calc(140px + clamp(24px, 4vw, 48px) / 2 - 8px) !important; }
        }

        @media (max-width: 768px) {
          .timeline-year-desktop { display: none !important; }
          .timeline-track { left: clamp(16px, 5vw, 80px) !important; margin-left: 7px !important; }
          .timeline-node { left: 0 !important; }
          .timeline-item { padding-left: 32px; } /* Space for dot and line on mobile */
        }
      `}} />
    </section>
  );
}
