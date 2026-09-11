# MaintenanceOS Cloud Hardening Plan

Branch: `cloud-hardening-2026-09-11`

Goal: move validation and deployment preparation into GitHub/cloud workflows while keeping the laptop out of the critical path. No real resident/customer data, live business number, production credentials, or paid deployment is required by this plan.

## Ten work packages

1. **Cloud CI baseline** — run compile, dependency consistency, unit/integration tests, and container build in GitHub Actions.
2. **Multi-version reproducibility** — validate supported Python versions in the cloud so the host Python installation is not a dependency.
3. **Dependency/security gate** — run dependency vulnerability auditing and retain machine-readable evidence.
4. **Automated dependency maintenance** — enable Dependabot for Python and GitHub Actions.
5. **Container contract** — build the production image in GitHub and verify the non-root runtime identity.
6. **Secret isolation** — keep credentials out of source, fixtures, logs, and artifacts; use environment/secret-store injection only.
7. **Managed data boundary** — require managed PostgreSQL, provider backup/restore rehearsal, and rollback evidence before public pilot traffic.
8. **Ingress/observability boundary** — require trusted HTTPS/WSS, Twilio signature verification, request/rate limits, redacted structured logs, alerts, and rollback controls.
9. **Controlled voice pilot** — keep the dedicated synthetic number isolated; no call is authorised by deployment alone. First call remains a separate explicit owner approval.
10. **Release evidence** — use CI/PR results as the source of truth, then update pilot readiness only when evidence exists.

## Completion rules

A work package is complete only when its control is implemented and evidence is available. Documentation alone does not close an infrastructure or operational control.

### Can be completed entirely in GitHub now

- CI test/build hardening.
- Python-version cloud validation.
- Dependency audit automation.
- Dependabot configuration.
- Secret-leak guardrails for committed files.
- Cloud execution/readiness documentation.

### Requires an external cloud environment or owner-controlled credentials

- Managed PostgreSQL migration/rollback and provider restore drill.
- HTTPS/WSS ingress and provider-delivered Twilio signature proof.
- Central logging/alerting and outage notification test.
- OpenAI/Twilio provider integration proof.
- Human-transfer/no-answer test.

### Explicit approval boundary

The first controlled phone call remains blocked until the owner separately authorises the test window, observer, rollback owner, synthetic caller/property and stop conditions.
