# S2: Scanner Accuracy - Reject 00:00-23:59 Junk Hours, Prefer Visible Tables

## Problem
The scanner was accepting placeholder hours like "00:00-23:59" or "00:00-00:00" from JSON-LD `openingHours` fields, and preferring them over actual visible hours tables on the page. This led to incorrect "24/7" junk hours being spoken to users.

## Solution
1. Add a `PLACEHOLDER_HOURS_RE` regex to detect 00:00-23:59 / 00:00-00:00 patterns
2. Modify `trimHoursLine` to reject placeholder hours (return undefined)
3. Modify `plainHours` to reject placeholder hours when no valid hours pattern exists
4. Remove duplicate `PLACEHOLDER_HOURS_RE` constant definition
5. Add test: "visible hours beat JSON-LD placeholder hours"

## Acceptance Criteria
- `npm run benchmark:scanner -- --field=hours --sites=golden` → Wrong ≤2%, Correct ≥65%, zero 24/7 junk
- All existing tests pass (39/39 in extract.test.ts)
- Build passes, TypeScript clean, lint clean (warnings only)