import { useEffect, useState } from "react";
import { LOGO_URL } from "../lib/constants";

const links = [
  { href: "#story", label: "Our Story" },
  { href: "#products", label: "Products" },
  { href: "#founder", label: "Founder" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="navbar"
      className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
      style={{
        backdropFilter: scrolled ? "blur(18px) saturate(140%)" : "blur(0px)",
        background: scrolled
          ? "linear-gradient(180deg, rgba(10,8,6,0.85) 0%, rgba(10,8,6,0.6) 100%)"
          : "transparent",
        borderBottom: scrolled ? "1px solid rgba(212,161,73,0.15)" : "1px solid transparent",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3" data-testid="nav-logo">
          <img
            src={LOGO_URL}
            alt="Deshna"
            className="h-12 w-auto"
            style={{ filter: "drop-shadow(0 0 12px rgba(212,161,73,0.4))" }}
          />
        </a>

        <ul className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-[12px] tracking-[0.28em] uppercase text-[#c2b69a] hover:text-[#f5d18c] transition-colors duration-500"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          data-testid="nav-cta"
          className="hidden md:inline-flex btn-gold"
          style={{ padding: "0.7rem 1.4rem", fontSize: "0.72rem" }}
        >
          Get in touch
        </a>

        <button
          data-testid="nav-mobile-toggle"
          onClick={() => setOpen(!open)}
          className="md:hidden text-[#f5d18c] p-2"
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-px bg-[#f5d18c] mb-1.5" />
          <span className="block w-6 h-px bg-[#f5d18c] mb-1.5" />
          <span className="block w-4 h-px bg-[#f5d18c] ml-auto" />
        </button>
      </nav>

      {open && (
        <div className="md:hidden glass-card border-t border-[rgba(212,161,73,0.2)]">
          <ul className="px-6 py-6 space-y-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm tracking-[0.2em] uppercase text-[#c2b69a]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
