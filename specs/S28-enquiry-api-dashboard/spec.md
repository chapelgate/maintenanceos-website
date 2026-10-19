# S28: /api/enquiry endpoint + admin dashboard

## Goal
Replace mailto fallback with a working `/api/enquiry` endpoint that persists enquiries to a JSONL file, and provide an admin dashboard at `/admin/enquiries/` to view and export submissions as CSV.

## Scope
- New API route: `src/app/api/enquiry/route.ts`
- New admin page: `src/app/admin/enquiries/page.tsx`
- New validation module: `src/lib/enquiry-processor.ts` with tests
- Update `/create/`, `/demo/`, `/pricing/`, `/contact/` pages to use `LeadCaptureForm`
- Update `scripts/production-lead-endpoint.test.mjs` for new create page behavior

## Acceptance Criteria
1. `curl -X POST /api/enquiry -d '{}'` returns 400 (validation)
2. `curl -X POST /api/enquiry -d '{"leadType":"contact","email":"test@example.co.uk"}'` returns 201 with reference
3. `/admin/enquiries/` page loads and shows submitted enquiries
4. `/admin/enquiries/?export=csv` downloads CSV export
5. All existing tests pass (except 2 pre-existing failures)
6. Build passes, lint passes, TypeScript clean

## Integration
- Uses existing `submitLead` from `lead-adapter.ts` which posts to form-stub endpoint
- Form-stub server stores leads in `.data/form-stub-leads.jsonl`
- Admin dashboard reads from same JSONL file
- No new infrastructure required for local/dev; DO Function deployment for production per D2