import { useScrollReveal } from "../lib/useScrollReveal";

const PARAGRAPHS = [
  `In the bustling grain markets of Karnataka, where trust is valued more than contracts and relationships matter more than transactions, a young dreamer named Pintu Vanigota began building something extraordinary.`,
  `He did not come from a world of luxury or instant success. Like many hardworking entrepreneurs, Pintu started with determination, patience, and a deep understanding of people. He spent years observing the market — understanding the struggles of wholesalers, retailers, distributors, and manufacturers. He noticed one common problem everywhere: businesses needed someone they could truly trust.`,
  `That realization became the seed of Deshna Canvassing.`,
  `What started as a small commission agency slowly grew into a reliable bridge between brands and businesses. Pintu believed that canvassing was not just about selling products; it was about building long-term relationships. Whether it was rice, pulses, flour, edible oils, detergent soaps, or daily essential goods, he worked with honesty and consistency, ensuring both buyers and suppliers benefited equally.`,
  `In the early days, there were challenges — long travel hours, uncertain deals, market competition, and financial pressure. Many people doubted whether a small canvassing firm could survive in such a competitive industry. But Pintu carried one powerful belief:`,
];

const CLOSING = [
  `Instead of chasing quick profits, he focused on service, reliability, and commitment. He personally met clients, understood their needs, and solved problems with sincerity. Slowly, word spread across markets and industries. People began recognizing Deshna Canvassing not only as a business, but as a dependable name.`,
  `Today, Deshna Canvassing stands as a symbol of trust, hard work, and smart distribution. Behind every successful deal is the dedication of a founder who believed that relationships are the strongest currency in business.`,
];

function Paragraph({ children }) {
  const ref = useScrollReveal({ threshold: 0.25 });
  return (
    <p
      ref={ref}
      className="reveal text-[#c2b69a] text-lg sm:text-xl leading-[1.85] font-light"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      {children}
    </p>
  );
}

export default function Story() {
  const headRef = useScrollReveal();
  const quoteRef = useScrollReveal();
  return (
    <section
      id="story"
      data-testid="story-section"
      className="section-pad relative overflow-hidden grain-overlay"
      style={{
        background:
          "radial-gradient(ellipse at 80% 0%, rgba(212,161,73,0.08) 0%, transparent 50%), linear-gradient(180deg, #0a0806 0%, #15110d 50%, #0a0806 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div ref={headRef} className="reveal mb-16 text-center">
          <div className="eyebrow mb-4 inline-block">— Our Story</div>
          <h2 className="heading-display text-5xl sm:text-6xl lg:text-7xl text-[#f0e6d2]">
            From a market alley
            <br />
            to a <span className="text-gold-gradient italic">house of trust.</span>
          </h2>
        </div>

        <div className="space-y-8">
          {PARAGRAPHS.map((p, i) => (
            <Paragraph key={i}>
              {i === 0 ? (
                <>
                  <span
                    className="float-left text-gold-gradient heading-display text-7xl leading-[0.85] mr-3 mt-1"
                    style={{ fontWeight: 600 }}
                  >
                    I
                  </span>
                  {p.slice(1)}
                </>
              ) : (
                p
              )}
            </Paragraph>
          ))}

          <div ref={quoteRef} className="reveal py-12 my-8 relative">
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(212,161,73,0.6) 50%, transparent 100%)",
              }}
            />
            <blockquote
              className="text-center heading-display text-4xl sm:text-5xl lg:text-6xl italic text-gold-gradient leading-tight"
              data-testid="story-quote"
            >
              "Trust always creates opportunities."
            </blockquote>
            <div
              className="absolute inset-x-0 bottom-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(212,161,73,0.6) 50%, transparent 100%)",
              }}
            />
          </div>

          {CLOSING.map((p, i) => (
            <Paragraph key={`c-${i}`}>{p}</Paragraph>
          ))}
        </div>
      </div>
    </section>
  );
}
