# S4 Tasks

## Completed Tasks

- [x] Create `scripts/build-gazetteer.ts` with ONS postcode districts, towns, counties
- [x] Run build script to generate `public/gazetteer.json.gz`
- [x] Add gazetteer loading utilities to `extract.ts`
- [x] Update `isUkPlaceName` to use gazetteer
- [x] Verify `serviceAreaNames`, `townFromAddress`, `extractCoveredAreas` work with gazetteer
- [x] Add 7 new gazetteer tests to `extract.test.ts`
- [x] Run `npm ci` - PASS
- [x] Run `npx tsc --noEmit` - PASS
- [x] Run `npm run lint` - PASS (5 pre-existing warnings)
- [x] Run `npm run build` - PASS (96 static pages)
- [x] Run `npm test` - PASS (278 pass, 2 pre-existing failures)
- [x] Commit changes to branch `feat/S4-scanner-gazetteer`
- [x] Create specs folder with spec.md, plan.md, tasks.md

## Pending Tasks

- [ ] Push branch to origin
- [ ] Open PR to main
- [ ] Wait for CI (estate-gate, validate, webkit-a11y)
- [ ] Merge with `gh pr merge --squash` when all checks green
- [ ] Update IMPL_STATE.md with PR number and SHA
- [ ] Run acceptance check against https://worksmartos.co.uk (after deploy)
- [ ] Clean up node_modules and build output

## Notes

The benchmark:scanner script (for `--field=area --sites=golden` acceptance test) is created in S8. Current verification is via unit tests.

Gazetteer file `public/gazetteer.json.gz` must be deployed to scanner droplet per D1 deploy note.