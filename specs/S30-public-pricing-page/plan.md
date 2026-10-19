# S30: Public Pricing Page - Plan

## Approach
1. Update `src/config/pricing.ts` to add 3 pricing tiers in the `published.tiers` array with placeholder prices (marked as needing Andy's approval)
2. Update `src/app/pricing/page.tsx` to render the 3 tiers in a grid when `showTiers` is true
3. Keep pre-launch mode unchanged (shows "Request pricing" card)
4. Ensure CTA buttons link to `/demo/` (primary) and `/create/` (secondary)
5. Add test for the new tier rendering

## Files to Modify
- `src/config/pricing.ts` - Add 3 tiers to `published.tiers` with placeholder prices
- `src/app/pricing/page.tsx` - Render tier cards in published mode
- `scripts/pricing-copy.test.mjs` - Update test to verify tier rendering

## Verification
- Run `npm run build` - must pass
- Run `npx tsc --noEmit` - must pass
- Run `npm run lint` - must pass (warnings OK)
- Run `npm test` - must pass (except pre-existing piper-http failure)
- Verify generated HTML contains 3 tier cards with prices when in published mode

## Andy Decision Required
- Andy must provide the 3 tier names, prices, and feature lists
- Prices cannot be invented — must be labelled UNVERIFIED until Andy confirms