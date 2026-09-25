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
| F5 | UX journeys visitor → trust → create/demo | **IMPLEMENTED / LIVE VERIFIED** — Steps 3–6 | UX |
| F6 | UI component system | IMPLEMENTED baseline | UI |
| F7 | Website repo scaffold | **DONE** — Next.js/TS/Tailwind in canonical repo | Front-End |
| F8 | Claims-gated page copy | **IMPLEMENTED BASELINE / SAFE-AUTOMATION CONSISTENT — Step 8** | Copy |
| F9 | Industries/use-case pages | IMPLEMENTED baseline | Industries |
| F10 | Production lead endpoint | **DONE** — existing Railway RSFM + audited Postgres + Resend notification | Forms |
| F11 | Conversion optimisation | **DONE BASELINE / LIVE VERIFIED** — Step 6 | Conversion |
| F12 | Legal page scaffolds | DONE as drafts; legal review still required | Legal |
| F13 | Privacy/cookie/consent finalisation | OPEN — legal review | Privacy |
| F14 | SEO foundation | **DONE / LIVE VERIFIED — Step 7** | SEO |
| F15 | WCAG 2.2 AA verification | **IMPLEMENTED — Step 47 live verification pending** | Accessibility |
| F16 | Core Web Vitals/performance verification | **DONE / LIVE VERIFIED — Step 46** | Performance |
| F17 | Security review / hosting-header gaps | OPEN | Security |
| F18 | Consent-gated analytics architecture | **DONE BASELINE / LIVE VERIFIED — Step 9** — cookieless first-party measurement; no optional analytics tags currently loaded | Analytics |
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


## Step 5 completion — commercial proof and trust

- 5.1 buyer-friendly proof from technical evidence — **PASS, live verified**: the homepage now has a dedicated `Proof we can show today` section that reuses the signed VERIFIED feature inventory rather than inventing new claims.
- 5.2 reliability / performance claims only where evidenced — **PASS, live verified**: dated R-04 local acceptance and S-04 Cloud CI / Security CI baseline evidence are stated; uptime percentages, latency promises, SLAs, capacity and production-scale claims are explicitly excluded.
- 5.3 sanitized realistic examples — **PASS, live verified**: the existing five UK maintenance playbooks remain labelled as scenarios from product design, not customer stories or live-call samples, and are linked from the proof section.
- 5.4 testimonials / pilots / case studies — **PASS, gated**: a visible pilot / case-study evidence slot is present but stays `Awaiting publishable evidence` until there is a named evidence source, dated outcome, permission to publish, and claims review. No fabricated quote, logo, rating or testimonial was added.
- 5.5 security / privacy / safety / human escalation trust — **PASS, live verified**: the proof section links the existing Security controls, draft Privacy notice, and Human review path; it states that server rules retain safety/lifecycle/approval authority, critical safety latches for authorised human review, and AI has no client-money execution authority.

**Reuse-first evidence:** existing `phoneAiMarketingCards`, `FeatureStatusChip`, `TrustPillars`, `UkScenarioVignettes`, Security/Privacy/How-it-works pages, and the signed `PRODUCT_CLAIMS_REGISTER.md` were reused. External GitHub searches for generic trust/testimonial UI did not justify another dependency. No package, backend, infrastructure, GitHub Actions workflow or paid service was added. See `docs/STEP5_COMMERCIAL_PROOF_POLICY.md`.

**Verification:** source merge `9b1e456e5fc64b61b51b3aa1a745a86f42cc7116`; source-level claims assertions **10/10 PASS**; existing DigitalOcean auto-deploy **PASS**; free live fetch of `#proof` and `#scenarios` **PASS**; live trust links resolve to `/security/`, `/privacy/`, and `/how-it-works/`. Successful live deployment also proves the static site compiled and published.

**Step 5 status:** **COMPLETE. No open blocker.**


## Step 6 completion — customer conversion

- 6.1 primary conversion goal — **PASS**: `Create from website` at `/create/` is the canonical primary commercial action.
- 6.2 one obvious action per important page — **PASS, live build**: shared `CtaPair` keeps the primary action filled and visually demotes secondary actions to a text-link treatment.
- 6.3 short commercial enquiry/demo form — **PASS, live verified**: the shared `LeadCaptureForm` requires only email; name, organisation, role, and message are explicitly optional.
- 6.4 forms connected to the existing workflow — **PASS, live verified**: the static DigitalOcean site now posts to the existing Railway `rsfm-control-plane`; leads are stored as audited, idempotent `maintenanceos / website.lead` Postgres records and notify the existing operator inbox through a sending-only Resend key restricted to the already-verified Chapelgate domain. No new service, database, host, or telephony path was created.
- 6.5 visitor → lead → acknowledgement → follow-up — **PASS, live verified**: the actual public `/contact/` React form returned `data-lead-success="accepted"` and displayed the truthful acknowledgement `Your request was accepted into the lead queue. We will be in touch. No confirmation email was sent.` The matching operator notification was delivered with durable reference `40757fb5-b0a2-44b0-9085-7fb589d036b5` and the same live-form submission details.

**Backend evidence:** `chapelgate/cloud-workers` merge `0da00736298b95f1edd3731431e3391b75803a59`; Railway deployment `322ad0c2-edd4-43c1-8296-ac339c3b765c` **SUCCESS**; `/ready` returned `{"ok":true,"backend":"postgres"}`. The public ingress is origin-allowlisted, honeypot protected, rate limited, durably stored before notification, and isolated from authenticated RSFM and live telephony routes.

**Website evidence:** Step-6 conversion hierarchy merge `088880766ee3a6d2fc59fcc4bc708880026bb140`; production endpoint wiring merge `fed70e8ed87d2d4a13ea57905f740885e3616d5f`. Cache-bypassed live verification proved the updated lead-processing privacy wording and the deployed form. Browser acceptance proved the live form itself used the production endpoint successfully.

**Reuse-first evidence:** existing `LeadCaptureForm`, `lead-adapter`, Railway `rsfm-control-plane`, Postgres record/audit store, Postgres rate limiter, and verified Resend domain were reused. FormSubmit, Web3Forms, StaticForms, Hatchable hosting, Netlify Forms, Vercel, and a new DigitalOcean service were investigated and rejected where they required new accounts, duplicate infrastructure, manual activation, unavailable deployment paths, or weaker control. The temporary FormSubmit probe was removed before permanent use.

**Spend / isolation:** no new app, droplet, database, hosting subscription, GitHub Actions runner, or telephony infrastructure was created. The new Resend credential is sending-only and domain-restricted; it is stored only in Railway runtime configuration, never in Git or client code.

**Step 6 status:** **COMPLETE. No open blocker.**


## Step 7 completion — SEO

- 7.1 buyer-intent terms — **PASS**: current public-search research identified the useful UK commercial language around property maintenance software, maintenance management software, AI maintenance receptionist, and audience-specific maintenance software. The bare `MaintenanceOS` name is crowded by an unrelated live product, so search identity remains `MaintenanceOS by Chapelgate`.
- 7.2 one intent per major landing page — **PASS**: `src/config/seo-intents.ts` and `docs/SEO_INTENT_MAP_2026-09-25.md` map one primary intent to Home, the core property-maintenance page, AI receptionist, Features, How it works, and each of the eight industry pages.
- 7.3 core service / sector pages without duplication — **PASS, live verified**: one canonical `/property-maintenance-software/` page owns the broad non-brand category; the existing eight industry routes own their audience-specific intents. Close synonyms are deliberately consolidated instead of creating thin duplicate pages.
- 7.4 technical SEO — **PASS, live verified**: sitemap, robots, self-canonicals, unique titles/descriptions, public-brand metadata, Organization/WebSite/WebPage/SoftwareApplication structured data, industry BreadcrumbList schema, internal links, and claims-safe `llms.txt` / `llms-full.txt` are present.
- 7.5 SEO monitoring — **PASS**: `npm run seo:monitor` is a zero-dependency live monitor for HTTP status, missing/duplicate metadata, canonical mismatches, noindex, JSON-LD, sitemap inclusion, and robots/sitemap linkage. It cache-busts DigitalOcean checks to avoid false stale-deployment failures. Public-search indexing observations remain recorded in the dated SEO baseline; no paid rank tracker or duplicate monitoring service was created.

**Verification:** Step-7 implementation PR #88 merged as `b2d5dc14fc69418ff1bdaff52e16d44679a2ab71`. Full repository tests **PASS**; production static build **PASS** with 31 static pages; exported SEO tests **20/20 PASS**. Cache-bypassed live acceptance on 2026-09-25 returned HTTP 200 for the new `/property-maintenance-software/` route, confirmed it in `sitemap.xml`, and the full live SEO monitor returned `failures: []`, `ok: true` across the core and eight industry pages.

**Reuse-first evidence:** existing metadata helpers, JSON-LD helpers, sitemap, robots, industry routes, footer navigation, `llms.txt`, `llms-full.txt`, and the current DigitalOcean static deployment were extended. Repository/estate search found no reusable SEO scheduler worth adding. No new app, database, paid SEO tool, GitHub Actions runner, domain purchase, or telephony change was introduced.

**Step 7 status:** **COMPLETE. No open blocker.**


## Step 8 completion — safe automation

- 8.1 translate safety controls into plain English — **PASS**: one canonical public message now explains the boundary as `AI assists. Server rules control. Authorised people approve.` The wording is derived only from signed claims `V-03`, `V-04`, `O-03`, `O-04`, `O-05`, `O-06`, and `S-03`.
- 8.2 explain what AI can automate — **PASS**: the shared model states that AI can collect caller/maintenance details, classify routine maintenance information in UK terminology, and prepare structured records for human-controlled follow-up. Voice intake remains explicitly under testing.
- 8.3 explain approval / human intervention — **PASS**: the same model states that server rules own safety/lifecycle/approval boundaries, critical safety requires authorised human clearance, RED cases can enter HUMAN_REVIEW, and AI has no payment/refund/compensation/fee-waiver/client-money execution authority.
- 8.4 simple visual AI + rules + human escalation — **PASS**: `SafeAutomationModel` renders the same three-stage visual from one shared config: Capture and structure → Enforce the boundaries → Clear consequential actions. The responsive source uses stacked cards below desktop, a three-column flow at `lg`, and desktop-only arrows; no diagram/animation dependency was added.
- 8.5 consistent site-wide safe-automation message — **PASS, live verified**: Home, How it works, AI receptionist, Security, Features, and Property maintenance software all reuse and serve the same component. `llms.txt`, `llms-full.txt`, and the safety FAQ serve the same boundary wording rather than parallel variants.

**Reuse-first evidence:** repository search found the required controls already present in `TrustPillars`, Security, How it works, AI receptionist, homepage principles, the verified feature inventory, and industry copy. External GitHub search did not identify a reusable human-in-the-loop diagram dependency worth adding. The implementation centralises existing evidence in `src/config/safe-automation.ts` and one native React/Tailwind component. See `docs/STEP8_SAFE_AUTOMATION_MODEL.md`.

**Verification:** implementation PR #90 merged as `4368a192df851fe1017b7ba6f08bcd5cad76f138`. Full repository tests **PASS**; production static build **PASS**; focused Step-8/value-proposition/commercial tests **PASS**; all six exported buyer pages contain the canonical safety model. Cache-bypassed live verification on 2026-09-25 proved all six public pages serve the tagline, all three stages, and the `The AI must never` boundary; How it works and Security also serve the full `AI can automate` / `Rules or people must clear` detail. FAQ, `llms.txt`, and `llms-full.txt` are aligned. Responsive layout behaviour is regression-tested in source. A local Edge screenshot harness returned blank frames on this laptop and is not counted as evidence.

**Spend / isolation:** no new app, backend, database, diagram library, paid tool, GitHub Actions runner, or telephony/runtime change.

**Step 8 status:** **COMPLETE. No open blocker.**


## Step 9 completion — measurement

- 9.1 define KPIs for traffic, demo interest, leads, and conversion — **PASS**: `docs/STEP9_MEASUREMENT.md` defines page views, conversion CTA clicks, lead-form starts, durable leads, early-access leads, lead/page-view rate, form errors, client errors, and broken-link health. No unique-user KPI is invented because there is deliberately no persistent visitor identifier.
- 9.2 privacy-conscious analytics — **PASS, live verified**: measurement is first-party and cookieless. Browser events contain only a fixed event name, query-free pathname, optional fixed conversion target path, optional lead type for form lifecycle, and an ephemeral per-event retry id. The client uses no analytics cookie, localStorage/sessionStorage visitor id, referrer, user-agent, query string, error text, or fingerprint. DigitalOcean/Cloudflare may set operational edge cookies such as `__cf_bm`; the live Cookie draft explicitly distinguishes hosting/CDN operational cookies from analytics cookies.
- 9.3 event tracking — **PASS, live verified**: allowed events are `page_view`, `cta_click`, `form_submit_start`, `form_submit_success`, `form_submit_error`, and `client_error`. The deployed Next.js bundle contains the production `website-events` endpoint plus `page_view` / `cta_click` logic. Production acceptance from the real DigitalOcean Origin returned durable references; retrying the same event id returned the same reference, proving idempotent retry handling. Query-bearing paths and unsupported event names returned **422**; an unapproved Origin returned **403**.
- 9.4 failed-form, broken-link, and page-error monitoring — **PASS, live verified**: `npm run website:monitor` crawls the live sitemap/internal links/assets, rejects third-party script sources, checks the existing Railway control plane is Postgres-ready, and checks event-endpoint CORS. Post-deploy acceptance checked **29 internal paths / 47 pages and assets** with `failures: []`, `ok: true`. Form failures and generic client errors are counted without storing form values, exception text, or stacks.
- 9.5 recurring website performance report — **PASS, live verified**: the existing Railway/Postgres/Resend path creates one durable `website.report.weekly` marker per previous UTC week. The first accepted anonymous event in a new week attempts the aggregate report; the idempotency marker prevents repeat sends and allows retry after failure. Live acceptance returned `weekly_report.status=already_sent` for **2026-W38** on multiple accepted events, proving the durable once-per-week marker is active.

**Backend evidence:** `chapelgate/cloud-workers` Step-9 backend commit `e42f9db4600ea810a03bffea4060dbf943241d16`. Focused public metrics + lead tests **9/9 PASS**; wider RSFM control-plane/auth/rate-limit/metrics/lead group **24/24 PASS**. Production event acceptance returned durable references `3863afd0-258c-4696-ad26-4d19589cf929` and `4d4f73cb-a1e7-4313-b234-d9e3aa1ac5e1`; the retry reused the first reference.

**Website evidence:** PR #92 merged as `f68cff70f374406c408f4403cb5bd0d2684302b5`. Full repository tests **PASS**; production static build **PASS**; focused measurement tests **PASS**. The live cookies/privacy/FAQ/`llms.txt`/`llms-full.txt` surfaces all state cookieless first-party measurement, no persistent visitor identifier, and no third-party analytics vendor. The deployed bundle was directly verified to contain the production measurement endpoint and event logic.

**Reuse-first / spend evidence:** reused the existing DigitalOcean static site, Railway `rsfm-control-plane`, audited Postgres records, rate limiter, and sending-only Resend route. No new analytics SaaS, tracking pixel, cookie banner, scheduler, database, app, paid tool, GitHub Actions runner, or telephony/runtime service was created.

**Legal boundary:** Privacy/Cookie/Terms remain drafts pending legal review. Step 9 verifies the implemented measurement architecture and its factual public description; it does not certify PECR/GDPR compliance.

**Step 9 status:** **COMPLETE. No open blocker.**


## Step 46 completion — performance

- **Live Lighthouse baseline:** official Lighthouse 13.5.0 against the existing DigitalOcean site, using Edge 153. Home, Property maintenance software, and Contact were measured on both mobile and desktop profiles.
- **Field-data boundary:** Google PageSpeed Insights returned HTTP 429 during the check, so no CrUX / real-user Core Web Vitals claim is made. Step 46 records Lighthouse lab metrics only.
- **Mobile results:** Home performance 95, CLS 0, TBT 103ms; Property maintenance performance 98, LCP 2.258s, CLS 0, TBT 65ms; Contact performance 100, LCP 1.762s, CLS 0, TBT 19ms.
- **Desktop results:** Home 99 / LCP 0.840s; Property maintenance 100 / LCP 0.417s; Contact 100 / LCP 0.433s; CLS 0 and TBT 0ms on all three.
- **Home mobile repeat check:** first LCP 2.772s was repeated twice rather than treated as fact. Independent runs were 2.772s, 1.827s, and 1.828s; median **1.828s**, below the 2.5s good lab threshold. The LCP element is hero text, not an image.
- **Regression budget:** `npm run performance:budget` checks every exported page after build. Current check covers 27 pages, largest raw initial JS is 485 KB and CSS 47 KB; ceilings are 525 KB JS and 120 KB CSS. Current result: `failures: []`, `ok: true`.
- **No speculative optimisation:** because the repeated Home median is good and Lighthouse transfer is 175–306 KB across the measured pages, no font/render-path change was made merely to improve one noisy sample.

**Evidence:** `docs/STEP46_PERFORMANCE_BASELINE.md` and `scripts/performance-budget.mjs`.

**Spend / reuse:** Lighthouse was used one-off from the official npm package and not added to project dependencies. No paid performance SaaS, browser service, new app, runner, or infrastructure was added.

**Step 46 status:** **COMPLETE. No open blocker.**


## Step 47 completion — accessibility

- **Automated live baseline:** Lighthouse 13.5.0 accessibility audits on Home, Create, Contact, Demo, Pricing, and How it works all scored **100**.
- **Issue found and fixed:** every audited page shared one zero-weight `label-content-name-mismatch` warning on the header wordmark. The visible text was `Maintenance OS by Chapelgate` while an unnecessary `aria-label` forced `MaintenanceOS by Chapelgate`. The `aria-label` was removed so the accessible name now derives from the visible text.
- **WCAG 2.2-oriented controls:** skip link / bypass blocks, global focus-visible styles, sticky-header focus offsets, 24px+ target-size baseline, reduced-motion handling, `en-GB` language, form labels, image alternatives, keyboard Escape handling, and AA colour-contrast tokens are protected.
- **Durable regression gate:** `npm run accessibility:check` runs the existing create-flow accessibility tests plus the new site-wide accessibility tests. Current result: **12/12 PASS**. Full repository tests and production static build also pass.
- **Evidence:** `docs/STEP47_ACCESSIBILITY_BASELINE.md` and `scripts/site-accessibility.test.mjs`.

**Evidence boundary:** automated tooling/source inspection cannot certify every WCAG 2.2 success criterion or substitute for a specialist assistive-technology audit. This step fixes every issue found by the automated live audit and establishes the engineering baseline; it does not claim external certification.

**Step 47 status:** **IMPLEMENTED — pending final live audit of the wordmark fix.**
