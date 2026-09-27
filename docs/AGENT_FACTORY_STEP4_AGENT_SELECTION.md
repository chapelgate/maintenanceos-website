# Agent Factory Step 4 — Controlled Agent Selection

**Status:** VERIFIED CANDIDATE — ready for freeze/merge
**Scope:** agent-role selection and AgentBlueprint draft creation only

## Baselines

- Website base before Step 4: `4062b779b6af445712c34c168c93745fc8b67d6f`.
- Reconciled website baseline before final Step-4 verification: `482b408d60ed7faf086a9445731e0b76e0755a26`.
- MaintenanceOS product compatibility baseline: `e68ed4d4328caa9622f9bbd26d68effd25c2c9ca` (2026-09-27).
- Verified combined Step-4 candidate before evidence commit: `d70b5ce9cf02fc5fc632658c61ffd9b15813e055`.

## Scope implemented

- Inserts **Choose** into the public create path: `Website → Check → Choose → Review → Pack`.
- Offers exactly six bounded roles: AI receptionist, maintenance desk, booking assistant, customer service, sales/enquiry assistant, custom agent.
- A role selection creates a schema-validated `AgentBlueprint v1` in `draft` lifecycle state.
- Uses structured Step-3 scan facts for business identity, locations, first contact, services, hours and FAQs.
- Stores the selected draft AgentBlueprint with the existing early-access lead.
- Keeps the legacy `create_receptionist` lead type unchanged to avoid backend-contract drift.
- Updates only copy/tests that describe the current `/create` path so the public site stays truthful.

## Safety boundaries

- No default role is silently selected.
- Agent types and capabilities are bounded enums; no free-text capability escalation.
- Capabilities not explicitly allowed are explicitly denied.
- Website-derived knowledge remains `untrustedWebsiteContent: true`.
- No API keys, carrier/provider credentials or runtime-provider settings are present in the blueprint.
- Integrations remain empty in this step.
- Call recording and transcription remain false and retention is zero in the draft.
- No provisioning, phone-number allocation, carrier routing, database mutation, sandbox activation or live-agent activation is added.
- Existing MaintenanceOS live phone work is untouched.

## Verification

- AgentBlueprint + selection + onboarding focused regression on the reconciled baseline: **28/28 PASS**.
- All six role templates independently produce schema-valid AgentBlueprint v1 drafts.
- Full repository `npm test`: **PASS**.
- Package/runtime test phase: **206/206 PASS**.
- Step-4 changed-file ESLint: **PASS**.
- Next.js 16.3.6 production build: **PASS**.
- Production TypeScript gate: **PASS**.
- Static export: **30/30 routes generated**.

## Defects caught before freeze

1. A secret/provider regression assertion incorrectly matched the legitimate safety rule `credential_disclosure`; the test was narrowed to actual secret/provider fields.
2. The mapped radio selector triggered `label-has-associated-control`; explicit accessible naming was added and lint reran clean.
3. `/how-it-works` had only four stage descriptions; a bounded Choose description was added.
4. `/demo` had only four stage descriptions; the Choose description and path copy were added.
5. A stale demo regression still expected the four-stage path; it was corrected and the full suite rerun.
6. The MaintenanceOS product baseline moved during the step; the shared compatibility baseline was independently advanced and verified before Step-4 retesting.

## Browser verification note

The optional `agent-browser` CLI is not installed on the authorised verification machine. No new browser tooling was installed because that would add scope/dependency churn. Verification therefore uses the repository's accessibility/source tests, runtime tests, TypeScript and the production static build. Do not represent this step as having received an automated browser click-through.

## Acceptance decision

Step 4 may be merged only if, immediately before merge:

1. the MaintenanceOS compatibility SHA above is still the latest verified product source;
2. website `main` has no unincorporated conflicting changes;
3. the PR diff contains only Step-4 selection/funnel alignment, tests/evidence, and the already-verified baseline reconciliation.

No Step 5 generation work is included.
