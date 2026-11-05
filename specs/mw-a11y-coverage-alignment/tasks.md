# Tasks for mw-a11y-coverage-alignment

- [x] Change `preload: true` to `preload: false` in localFont config in `src/app/layout.tsx`
- [x] Verify `scripts/font-preload.test.mjs` passes
- [x] Run `npm run build` - PASS
- [x] Run `grep -r "fonts.googleapis.com" .next/` - PASS (no matches)
- [x] Run `npx tsc --noEmit` - PASS
- [x] Run `npm run lint` - PASS (warnings only)
- [x] Run `npm test` - PASS (865/865)
- [x] Commit and push
- [x] Create specs/mw-a11y-coverage-alignment/spec.md
- [x] Create specs/mw-a11y-coverage-alignment/plan.md
- [x] Create specs/mw-a11y-coverage-alignment/tasks.md
- [ ] Create specs/mw-a11y-coverage-alignment/build-readiness.md
