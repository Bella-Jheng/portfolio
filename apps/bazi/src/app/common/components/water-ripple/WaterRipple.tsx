'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Ripple {
  x: number;
  y: number;
  age: number;
  speed: number;
}

const MAX_RADIUS = 130;
const RING_COUNT = 4;
const DROP_INTERVAL = 22; // px of mouse travel before spawning a new ripple

export function WaterRipple() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const disabled = pathname === '/form' || pathname.startsWith('/result');

  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ripples: Ripple[] = [];
    let prevX = 0;
    let prevY = 0;
    let accumulated = 0;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      accumulated += Math.sqrt(dx * dx + dy * dy);
      prevX = e.clientX;
      prevY = e.clientY;

      if (accumulated >= DROP_INTERVAL) {
        accumulated = 0;
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          age: 0,
          speed: 0.005 + Math.random() * 0.003,
        });
      }
    };

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.age += rip.speed;

        if (rip.age >= 1) {
          ripples.splice(i, 1);
          continue;
        }

        // bell-curve envelope: 0 → peak → 0, for smooth fade-in and fade-out
        const envelope = Math.sin(rip.age * Math.PI);

        for (let ring = 0; ring < RING_COUNT; ring++) {
          const ringAge = rip.age - ring * 0.14;
          if (ringAge <= 0) continue;

          const r = ringAge * MAX_RADIUS;
          const alpha = envelope * 0.28 * (1 - ring * 0.2);
          if (alpha <= 0.002) continue;

          ctx.beginPath();
          ctx.arc(rip.x, rip.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(45, 36, 32, ${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(0.3, 1.1 - ring * 0.25);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    window.addEventListener('mousemove', onMouseMove);
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (disabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}
