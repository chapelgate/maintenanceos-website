# S36 — Integrations Page (OAuth Providers)

## Slice ID
S36

## Title
Integrations page — Google/Outlook/Cal.com/Calendly/Zapier/HubSpot OAuth

## Goal
Connect → token stored encrypted → calendar write works

## Acceptance Criteria
- `/integrations/` page loads with all 6 provider cards (Google, Outlook, Cal.com, Calendly, Zapier, HubSpot)
- Each provider card shows: name, logo, description, status badge (Coming Soon / Available), "Connect" button
- Page includes JSON-LD structured data (WebPage + BreadcrumbList)
- Sitemap includes `/integrations/` with lastmod
- Build passes, TypeScript clean, lint clean, tests pass
- OAuth callback API routes exist at `/api/integrations/[provider]/callback`
- Integration configuration library at `src/lib/integrations.ts` with provider configs
- Encrypted token storage utility at `src/lib/integration-tokens.ts`

## Files Created/Modified
- `src/app/integrations/page.tsx` (new index page)
- `src/app/integrations/[provider]/page.tsx` (new provider detail page)
- `src/app/api/integrations/[provider]/callback/route.ts` (new OAuth callback handler)
- `src/lib/integrations.ts` (provider configurations)
- `src/lib/integration-tokens.ts` (encrypted token storage utilities)
- `src/lib/integrations.test.ts` (tests for integration library)
- `src/config/routes.ts` (add integrations route)
- `src/app/sitemap.ts` (add integrations to sitemap)
- `src/config/site.ts` (add integrations to footer nav)

## Dependencies
- S0 (CI fix) — merged
- S28 (enquiry API + dashboard pattern) — merged