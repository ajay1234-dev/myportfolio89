'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ProjectMockup({ type, color, image }: { type: string; color: string; image?: string }) {
  const isTerminal = type === 'api';

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16/10',
        background: isTerminal ? '#050810' : '#0D1526',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(242,244,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          height: '32px',
          background: isTerminal ? '#1A1A2E' : '#151C2E',
          borderBottom: '1px solid rgba(242,244,255,0.06)',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {!isTerminal ? (
          <>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28CA41' }} />
            <div
              style={{
                flex: 1,
                margin: '0 16px',
                height: '18px',
                borderRadius: '4px',
                background: 'rgba(242,244,255,0.04)',
                border: '1px solid rgba(242,244,255,0.06)',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '9px',
                color: 'rgba(242,244,255,0.3)',
                textAlign: 'center',
                lineHeight: '16px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              example.com/{type.toLowerCase()}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(242,244,255,0.5)" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '10px', color: 'rgba(242,244,255,0.5)' }}>
              api-server
            </span>
          </div>
        )}
      </div>

      {/* SCREEN CONTENT */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt="Project Screenshot"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        ) : (
          <>
            {type === 'dashboard' && (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ width: '20%', background: 'rgba(242,244,255,0.02)', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '1px solid rgba(242,244,255,0.04)' }}>
              <div style={{ height: '16px', background: 'rgba(242,244,255,0.08)', borderRadius: '4px', marginBottom: '12px' }} />
              <div style={{ height: '8px', background: color, borderRadius: '2px', opacity: 0.8 }} />
              <div style={{ height: '8px', background: 'rgba(242,244,255,0.06)', borderRadius: '2px' }} />
              <div style={{ height: '8px', background: 'rgba(242,244,255,0.06)', borderRadius: '2px' }} />
              <div style={{ height: '8px', background: 'rgba(242,244,255,0.06)', borderRadius: '2px' }} />
            </div>
            <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '6px', background: 'rgba(242,244,255,0.1)', borderRadius: '2px' }} />
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: color }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ background: 'rgba(242,244,255,0.03)', border: '1px solid rgba(242,244,255,0.05)', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ width: '24px', height: '4px', background: 'rgba(242,244,255,0.2)', borderRadius: '2px' }} />
                    <div style={{ flex: 1, position: 'relative' }}>
                      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
                        <polyline points={i % 2 === 0 ? "0,30 20,20 40,35 60,10 80,25 100,5" : "0,20 20,30 40,15 60,35 80,10 100,25"} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === 'api' && (
          <div style={{ padding: '16px', fontFamily: 'var(--font-mono), monospace', fontSize: '9px', lineHeight: '1.8' }}>
            <motion.div
              animate={{ y: [0, -20, -40, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            >
              <div style={{ color: '#28CA41' }}>$ curl -X POST /api/v1/deploy</div>
              <div style={{ color: color }}>&gt; 200 OK {'{ status: \'success\' }'}</div>
              <div style={{ color: 'rgba(242,244,255,0.3)' }}>latency: 32ms · region: ap-south-1</div>
              <div style={{ color: '#28CA41', marginTop: '8px' }}>$ curl -X GET /api/v1/health</div>
              <div style={{ color: color }}>&gt; 200 OK {'{ status: \'healthy\' }'}</div>
              <div style={{ color: 'rgba(242,244,255,0.3)' }}>active_nodes: 42</div>
              <motion.div 
                animate={{ opacity: [1, 0, 1] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ width: '6px', height: '12px', background: 'rgba(242,244,255,0.8)', marginTop: '4px' }} 
              />
            </motion.div>
          </div>
        )}

        {type === 'infrastructure' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '32px', position: 'relative', zIndex: 2 }}>
              <div style={{ padding: '8px 12px', background: 'rgba(242,244,255,0.05)', border: `1px solid ${color}`, borderRadius: '6px', fontFamily: 'var(--font-mono), monospace', fontSize: '9px', color: '#fff' }}>Load Balancer</div>
            </div>
            <div style={{ width: '2px', height: '24px', background: `linear-gradient(to bottom, ${color}, transparent)` }} />
            <div style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 2 }}>
              <div style={{ padding: '8px 12px', background: 'rgba(242,244,255,0.05)', border: `1px solid ${color}44`, borderRadius: '6px', fontFamily: 'var(--font-mono), monospace', fontSize: '9px', color: '#fff' }}>API</div>
              <div style={{ padding: '8px 12px', background: 'rgba(242,244,255,0.05)', border: `1px solid ${color}44`, borderRadius: '6px', fontFamily: 'var(--font-mono), monospace', fontSize: '9px', color: '#fff' }}>API</div>
            </div>
            <div style={{ width: '2px', height: '24px', background: `linear-gradient(to bottom, transparent, ${color})` }} />
            <div style={{ display: 'flex', gap: '32px', position: 'relative', zIndex: 2 }}>
              <div style={{ padding: '8px 12px', background: 'rgba(242,244,255,0.05)', border: `1px solid ${color}`, borderRadius: '6px', fontFamily: 'var(--font-mono), monospace', fontSize: '9px', color: '#fff' }}>Database</div>
            </div>
            
            {/* Animated dot */}
            <motion.div
              style={{ width: '6px', height: '6px', background: color, borderRadius: '50%', position: 'absolute', top: '35%', filter: `drop-shadow(0 0 4px ${color})` }}
              animate={{ y: [0, 40, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </div>
        )}

        {type === 'monitoring' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              {['99.9%', '12ms', '420k'].map((val, i) => (
                <div key={i} style={{ background: 'rgba(242,244,255,0.03)', border: '1px solid rgba(242,244,255,0.05)', borderRadius: '4px', padding: '8px' }}>
                  <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '8px', color: 'rgba(242,244,255,0.4)', marginBottom: '4px' }}>METRIC {i+1}</div>
                  <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '12px', color: '#fff' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, background: 'rgba(242,244,255,0.02)', border: '1px solid rgba(242,244,255,0.05)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
              <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points="0,100 0,60 20,80 40,30 60,50 80,20 100,40 100,100" fill={`url(#grad-${type})`} />
                <polyline points="0,60 20,80 40,30 60,50 80,20 100,40" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}

        {type === 'platform' && (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ width: '50%', background: '#0A0A0A', borderRight: '1px solid rgba(242,244,255,0.06)', padding: '12px', fontFamily: 'var(--font-mono), monospace', fontSize: '9px', lineHeight: '1.6' }}>
              <div style={{ color: '#FF5F57' }}>import <span style={{ color: '#F2F4FF' }}>{'{'} useState {'}'}</span> from <span style={{ color: '#28CA41' }}>&apos;react&apos;</span>;</div>
              <div style={{ color: '#FF5F57', marginTop: '8px' }}>export default function <span style={{ color: '#FFBD2E' }}>App</span>() {'{'}</div>
              <div style={{ color: 'rgba(242,244,255,0.6)', paddingLeft: '12px' }}>const [state, setState] = useState(0);</div>
              <div style={{ color: '#FF5F57', paddingLeft: '12px', marginTop: '4px' }}>return (</div>
              <div style={{ color: color, paddingLeft: '24px' }}>&lt;div className=&quot;app&quot;&gt;</div>
              <div style={{ color: 'rgba(242,244,255,0.6)', paddingLeft: '36px' }}>Hello Platform</div>
              <div style={{ color: color, paddingLeft: '24px' }}>&lt;/div&gt;</div>
              <div style={{ color: '#FF5F57', paddingLeft: '12px' }}>);</div>
              <div style={{ color: '#FF5F57' }}>{'}'}</div>
            </div>
            <div style={{ width: '50%', background: 'rgba(242,244,255,0.02)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '80%', padding: '16px', background: 'rgba(242,244,255,0.05)', borderRadius: '8px', border: '1px solid rgba(242,244,255,0.1)', textAlign: 'center', color: '#fff', fontSize: '12px' }}>
                Hello Platform
                <div style={{ marginTop: '12px', width: '100%', height: '24px', background: color, borderRadius: '4px', opacity: 0.8 }} />
              </div>
            </div>
          </div>
        )}
        {type === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ width: '8px', height: '8px', background: color, borderRadius: '50%' }} />
              </motion.div>
              <div style={{ width: '60px', height: '40px', display: 'flex', alignItems: 'center' }}>
                 <div style={{ width: '100%', height: '2px', background: `linear-gradient(90deg, ${color}, transparent)` }} />
              </div>
              <div style={{ width: '80px', height: '40px', background: 'rgba(242,244,255,0.05)', borderRadius: '6px', border: '1px solid rgba(242,244,255,0.1)' }} />
            </div>
            
            <div style={{ width: '80%', height: '60px', background: 'rgba(242,244,255,0.02)', borderRadius: '8px', border: `1px solid rgba(242,244,255,0.05)`, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '40%', height: '6px', background: 'rgba(242,244,255,0.2)', borderRadius: '2px' }} />
              <div style={{ width: '100%', height: '6px', background: 'rgba(242,244,255,0.1)', borderRadius: '2px' }} />
              <div style={{ width: '80%', height: '6px', background: 'rgba(242,244,255,0.1)', borderRadius: '2px' }} />
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
