# S30: Public Pricing Page with 3 Tiers

## Overview
Update the `/pricing/` page to display 3 public pricing tiers when `NEXT_PUBLIC_PUBLIC_LAUNCH=true`. Prices must be approved by Andy (not invented).

## Requirements
- 3 pricing tiers with names, prices (Andy-approved), features, and CTAs
- Tiers only shown in published mode (when `publicLaunch: true`)
- Pre-launch mode continues to show "Request pricing" card
- CTA buttons link to `/demo/` and `/create/`
- No self-serve checkout on this marketing site
- No live phone included in any plan

## Acceptance Criteria
- Page loads at `/pricing/`
- When `NEXT_PUBLIC_PUBLIC_LAUNCH=true`: 3 tiers displayed with Andy-approved prices
- When `NEXT_PUBLIC_PUBLIC_LAUNCH=false`: Pre-launch "Request pricing" card shown
- CTA buttons work (→ demo/enquiry)
- Build passes, TypeScript clean, lint passes, tests pass
- Prices match Andy's decision (not invented)

## Andy Items Required
- A13: Confirm £22 pricing unit/period (per month? per line? per property?) — Only Andy sets prices