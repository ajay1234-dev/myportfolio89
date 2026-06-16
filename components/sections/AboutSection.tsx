'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: "easeOut" as const
    }
  })
}

export default function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    margin: '-100px' 
  })

  return (
    <section
      id="about"
      ref={ref}
      data-section-name="02 — ABOUT"
      style={{
        background: '#080D1A',
        minHeight: '100vh',
        padding: 'clamp(80px,10vw,140px) clamp(24px,5vw,80px)',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div style={{ 
        maxWidth: 1100, 
        margin: '0 auto', 
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: 64,
        alignItems: 'start'
      }}>

        {/* LEFT COLUMN */}
        <div>
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 12,
              color: 'var(--accent)',
              letterSpacing: '0.14em',
              marginBottom: 16,
              textTransform: 'uppercase'
            }}
          >
            02 — About
          </motion.p>

          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 700,
              fontSize: 'clamp(36px,4.5vw,60px)',
              color: '#F2F4FF',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 32
            }}
          >
            The Engineer<br />Behind the Stack
          </motion.h2>

          {/* STAT CARDS */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 100px), 1fr))', 
            gap: 16 
          }}>
            {[
              { value: '3+', label: 'Years' },
              { value: '8',  label: 'Projects' },
              { value: '12', label: 'Regions' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i + 3}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                style={{
                  background: 'rgba(242,244,255,0.04)',
                  border: '1px solid rgba(242,244,255,0.08)',
                  borderRadius: 14,
                  padding: '20px 16px',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 700,
                  fontSize: 36,
                  color: '#F2F4FF',
                  lineHeight: 1
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 13,
                  color: 'rgba(242,244,255,0.45)',
                  marginTop: 6
                }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 300,
              fontSize: 17,
              color: 'rgba(242,244,255,0.65)',
              lineHeight: 1.8,
              marginBottom: 32
            }}
          >
            I am a Full Stack Developer and Cloud Engineer 
            with 3+ years of experience building scalable 
            systems and shipping products used globally. 
            I specialise in cloud-native architecture, 
            DevOps pipelines, and modern web applications.
          </motion.p>

          <hr style={{
            border: 'none',
            borderTop: '1px solid rgba(242,244,255,0.08)',
            marginBottom: 32
          }} />

          {/* BELIEF STATEMENTS */}
          {[
            '— Automate the boring. Build the meaningful.',
            '— Infrastructure is a product, not an afterthought.',
            '— Clean code is a form of respect.'
          ].map((belief, i) => (
            <motion.p
              key={i}
              custom={i + 6}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 600,
                fontSize: 'clamp(16px,1.8vw,20px)',
                color: '#F2F4FF',
                marginBottom: 20,
                lineHeight: 1.4
              }}
            >
              <span style={{ color: 'var(--accent)' }}>
                {belief.slice(0,1)}
              </span>
              {belief.slice(1)}
            </motion.p>
          ))}
        </div>

      </div>
    </section>
  )
}
