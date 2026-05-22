import { useEffect, useRef, useState } from "react";
import { PRODUCTS } from "../lib/constants";

/**
 * ProductCinema — scroll-pinned cinematic showcase. Clean crossfade between
 * products (no transform stacking, no rotateY flicker). Each slide gets a
 * dedicated scroll segment; only the active slide renders at opacity 1.
 */
export default function ProductCinema() {
  const wrapRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = wrap.offsetHeight - vh;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      const idx = Math.min(PRODUCTS.length - 1, Math.floor(p * PRODUCTS.length));
      setActive(idx);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      id="products"
      ref={wrapRef}
      data-testid="product-cinema"
      className="relative grain-overlay"
      style={{
        height: `${PRODUCTS.length * 55}vh`,
        background:
          "radial-gradient(ellipse at 50% 30%, #1a130b 0%, #0a0806 60%, #000 100%)",
      }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        {/* ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 70%, rgba(212,161,73,0.18) 0%, transparent 55%)",
          }}
        />

        {/* index strip */}
        <div className="absolute top-1/2 -translate-y-1/2 right-8 z-20 hidden md:flex flex-col gap-3">
          {PRODUCTS.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <span
                className="text-[10px] tracking-[0.28em] uppercase transition-colors duration-500"
                style={{ color: i === active ? "#f5d18c" : "#5a503e" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="block h-px transition-all duration-500"
                style={{
                  width: i === active ? 56 : 24,
                  background: i === active ? "#d4a149" : "#3a3225",
                }}
              />
            </div>
          ))}
        </div>

        {/* section eyebrow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 text-center">
          <div className="eyebrow">— Featured Distribution</div>
          <div
            className="heading-display text-2xl sm:text-3xl text-[#f0e6d2] mt-1 italic"
          >
            Scroll to explore
          </div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* text column (fixed height, crossfade) */}
          <div className="lg:col-span-5 relative h-[420px] z-10">
            {PRODUCTS.map((p, i) => {
              const isActive = i === active;
              if (!isActive) return null;
              return (
                <div
                  key={p.id}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{ animation: "slideFadeIn 0.7s cubic-bezier(0.2,0.8,0.2,1) both" }}
                >
                  <div className="eyebrow mb-4">
                    {String(i + 1).padStart(2, "0")} / {String(PRODUCTS.length).padStart(2, "0")} · {p.accent}
                  </div>
                  <h3 className="heading-display text-5xl sm:text-6xl lg:text-7xl text-[#f0e6d2] leading-[0.95] mb-6">
                    {p.name.split(" ").slice(0, -1).join(" ")}{" "}
                    <span className="text-gold-gradient italic">
                      {p.name.split(" ").slice(-1).join(" ")}
                    </span>
                  </h3>
                  <p className="text-[#c2b69a] text-base sm:text-lg leading-relaxed max-w-md">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* product stage column - only active slide rendered */}
          <div className="lg:col-span-7 relative h-[68vh] sm:h-[72vh]">
            {PRODUCTS.map((p, i) => {
              const isActive = i === active;
              if (!isActive) return null;
              return (
                <div
                  key={p.id}
                  className="absolute inset-0"
                  style={{ animation: "stageFadeIn 0.9s cubic-bezier(0.2,0.8,0.2,1) both" }}
                >
                  {/* outer glow halo */}
                  <div
                    className="absolute -inset-10 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(245,209,140,0.35) 0%, rgba(212,161,73,0.12) 30%, transparent 60%)",
                      filter: "blur(28px)",
                    }}
                  />
                  {/* spotlight beam from top */}
                  <div
                    className="absolute inset-x-0 -top-10 h-1/2 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 0%, rgba(245,209,140,0.18) 0%, transparent 60%)",
                      filter: "blur(10px)",
                    }}
                  />
                  {/* product image frame */}
                  <div
                    className="relative h-full rounded-3xl overflow-hidden flex items-center justify-center"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 35%, rgba(40,30,18,0.95) 0%, rgba(15,12,8,1) 70%, rgba(10,8,6,1) 100%)",
                      boxShadow:
                        "0 80px 160px -30px rgba(0,0,0,0.85), 0 0 100px -10px rgba(212,161,73,0.45), inset 0 1px 0 rgba(245,209,140,0.18)",
                      border: "1px solid rgba(212,161,73,0.4)",
                    }}
                  >
                    {/* subtle inner light from top */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(245,209,140,0.08) 0%, transparent 30%)",
                      }}
                    />

                    <img
                      src={p.image}
                      alt={p.name}
                      className="max-w-[92%] max-h-[92%] object-contain relative z-10"
                      style={{
                        filter:
                          "saturate(1.18) contrast(1.12) brightness(1.06) drop-shadow(0 30px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(212,161,73,0.25))",
                      }}
                      draggable={false}
                    />

                    {/* vignette */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.5) 100%)",
                      }}
                    />

                    {/* sheen sweep on top edge */}
                    <div
                      className="absolute top-0 inset-x-0 h-px pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(245,209,140,0.6), transparent)",
                      }}
                    />
                  </div>

                  {/* floor reflection (warm light pool) */}
                  <div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-12 rounded-[50%] pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse, rgba(245,209,140,0.55) 0%, rgba(212,161,73,0.2) 35%, transparent 70%)",
                      filter: "blur(18px)",
                    }}
                  />
                  {/* secondary deeper shadow */}
                  <div
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[60%] h-5 rounded-[50%] pointer-events-none"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      filter: "blur(10px)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
