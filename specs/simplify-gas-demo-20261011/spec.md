# Spec: Simplify Gas Strip, Plain English Copy, and Receptionist Preview Fix (11 Oct 2026)

## Goal Lock
OBJECTIVE:
1. Remove the site-wide GasSafetyStrip from layout while retaining the emergency gas guidance on `/how-we-keep-control/#gas`, hero microline, and adding a small footer link "Smell gas? What to do" pointing to `/how-we-keep-control/#gas`.
2. Simplify visible site copy to plain everyday English (short sentences, headings max 6 words, reading age 9-11 / picture book style) across home, how-we-keep-control, industries, demo, pricing, and contact pages. Single main button label everywhere: "Request an early demo". Retain core safety honesty, pre-launch status, and no 24/7 / always-on claims.
3. Fix the receptionist preview so it answers from details entered or scraped from the visitor's website, and when a fact is missing, clearly says: "This is a preview and that detail has not been added yet."

ACCEPTANCE:
- `src/app/layout.tsx`: No site-wide `GasSafetyStrip`.
- `src/components/SiteFooter.tsx`: Small footer link `"Smell gas? What to do"` to `/how-we-keep-control/#gas`.
- `/how-we-keep-control/#gas`: Preserved with 0800 111 999 and 999 (never 911). No gas numbers on homepage.
- Headings <= 6 words across visible sections; single main CTA label `"Request an early demo"` pointing to `/demo/`.
- Receptionist draft and preview correctly parse, preserve, and query `locations` and `contact`, and announce missing details with `"This is a preview and that detail has not been added yet."`.
- Static export build succeeds; linter and all 448 tests pass.

EVIDENCE:
- `scripts/gas-safety.test.mjs`, `scripts/industries-copy.test.mjs`, `scripts/value-proposition.test.mjs`, `scripts/marketing-funnel-copy.test.mjs`.
- Unit tests in `packages/sandbox-test-call/src/scripted.test.ts`, `packages/receptionist-draft/src/build.test.ts`, `src/lib/agent-configuration.test.ts`, and `src/lib/sandbox-test-call.test.ts`.
- Full suite `npm test`, `npm run lint`, `npm run build` passing.
