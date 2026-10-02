# Scanner V2 — Whole-Site Knowledge Corpus Architecture

Status: DESIGN COMPLETE / IMPLEMENTATION CONTRACT
Date: 2026-10-02
Scope: MaintenanceOS website onboarding scanner and browser-preview knowledge only.

HARD BOUNDARY: production telephony and the golden MaintenanceOS phone line are out of scope and must not be modified, exercised, rerouted, restarted or redeployed.

## Decision

Replace the current "small crawl -> five summary fields" model with two layers:

1. Whole-site corpus builder: discover and retain all publicly accessible, in-scope business content that the crawler can legitimately reach.
2. Grounded retrieval layer: answer each receptionist question by retrieving supporting page/chunks from that corpus, while retaining deterministic structured facts for exact fields such as opening hours, telephone, locations and service names.

The scanner must never claim completion because it found a business name, a few services or opening hours. COMPLETE means the crawl frontier is exhausted and every discovered in-scope canonical URL is accounted for. Any unresolved page, safety limit, challenge, unsupported content type or timeout produces PARTIAL with explicit evidence.

## Why the existing architecture cannot meet the requirement

Current production source in packages/onboarding-ingest/src/scan.ts is deliberately a bounded onboarding summary scan:

- MAX_PAGES = 5
- MAX_TOTAL_BYTES = 768 * 1024
- TOTAL_DEADLINE_MS = 12_000
- MAX_READER_PAGES = 4
- one bounded same-origin JavaScript asset fallback

That was reasonable for a fast summary extractor, but it cannot honestly mean "everything on the website". Raising those limits alone would not solve discovery completeness, duplicate URL traps, JavaScript rendering, document ingestion, durable provenance or query-time retrieval.

## Expert design review

The design combines six specialist viewpoints.

### Web crawler / search-engine architecture
Discovery must be multi-source and frontier-driven, not "home page plus a few ranked links". RFC 9309 defines the Robots Exclusion Protocol. Sitemaps.org defines sitemap and sitemap-index discovery. Google documents link discovery and sitemap discovery as complementary crawling mechanisms.

### JavaScript rendering
Raw HTML remains the cheap first path, but app-shell/client-rendered pages need a bounded render escalation path. Google documents crawling, rendering and indexing as separate phases for JavaScript applications. Playwright BrowserContexts provide isolated non-persistent browser sessions.

### Structured data / extraction
Keep structured facts, but never reduce the site to structured facts alone. Schema.org LocalBusiness exposes explicit business properties such as openingHours, telephone and address; visible page text, headings, tables, FAQs and documents remain necessary.

### Retrieval / knowledge systems
The entire site corpus should be indexed and queried rather than concatenated into one giant prompt. SQLite FTS5 provides full-text indexing and BM25 ranking. Lexical retrieval is a deterministic free baseline; a local semantic reranker can be added later without changing the corpus contract.

### Security
The existing SSRF posture is preserved and expanded to every fetch mode. OWASP identifies user-controlled URL fetching as an SSRF risk. Every redirect, resolved address, sitemap URL, rendered subrequest and document URL remains subject to public-network and origin policy.

### Production reliability
Crawling must be resumable, observable and incremental. HTTP ETag and Last-Modified validators plus conditional requests allow unchanged content to be reused. Canonicalization and duplicate control prevent wasted crawl effort on URL explosions.

## Definition of "everything"

For MaintenanceOS, "everything on the website" means:

Every publicly accessible, business-relevant resource discoverable from the submitted site through permitted sitemaps, permitted same-site links, rendered same-site links, canonical targets and linked public documents, until the crawl frontier is exhausted.

It does not include authenticated/private pages, robots-disallowed URLs, checkout/account/admin endpoints, form targets, infinite search/facet/calendar spaces, unrelated third-party sites, hidden internal-network resources or content requiring supplied credentials.

Operational limits may exist for safety. Hitting a limit must return PARTIAL_LIMIT_REACHED, never COMPLETE.

## Scanner V2 pipeline

### Phase A — identity and policy
1. Parse with the standards-compliant URL implementation.
2. Require public HTTPS for normal onboarding.
3. Establish canonical origin and allowed host aliases only from verified redirects or explicit sitemap ownership rules.
4. Resolve DNS and reject loopback, link-local, private, metadata and other non-public targets.
5. Fetch and parse /robots.txt according to RFC 9309.
6. Record policy decisions in the manifest.

### Phase B — URL discovery
Build a deduplicated frontier from:
1. submitted entry URL;
2. Sitemap directives in robots.txt;
3. root /sitemap.xml when not otherwise declared;
4. recursive sitemap-index files;
5. HTML anchor links from every accepted page;
6. links discovered in rendered DOM for client-rendered pages;
7. same-site canonical URLs;
8. public document links such as PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT and CSV where parsers are available;
9. public CMS feeds/APIs only when they expose the same public site content and pass normal URL/security controls.

Each URL keeps a discovery reason and parent URL.

### Phase C — normalization and crawl-trap control
Before queueing:
- remove fragments;
- normalize scheme/host/default ports;
- normalize percent encoding with the platform URL parser;
- remove known tracking parameters;
- sort retained query parameters;
- reject login, account, cart, checkout, admin and explicit search-result endpoints by policy;
- detect unbounded facet/query combinations;
- detect date/calendar loops and path-depth explosions;
- honor same-site canonical signals after fetch;
- deduplicate identical bodies by content hash.

Keep requestedUrl and canonicalUrl so provenance is never lost.

### Phase D — fetch ladder
Use the cheapest safe method that can recover content:
1. verified raw HTTPS fetch;
2. structured-data/static-asset extraction where explicit public same-site data exists;
3. bounded JavaScript rendering for genuine app-shell pages;
4. the existing claims-safe reader fallback for edge/TLS/challenge cases;
5. otherwise mark the page unresolved and the crawl PARTIAL.

Never disable TLS verification. Never submit forms. Never invent content.

### Phase E — browser render safety
When rendering is required:
- isolated non-persistent browser context;
- no stored cookies or credentials;
- no form submission or click automation;
- block downloads;
- block internal/private-network subrequests;
- block unnecessary image/video/font/analytics traffic where it does not contribute text;
- disable service workers for predictable routing;
- strict wall-clock, response-byte and DOM-size ceilings;
- capture only public DOM text, structured data and links;
- every discovered URL re-enters the normal validation/SSRF path.

The renderer is an extraction mechanism, never a policy bypass.

## Corpus data model

The source of truth becomes page-level content rather than five draft fields.

CrawlPage records requested URL, canonical URL, title, headings, visible text, structured facts, content type, fetch mode, content hash, discovery parent, fetched time, ETag and Last-Modified.

CorpusChunk records stable ID, canonical URL, title, heading path, text, chunk ordinal and content hash.

CrawlManifest records crawl state, origin, discovered/fetched/duplicate/policy-skipped/unresolved counts and a per-URL disposition with a reason.

No page may disappear silently. The manifest is the audit trail.

## Extraction model

Retain two complementary representations.

### Structured fact store
Continue extracting business name, locations, phone/email, opening/special hours, services/products, explicit published prices, FAQs, delivery/returns/booking instructions, service areas and other directly present structured business fields. Every value retains source URL and evidence.

### Full text corpus
For every accepted page/document retain title, heading hierarchy, meaningful visible paragraphs, list items, table rows/cells, definition lists, FAQ accordions, relevant alt/caption text and linked public document text.

Navigation/footer boilerplate should be retained once as site metadata or down-weighted so it cannot dominate retrieval.

## Chunking and index

Chunk along document structure:
- headings stay with following content;
- table rows stay together;
- FAQ question/answer pairs stay together;
- product/service names stay with descriptions;
- only small overlap where needed.

Build:
1. deterministic lookup for structured fields;
2. BM25/full-text index over title, headings and body with boosts;
3. optional local/free semantic reranker behind an interface.

Paid embeddings are not required for baseline correctness.

## Receptionist retrieval contract

The receptionist must no longer answer arbitrary site questions from only businessName + greeting + hours + services + faqs.

For each caller question:
1. resolve exact structured intents first;
2. search the full corpus;
3. retrieve strongest supporting chunks;
4. answer only from those chunks;
5. retain source URLs in the response trace;
6. if there is no adequate support, say the information was not found instead of inventing it.

The browser preview should expose a small expandable "Sources used" view for debugging without leaking engineering jargon into the spoken answer.

## Completeness contract

COMPLETE is allowed only when discovery sources are exhausted; every discovered in-scope canonical URL is resolved as fetched, duplicate or policy-skipped; unresolved count is zero; indexing succeeded for every fetched resource; and no safety/resource limit was hit.

PARTIAL is mandatory for any fetch/render failure, unresolved verification challenge, unsupported public document, resource ceiling, incomplete sitemap processing or crawl-trap truncation.

The UI must say learning is incomplete and why. It must not present the receptionist as fully trained on the site.

## Freshness and recrawl

Persist ETag, Last-Modified, sitemap lastmod and content hash. Recrawls use conditional GET where possible. Unchanged pages reuse existing chunks; changed pages are re-extracted/reindexed; deleted pages are tombstoned only after confirmed absence.

## Safety and politeness

Required controls:
- RFC 9309 robots compliance;
- strict TLS verification;
- public-IP validation before and after redirects;
- DNS rebinding protection;
- same-site URL policy;
- decompressed-byte and redirect ceilings;
- content-type allowlist;
- bounded concurrency per origin;
- backoff on 429/503/server pressure;
- honor Retry-After where present;
- no credentials;
- no form submission;
- no mutation requests;
- no private/internal URL access;
- no authentication/paywall bypass.

Public noindex pages are excluded by default until explicit verified-owner consent exists.

## Documents and media

Public linked text-bearing documents are first-class knowledge sources. Initial target: HTML, plain text/CSV, PDF and office documents where safe parsers exist.

Images always contribute alt text/captions. OCR is optional only where business-critical text is otherwise unavailable. OCR/parser failure is recorded in the manifest instead of silently ignored.

## Execution architecture

Do not force the deep crawl into one synchronous function invocation.

Implement resumable batches behind one canonical Scanner V2 contract:
- stable crawlId;
- durable frontier, manifest and corpus;
- each invocation claims a bounded batch;
- retries idempotent by canonical URL + content hash;
- UI polls progress;
- receptionist testing is enabled only when COMPLETE, or explicitly labelled PARTIAL if an operator deliberately proceeds.

Reuse existing estate runtime/storage before creating infrastructure. Do not create a second competing scanner.

## Observability

Each crawl emits crawl ID, release SHA, origin, discovered/fetched/duplicate/skipped/unresolved counts, sitemap count, render count, reader-fallback count, document count, bytes, duration, per-URL disposition, extraction/chunk counts and final COMPLETE/PARTIAL/FAILED reason.

Errors must be specific; do not collapse actionable causes into generic "website check unavailable".

## Migration plan

Stage 1: corpus types + manifest while preserving current response fields.
Stage 2: full discovery via robots sitemaps, sitemap indexes and recursive internal links.
Stage 3: full page text/provenance + deterministic lexical retrieval.
Stage 4: bounded rendered-content escalation.
Stage 5: public document ingestion.
Stage 6: receptionist structured lookup + corpus retrieval.
Stage 7: incremental recrawl and freshness.

The existing five-field draft becomes a compatibility projection of the richer corpus, not the source of truth.

## Acceptance principle

PASS is not "we found some useful facts".

PASS requires site-level discovery evidence, page-level accounting, deep-page question coverage, source-grounded answers, no silent omissions, no invented answers, and explicit PARTIAL state whenever completeness cannot be proven.

## Sources

- IETF RFC 9309 Robots Exclusion Protocol: https://www.rfc-editor.org/rfc/rfc9309.html
- Sitemaps protocol: https://www.sitemaps.org/protocol.html
- Google JavaScript SEO basics: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google URL structure / crawl traps: https://developers.google.com/search/docs/crawling-indexing/url-structure
- Google canonical URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google indexable file types: https://developers.google.com/search/docs/crawling-indexing/indexable-file-types
- OWASP SSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- WHATWG URL Standard: https://url.spec.whatwg.org/
- Playwright BrowserContext / Pages: https://playwright.dev/docs/browser-contexts and https://playwright.dev/docs/pages
- Schema.org LocalBusiness: https://schema.org/LocalBusiness
- SQLite FTS5 / BM25: https://www.sqlite.org/fts5.html
- IETF RFC 9110 HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110.html
- Jina Reader reference: https://jina.ai/reader/

## Golden phone line boundary

Scanner V2 is website ingest and browser-preview only. The MaintenanceOS golden phone line, live phone number, carrier routing, provider credentials, production voice runtime and live telephony deployment are explicitly excluded from this architecture and acceptance.
