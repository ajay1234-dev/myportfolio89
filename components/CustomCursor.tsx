"use client";
import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const ringPos = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const stateRef = useRef<"default" | "text" | "button" | "project" | "contact">("default");

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let lastTarget: HTMLElement | null = null;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

      // OPTIMIZATION: Only run expensive DOM traversal if the target element actually changed
      const target = e.target as HTMLElement;
      if (target === lastTarget) return;
      lastTarget = target;

      if (target.closest("[data-cursor='contact']")) {
        stateRef.current = "contact";
      } else if (target.closest("[data-cursor='project']")) {
        stateRef.current = "project";
      } else if (target.closest("button, a, [data-cursor='button']")) {
        stateRef.current = "button";
      } else if (target.closest("p, h1, h2, h3, span:not([data-cursor])")) {
        stateRef.current = "text";
      } else {
        stateRef.current = "default";
      }

      applyState();
    };

    const applyState = () => {
      const lbl = labelRef.current;
      const state = stateRef.current;
      ring.className = `cursor-ring cursor-ring--${state}`;
      if (lbl) lbl.textContent = state === "project" ? "VIEW" : "";
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.085);
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.085);
      ring.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
    };

    animate();
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring cursor-ring--default">
        <span ref={labelRef} className="cursor-label" />
      </div>
    </>
  );
}
