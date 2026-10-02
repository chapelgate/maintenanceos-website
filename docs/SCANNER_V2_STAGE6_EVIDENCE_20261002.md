# Scanner V2 Stage 6 Evidence — Source-Grounded Receptionist

Date: 2026-10-02
Status: CODE + TEST GATE PASS / NVIDIA REVIEW PENDING
Exact tested source SHA: 8fa959e6663519686f7d406bdb7f1a6c640138d3

## Implemented

- exact structured-fact lookup before arbitrary corpus retrieval;
- deterministic Stage 5 BM25 corpus search for arbitrary site questions;
- bounded retrieval admission: queries with 3+ meaningful terms require at least 2 matched corpus terms unless an exact identifier matched;
- deterministic extractive answer chosen directly from retrieved evidence;
- source trace with chunk IDs and canonical source URLs;
- honest not-found result with zero invented evidence;
- optional synthesizer interface intended for free/local model use only after retrieval;
- optional synthesis receives retrieved evidence only;
- conservative synthesis verifier rejects new meaningful words and numeric claims that are absent from evidence, then falls back to exact extractive evidence;
- structured FAQ path remains ahead of generic retrieval;
- existing five-field summary is compatibility/exact-fact input only, not the arbitrary-question source of truth.

## Defects caught by the first gate

The first Stage 6 validation run failed usefully and was not weakened:
1. "email address" was shadowed by generic address/location intent;
2. FAQ matching lacked bounded inflection normalisation;
3. a one-term corpus overlap could answer an unrelated multi-term question;
4. one deep-question fixture overlapped the structured FAQ path.

Repairs:
- email/phone intent now precedes generic location/address matching;
- bounded stemming added for deterministic FAQ overlap;
- weak multi-term retrieval is rejected before any receptionist claim;
- corpus and structured-FAQ acceptance cases are tested separately.

## Deterministic verification

GitHub Actions:
- run: 37043573681
- job: 110959410228
- conclusion: PASS

Targeted Stage 4-6 tests:
- 23/23 PASS

Full repository regression:
- 375/375 PASS

Accessibility:
- 16/16 PASS

Static/build:
- TypeScript: PASS
- production Next.js build: PASS
- static routes: 30/30

Boundary assertions:
- SCANNER_V1_RUNTIME_UNCHANGED=PASS
- BROWSER_PREVIEW_RUNTIME_UNCHANGED=PASS
- GOLDEN_PHONE_LINE_CHANGE_SURFACE=0

## Deep-question acceptance

A deterministic fixture verifies 10 deep-site questions whose answers live outside the five-field summary, including:
- installation lead time;
- scheme eligibility;
- delivery area;
- returns rule;
- published call-out price;
- repair reporting route;
- Christmas opening detail;
- replacement-key ordering;
- installation warranty;
- engineer parking.

For every supported corpus answer:
- answer text is an exact substring of evidence;
- exactly traced source URL is returned;
- exactly traced chunk ID is returned;
- unsupported questions return not_found with no evidence claims.

## Model/cost policy

Baseline correctness requires no paid model and no model call.

An optional synthesizer is only allowed after deterministic retrieval and must pass the evidence verifier. Free/local/NVIDIA reasoning capacity is preferred when synthesis is later enabled.

## Release boundary

Stage 6 remains additive. It does not switch the public /create route to Scanner V2 yet. Scanner V1 and the current browser preview remain production behaviour until later Scanner V2 stages and the final production canary pass.

## Golden-line boundary

No MaintenanceOS production telephony, carrier routing, live phone number, provider credential, production voice runtime or golden phone line was modified, exercised, rerouted, restarted or redeployed.
