# Scanner V2 Stage 2 — Sitemap + Full Frontier Discovery Evidence

Status: COMPLETE / VERIFIED / NOT YET LIVE
Date: 2026-10-02

## Scope

Stage 2 implements discovery only. Scanner V2 remains default-off and the production website continues to use Scanner V1.

Hard boundary: no MaintenanceOS production telephony, carrier routing, live phone number, provider credential, production voice runtime or golden phone line was modified, exercised, rerouted, restarted or redeployed.

## Exact verified source

- Stage 2 verified source SHA: `9374e43df33a5f7bbb5a819e0e3b92c238f95f0b`
- Validation run: `37021989111`
- Validation job: `110887488035`

## Implemented discovery contract

- Parse `Sitemap:` records from robots.txt independently of robots user-agent group semantics.
- Probe same-origin `/sitemap.xml` only when no sitemap is declared.
- Parse `urlset` and `sitemapindex`.
- Recursively traverse same-origin sitemap indexes.
- Dedupe sitemap documents before document/depth ceilings.
- Preserve sitemap `lastmod` as advisory frontier metadata.
- Walk internal links from every accepted same-origin HTML page until the frontier is exhausted or a hard ceiling is reached.
- Apply robots rules before each HTML page fetch.
- Route every sitemap/page network fetch through the existing public-HTTPS DNS/SSRF/redirect-pinning path.
- Record rejected sitemap page URLs as explicit `policy_skipped` manifest rows rather than silently dropping them.
- Record robots-blocked URLs as `robots_skipped`.
- Leave unresolved/limit-hit work visible and report `PARTIAL`; never silently truncate to success.
- Support bounded `.xml.gz` sitemap decoding with a post-decompression hard byte ceiling.
- Keep compressed-response support opt-in so Scanner V1 continues to request identity encoding by default.

## Hard ceilings

- sitemap documents: 64
- sitemap nesting depth: 4
- discovered URLs: 10,000
- HTML fetch attempts: 10,000
- sitemap decompressed bytes: 512 KiB
- HTML page bytes: 512 KiB
- sitemap timeout: 5 seconds
- HTML timeout: 5 seconds

Callers may lower these values for deterministic tests but cannot raise them beyond the reviewed maxima.

## Deterministic acceptance

The integrated fixture proves:
- more than 100 sitemap-discovered pages are accounted for;
- a deep page reachable only by an internal link is discovered and fetched;
- sitemap-only and link-only discovery merge into one frontier;
- robots-disallowed pages are accounted for without being fetched;
- cross-origin, insecure and private sitemap page entries are policy-skipped;
- sitemap document/depth ceilings return explicit PARTIAL;
- URL/page ceilings return explicit PARTIAL with remaining queued evidence;
- duplicate sitemap references do not consume sitemap-document budget;
- missing conventional sitemap is not falsely treated as failure when none was declared;
- declared sitemap failures remain explicit while HTML discovery continues;
- compressed sitemap support is opt-in and bounded;
- invalid gzip and oversized decompression have distinct typed failures.

## Repository validation

GitHub Actions run `37021989111` on the exact verified source:
- Scanner V1 + V2 onboarding package tests: 86/86 PASS.
- Full repository regression: 336/336 PASS.
- Accessibility: 16/16 PASS.
- TypeScript: PASS.
- Production Next.js 16.3.8 build: PASS.
- Static export: 30/30 routes generated.
- `SCANNER_V2_DEFAULT_OFF=PASS`.
- `SCANNER_V1_SCAN_EXTRACT_BUNDLE_UNCHANGED=PASS`.
- `SCANNER_V1_FETCH_COMPRESSION_DEFAULT_OFF=PASS`.
- `GOLDEN_PHONE_LINE_CHANGE_SURFACE=0`.

## Independent NVIDIA review

Evolution Engine review run `37022470896`, job `110888706873`, used the existing included/free NVIDIA development endpoint for reasoning/review only.

Verified markers:
- `NVIDIA_GPT_OSS_STAGE2_REVIEW=PASS`
- `NVIDIA_NEMOTRON_STAGE2_REVIEW=PASS`
- `NVIDIA_STAGE2_TWO_MODEL_REVIEW=PASS`
- `NVIDIA_RAW_OUTPUT_RETAINED=0`
- `NVIDIA_PRODUCTION_SCOPE_ENABLED=0`

Models:
- `openai/gpt-oss-20b`
- `nvidia/nemotron-3.5-lightning-30b-a3b`

No customer secrets, phone data or production credentials were sent to the review models.

## Release state

This stage is additive foundation work. It does not route the public `/create` flow through Scanner V2. Scanner V1 remains the live production/rollback path until subsequent V2 stages pass their gates.

Next implementation boundary: Stage 3 — canonicalization and crawl-trap control.
