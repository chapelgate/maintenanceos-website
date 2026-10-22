# Tasks: S8 Scanner Benchmark CI

- [ ] Add `.github/workflows/scanner-benchmark.yml` workflow
- [ ] Implement `scripts/benchmark-scanner.ts` with accuracy thresholds
- [ ] Add `npm run benchmark:scanner` script to package.json
- [ ] Create `specs/S8-scanner-benchmark/spec.md`, `plan.md`, `tasks.md`
- [ ] Local verification: npm ci, npx tsc --noEmit, npm run lint, npm test, npm run build
- [ ] Push changes and create PR
- [ ] Wait for CI (estate-gate, scanner-benchmark, validate, webkit-a11y)
- [ ] Merge PR when all checks green