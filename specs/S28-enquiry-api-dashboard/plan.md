# S28 Implementation Plan

## Phase 1: API Endpoint
1. Create `src/lib/enquiry-processor.ts` - validation and processing logic
2. Create `src/lib/enquiry-processor.test.ts` - unit tests for processor
3. Create `src/app/api/enquiry/route.ts` - Next.js API route handler
4. Create `src/app/api/enquiry/route.test.ts` - placeholder for route tests

## Phase 2: Admin Dashboard
5. Create `src/app/admin/enquiries/page.tsx` - static page with table and CSV export
6. Ensure it reads from `.data/form-stub-leads.jsonl`

## Phase 3: Frontend Integration
7. Update `src/app/create/page.tsx` - replace `EnquiryUnavailable` with `LeadCaptureForm` (leadType: create_receptionist)
8. Update `src/app/demo/page.tsx` - add `LeadCaptureForm` (leadType: early_demo)
9. Update `src/app/pricing/page.tsx` - add `LeadCaptureForm` (leadType: launch_list)
10. Verify `src/app/contact/page.tsx` already uses `LeadCaptureForm` (leadType: contact)

## Phase 4: Tests & Quality Gates
11. Update `scripts/production-lead-endpoint.test.mjs` - check for LeadCaptureForm in create page
12. Run `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`
13. All must pass (2 pre-existing failures acceptable)

## Phase 5: Documentation
14. Create specs/S28-enquiry-api-dashboard/{spec.md, plan.md, tasks.md}