# S21 — Trust & Verification Page Implementation Plan

## Approach
Follow the existing page patterns in the codebase (security, subprocessors, vulnerability-disclosure, accessibility pages) using:
- `PageHero` for hero section
- `JsonLd` with `contentPageJsonLd` for structured data
- `contentPageMetadata` for metadata
- Semantic HTML sections with proper ARIA labels
- Consistent styling with `mx-auto max-w-3xl space-y-12 px-4 py-12`

## Files to Create/Modify

### 1. `src/app/trust/page.tsx` (new)
- Export metadata using `contentPageMetadata`
- Render `JsonLd` with `contentPageJsonLd`
- Render `PageHero` with eyebrow "Trust · Pre-launch"
- Sections for each required topic:
  - Legal Entity (Companies House link)
  - DPIA Status
  - Call Recording & Voice AI Disclosure
  - Certification Status
  - Pre-Launch Status
  - Voice Demo — Browser-Only & Live Number
  - Related Pages

### 2. `src/config/site.ts` (modify)
- Add `{ href: "/trust/", label: "Trust & verification" }` to `footerNav.company` array

### 3. `src/app/create/page.tsx` (modify)
- Add trust link in "Honest limits" section

### 4. `src/app/demo/page.tsx` (modify)
- Add trust link at bottom of page after `DemoConversionTabs`

## Verification Steps
1. `npm run build` — must pass
2. `npx tsc --noEmit` — must pass
3. `npm run lint` — must pass (only pre-existing warnings)
4. `npm test` — must pass (except pre-existing piper-http and pricing static output failures)
5. Local verification: `curl http://localhost:3000/trust/` returns 200
6. Verify footer link appears on all pages
7. Verify create and demo pages have trust links