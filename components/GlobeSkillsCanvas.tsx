"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { datacenterNodes } from "@/data/skills";
import { dataLinks } from "@/data/dataLinks";
import { getWorldData } from "@/lib/worldData";
import { projectPoint } from "@/lib/projection";

interface GlobeSkillsCanvasProps {
  rotationY: number;
  onRotationChange: (val: number) => void;
  selectedId: string | null;
  onNodeClick: (id: string | null) => void;
}

export default function GlobeSkillsCanvas({
  selectedId,
  onNodeClick
}: GlobeSkillsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const landDataRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const countriesDataRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const rotationRef = useRef(0);
  const targetRotationRef = useRef<number | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startRotation = useRef(0);
  const visibleNodesRef = useRef<{ node: typeof datacenterNodes[number]; p: { x: number; y: number; z: number } }[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 200 Ambient stars
  const stars = useMemo(() => {
    const s = [];
    for (let i = 0; i < 200; i++) {
      s.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.3 + Math.random() * 0.7,
        opacity: 0.08 + Math.random() * 0.35
      });
    }
    return s;
  }, []);

  // Load World Data
  useEffect(() => {
    let cancelled = false;
    getWorldData().then(({ land, countries }) => {
      if (cancelled) return;
      landDataRef.current = land;
      countriesDataRef.current = countries;
      setDataLoaded(true);
    }).catch(err => {
      console.error('Failed to load world data:', err);
      setDataLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;

    let size = Math.min(container.clientWidth, 580);
    canvas.width = size;
    canvas.height = size;
    let cx = size / 2;
    let cy = size / 2;
    let radius = size * 0.42;

    const resize = () => {
      if (!container) return;
      size = Math.min(container.clientWidth, 580);
      canvas.width = size;
      canvas.height = size;
      cx = size / 2;
      cy = size / 2;
      radius = size * 0.42;
    };
    window.addEventListener("resize", resize);

    const roundRect = (
      ctx: CanvasRenderingContext2D,
      x: number, y: number,
      w: number, h: number,
      r: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const drawDataLinks = (
      ctx: CanvasRenderingContext2D,
      links: typeof dataLinks,
      nodes: typeof datacenterNodes,
      rotationDeg: number,
      cx: number,
      cy: number,
      radius: number,
      time: number,
      selectedNodeId: string | null,
      hoveredNodeId: string | null
    ) => {
      const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

      for (const link of links) {
        const fromNode = nodeMap[link.from];
        const toNode = nodeMap[link.to];
        if (!fromNode || !toNode) continue;

        const p1 = projectPoint(fromNode.lng, fromNode.lat, rotationDeg, cx, cy, radius);
        const p2 = projectPoint(toNode.lng, toNode.lat, rotationDeg, cx, cy, radius);

        if (p1.z < 0.05 || p2.z < 0.05) continue;

        const visAlpha = Math.min(p1.z, p2.z);
        if (visAlpha < 0.1) continue;

        const isActive = selectedNodeId === link.from || selectedNodeId === link.to ||
                         hoveredNodeId === link.from || hoveredNodeId === link.to;
        const isInactive = (selectedNodeId !== null || hoveredNodeId !== null) && !isActive;

        const baseAlpha = isInactive ? 0.08 : isActive ? 1.0 : link.trafficAlpha * 0.65;
        const finalAlpha = baseAlpha * visAlpha;

        const chord = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const lift  = chord * 0.35;
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const dlen = Math.hypot(dx, dy) || 1;
        const cpX = mx + (dx / dlen) * lift;
        const cpY = my + (dy / dlen) * lift;

        // ARC GLOW
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(cpX, cpY, p2.x, p2.y);
        ctx.strokeStyle = link.color + Math.round(finalAlpha * 0.3 * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = isActive ? 3.5 : 2;
        ctx.stroke();

        // ARC CORE
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(cpX, cpY, p2.x, p2.y);
        ctx.strokeStyle = link.color + Math.round(finalAlpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = isActive ? 1.2 : 0.8;
        ctx.stroke();

        // LABELS
        if (isActive && visAlpha > 0.5) {
          ctx.save();
          const labelX = cpX;
          const labelY = cpY - 10;
          ctx.font = '10px var(--font-mono)';
          const tw = ctx.measureText(link.latency).width;
          ctx.fillStyle = 'rgba(6,6,8,0.85)';
          roundRect(ctx, labelX - tw/2 - 8, labelY - 14, tw + 16, 18, 5);
          ctx.fill();
          ctx.strokeStyle = link.color + '66';
          ctx.stroke();
          ctx.fillStyle = link.color;
          ctx.textAlign = 'center';
          ctx.fillText(link.latency, labelX, labelY);
          const trafficColor = link.traffic === 'HIGH' ? '#00E5A0' : link.traffic === 'MED' ? '#F5A623' : '#FF4D6D';
          ctx.font = '9px var(--font-mono)';
          ctx.fillStyle = trafficColor;
          ctx.fillText(link.traffic, labelX, labelY + 18);
          ctx.restore();
        }

        // PACKETS
        for (let i = 0; i < link.packets; i++) {
          const offset = i / link.packets;
          const t = ((time * link.speed) + offset) % 1;
          const bx = (1-t)*(1-t)*p1.x + 2*(1-t)*t*cpX + t*t*p2.x;
          const by = (1-t)*(1-t)*p1.y + 2*(1-t)*t*cpY + t*t*p2.y;
          const pSize = isActive ? 3.5 : link.traffic === 'HIGH' ? 2.5 : link.traffic === 'MED' ? 2.0 : 1.5;

          const pGrd = ctx.createRadialGradient(bx, by, 0, bx, by, pSize * 4);
          pGrd.addColorStop(0, link.color + Math.round(finalAlpha * 0.9 * 255).toString(16).padStart(2, '0'));
          pGrd.addColorStop(1, 'transparent');
          ctx.fillStyle = pGrd;
          ctx.beginPath();
          ctx.arc(bx, by, pSize * 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(bx, by, pSize, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = finalAlpha;
          ctx.fill();
          ctx.globalAlpha = 1;

          for (let trail = 1; trail <= 3; trail++) {
            const tt = Math.max(0, t - trail * 0.025);
            const tx = (1-tt)*(1-tt)*p1.x + 2*(1-tt)*tt*cpX + tt*tt*p2.x;
            const ty = (1-tt)*(1-tt)*p1.y + 2*(1-tt)*tt*cpY + tt*tt*p2.y;
            ctx.beginPath();
            ctx.arc(tx, ty, pSize * (1 - trail*0.25), 0, Math.PI*2);
            ctx.fillStyle = link.color;
            ctx.globalAlpha = finalAlpha * (0.4 - trail*0.1);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      }
    };

    const drawRing = (
      ctx: CanvasRenderingContext2D,
      ring: number[][],
      rotationDeg: number,
      cx: number,
      cy: number,
      radius: number
    ) => {
      let penDown = false;
      for (let i = 0; i < ring.length; i++) {
        const [lon, lat] = ring[i];
        const curr = projectPoint(lon, lat, rotationDeg, cx, cy, radius);
        
        const nextIdx = (i + 1) % ring.length;
        const [nlon, nlat] = ring[nextIdx];
        const next = projectPoint(nlon, nlat, rotationDeg, cx, cy, radius);
        
        if (curr.z > 0) {
          if (!penDown) {
            ctx.moveTo(curr.x, curr.y);
            penDown = true;
          } else {
            const dist = Math.hypot(next.x - curr.x, next.y - curr.y);
            if (dist < radius * 0.5) {
              ctx.lineTo(curr.x, curr.y);
            } else {
              ctx.moveTo(curr.x, curr.y);
            }
          }
        } else {
          penDown = false;
        }
      }
    };

    const drawCountryOutlines = (
      ctx: CanvasRenderingContext2D,
      land: GeoJSON.FeatureCollection,
      countries: GeoJSON.FeatureCollection,
      rotationDeg: number,
      cx: number,
      cy: number,
      radius: number
    ) => {
      // LAND FILL
      ctx.beginPath();
      for (const feature of land.features) {
        const geom = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
        const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
        for (const polygon of polys) {
          for (const ring of polygon) {
            drawRing(ctx, ring, rotationDeg, cx, cy, radius);
          }
        }
      }
      ctx.fillStyle = 'rgba(14, 165, 255, 0.09)';
      ctx.fill();

      // BORDERS
      for (const feature of countries.features) {
        const geom = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
        const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
        for (const polygon of polys) {
          for (const ring of polygon) {
            ctx.beginPath();
            drawRing(ctx, ring, rotationDeg, cx, cy, radius);
            ctx.strokeStyle = 'rgba(14, 165, 255, 0.30)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const drawGlobeGrid = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rotDeg: number) => {
      ctx.strokeStyle = 'rgba(14, 165, 255, 0.07)';
      ctx.lineWidth = 0.4;
      for (const lat of [-60, -30, 0, 30, 60]) {
        ctx.beginPath();
        for (let lon = -180; lon <= 180; lon += 3) {
          const p = projectPoint(lon, lat, rotDeg, cx, cy, r);
          const p2 = projectPoint(lon + 3, lat, rotDeg, cx, cy, r);
          if (p.z > 0 && p2.z > 0) {
            const d = Math.hypot(p2.x - p.x, p2.y - p.y);
            if (d < r * 0.3) {
              if (lon === -180) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            } else {
              ctx.moveTo(p2.x, p2.y);
            }
          }
        }
        ctx.stroke();
      }
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 3) {
          const p = projectPoint(lon, lat, rotDeg, cx, cy, r);
          const p2 = projectPoint(lon, lat + 3, rotDeg, cx, cy, r);
          if (p.z > 0 && p2.z > 0) {
            const d = Math.hypot(p2.x - p.x, p2.y - p.y);
            if (d < r * 0.3) {
              if (lat === -90) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            } else {
              ctx.moveTo(p2.x, p2.y);
            }
          }
        }
        ctx.stroke();
      }
    };

      let isVisible = true;
      const observer = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0].isIntersecting;
        },
        { threshold: 0 }
      );
      if (container) observer.observe(container);

      let rafId: number;
      const draw = () => {
        rafId = requestAnimationFrame(draw);
        
        // OPTIMIZATION: Pause heavy rendering loop if scrolled out of view
        if (!isVisible) return;
        
        ctx.clearRect(0, 0, size, size);

        // Rotation
        if (!isDragging.current) {
          if (targetRotationRef.current !== null) {
            const diff = targetRotationRef.current - rotationRef.current;
            rotationRef.current += diff * 0.04;
            if (Math.abs(diff) < 0.1) targetRotationRef.current = null;
          } else if (!selectedId) {
            rotationRef.current += 0.15;
          }
        }

        // 1. SPACE BACKGROUND
        stars.forEach(s => {
          ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
          ctx.beginPath();
          ctx.arc(s.x * size, s.y * size, s.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // 2. ATMOSPHERE
        [6, 14, 24, 38].forEach((off, i) => {
          const alphas = [0.08, 0.05, 0.025, 0.01];
          ctx.beginPath();
          ctx.arc(cx, cy, radius + off, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(14, 165, 255, ${alphas[i]})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // 3. GLOBE OCEAN
        const oceanGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        oceanGrad.addColorStop(0, "rgba(8, 20, 60, 0.95)");
        oceanGrad.addColorStop(1, "rgba(2, 8, 24, 0.99)");
        ctx.fillStyle = oceanGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        if (!dataLoaded) {
          ctx.strokeStyle = 'rgba(14, 165, 255, 0.25)';
          ctx.stroke();
          const angle = (Date.now() * 0.003) % (Math.PI * 2);
          ctx.beginPath();
          ctx.arc(cx, cy, 24, angle, angle + 1.2);
          ctx.strokeStyle = '#0EA5FF';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.font = '12px var(--font-mono)';
          ctx.fillStyle = 'rgba(14, 165, 255, 0.6)';
          ctx.textAlign = 'center';
          ctx.fillText('Loading globe...', cx, cy + 44);
          return;
        }

        const rot = rotationRef.current;

        // START GLOBE CLIP
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        // 4. GRID
        drawGlobeGrid(ctx, cx, cy, radius, rot);

        // 5. LAND & COUNTRIES
        if (landDataRef.current && countriesDataRef.current) {
          drawCountryOutlines(ctx, landDataRef.current, countriesDataRef.current, rot, cx, cy, radius);
        }

        // 6. SHADOW
        const shadowGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, radius, cx + radius * 0.5, cy + radius * 0.5, radius * 1.5);
        shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        shadowGrad.addColorStop(1, "rgba(0, 0, 8, 0.55)");
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        // END GLOBE CLIP

        // 7. EDGE STROKE
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(14, 165, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        drawDataLinks(
          ctx, dataLinks, datacenterNodes, rot, cx, cy, radius, Date.now(), 
          selectedId, hoveredId
        );

        // 8. DATACENTER NODES
        const now = Date.now();
        visibleNodesRef.current = [];
        
        datacenterNodes.forEach(node => {
          const p = projectPoint(node.lng, node.lat, rot, cx, cy, radius);
          if (p.z <= 0) return;
          
          visibleNodesRef.current.push({ node, p });
          const scale = 0.35 + p.z * 0.65;
          const nodeR = (selectedId === node.id ? 9 : 6) * scale;

          // Pulse
          const phase = (now % 2500) / 2500;
          [0, 0.5].forEach(off => {
            const ph = (phase + off) % 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, nodeR + ph * 20 * scale, 0, Math.PI * 2);
            ctx.strokeStyle = node.color + Math.round((1 - ph) * 150).toString(16).padStart(2, '0');
            ctx.stroke();
          });

          // Glow & Core
          const nodeGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, nodeR * 4);
          nodeGrd.addColorStop(0, node.color + "55");
          nodeGrd.addColorStop(1, "transparent");
          ctx.fillStyle = nodeGrd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, nodeR * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, nodeR * 0.35, 0, Math.PI * 2);
          ctx.fill();

          if (p.z > 0.25) {
             const alpha = Math.min(1, (p.z - 0.25) / 0.3);
             ctx.font = `${Math.round(10 * scale)}px var(--font-mono)`;
             ctx.fillStyle = node.color + Math.round(alpha * 200).toString(16).padStart(2, '0');
             ctx.textAlign = "left";
             ctx.fillText(node.region, p.x + nodeR + 8, p.y + 4);
          }
        });

      };

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
      startRotation.current = rotationRef.current;
    };
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const my = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

      if (isDragging.current) {
        rotationRef.current = startRotation.current + (('touches' in e ? e.touches[0].clientX : e.clientX) - startX.current) * 0.4;
      }
      
      let found = false;
      let currHover: string | null = null;
      for (const entry of visibleNodesRef.current) {
        if (Math.hypot(mx - entry.p.x, my - entry.p.y) < 22) {
          found = true;
          currHover = entry.node.id;
          break;
        }
      }
      setHoveredId(currHover);
      canvas.style.cursor = found ? "pointer" : isDragging.current ? "grabbing" : "default";
    };
    const handleMouseUp = () => { isDragging.current = false; };
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      for (const entry of visibleNodesRef.current) {
        if (Math.hypot(mx - entry.p.x, my - entry.p.y) < 22) {
          onNodeClick(entry.node.id);
          targetRotationRef.current = -entry.node.lng;
          return;
        }
      }
      onNodeClick(null);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleMouseDown);
    window.addEventListener("touchmove", handleMouseMove);
    window.addEventListener("touchend", handleMouseUp);
    canvas.addEventListener("click", handleClick);

    rafId = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleMouseDown);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
    };
  }, [dataLoaded, selectedId, hoveredId, stars, onNodeClick]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
