# Agent Factory Step 6 — Customer Review / Edit Gate

**Status:** IMPLEMENTED CANDIDATE — execution verification required before merge/freeze
**Scope:** make customer review mandatory before any future provisioning path may treat an AgentBlueprint as reviewed.

## Baselines

- Source branch: `agent-factory/step6-customer-review-gate`.
- Parent Step-5 candidate: `f076b896b38d8b1cbcf26a53c52f5fe715732369`.
- Embedded MaintenanceOS compatibility baseline remains `e68ed4d4328caa9622f9bbd26d68effd25c2c9ca` pending the separate verified baseline reconciliation.
- Latest MaintenanceOS source at refresh: `5eb0f92f2633e20e4d280835d3e6577e3f206c8b`; delta from `e68ed4d…` is documentation only.
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
- Final review panel shows the exact saved identity plus blueprint allowed/denied capabilities, transfer policy, enabled integrations and call-data settings.
- Pack/prompt/reset edits invalidate all previous review confirmations.
- Lead evidence now includes field provenance, structured fact provenance and the deterministic customer review record.
- `finalizeAgentReview` rejects incomplete or internally inconsistent review evidence before changing lifecycle.
- Step-5 configuration generation was corrected to preserve `draft`; Step 6 owns the `reviewed` transition.

## Regression coverage written

- Mandatory business-name, website, role and AI-output confirmations.
- Low-confidence structured facts and draft-only fields, with duplicate provenance requirements suppressed.
- Consequential capabilities and human-transfer confirmation.
- Missing legacy pack facts plus structured locations/contact details.
- Fail-closed incomplete review records.
- Deterministic review evidence independent of checkbox order.
- Reviewed lifecycle refuses incomplete/forged evidence.
- Complete review changes lifecycle only and preserves all control-plane fields.
- Identity edits can add/remove locations/contact while preserving controls.
- Invalid reviewed email is rejected.
- Accessible checkbox fieldset and disabled final submit until review complete.
- Review provenance/evidence persistence in the early-access lead message.

## Verification state

- Static scope/diff audit: COMPLETE.
- Static security/lifecycle audit: COMPLETE.
- Authorised Desktop Commander execution devices: OFFLINE at latest check.
- Focused real-repository Node tests: PENDING.
- Full `npm test`: PENDING.
- Changed-file ESLint: PENDING.
- `npm run build` / Next.js static export: PENDING.
- Merge/freeze: FORBIDDEN until all pending execution gates pass.

## Non-scope

- No phone-number provisioning.
- No live phone call.
- No carrier/Twilio/provider mutation.
- No calendar/email/CRM/SMS connector activation.
- No production database/schema change.
- No Step-7 sandbox qualification.
