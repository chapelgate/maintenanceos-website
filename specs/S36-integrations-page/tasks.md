# S36 Tasks

## Phase 1: Core Library & Types
- [ ] Create `src/lib/integrations.ts` with provider configs and helpers
- [ ] Create `src/lib/integration-tokens.ts` with encryption utilities
- [ ] Create `src/lib/integrations.test.ts` with tests

## Phase 2: API Routes
- [ ] Create `src/app/api/integrations/[provider]/callback/route.ts`

## Phase 3: UI Pages
- [ ] Create `src/app/integrations/page.tsx` (index)
- [ ] Create `src/app/integrations/[provider]/page.tsx` (detail)

## Phase 4: Configuration & Navigation
- [ ] Update `src/config/routes.ts`
- [ ] Update `src/app/sitemap.ts`
- [ ] Update `src/config/site.ts` (footer nav)

## Phase 5: Verification
- [ ] Run `npm ci`
- [ ] Run `npx tsc --noEmit`
- [ ] Run `npm run lint`
- [ ] Run `npm test`
- [ ] Run `npm run build`
- [ ] All pass → commit, push, create PR