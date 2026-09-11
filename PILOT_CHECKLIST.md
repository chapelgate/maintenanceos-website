# Pilot Readiness Checklist

Unchecked items require evidence; this file does not mark them complete.

## Current Local Status

2026-09-10: Host-side local validation against the current source tree passed:
Python 3.13.15, `pytest` 243 passed / 0 failed, local-closed readiness
`ready=true`, and SQLite backup/verify/restore succeeded. Evidence is under
`evidence\local-acceptance-20260910-154827`; the active source manifest digest is
`7f03b32f0373bc246954a38c93f0e2e47b5bdb4fd5e2b30177f9f3409c8e5afd`.

2026-09-10: Added local evidence-gap tooling:
`acceptance_harness.py`, `scripts\run_mutation_evidence.py`,
`scripts\dashboard_synthetic_smoke.py`, and `run_local_evidence_gaps.ps1`.
This sandbox still cannot start `.venv\Scripts\python.exe` because it resolves
to `C:\Users\Andy\AppData\Local\Programs\Python\Python313\python.exe` and
returns `Access is denied`; rerun the evidence-gap wrapper from the host shell
that successfully ran Python 3.13.15.

2026-09-10: External preflight advanced without enabling live traffic. Test credentials validate; Twilio and OpenAI read-only authentication passed; the dedicated Twilio test number is voice-capable with all live routes blank; 84 targeted voice tests passed; and a secret-free checksum-verified cloud bundle was created under `evidence\external-preflight-20260910-1645`. No paid host was created and no call was placed.

2026-09-11/12: Cloud validation subsequently proved Gemini credential availability, synthetic voice tenant readiness and Twilio webhook readiness. A sanitized provider probe confirmed the configured test number belongs to the Twilio account, routes by HTTPS POST to `/voice/inbound`, and is distinct from the human transfer destination. Canonical PR #25 passed Cloud CI and Security CI and was merged to `main` as `1f4ba147124731b46b281878d771fcd9e58ee789`.

## Local Acceptance

- [x] Source/evidence manifest matches the final tested tree.
- [x] Full local test suite passes with exact count captured.
- [x] Scenario 1-90 harness and independent executable controls pass.
- [x] Critical-latch, false-action, tenant-filter, and approval mutations fail.
- [x] SQLite backup is created, verified, and restored to a disposable path.
- [x] Dashboard is opened against synthetic data and core supervisor actions checked.
- [x] Realtime remains disabled and no external action occurred.

## External Test Environment

- [x] Dedicated synthetic tenant and test number; live business number untouched.
- [ ] Managed database migration/rollback and provider backup/restore rehearsed.
- [ ] Private secret injection; defaults removed; rotation owner named.
- [ ] Trusted HTTPS/WSS, exact forwarded URLs, request limits, and edge rate limits.
- [ ] Dashboard/admin/database private; staff authentication and least privilege.
- [ ] Structured redacted logs, alerts, tracing, incident response, and rollback.
- [ ] Twilio HTTP/WSS signatures demonstrated from provider traffic.
- [ ] Gemini model/project access and Live session schema demonstrated on the canonical deployment.
- [ ] Staffed human transfer and no-answer fallback demonstrated on the canonical deployment.

## One Controlled Call

Use `CONTROLLED_GEMINI_CALL_RUNBOOK.md` for the exact evidence sequence.

- [ ] Separate owner approval for the call and test window.
- [ ] Synthetic caller/property only; AI side effects disabled.
- [ ] Observer, rollback owner, and evidence recorder present.
- [ ] Stop conditions reviewed; voice disable can be applied immediately.
- [ ] Connected/start/media/stop, audio both ways, transcript, identity, safety,
      interruption, output gate, disconnect persistence, and transfer observed.
- [ ] Realtime disabled after call and evidence reviewed before any retry.

## Production Blockers

- [ ] Real-data governance, retention/deletion, legal holds, and notices approved.
- [ ] SSO/MFA/session lifecycle, immutable audit, SCA/SBOM, penetration test.
- [ ] Evidence object storage, malware scanning, monitoring, load/failover tests.
- [ ] Contractor/client operations, qualifications, insurance, authorities, and
      emergency procedures independently verified.
- [ ] Professional legal, privacy, telecoms, safety, insurance, and contract review.

