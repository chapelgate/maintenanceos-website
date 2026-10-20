# S3: Scanner Accuracy - Grounded Services Extraction - Tasks

- [x] Remove extractServiceSubheadings function from extract.ts
- [x] Add extractGroundedServices function to extract.ts
- [x] Update extractDraftFromHtml to use extractGroundedServices
- [x] Add test for extractGroundedServices in extract.test.ts
- [x] Update failing tests in extract.test.ts (visible contact block, fixture contact pages)
- [x] Update failing test in scan.test.ts (Caroline Place)
- [x] Run `npm run build` - PASS
- [x] Run `npx tsc --noEmit` - PASS
- [x] Run `npm run lint` - PASS (pre-existing warnings only)
- [x] Run `npm test` - PASS (268/268, except pre-existing piper-http and pricing static output)
- [x] Create spec artifact files (spec.md, plan.md, tasks.md)
- [x] Commit and push changes
- [x] Open PR with Estate headers
- [ ] Wait for CI checks (estate-gate, validate, webkit-a11y) to pass
- [ ] Merge PR when all checks green
- [ ] Verify live acceptance test against https://worksmartos.co.uk

(End of file - total 19 lines)