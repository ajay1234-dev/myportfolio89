"use client";
import { useEffect, useRef } from "react";

export function useScrollVelocity() {
  const velocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const handler = () => {
      const now = Date.now();
      const dt = now - lastTime.current;
      const dy = window.scrollY - lastY.current;
      velocity.current = dt > 0 ? dy / dt : 0;
      lastY.current = window.scrollY;
      lastTime.current = now;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return velocity;
}
