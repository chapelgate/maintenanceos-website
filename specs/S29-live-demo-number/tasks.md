# S29 — Live Demo Number Tasks

## Tasks

- [x] Add `demoPhoneNumber` config to `src/config/site.ts`
- [x] Update `src/app/page.tsx` to display demo number in closing CTA band
- [x] Update `src/app/create/page.tsx` to display demo number after hero
- [x] Create specs folder with spec.md, plan.md, tasks.md
- [x] Run `npm ci` to install dependencies
- [x] Run `npx tsc --noEmit` — TypeScript check passes
- [x] Run `npm run lint` — lint passes (only pre-existing warnings)
- [x] Run `npm run build` — build passes
- [x] Run `npm test` — tests pass (except pre-existing failures)
- [x] Commit changes
- [x] Push branch and create PR
- [x] Wait for CI checks (estate-gate, validate, webkit-a11y)
- [x] Merge PR when all checks pass
- [x] Verify live acceptance on https://worksmartos.co.uk/ and https://worksmartos.co.uk/create/
- [x] Update IMPL_STATE.md with PR number and merge SHA

## Notes
- PR body must begin with Estate-Preflight, Estate-Route, Estate-Artifact, Estate-Converged headers
- PR body must include: "Skills used: ...", slice id, acceptance test and its result
- The Twilio number itself is an ANDY ITEM (A22) — Andy must provide the number and configure Twilio webhook
- This slice only adds the UI display; the number will be configured at deploy time