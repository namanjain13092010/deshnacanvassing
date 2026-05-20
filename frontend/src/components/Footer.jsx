import { LOGO_URL } from "../lib/constants";

export default function Footer() {
  return (
    <footer
      data-testid="footer"
      className="relative py-14 border-t border-[rgba(212,161,73,0.15)]"
      style={{ background: "#0a0806" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-3 gap-10 items-center">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="Deshna"
            className="h-12 w-auto"
            style={{ filter: "drop-shadow(0 0 12px rgba(212,161,73,0.35))" }}
          />
        </div>

        <div className="text-center font-serif-luxe italic text-[#c2b69a] text-lg">
          "Trust always creates opportunities."
        </div>

        <div className="text-right text-xs text-[#8a7c62] tracking-[0.18em] uppercase">
          © {new Date().getFullYear()} Deshna Canvassing · Vijayapura, Karnataka
        </div>
      </div>
    </footer>
  );
}
