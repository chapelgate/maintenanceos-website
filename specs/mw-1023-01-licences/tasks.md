# Tasks

- [x] Create specs/mw-1023-01-licences/spec.md mirroring specs/enquiry-mailto-fallback/spec.md structure
- [x] Create specs/mw-1023-01-licences/plan.md with Estate header steps
- [x] Create specs/mw-1023-01-licences/tasks.md with every task checked
- [x] Create specs/mw-1023-01-licences/build-readiness.md groups 1-8 each Status: APPLIES|NOT_APPLICABLE|ALREADY_COVERED and Reason: >= 10 chars
- [x] Prepend Estate-Preflight: yes / Estate-Route: FEATURE / Estate-Artifact: specs/mw-1023-01-licences / Estate-Converged: yes to PR #346 body via gh pr edit (literal lines at top, not bold, not fenced)
- [x] Push only specs/mw-1023-01-licences/* to existing branch readiness/mw-1023-01-licences (PR #346 head); keep PR #346 draft
- [x] Verify node --test scripts/licence-evidence.test.mjs exits 0 with 3 pass / 0 fail
- [x] Verify gh pr checks 346 shows estate-gate / estate-gate success
