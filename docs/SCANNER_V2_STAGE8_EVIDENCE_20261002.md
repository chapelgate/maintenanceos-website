# Scanner V2 Stage 8 — Public Document Ingestion Evidence

Status: COMPLETE / VERIFIED
Date: 2026-10-02
Tested source SHA: `31e9b39f53b2721d560f1ce1928f0f777fa6dca4`
Baseline: Scanner V2 Stage 7 freeze on main, `76b8bc1ec89d1105f4470ea079e07eb4e6135a89`

## Scope delivered

Stage 8 adds public text-bearing document ingestion without changing the stable Scanner V1 runtime or the Stage 2 HTML discovery loop.

Supported in this stage:
- PDF;
- TXT;
- CSV.

Explicitly unsupported and therefore incomplete rather than silently omitted:
- DOC / DOCX;
- XLS / XLSX;
- PPT / PPTX;
- ODT / ODS / ODP;
- RTF.

## Architecture

- Stage 2/3 discovery remains the source of same-origin URL inventory.
- A post-discovery Stage 8 manifest pass consumes document candidates.
- Binary fetch uses a separate SSRF-safe DNS-pinned HTTPS primitive.
- Every redirect is revalidated and document redirects are constrained to the submitted crawl origin.
- Successful documents become standard `CrawlPage` + `CorpusChunk` records with `fetchMode=document`.
- The existing Stage 5 deterministic BM25 index and Stage 6 grounding consume document chunks without document-specific answer logic.

## Safety boundaries

- default fetch cap: 8 MiB;
- hard fetch cap: 16 MiB;
- default fetch timeout: 8 seconds;
- hard fetch timeout: 20 seconds;
- default PDF parse timeout: 8 seconds;
- hard PDF parse timeout: 20 seconds;
- default PDF page cap: 500;
- hard PDF page cap: 1000;
- default extracted-text cap: 2,000,000 characters;
- hard extracted-text cap: 4,000,000 characters;
- PDF signature must begin `%PDF-` when URL/MIME claims PDF;
- TXT/CSV with NUL-bearing binary content are rejected;
- network request uses `Accept-Encoding: identity`;
- PDF parser runs in an isolated Node worker with:
  - old-generation limit 256 MiB;
  - young-generation limit 32 MiB;
  - stack limit 8 MiB;
- PDF.js input evaluation disabled via `isEvalSupported:false`;
- PDF.js worker fetch disabled via `useWorkerFetch:false`;
- parser failures/timeouts return unresolved/PARTIAL evidence;
- document truncation retains useful chunks but remains unresolved/PARTIAL;
- unsupported Office documents return unresolved/PARTIAL evidence.

## Dependency

- `pdfjs-dist` exact pin: `6.3.289`;
- production dependency audit: 0 vulnerabilities at validation time.

## Deterministic acceptance

Final full GitHub Actions:
- run: `37056249496`;
- job: `111001562480`;
- conclusion: PASS.

Final narrow Stage 8 gate:
- run: `37056249518`;
- job: `111001563365`;
- conclusion: PASS.

Dependency-pin gate:
- run: `37056249462`;
- job: `111001561801`;
- conclusion: PASS.

Results:
- targeted fetch/document/retrieval/grounding tests: 42/42 PASS;
- full repository regression: 397/397 PASS;
- accessibility: 16/16 PASS;
- TypeScript: PASS;
- Next.js 16.3.8 production build: PASS;
- static routes: 30/30 generated;
- npm production audit: 0 vulnerabilities;
- exact PDF.js pin: PASS.

Key acceptance proofs:
- TXT fact -> corpus -> BM25 retrieval: PASS;
- CSV public rows -> corpus: PASS;
- real PDF.js parse -> PDF-only fact -> BM25 retrieval: PASS;
- Stage 2 HTML link -> frontier -> Stage 8 PDF -> corpus -> Stage 6 receptionist answer: PASS;
- receptionist answer carries exact PDF source URL/chunk provenance: PASS;
- private DNS rejected before connection: PASS;
- cross-origin document redirect rejected before second-origin connection: PASS;
- PDF signature mismatch rejected: PASS;
- binary text rejected: PASS;
- parser failure/timeout -> PARTIAL: PASS;
- truncation -> useful corpus evidence + PARTIAL: PASS;
- unsupported Office format -> PARTIAL: PASS.

## Independent NVIDIA review

Evolution Engine:
- final review run: `37055976541`;
- job: `111000667729`;
- conclusion: PASS;
- `openai/gpt-oss-20b`: live review PASS, marginal cost USD 0;
- `nvidia/nemotron-3.5-lightning-30b-a3b`: live review PASS, marginal cost USD 0;
- `NVIDIA_STAGE8_TWO_MODEL_REVIEW=PASS`;
- raw hosted-model output retained: 0;
- production NVIDIA scope enabled: 0.

The NVIDIA lane was used only for independent safety/correctness review, not as an unproven code executor.

## Debugging note

A failing end-to-end fixture initially exposed a synthetic single-line PDF page-width clipping artefact. The parser correctly returned the visible PDF text. The fixture sentence was shortened to fit the generated page; no production acceptance rule or parser safety check was weakened.

## Regression / no-touch evidence

- Scanner V1 `scan.ts` unchanged from Stage 7 baseline: PASS;
- production onboarding function bundle unchanged: PASS;
- production telephony change surface: 0;
- golden phone line change surface: 0.

## Release boundary

Stage 8 is additive. Scanner V2 remains off production `/create` until later production-canary stages.

Next authorised engineering boundary: Stage 9 — resumable worker execution.

## Golden-line invariant

No MaintenanceOS production telephony, carrier routing, live phone number, provider credential, production voice runtime or golden phone line was modified, exercised, rerouted, restarted or redeployed.
