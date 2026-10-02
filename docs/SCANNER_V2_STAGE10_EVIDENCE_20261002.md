# Scanner V2 Stage 10 — Incremental Refresh Evidence

Status: COMPLETE / VERIFIED
Date: 2026-10-02
Baseline: Scanner V2 Stage 9 merge `2d896872cf4368437f81d94dc6364c6aa4777674`
Verified candidate: `bed28e24d0ed41ce2ffdd34855b2c562f2dc587c`

## Implemented

- Conditional GET support using persisted `ETag` and `Last-Modified`.
- HTTP 304 is a terminal fetch result and reuses the exact prior page/chunks.
- HTTP 200 re-extracts only the changed page; unchanged same-hash content reuses stable prior chunks.
- Prior fetched pages that disappear from new discovery are queued once for absence confirmation.
- Confirmed 404/410 produces a tombstone in the new crawl and does not copy the removed page/chunks.
- The prior COMPLETE crawl remains immutable and available throughout refresh.
- An atomic active-crawl pointer switches only after the new crawl is COMPLETE.
- PARTIAL/queued/unresolved crawls cannot replace the active corpus.
- Active-pointer compare-and-swap prevents a stale refresh from overwriting a newer committed crawl.
- Conditional refresh redirects are restricted to the submitted site origin.
- Existing Stage 2 sitemap `lastmod`, Stage 4 page validators/content hashes and Stage 9 resumable worker state are reused; no new service/database was introduced.

## Deterministic acceptance

GitHub Actions run `37067940082` / job `111040430128`: PASS.

Acceptance cases:
- stored ETag + Last-Modified are sent on refresh;
- 304 response transfers no body and reuses exact stable chunks;
- one changed page changes only its own chunk identities;
- unchanged sibling page keeps identical chunk IDs;
- prior page missing from discovery is revalidated once;
- confirmed 410 removes the page only from the new corpus;
- old active corpus still contains the removed page until commit;
- PARTIAL refresh cannot publish;
- stale compare-and-swap cannot overwrite a newer active crawl;
- cross-origin conditional redirect is rejected;
- HTTP 304 is handled as a terminal response, not a redirect.

Full gate:
- Stage 10 targeted refresh/worker/fetch tests: PASS.
- Full repository regression: 410/410 PASS.
- Accessibility: 16/16 PASS.
- TypeScript: PASS.
- Production Next.js build: PASS, 30/30 routes.
- CREATE_AND_PHONE_SURFACE_UNCHANGED=PASS.
- STAGE10_REFRESH_CONTRACT_PRESENT=PASS.

## Independent NVIDIA review

Evolution Engine run `37067996767` / job `111040478296`: PASS.

- `openai/gpt-oss-20b`: REVIEW PASS.
- `nvidia/nemotron-3.5-lightning-30b-a3b`: REVIEW PASS.
- Included/free NVIDIA development capacity; marginal cost USD 0.
- The first Nemotron attempt hit the existing 45-second execution boundary before verdict; a bounded retry with a shorter public review prompt passed.
- Raw hosted-model output was not retained by the NVIDIA adapter.
- NVIDIA was used for reasoning/review only, not unproven toolful code execution.

## Release boundary

Stage 10 remains additive. Scanner V2 is still not routed into production `/create`; Scanner V1 remains the live rollback/production path until later acceptance stages pass.

The next planned boundary is Stage 11 UI/operational state: Discovering, Crawling, Indexing, Complete, Partial and Failed with visible page/unresolved counts and no false "fully learned" state.

## Golden phone line invariant

No MaintenanceOS production telephony, carrier routing, live phone number, provider credential, production voice runtime or golden phone line was modified, exercised, rerouted, restarted or redeployed.
