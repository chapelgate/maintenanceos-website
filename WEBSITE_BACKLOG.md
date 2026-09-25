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


## Step 2 completion — brand and discoverability

- 2.1 exact public brand name and spelling — **PASS**: product `MaintenanceOS`; public/search identity `MaintenanceOS by Chapelgate`; publisher `Chapelgate`.
- 2.2 category description — **PASS**: `UK maintenance operations software with AI-assisted intake`.
- 2.3 page titles / metadata / visible attribution — **PASS, live verified**; all shared metadata uses the public brand and key pages use category/intent language.
- 2.4 structured data — **PASS**: publisher/product/WebSite identity separated without ratings, reviews, offers, telephone, or certification claims.
- 2.5 brand-search baseline / monitoring — **PASS**: `docs/SEO_BRAND_BASELINE_2026-09-25.md`.

**Live rollout:** **PASS — Step 2 complete.** Cache-bypassed verification on 2026-09-25 proved the new homepage title, visible `MaintenanceOS by Chapelgate` attribution, `Organization` / `WebSite` / `SoftwareApplication` structured data, UK-maintenance AI-receptionist metadata, and updated `llms.txt` on the existing DigitalOcean static app. `WB-001` is closed in `WEBSITE_EXTERNAL_BLOCKERS.md`.

External observation: the bare `MaintenanceOS` name is crowded by unrelated products. The differentiating public identity is therefore mandatory. A future branded production domain remains a launch dependency; this step does not authorise domain spend or duplicate hosting.

## Step 3 completion — sharpen the value proposition

- 3.1 homepage headline around the customer problem/outcome — **PASS, live verified**: `Turn maintenance requests into clear, controlled work.`
- 3.2 one-sentence explanation — **PASS, live verified** and locked in `VALUE_PROPOSITION.md`.
- 3.3 strongest customer benefits — **PASS, live verified**: capture the request clearly; surface critical cases; keep decisions with your team; keep work traceable.
- 3.4 customer benefits separated from technical architecture — **PASS, live verified**: `What your team gets` appears before `How MaintenanceOS keeps control behind the scenes`.
- 3.5 major-page first-screen clarity — **PASS, live verified** across Home, AI receptionist, How it works, Features, Industries, Pricing, Demo, Security, and Contact.

**Verification:** source commit `ecb0e69d39d35e2338adee06e21d993e3b1fffb3`; website regression tests **130/130 PASS**; full repository tests **185/185 PASS**; production static build **30/30 routes generated**; cache-bypassed DigitalOcean acceptance **PASS**.

During verification an existing flaky onboarding-ingest test harness was also fixed: OS-assigned ports that the Fetch standard blocks are now rejected and rebound before local fetch tests run. No product runtime behaviour changed.

**Step 3 status:** **COMPLETE. No open blocker.**

## Step 4 completion — convincing product demonstration

- 4.1 prominent See it work CTA — **PASS, live verified**: homepage secondary CTA points to `/demo/#see-it-work`.
- 4.2 safe demonstration call flow — **PASS, live verified**: existing CustomerDashboard runs in explicit `demoMode`, forces the existing local SAMPLE catalogue, uses no production endpoint, and automatically opens the first fictional transcript.
- 4.3 visual call-to-work example — **PASS, live verified**: existing ProductTour + SAMPLE call/transcript + existing ProductUiShell are joined into one demo journey.
- 4.4 summary, escalation, and operational workflow — **PASS, live verified**: live demo shows the SAMPLE call summary/transcript followed by the existing work-order shell with Human review and Rules hold states.
- 4.5 mobile + desktop journey — **PASS, live verified**: Edge browser-protocol emulation forced a true 390x844 CSS mobile viewport with `documentElement.scrollWidth === 390`, proving zero horizontal overflow; the visual render was inspected and the header, headline, tour and next demo section fit correctly. The live hydrated demo also passed at desktop width with SAMPLE caller, boiler transcript, Human review, and Rules hold.

**Reuse-first evidence:** repository search found all required demo assets already present. External GitHub candidates checked included nilbuild/driver.js, shipshapecode/shepherd, and katspaugh/wavesurfer.js. None was downloaded because each would duplicate existing capability and add dependency/runtime surface. See `docs/STEP4_DEMO_REUSE_DECISION.md`.

**Verification:** source commit `0d3f901a49817adc434ac8036011a1449faed7bd`; focused Step-4 tests **30/30 PASS**; website tests **135/135 PASS**; full repository tests **185/185 PASS**; production static build **30/30 routes generated**; DigitalOcean deployment **PASS**; true-390px mobile DOM width/overflow check **PASS**; inspected mobile render **PASS**; live desktop hydrated demo **PASS**.

**Step 4 status:** **COMPLETE. No open blocker.**
