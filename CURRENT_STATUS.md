# MaintenanceOS Current Status

Date: 2026-09-12

## Authoritative source

This repository, `chapelgate/maintenanceos-v1-pilot`, is the single authoritative MaintenanceOS product repository.

The historical copy under `chapelgate/cloud-workers/jobs/maintenanceos` is a cloud-validation legacy copy only. No new MaintenanceOS product development should be made there. Shared cloud infrastructure may remain in `cloud-workers`, but product source belongs here.

## Verified canonical state

- Canonical `main` includes the Gemini Live provider, provider-aware routing/readiness, UK voice hardening and deterministic safety/lifecycle controls.
- PR #25, `Require explicit caller request for live human transfer`, passed MaintenanceOS Cloud CI and Security CI and was merged as `1f4ba147124731b46b281878d771fcd9e58ee789`.
- Gemini and OpenAI fallback use the same explicit-request human-transfer policy.
- Consequential business actions remain controlled by deterministic MaintenanceOS rules, not by the model.

## Verified DigitalOcean deployment — 2026-09-12

- Canonical source commit `3d7e94801ac0d58b91f3b050c37ac407dbe6a2f8` was transferred to the existing `chapelgate-production-01` DigitalOcean host and built there.
- Permanent Docker Compose deployment now runs an isolated MaintenanceOS API, worker and PostgreSQL 16 database.
- API is bound to host loopback only at `127.0.0.1:18000`; it is not exposed to public customer traffic.
- `/health` returned `ok=true`, version `v1-pilot`, with realtime voice false.
- API and Postgres reported healthy. Worker reported `MaintenanceOS V1 worker running`.
- API/worker restart was performed; API returned healthy after restart and the dedicated Docker Postgres volume remained present.
- Runtime flags were directly verified with realtime voice, public provider ingress, live email, live messaging, contractor portal and remote AI side-effect enable all disabled.
- Existing Holiday Let Operator workload was left intact.
- No live call, customer traffic, live email/message or consequential AI action was enabled during deployment verification.

## Cloud evidence already recovered

Prior Render validation proved Gemini credential availability, 255 passing tests, synthetic voice tenant readiness, Twilio webhook readiness and red-team success. A sanitized provider probe confirmed the configured test number belongs to the Twilio account, routes by HTTPS POST to `/voice/inbound`, and is distinct from the human transfer destination.

## Current controlled-call gate

The DigitalOcean runtime/persistence gate is now substantially closed. The controlled Gemini call is NOT yet authorised/configured on this deployment.

A boolean-only readiness run on the DigitalOcean deployment currently reports the provider/test-number credentials and public HTTPS/WSS test configuration absent from that runtime. The legacy local test environment contains Twilio test credentials, but secrets have not been copied blindly into production. Gemini credentials were previously proven in cloud validation but are not currently present in the DigitalOcean runtime.

Before one controlled call:
1. inject the approved Gemini and dedicated Twilio test credentials into the DigitalOcean secret environment without committing or logging them;
2. establish a trusted HTTPS/WSS endpoint for the dedicated test-number route only;
3. rerun `readiness.py --profile public-test-config` and require pass with realtime still disabled;
4. enable realtime/provider ingress only for the controlled test window;
5. run the one-call script in `CONTROLLED_GEMINI_CALL_RUNBOOK.md`, capture redacted evidence, then disable realtime/provider ingress again.

## Agent rule

All MaintenanceOS agents must begin from this repository and this status file. Do not treat chat memory, the old `cloud-workers/jobs/maintenanceos` directory, or an unverified deployment as the source of truth.
