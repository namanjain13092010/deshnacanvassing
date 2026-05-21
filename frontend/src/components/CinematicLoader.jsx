import { useEffect, useRef, useState } from "react";
import { LOGO_URL } from "../lib/constants";

/**
 * CinematicLoader — Phase 1: thousands of 3D-styled grains rain down with
 * physics. Phase 2: settled grains magnetically MORPH into the exact shape
 * of the "Deshna Canvassing" logo by sampling the logo's alpha pixels.
 * Phase 3: golden shine ignites along the logo, tagline emerges, fade out.
 *
 * Pure canvas (no Three.js) for fast load + buttery 60fps on mobiles.
 */
export default function CinematicLoader({ onDone }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const [stage, setStage] = useState("falling"); // falling -> morphing -> revealing -> done
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

    const COUNT = window.innerWidth < 640 ? 900 : 1600;
    const particles = [];

    // Logo target sampling — render logo to offscreen canvas at low res,
    // extract opaque pixel positions, randomly distribute across COUNT particles.
    let targets = [];
    const sampleTargets = (img) => {
      const off = document.createElement("canvas");
      const tw = Math.min(360, Math.round(window.innerWidth * 0.42));
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
            // Map to viewport coords (centered)
            const cx = (window.innerWidth - tw) / 2 + x;
            const cy = (window.innerHeight - th) / 2 + y - 30; // slight upward bias
            pts.push([cx * DPR, cy * DPR]);
          }
        }
      }
      // shuffle
      for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pts[i], pts[j]] = [pts[j], pts[i]];
      }
      targets = pts;
    };

    const groundLevel = h - 8 * DPR;
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
        morphSx: 0, // saved start x for morph easing
        morphSy: 0,
        tx: 0, // target x
        ty: 0, // target y
        delay: Math.random() * 1800,
      });
    }

    // dust embers
    const embers = [];
    for (let i = 0; i < 80; i++) {
      embers.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (0.4 + Math.random() * 1.2) * DPR,
        vx: (Math.random() - 0.5) * 0.15 * DPR,
        vy: -(0.1 + Math.random() * 0.3) * DPR,
        a: 0.2 + Math.random() * 0.5,
      });
    }

    // load logo for target sampling
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      sampleTargets(img);
      // assign each particle a target (cycle through targets if fewer than COUNT)
      if (targets.length > 0) {
        for (let i = 0; i < particles.length; i++) {
          const t = targets[i % targets.length];
          particles[i].tx = t[0];
          particles[i].ty = t[1];
        }
      }
    };
    img.src = LOGO_URL;

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

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const t0 = performance.now();
    const FALL_DUR = 3000; // grains fall and settle
    const MORPH_DUR = 1800; // grains migrate to logo positions
    const REVEAL_DUR = 2400; // logo glow + tagline
    let phase1Done = false;
    let phase2Start = 0;
    let phase2Done = false;
    let phase3Start = 0;

    const tick = (now) => {
      const elapsed = now - t0;

      // background
      const g = ctx.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.6, w * 0.9);
      g.addColorStop(0, "#1a130b");
      g.addColorStop(0.4, "#0d0905");
      g.addColorStop(1, "#000000");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // warm bottom glow (fades as morph starts)
      const bottomGlowA = phase1Done ? Math.max(0, 0.22 - (now - phase2Start) / MORPH_DUR * 0.22) : 0.22;
      const bg = ctx.createRadialGradient(w / 2, h * 0.85, 0, w / 2, h * 0.85, w * 0.5);
      bg.addColorStop(0, `rgba(212,161,73,${bottomGlowA})`);
      bg.addColorStop(1, "rgba(212,161,73,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // logo center glow (fades in during morph)
      if (phase1Done) {
        const localT = Math.min(1, (now - phase2Start) / MORPH_DUR);
        const centerGlowA = localT * 0.55;
        const cg = ctx.createRadialGradient(w / 2, h * 0.48, 0, w / 2, h * 0.48, w * 0.4);
        cg.addColorStop(0, `rgba(245,209,140,${centerGlowA})`);
        cg.addColorStop(0.5, `rgba(212,161,73,${centerGlowA * 0.45})`);
        cg.addColorStop(1, "rgba(212,161,73,0)");
        ctx.fillStyle = cg;
        ctx.fillRect(0, 0, w, h);
      }

      // particles
      if (!phase1Done) {
        // FALLING phase: gravity + settle
        let allSettled = true;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (elapsed < p.delay) {
            allSettled = false;
            continue;
          }
          if (!p.settled) {
            p.vy += 0.025 * DPR;
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
            } else {
              allSettled = false;
            }
          }
          drawGrain(p);
        }
        if (elapsed > FALL_DUR || allSettled) {
          phase1Done = true;
          phase2Start = now;
          // snapshot start positions for smooth morph
          for (const p of particles) {
            p.morphSx = p.x;
            p.morphSy = p.y;
          }
          setStage("morphing");
        }
      } else if (!phase2Done) {
        // MORPHING phase: ease each particle toward its logo target
        const tProgress = Math.min(1, (now - phase2Start) / MORPH_DUR);
        const eased = easeOutCubic(tProgress);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          // stagger: each particle has slightly different start delay within morph
          const local = Math.min(1, Math.max(0, (eased - (i % 30) * 0.005) / (1 - 0.15)));
          p.x = p.morphSx + (p.tx - p.morphSx) * local;
          p.y = p.morphSy + (p.ty - p.morphSy) * local;
          p.rot += 0.03 * (1 - local);
          // shrink slightly as they lock into logo
          const size = p.size * (1 - local * 0.15);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          // brighten as they form the logo
          const tint = 1 + local * 0.4;
          ctx.fillStyle = `rgba(${Math.min(255, 245 * tint)}, ${Math.min(255, 209 * tint)}, ${Math.min(255, 140 * tint)}, 1)`;
          ctx.strokeStyle = "rgba(154, 117, 48, 0.6)";
          ctx.lineWidth = 0.4 * DPR;
          if (p.type.shape === "rice") {
            ctx.beginPath();
            ctx.ellipse(0, 0, size * 1.6, size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type.shape === "wheat") {
            ctx.beginPath();
            ctx.ellipse(0, 0, size * 1.2, size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
        if (tProgress >= 1) {
          phase2Done = true;
          phase3Start = now;
          setStage("revealing");
        }
      } else {
        // LOCKED phase: render particles in place (form the logo silhouette)
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          ctx.save();
          ctx.translate(p.tx, p.ty);
          ctx.rotate(p.rot);
          const size = p.size * 0.85;
          ctx.fillStyle = "rgba(245, 209, 140, 0.95)";
          if (p.type.shape === "rice") {
            ctx.beginPath();
            ctx.ellipse(0, 0, size * 1.6, size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type.shape === "wheat") {
            ctx.beginPath();
            ctx.ellipse(0, 0, size * 1.2, size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // embers / sparks
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

  // Manage stage → done transition
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

      {/* Logo overlay (visible during reveal stage on top of grain silhouette) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{
          opacity: stage === "revealing" ? 1 : 0,
          transition: "opacity 1.2s ease",
        }}
      >
        <div
          className="absolute"
          style={{
            width: "120vmin",
            height: "120vmin",
            background:
              "radial-gradient(circle, rgba(245,209,140,0.22) 0%, rgba(212,161,73,0.08) 30%, transparent 60%)",
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
        {/* Tagline */}
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
