# Agent Factory Step 3 — Structured Website Scan

**Status:** VERIFIED CANDIDATE — engineering complete when merged
**Scope:** website scanner/intake only

## Current baselines

- Website main reconciled through `39e11770709c37fdacca44c0933ae7b3edfc2c4b`.
- MaintenanceOS product compatibility baseline: `f3b0f2bff9559a33f68b0e84edec083e4d8a948f` (2026-09-27).
- Step 3 does not alter the live phone runtime, provider, carrier routing, database, provisioning, agent-selection UI, or sandbox.

## What Step 3 changes

- Preserves the existing five-string `/create` `draft` contract.
- Adds additive `facts` + `factMeta` for Agent Factory intake.
- Extracts reviewable website, business name, locations, contact details, services, hours and FAQ pairs.
- Uses JSON-LD/schema.org and microdata before weaker visible-page heuristics.
- Preserves source/confidence provenance.
- Revalidates the structured payload independently in the static website client.
- Rejects malformed values and unknown fields rather than promoting them.
- Deduplicates UK local/international telephone representations and rejects labelled prose as a structured phone value.

## Security boundaries retained

- Public HTTPS only.
- Existing SSRF private/reserved/metadata-host and redirect checks retained.
- Existing robots.txt handling retained.
- Crawl text remains untrusted data.
- No crawler content can grant capabilities, credentials or production authority.
- No live forms, bookings, phone calls or other remote mutations are performed by the scanner.

## Standards grounding

- Schema.org LocalBusiness: https://schema.org/LocalBusiness
- Schema.org PostalAddress: https://schema.org/PostalAddress
- Robots Exclusion Protocol (RFC 9309): https://www.rfc-editor.org/rfc/rfc9309
- OWASP SSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html

## Verification evidence

- Focused scanner/client regression: **43/43 PASS**.
- Website/source regression: **205/205 PASS**.
- Package/runtime regression: **199/199 PASS**.
- Combined repository tests on the true latest-baseline tree: **404/404 PASS**.
- Step-3 changed-file ESLint: **PASS**.
- Extraction/types standalone TypeScript check: **PASS**.
- Next.js 16.3.6 production build: **PASS**.
- Production TypeScript build gate: **PASS**.
- Static export: **30/30 routes generated**.
- `npm ci`: **0 known vulnerabilities**.

## Real public read-only acceptance

Two bounded public-site scans were executed with the same production scanner code and no remote mutations:

1. `https://www.liverpoolboilerrepairs.co.uk/` — scan succeeded; extracted website, business name and service facts; missing hours/FAQ/greeting remained missing and warnings were emitted.
2. `https://www.pomonaecosolutions.co.uk/contact` — scan succeeded; extracted website, business name, Liverpool/Merseyside locations, two distinct telephone numbers, email, services, hours and structured FAQ pairs with provenance.

The second site initially exposed duplicate local/international telephone representations and a labelled `Call …` value. The extractor/client were tightened, regression tests were added, and the real-site scan was repeated. Final output contained exactly the two distinct telephone numbers.

## Non-Step-3 baseline observations

- Repository-wide `npm run lint` still reports seven pre-existing `no-explicit-any` errors in `src/lib/agent-blueprint.test.ts` from Step 2 plus one unrelated unused-import warning. Git diff proves Step 3 does not modify that file. All Step-3 changed files lint cleanly.
- A standalone package-wide TypeScript invocation also surfaces pre-existing discriminated-union narrowing errors in the SSRF helper path. The extraction/types files introduced by this step type-check, the production Next.js TypeScript gate passes, and all runtime/SSRF regression tests pass.
- One early full-suite run hit two transient calendar test `bad port` errors on Windows. The calendar package immediately reran 10/10 PASS and subsequent complete repository runs passed; no calendar code was changed.

## Acceptance decision

Step 3 is accepted when this exact candidate is merged after a final check that:

1. website `main` has not acquired conflicting changes;
2. the MaintenanceOS product SHA above is still the latest verified source;
3. the pull-request diff remains restricted to scanner/intake code, tests and Step-3 documentation.

No Step 4 work is included.
