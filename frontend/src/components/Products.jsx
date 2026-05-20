import { useRef } from "react";
import { PRODUCTS } from "../lib/constants";
import { useScrollReveal } from "../lib/useScrollReveal";
import { MoveUpRight } from "lucide-react";

function ProductCard({ p, idx }) {
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width - 0.5) * 2;
    const py = (y / rect.height - 0.5) * 2;
    card.style.transform = `perspective(1200px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateZ(0)`;
    const img = card.querySelector("[data-img]");
    if (img) img.style.transform = `translate3d(${px * 12}px, ${py * 12}px, 60px) scale(1.06)`;
    const sheen = card.querySelector("[data-sheen]");
    if (sheen) {
      sheen.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(245,209,140,0.22) 0%, transparent 45%)`;
    }
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1200px) rotateX(0) rotateY(0)";
    const img = card.querySelector("[data-img]");
    if (img) img.style.transform = "translate3d(0,0,0) scale(1)";
    const sheen = card.querySelector("[data-sheen]");
    if (sheen) sheen.style.background = "transparent";
  };

  return (
    <div
      ref={cardRef}
      data-testid={`product-${p.id}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative glass-card glass-card-hover rounded-2xl overflow-hidden group cursor-pointer"
      style={{ transformStyle: "preserve-3d", transition: "transform 0.4s cubic-bezier(0.2,0.8,0.2,1)" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 60%, rgba(212,161,73,0.18) 0%, transparent 70%)",
          }}
        />
        <img
          data-img
          src={p.image}
          alt={p.name}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ filter: "saturate(1.05) contrast(1.05)" }}
          loading="lazy"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 40%, rgba(10,8,6,0.85) 100%)",
          }}
        />
        {/* floor reflection */}
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[70%] h-3 rounded-[50%] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(245,209,140,0.45) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />
        <div className="absolute top-4 left-4 text-[10px] tracking-[0.28em] uppercase text-[#f5d18c] px-3 py-1 rounded-full"
             style={{ background: "rgba(10,8,6,0.6)", border: "1px solid rgba(245,209,140,0.3)" }}>
          {String(idx + 1).padStart(2, "0")} · {p.accent}
        </div>
        <div data-sheen className="absolute inset-0 pointer-events-none transition-opacity" />
      </div>

      <div className="p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="heading-display text-2xl lg:text-3xl text-[#f0e6d2]">{p.name}</h3>
          <MoveUpRight
            size={18}
            className="text-[#8a7c62] group-hover:text-[#f5d18c] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
          />
        </div>
        <p className="text-sm text-[#c2b69a] leading-relaxed">{p.desc}</p>
      </div>
    </div>
  );
}

export default function Products() {
  const ref = useScrollReveal();
  return (
    <section
      id="products"
      data-testid="products-section"
      className="section-pad relative grain-overlay"
      style={{ background: "linear-gradient(180deg, #100c08 0%, #0a0806 100%)" }}
    >
      <div ref={ref} className="reveal max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-6">
            <div className="eyebrow mb-4">— Product Universe</div>
            <h2 className="heading-display text-4xl sm:text-5xl lg:text-6xl text-[#f0e6d2]">
              Every grain. Every brand.
              <br />
              <span className="text-gold-gradient italic">One reliable network.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 self-end">
            <p className="text-[#c2b69a] text-base sm:text-lg leading-relaxed">
              Hover each category to feel the depth. Every product passes through our
              ledger of trust — sourced from verified mills and brands, distributed to
              partners we know by name.
            </p>
          </div>
        </div>

        <div className="reveal-stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} p={p} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
