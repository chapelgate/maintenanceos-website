# Scanner V2 Stage 4 Verification — 2026-10-02

Status: PASS / READY TO FREEZE

## Scope

Stage 4 implements the pure content layer only:

- full visible page text capture;
- title and heading hierarchy;
- paragraphs and list items;
- table rows;
- definition lists;
- FAQ details/summary pairs;
- image alt text and figure captions;
- structured business facts via the existing claims-safe extractor;
- deterministic structural chunking;
- stable content/chunk hashes;
- corpus-level header/navigation/footer de-duplication.

It does not route live production scanning through Scanner V2.

## Baseline

Stage 3 merged baseline:

`bce72c86fa0cb1b43f72ca90bdc881204e0fdaea`

Scanner V1 production runtime remains the active compatibility path.

## First-gate findings and repair

Initial targeted gate found two Stage 4-only defects:

1. image alt text was correctly present in structural chunks but omitted from the page-level `visibleText` projection;
2. `<nav>` content was retained but internally labelled `nav` instead of canonical `navigation`, so site-wide navigation de-duplication did not classify it correctly.

Both were fixed surgically in the new Stage 4 module. No V1 runtime source was touched.

## Final automated validation

GitHub Actions run: `37028451614`

Final exact tested source commit before evidence-only follow-up:
`55b22481caab450f524184f7f3d52c67559fa110`

Results:

- Stage 4 targeted + Stage 0–3 regression tests: PASS;
- full repository regression: **359/359 PASS**;
- accessibility: **16/16 PASS**;
- TypeScript `tsc --noEmit`: PASS;
- Next.js **16.3.8** production build: PASS;
- static export: **30/30 routes** generated;
- Scanner V1 runtime source unchanged: PASS;
- Scanner V2 production route unchanged: PASS;
- golden phone line change surface: **0**.

ESLint note:
the repository intentionally globally ignores `packages/onboarding-ingest/**`; therefore the package lint invocation emitted ignored-file warnings and was not counted as lint evidence. TypeScript + tests are the enforced static/code gates for this package. The validation record does not misrepresent ignored files as linted.

## Independent NVIDIA review

Evolution Engine NVIDIA review run: `37028541020`

Both proven review-only providers independently returned PASS:

- `nvidia-gpt-oss`: PASS
- `nvidia-nemotron`: PASS
- two-model review: PASS
- verified marginal cost: **$0**

The NVIDIA lane was used strictly for reasoning/review within its proven capability. It did not edit files, execute MaintenanceOS production code or touch telephony.

## Stage 4 architecture properties

- executable/non-visible markup (`script`, `style`, `noscript`, `template`, `svg`) does not enter visible text;
- service/product descriptions inherit heading-path provenance;
- FAQ pairs, table rows, definitions and figures are kept atomic where practical;
- long text is bounded to deterministic chunks with small overlap;
- div-heavy residual visible text is captured so conventional SPA/static markup is not silently lost;
- page hashes include visible text plus structured facts;
- chunk IDs are deterministic and stable for unchanged canonical URL + ordinal + text;
- repeated header/navigation/footer content is retained once corpus-wide rather than repeated on every page.

## No-touch boundary

No Stage 4 change modifies or exercises:

- MaintenanceOS live phone numbers;
- carrier routing;
- provider credentials;
- production voice runtime;
- telephony deployment;
- the golden MaintenanceOS phone line.
