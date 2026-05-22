import { useEffect, useRef, useState } from "react";
import { LOGO_URL } from "../lib/constants";

/**
 * CinematicLoader — refined elegance edition
 *
 * Phase A (0–2.2s)  Grains fall slowly. Each grain executes exactly ONE
 *                   soft bounce on impact, then settles. No floating, no
 *                   repeated jitter.
 * Phase B (2.2–4.6s) Settled grains assemble smoothly into the Deshna
 *                   Canvassing logo silhouette.
 * Phase C (4.6–7s)  Logo locks in with subtle glow + metallic shine.
 *
 * Grain scale ≈ 0.4cm on screen (consistent size, light variance).
 * Background: deep warm vignette. Dust haze for atmosphere.
 */
export default function CinematicLoader({ onDone }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const [stage, setStage] = useState("falling");
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

    const palette = [
      { fill: "#efdcaf", stroke: "#b58e4a", shape: "rice" },
      { fill: "#d4a149", stroke: "#7a571f", shape: "wheat" },
      { fill: "#b07a35", stroke: "#5a3c12", shape: "pulse" },
      { fill: "#e8c984", stroke: "#9a7530", shape: "rice" },
      { fill: "#c69a52", stroke: "#7e5a24", shape: "pulse" },
    ];

    const GRAIN_BASE = 6.5 * DPR;
    const GRAIN_VAR = 1.2 * DPR;
    const COUNT = window.innerWidth < 640 ? 700 : 1200;
    const FLOOR_Y = h - 8 * DPR;
    const GRAVITY = 0.022 * DPR;
    const BOUNCE = 0.25;

    const particles = [];
    let targetsReady = false;

    const sampleTargets = (img) => {
      try {
        const off = document.createElement("canvas");
        const tw = Math.min(420, Math.round(window.innerWidth * 0.46));
        const th = Math.round(tw * (img.height / img.width));
        off.width = tw;
        off.height = th;
        const octx = off.getContext("2d");
        octx.drawImage(img, 0, 0, tw, th);
        const data = octx.getImageData(0, 0, tw, th).data;
        const step = 2;
        const pts = [];
        for (let y = 0; y < th; y += step) {
          for (let x = 0; x < tw; x += step) {
            const a = data[(y * tw + x) * 4 + 3];
            if (a > 96) {
              const cx = (window.innerWidth - tw) / 2 + x;
              const cy = (window.innerHeight - th) / 2 + y - 40;
              pts.push([cx * DPR, cy * DPR]);
            }
          }
        }
        for (let i = pts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pts[i], pts[j]] = [pts[j], pts[i]];
        }
        if (pts.length > 0) {
          for (let i = 0; i < particles.length; i++) {
            const t = pts[i % pts.length];
            particles[i].tx = t[0];
            particles[i].ty = t[1];
          }
          targetsReady = true;
        }
      } catch (err) {
        // CORS / canvas tainting — fall back to no morph
        targetsReady = false;
      }
    };

    for (let i = 0; i < COUNT; i++) {
      const type = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x: Math.random() * w,
        y: -Math.random() * h * 0.7 - 30,
        vx: (Math.random() - 0.5) * 0.15 * DPR,
        vy: (0.35 + Math.random() * 0.55) * DPR,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.04,
        size: GRAIN_BASE + (Math.random() - 0.5) * GRAIN_VAR,
        alpha: 0.7 + Math.random() * 0.3,
        type,
        bounced: false,
        rest: false,
        tx: 0,
        ty: 0,
        morphProgress: 0,
        morphStart: 0,
        morphSx: 0,
        morphSy: 0,
        delay: Math.random() * 600,
      });
    }

    const dust = [];
    for (let i = 0; i < 50; i++) {
      dust.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (0.8 + Math.random() * 1.6) * DPR,
        vx: (Math.random() - 0.5) * 0.08 * DPR,
        vy: -(0.04 + Math.random() * 0.12) * DPR,
        a: 0.05 + Math.random() * 0.12,
      });
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => sampleTargets(img);
    img.onerror = () => { targetsReady = false; };
    img.src = LOGO_URL;

    const drawShape = (size, shape, fill) => {
      ctx.fillStyle = fill;
      if (shape === "rice") {
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.4, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape === "wheat") {
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.05, size * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.78, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const t0 = performance.now();
    const MORPH_START = 2200;
    const MORPH_DUR = 2200;
    const REVEAL_AT = 4600;
    let revealFired = false;

    const tick = (now) => {
      const elapsed = now - t0;

      // Background warm vignette
      const g = ctx.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, w * 0.9);
      g.addColorStop(0, "#181108");
      g.addColorStop(0.45, "#0b0805");
      g.addColorStop(1, "#000000");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // floor shadow
      const fg = ctx.createLinearGradient(0, h * 0.86, 0, h);
      fg.addColorStop(0, "rgba(0,0,0,0)");
      fg.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = fg;
      ctx.fillRect(0, h * 0.86, w, h * 0.14);

      // logo center glow during morph
      if (elapsed > MORPH_START) {
        const lt = Math.min(1, (elapsed - MORPH_START) / (REVEAL_AT - MORPH_START));
        const a = lt * 0.4;
        const cg = ctx.createRadialGradient(w / 2, h * 0.48, 0, w / 2, h * 0.48, w * 0.5);
        cg.addColorStop(0, `rgba(245,209,140,${a})`);
        cg.addColorStop(0.5, `rgba(212,161,73,${a * 0.45})`);
        cg.addColorStop(1, "rgba(212,161,73,0)");
        ctx.fillStyle = cg;
        ctx.fillRect(0, 0, w, h);
      }

      // dust haze (low-opacity soft particles, drifting up)
      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];
        d.x += d.vx;
        d.y += d.vy;
        if (d.y < -10) { d.y = h + 10; d.x = Math.random() * w; }
        ctx.beginPath();
        ctx.fillStyle = `rgba(245,209,140,${d.a})`;
        ctx.shadowBlur = 10 * DPR;
        ctx.shadowColor = "rgba(245,209,140,0.4)";
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // grains
      const morphActive = elapsed > MORPH_START && targetsReady;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (elapsed < p.delay) continue;

        if (!p.rest) {
          p.vy += GRAVITY;
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          if (p.y >= FLOOR_Y) {
            p.y = FLOOR_Y;
            if (!p.bounced && Math.abs(p.vy) > 0.3 * DPR) {
              p.vy = -p.vy * BOUNCE;
              p.vx *= 0.7;
              p.vr *= 0.4;
              p.bounced = true;
            } else {
              p.vy = 0;
              p.vx = 0;
              p.vr = 0;
              p.rest = true;
            }
          }
        }

        if (morphActive && p.rest && p.morphProgress < 1) {
          if (!p.morphStart) {
            p.morphStart = now;
            p.morphSx = p.x;
            p.morphSy = p.y;
          }
          p.morphProgress = Math.min(1, (now - p.morphStart) / MORPH_DUR);
          const m = easeOutCubic(p.morphProgress);
          p.x = p.morphSx + (p.tx - p.morphSx) * m;
          p.y = p.morphSy + (p.ty - p.morphSy) * m;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const size = p.size * (1 - p.morphProgress * 0.1);
        let fill = p.type.fill;
        if (p.morphProgress > 0.05) {
          const t = 1 + p.morphProgress * 0.35;
          fill = `rgb(${Math.min(255, 239 * t)}, ${Math.min(255, 220 * t)}, ${Math.min(255, 175 * t)})`;
        }
        drawShape(size, p.type.shape, fill);
        ctx.restore();
      }

      if (!revealFired && elapsed > REVEAL_AT) {
        revealFired = true;
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
        setTimeout(() => onDone?.(), 1000);
      }, 2600);
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
        transition: "opacity 1s ease, visibility 1s ease",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{
          opacity: stage === "revealing" ? 1 : 0,
          transition: "opacity 1.4s ease",
        }}
      >
        <div
          className="absolute"
          style={{
            width: "120vmin",
            height: "120vmin",
            background:
              "radial-gradient(circle, rgba(245,209,140,0.2) 0%, rgba(212,161,73,0.06) 30%, transparent 60%)",
            filter: "blur(20px)",
          }}
        />
        <img
          src={LOGO_URL}
          alt="Deshna Canvassing"
          className="relative z-10"
          style={{
            width: "min(560px, 78vw)",
            filter:
              "drop-shadow(0 0 40px rgba(245,209,140,0.55)) drop-shadow(0 0 100px rgba(212,161,73,0.3))",
            animation:
              stage === "revealing"
                ? "logoLockIn 1.8s cubic-bezier(0.16,1,0.3,1) forwards"
                : "none",
          }}
        />
        <div
          className="relative z-10 mt-8 text-center"
          style={{
            opacity: stage === "revealing" ? 1 : 0,
            transform: stage === "revealing" ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 1.4s ease 1s, transform 1.4s ease 1s",
          }}
        >
          <div
            className="text-[11px] tracking-[0.32em] uppercase text-[#f5d18c] mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Building Trust Through Distribution
          </div>
          <div
            className="text-xs text-[#8a7c62]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Karnataka · since the trust began
          </div>
        </div>
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
