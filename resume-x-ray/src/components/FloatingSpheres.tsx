"use client";

import { useEffect, useRef } from "react";

interface Sphere {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  originalColor: string;
  alpha: number;
}

export function FloatingSpheres() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let spheres: Sphere[] = [];
    const COUNT = 35;
    const REPEL_RADIUS = 250;
    const REPEL_STRENGTH = 0.5;
    const DAMPING = 0.95;
    const DRIFT_SPEED = 0.4;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initSpheres();
    };

    const initSpheres = () => {
      spheres = [];
      for (let i = 0; i < COUNT; i++) {
        const isSage = i % 2 === 0;
        const color = isSage ? "rgba(153, 173, 122, 0.04)" : "rgba(220, 204, 172, 0.04)";
        spheres.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * DRIFT_SPEED,
          vy: (Math.random() - 0.5) * DRIFT_SPEED,
          radius: 60 + Math.random() * 120,
          color,
          originalColor: color,
          alpha: 0.04
        });
      }
    };

    window.addEventListener("resize", resize);
    resize();

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    let raf: number;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      const { x: mx, y: my, active: mActive } = mouseRef.current;

      for (const s of spheres) {
        // Drifting velocity
        s.x += s.vx;
        s.y += s.vy;

        // Mouse Repulsion
        if (mActive) {
          const dx = s.x - mx;
          const dy = s.y - my;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < REPEL_RADIUS) {
            const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
            // Add repulsion force to velocity
            s.vx += (dx / dist) * force * REPEL_STRENGTH;
            s.vy += (dy / dist) * force * REPEL_STRENGTH;

            // Brighten slightly when near cursor
            s.alpha = Math.min(0.12, 0.04 + force * 0.1);
          } else {
            s.alpha = Math.max(0.04, s.alpha - 0.001);
          }
        } else {
          s.alpha = Math.max(0.04, s.alpha - 0.001);
        }

        // Apply Damping (Friction)
        s.vx *= DAMPING;
        s.vy *= DAMPING;

        // Keep it moving if it gets too slow
        const vel = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        if (vel < 0.1) {
          s.vx += (Math.random() - 0.5) * 0.05;
          s.vy += (Math.random() - 0.5) * 0.05;
        }

        // Wrap around boundaries
        if (s.x < -s.radius) s.x = W + s.radius;
        if (s.x > W + s.radius) s.x = -s.radius;
        if (s.y < -s.radius) s.y = H + s.radius;
        if (s.y > H + s.radius) s.y = -s.radius;

        // Draw with Gradient
        ctx.beginPath();
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
        const colorBase = s.color.replace(/0\.\d+\)/, `${s.alpha})`);
        grad.addColorStop(0, colorBase);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
