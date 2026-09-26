# Continuation Step 3 — product evidence refresh

**Date:** 2026-09-26
**Owner:** MOS Product Investigator + MOS Website Manager
**Website repository:** `chapelgate/maintenanceos-website`
**Product repository:** `chapelgate/maintenanceos-v1-pilot`
**Audited product checkpoint:** `cc682c3e5dc5a50e6d8ea695767b3e0f1f6f09c8`
**Scope:** refresh website claims evidence only; no voice-runtime or infrastructure mutation

## Goal

Re-audit the website's signed product claims against the current canonical
MaintenanceOS source before any further present-fact marketing expansion.

The audit rule is evidence-first:

1. source existence can prove a source capability;
2. tests can prove bounded code/control behaviour;
3. neither source nor tests alone prove a public production service;
4. commissioning evidence stays UNDER TEST until its own production gates pass.

## Product source reviewed

Directly reviewed at the exact checkpoint above:

- `CURRENT_STATUS.md` (dated 2026-09-20)
- `README.md`
- `ARCHITECTURE.md`
- `DECISION_BOOK.md`
- `PILOT_CHECKLIST.md`
- `FINALISATION_10_STEPS.md`
- `STAGED_VOICE_INTEGRATION.md`
- `CONTROLLED_GEMINI_CALL_RUNBOOK.md`
- `docs/voice/CANDIDATE_PIN_MANIFEST.md`
- `docs/voice/CLOUD_COST_EXIT_POLICY.md`
- current voice/runtime/control source and relevant tests

Recent main history was also checked. Since the earlier website signature, product
main has added transfer hardening, UK caller-flow regressions, voice candidate
integrity controls, a pinned local/self-hosted commissioning candidate, and runner
policy changes.

## Executed verification

### Claims-control regression set

Python 3.13.15:

- explicit transfer only;
- live-defect regressions;
- voice action claims;
- Gemini provider behaviour;
- tenant isolation;
- lifecycle integrity;
- readiness profiles;
- webhook security.

Result: **88 passed / 0 failed**.

### Broad product regression on Windows

The broad run was executed without the two Linux-only `resource` concurrency
modules.

Result: **356 passed / 1 platform-specific failure**.

The remaining assertion checks POSIX `0600` mode bits for USH identity files.
NTFS/Windows does not expose the same POSIX mode semantics. This is not used as
evidence for any website claim.

An unfiltered Windows collection additionally cannot import Python's Linux/Unix
`resource` module for the two concurrency suites. No concurrency or capacity
claim is promoted by this refresh.

A Linux Docker rerun was attempted, but the workstation's Docker Desktop Linux
engine was unavailable. The audit therefore treats those platform-specific tests
as an environment limitation, not as positive evidence.

## Claims decision

### Remain VERIFIED

The refresh re-confirms the source/control basis for:

- UK terminology and 999-not-911 guidance;
- caller-detail intake;
- explicit-request-only human transfer **existence**;
- no invented consequential-action claims;
- deterministic safety/lifecycle/approval authority;
- critical-safety latch and HUMAN_REVIEW;
- no client-money execution authority;
- tenant isolation;
- Twilio signature-verification controls;
- action-evidence/audit architecture.

The audit adds one bounded reliability row: the exact current claims-control
regression set passed 88/88.

### Remain UNDER TEST

- AI voice receptionist runtime;
- carrier transfer quality;
- current production/public hosting;
- website scan/pack/scripted sandbox;
- conversation-quality parity.

The new local/self-hosted voice candidate is recorded as **V-11 UNDER TEST**.
The product manifest explicitly calls it an active commissioning pin and says it
is not final production acceptance.

### Remain NOT AVAILABLE / forbidden as present capability

- controlled carrier call proven on the current canonical runtime;
- public production voice / Twilio streaming proof;
- concurrent multi-line capacity numbers;
- commercial GA/customer-call pilot;
- public customer portal/billing;
- unearned security certifications;
- invented social proof or uptime.

## Website changes

- re-signed `PRODUCT_CLAIMS_REGISTER.md` at the exact product SHA;
- refreshed the Phone AI inventory against the canonical product repo;
- removed stale provider-specific “Gemini Live primary” marketing wording;
- kept the on-page card set at exactly **5 VERIFIED + 2 UNDER TEST**;
- recorded the self-hosted candidate only as an off-page UNDER TEST inventory row;
- closed `F1-REFRESH` in the single backlog;
- marked the launch claims-refresh gate complete;
- added `scripts/product-evidence-refresh.test.mjs` to prevent evidence drift.

## Non-goals

This step does not:

- enable realtime voice;
- touch Twilio, Gemini, Kokoro, Speaches or production call routing;
- create or remove a droplet;
- change any product repository file;
- claim production voice, GA, concurrency, carrier quality or Fonio parity;
- alter legal launch gates.

The next product-source change that affects a marketed claim must trigger another
claim review before public copy is expanded.
