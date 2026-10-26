# mw-85-integrations-prelaunch-honesty

## Goal
Integrations list and provider pages stay coming-soon honest: no dead Notify CTA, no invented availability email, no live OAuth/AES/audit claims on this static site.

## Acceptance
- `node --test scripts/integrations-prelaunch-honesty.test.mjs` passes.
- `node --test scripts/integrations-claims.test.mjs` passes.

## Follow-up (2026-10-26)
- Coming-soon provider descriptions in `src/lib/integrations.ts` must stay planned and must not invent Zapier app-count or present-tense live sync claims.
