# Website customer agent configuration — 2026-09-28

## Scope

Website integration only.

Add a bounded customer configuration stage after agent-role selection so the customer can configure the reviewed AgentBlueprint before the final review/pack step.

This step does **not** modify MaintenanceOS live telephony, carrier routing, provider credentials, DigitalOcean runtime, Twilio number configuration, or any live phone line.

## Customer journey

The current five-stage public path is:

**Website → Check → Choose → Configure → Review & Pack**

The Configure stage exposes:

- voice preference:
  - choose during commissioning;
  - Warm UK;
  - Clear UK;
  - Calm UK;
- supported role actions, limited to the selected role's approved maximum;
- human transfer:
  - explicit caller request, where the selected role permits transfer;
  - disabled;
- existing reviewed business information and greeting.

## Safety model

The website configuration can only narrow an existing role.

It cannot:

- add a capability that is not in the selected role template;
- enable human transfer for a role that does not allow it;
- invent a provider or carrier;
- expose or write provider credentials;
- change a Twilio webhook or telephone number;
- enable recording, transcription, or retention;
- advance lifecycle beyond the existing customer-review process.

Core information answering and message taking remain present for all six current role templates.

Appointment actions remain paired so calendar check and booking cannot be split into an unsafe partial state.

Disabling booking disables the reviewed calendar integration intent but does not mutate any live calendar connector.

## Reuse

The implementation reuses:

- existing six `AGENT_TEMPLATES`;
- existing strict `AgentBlueprintV1` validation;
- existing customer review revision/fail-closed lifecycle gate;
- existing configuration generator and protected prompt controls;
- existing early-access lead submission path.

No duplicate product catalogue or second provisioning path was added.

## Verification

Final verification on the customer-configuration candidate:

- focused customer-configuration logic: **5/5 PASS**;
- customer configuration source/claims tests: **3/3 PASS**;
- full repository regression: **290/290 PASS**;
- changed-file ESLint: **PASS**;
- Next.js 16.3.6 production build: **PASS**;
- TypeScript: **PASS**;
- static export: **30/30 routes**;
- `git diff --check`: **PASS**.

Defects found and repaired during verification:

1. two source-level claims tests did not allow JSX whitespace wrapping; assertions were corrected without changing product behaviour;
2. stale funnel-copy tests still expected the old Review/Pack labels; they were updated to Configure/Review & Pack;
3. one step-announcement regression expected `Step 4 of 5: Review`; corrected to `Configure`;
4. strict accessibility lint required explicit accessible names on the new voice/action/transfer inputs; `aria-label` values were added and lint reran clean.

## Freeze boundary

This step is complete when the exact verified tree is committed and tagged.

Deployment/public release is a separate website release action. No live phone/runtime work belongs in this step.
