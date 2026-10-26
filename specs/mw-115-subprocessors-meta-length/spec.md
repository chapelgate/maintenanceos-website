# mw-115-subprocessors-meta-length

## Goal
Subprocessors page metadata description must stay ≤160 characters so audit-slices SEO lock passes (REVIEW-rd2 left-to-release item 3 / SEO honesty).

## Acceptance
- `node --test scripts/subprocessors-meta-length.test.mjs` passes.
- `node --test scripts/audit-slices.test.mjs` meta description subtest passes.
