# WEBSITE_TEST_RESULTS

Date: 2026-11-02
Repo: chapelgate/maintenanceos-website
Branch tip used for this freeze note: main @ cd0a22ece63400b28c8d2c43e920c650471dd66e (before open recovery PRs #638–#641)

## Latest local gates (build-mw session)

| Gate | Result | Notes |
|---|---|---|
| `npm test` (scripts) | PASS | 697+ baseline on main; recovery PRs add +6 tests each trio |
| `npm test` (packages) | PASS | 630 pass / 0 fail on main worktree |
| `npm run lint` | PASS | eslint clean |
| `npm run typecheck` | PASS | tsc --noEmit clean |
| `npm run build` | PASS | static export (103 pages on recent main RC) |

## Binding CI on recent merges

| PR | estate-gate | webkit-a11y | lighthouse |
|---|---|---|---|
| #637 (merged) | SUCCESS | SUCCESS | FAIL (advisory) |

## Honesty

- This file records engineering verification only.
- It does **not** claim WCAG 2.2 AA certification, public launch readiness, or counsel-approved legal copy.
- Physical Safari/iOS + manual AT remain Andy-only (HUMAN_BLOCKERS / ANDY_BLOCKERS).
