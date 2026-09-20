# ReceptionistOS core architecture

**Date:** 2026-09-20  
**Status:** design for build — PRE-LAUNCH  
**Constraint:** do not rewrite the frozen live telephony path on Render `maintenanceos-redteam-v2` until controlled-call gates pass.

## Product shape

```
ReceptionistOS CORE
  ├── Voice runtime (providers abstracted)
  ├── Knowledge + provenance
  ├── Tools / actions (calendar, CRM, tickets)
  ├── Tenant + auth
  ├── Onboarding (website → receptionist)
  └── Vertical packs
        ├── MaintenanceOS (first)
        ├── Property / Letting / Landlord / …
        └── Future industry *OS lines
```

Marketing sites remain static (DigitalOcean free tier). Product APIs and voice run separately.

## Bounded contexts

| Context | Responsibility | Notes |
| --- | --- | --- |
| Onboarding | URL ingest, extract, create tenant+assistant draft | Untrusted crawl content; never inject into system prompts raw |
| Knowledge | Collections, citations, approve-to-learn | Every fact has source URL/snippet/hash when from web |
| Voice | Session, STT/TTS/LLM, barge-in, transfer | Reuse pilot modules behind feature flags |
| Tools | Calendar, CRM, job systems | Calendar v0: `packages/calendar-adapters` (flagged off). Deterministic allowlists; money/safety latches |
| Comms | SMS/email summaries, webhooks | Opt-in; retention controls |
| Admin | Dashboard, transcripts, analytics | Customer-facing; not Streamlit-only |

## Website → receptionist data flow (target ~60s)

1. User submits HTTPS business URL on `/create`.
2. Ingestion service: DNS allowlist, block private IPs (SSRF), fetch robots-respecting pages (cap pages/bytes/time).
3. Extract structured draft: business name, hours, services, FAQs, contact, locations.
4. Create **sandbox** tenant + receptionist draft (not production telephony by default).
5. User reviews/edits knowledge; picks voice + greeting.
6. Optional: sandbox test call / “CALL MY RECEPTIONIST” against non-production number.
7. Promote to live only after explicit confirm + number assignment.

## Provider abstraction

Do not hard-code a single LLM/voice vendor in product APIs. Pilot currently uses Gemini Live under testing — treat as one adapter.

## Safety non-negotiables (MaintenanceOS DNA)

- No inventing bookings, dispatches, prices, or legal advice.
- No money execution from voice without human/deterministic gate.
- UK emergency: **999** (not 911).
- Explicit human transfer on request.
- Crawl text is **untrusted data**, never system instructions.

## Deployment split

| Surface | Hosting |
| --- | --- |
| Marketing (`maintenanceos-website`) | DigitalOcean App Platform static free |
| Company site | DigitalOcean static + chapelgatetechnologies.com |
| Product APIs / voice | Separate (pilot on Render today — freeze until gates) |
| Ingestion / onboarding API | New service; feature-flagged |

## Related docs

- `docs/competitive/fonio-parity-matrix.md`
- `docs/product/onboarding-website-to-receptionist.md`
- `docs/roadmap/fonio-parity-roadmap.md`
- `docs/security/threat-model-onboarding-ingest.md`
