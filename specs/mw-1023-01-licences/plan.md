# Plan

Mirror the completed specs/enquiry-mailto-fallback/ Spec Kit structure for the mw-1023-01-licences licence-evidence slice.

1. Create specs/mw-1023-01-licences/spec.md: problem, cause, acceptance for the licence-evidence slice binding 474 lock rows to docs/THIRD_PARTY_RELEASE_EVIDENCE.md and scripts/licence-evidence.test.mjs at commit c4ff3ca (lock hash f6305aad...).
2. Create specs/mw-1023-01-licences/plan.md: this plan; add Estate-* header lines to PR #346 body via gh pr edit; do not touch docs/THIRD_PARTY_RELEASE_EVIDENCE.md, scripts/licence-evidence.test.mjs, package.json, package-lock.json, LICENSE*, src/**, public/**, deploy/, .github/.
3. Create specs/mw-1023-01-licences/tasks.md: every task checked ([x]) including spec/plan/tasks/build-readiness creation, Estate header prepend, push to readiness/mw-1023-01-licences (PR #346 head), estate-gate green check.
4. Create specs/mw-1023-01-licences/build-readiness.md: groups 1-8 each Status: APPLIES|NOT_APPLICABLE|ALREADY_COVERED and Reason: >= 10 chars.
5. Push only new specs/mw-1023-01-licences/* to existing branch readiness/mw-1023-01-licences (PR #346). Do not create readiness/mw-1024-01-estate-meta as a competing PR. Keep PR #346 draft.
6. Verify estate-gate success and node --test scripts/licence-evidence.test.mjs still 3 pass / 0 fail.
