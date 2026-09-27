# Agent Factory Human Blockers

Only genuine human/external blockers belong here. Engineering defects belong in `AGENT_FACTORY_PROBLEM_LOG.md`.

## Open

### Step 5/6 execution verifier unavailable — 2026-09-27

- Both authorised Desktop Commander devices are offline. Existing DigitalOcean `estate-runner` / `shared-ci` droplets are active and the estate workflow contract confirms the Linux labels `[self-hosted, linux, x64, chapelgate, estate-trusted]`.
- The current connected GitHub interface provides no permitted dispatch path for that pool. A temporary branch-only self-hosted verification workflow was attempted but rejected before repository mutation. This leaves the real-repository execution gates unavailable from the current session.
- The existing `chapelgate/cloud-workers` queue was also audited. Its approved task kinds run its own Python/control-plane checks and explicitly reject arbitrary payload execution, so it cannot truthfully validate this Next.js branch without modifying estate execution architecture.
- It does **not** block source isolation or static review. A supplemental isolated Node harness for the new generator logic passes, and strict TypeScript checking of that isolated module passes; these are supporting evidence only, not substitutes for repository gates.
- Latest product source is now `5eb0f92f2633e20e4d280835d3e6577e3f206c8b` (docs-only delta). The separate three-file website baseline reconciliation is prepared but must also pass AgentBlueprint regression before merge.
- Do not merge/freeze the baseline reconciliation, Step 5 or Step 6 until an authorised execution path is online and all gates pass.
- Do not create a new paid runner, duplicate CI stack or modify the live MaintenanceOS phone host just to bypass this blocker.

## Closed

- None for Step 5 yet.
