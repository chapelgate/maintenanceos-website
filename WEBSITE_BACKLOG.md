# WEBSITE_BACKLOG.md

**Owner:** MOS Website Manager  
**Updated:** 2026-09-25  
**Source:** MISSION_BRIEF + current repository/deployment evidence

This is the persistent website problem register. Do not create parallel problem lists for the same website work.

| ID | Item | Status | Owner |
|----|------|--------|-------|
| B1 | Decide dedicated website repository location | **DONE** — `chapelgate/maintenanceos-website` | Website Manager |
| B2 | `PRODUCT_CLAIMS_REGISTER` available in website repo | DONE | Documentation + Claims |
| B3 | Prevent false commercial-live claims | ACTIVE STANDING RULE | All website work |
| S1 | Prove website source/deployment/rollback chain | **DONE** — see `WEBSITE_SOURCE_OF_TRUTH.md` | Website Manager |
| S1-EXT | Read back DigitalOcean App Platform provider-side repo/branch selector | **CLOSED / NON-BLOCKING** — connector cannot expose Apps metadata, but live host content matches canonical source and deployment history names the same app. Recheck only before a hosting mutation; never create a duplicate app. | DevOps |
| F1 | Product Investigator capability brief | TODO | Product Investigator |
| F2 | Positioning/value proposition optimisation | TODO | Positioning |
| F3 | Brand optimisation | IN PROGRESS / implemented baseline exists | Brand |
| F4 | Information architecture | IMPLEMENTED; further optimisation pending | IA |
| F5 | UX journeys visitor → trust → create/demo | PARTIAL | UX |
| F6 | UI component system | IMPLEMENTED baseline | UI |
| F7 | Website repo scaffold | **DONE** — Next.js/TS/Tailwind in canonical repo | Front-End |
| F8 | Claims-gated page copy | PARTIAL / live pre-launch copy exists | Copy |
| F9 | Industries/use-case pages | IMPLEMENTED baseline | Industries |
| F10 | Production lead endpoint | TODO | Forms |
| F11 | Conversion optimisation | TODO | Conversion |
| F12 | Legal page scaffolds | DONE as drafts; legal review still required | Legal |
| F13 | Privacy/cookie/consent finalisation | OPEN — legal review | Privacy |
| F14 | SEO foundation | IMPLEMENTED baseline; optimisation pending | SEO |
| F15 | WCAG 2.2 AA verification | OPEN | Accessibility |
| F16 | Core Web Vitals/performance verification | OPEN | Performance |
| F17 | Security review / hosting-header gaps | OPEN | Security |
| F18 | Consent-gated analytics architecture | OPEN | Analytics |
| F19 | Staging deploy documentation | **DONE** — DigitalOcean static staging documented | DevOps |
| F20 | Automated functional tests | PARTIAL | QA |
| F21 | Mobile/cross-browser QA | OPEN | QA |
| F22 | Red team on staging | OPEN | Red Team |
| F23 | Durable handoff/source-of-truth docs | **DONE for Step 1** — `WEBSITE_SOURCE_OF_TRUTH.md` | Documentation |
| F24 | Final website DoD verification | OPEN | Final Verifier |

## Step 1 completion

Source-of-truth programme 1.1–1.5 is **complete**. The provider App Platform selector is not exposed by the current connector, but live-host verification plus repository/deployment history closes it as non-blocking. The authoritative release source remains `chapelgate/maintenanceos-website` `main`.


## Step 2 status — brand and discoverability

- 2.1 exact public brand name and spelling — **PASS**: product `MaintenanceOS`; public/search identity `MaintenanceOS by Chapelgate`; publisher `Chapelgate`.
- 2.2 category description — **PASS**: `UK maintenance operations software with AI-assisted intake`.
- 2.3 page titles / metadata / visible attribution — **PASS** in source; all shared metadata uses the public brand and key pages use category/intent language.
- 2.4 structured data — **PASS**: publisher/product/WebSite identity separated without ratings, reviews, offers, telephone, or certification claims.
- 2.5 brand-search baseline / monitoring — **PASS in source**: `docs/SEO_BRAND_BASELINE_2026-09-25.md`.

**Live rollout:** **BLOCKED — WB-001**. GitHub `main` contains the Step 2 fixes at `19dd1738ba9d029d8146cd23c029561483186a36`, but the existing DigitalOcean static app was still serving the previous build at the latest fresh verification. See `WEBSITE_EXTERNAL_BLOCKERS.md`. Do not mark Step 2 fully complete until the existing app rebuild is live and verified.

External observation: the bare `MaintenanceOS` name is crowded by unrelated products. The differentiating public identity is therefore mandatory. A future branded production domain remains a launch dependency; this step does not authorise domain spend or duplicate hosting.
