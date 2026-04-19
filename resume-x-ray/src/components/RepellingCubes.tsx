"use client";

import React, { useEffect, useRef } from "react";

interface Cube {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRotation: number;
}

export function RepellingCubes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cubesRef = useRef<Cube[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Initial 7 cubes distributed across the field
    cubesRef.current = [
      { x: w * 0.2, y: h * 0.2, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1, size: 45, rotation: 0, vRotation: 0.01 },
      { x: w * 0.8, y: h * 0.2, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1, size: 60, rotation: 45, vRotation: -0.015 },
      { x: w * 0.1, y: h * 0.8, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1, size: 40, rotation: 10, vRotation: 0.008 },
      { x: w * 0.9, y: h * 0.8, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1, size: 70, rotation: 90, vRotation: -0.005 },
      { x: w * 0.5, y: h * 0.1, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1, size: 55, rotation: 20, vRotation: 0.012 },
      { x: w * 0.5, y: h * 0.9, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1, size: 45, rotation: -30, vRotation: -0.01 },
      { x: w * 0.5, y: h * 0.5, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1, size: 65, rotation: 180, vRotation: 0.005 },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      cubesRef.current.forEach((cube) => {
        // Friction / Base Movement
        cube.x += cube.vx;
        cube.y += cube.vy;
        cube.rotation += cube.vRotation;

        // Mouse Repulsion
        const dx = cube.x - mx;
        const dy = cube.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelDist = 250;

        if (dist < repelDist) {
          const force = (repelDist - dist) / repelDist;
          const angle = Math.atan2(dy, dx);
          cube.vx += Math.cos(angle) * force * 0.8;
          cube.vy += Math.sin(angle) * force * 0.8;
        }

        // Limit velocity
        const maxV = 4;
        const currentV = Math.sqrt(cube.vx * cube.vx + cube.vy * cube.vy);
        if (currentV > maxV) {
          cube.vx = (cube.vx / currentV) * maxV;
          cube.vy = (cube.vy / currentV) * maxV;
        }

        // Boundary bounce
        if (cube.x < cube.size / 2) { cube.x = cube.size / 2; cube.vx *= -1; }
        if (cube.x > w - cube.size / 2) { cube.x = w - cube.size / 2; cube.vx *= -1; }
        if (cube.y < cube.size / 2) { cube.y = cube.size / 2; cube.vy *= -1; }
        if (cube.y > h - cube.size / 2) { cube.y = h - cube.size / 2; cube.vy *= -1; }

        // Draw Cube (#C3CC9B)
        ctx.save();
        ctx.translate(cube.x, cube.y);
        ctx.rotate(cube.rotation);

        ctx.shadowBlur = 40;
        ctx.shadowColor = "rgba(195, 204, 155, 0.4)";
        ctx.fillStyle = "#C3CC9B";

        // Solid Rounded Rectangle Style for the "Cube"
        const r = 12;
        ctx.beginPath();
        ctx.moveTo(-cube.size / 2 + r, -cube.size / 2);
        ctx.lineTo(cube.size / 2 - r, -cube.size / 2);
        ctx.quadraticCurveTo(cube.size / 2, -cube.size / 2, cube.size / 2, -cube.size / 2 + r);
        ctx.lineTo(cube.size / 2, cube.size / 2 - r);
        ctx.quadraticCurveTo(cube.size / 2, cube.size / 2, cube.size / 2 - r, cube.size / 2);
        ctx.lineTo(-cube.size / 2 + r, cube.size / 2);
        ctx.quadraticCurveTo(-cube.size / 2, cube.size / 2, -cube.size / 2, cube.size / 2 - r);
        ctx.lineTo(-cube.size / 2, -cube.size / 2 + r);
        ctx.quadraticCurveTo(-cube.size / 2, -cube.size / 2, -cube.size / 2 + r, -cube.size / 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}
