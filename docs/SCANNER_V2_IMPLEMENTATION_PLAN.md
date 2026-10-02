# Scanner V2 — Implementation Plan

Status: READY FOR BUILD
Date: 2026-10-02

## Objective

Build the whole-site knowledge architecture in controlled vertical slices without replacing the working production scanner in one jump.

The existing production scanner remains the rollback baseline until Scanner V2 independently passes its full acceptance gate. Production telephony and the MaintenanceOS golden phone line remain out of scope.

## Engineering rules

- Reuse the existing `onboarding-ingest` security primitives and extractors.
- Additive schema first; do not break the existing `draft` response.
- No big-bang rewrite.
- No new paid model dependency.
- No weakening TLS, robots, SSRF, redirect or content-size safeguards.
- Every stage must have deterministic fixtures before real-site acceptance.
- A resource ceiling changes the result to PARTIAL; it never silently truncates a COMPLETE crawl.
- Every URL has a final disposition in the manifest.

## Stage 0 — Baseline freeze and characterization

Deliverables:
- freeze current Scanner V1 application/source identity;
- capture exact V1 limits and response schema;
- preserve Alley Gates, Express Gas and Forum Housing regression cases;
- create a `scanner-v2` feature flag default-off.

Acceptance:
- V1 behaviour unchanged;
- V2 disabled path has zero customer impact;
- golden-line inventory unchanged.

## Stage 1 — Corpus and manifest types

Add:
- `CrawlManifest`;
- `CrawlUrlDisposition`;
- `CrawlPage`;
- `CorpusChunk`;
- `CrawlState`;
- provenance fields;
- compatibility projection back to current `draft`.

Store corpus in an interface, not an implementation-specific global:
- `CorpusStore`;
- `FrontierStore`;
- `CrawlLeaseStore`.

Provide an in-memory implementation first for tests.

Acceptance:
- old ScanSuccess remains parse-compatible;
- complete URL accounting unit tests;
- stable content/chunk hashes;
- no crawler behaviour change yet.

## Stage 2 — Sitemap + frontier discovery

Implement:
- parse `Sitemap:` from robots.txt without altering robots-group parsing;
- probe root `/sitemap.xml` when no declaration exists;
- parse `urlset` and `sitemapindex`;
- recursively visit same-site sitemap indexes;
- enqueue same-site public URLs;
- merge sitemap URLs with links discovered from every accepted HTML page;
- record discovery reason + parent.

Controls:
- XML decompressed-byte limit;
- sitemap nesting limit;
- maximum sitemap documents safety ceiling;
- URL count safety ceiling that returns PARTIAL;
- public HTTPS / SSRF validation on every sitemap and URL.

Acceptance:
- 100+ page deterministic site fully discovered;
- sitemap-only deep page found;
- link-only deep page found;
- private-IP URL embedded in sitemap rejected;
- unresolved/safety-limit state explicit.

## Stage 3 — Canonicalization and crawl-trap control

Implement:
- fragment removal;
- tracking-parameter removal;
- deterministic query sorting;
- default-port normalization;
- `rel=canonical` capture;
- content-hash duplicate detection;
- admin/login/cart/checkout/search endpoint policy;
- facet explosion detector;
- calendar/date-loop detector;
- session-id/token parameter detector;
- max path-depth policy.

Acceptance:
- canonical duplicates collapse to one corpus page;
- all duplicate URLs retain disposition/provenance;
- artificial infinite faceting cannot exhaust memory;
- calendar fixture terminates deterministically;
- safety ceiling -> PARTIAL.

## Stage 4 — Full-page text extraction + chunking

Implement page representation:
- title;
- heading hierarchy;
- visible paragraphs;
- lists;
- tables;
- definitions;
- FAQ Q/A pairs;
- captions/alt text;
- structured facts.

Implement structural chunker:
- heading-scoped chunks;
- table-row chunks;
- FAQ pairs atomic;
- service/product heading + description atomic;
- bounded chunk size with small overlap only where needed.

Boilerplate:
- detect repeated nav/footer blocks by cross-page hash/frequency;
- retain site-wide contact/legal metadata once;
- down-rank repeated boilerplate.

Acceptance:
- deep-page facts present in corpus verbatim;
- no script/style/noscript pollution;
- section provenance exact;
- duplicate boilerplate does not dominate retrieval.

## Stage 5 — Deterministic full-text retrieval

Implement an interface:
- `CorpusIndex.index(crawlId, chunks)`;
- `CorpusIndex.search(crawlId, query, limit)`.

Baseline backend:
- SQLite FTS5 if the chosen runtime already supports durable SQLite;
- otherwise a compatible local lexical index behind the same interface until durable storage is selected.

Ranking:
- title highest;
- headings next;
- body normal;
- exact identifiers/numbers preserved;
- BM25/rank;
- deterministic tie-breaker using URL + ordinal.

Acceptance:
- exact fact questions retrieve expected chunk;
- phrase/paraphrase fixture set meets threshold;
- no paid tokens;
- retrieval trace includes chunk id + URL + score.

## Stage 6 — Receptionist corpus grounding

Add a new browser-preview answer contract:
1. exact structured fact lookup;
2. corpus search;
3. deterministic extractive answer when evidence is direct;
4. optional free/local model synthesis only when supplied retrieved evidence;
5. final claim-support verifier;
6. honest not-found response when unsupported.

Do **not** stuff the complete corpus into a system prompt.

Trace:
- query;
- retrieved chunk ids;
- source URLs;
- answer;
- support status.

Acceptance:
- 10+ deep-site questions per fixture;
- all supported answers trace to source chunks;
- unsupported questions do not hallucinate;
- summary fields remain compatibility projection only.

## Stage 7 — JavaScript rendering escalation

Trigger rendering only when:
- raw body is app-shell/thin by deterministic heuristics; or
- scanner discovers meaningful script-backed content but no page text; or
- a configured extractor proves raw HTML incomplete.

Renderer contract:
- clean non-persistent Playwright BrowserContext;
- service workers blocked unless required by a fixture and then routed explicitly;
- all network requests observed;
- every HTTP(S) subrequest checked against the public-network policy;
- block internal/private targets;
- block form submissions/mutation methods;
- block downloads;
- resource-type filtering for media/fonts/analytics;
- wall-clock and DOM-size ceiling;
- final DOM links re-enter normal frontier validation.

Acceptance:
- app-shell fixture fact invisible raw, visible rendered;
- private rendered subrequest blocked;
- no cookie/session carryover;
- no form mutation;
- renderer failure -> PARTIAL.

## Stage 8 — Public document ingestion

Start with:
- PDF;
- TXT;
- CSV.

Add office formats only after parsers are proven safe and license-compatible.

Every document:
- passes URL/SSRF checks;
- content-type/sniff checks;
- compressed/decompressed size limits;
- parser timeout;
- source URL provenance.

Acceptance:
- PDF-only fact retrievable;
- unsupported document recorded;
- parser error -> PARTIAL if the document is in-scope.

## Stage 9 — Resumable worker execution

Replace the synchronous whole-crawl requirement with durable crawl jobs.

Required state:
- crawl id;
- frontier;
- URL dispositions;
- corpus pages/chunks;
- leases;
- retry count;
- release SHA;
- timestamps.

Worker batch:
- claim bounded URL batch;
- fetch/extract/index;
- commit idempotently;
- release lease;
- schedule next batch while frontier non-empty.

Crash recovery:
- expired leases reclaimable;
- content hash prevents duplicate storage;
- URL disposition transitions monotonic.

Acceptance:
- kill worker mid-crawl -> resume to same final manifest;
- duplicate worker attempt does not duplicate corpus;
- one poisoned URL cannot stall crawl.

## Stage 10 — Incremental refresh

Persist:
- ETag;
- Last-Modified;
- sitemap lastmod;
- content hash.

Recrawl:
- conditional GET;
- reuse unchanged chunks;
- reindex changed pages;
- confirmed 404/410 tombstone;
- preserve prior version until new crawl commits.

Acceptance:
- unchanged recrawl minimal transfer;
- single changed page updates only its chunks;
- removed page no longer answers questions after committed recrawl.

## Stage 11 — UI and operational state

UI states:
- Discovering;
- Crawling X/Y;
- Indexing;
- Complete;
- Partial;
- Failed.

Expose:
- pages discovered/fetched;
- unresolved count;
- last scan;
- completeness label;
- optional source viewer.

Do not let a PARTIAL crawl silently appear fully learned.

## Stage 12 — Production canary and freeze

Order:
1. deterministic fixture gate;
2. replay V1 regression suite;
3. real-site canary: Alley Gates, Express Gas, Forum Housing;
4. additional conventional site;
5. additional JS-heavy site;
6. mobile browser preview;
7. deep-page question battery;
8. full repo/accessibility/static/build gates;
9. exact deployed SHA readback;
10. freeze/tag/evidence.

Rollback:
- V2 remains flaggable;
- V1 compatibility path preserved until canary proves stable.

## No-touch boundary

No stage may:
- change live phone numbers;
- change carrier routing;
- change provider credentials;
- restart/redeploy the production voice runtime;
- alter or exercise the golden MaintenanceOS phone line.
