# Plan: MaintenanceOS Redesign (Less Text, High Scannability, Chapelgate Design System)

Plan for overhaul across design system, stylesheets, components, page copy, and verification:

1. **Design System & Global CSS Overhaul:**
   - Integrate Chapelgate corporate stylesheet tokens and classes into `src/app/globals.css`.
   - Update theme tokens: background `#0A1728`, cards `#112A40`, panels `#0E2236`, cyan accent `#67E8F9`, hover `#A5F3FC`, text `#E6EEF6`, muted `#A9B8C9`, line `rgba(103,232,249,.16)`.
   - Style cards (14px radius, 28px padding), buttons (48px height, 10px radius, cyan on navy), CTA panels (20px radius), focus (3px cyan outline).
   - Ensure responsive rules match: max width 1160px, 24px padding, menu collapses at 1000px, cards stack at 480px.

2. **Core Component Library Implementation:**
   - Bento card styling (`mos-bento-card` / `.card`).
   - Progressive disclosure accordions (`mos-accordion` / `<details><summary>`).
   - Visual process pipeline (`mos-pipeline` / `.steps`).
   - Emergency warning banner (`mos-emergency-banner`).
   - Governance & trust strip (`HomeTrustStrip`).

3. **Page-by-Page Transformation:**
   - Homepage (`/`): Clear hero, Benefits Bento (4 cards), 5-step pipeline, 8 sector pills, remove stock photo bands.
   - How It Works (`/how-it-works/`): SVG intake journey flow, 5 setup step cards with accordions, 3 objection FAQ accordions.
   - Safety Rules (`/how-we-keep-control/`): Top hero, emergency warning banner, 3 pillars bento, 6 "Never Invent" micro-cards, 4 progressive disclosure accordions.
   - Features (`/features/`): 2x3 Bento grid (UK Voice Intake, Fixed Rule Safety Latches, Explicit Human Transfer, Evidence Audit Trails, Role-Scoped Agents, Multi-Tenant Data Isolation).
   - Security (`/security/`): 4 Bento cards (Tenant Isolation, Zero Client-Money Authority, Audit Trails, Honest Certification Status).
   - Industries Hub & 8 Sector Pages (`/industries/` & `/industries/*`): 8 vertical cards on hub; modular template on sector pages (hero, 3 benefits, safety boundary, 3 FAQs, early demo CTA) cutting duplicate boilerplate.
   - FAQ (`/faq/`): Two accordion categories (Product & Telephone Status, Safety, Security & Privacy).
   - Supporting pages: Pricing, Demo, About, Contact pruned to concise limits.

4. **Preserve Boundaries & Constraints:**
   - Preserve legal pages (`/privacy/`, `/cookies/`, `/terms/`, `/accessibility/`) verbatim.
   - Maintain safety rule meanings, emergency numbers, and routes.

5. **Verification & Testing:**
   - Measure before and after word counts per page using automated script.
   - Run `npm ci`, `npm test`, `npm run accessibility:check`, and `npm run build`.
   - Fix all regressions until 100% test pass.
