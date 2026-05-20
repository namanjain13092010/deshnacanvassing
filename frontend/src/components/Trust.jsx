import { PARTNERS } from "../lib/constants";
import { useScrollReveal } from "../lib/useScrollReveal";

export default function Trust() {
  const ref = useScrollReveal();
  const items = [...PARTNERS, ...PARTNERS];
  return (
    <section
      data-testid="trust-section"
      className="py-20 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #15110d 0%, #0a0806 100%)",
        borderTop: "1px solid rgba(212,161,73,0.12)",
        borderBottom: "1px solid rgba(212,161,73,0.12)",
      }}
    >
      <div ref={ref} className="reveal max-w-7xl mx-auto px-6 lg:px-10 mb-10">
        <div className="flex items-baseline justify-between flex-wrap gap-4">
          <div>
            <div className="eyebrow mb-2">— Brands We Distribute</div>
            <h3 className="heading-display text-3xl sm:text-4xl text-[#f0e6d2]">
              Trusted by India's most recognised <span className="text-gold-gradient italic">FMCG houses</span>.
            </h3>
          </div>
          <p className="text-sm text-[#8a7c62] max-w-md">
            Long-standing tie-ups across rice, oils, atta, pulses, detergents and
            daily essentials.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="marquee-track">
          {items.map((p, i) => (
            <div
              key={`${p}-${i}`}
              className="flex items-center justify-center px-10 py-4"
              style={{
                minWidth: 220,
                borderLeft: "1px solid rgba(212,161,73,0.1)",
              }}
            >
              <span
                className="heading-display text-3xl sm:text-4xl text-[#c2b69a] hover:text-[#f5d18c] transition-colors"
                style={{ letterSpacing: "0.02em" }}
              >
                {p}
              </span>
            </div>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-32"
          style={{ background: "linear-gradient(90deg, #0a0806, transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-32"
          style={{ background: "linear-gradient(-90deg, #0a0806, transparent)" }}
        />
      </div>
    </section>
  );
}
