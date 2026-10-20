# S29 — Live Demo Number Implementation Plan

## Approach
Add a public demo phone number configuration to `siteConfig` that reads from `NEXT_PUBLIC_DEMO_PHONE_NUMBER` environment variable. Display the number on home page and create page when configured, with clear messaging that this is a demo number (not a production service).

## Files to Create/Modify

### 1. `src/config/site.ts` (modify)
- Add `demoPhoneNumber` property to `siteConfig` object reading from `process.env.NEXT_PUBLIC_DEMO_PHONE_NUMBER ?? ""`

### 2. `src/app/page.tsx` (modify)
- Import `siteConfig` from `@/config/site`
- In the closing CTA band (section 6), replace static "No live phone demo from this site" text with conditional rendering:
  - If `siteConfig.demoPhoneNumber` exists: show clickable tel link with the number and explanatory text
  - If not: show existing "No live phone demo from this site" text

### 3. `src/app/create/page.tsx` (modify)
- Import `siteConfig` from `@/config/site`
- After `PageHero` and before `FunnelPathStrip`, add conditional demo number display block when `siteConfig.demoPhoneNumber` exists
- Use `mos-glass` style card with accent border for visibility

## Verification Steps
1. `npm run build` — must pass
2. `npx tsc --noEmit` — must pass
3. `npm run lint` — must pass (only pre-existing warnings)
4. `npm test` — must pass (except pre-existing piper-http and pricing static output failures)
5. Local verification: build output includes demo number display when env var is set
6. Verify home page conditional rendering works
7. Verify create page conditional rendering works