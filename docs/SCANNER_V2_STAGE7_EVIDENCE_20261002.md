# Scanner V2 Stage 7 — Rendering Evidence

Status: COMPLETE / VERIFIED / READY TO FREEZE  
Date: 2026-10-02

## Scope

Stage 7 implements bounded JavaScript rendering escalation for Scanner V2 only.

It remains additive. Scanner V2 is still off the production `/create` route and Scanner V1 remains the production/rollback path.

## Verified implementation

Merged through PR #167.

Stage 7 adds:

- deterministic escalation only for thin/app-shell HTML or an explicitly empty extractor result;
- a fresh non-persistent Playwright Chromium BrowserContext for every render;
- downloads disabled;
- service workers blocked;
- browser HTTP(S) requests intercepted;
- every fetched request routed through the existing DNS-pinned, public-IP/SSRF-safe HTTPS fetch primitive;
- mutation methods rejected;
- private/non-public network targets rejected;
- image/media/font resources filtered;
- known analytics hosts filtered;
- bounded request count, origin count, per-resource bytes, aggregate bytes, DOM size, settle time and wall-clock timeout;
- rendered links normalized through the existing Stage 3 URL/canonical/trap policy with `rendered_link` provenance;
- rendered output feeds Stage 4 content extraction with `fetchMode: "rendered"`;
- renderer hard-limit/failure results remain unresolved/PARTIAL rather than silently COMPLETE.

## Deterministic verification

Exact Stage 7 candidate SHA:
- `8fcdfb62bd61448444fd6a6e5912d6bff45af464`

Merge SHA:
- `a01d2f19016920be1890cf2d40cf246ce1c9130f`

GitHub Actions:
- workflow run `37048104369`
- job `110974444412`
- conclusion: PASS

Verified gates:
- targeted Stage 7 tests: 6/6 PASS;
- full repository regression: 381/381 PASS;
- accessibility: 16/16 PASS;
- TypeScript: PASS;
- production Next.js build: PASS;
- real Chromium app-shell rendering: PASS;
- rendered-only fact absent from raw HTML and present after rendering: PASS;
- private-network request blocking: PASS;
- mutation request blocking: PASS;
- fresh BrowserContext isolation across repeated renders: PASS;
- rendered-link frontier provenance: PASS;
- rendered result -> Stage 4 `fetchMode: rendered`: PASS;
- Scanner V1 runtime source unchanged: PASS;
- production telephony change surface: 0;
- golden phone line change surface: 0.

The real Chromium acceptance printed:

- `STAGE7_APP_SHELL_RENDER=PASS`
- `STAGE7_PRIVATE_NETWORK_BLOCK=PASS`
- `STAGE7_MUTATION_BLOCK=PASS`
- `STAGE7_CONTEXT_ISOLATION=PASS`
- `STAGE7_RENDERED_LINK_FRONTIER=PASS`

## Independent NVIDIA review

Evolution Engine run:
- `37048355702`
- job `110975268302`
- conclusion: PASS

Included/free development lane:
- `openai/gpt-oss-20b`: live independent review PASS; marginal cost USD 0;
- `nvidia/nemotron-3.5-lightning-30b-a3b`: live independent review PASS; marginal cost USD 0.

Recorded invariants:
- `NVIDIA_STAGE7_TWO_MODEL_REVIEW=PASS`
- `NVIDIA_STAGE7_RAW_OUTPUT_RETAINED=0`
- `NVIDIA_STAGE7_PRODUCTION_SCOPE_ENABLED=0`

The NVIDIA lane was used for reasoning/review only, not represented as toolful code execution.

## Engineering reconciliation

A separate diagnostic Stage 7 branch explored a stricter same-origin-only renderer and caught a malformed synthetic browser fixture. That branch was not merged.

The canonical PR #167 implementation was independently inspected after merge and already covers the approved Stage 7 contract with stronger real-browser proof, including:
- direct public-network policy enforcement on every proxied request;
- request-header allow-listing so cookies/authorization are not forwarded;
- fresh BrowserContext per render;
- explicit mutation/private-network blocking;
- fail-closed render limits.

No duplicate Stage 7 renderer is retained in `main`.

## Cleanup

The temporary Stage 7 validation workflow is removed after this evidence is persisted. Its successful run IDs and exact assertions are recorded above.

## Release boundary

Stage 7 is not a production-route cutover.

The next authorised Scanner V2 implementation boundary is Stage 8 public document ingestion (PDF, TXT, CSV first), still behind the additive Scanner V2 contract.

## Golden-line boundary

No MaintenanceOS production telephony, carrier routing, live phone number, provider credential, production voice runtime or golden phone line was modified, exercised, rerouted, restarted or redeployed by Stage 7.
