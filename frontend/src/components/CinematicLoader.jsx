import { useEffect, useRef, useState } from "react";
import { LOGO_URL } from "../lib/constants";

/**
 * CinematicLoader
 * Canvas-based grain particle physics. Thousands of grains fall from the top
 * with gravity, gentle wind drift, and pile up at the bottom forming heaps.
 * After ~3.5s the grain layer slowly fades and the logo emerges with golden
 * glow + smoke rise. User can skip.
 */
export default function CinematicLoader({ onDone }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const [stage, setStage] = useState("falling"); // falling -> revealing -> done
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let w = (canvas.width = window.innerWidth * DPR);
    let h = (canvas.height = window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    // grain types: rice (white), wheat (golden), pulse (amber), flour (cream)
    const palette = [
      { fill: "#f3e3b8", stroke: "#c2a45f", shape: "rice" },     // rice
      { fill: "#d4a149", stroke: "#8a6324", shape: "wheat" },    // wheat
      { fill: "#b07a35", stroke: "#6a4818", shape: "pulse" },    // pulse
      { fill: "#f5d18c", stroke: "#a07a3c", shape: "rice" },     // golden grain
      { fill: "#e0c891", stroke: "#9a7530", shape: "pulse" },    // chickpea-like
    ];

    const COUNT = window.innerWidth < 640 ? 360 : 700;
    const particles = [];
    const groundLevel = h - 8 * DPR;
    // generate heap profile (pile shape) - higher in middle
    const heapHeight = (x) => {
      const cx = w / 2;
      const dx = (x - cx) / (w * 0.45);
      const bell = Math.max(0, 1 - dx * dx);
      return groundLevel - bell * h * 0.22 - Math.random() * 4 * DPR;
    };

    for (let i = 0; i < COUNT; i++) {
      const type = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x: Math.random() * w,
        y: -Math.random() * h * 1.2,
        vx: (Math.random() - 0.5) * 0.4 * DPR,
        vy: (0.6 + Math.random() * 1.4) * DPR,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.08,
        size: (1.4 + Math.random() * 2.2) * DPR,
        type,
        settled: false,
        targetY: 0,
        delay: Math.random() * 2200,
        startTime: performance.now(),
      });
    }

    // floating dust embers
    const embers = [];
    for (let i = 0; i < 60; i++) {
      embers.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (0.4 + Math.random() * 1.2) * DPR,
        vx: (Math.random() - 0.5) * 0.15 * DPR,
        vy: -(0.1 + Math.random() * 0.3) * DPR,
        a: 0.2 + Math.random() * 0.5,
      });
    }

    const drawGrain = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.type.fill;
      ctx.strokeStyle = p.type.stroke;
      ctx.lineWidth = 0.4 * DPR;
      if (p.type.shape === "rice") {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (p.type.shape === "wheat") {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.2, p.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    };

    const t0 = performance.now();
    let revealStarted = false;

    const tick = (now) => {
      const elapsed = now - t0;

      // background gradient
      const g = ctx.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.6, w * 0.9);
      g.addColorStop(0, "#1a130b");
      g.addColorStop(0.4, "#0d0905");
      g.addColorStop(1, "#000000");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // soft bottom warm glow
      const bg = ctx.createRadialGradient(w / 2, h * 0.85, 0, w / 2, h * 0.85, w * 0.5);
      bg.addColorStop(0, "rgba(212,161,73,0.18)");
      bg.addColorStop(1, "rgba(212,161,73,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (elapsed < p.delay) continue;
        if (!p.settled) {
          p.vy += 0.025 * DPR; // gravity
          p.vx += (Math.random() - 0.5) * 0.02;
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          const ground = heapHeight(p.x);
          if (p.y >= ground) {
            p.y = ground;
            p.settled = true;
            p.vy = 0;
            p.vx = 0;
          }
        }
        drawGrain(p);
      }

      // embers
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        if (e.y < -10) {
          e.y = h + 10;
          e.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(245, 209, 140, ${e.a})`;
        ctx.shadowBlur = 8 * DPR;
        ctx.shadowColor = "rgba(245,209,140,0.6)";
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!revealStarted && elapsed > 3200) {
        revealStarted = true;
        setStage("revealing");
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => {
      w = canvas.width = window.innerWidth * DPR;
      h = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (stage === "revealing") {
      const t = setTimeout(() => {
        setHidden(true);
        setTimeout(() => onDone?.(), 900);
      }, 3200);
      return () => clearTimeout(t);
    }
  }, [stage, onDone]);

  const skip = () => {
    setHidden(true);
    setTimeout(() => onDone?.(), 600);
  };

  return (
    <div
      data-testid="cinematic-loader"
      className="fixed inset-0 z-[999] bg-black"
      style={{
        opacity: hidden ? 0 : 1,
        visibility: hidden ? "hidden" : "visible",
        transition: "opacity 0.9s ease, visibility 0.9s ease",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Logo reveal layer */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{
          opacity: stage === "revealing" ? 1 : 0,
          transition: "opacity 1.4s ease",
        }}
      >
        {/* radial glow */}
        <div
          className="absolute"
          style={{
            width: "120vmin",
            height: "120vmin",
            background:
              "radial-gradient(circle, rgba(245,209,140,0.22) 0%, rgba(212,161,73,0.08) 30%, transparent 60%)",
            filter: "blur(20px)",
            animation: stage === "revealing" ? "logoEmerge 2.4s ease forwards" : "none",
          }}
        />
        {/* smoke wisps */}
        <div
          className="absolute"
          style={{
            width: "60vmin",
            height: "60vmin",
            background:
              "radial-gradient(ellipse at 50% 80%, rgba(245,209,140,0.15) 0%, transparent 60%)",
            filter: "blur(30px)",
            animation: stage === "revealing" ? "smokeRise 3s ease-out forwards" : "none",
          }}
        />
        <img
          src={LOGO_URL}
          alt="Deshna Canvassing"
          className="relative z-10"
          style={{
            width: "min(560px, 78vw)",
            filter: "drop-shadow(0 0 40px rgba(245,209,140,0.55)) drop-shadow(0 0 100px rgba(212,161,73,0.3))",
            animation: stage === "revealing" ? "logoEmerge 2.2s cubic-bezier(0.2,0.8,0.2,1) forwards" : "none",
          }}
        />
      </div>

      <button
        data-testid="skip-intro-btn"
        onClick={skip}
        className="absolute bottom-8 right-8 z-20 text-[11px] tracking-[0.3em] uppercase text-[#c2b69a] hover:text-[#f5d18c] transition-colors"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Skip Intro →
      </button>

      <div
        className="absolute bottom-8 left-8 z-20 text-[11px] tracking-[0.3em] uppercase text-[#8a7c62]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Deshna · est. trust
      </div>
    </div>
  );
}
