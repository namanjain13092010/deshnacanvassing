# Deshna Canvassing — PRD

## Original Problem Statement
Premium cinematic 3D business website for "Deshna Canvassing" with ultra-modern animations, immersive transitions, realistic product visualization. Dark premium tones with golden highlights, cinematic lighting, floating particles, grain textures, smooth motion graphics.

## Architecture
- **Backend**: FastAPI + MongoDB. Endpoints: `POST /api/contact`, `GET /api/contact`.
- **Frontend**: React (CRA), Tailwind, shadcn UI components, sonner toasts, Plus Jakarta Sans + Cormorant Garamond fonts.
- **Animations**: Pure canvas particle physics (no Three.js — lighter weight). CSS keyframes, IntersectionObserver scroll reveals, mouse-tracked 3D tilt cards.

## User Personas
- Manufacturer / brand looking for distribution reach in Karnataka.
- Wholesale buyer / retailer looking for trusted FMCG supply.
- General visitor learning about Deshna Canvassing's brand story.

## Core Requirements (Static)
- Cinematic grain particle loader with logo reveal.
- Hero with logo + tagline "Building Trust Through Distribution".
- Founder story (Pintu Vanigota), founder quote spotlight with glowing frame.
- Product showcase (6 categories with 3D tilt + parallax).
- Trust marquee (brand partners).
- Contact: phones (9901112555, 7848888555), WhatsApp click-to-chat, address (Industrial Area, Indi Road, Vijayapura 586101), inquiry form.
- Dark + gold luxury aesthetic; responsive.

## What's Implemented (2026-02)
- Backend: `POST /api/contact`, `GET /api/contact` with MongoDB, Pydantic models, ISO datetime.
- Frontend: Cinematic loader (700-grain physics), Navbar, Hero (particles canvas), Highlights stats, Products (3D tilt cards), Story (drop-cap reveal + golden quote), Founder spotlight (glow frame), Trust marquee, Contact (glass cards + form + WhatsApp), Footer.
- Sonner toasts integrated.
- WhatsApp click-to-chat link to 919901112555.
- Skip-intro CTA, mobile responsive nav.

## Backlog / Next
- P1: Replace founder placeholder photo with actual Pintu Vanigota photo.
- P1: Admin view of contact submissions.
- P2: Multi-language (Kannada / Hindi) toggle.
- P2: Add CMS so client can update partner list & product copy.
- P2: SEO meta tags, Open Graph image, sitemap.
