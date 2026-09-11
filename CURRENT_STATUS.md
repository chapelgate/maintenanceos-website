# MaintenanceOS Current Status

Date: 2026-09-12

## Authoritative source

This repository, `chapelgate/maintenanceos-v1-pilot`, is the single authoritative MaintenanceOS product repository.

The historical copy under `chapelgate/cloud-workers/jobs/maintenanceos` is a cloud-validation legacy copy only. No new MaintenanceOS product development should be made there. Shared cloud infrastructure may remain in `cloud-workers`, but product source belongs here.

## Verified canonical state

- Canonical `main` includes the Gemini Live provider, provider-aware routing/readiness, UK voice hardening and deterministic safety/lifecycle controls.
- PR #25, `Require explicit caller request for live human transfer`, passed the latest MaintenanceOS Cloud CI and Security CI and was squash-merged to `main` as commit `1f4ba147124731b46b281878d771fcd9e58ee789`.
- Gemini and the retained OpenAI fallback now use the same human-transfer policy: normal provider/stream failures do not silently dial the human transfer number; live transfer is reserved for an explicit caller transfer request/control.
- Consequential business actions remain controlled by deterministic MaintenanceOS rules, not by the model.
- The canonical deterministic suite includes local acceptance, API/security boundaries, lifecycle integrity, backup/restore, Gemini provider and explicit-transfer regression coverage.

## Cloud evidence already recovered

The prior Render validation lane proved Gemini credential availability, 255 passing tests, synthetic voice tenant readiness, Twilio webhook readiness and Render red-team success. A sanitized read-only Twilio probe confirmed the configured test number is in the account, the HTTPS POST voice webhook targets `/voice/inbound`, the transfer number is distinct, and recent provider call/transfer records exist without committing phone numbers, credentials or raw call SIDs.

## Infrastructure work attempted on 2026-09-12

- A new canonical Render web service could not be created because the Render connector cannot fetch the private canonical repository directly.
- A new Railway canonical service could not be provisioned because the current Railway plan has reached its free resource provisioning limit.
- A dedicated Render `maintenanceos-pilot-pg` database could not be provisioned because the Render Hobby workspace is at its 25-service cap.
- A GitHub Actions deployment-mirror experiment correctly failed closed because a repository-scoped Actions token cannot read the separate private canonical repository. No false mirror was accepted as canonical proof.
- No unrelated database was reused, no existing project service was deleted, no live Chapelgate number was changed, and no paid infrastructure was provisioned.

## Remaining external gates before live customer calls

1. Free or add two cloud resource slots (one canonical MaintenanceOS runtime and one isolated MaintenanceOS Postgres), or explicitly connect a separate dedicated database/runtime provider.
2. Authorise the private canonical GitHub repository to the chosen runtime provider so the deployed source is exactly this repository/commit lineage.
3. Deploy the canonical build with the existing Gemini/Twilio credentials and an isolated `DATABASE_URL`; verify health/readiness and persistence/restart behaviour.
4. Run one fresh controlled Gemini test-number call and record provider-delivered WSS/media-stream, British voice/accent, transcript/content capture, interruption/barge-in and explicit human-transfer/no-answer evidence.
5. Complete the live-call acceptance checklist; only then start a limited monitored customer pilot.

## Agent rule

All MaintenanceOS agents must begin from this repository and this status file. Do not treat chat memory, the old `cloud-workers/jobs/maintenanceos` directory, or an unverified deployment as the source of truth.
