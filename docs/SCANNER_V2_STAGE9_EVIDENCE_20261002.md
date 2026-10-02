# Scanner V2 Stage 9 — Resumable Worker Execution Evidence

Status: DETERMINISTIC GATE PASS / NVIDIA REVIEW PENDING
Date: 2026-10-02
Tested source SHA: `41b5928559b5180512c6250c5d7a10b5a49110b4`
Baseline: Scanner V2 Stage 8 merge `84b8a622ffa7cce60487c56dd3de3ef1c5c6efae`

## Scope delivered

Stage 9 adds the durable execution contract required to move Scanner V2 away from a single synchronous whole-crawl request.

Implemented:
- crawl job identity with crawl ID, origin, release SHA, state, created/updated timestamps and retry limit;
- persisted URL frontier/dispositions;
- persisted corpus pages/chunks;
- per-URL leases;
- bounded worker batches;
- retry accounting;
- explicit next-batch scheduling signal;
- COMPLETE/PARTIAL state reconstruction from durable URL evidence.

The worker accepts a `processUrl` dependency so existing/future fetch, extraction, document, rendering and indexing stages remain reusable rather than duplicated inside the scheduler.

## Durable store

The reference adapter is intentionally simple:
- existing worker filesystem only;
- one self-contained directory per crawl;
- hashed record filenames, so untrusted URLs/crawl IDs never become paths;
- temp-file + fsync + atomic rename for JSON state records;
- exclusive-create lease files;
- stable content/chunk identities reuse the existing Stage 1 hashing contract.

This is a single-filesystem durability adapter, not a claim of shared multi-host storage. Scanner V2 remains off production routing. A future production deployment may supply another `ScannerV2JobStore` implementation without changing worker semantics.

## Crash and concurrency hardening

The deterministic gate found and repaired two material edges before freeze:

1. **Partial initial frontier seed**
   - If a process wrote `job.json` and died while adding initial URL rows, re-running job creation now fills only missing seed rows.
   - Existing terminal rows are never reset.
   - The same crawl ID cannot be silently reused with a different origin or release SHA.

2. **Expired/reassigned worker**
   - After processing and before durable corpus writes, the worker re-reads the exact active lease.
   - Owner, lease generation (`expiresAt`) and expiry time must still match.
   - A slow worker whose lease expired or was reassigned is deferred and cannot commit its result.

Additional invariants:
- fetched outcomes require durable page evidence;
- duplicate content hashes collapse onto the first canonical page;
- chunks are keyed by stable chunk ID;
- terminal URL state prevents duplicate work;
- expired leases are reclaimable;
- poisoned URLs retry only to the configured ceiling, then become unresolved/PARTIAL while healthy URLs continue.

## Deterministic verification

GitHub Actions:
- run: `37057845550`;
- job: `111006838002`;
- conclusion: PASS.

Results:
- targeted Scanner V2 suite: 81/81 PASS;
- scanner/package group: 242/242 PASS;
- full repository regression: 404/404 PASS;
- accessibility: 16/16 PASS;
- TypeScript: PASS;
- Next.js production build: PASS;
- static routes: 30/30;
- production dependency audit: 0 vulnerabilities.

Explicit evidence:
- process restart resumes durable frontier: PASS;
- duplicate worker execution is idempotent: PASS;
- expired lease reclaim: PASS;
- expired-worker pre-commit fence: PASS;
- partial job-seed recovery: PASS;
- crawl/release identity drift rejection: PASS;
- poisoned URL isolation: PASS;
- content-hash duplicate collapse: PASS;
- `SCANNER_V1_RUNTIME_UNCHANGED=PASS`;
- `PRODUCTION_PREVIEW_ROUTING_UNCHANGED=PASS`;
- `GOLDEN_PHONE_LINE_CHANGE_SURFACE=0`.

## Independent NVIDIA review

Pending exact hardened-candidate review on included/free development capacity.

Required before merge/freeze:
- openai/gpt-oss-20b live review PASS;
- nvidia/nemotron-3.5-lightning-30b-a3b live review PASS;
- marginal cost USD 0;
- raw hosted-model output retained: 0;
- production NVIDIA scope enabled: 0.

## Release boundary

Stage 9 remains additive. Scanner V2 remains off the production `/create` route.

Next planned boundary after Stage 9 freeze:
- Stage 10 incremental refresh using ETag / Last-Modified / sitemap lastmod / content hashes.

## Golden-line invariant

No MaintenanceOS production telephony, carrier routing, live phone number, provider credential, production voice runtime or golden phone line was modified, exercised, rerouted, restarted or redeployed.
