import { useEffect, useRef } from "react";

/**
 * ParticlesBg - floating golden particles with slight drift + glow.
 * Lightweight canvas, sits behind hero/section content.
 */
export default function ParticlesBg({ density = 80, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const parent = canvas.parentElement;
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * DPR;
      canvas.height = rect.height * DPR;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };
    resize();

    const parts = [];
    for (let i = 0; i < density; i++) {
      parts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (0.4 + Math.random() * 1.6) * DPR,
        vx: (Math.random() - 0.5) * 0.15 * DPR,
        vy: -(0.05 + Math.random() * 0.25) * DPR,
        a: 0.15 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of parts) {
        p.x += p.vx + Math.sin(t + p.phase) * 0.2;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.shadowBlur = 8 * DPR;
        ctx.shadowColor = `rgba(245,209,140,${p.a * 0.9})`;
        ctx.fillStyle = `rgba(245,209,140,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} />;
}
