# Plan
1. Record the owner's primary-CTA decision in the `PRODUCT_CLAIMS_REGISTER.md` guardrails, README and BRAND_SYSTEM (P0).
2. Apply the READY drafts to existing components: `page.tsx`, `industries.ts`/`IndustryRolePage`, `page-meta.ts`/`seo-intents.ts` and the `site.ts` nav. Add one new route file. No new dependencies or infrastructure.
3. Strip review material (P1). Remove guide links (P2). Re-check the Awaab's Law date (P3).
4. Make `CtaPair` default to `/demo/` and demote Create/Join to secondary text links.
5. Fix LeadCaptureForm by capturing the form before `await`. Add a static `public/og-image.png` and reference it from the shared metadata helpers.
6. Update only the test assertions that encode superseded decisions (CTA, brand, nav, hero strings). Keep every safety assertion.
7. Expert review of the copy diff (NVIDIA Nemotron, free tier), then manual verification.
8. Rollback: revert the merge commit on `main` (the static App Platform build redeploys the previous commit).
