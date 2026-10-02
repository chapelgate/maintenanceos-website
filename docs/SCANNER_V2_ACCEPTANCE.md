# Scanner V2 — Whole-Site Acceptance Specification

Status: REQUIRED GATE FOR IMPLEMENTATION
Date: 2026-10-02

This gate exists to prevent another "summary scan passed, detailed question failed" release.

## A. Discovery fixture

Build a deterministic local fixture site containing:
- root page;
- robots.txt with Sitemap directive;
- sitemap index;
- at least two sitemap files;
- 100+ canonical business pages;
- a deep page reachable only from sitemap;
- a deep page reachable only through internal links;
- duplicate page with rel=canonical;
- tracking-parameter variants;
- facet trap;
- calendar/date trap;
- robots-disallowed page;
- noindex page;
- client-rendered app-shell page;
- linked PDF;
- linked text/CSV document;
- deliberate 404 and 503;
- redirect chain;
- redirect-to-private-IP SSRF trap.

Expected result is exact URL accounting. Every discovered URL must finish as fetched, duplicate, policy-skipped, robots-skipped or unresolved with an explicit reason.

## B. Completeness assertions

COMPLETE is legal only when:
- frontier empty;
- unresolved = 0;
- no resource/safety limit reached;
- all sitemap files parsed;
- all discovered canonical URLs accounted for;
- every fetched text-bearing resource indexed.

Inject one failure at a time and assert state becomes PARTIAL, never COMPLETE.

## C. Deep knowledge test

Place facts outside the home page and first five URLs:
- service eligibility;
- delivery area;
- returns rule;
- installation lead time;
- explicitly published price;
- contact route;
- special hours;
- obscure FAQ;
- document-only fact.

For each fact:
1. ask exact question;
2. ask paraphrase;
3. require supporting page/document in retrieval results;
4. require final answer to be entailed by retrieved content;
5. require source URL in trace;
6. forbid unsupported additions.

## D. Real-site acceptance

Run the deployed production scanner against:
- alleygates.co.uk;
- expressgasdelivery.com;
- forumhousing.co.uk;
- at least one conventional multi-page business site;
- at least one client-rendered business site.

For each, capture discovered/fetched/skipped/unresolved counts; verify at least three facts away from the home page; ask "What do you do?" plus at least five site-specific questions; require supporting corpus evidence; and verify unknown questions remain honest.

Real-site tests supplement deterministic fixtures; they never replace them.

## E. JavaScript rendering gate

The app-shell fixture must hide its facts in raw HTML and expose them only after safe rendering.

Assert renderer activation only for the thin/app-shell case; no forms submitted; no credentials/cookies carried between pages; no private-network subrequests; and rendered content/links re-enter normal validation and indexing.

## F. SSRF/security gate

Reject localhost, private IPv4/IPv6, link-local, metadata addresses, public hostnames resolving private, public redirects to private, DNS rebinding, sitemap private URLs and rendered links to private URLs. No reader/browser fallback may bypass this.

## G. Crawl-trap gate

Fixture produces effectively infinite faceted parameters, calendars, session IDs and sort variants.

Assert all unique business content pages are reached; trap variants do not explode the frontier; manifest records the decision; and hitting a safety ceiling yields PARTIAL.

## H. Document gate

Linked public PDF/text document contains a fact absent from HTML.

Assert document discovery, parsing, indexing, retrieval and source trace. If parser support is unavailable, state must be PARTIAL/unsupported-document rather than silently COMPLETE.

## I. Retrieval gate

Build a full-text index with title/heading boosts and BM25 or equivalent deterministic lexical ranking. Exact identifiers/phone numbers must be preserved. Paraphrases use a local/free semantic layer where lexical retrieval is insufficient. No paid model is required for baseline correctness.

## J. Freshness gate

Serve ETag/Last-Modified, then:
1. initial crawl;
2. unchanged recrawl -> conditional request/reuse;
3. change one page -> only changed page re-extracted;
4. remove one page -> tombstone after confirmed absence.

Unchanged chunks retain stable IDs/hashes.

## K. Production/browser gate

On the exact deployed SHA:
- fresh mobile-sized browser journey;
- no mocked scanner;
- wait for whole-site crawl COMPLETE;
- Step 4/5 compatibility summary agrees with corpus;
- arbitrary detailed questions retrieve corpus evidence;
- zero runtime exceptions;
- zero lead/save submission before optional Save;
- no internal engineering terminology in customer-facing replies.

## L. Telephony invariant

Acceptance must explicitly prove that no MaintenanceOS production telephony, carrier routing, live phone number, provider credential, production voice runtime or golden phone line file/config/deployment was modified or exercised.
