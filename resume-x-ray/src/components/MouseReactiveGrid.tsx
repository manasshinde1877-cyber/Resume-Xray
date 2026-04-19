"use client";

import { useEffect, useRef } from "react";

export function MouseReactiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SPACING = 12;
    const BASE_R = 1.0;           // resting dot radius
    const PEAK_R = 1.5;           // max dot radius near cursor
    const GLOW_DIST = 150;        // influence radius
    const BASE_ALPHA = 0.07;      // resting opacity — barely visible
    const PEAK_ALPHA = 0.45;      // peak opacity — muted, not glowing

    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const { x: mx, y: my } = mouseRef.current;

      const cols = Math.ceil(W / SPACING) + 1;
      const rows = Math.ceil(H / SPACING) + 1;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * SPACING;
          const y = r * SPACING;

          const dx = mx - x;
          const dy = my - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Smooth falloff: 1 at center → 0 at GLOW_DIST
          const factor = Math.max(0, 1 - dist / GLOW_DIST);
          const eased = factor * factor; // quadratic — feels snappier

          const radius = BASE_R + (PEAK_R - BASE_R) * eased;
          const alpha = BASE_ALPHA + (PEAK_ALPHA - BASE_ALPHA) * eased;

          // Interpolate color: slate-600 (#475569) → cyan (#06b6d4)
          const rr = Math.round(71 + (6 - 71) * eased);
          const g = Math.round(85 + (182 - 85) * eased);
          const b = Math.round(105 + (212 - 105) * eased);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rr},${g},${b},${alpha})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
