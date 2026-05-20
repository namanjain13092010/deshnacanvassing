import { useEffect, useRef, useState } from "react";
import { PRODUCTS } from "../lib/constants";

/**
 * ProductCinema — a sticky, scroll-pinned cinematic showcase inspired by
 * Maastricht Porselein / Apple product pages. As the user scrolls through
 * the section, a single large product image rotates, scales, and morphs
 * into the next product with cross-fade. Editorial typography overlay.
 */
export default function ProductCinema() {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 within current slide

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      // total scroll inside section minus sticky viewport
      const total = wrap.offsetHeight - vh;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      const slideCount = PRODUCTS.length;
      const slideFloat = p * slideCount;
      const idx = Math.min(slideCount - 1, Math.floor(slideFloat));
      const local = slideFloat - idx;
      setActive(idx);
      setProgress(local);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={wrapRef}
      data-testid="product-cinema"
      className="relative grain-overlay"
      style={{
        height: `${PRODUCTS.length * 80}vh`,
        background:
          "radial-gradient(ellipse at 50% 30%, #1a130b 0%, #0a0806 60%, #000 100%)",
      }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center"
      >
        {/* ambient warm glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 70%, rgba(212,161,73,0.18) 0%, transparent 55%)",
          }}
        />

        {/* progress index strip */}
        <div className="absolute top-1/2 -translate-y-1/2 right-8 z-20 hidden md:flex flex-col gap-3">
          {PRODUCTS.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <span
                className="text-[10px] tracking-[0.28em] uppercase transition-all duration-500"
                style={{
                  color: i === active ? "#f5d18c" : "#5a503e",
                  opacity: i === active ? 1 : 0.6,
                }}
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
            className="heading-display text-2xl sm:text-3xl text-[#f0e6d2] mt-1"
            style={{ fontStyle: "italic" }}
          >
            Scroll to explore
          </div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-8 items-center">
          {/* text column */}
          <div className="lg:col-span-5 relative z-10">
            {PRODUCTS.map((p, i) => {
              const isActive = i === active;
              const offset = i === active ? 0 : i < active ? -40 : 40;
              return (
                <div
                  key={p.id}
                  className="absolute inset-0 flex flex-col justify-center transition-all duration-700"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: `translateY(${offset}px)`,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
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
            {/* spacer to give the column height */}
            <div className="h-[420px]" />
          </div>

          {/* product stage column */}
          <div
            className="lg:col-span-7 relative h-[60vh] sm:h-[70vh]"
            style={{ perspective: "1600px" }}
          >
            {PRODUCTS.map((p, i) => {
              const isActive = i === active;
              const isPrev = i < active;
              // Movement: incoming slides scale up + rotate in
              const slideProgress = isActive ? progress : isPrev ? 1 : 0;
              const scale = isActive ? 0.95 + slideProgress * 0.1 : isPrev ? 1.05 : 0.85;
              const rotY = isActive ? -10 + slideProgress * 20 : isPrev ? 20 : -30;
              const tx = isActive ? 0 : isPrev ? -120 : 120;
              const opacity = isActive ? 1 : 0;
              return (
                <div
                  key={p.id}
                  className="absolute inset-0 transition-all duration-[1100ms] ease-out"
                  style={{
                    opacity,
                    transform: `translate3d(${tx}px, 0, 0) rotateY(${rotY}deg) scale(${scale})`,
                    transformStyle: "preserve-3d",
                    transformOrigin: "center",
                  }}
                >
                  {/* glow halo */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(245,209,140,0.25) 0%, transparent 55%)",
                      filter: "blur(20px)",
                    }}
                  />
                  {/* product image */}
                  <div
                    className="absolute inset-0 rounded-3xl overflow-hidden"
                    style={{
                      boxShadow:
                        "0 60px 120px -20px rgba(0,0,0,0.7), 0 0 80px -10px rgba(212,161,73,0.3)",
                      border: "1px solid rgba(212,161,73,0.25)",
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      style={{
                        filter: "saturate(1.05) contrast(1.05)",
                      }}
                      draggable={false}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 50%, rgba(10,8,6,0.6) 100%)",
                      }}
                    />
                  </div>
                  {/* reflection / floor */}
                  <div
                    className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[70%] h-12 rounded-[50%]"
                    style={{
                      background:
                        "radial-gradient(ellipse, rgba(212,161,73,0.35) 0%, transparent 70%)",
                      filter: "blur(18px)",
                      opacity: 0.7,
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
