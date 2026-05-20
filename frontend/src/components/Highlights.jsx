import { STATS } from "../lib/constants";
import { useScrollReveal } from "../lib/useScrollReveal";
import { Sparkles, Handshake, Truck, ShieldCheck } from "lucide-react";

const icons = [Sparkles, Handshake, Truck, ShieldCheck];

export default function Highlights() {
  const ref = useScrollReveal();
  return (
    <section
      id="highlights"
      data-testid="highlights-section"
      className="section-pad relative grain-overlay"
      style={{ background: "linear-gradient(180deg, #0a0806 0%, #100c08 100%)" }}
    >
      <div ref={ref} className="reveal max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 items-end mb-16">
          <div className="lg:col-span-7">
            <div className="eyebrow mb-4">— A House of Distribution</div>
            <h2 className="heading-display text-4xl sm:text-5xl lg:text-6xl text-[#f0e6d2]">
              A business built on
              <br />
              <span className="text-gold-gradient italic">handshakes</span>, scaled by
              consistency.
            </h2>
          </div>
          <p className="lg:col-span-5 text-[#c2b69a] text-base sm:text-lg leading-relaxed">
            Deshna Canvassing is the bridge between manufacturers and the
            shop-by-shop network that feeds Karnataka's kitchens — rice, atta,
            edible oils, pulses, detergents, and the everyday essentials of FMCG.
          </p>
        </div>

        <div className="reveal-stagger grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((s, i) => {
            const Icon = icons[i];
            return (
              <div
                key={s.label}
                data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="glass-card glass-card-hover p-7 rounded-2xl group"
              >
                <Icon size={22} className="text-[#d4a149] mb-6 transition-transform duration-700 group-hover:scale-110" />
                <div className="heading-display text-5xl sm:text-6xl text-gold-gradient leading-none mb-3">
                  {s.value}
                </div>
                <div className="text-[10px] tracking-[0.28em] uppercase text-[#8a7c62]">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
