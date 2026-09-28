# Agent Factory Step 6 — Customer Review / Edit Gate

**Status:** VERIFIED — ready to freeze/save
**Scope:** make customer review mandatory before any future provisioning path may treat an AgentBlueprint as reviewed.

## Baselines

- Source branch: `agent-factory/step6-customer-review-gate`.
- Parent Step-5 candidate: `f076b896b38d8b1cbcf26a53c52f5fe715732369`.
- MaintenanceOS compatibility baseline: `5eb0f92f2633e20e4d280835d3e6577e3f206c8b` (latest source on 2026-09-27; product delta from `e68ed4d…` is documentation only).
- Live telephony/runtime is not modified.

## Acceptance contract

1. Customer can see/edit discovered business facts before final submission.
2. Scanner provenance/confidence is retained and shown where available.
3. Missing facts are explicit and are never invented.
4. Final generated business identity, role, permissions, transfer policy, integrations and call-data settings are visible.
5. Business name and website always require explicit confirmation.
6. Low-confidence discovered facts require explicit confirmation.
7. Consequential blueprint capabilities, enabled integrations, non-default call-data settings and human-transfer policy require explicit confirmation.
8. Generated AI output requires explicit confirmation.
9. Any data/output edit clears prior confirmations.
10. Invalid knowledge-pack JSON or any missing confirmation fails closed.
11. Review evidence is deterministic and stored with the early-access lead.
12. Lifecycle remains `draft` until complete review evidence is present; only then may it advance to `reviewed`.

## Implementation

- Added `src/lib/agent-review.ts` as a pure review-policy layer; no backend, queue, database or provisioning service added.
- Added `src/components/AgentReviewGate.tsx` for the human-readable final review and checkbox confirmations.
- `/create` now retains `factMeta` instead of discarding structured provenance.
- Review/edit now includes submitted website, business name, greeting, locations, phone, contact email, hours, services and FAQs.
- Optional identity edits are revalidated through AgentBlueprint v1 and cannot change permissions, rules, integrations, privacy, role or compatibility.
- Final review panel shows the exact saved identity plus blueprint allowed/denied capabilities, unavailable-information rule, forbidden actions, transfer policy, enabled integrations and call-data settings. The normalized final knowledge pack and exact final stored system prompt are available read-only.
- Draft/identity/pack/prompt/reset edits invalidate all previous review confirmations. Manual fact edits clear stale scanner provenance, and a monotonic edit-generation guard rejects stale async callbacks.
- Lead evidence now includes field provenance, structured fact provenance and the deterministic customer review record.
- `finalizeAgentReview` independently derives canonical current requirements, rejects incomplete/inconsistent review evidence, and verifies the exact output revision before changing lifecycle.
- Step-5 configuration generation was corrected to preserve `draft`; Step 6 owns the `reviewed` transition.

## Regression coverage written

- Mandatory business-name, website, role and AI-output confirmations.
- Low-confidence structured facts and draft-only fields, with duplicate provenance requirements suppressed.
- Consequential capabilities and human-transfer confirmation.
- Missing legacy pack facts plus structured locations/contact details.
- Fail-closed incomplete review records.
- Deterministic review evidence independent of checkbox order.
- Reviewed lifecycle refuses incomplete/forged/stale-revision evidence.
- Complete review changes lifecycle only and preserves all control-plane fields; non-draft review/edit attempts are rejected.
- Identity edits can add/remove locations/contact while preserving controls.
- Invalid reviewed phone/email and overflowing location lists are rejected rather than silently accepted/truncated.
- Accessible checkbox fieldset and disabled final submit until review complete.
- Review provenance/evidence persistence in the early-access lead message, including revision ID.

## Exact execution gate

Run from a clean checkout of this branch with the lockfile unchanged:

```bash
npm ci --no-audit --no-fund
node --experimental-strip-types --test src/lib/agent-review.test.ts src/lib/agent-configuration.test.ts src/lib/agent-selection.test.ts src/lib/agent-blueprint.test.ts src/lib/onboarding-create.test.ts
node --test scripts/agent-review-wiring.test.mjs scripts/create-a11y.test.mjs
npx --no-install eslint --no-ignore src/lib/agent-review.ts src/lib/agent-review.test.ts src/lib/agent-configuration.ts src/lib/agent-configuration.test.ts src/components/AgentReviewGate.tsx src/components/CreateReceptionistLaterSteps.tsx src/components/ReceptionistDraftPreview.tsx src/lib/onboarding-create.ts src/lib/onboarding-create.test.ts scripts/agent-review-wiring.test.mjs scripts/create-a11y.test.mjs
npm test
npm run build
```

Any failure keeps Step 6 unmerged and unfrozen. The verifier must record the exact commit SHA and command results.

## Verification state

- Static scope/diff audit: PASS.
- Static security/lifecycle audit: PASS.
- Machine-checked static contract audit: 31/31 PASS.
- Focused TypeScript tests: PASS — 63/63.
- Focused wiring/accessibility tests: PASS — 11/11.
- Changed-file ESLint: PASS.
- Full repository `npm test`: PASS — 241/241.
- TypeScript / Next.js 16.3.6 production build: PASS.
- Static export: PASS — 30/30 routes generated.
- Clean-tree check: PASS.
- Real verifier: authorised Desktop Commander device `CG`.
- Verification found and repaired three issues before closure: one schema-invalid pressure-test fixture, one checkbox accessibility association defect, and one nullable submit-path TypeScript defect.
- No telephony/provider/carrier/database/infrastructure files changed.

## Non-scope

- No phone-number provisioning.
- No live phone call.
- No carrier/Twilio/provider mutation.
- No calendar/email/CRM/SMS connector activation.
- No production database/schema change.
- No Step-7 sandbox qualification.
