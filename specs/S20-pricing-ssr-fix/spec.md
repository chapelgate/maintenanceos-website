# S20: Fix Pricing page SSR/streaming bug — ensure full HTML renders with `<h1>`

## Goal
Googlebot sees content; Lighthouse mobile ≥90

## Acceptance Criteria
- `curl https://worksmartos.co.uk/pricing/ | grep -c '<h1'` ≥ 1
- Lighthouse mobile ≥90
- Static build output at `out/pricing/index.html` contains `<h1>Pricing</h1>`

## Scope
- File: `src/app/pricing/page.tsx`
- Test: `scripts/pricing-copy.test.mjs` (extended)

## Verification
The pricing page already renders correctly with full HTML including the `<h1>` heading. The PageHero component outputs `<h1 class="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Pricing</h1>`. Added test to verify static output contains the h1 heading and prevent regression.