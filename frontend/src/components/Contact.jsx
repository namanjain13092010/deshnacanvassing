import { useState } from "react";
import axios from "axios";
import { Phone, MapPin, MessageCircle, Send, Loader2 } from "lucide-react";
import { PHONES, ADDRESS_LINES, WHATSAPP_NUMBER } from "../lib/constants";
import { useScrollReveal } from "../lib/useScrollReveal";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Contact() {
  const ref = useScrollReveal();
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill name, email and message.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success("Message received. We'll be in touch soon.");
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (err) {
      toast.error("Could not send. Please call us directly.");
    } finally {
      setLoading(false);
    }
  };

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Deshna Canvassing, I'd like to discuss a distribution enquiry."
  )}`;

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="section-pad relative overflow-hidden grain-overlay"
      style={{
        background:
          "radial-gradient(ellipse at 70% 30%, rgba(212,161,73,0.1) 0%, transparent 55%), linear-gradient(180deg, #0a0806 0%, #15110d 100%)",
      }}
    >
      <div ref={ref} className="reveal max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <div className="eyebrow mb-4">— Get in Touch</div>
          <h2 className="heading-display text-4xl sm:text-5xl lg:text-6xl text-[#f0e6d2] mb-4">
            Let's build the next <span className="text-gold-gradient italic">handshake.</span>
          </h2>
          <p className="text-[#c2b69a] max-w-xl mx-auto">
            Whether you are a manufacturer looking for ground reach or a retailer
            looking for trusted supply — we'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Phone cards */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card glass-card-hover p-7 rounded-2xl" data-testid="contact-phone-card">
              <Phone size={20} className="text-[#d4a149] mb-5" />
              <div className="eyebrow mb-3 text-[10px]">Phone</div>
              <div className="space-y-2">
                {PHONES.map((p) => (
                  <a
                    key={p}
                    href={`tel:${p}`}
                    data-testid={`contact-phone-${p}`}
                    className="block heading-display text-2xl text-[#f0e6d2] hover:text-[#f5d18c] transition-colors"
                  >
                    {p.slice(0, 4)} {p.slice(4, 7)} {p.slice(7)}
                  </a>
                ))}
              </div>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              data-testid="contact-whatsapp-btn"
              className="glass-card glass-card-hover p-7 rounded-2xl block group"
              style={{ borderColor: "rgba(212,161,73,0.35)" }}
            >
              <MessageCircle size={20} className="text-[#d4a149] mb-5" />
              <div className="eyebrow mb-3 text-[10px]">WhatsApp</div>
              <div className="flex items-center justify-between gap-3">
                <div className="heading-display text-xl text-[#f0e6d2]">
                  Chat instantly
                </div>
                <Send size={16} className="text-[#f5d18c] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-[#8a7c62] mt-3">Replies typically within minutes.</p>
            </a>

            <div className="glass-card glass-card-hover p-7 rounded-2xl" data-testid="contact-address-card">
              <MapPin size={20} className="text-[#d4a149] mb-5" />
              <div className="eyebrow mb-3 text-[10px]">Address</div>
              <div className="text-[#f0e6d2] font-serif-luxe text-lg leading-relaxed">
                {ADDRESS_LINES.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            data-testid="contact-form"
            className="lg:col-span-8 glass-card p-7 sm:p-10 rounded-2xl space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <Field name="name" label="Name" value={form.name} onChange={onChange} required />
              <Field name="email" label="Email" type="email" value={form.email} onChange={onChange} required />
              <Field name="phone" label="Phone" value={form.phone} onChange={onChange} />
              <Field name="company" label="Company" value={form.company} onChange={onChange} />
            </div>
            <Field name="message" label="Message" textarea value={form.message} onChange={onChange} required />

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#8a7c62]">
                We respect your inbox · No spam, ever
              </p>
              <button
                type="submit"
                data-testid="contact-submit"
                disabled={loading}
                className="btn-gold disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ name, label, value, onChange, type = "text", textarea = false, required }) {
  const id = `field-${name}`;
  return (
    <label htmlFor={id} className="block">
      <span className="block text-[10px] tracking-[0.28em] uppercase text-[#8a7c62] mb-2">
        {label}
        {required ? " *" : ""}
      </span>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          value={value}
          onChange={onChange}
          required={required}
          data-testid={`field-${name}`}
          className="w-full bg-transparent border border-[rgba(212,161,73,0.2)] focus:border-[rgba(245,209,140,0.6)] outline-none rounded-xl px-4 py-3 text-[#f0e6d2] placeholder:text-[#8a7c62] transition-colors resize-none"
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          data-testid={`field-${name}`}
          className="w-full bg-transparent border border-[rgba(212,161,73,0.2)] focus:border-[rgba(245,209,140,0.6)] outline-none rounded-xl px-4 py-3 text-[#f0e6d2] placeholder:text-[#8a7c62] transition-colors"
        />
      )}
    </label>
  );
}
