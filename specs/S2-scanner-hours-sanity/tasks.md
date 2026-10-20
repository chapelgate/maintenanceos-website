# Tasks for S2: Scanner Accuracy - Reject 00:00-23:59 Junk Hours, Prefer Visible Tables

- [x] Add `PLACEHOLDER_HOURS_RE` constant to detect 00:00-23:59 / 00:00-00:00 patterns
- [x] Modify `trimHoursLine` to reject placeholder hours (return undefined)
- [x] Modify `plainHours` to reject placeholder hours when no valid hours pattern exists
- [x] Remove duplicate `PLACEHOLDER_HOURS_RE` constant definition
- [x] Add test case "visible hours beat JSON-LD placeholder hours" in extract.test.ts
- [x] Run `npm test` - PASS (39/39 in extract.test.ts)
- [x] Run `npm run build` - PASS
- [x] Run `npx tsc --noEmit` - PASS
- [x] Run `npm run lint` - PASS (warnings only)
- [x] Commit and push
- [x] Create PR with required Estate headers
- [x] Create specs/S2-scanner-hours-sanity/spec.md
- [x] Create specs/S2-scanner-hours-sanity/plan.md
- [x] Create specs/S2-scanner-hours-sanity/tasks.md