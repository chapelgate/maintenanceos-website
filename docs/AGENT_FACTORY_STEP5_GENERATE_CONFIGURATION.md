# Agent Factory Step 5 — Generate AI Configuration

**Status:** IMPLEMENTED CANDIDATE — execution verification required before merge/freeze
**Scope:** convert the selected Step-4 AgentBlueprint plus reviewed Step-3/4 business data into a role-specific, claims-safe AI configuration.

## Baselines

- Website source baseline: `5bdc8d01720629a06c1452469cf8b5b0e5334f2a`.
- MaintenanceOS product compatibility baseline at latest refresh: `e68ed4d4328caa9622f9bbd26d68effd25c2c9ca` (2026-09-27).
- Live phone/runtime remains a separate workstream and is not modified by this step.

## Acceptance contract

1. Approved website/review data may populate business identity and knowledge only.
2. Website/review text cannot change agent type, behaviour policy, permissions, escalation, forbidden actions, privacy or integrations.
3. Editable prompt text cannot remove or widen trusted AgentBlueprint controls.
4. All six Step-4 agent types generate role-specific configuration.
5. Missing facts remain missing; no hours, services, FAQs, phone service or integrations are invented.
6. The output remains pre-launch/sandbox configuration and does not provision or activate anything.

## Implementation

- Reuses the existing knowledge-pack parser/normalizer; no duplicate parser was created.
- Adds `src/lib/agent-configuration.ts` as the narrow data/control adapter.
- Generated prompts contain a clearly marked untrusted business-data block followed by a trusted AgentBlueprint control tail.
- The trusted tail is always placed last and space is reserved for it before the `MAX_PROMPT` limit is applied.
- Re-finalising edited prompt text replaces any previous trusted tail and re-appends current validated controls.
- Initial website data is not scanned for/removing the trusted marker, so marker-like literal website text remains data rather than causing data loss.
- Reviewed configurations advance lifecycle from `draft` to `reviewed`; no later lifecycle state is granted.
- Pack edits synchronise only blueprint identity/knowledge and revalidate the result; control fields stay unchanged.

## Regression coverage written

- All six agent types generate role-specific reviewed configurations.
- Malicious website/review text containing `ignore previous instructions`, permission names, transfer requests and policy-override text remains inert business data.
- Editable prompt text cannot remove the trusted control tail.
- Trusted-tail regeneration does not duplicate the real control block.
- Trusted controls survive prompt-length pressure.
- Literal trusted-marker text inside website data is preserved without gaining authority.
- Accepted pack edits update business data but preserve permissions/rules/integrations/privacy/type.
- Unstructured FAQ notes are not converted into invented blueprint questions.

## Verification state

- Static source/security audit: COMPLETE. Branch diff remains limited to Step-5 configuration logic/tests/UI wording/evidence.
- Supplemental isolated generator harness: PASS; strict isolated TypeScript module check: PASS. These do not replace repository execution gates.
- Focused real-repository execution tests: PENDING — authorised Desktop Commander devices are offline and no permitted workflow dispatch path is exposed for the active estate self-hosted runner pool.
- Full repository tests: PENDING.
- Changed-file ESLint: PENDING.
- TypeScript/Next production build and 30-route static export: PENDING.
- Merge/freeze: FORBIDDEN until all pending execution gates pass.

## Non-scope

- No phone number provisioning.
- No telephony/provider/carrier configuration.
- No live MaintenanceOS voice changes.
- No calendar/email/CRM/SMS connector activation.
- No sandbox-live promotion.
- No Step 6 work.
