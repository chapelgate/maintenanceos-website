# Agent Factory Step 7 — Sandbox Qualification

**Status:** IMPLEMENTED CANDIDATE — full repository verification required before freeze  
**Scope:** qualify the exact Step-6 reviewed AI configuration in the existing scripted sandbox and advance lifecycle from `reviewed` to `sandbox_passed` only on complete, current evidence.

## Baselines

- Parent frozen Step-6 checkpoint: `1bb9e5a9f19803a3a001b077bd50aacdcd8814dc`.
- MaintenanceOS compatibility baseline: `5eb0f92f2633e20e4d280835d3e6577e3f206c8b` (latest source on 2026-09-27 at final baseline check).
- Live phone/runtime is a separate workstream and is not modified.

## Acceptance contract

1. Step 7 may consume only a complete Step-6 customer-review record for the current configuration.
2. Qualification evidence is bound to the exact Step-6 review revision.
3. The sandbox session must contain the exact reviewed normalized knowledge pack and protected system prompt.
4. Only a configured sandbox companion can award qualification. The in-browser mock remains demo-only.
5. Qualification accepts scripted mode only; WebRTC/live/production/Twilio modes cannot pass.
6. Session and test evidence must both prove no live call and no live number.
7. The sandbox test must belong to the same session and report `scripted_demo_complete`.
8. The returned transcript must exactly match the deterministic pack-aware scripted transcript for the reviewed pack/prompt.
9. Any edit that changes the review revision invalidates prior qualification.
10. Only a complete canonical qualification record may advance `reviewed -> sandbox_passed`.
11. Qualification changes lifecycle only; permissions, rules, integrations, privacy, identity and knowledge controls are preserved.
12. Qualification evidence is browser-side audit/change evidence, not a server authentication or production-provisioning token.

## Implementation

- Added `src/lib/agent-sandbox-qualification.ts` as a pure fail-closed qualification layer.
- Reused the existing Step-6 review finaliser, existing sandbox client, existing sandbox companion contract and deterministic scripted engine.
- Added no new backend, queue, database, runner, telephony service or dependency.
- `CreateJourney` now holds the current complete review subject and qualification result.
- Changing the review revision resets qualification and remounts the sandbox panel cleanly.
- `SandboxTestCallPanel` can still run a browser mock demo, but only a configured companion result can emit qualification.
- When `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` is on, final create submission fails closed until qualification matches the current review revision and reviewed blueprint.
- Qualified submissions persist the sandbox qualification record and the `sandbox_passed` AgentBlueprint.
- When the sandbox feature flag is off, existing pre-launch Step-6 early-access behaviour is preserved.

## Regression coverage

- Exact reviewed configuration qualifies through companion evidence.
- Browser mock cannot award `sandbox_passed`.
- Stale review revision fails.
- Tampered knowledge pack or protected prompt fails.
- Wrong session ID, non-scripted mode, live-call payload and altered transcript fail.
- Forged qualification record fails.
- Successful qualification changes lifecycle only.
- Source wiring locks review invalidation, companion-only unlock, submit blocking and evidence persistence.
- Sandbox feature remains off by default.

## Non-scope

- No live phone call.
- No phone-number provisioning.
- No Twilio/carrier/provider mutation.
- No WebRTC/live media enablement.
- No calendar/email/CRM/SMS activation.
- No production database/schema change.
- No deployment or public-launch flag change.
- No Step-8 provisioning/go-live work.

## Verification state

- Focused Step-7 + adjacent TypeScript suite: **54/54 PASS** on authorised verifier `CG`.
- Changed-file ESLint: **PASS** after replacing a React effect-state reset with keyed remounting.
- TypeScript / Next.js 16.3.6 production build: **PASS**.
- Static export: **30/30 routes generated**.
- Full repository `npm test`: PENDING final freeze gate.
- Final clean-tree check: PENDING final freeze gate.
