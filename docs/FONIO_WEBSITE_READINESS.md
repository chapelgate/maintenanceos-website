# Fonio website readiness (through #62)

**Verified through:** `chapelgate/maintenanceos-website` `main` including merged PR **#62** (claims-safe `/security`).  
**Stance:** PRE-LAUNCH. The **website onboarding path is substantially ready**. This is **not** a “complete vs Fonio” marketing claim. Live phone parity remains **open**.

Use this note to separate **code already on main** from **owner blockers**. Detail lives in the linked runbooks — do not duplicate click-by-click deploy steps here.

## Done on main (code / site)

### `/create` funnel

Public path **EXISTS**: **Website → Check → Review → Pack** → optional scripted sandbox → early access. Not a live receptionist and not a live number.

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

- `/how-it-works`, `/features`, `/demo` — Website → Check → Review → Pack; sandbox / calendars UNDER TEST or coming; live phone COMING
- `/industries/*` — UK edge (999 vs jobs, contractor-dispatch language, out-of-hours honesty, no client-money). Positioning only — not product superiority
- `/faq` + FAQPage JSON-LD, `/pricing` (request pricing; Create CTA), `/contact` (human enquiry, not a support desk), `/security` (designed-control trust posture; SSRF-safe scan under test; no ISO / SOC 2 / bank-grade)
- SEO titles / OG, claims-safe JSON-LD, `llms.txt` / `llms-full.txt`
- Accessibility baseline (`docs/A11Y_GAP_AUDIT.md`); default First Load JS **≤ 110 kB** (`PERFORMANCE_BUDGET.md`)
- Static CSP **meta** + referrer (`docs/security/static-security-baseline.md`) — not HTTP security headers on App Platform static
- `/create` + `/privacy` website-URL ingest note (**DRAFT FOR LEGAL REVIEW**)

### Staging

Staging `/create` is live and **claims-safe**. With the scan endpoint unset, crawl is queued. That is not a website code defect.

## Owner blockers (not code defects)

These are **not** missing website features. Do not open product PRs to “fix” them.

1. **Live scan on staging** — create / wake the Render **free** onboarding-scan service, set DigitalOcean `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` (and any other `NEXT_PUBLIC_*` companions you are wiring), then **rebuild** the static site. `NEXT_PUBLIC_*` is inlined at `npm run build`. Runbook: [`STAGING_COMPANIONS.md`](STAGING_COMPANIONS.md), [`ONBOARDING_SCAN_DEPLOY.md`](ONBOARDING_SCAN_DEPLOY.md). Not a spend request.
2. **Legal review** — `/privacy`, `/cookies`, `/terms`, and the website-URL ingest note stay **DRAFT FOR LEGAL REVIEW** until counsel clears them. No invented DPO or GDPR sign-off.
3. **Frozen live telephony** — always-on customer phone stays **out of scope** until a controlled-call **GO**. Scripted sandbox HAVE is not live-call or Fonio voice parity. Do not touch the frozen voice path.

## Do not claim

- Complete vs Fonio, Fonio-parity, or “done”
- Live always-on phone, instant live number, or commercially GA
- Live knowledge crawl on staging (until blocker 1 is evidenced)
- Final privacy / terms / cookies (until blocker 2)
- ISO, SOC 2, bank-grade security, or other certifications
- Voice-quality parity from `npm run conversation-benchmark`

## Related

| Doc | Use |
| --- | --- |
| [`competitive/fonio-parity-matrix.md`](competitive/fonio-parity-matrix.md) | Feature-by-feature HAVE / PARTIAL / MISSING |
| [`roadmap/fonio-parity-roadmap.md`](roadmap/fonio-parity-roadmap.md) | Phased build list |
| [`STAGING_COMPANIONS.md`](STAGING_COMPANIONS.md) | Owner scan / companion wiring |
| [`FONIO_LOCAL_E2E.md`](FONIO_LOCAL_E2E.md) | Loopback demo only — not production |
| [`../PRODUCT_CLAIMS_REGISTER.md`](../PRODUCT_CLAIMS_REGISTER.md) | VERIFIED vs UNDER TEST (F-01–F-05) |
