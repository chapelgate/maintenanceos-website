# Plan
1. Fix receptionist preview (Job 3):
   - Update `packages/receptionist-draft` types and normalization to include `locations` and `contact`.
   - Update `src/lib/agent-configuration.ts` to forward `locations` and `contact` and fall back to blueprint knowledge.
   - Update `src/components/CreateReceptionistLaterSteps.tsx` to handle facts from scraping/input.
   - Update `packages/sandbox-test-call/src/scripted.ts` to match `locations`, `contact`, and `company` intents, and append " This is a preview and that detail has not been added yet." on missing facts.
   - Add comprehensive tests.
2. Gas safety strip and footer link (Job 1):
   - Remove `GasSafetyStrip` from `src/app/layout.tsx`.
   - Add small footer link `"Smell gas? What to do"` to `/how-we-keep-control/#gas` in `src/components/SiteFooter.tsx`.
   - Update `scripts/gas-safety.test.mjs`.
3. Plain English copy simplification (Job 2):
   - Simplify visible copy and constrain section headings to <= 6 words across `src/app/page.tsx`, `src/app/how-we-keep-control/page.tsx`, `src/app/industries/page.tsx`, `src/config/industries.ts`, and `src/components/IndustryRolePage.tsx`.
   - Ensure single main CTA is `"Request an early demo"` pointing to `/demo/`.
   - Verify `/demo/`, `/pricing/`, and `/contact/` adhere to claims safety, pre-launch status, and short headings.
4. Verification & Convergence:
   - Run `npm test`, `npm run lint`, and `npm run build`.
   - Rollback: Revert the merge commit on main.
