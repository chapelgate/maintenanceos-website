# Plan: mw-314 chat widget deferral

1. Create `src/components/DeferredChatWidget.tsx` - client wrapper with `next/dynamic` (ssr:false)
2. Update `src/app/create/page.tsx` - import and use `DeferredChatWidget`
3. Update `src/components/IndustryRolePage.tsx` - import and use `DeferredChatWidget`
4. Create `scripts/chatwidget-deferral.test.mjs` - verify pattern on both pages
5. Run full verification: npm test, lint, typecheck, build
