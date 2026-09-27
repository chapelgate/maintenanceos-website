# Agent Factory Step 5 — Generate AI Configuration

**Status:** VERIFIED — execution gates passed on the integrated Step-6 verification candidate
**Scope:** convert the selected Step-4 AgentBlueprint plus reviewed Step-3/4 business data into a role-specific, claims-safe AI configuration.

## Baselines

- Website source baseline: `5bdc8d01720629a06c1452469cf8b5b0e5334f2a`.
- Compatibility baseline advanced to latest MaintenanceOS source `5eb0f92f2633e20e4d280835d3e6577e3f206c8b` (2026-09-27). The delta from the prior `e68ed4d…` checkpoint is documentation-only in the product repo.
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
- Configuration generation keeps lifecycle at `draft`. Step 6 owns the only transition to `reviewed`, after complete customer-review evidence.
- Pack edits synchronise only blueprint identity/knowledge and revalidate the result; control fields stay unchanged.

## Regression coverage written

- All six agent types generate role-specific draft configurations.
- Malicious website/review text containing `ignore previous instructions`, permission names, transfer requests and policy-override text remains inert business data.
- Editable prompt text cannot remove the trusted control tail.
- Trusted-tail regeneration does not duplicate the real control block.
- Trusted controls survive prompt-length pressure.
- Literal trusted-marker text inside website data is preserved without gaining authority.
- Accepted pack edits update business data but preserve permissions/rules/integrations/privacy/type.
- Unstructured FAQ notes are not converted into invented blueprint questions.

## Verification state

- Focused AgentBlueprint/configuration/review suite: PASS on the real verifier.
- Changed-file ESLint: PASS.
- Full repository `npm test`: PASS — 241/241.
- TypeScript / Next.js 16.3.6 production build: PASS.
- Static export: PASS — 30/30 routes generated.
- Clean-tree check: PASS.
- Live phone/runtime files: untouched.
- Step 5 is verified as part of the integrated Step-6 candidate.

## Non-scope

- No phone number provisioning.
- No telephony/provider/carrier configuration.
- No live MaintenanceOS voice changes.
- No calendar/email/CRM/SMS connector activation.
- No sandbox-live promotion.
- No Step 6 work.
