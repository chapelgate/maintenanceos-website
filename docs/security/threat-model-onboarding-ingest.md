# Threat model — website onboarding ingest

## Assets

- Customer tenants, knowledge, transcripts
- Cloud credentials / telephony providers
- Reputation (prompt injection → bad calls)

## Trust boundaries

| Boundary | Rule |
| --- | --- |
| Public `/create` form | Rate limit, CAPTCHA/abuse controls, email verify when public |
| Crawl fetcher | Implemented in `packages/onboarding-ingest`: public HTTPS only; RFC1918/link-local/metadata denied; DNS + redirect re-check; page/byte/time caps; `ONBOARDING_WEB_INGEST` off by default. A hosted companion (`docs/ONBOARDING_SCAN_DEPLOY.md`) is the same process on a **DigitalOcean droplet** — enable ingest only when intended; anyone who can POST `/v1/onboarding/scan` can request a (guarded) public HTTPS fetch. |
| Extracted text | Untrusted; never concatenate into system prompts; store as data with provenance |
| Promote-to-live | Human confirm; separate from sandbox |
| Extracted text | Untrusted; never concatenate into system prompts; store as data with provenance |
| Promote-to-live | Human confirm; separate from sandbox |

## Threats & mitigations

| Threat | Mitigation |
| --- | --- |
| SSRF to cloud metadata / internal | IP deny lists, no redirects to private, resolve-then-connect checks. Hosting the companion on a DigitalOcean droplet does not relax these rules. |
| Prompt injection via page content | Treat as untrusted data; tool allowlists; refuse money/safety actions |
| Abuse (scan others’ sites at scale) | Auth, quotas, ToS, logging; 20 POSTs/min/connected IP; keep `ONBOARDING_WEB_INGEST` off until staging `/create` should crawl |
| PII leakage in crawl cache | Retention limits; encryption at rest |
| Supply-chain on parsers | Pin deps; sandbox parse |

## Non-goals

- Full WAF replacement
- Guaranteeing third-party site accuracy
- Binding this fetcher to frozen live telephony or turning DigitalOcean static hosting into an API host
