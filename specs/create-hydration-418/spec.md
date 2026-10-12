# Fix for React Hydration Mismatch on /create (Error 418)

## Problem
The /create page was experiencing a React hydration mismatch (minified error 418) due to the button in CreateReceptionistForm having attributes that differed between the server and client render:
- `disabled={!hydrated}`
- `data-create-hydrated={hydrated ? "true" : "false"}`
These attributes would render as `false` on the server and `true` on the client after hydration, causing a mismatch.

## Solution
Introduced a `buttonState` object computed via `useMemo` that depends on the `hydrated` variable from `useSyncExternalStore`. This ensures:
- On both server and client during initial render, `buttonState` is `{ disabled: true, hydratedAttr: "false" }`
- After hydration, `buttonState` updates to `{ disabled: false, hydratedAttr: "true" }`
This keeps the initial render identical between server and client, eliminating the hydration mismatch.

## Changes
1. src/components/CreateReceptionistForm.tsx:
   - Added `useMemo` to compute `buttonState`
   - Updated button to use `buttonState.disabled` and `buttonState.hydratedAttr`
   - Updated button's inner text to reflect buttonState
2. Updated tests to match the new attribute patterns:
   - scripts/create-a11y.test.mjs
   - scripts/funnel-perf.test.mjs

## Testing
- All existing tests pass
- Build succeeds
- Lint passes