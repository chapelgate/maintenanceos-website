# Fonio website readiness

**Verified through:** `chapelgate/maintenanceos-website` `main` at Continuation Step 2 baseline; original #64 funnel work plus later live-verified website programme releases.
**Stance:** PRE-LAUNCH. The **website onboarding path is substantially ready**. This is **not** a “complete vs Fonio” marketing claim. Live phone parity remains **open**.

Use this note to separate **code already on main** from **launch / enablement dependencies**. Detail lives in the linked runbooks — do not duplicate click-by-click deploy steps here.

**Owner decision: do not use Render.** `render.yaml` is **legacy / do not use**. Marketing stays DigitalOcean App Platform **static** free (`output: 'export'`). This file does **not** create DigitalOcean or Render resources.

## Done on main (code / site)

### `/create` funnel

Public path **EXISTS**: **Website → Check → Choose → Review → Pack** → optional scripted sandbox → early access. Not a live receptionist and not a live number.

| Piece | On main | Honest scope |
| --- | --- | --- |
| Multi-step `/create` | HAVE | Early-access / preview only |
| Knowledge pack + system prompt | PARTIAL | `packages/receptionist-draft`; missing fields stay missing; not RAG / not a live tenant |
| SSRF-safe website scan | PARTIAL / UNDER TEST | Flagged `packages/onboarding-ingest`; off by default |
| Pack-aware scripted sandbox | PARTIAL | Flagged `packages/sandbox-test-call`; WebRTC / live forbidden |
| Conversation benchmark | HAVE (scripted) | `npm run conversation-benchmark`; not voice-quality parity |
| Google + M365 calendar scaffolds | PARTIAL | Flagged `packages/calendar-adapters`; not live on staging |

When `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` is unset, `/create` **queues** the crawl and invents nothing. That is expected.

### Marketing alignment

Pages and discoverability name the same funnel. No live phone, always-on, GA, ratings, invented £, invented SLAs, or certification theatre.

- `/how-it-works`, `/features`, `/demo` — Website → Check → Choose → Review → Pack; sandbox / calendars UNDER TEST or coming; live phone COMING
- `/industries/*` — UK edge (999 vs jobs, contractor-dispatch language, out-of-hours honesty, no client-money). Positioning only — not product superiority
- `/faq` + FAQPage JSON-LD, `/pricing` (request pricing; Create CTA), `/contact` (human enquiry, not a support desk), `/security` (designed-control trust posture; SSRF-safe scan under test; no ISO / SOC 2 / bank-grade)
- `/cookies` — DRAFT FOR LEGAL REVIEW; no site-wide consent banner; no analytics or marketing tags today; not a Google Analytics / PECR / GDPR compliance certification
- SEO titles / OG, claims-safe JSON-LD, `llms.txt` / `llms-full.txt`
- Accessibility baseline (`docs/STEP47_ACCESSIBILITY_BASELINE.md`); current Next 16 release budget **≤ 600 KB raw / ≤ 190 KB gzip initial first-party JS** (`PERFORMANCE_BUDGET.md`)
- Static CSP **meta** + referrer (`docs/security/static-security-baseline.md`) — not HTTP security headers on App Platform static
- `/create` + `/privacy` website-URL ingest note (**DRAFT FOR LEGAL REVIEW**)

### Staging

Staging host: `https://seahorse-app-4oasq.ondigitalocean.app/`. Staging `/create` is live and **claims-safe**. With the scan endpoint unset, crawl is queued. That is not a website code defect.

## Launch / enablement dependencies (not current engineering blockers)

These are **not** missing website features. Do not open product PRs to “fix” them.

1. **Live scan on staging** — create or use a **DigitalOcean droplet** and run `packages/onboarding-ingest` (`docs/ONBOARDING_SCAN_DEPLOY.md`; Docker or systemd; `ONBOARDING_WEB_INGEST=true`; HTTPS reverse proxy), set DigitalOcean `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` to `https://<droplet-host>/v1/onboarding/scan` (and any other `NEXT_PUBLIC_*` companions you are wiring), then **rebuild** the static site. `NEXT_PUBLIC_*` is inlined at `npm run build`. A runtime-only App Platform restart is not enough. Runbook: [`STAGING_COMPANIONS.md`](STAGING_COMPANIONS.md), [`ONBOARDING_SCAN_DEPLOY.md`](ONBOARDING_SCAN_DEPLOY.md). Not a spend request. Do **not** apply `render.yaml`.
2. **Legal review** — `/privacy`, `/cookies`, `/terms`, and the website-URL ingest note stay **DRAFT FOR LEGAL REVIEW** until counsel clears them. No invented DPO or GDPR sign-off. No invented analytics, consent banner, or Google Analytics / PECR / GDPR certification.
3. **Frozen live telephony** — always-on customer phone stays **out of scope** until a controlled-call **GO**. Scripted sandbox HAVE is not live-call or Fonio voice parity. Do not touch the frozen voice path.

Until dependency 1 is deliberately enabled, `/create` must queue crawl and invent nothing. That is expected — **not a website code defect**.

## Host split (do not collapse)

| Surface | Host |
| --- | --- |
| Marketing website | DigitalOcean App Platform **static** free (`output: 'export'`) |
| Onboarding scan | **DigitalOcean droplet** (Node + systemd or Docker). Not App Platform static. Not Render. |
| Frozen live voice | Untouched (`maintenanceos-redteam` / production voice). Not this companion. |

There is no documented App Platform **web service** path for companions. Do not convert the static marketing app into a Node service to “save a droplet.”

## Do not claim

- Complete vs Fonio, Fonio-parity, or “done”
- Live always-on phone, instant live number, or commercially GA
- Live knowledge crawl on staging (until blocker 1 is evidenced)
- Final privacy / terms / cookies (until blocker 2)
- ISO, SOC 2, bank-grade security, or other certifications
- Invented tracking, a live consent banner, or Google Analytics / PECR / GDPR compliance certification
- Voice-quality parity from `npm run conversation-benchmark`

## Related

| Doc | Use |
| --- | --- |
| [`competitive/fonio-parity-matrix.md`](competitive/fonio-parity-matrix.md) | Feature-by-feature HAVE / PARTIAL / MISSING |
| [`roadmap/fonio-parity-roadmap.md`](roadmap/fonio-parity-roadmap.md) | Phased build list |
| [`STAGING_COMPANIONS.md`](STAGING_COMPANIONS.md) | Owner scan / companion wiring |
| [`ONBOARDING_SCAN_DEPLOY.md`](ONBOARDING_SCAN_DEPLOY.md) | DigitalOcean droplet runbook |
| [`FONIO_LOCAL_E2E.md`](FONIO_LOCAL_E2E.md) | Loopback demo only — not production |
| [`../PRODUCT_CLAIMS_REGISTER.md`](../PRODUCT_CLAIMS_REGISTER.md) | VERIFIED vs UNDER TEST (F-01–F-05) |
