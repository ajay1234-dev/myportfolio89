"use client";
import { useEffect, useRef } from "react";
import { perlin } from "@/lib/perlinNoise";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const scrollRef = useRef(0);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init particles
    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 25 : 55; // Reduced for smooth performance
    particlesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: 1.5 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.4,
      noiseOffsetX: Math.random() * 100,
      noiseOffsetY: Math.random() * 100,
    }));

    // Throttle mousemove to 60fps max (16ms)
    let lastMoveTime = 0;
    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveTime < 16) return;
      lastMoveTime = now;
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const CONNECT_DIST = 100;
    const REPEL_DIST = 110;

    let isVisible = true;
    let frameCount = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      
      // Pause rendering entirely if scrolled out of view
      if (!isVisible) return;

      // On mobile: skip every other frame (30fps is fine for particles)
      frameCount++;
      if (isMobile && frameCount % 2 !== 0) return;
      
      const h = window.innerHeight;
      let multiplier = 1;
      if (scrollRef.current > 0) {
        multiplier = 1 + (scrollRef.current / h) * 1.5;
        if (multiplier > 2.5) multiplier = 2.5;
      }
      
      timeRef.current += 0.003 * multiplier;

      ctx.clearRect(0, 0, W, H);

      ctx.save();

      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Perlin noise flow field
        const angle = perlin.noise(
          p.x * 0.003 + p.noiseOffsetX + timeRef.current,
          p.y * 0.003 + p.noiseOffsetY + timeRef.current
        ) * Math.PI * 4;

        p.vx += Math.cos(angle) * 0.02;
        p.vy += Math.sin(angle) * 0.02;

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_DIST && dist > 0) {
          const force = (REPEL_DIST - dist) / REPEL_DIST;
          p.vx += (dx / dist) * force * 1.5;
          p.vy += (dy / dist) * force * 1.5;
        }

        // Damping
        p.vx *= 0.96;
        p.vy *= 0.96;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < -50) p.y = H + 50;
        if (p.y > H + 50) p.y = -50;
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          // OPTIMIZATION: Bounding box fast-fail before expensive Math.sqrt
          if (Math.abs(dx) > CONNECT_DIST) continue;
          
          const dy = particles[i].y - particles[j].y;
          if (Math.abs(dy) > CONNECT_DIST) continue;

          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.25;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(242,244,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242,244,255,${p.opacity})`;
        ctx.fill();
      }

      ctx.restore();
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
