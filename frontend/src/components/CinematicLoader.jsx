import { useEffect, useRef, useState } from "react";
import { LOGO_URL } from "../lib/constants";

/**
 * CinematicLoader v3
 *
 * Phase A (0-1.4s):  Grains rain down from above. On impact with the floor
 *                    they BOUNCE — high first bounce, smaller second bounce —
 *                    then come to rest in a heap.
 *
 * Phase B (1.4s-4s): While grains are STILL falling & bouncing, the logo
 *                    starts forming. Each settled (or near-settled) grain
 *                    smoothly migrates to its target pixel inside the logo
 *                    silhouette. Result: the logo physically assembles from
 *                    the grain storm.
 *
 * Phase C (4s-6s):   Logo lock-in — golden glow ignites, the real logo image
 *                    fades in over the grain silhouette, tagline appears.
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
      { fill: "#f3e3b8", stroke: "#c2a45f", shape: "rice" },
      { fill: "#d4a149", stroke: "#8a6324", shape: "wheat" },
      { fill: "#b07a35", stroke: "#6a4818", shape: "pulse" },
      { fill: "#f5d18c", stroke: "#a07a3c", shape: "rice" },
      { fill: "#e0c891", stroke: "#9a7530", shape: "pulse" },
    ];

    const COUNT = window.innerWidth < 640 ? 900 : 1500;
    const FLOOR_Y = h - 6 * DPR;
    const GRAVITY = 0.05 * DPR;
    const BOUNCE = 0.55; // higher = bouncier (0..1)
    const FRICTION_X = 0.86;

    const particles = [];

    // Logo target sampling
    let targetsReady = false;
    const sampleTargets = (img) => {
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
      // Assign each particle a target (cycle through if more particles than pts)
      if (pts.length > 0) {
        for (let i = 0; i < particles.length; i++) {
          const t = pts[i % pts.length];
          particles[i].tx = t[0];
          particles[i].ty = t[1];
        }
        targetsReady = true;
      }
    };

    for (let i = 0; i < COUNT; i++) {
      const type = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x: Math.random() * w,
        y: -Math.random() * h * 0.8 - 50,
        vx: (Math.random() - 0.5) * 0.5 * DPR,
        vy: (1.2 + Math.random() * 1.8) * DPR,  // faster fall = more drama
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.15,
        size: (1.4 + Math.random() * 2.2) * DPR,
        type,
        bounces: 0,
        rest: false,           // truly motionless
        tx: 0,
        ty: 0,
        morphProgress: 0,      // 0..1, individual morph progress
        delay: Math.random() * 800,
      });
    }

    // floating sparks
    const embers = [];
    for (let i = 0; i < 90; i++) {
      embers.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (0.4 + Math.random() * 1.2) * DPR,
        vx: (Math.random() - 0.5) * 0.2 * DPR,
        vy: -(0.1 + Math.random() * 0.3) * DPR,
        a: 0.2 + Math.random() * 0.5,
      });
    }

    // Load logo & sample targets
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => sampleTargets(img);
    img.src = LOGO_URL;

    const drawShape = (size, shape, fill, stroke) => {
      ctx.fillStyle = fill;
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 0.4 * DPR;
      }
      if (shape === "rice") {
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.6, size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        if (stroke) ctx.stroke();
      } else if (shape === "wheat") {
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.2, size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        if (stroke) ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
        ctx.fill();
        if (stroke) ctx.stroke();
      }
    };

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const t0 = performance.now();
    const MORPH_START = 1400;   // logo formation begins WHILE grains still bouncing
    const MORPH_DUR = 2400;     // duration each particle takes to morph
    const REVEAL_AT = 4200;     // logo lock-in moment
    let revealFired = false;

    const tick = (now) => {
      const elapsed = now - t0;

      // ── Background gradient (cinematic warm vignette) ──
      const g = ctx.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.6, w * 0.95);
      g.addColorStop(0, "#1a130b");
      g.addColorStop(0.4, "#0d0905");
      g.addColorStop(1, "#000000");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // floor shadow (subtle "ground")
      const fg = ctx.createLinearGradient(0, h * 0.85, 0, h);
      fg.addColorStop(0, "rgba(0,0,0,0)");
      fg.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = fg;
      ctx.fillRect(0, h * 0.85, w, h * 0.15);

      // logo center glow (fades in during morph)
      if (elapsed > MORPH_START) {
        const lt = Math.min(1, (elapsed - MORPH_START) / (REVEAL_AT - MORPH_START));
        const a = lt * 0.55;
        const cg = ctx.createRadialGradient(w / 2, h * 0.48, 0, w / 2, h * 0.48, w * 0.45);
        cg.addColorStop(0, `rgba(245,209,140,${a})`);
        cg.addColorStop(0.5, `rgba(212,161,73,${a * 0.4})`);
        cg.addColorStop(1, "rgba(212,161,73,0)");
        ctx.fillStyle = cg;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Particles ──
      const morphActive = elapsed > MORPH_START && targetsReady;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (elapsed < p.delay) continue;

        // ─ Physics: keep falling + bouncing ─
        if (!p.rest) {
          p.vy += GRAVITY;
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          if (p.y >= FLOOR_Y) {
            p.y = FLOOR_Y;
            if (Math.abs(p.vy) > 0.4 * DPR && p.bounces < 3) {
              // bouncy reverse with damping
              p.vy = -p.vy * BOUNCE;
              p.vx *= FRICTION_X;
              p.vr *= 0.7;
              p.bounces++;
            } else {
              p.vy = 0;
              p.vx = 0;
              p.rest = true;
            }
          }
        }

        // ─ Morph: each resting particle migrates to logo target ─
        // Particles that have finished bouncing start morphing; particles still
        // bouncing continue physics, ensuring overlap of phases.
        if (morphActive && p.rest && p.morphProgress < 1) {
          // start time for this particle's morph
          if (!p.morphStart) p.morphStart = now;
          p.morphProgress = Math.min(
            1,
            (now - p.morphStart) / MORPH_DUR
          );
          const m = easeOutCubic(p.morphProgress);
          // remember settled-floor position as start; smoothly interpolate to target
          if (!p.morphSx) {
            p.morphSx = p.x;
            p.morphSy = p.y;
          }
          p.x = p.morphSx + (p.tx - p.morphSx) * m;
          p.y = p.morphSy + (p.ty - p.morphSy) * m;
          p.rot += 0.04 * (1 - m);
        }

        // ─ Render ─
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const morphedSize = p.size * (1 - p.morphProgress * 0.18);
        if (p.morphProgress > 0.05) {
          // brighter as it locks into the logo
          const t = 1 + p.morphProgress * 0.5;
          const fill = `rgb(${Math.min(255, 245 * t)}, ${Math.min(255, 209 * t)}, ${Math.min(255, 140 * t)})`;
          drawShape(morphedSize, p.type.shape, fill, null);
        } else {
          drawShape(morphedSize, p.type.shape, p.type.fill, p.type.stroke);
        }
        ctx.restore();
      }

      // ── Sparks ──
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

  // stage transitions
  useEffect(() => {
    if (stage === "revealing") {
      const t = setTimeout(() => {
        setHidden(true);
        setTimeout(() => onDone?.(), 900);
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
        transition: "opacity 0.9s ease, visibility 0.9s ease",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Logo overlay - rises into view as grains lock in */}
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
              "radial-gradient(circle, rgba(245,209,140,0.25) 0%, rgba(212,161,73,0.08) 30%, transparent 60%)",
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
              "drop-shadow(0 0 40px rgba(245,209,140,0.6)) drop-shadow(0 0 100px rgba(212,161,73,0.35))",
            animation:
              stage === "revealing"
                ? "logoLockIn 1.6s cubic-bezier(0.2,0.8,0.2,1) forwards"
                : "none",
          }}
        />
        <div
          className="relative z-10 mt-8 text-center"
          style={{
            opacity: stage === "revealing" ? 1 : 0,
            transform: stage === "revealing" ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 1.4s ease 0.9s, transform 1.4s ease 0.9s",
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
