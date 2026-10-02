# Scanner V1 Baseline Characterization

Status: FROZEN BASELINE FOR SCANNER V2 BUILD
Date: 2026-10-02
Freeze branch: `freeze/scanner-v1-baseline-20261002`
Baseline repository SHA: `a71507d2f02f7219ffa685bb3acbb6722a8a84ff`

## Purpose

This file records the exact Scanner V1 contract before Scanner V2 implementation begins. Scanner V2 must remain additive until it independently passes the full acceptance gate.

## V1 execution limits

From `packages/onboarding-ingest/src/scan.ts` at the frozen baseline:

- `MAX_PAGES = 5`
- `MAX_TOTAL_BYTES = 768 * 1024`
- `TOTAL_DEADLINE_MS = 12_000`
- `MAX_STATIC_SCRIPT_ASSETS = 1`
- `MAX_STATIC_SCRIPT_BYTES = 640 * 1024`
- `MAX_READER_PAGES = 4`
- public HTTPS only
- robots-aware
- SSRF/public-IP checks
- bounded redirects and per-page timeout
- strict TLS verification

## V1 response compatibility contract

Success shape remains:

```ts
{
  ok: true;
  untrusted: true;
  draft: Partial<{
    businessName: string;
    greeting: string;
    hours: string;
    services: string;
    faqs: string;
  }>;
  warnings: string[];
  sources: Array<{ url: string; status: number; bytes: number }>;
  facts?: BusinessFacts;
  factMeta?: BusinessFactMeta;
  fieldMeta?: DraftFieldMeta;
}
```

Failure shape remains:

```ts
{
  ok: false;
  error: string;
  message: string;
  warnings: string[];
}
```

Scanner V2 Stage 0/1 does not alter these shapes or `runScan` routing.

## Preserved regression sites

The following production cases are mandatory regression references throughout the V2 build:

1. `https://alleygates.co.uk/`
   - bot/edge behaviour;
   - reader fallback;
   - services including Alley Gate Installation, CCTV, Security Fencing and Alley Gate Keys.

2. `https://expressgasdelivery.com/`
   - thin client-rendered shell;
   - bounded same-origin static-script structured-data recovery;
   - opening hours and services.

3. `https://forumhousing.co.uk/`
   - direct TLS/fetch failure path;
   - claims-safe reader recovery;
   - services/contact/opening-hours handling.

## V2 flag

`ONBOARDING_SCANNER_V2` is default-off and explicit opt-in only:

- unset -> false
- `false` -> false
- `0` -> false
- `true` -> true
- `1` -> true

At Stage 0/1 the flag is exported for future routing but is not read by `runScan`, the server, or the public website. Therefore enabling/disabling the new variable has no production effect yet.

## Stage 1 additive contract

Stage 1 introduces:

- `CrawlState`
- `CrawlUrlDisposition`
- `CrawlPage`
- `CorpusChunk`
- `CrawlManifest`
- `CrawlLease`
- `CorpusStore`
- `FrontierStore`
- `CrawlLeaseStore`
- deterministic stable content/chunk hashing
- in-memory test implementation
- manifest accounting rule that refuses to represent queued/unresolved work as COMPLETE

No discovery, fetch, extraction, rendering, persistence, retrieval or UI path is switched to V2 in this stage.

## No-touch boundary

Scanner V2 foundation work does not modify or exercise:
- MaintenanceOS live phone numbers;
- carrier routing;
- provider credentials;
- production voice runtime;
- production telephony deployment;
- the golden MaintenanceOS phone line.
