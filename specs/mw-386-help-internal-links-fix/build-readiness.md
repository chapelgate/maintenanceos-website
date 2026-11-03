# mw-386: Fix broken internal links in help articles — Build Readiness

## 1. Spec Kit
Status: APPLIES
Reason: FEATURE route requires spec.md, plan.md, tasks.md, build-readiness.md per estate-gate contract. All present.

## 2. Tests
Status: APPLIES
Reason: Full test suite passes (630/630). New test help-internal-links.test.mjs added and passes. No regressions.

## 3. Lint & Typecheck
Status: APPLIES
Reason: `npm run lint` clean (0 errors, 0 warnings). `npm run typecheck` clean (tsc --noEmit passes).

## 4. Build
Status: APPLIES
Reason: `npm run build` succeeds with static export. 99 pages generated. No build errors.

## 5. Security & Frozen Paths
Status: APPLIES
Reason: No frozen paths touched. Verified by blast-radius: no deploy/**, live nginx, production DBs, golden line 165.227.227.9, IR statutory deadlines, disclosure/redaction controls, EW synthetic housing portfolio, approved releases, live customer records.

## 6. Public Launch Flag
Status: APPLIES
Reason: `NEXT_PUBLIC_PUBLIC_LAUNCH` remains `false`. No flip attempted. Code does not read or write this flag.

## 7. Accessibility
Status: APPLIES
Reason: `npm run accessibility:check` passes (17/17). No a11y regression. Content changes only.

## 8. Documentation & Claims
Status: APPLIES
Reason: No new claims added. Help article link fixes improve honesty (broken links removed). No PR/Marketing claim changes.