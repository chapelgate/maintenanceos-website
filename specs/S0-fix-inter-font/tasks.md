# Tasks for S0: Self-host Inter Font

- [x] Create `public/fonts/` directory
- [x] Download Inter Regular (400) woff2
- [x] Download Inter Medium (600) woff2
- [x] Update `src/app/layout.tsx` to use `next/font/local`
- [x] Update `scripts/funnel-perf.test.mjs` to verify local font
- [x] Run `npm run build` - PASS
- [x] Run `grep -r "fonts.googleapis.com" .next/` - PASS (no matches)
- [x] Run `npx tsc --noEmit` - PASS
- [x] Run `npm run lint` - PASS (warnings only)
- [x] Run `npm test` - PASS (274/275, 1 pre-existing failure unrelated)
- [x] Commit and push
- [x] Create PR with required Estate headers
- [x] Create specs/S0-fix-inter-font/spec.md
- [x] Create specs/S0-fix-inter-font/plan.md
- [x] Create specs/S0-fix-inter-font/tasks.md