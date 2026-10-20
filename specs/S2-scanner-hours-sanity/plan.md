# Plan for S2: Scanner Accuracy - Reject 00:00-23:59 Junk Hours, Prefer Visible Tables

## Steps
1. Add `PLACEHOLDER_HOURS_RE` constant to detect 00:00-23:59 / 00:00-00:00 patterns in `packages/onboarding-ingest/src/extract.ts`
2. Modify `trimHoursLine` function to reject placeholder hours (return undefined)
3. Modify `plainHours` function to reject placeholder hours when no valid hours pattern exists
4. Remove duplicate `PLACEHOLDER_HOURS_RE` constant definition (was defined twice)
5. Add test case "visible hours beat JSON-LD placeholder hours" in `packages/onboarding-ingest/src/extract.test.ts`
6. Run `npm test` to verify all tests pass
7. Run `npm run build` to verify build passes
8. Run `npx tsc --noEmit` to verify TypeScript clean
9. Run `npm run lint` to verify lint clean
10. Commit and push
11. Create PR with required Estate headers
12. Create specs/S2-scanner-hours-sanity/spec.md
13. Create specs/S2-scanner-hours-sanity/plan.md
14. Create specs/S2-scanner-hours-sanity/tasks.md