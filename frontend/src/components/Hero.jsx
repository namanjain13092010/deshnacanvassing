import { useEffect, useRef } from "react";
import { LOGO_URL } from "../lib/constants";
import ParticlesBg from "./ParticlesBg";
import { ArrowDown, MoveRight } from "lucide-react";

export default function Hero() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (!parallaxRef.current) return;
      const y = window.scrollY;
      parallaxRef.current.style.transform = `translateY(${y * 0.25}px)`;
      parallaxRef.current.style.opacity = `${Math.max(0, 1 - y / 700)}`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="home"
      data-testid="hero-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden grain-overlay"
      style={{
        background:
          "radial-gradient(ellipse at 50% 70%, #1a130b 0%, #0a0806 50%, #000000 100%)",
      }}
    >
      <ParticlesBg density={90} />

      {/* market silhouette / depth layer */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(212,161,73,0.35) 0%, transparent 55%)",
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-[40vh]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(10,8,6,0.6) 60%, #0a0806 100%)",
        }}
      />

      <div ref={parallaxRef} className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div
          className="mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-full"
          style={{
            border: "1px solid rgba(212,161,73,0.25)",
            background: "rgba(212,161,73,0.06)",
          }}
        >
          <span className="block w-1.5 h-1.5 rounded-full bg-[#f5d18c] animate-pulse" />
          <span className="text-[10px] tracking-[0.32em] uppercase text-[#c2b69a]">
            Karnataka · Since the trust began
          </span>
        </div>

        <img
          src={LOGO_URL}
          alt="Deshna Canvassing"
          className="mx-auto mb-10 float-y"
          style={{
            width: "min(520px, 76vw)",
            filter:
              "drop-shadow(0 0 30px rgba(245,209,140,0.45)) drop-shadow(0 0 80px rgba(212,161,73,0.25))",
          }}
        />

        <h1
          className="heading-display text-5xl sm:text-6xl lg:text-7xl mb-6"
          style={{ color: "#f0e6d2" }}
        >
          Building Trust <span className="text-gold-gradient italic">Through</span>
          <br />
          Distribution.
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#c2b69a] font-light leading-relaxed mb-12">
          A canvassing house from the grain markets of Karnataka — connecting honest
          manufacturers with reliable retailers, one relationship at a time.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="#products" className="btn-gold" data-testid="hero-cta-explore">
            Explore Products <MoveRight size={16} />
          </a>
          <a href="#story" className="btn-ghost" data-testid="hero-cta-story">
            Our Story
          </a>
        </div>
      </div>

      <a
        href="#highlights"
        data-testid="hero-scroll-indicator"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#8a7c62] hover:text-[#f5d18c] transition-colors z-10"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <ArrowDown size={14} className="animate-bounce" />
      </a>
    </section>
  );
}
