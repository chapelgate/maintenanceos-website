# WEBSITE_BACKLOG.md

**Owner:** MOS Website Manager
**Updated:** 2026-09-30
**Source:** MISSION_BRIEF + current repository/deployment evidence

This is the single persistent website problem register. Do not create parallel problem lists for the same website work.

| ID | Item | Status | Owner |
|----|------|--------|-------|
| B1 | Decide dedicated website repository location | **DONE** — `chapelgate/maintenanceos-website` | Website Manager |
| B2 | `PRODUCT_CLAIMS_REGISTER` available in website repo | DONE | Documentation + Claims |
| B3 | Prevent false commercial-live claims | ACTIVE STANDING RULE | All website work |
| S1 | Prove website source/deployment/rollback chain | **DONE** — see `WEBSITE_SOURCE_OF_TRUTH.md` | Website Manager |
| S1-EXT | Read back DigitalOcean App Platform provider-side repo/branch selector | **CLOSED / NON-BLOCKING** — connector cannot expose Apps metadata, but live host content matches canonical source and deployment history names the same app. Recheck only before a hosting mutation; never create a duplicate app. | DevOps |
| F1 | Product Investigator capability baseline | **DONE BASELINE** — signed `PRODUCT_CLAIMS_REGISTER.md` + `docs/competitive/PHONE_AI_FEATURE_INVENTORY.md` exist | Product Investigator |
| F1-REFRESH | Refresh product evidence against current `maintenanceos-v1-pilot` before expanding present-fact claims or launch | **DONE — refreshed 2026-09-30** against exact product checkpoint `498ad82dd87631814195d447d89458480b117951`; 196/196 targeted claims/safety tests PASS; current live greet-then-stall defect and undeployed verified hotfix keep voice/production gates conservative | Product Investigator |
| F2 | Positioning/value proposition optimisation | **DONE BASELINE / LIVE VERIFIED** — canonical `VALUE_PROPOSITION.md`; original Step 3 complete | Positioning |
| F3 | Brand optimisation | **DONE BASELINE / LIVE VERIFIED** — `BRAND_SYSTEM.md`; original Step 2 complete; future refinement is iterative, not a blocker | Brand |
| F4 | Information architecture | **DONE BASELINE / LIVE VERIFIED** — current route map + `docs/SEO_INTENT_MAP_2026-09-25.md`; future refinement is iterative | IA |
| F5 | UX journeys visitor → trust → create/demo | **DONE / LIVE VERIFIED** — original Steps 3–6 | UX |
| F6 | UI component system | **DONE BASELINE** — shared visual/components system is implemented and covered by regression tests | UI |
| F7 | Website repo scaffold | **DONE** — Next.js/TS/Tailwind in canonical repo | Front-End |
| F8 | Claims-gated page copy | **DONE BASELINE / LIVE VERIFIED** — current signed register + shared safe-automation model; original Step 8 | Copy |
| F9 | Industries/use-case pages | **DONE / LIVE VERIFIED** — eight industry routes + distinct intent metadata; original Step 7 | Industries |
| F10 | Production lead endpoint | **DONE** — existing Railway RSFM + audited Postgres + Resend notification | Forms |
| F11 | Conversion optimisation | **DONE BASELINE / LIVE VERIFIED** — original Step 6 | Conversion |
| F12 | Legal page scaffolds | **DONE ENGINEERING** — privacy/cookies/terms remain visibly DRAFT FOR LEGAL REVIEW | Legal |
| F13 | Privacy/cookie/consent implementation | **DONE BASELINE / LIVE VERIFIED** — cookieless first-party measurement; no optional analytics/marketing tags | Privacy |
| F13-LEGAL | Counsel review/finalisation of privacy, cookies, terms, controller details, lawful bases and retention | **OPEN HUMAN LAUNCH GATE** — not an engineering blocker | Legal |
| F14 | SEO foundation | **DONE / LIVE VERIFIED** — original Step 7 | SEO |
| F15 | WCAG 2.2 AA-oriented engineering baseline | **DONE / LIVE VERIFIED** — original Step 47; automated/source baseline, not third-party certification | Accessibility |
| F15-MANUAL | Full manual keyboard + assistive-technology accessibility pass | **OPEN LAUNCH QA** — automated baseline does not substitute for specialist/manual coverage | Accessibility + QA |
| F16 | Performance / Core Web Vitals-oriented lab verification | **DONE / LIVE VERIFIED** — original Step 46; lab evidence, not field/CrUX claim | Performance |
| F17 | Website security engineering review | **DONE BASELINE** — `WEBSITE_SECURITY_REVIEW.md` + static security baseline; dependency audit and secret-pattern scan clean on 2026-09-27 | Security |
| F17-HEADERS | HTTP response-header / clickjacking protection on current static host | **ENGINEERING INVESTIGATION COMPLETE / HUMAN LAUNCH RISK DECISION** — live audit confirms missing arbitrary response headers; current DO static spec exposes CORS rather than a proven arbitrary-header control; strict executable gate added; accept risk or separately review hosting/edge change before public launch | Security + DevOps |
| F18 | Consent-gated analytics architecture | **DONE BASELINE / LIVE VERIFIED** — original Step 9; cookieless first-party measurement | Analytics |
| F19 | Staging deploy documentation | **DONE** — DigitalOcean static staging documented; companion docs aligned to DO-only policy | DevOps |
| F20 | Automated functional/release tests | **DONE BASELINE** — full repository tests + build + performance + accessibility + live health + exact release-SHA verification are release gates | QA |
| F21 | Mobile/cross-browser QA | **DONE ENGINEERING / MANUAL HARDWARE GATE REMAINS** — Edge plus Playwright Firefox/WebKit now cover six buyer-critical routes at 390px, 768px and 1440px (54 route/engine/viewport checks total); physical Safari/iOS and manual AT/keyboard coverage remain launch-only human QA | QA |
| F22 | Red team on staging | **DONE AUTOMATED / BOUNDED** — 2026-09-27 public-surface red-team regression passed 0 failures under an 18-request budget; this is not an independent penetration test | Red Team |
| F23 | Durable handoff/source-of-truth docs | **DONE** — `CURSOR_HANDOFF.md`, `WEBSITE_SOURCE_OF_TRUTH.md`, Website Manager loop | Documentation |
| F24 | Original website engineering DoD verification | **DONE** — original 50-step programme release verified; separate continuation/launch gates remain tracked | Final Verifier |
| C1 | Continuation Step 1 — freeze/prove current baseline | **DONE — final code release `2f893f5c5c8a45d46f2db4fec4fa3c146424d78b` verified live; closure evidence recorded in the continuation runbook and PR thread** | Website Manager |
| C1-SEC | Next 15/PostCSS dependency advisories | **RESOLVED IN CANDIDATE** — Next 16.3.6 candidate audits at zero known vulnerabilities | Security + Front-End |
| C1-LINT | Preserve lint as a release gate after Next 16 migration | **RESOLVED IN CANDIDATE** — explicit release-preflight lint + regression assertion | QA + Front-End |
| C1-REACT | Four modern React effect-state lint findings | **RESOLVED IN CANDIDATE** — fixed without rule suppression | Front-End |
| C1-PERF | Next 16 runtime exceeds legacy raw-only JS ceiling | **RESOLVED IN CANDIDATE** — measured before/after + dual 600 KB raw / 190 KB gzip gate | Performance |
| C1-COMPAT | Newest-major toolchain compatibility | **NON-BLOCKING UPSTREAM HOLD** — current Next lint plugins require ESLint 9; current TypeScript lint tooling requires TS below 6.1 | Toolchain |
| C1-VERIFY | Windows deployment-verifier mismatch path aborted through libuv assertion after awaited fetch | **RESOLVED / LIVE VERIFIED** — verifier returns an exit code instead of calling `process.exit()` during fetch cleanup; mismatch regression added and final live verification passed | Website Manager |
| C1-SEO-OOM | One final-record SEO monitor run hit a transient Node heap allocation failure on the validation workstation | **RESOLVED / ENVIRONMENT TRANSIENT** — Node heap limit and free RAM were normal; immediate isolated rerun passed with zero SEO failures; no site/code change required | Website Manager |
| C1-LOOPBACK | One docs-only preflight run timed out several localhost test servers on `127.0.0.1` | **RESOLVED / ENVIRONMENT TRANSIENT** — the exact failing loopback suites immediately reran 22/22 PASS; no production code or test thresholds changed | QA |
| C3 | Continuation Step 3 — refresh website product evidence against current canonical MaintenanceOS source | **DONE IN CANDIDATE** — exact product checkpoint pinned; claims register re-signed; provider-specific marketing wording removed; commissioning-only local voice candidate kept UNDER TEST; no live/GA promotion | Product Investigator + Website Manager |
| C3-PRODUCT-WIN | Broad product pytest on Windows cannot execute Linux `resource` concurrency modules and reports POSIX-mode semantics differently on NTFS | **NON-BLOCKING ENVIRONMENT LIMIT** — claims promotion relies on 88/88 targeted control regressions; broad Windows run still passed 356 tests and no concurrency/production claim was promoted | Product Investigator + QA |
| C4 | Continuation Step 4 — positioning/message refinement | **DONE IN CANDIDATE** — buyer message sharpened around structured UK maintenance intake, critical-vs-routine separation, human authority and traceability; public provider/competitor wording removed; no capability claim promoted | Positioning + Website Manager |
| C5 | Continuation Step 5 — brand/UI consistency | **DONE IN CANDIDATE** — publisher identity normalised to Chapelgate; pricing CTA restored to shared accent token + 44px minimum target; regression added for naming/token drift | Brand + Front-End + Website Manager |
| C6 | Continuation Step 6 — full functional QA | **DONE IN CANDIDATE** — zero-dependency exported-site + local lead-contract smoke added to release preflight; no production side effects | QA + Website Manager |
| C7 | Continuation Step 7 — mobile/cross-browser QA | **DONE ENGINEERING / EXTENDED 2026-09-30** — existing real-Edge mobile/tablet/desktop smoke retained; dev-only Playwright Firefox + WebKit matrix adds the same six critical routes across 390px/768px/1440px with console/page-error capture and failure screenshots; physical Safari/iOS/manual AT remain explicit human launch coverage | QA + Front-End |
| C8 | Continuation Step 8 — security hardening | **DONE ENGINEERING IN CANDIDATE** — live header inventory executable added; meta CSP/referrer verified; unsupported static-host response headers documented as explicit residual launch risk; no duplicate hosting | Security + DevOps + Website Manager |
| C9 | Continuation Step 9 — red-team public staging | **DONE IN CANDIDATE** — bounded 18-request live staging red-team passed 0 failures; sensitive paths/methods/reflection/redirect/error leakage/CORS checked without destructive activity | Red Team + Defender |
| C10 | Continuation Step 10 — accessibility verification | **DONE ENGINEERING IN CANDIDATE** — 12/12 source/export checks + 18/18 real-Edge viewport checks pass; manual AT/Safari remains explicit human launch QA | Accessibility + QA |
| C11 | Continuation Step 11 — performance verification | **DONE IN CANDIDATE** — 28 exported pages pass 600 KB raw / 190 KB gzip JS and 120 KB CSS budgets; no field-CWV claim | Performance + Website Manager |
| C12 | Continuation Step 12 — SEO/machine discovery verification | **DONE IN CANDIDATE** — llms/search metadata aligned to current provider-neutral positioning; stale owner-blocked/provider/competitor language removed; currentness regression added | SEO + Product Investigator |
| C13 | Continuation Step 13 — conversion path acceptance | **DONE IN CANDIDATE** — 9/9 conversion regressions, production control-plane readiness/CORS and local 26-route lead smoke pass; no duplicate production lead created | Conversion + Forms + Website Manager |
| C14 | Continuation Step 14 — legal/launch gate separation | **DONE IN CANDIDATE** — human legal/manual-browser/security-risk/owner approvals separated from completed engineering; public launch default false; regression prevents checkbox/compliance theatre | Website Manager + Gate Owners |
| C15 | Continuation Step 15 — final engineering RC/freeze | **ENGINEERING RC PASS / RELEASE PENDING** — exact candidate passed 205/205 website tests, 185/185 package/runtime tests, build, functional, browser, security, bounded red-team, conversion, SEO, audit and secret gates; close operationally only after PR merge + exact DigitalOcean merge-SHA verification + durable PR record | Website Manager + Final Verifier |

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
- **Issues found and fixed:** the shared header wordmark and footer wordmark both carried redundant accessible-name overrides while their visible text already supplied the correct name. Both overrides were removed so the accessible names derive from visible text.
- **WCAG 2.2-oriented controls:** skip link / bypass blocks, global focus-visible styles, sticky-header focus offsets, 24px+ target-size baseline, reduced-motion handling, `en-GB` language, form labels, image alternatives, keyboard Escape handling, and AA colour-contrast tokens are protected.
- **Durable regression gate:** `npm run accessibility:check` runs the existing create-flow accessibility tests plus the new site-wide accessibility tests. Current result: **12/12 PASS**. Full repository tests and production static build also pass.
- **Evidence:** `docs/STEP47_ACCESSIBILITY_BASELINE.md` and `scripts/site-accessibility.test.mjs`.

**Evidence boundary:** automated tooling/source inspection cannot certify every WCAG 2.2 success criterion or substitute for a specialist assistive-technology audit. This step fixes every issue found by the automated live audit and establishes the engineering baseline; it does not claim external certification.

**Final live verification:** PR #96 merged as `c780f12ec51aa1d93bcb998be10edd5e8ff55a1f`. Cache-bypassed live HTML returned zero `aria-label="MaintenanceOS by Chapelgate"` occurrences. Final Lighthouse 13.5.0 re-audits on Home and Contact both scored **100**, with **0** `label-content-name-mismatch` items.

**Step 47 status:** **COMPLETE. No open blocker.**


## Step 48 completion — automated uptime and deployment checks

- **Uptime / integration check — PASS:** `npm run uptime:check` reuses the existing Step-9 live health monitor rather than creating another crawler. It checks sitemap pages, same-origin links/assets, absence of third-party scripts, Railway Postgres readiness, and public-event CORS.
- **Exact deployment identity — PASS:** every production build generates ignored `public/release.json` from the source SHA. Builds fail if no verifiable SHA can be determined.
- **Deployment gate — PASS, live verified:** `npm run deployment:verify` requires the live marker to match local `HEAD` or `EXPECTED_COMMIT`, then runs the live health monitor.
- **Live evidence:** PR #98 merged as `d50225a92654317e72d27a0a17d4479af7339e7d`; live `/release.json` reports that exact SHA; deployment verification returned `failures: []`, `ok: true`; the reused health monitor checked 29 internal paths / 47 pages-assets with `failures: []`, `ok: true`.
- **Cost / reuse:** no new monitoring SaaS, scheduler, GitHub Actions job, app, database, runner, or telephony change.

**Step 48 status:** **COMPLETE. No open blocker.**


## Step 49 completion — release control

- Safe pre-merge gate — **IMPLEMENTED**: `npm run release:preflight` requires a clean branch, full tests, production build, performance budget, accessibility gate, and a release marker matching branch HEAD.
- Change control — **IMPLEMENTED**: production website changes remain PR-to-`main`; release identity is the Step-48 source SHA marker.
- Rollback — **IMPLEMENTED**: `npm run rollback:plan -- <bad-sha>` produces a revert-only branch/PR plan. It does not mutate the repo itself and forbids shared-history reset/force-push.
- Runtime isolation — **IMPLEMENTED**: website rollback instructions explicitly prohibit using voice/backend infrastructure to repair a marketing-site regression.
- Reuse / spend — **PASS**: existing Git/GitHub, DigitalOcean deployment, performance, accessibility, release-marker and health-monitor controls are reused. No new service or paid runner.

**Verification:** PR #100 merged as `e113eb7d08c99910bb83b0eb3f5a96cbfa745c2a`. The clean-tree release preflight passed the full **185/185** repository tests, 31-page production build, Step-46 performance budget and Step-47 accessibility **12/12** gate. The existing DigitalOcean deployment then published that exact SHA in `/release.json`; `release:verify` returned `failures: []`, `ok: true`, followed by the reused health monitor checking **29 internal paths / 47 pages-assets** with zero failures.

**Step 49 status:** **COMPLETE. No open blocker.**


## Step 50 completion — Website Manager closed loop

- Monitor + detect — **IMPLEMENTED**: `manager:monitor` composes the existing website-health and SEO monitors and records `healthy` or `repair_required`.
- Repair — **CONTROLLED**: a failing monitor stops the loop and requires the smallest evidence-backed repair before rechecking. A healthy site is explicitly not modified.
- Test — **IMPLEMENTED**: `manager:preflight` reuses the Step-49 clean-tree release preflight.
- Deploy — **CONTROLLED**: PR-to-`main` remains the only deployment trigger; the manager does not directly mutate DigitalOcean or shared Git history.
- Verify — **IMPLEMENTED**: `manager:verify` requires an exact merge SHA and reuses Step-48 deployment verification.
- Record — **IMPLEMENTED**: `manager:record` requires healthy monitor + passed preflight + verified deployment, then writes bounded local evidence and posts the durable release evidence to the PR.

**Execution evidence:** Step-50 implementation PR #102 merged as `910a12063af4a9eb2375be46f67c8f8567359ee5`. The manager loop then completed in order: monitor/detect **healthy** (website health 29 internal paths / 47 pages-assets, SEO monitor `failures: []`); repair **not required**; manager preflight **PASS** with the full **185/185** repository tests, 31-page static build, performance budget and accessibility **12/12**; DigitalOcean published the exact merge SHA in `/release.json`; manager verify returned `status: verified`; manager record posted the durable release evidence to PR #102 comment `#issuecomment-5840942994`. No alternate deploy path, force-push, manual hosting mutation, duplicate service, or telephony/runtime change was used.

**Programme boundary:** this closes the original 50-step website engineering improvement programme. Separate items already tracked in this backlog — including final legal review, broader security review, mobile/cross-browser QA, and red-team work — remain separate launch/governance gates and are not falsely marked complete by Step 50.

**Step 50 status:** **COMPLETE. No open blocker in the original 50-step engineering programme.**

## Continuation Step 1 — baseline freeze and current toolchain

This continuation starts after the original 50-step programme. It does not reopen
or renumber those completed steps.

- Starting source/live pin — **PASS**: `main` and live `/release.json` both
  resolved to `be5fc313a5eeec52b968481f0181ae1261b467d6` before changes.
- Existing-site health — **PASS**: Website Manager health and SEO monitors had
  zero failures; old-stack preflight passed 185/185 tests, build, performance,
  and accessibility 12/12.
- Dependency/security drift — **FOUND AND REPAIRED IN CANDIDATE**: Next 15.5.25
  carried two npm audit findings through its PostCSS dependency. Next 16.3.6
  candidate reports zero known npm vulnerabilities.
- Release diagnostics — **HARDENED**: lint is now an explicit preflight gate
  because Next 16 no longer runs lint as part of `next build`.
- Modern React findings — **REPAIRED**: four effect-state findings fixed without
  disabling the rule.
- Performance regression handling — **PASS**: measured clean Next 15 vs Next 16
  exports; retained a strict raw limit and added a gzip transfer limit rather
  than silently weakening the gate.
- Least privilege — **PASS**: no new credentials, services, hosting resources,
  telephony changes, or approval for the pending transitive resolver postinstall.
- Evidence/runbook — `docs/CONTINUATION_STEP1_BASELINE_FREEZE.md`.

**Close condition:** merge through the normal PR path, verify the exact merged
SHA is served by the existing DigitalOcean static app, run Website Manager
post-deploy verification, then update C1 to DONE and record the final freeze SHA.
