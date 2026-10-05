# Assessment

## Goal lock

OBJECTIVE -> restore the existing DigitalOcean website scan Function so valid POST requests execute the already-built Scanner V2 proxy.

ACCEPTANCE CRITERION -> the Function package uses the exported handler name expected by DigitalOcean Functions; existing Scanner V2 image, website validation and patch-integrity gates remain green; no telephony or infrastructure change.

EVIDENCE/BLOCKER -> live same-origin POSTs returned DigitalOcean generic HTTP 400 for both public and deliberately blocked private URLs. The current bundle exports `main`, while `project.yml` incorrectly sets `main: bundle.cjs`. The last known-good live configuration used `main: main`.

NEXT ACTION -> change only `packages/onboarding-ingest/project.yml` from `main: bundle.cjs` to `main: main`, then run existing validation and live acceptance.

## Reuse / skill preflight

- Reuse the existing Function bundle and existing DigitalOcean Functions component.
- No new service, queue, database, router, host, credential or control plane.
- Scanner V2 runtime image is unchanged.
- Production telephony, carrier routing, voice and golden phone line are untouched.
- Work class: BUG.
