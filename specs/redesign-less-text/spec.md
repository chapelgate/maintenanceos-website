# Specification: MaintenanceOS Redesign (Less Text, High Scannability, Chapelgate Design System)

## Objective
Execute a comprehensive front-end and copy redesign across the MaintenanceOS website (`github.com/chapelgate/maintenanceos-website`). Cut verbose marketing copy by over 50% (under 8,500 total words across the site), replace walls of text with structured Bento-grid cards and progressive disclosure accordions, and adopt the Chapelgate corporate design system matching `https://chapelgate-technologies-site-nciy8.ondigitalocean.app/style.css` exactly.

## Context & Feedback
Product Owner feedback:
> "It's like a textbook, too much text. Make it clear, crisp, easy to navigate and follow, friendlier on the eye. Keep needed text, but spread it out or cut what's unnecessary."

Owner-mandated design system (from Andy, matching the Chapelgate corporate site):
- Colours: background `#0A1728`; cards `#112A40`, secondary panels `#0E2236`; accent and primary buttons `#67E8F9`; text `#E6EEF6`, muted text `#A9B8C9`; borders `rgba(103,232,249,.16)`.
- Type: Inter, then system sans-serif, 17px/1.65. Hero heading clamp 38-68px, bold, letter-spacing -0.02em. Section headings 28-40px. Intro text 18-21px, muted.
- Layout: max width 1160px, 24px side padding (`.wrap`).
- Cards: 14px radius (`--r: 14px`), 28px padding, thin cyan border, 44px cyan line icon on a soft cyan tint.
- Buttons: min height 48px, 10px radius, weight 600; primary cyan on navy (`#0A1728` text on `#67E8F9`), secondary outlined (`rgba(230,238,246,.3)`).
- Pill status badges.
- CTA panels with 20px radius.
- Focus: 3px cyan outline (`outline: 3px solid var(--cyan); outline-offset: 3px; border-radius: 6px`).
- Menu collapses to a button below 1000px; cards stack below 480px.

## Core Design Principles
1. **Do the Hard Work to Make It Simple (GOV.UK):** Keep sentences under 25 words, paragraphs under 3 sentences / 35 words.
2. **High-Density Visual Calm (Linear):** Bento-grid cards, subtle borders, high contrast, crisp microcopy.
3. **Progressive Disclosure:** Primary takeaway surfaced immediately (Tier 1); detailed edge cases inside native `<details><summary>` accordions (Tier 2).
4. **Confident, Straightforward Kindness (Monzo):** Plain assertions of capability and boundaries without repetitive apologetic disclaimers.
5. **Radical Scannability (Basecamp & Stripe):** Bold lead-in phrases, visual pipeline connectors.

## Non-Negotiable Constraints
1. **Legal & Compliance Pages Content:** DO NOT alter the text content of `/privacy/`, `/cookies/`, `/terms/`, and `/accessibility/`.
2. **Safety Rule Meanings & Emergency Guidance:** DO NOT weaken or alter the factual meaning of the safety rules. All emergency numbers (`999`, `NHS 111`, `0800 111 999` Gas Emergency, `0800 002 001` NI), the "never invent" constraints, and the requirement for human clearance of critical hazards must remain 100% intact.
3. **Existing Routes & URLs:** DO NOT rename, move, or delete any page routes.
4. **WCAG 2.2 AA Accessibility:** Zero accessibility violations; maintain keyboard navigation, focus states, skip links, semantic landmarks.
5. **Clean Verification:** `npm ci`, `npm test`, and `npm run build` must all pass.

## Target Word Counts
- Site total: < 8,500 words (reduced from 16,984 words)
- Homepage (`/`): <= 380 words
- How It Works (`/how-it-works/`): <= 450 words
- Safety Rules (`/how-we-keep-control/`): <= 750 words
- Features (`/features/`): <= 360 words
- Security (`/security/`): <= 290 words
- Industries Hub (`/industries/`): <= 180 words
- 8 Sector Pages (`/industries/[sector]/`): <= 460 words each
- FAQ (`/faq/`): <= 400 words
- Pricing (`/pricing/`): <= 160 words
- Demo (`/demo/`): <= 260 words
- About (`/about/`): <= 160 words
- Contact (`/contact/`): <= 120 words
