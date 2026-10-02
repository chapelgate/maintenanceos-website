# Scanner V2 — Expert Evidence Review

Status: APPROVED DESIGN BASIS
Date: 2026-10-02

## Panel

The design was reviewed through six specialist lenses:
1. crawler/search-engine discovery;
2. JavaScript rendering;
3. structured business data;
4. information retrieval;
5. SSRF/web security;
6. reliability/incremental refresh.

The review uses primary standards and vendor documentation rather than blog-level recipes.

## Evidence-to-decision matrix

| Evidence | Verified point | Scanner V2 decision |
|---|---|---|
| IETF RFC 9309 — Robots Exclusion Protocol | Standardizes robots.txt access and parsing; permits crawler interpretation of Sitemap records without interfering with robots groups. | Parse robots rigorously; harvest Sitemap records separately; never let custom records alter robots semantics. |
| Sitemaps.org protocol | Defines URL sitemaps, sitemap indexes and lastmod; indexes can enumerate multiple sitemap files. | Sitemap and sitemap-index traversal is a primary discovery source, not an optional afterthought. |
| Google Search Central — JavaScript SEO basics | JavaScript sites can return an app shell whose initial HTML lacks the actual content; rendered HTML is parsed for content and links. | Raw HTML first, bounded Chromium rendering escalation for app-shell/thin pages, then re-discover links from rendered DOM. |
| Google Search Central — URL/canonical guidance | Sorting/filtering and other URL variants create duplicates; canonicalization groups equivalent content and reduces waste. | Canonical URL accounting + content hashes + query/tracking/facet controls are mandatory before deep crawling. |
| OWASP SSRF Prevention Cheat Sheet | User-controlled URL fetching creates SSRF exposure; redirect handling and private/metadata ranges require explicit defenses. | Preserve public-IP validation at every redirect and extend it to sitemaps, rendered subrequests and documents. |
| WHATWG URL Standard | Defines interoperable URL parsing/canonicalization used by modern web platforms. | Use the platform URL parser rather than regex URL parsing. |
| Playwright BrowserContext docs | Non-persistent browser contexts are isolated and do not write browsing data to disk. | Every rendering job uses a fresh non-persistent context with no inherited customer state. |
| Playwright network/service-worker docs | BrowserContext routing observes requests; service workers can hide normal routing unless handled/blocked. | Route at context level; block service workers by default for predictable policy enforcement. |
| Schema.org LocalBusiness | Defines explicit business properties including openingHours, telephone, address and related structured values. | Keep structured extraction as the high-confidence exact-fact layer, but not as the entire knowledge base. |
| SQLite FTS5 | Supports full-text MATCH, BM25 ranking and column weighting. | Use a deterministic free lexical retrieval baseline with title/heading boosts before considering semantic reranking. |
| RFC 9110 | Last-Modified and validators support conditional requests and reduce unnecessary transfers. | Persist validators/hashes and implement incremental recrawls rather than full destructive re-scrapes. |

## Rejected designs

### "Just increase MAX_PAGES from 5 to 1000"
Rejected. It does not add sitemap completeness, manifests, trap protection, rendering, document ingestion, persistence or retrieval. It makes the synchronous failure mode larger.

### "Put the whole website into one prompt"
Rejected. It has poor scaling, no deterministic completeness accounting, weak provenance and unnecessary token cost.

### "Use a browser for every URL"
Rejected. Expensive and operationally noisy. Raw HTTP is cheaper and more deterministic for normal HTML; rendering should be escalation only.

### "Use an LLM to decide what to crawl"
Rejected as a correctness dependency. Discovery/completeness must be deterministic and testable. Models can optionally rerank or synthesize from already-retrieved evidence.

### "Disable TLS / SSRF controls for difficult sites"
Rejected. Recovery must use safe alternate extraction paths, not weaker network security.

### "Declare success when headline facts are present"
Rejected. It directly caused the reported product failure. Completion is now a manifest property, not a content-quality guess.

## Result

The approved architecture is a crawler + durable corpus + retrieval system. The old five-field draft remains a compatibility view. It is no longer the canonical knowledge source for arbitrary receptionist questions.
