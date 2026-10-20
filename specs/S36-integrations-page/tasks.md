# S36 Tasks

## Phase 1: Core Library & Types
- [x] Create `src/lib/integrations.ts` with provider configs and helpers
- [x] Create `src/lib/integration-tokens.ts` with encryption utilities
- [x] Create `src/lib/integrations.test.ts` with tests

## Phase 2: API Routes
- [x] Create `src/app/api/integrations/[provider]/callback/route.ts`

## Phase 3: UI Pages
- [x] Create `src/app/integrations/page.tsx` (index)
- [x] Create `src/app/integrations/[provider]/page.tsx` (detail)

## Phase 4: Configuration & Navigation
- [x] Update `src/config/routes.ts`
- [x] Update `src/app/sitemap.ts`
- [x] Update `src/config/site.ts` (footer nav)

## Phase 5: Verification
- [x] Run `npm ci`
- [x] Run `npx tsc --noEmit`
- [x] Run `npm run lint`
- [x] Run `npm test`
- [x] Run `npm run build`
- [x] All pass → commit, push, create PR