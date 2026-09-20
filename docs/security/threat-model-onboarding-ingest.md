# Threat model — website onboarding ingest

## Assets

- Customer tenants, knowledge, transcripts
- Cloud credentials / telephony providers
- Reputation (prompt injection → bad calls)

## Trust boundaries

| Boundary | Rule |
| --- | --- |
| Public `/create` form | Rate limit, CAPTCHA/abuse controls, email verify when public |
| Crawl fetcher | Only public HTTPS; block RFC1918/link-local/metadata IPs; DNS rebinding checks; size/time caps |
| Extracted text | Untrusted; never concatenate into system prompts; store as data with provenance |
| Promote-to-live | Human confirm; separate from sandbox |

## Threats & mitigations

| Threat | Mitigation |
| --- | --- |
| SSRF to cloud metadata / internal | IP deny lists, no redirects to private, resolve-then-connect checks |
| Prompt injection via page content | Treat as untrusted data; tool allowlists; refuse money/safety actions |
| Abuse (scan others’ sites at scale) | Auth, quotas, ToS, logging |
| PII leakage in crawl cache | Retention limits; encryption at rest |
| Supply-chain on parsers | Pin deps; sandbox parse |

## Non-goals

- Full WAF replacement
- Guaranteeing third-party site accuracy
