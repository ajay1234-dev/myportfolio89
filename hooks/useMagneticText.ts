"use client";
import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

export function useMagneticText() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLSpanElement>("[data-magnetic]");
    const handlers: Array<{ el: HTMLSpanElement; enter: () => void; leave: () => void; move: (e: MouseEvent) => void }> = [];

    words.forEach((word) => {
      let rect = { x: 0, y: 0, w: 0, h: 0 };
      let rafId = 0;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let isHovering = false;
      let springAnim: any = null;

      const updateRect = () => {
        const r = word.getBoundingClientRect();
        rect.x = r.left + r.width / 2;
        rect.y = r.top + r.height / 2;
        rect.w = r.width;
        rect.h = r.height;
      };

      const render = () => {
        if (!isHovering) return;
        
        currentX += (targetX - currentX) * 0.18; // Lerp factor 0.18
        currentY += (targetY - currentY) * 0.18;
        
        word.style.transform = `translate(${currentX}px, ${currentY}px)`;
        rafId = requestAnimationFrame(render);
      };

      const onEnter = () => {
        isHovering = true;
        if (springAnim) springAnim.stop();
        updateRect();
        render();
      };

      const onMove = (e: MouseEvent) => {
        updateRect(); // Recalculate in case of scroll
        const dx = e.clientX - rect.x;
        const dy = e.clientY - rect.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 100;

        if (dist < maxDist && dist > 0) {
          const force = (maxDist - dist) / maxDist;
          targetX = (dx / dist) * force * 12;
          targetY = (dy / dist) * force * 12;
        } else {
          targetX = 0;
          targetY = 0;
        }
      };

      const onLeave = () => {
        isHovering = false;
        targetX = 0;
        targetY = 0;
        cancelAnimationFrame(rafId);
        
        // Spring back using framer-motion physical spring
        springAnim = animate(word, { x: 0, y: 0 }, {
          type: "spring",
          stiffness: 180,
          damping: 20,
          onUpdate: (latest) => {
            currentX = latest.x;
            currentY = latest.y;
          }
        });
      };

      // We attach mousemove to window to feel truly magnetic even slightly outside element
      word.addEventListener("mouseenter", onEnter);
      word.addEventListener("mouseleave", onLeave);
      window.addEventListener("mousemove", onMove);

      handlers.push({ el: word, enter: onEnter, leave: onLeave, move: onMove });
    });

    return () => {
      handlers.forEach(({ el, enter, leave, move }) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
        window.removeEventListener("mousemove", move);
      });
    };
  }, []);

  return ref;
}
