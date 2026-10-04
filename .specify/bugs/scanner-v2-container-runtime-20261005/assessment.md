# Assessment

## Goal lock

OBJECTIVE -> make the existing Scanner V2 companion image contain the runtime dependencies already required by Scanner V2 source.

ACCEPTANCE CRITERION -> the exact candidate Docker image builds successfully, starts with Scanner V2 enabled, reports healthy, can launch the renderer dependency and can load the PDF parser dependency; existing repository acceptance remains green.

EVIDENCE/BLOCKER -> current `main` dynamically imports `playwright` in `scanner-v2-renderer.ts` and `pdfjs-dist` in `scanner-v2-documents.ts`, while `packages/onboarding-ingest/package.json` declares no dependencies and its Dockerfile performs no package install. The existing `fix/scanner-v2-do-canary-20261004` branch already contains the minimal dependency and Docker installation changes.

NEXT ACTION -> reuse those exact package/package-lock/Dockerfile changes only, then build and smoke-test the exact container locally.

## Reuse / skill preflight

- Applied `chapelgate-skill-first` and the Chapelgate Estate Gate.
- Reuse source: existing proven `fix/scanner-v2-do-canary-20261004` branch.
- Dependencies are existing upstream packages already used by Scanner V2 source: `playwright@1.63.0` and `pdfjs-dist@6.3.289`.
- Licences in the existing lockfile are Apache-2.0 for Playwright/pdfjs-dist; optional canvas dependencies are MIT.
- No new service, runtime, database, queue, router, secret or infrastructure.
- Production routing and telephony are untouched.
- Work class: BUG.
