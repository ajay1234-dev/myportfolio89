'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import ProjectMockup from '@/components/ProjectMockup';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

/**
 * UNIFIED PROJECT CARD
 * A clean, simple, and identical layout for every project.
 */
const ProjectCard = ({ project, index }: { project: any, index: number }) => {
  return (
    <div
      className="project-unified-card"
      style={{
        background: 'rgba(12, 13, 18, 0.6)',
        border: '1px solid rgba(242,244,255,0.06)',
        borderRadius: '24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Top: Mockup Area */}
      <div
        style={{
          width: '100%',
          height: '280px',
          background: `linear-gradient(135deg, ${project.color}40, ${project.color}10)`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(242,244,255,0.04)'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: project.color, filter: 'blur(100px)', opacity: 0.15 }} />
        
        <div style={{ width: '90%', height: '110%', transform: 'translateY(15%)' }}>
          <ProjectMockup type={project.type || 'browser'} color={project.color} image={project.image} />
        </div>

        {/* Badges */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: 'rgba(12,13,18,0.5)', backdropFilter: 'blur(10px)', color: 'rgba(242,244,255,0.6)', padding: '4px 10px', borderRadius: '99px', border: '1px solid rgba(242,244,255,0.1)' }}>
            {project.id}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: 'rgba(12,13,18,0.5)', backdropFilter: 'blur(10px)', color: project.color, padding: '4px 10px', borderRadius: '99px', border: '1px solid rgba(242,244,255,0.1)' }}>
            ● {project.status || 'LIVE'}
          </span>
        </div>
      </div>

      {/* Bottom: Info Area */}
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '28px', color: '#F2F4FF', marginBottom: '16px' }}>
          {project.name}
        </h3>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 300, fontSize: '14px', color: 'rgba(242,244,255,0.6)', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
          {project.description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '32px' }}>
          {project.tech?.map((tech: string) => (
            <span key={tech} style={{ background: 'rgba(242,244,255,0.03)', border: '1px solid rgba(242,244,255,0.05)', borderRadius: '6px', padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(242,244,255,0.5)' }}>
              {tech}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', background: 'rgba(242,244,255,0.04)', border: '1px solid rgba(242,244,255,0.08)', borderRadius: '8px', padding: '10px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '13px', color: '#F2F4FF', transition: 'background 0.2s', textDecoration: 'none' }} className="hover-btn-dark">
              GitHub
            </a>
          )}
          {project.live && project.live !== project.github && (
            <a href={project.live} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', background: project.color, borderRadius: '8px', padding: '10px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '13px', color: '#060608', transition: 'filter 0.2s', textDecoration: 'none' }} className="hover-btn-color">
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProjectsSection() {
  const [dbProjects, setDbProjects] = useState<any[]>([]);

  useEffect(() => {
    try {
      const q = query(
        collection(db, 'projects'),
        where('status', '==', 'approved')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDbProjects(data);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase not initialized or query failed.", e);
    }
  }, []);

  const ACCENT_COLORS = ['#5B6EFF', '#c084fc', '#00E5A0', '#F5A623', '#FF4D6D', '#38bdf8', '#fb923c', '#a78bfa'];

  const liveMergedProjects = dbProjects.map((p, i) => ({
    id: `0${i + 1}`,
    name: p.title,
    tagline: p.tagline || p.description?.split('.')[0] || p.title,
    description: p.description,
    tech: p.techStack || [],
    github: p.githubUrl,
    live: p.liveUrl || p.githubUrl,
    image: p.imageUrl,
    color: ACCENT_COLORS[i % ACCENT_COLORS.length],
    region: p.liveUrl ? 'DEPLOYED' : 'GITHUB',
    status: p.liveUrl ? 'LIVE' : 'CODE',
    metrics: p.features?.length > 0
      ? p.features.map((f: string) => {
          const parts = f.split(' ');
          const value = parts[0];
          const label = parts.slice(1).join(' ') || 'Metric';
          return { value, label };
        })
      : [{ value: "NEW", label: "AUTO SYNCED" }],
  }));

  const allProjects = liveMergedProjects;

  return (
    <section id="projects" data-section-name="03 — PROJECTS" style={{ background: '#060608', position: 'relative', paddingBottom: '120px' }}>
      
      {/* HEADER */}
      <div style={{ padding: '120px clamp(24px,5vw,80px) 60px', maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.14em', marginBottom: '16px', textTransform: 'uppercase' }}>
            03 — SELECTED WORK
          </p>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(40px,5vw,80px)', color: '#F2F4FF', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            What I&apos;ve Built.
          </h2>
        </div>
        <div className="hidden md:block" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(242,244,255,0.4)', paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {allProjects.length} projects total
        </div>
      </div>

      {/* UNIFIED GRID */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 80px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '32px' }}>
          {allProjects.map((p, index) => (
            <ProjectCard key={p.name} project={p} index={index} />
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html:`
        .project-unified-card:hover { 
          transform: translateY(-8px) scale(1.01); 
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(91,110,255,0.1); 
          border-color: rgba(242,244,255,0.15) !important; 
        }
        .project-unified-card .hover-btn-dark:hover {
          background: rgba(242,244,255,0.1) !important;
          color: #fff !important;
        }
        .hover-btn-color:hover { filter: brightness(1.15); }
        
        @media (max-width: 768px) {
          .project-unified-card {
            border-radius: 16px !important;
          }
          .project-unified-card > div:first-child {
            height: 220px !important;
          }
        }
      `}} />

    </section>
  );
}
