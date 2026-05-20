import { useRef } from "react";
import { FOUNDER_PHOTO } from "../lib/constants";
import { useScrollReveal } from "../lib/useScrollReveal";
import { Quote } from "lucide-react";

export default function Founder() {
  const ref = useScrollReveal();
  const tiltRef = useRef(null);

  const onMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1600px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateZ(0)`;
    const img = el.querySelector("[data-photo]");
    if (img) img.style.transform = `translate3d(${x * 18}px, ${y * 18}px, 40px) scale(1.04)`;
  };
  const onLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = "perspective(1600px) rotateY(0) rotateX(0)";
    const img = el.querySelector("[data-photo]");
    if (img) img.style.transform = "translate3d(0,0,0) scale(1)";
  };

  return (
    <section
      id="founder"
      data-testid="founder-section"
      className="section-pad relative overflow-hidden grain-overlay"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(212,161,73,0.12) 0%, transparent 55%), linear-gradient(180deg, #0a0806 0%, #15110d 100%)",
      }}
    >
      <div
        ref={ref}
        className="reveal max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center"
      >
        <div className="lg:col-span-5">
          <div
            ref={tiltRef}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="glow-frame"
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.6s cubic-bezier(0.2,0.8,0.2,1)",
            }}
          >
            <div
              className="relative overflow-hidden rounded-sm"
              style={{
                border: "1px solid rgba(212,161,73,0.35)",
                boxShadow:
                  "0 60px 120px -30px rgba(0,0,0,0.7), 0 0 100px -20px rgba(212,161,73,0.35)",
              }}
            >
              <img
                data-photo
                src={FOUNDER_PHOTO}
                alt="Pintu Vanigota — Founder"
                className="w-full h-[560px] object-cover transition-transform duration-700"
                style={{ filter: "saturate(1.0) contrast(1.05) brightness(1.0)" }}
                draggable={false}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 45%, rgba(10,8,6,0.7) 100%)",
                }}
              />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="text-[10px] tracking-[0.32em] uppercase text-[#f5d18c] mb-1">
                  Founder
                </div>
                <div className="heading-display text-3xl text-[#f0e6d2]">
                  Pintu Vanigota
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="eyebrow mb-4">— Spotlight</div>
          <h2 className="heading-display text-4xl sm:text-5xl lg:text-6xl text-[#f0e6d2] mb-8">
            The man behind the <span className="text-gold-gradient italic">handshake.</span>
          </h2>
          <p className="text-[#c2b69a] text-base sm:text-lg leading-relaxed mb-10 max-w-xl">
            Pintu Vanigota grew up watching grain pass through hands — and learned
            early that the smallest gesture of honesty outlasts the loudest deal.
            Two decades on, every brand and every retailer who works with Deshna
            knows him by his first name.
          </p>

          <div
            className="relative p-8 sm:p-10 rounded-2xl glass-card"
            style={{ borderColor: "rgba(212,161,73,0.35)" }}
          >
            <Quote
              size={32}
              className="absolute -top-4 -left-2 text-[#d4a149] opacity-80"
              style={{ filter: "drop-shadow(0 0 12px rgba(212,161,73,0.6))" }}
            />
            <blockquote
              data-testid="founder-quote"
              className="heading-display italic text-3xl sm:text-4xl lg:text-5xl text-gold-gradient leading-tight"
            >
              Trust always creates opportunities.
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <span className="block w-10 h-px bg-[#d4a149]" />
              <span className="text-[11px] tracking-[0.28em] uppercase text-[#8a7c62]">
                Pintu Vanigota · Founder
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
