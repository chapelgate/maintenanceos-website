# S19 Performance Budget CI Gate Tasks

- [x] Add @next/bundle-analyzer to package.json devDependencies
- [x] Update performance-budget.mjs to accept env var budget overrides
- [x] Create .github/workflows/perf.yml with S19 budgets
- [x] Run local verification (npm ci, tsc, lint, build, test)
- [x] Create specs/S19-bundle-budget/{spec.md,plan.md,tasks.md}
- [x] Commit and push to feat/S19-bundle-budget
- [x] Open PR #307 with Estate-Gate headers
- [ ] Wait for CI (estate-gate, performance-budget, webkit-a11y)
- [ ] If estate-gate fails due to missing spec files, create them and push fix
- [ ] If performance-budget fails due to pre-existing codebase state, record in IMPL_STATE.md
- [ ] Merge with gh pr merge --squash when all checks green
- [ ] Run live acceptance check against https://worksmartos.co.uk
- [ ] Update IMPL_STATE.md with PR number, SHA, and NEXT slice