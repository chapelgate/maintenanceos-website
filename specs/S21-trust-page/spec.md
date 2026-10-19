# S21 — Trust & Verification Page

## Summary
Create a consolidated `/trust/` page that serves as a single trust hub exceeding competitors, consolidating: Companies House link, DPIA status (honest), recording disclosure (honest), no ISO/SOC 2, pre-launch status, and voice demo browser-only details.

## Acceptance Criteria
- Page loads HTTP 200 at `/trust/`
- No invented claims; all statements are honest and verifiable
- Linked from footer (Company section)
- Linked from `/create/` page
- Linked from `/demo/` page
- Contains all required sections:
  - Legal Entity (Companies House link)
  - DPIA Status (honest — in progress, not complete)
  - Call Recording & Voice AI Disclosure (honest)
  - Certification Status (explicitly lists what we don't have)
  - Pre-Launch Status
  - Voice Demo — Browser-Only & Live Number
  - Related Pages navigation
- Build passes, TypeScript clean, lint clean
- All tests pass (except pre-existing failures)

## Scope
- New file: `src/app/trust/page.tsx`
- Modified: `src/config/site.ts` (footer navigation)
- Modified: `src/app/create/page.tsx` (add trust link)
- Modified: `src/app/demo/page.tsx` (add trust link)