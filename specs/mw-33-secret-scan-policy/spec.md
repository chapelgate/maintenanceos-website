# mw-33-secret-scan-policy

## Problem

GATES security requires: "Approve only an exact candidate with green build, full tests (after mw-05), lint, typecheck, secret-scan policy on that SHA, monitoring without the retired Railway default, and rollback evidence."

The existing `scripts/secret-pattern-scan.test.mjs` scans tracked source for common live secret patterns but:
- Does not scan the full tree (skips packages/, .next/, node_modules/, out/, etc. but should explicitly document what is scanned vs skipped)
- Does not enforce on PR CI as a gate — no workflow step references it
- Pattern list may be incomplete for this codebase (e.g., Next.js tokens, Vercel tokens, AWS keys, database URLs)

## Cause

Secret scan test exists but was never wired into CI as a required check. Coverage and patterns need verification against the exact candidate SHA.

## Acceptance

- Extend `scripts/secret-pattern-scan.test.mjs` with comprehensive pattern list for this stack (Next.js, Vercel, AWS, DB URLs, generic tokens).
- Document exactly what directories/files are scanned vs skipped and why.
- Run as a standalone `node --test scripts/secret-pattern-scan.test.mjs` that can be wired into CI.
- npm test 630 pass.
