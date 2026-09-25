# Step 5 commercial proof policy

Date: 2026-09-25
Owner: MOS Website Manager

## Search-first / reuse-first decision

Existing estate assets already cover the required proof surface:

- signed `PRODUCT_CLAIMS_REGISTER.md`;
- `phoneAiMarketingCards` with VERIFIED / UNDER TEST status;
- `TrustPillars` and `/security/`;
- draft `/privacy/` and `/cookies/` pages;
- `UkScenarioVignettes` labelled as scenarios, not testimonials;
- SAMPLE demo call/transcript and supervisor shell.

External GitHub searches for generic trust/testimonial UI did not produce anything that improved the evidence model enough to justify a dependency. No external package was added.

## Publishable proof today

- VERIFIED capability rows only for present-fact product capabilities.
- R-04: local acceptance recorded 2026-09-10 — full pytest pass, local-closed readiness, SQLite backup/restore.
- S-04: Cloud CI and Security CI baseline pass on canonical application code.
- Existing labelled SAMPLE / scenario material, never represented as customer evidence.

## Not publishable as present proof

- uptime percentages;
- latency / response-time promises;
- SLAs;
- concurrency/capacity numbers;
- named customer case studies, logos, testimonials, ratings or reviews without evidence and permission;
- certifications not earned;
- commercial-GA or live always-on-phone claims.

## Pilot/case-study publication gate

Before a logo, quote, metric, testimonial or case study appears publicly, require:

1. named evidence source;
2. dated outcome/evidence;
3. explicit permission to publish;
4. claims review against `PRODUCT_CLAIMS_REGISTER.md`;
5. no implication of GA or production scale beyond the evidence.
