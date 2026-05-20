import { FOUNDER_PHOTO } from "../lib/constants";
import { useScrollReveal } from "../lib/useScrollReveal";
import { Quote } from "lucide-react";

export default function Founder() {
  const ref = useScrollReveal();
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
      <div ref={ref} className="reveal max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <div className="lg:col-span-5">
          <div className="glow-frame">
            <div
              className="relative overflow-hidden rounded-sm"
              style={{
                border: "1px solid rgba(212,161,73,0.35)",
                boxShadow:
                  "0 60px 120px -30px rgba(0,0,0,0.7), 0 0 100px -20px rgba(212,161,73,0.35)",
              }}
            >
              <img
                src={FOUNDER_PHOTO}
                alt="Pintu Vanigota — Founder"
                className="w-full h-[560px] object-cover"
                style={{ filter: "saturate(0.85) contrast(1.05) brightness(0.95)" }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 40%, rgba(10,8,6,0.6) 100%)",
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
