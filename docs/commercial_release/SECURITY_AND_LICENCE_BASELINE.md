# CR-07 Security And Licence Baseline

Scope: repository evidence in this isolated worktree only. This file does not add a scanner, SBOM pipeline, production mutation, legal conclusion, or release approval.

## Executive Position

- IMPLEMENTED FACT: `.github/workflows/security-ci.yml` exists and runs on `workflow_dispatch`, `push` to `main` for security-relevant paths, and a weekly Monday cron. It installs `pip-audit` and `cyclonedx-bom`, runs `pip check`, writes `pip-audit.json`, writes `sbom-python.json`, uploads both as `maintenanceos-security-evidence-${{ github.sha }}`, and fails the job if `pip-audit` reports vulnerable dependencies.
- IMPLEMENTED FACT: `.github/dependabot.yml` enables weekly Dependabot updates for `pip` at `/` and `github-actions` at `/`.
- IMPLEMENTED FACT: every `uses:` reference found in `.github/workflows/*.yml` is pinned to a full 40-character commit SHA, including `actions/checkout`, `actions/setup-python`, `actions/upload-artifact`, and the reusable `chapelgate/agent-skills` estate gate workflow.
- IMPLEMENTED FACT: committed secret-pattern scanning is present in both `security-ci.yml` and `cloud-ci.yml`; `.gitignore` excludes `.env`, `.venv/`, evidence/output files, PEM files, and USH identity/bearer material.
- IMPLEMENTED FACT: `cloud-ci.yml` runs runner-policy checks, secret scan, dependency consistency, compile, deterministic tests, TLS/WSS route probe, Python 3.12 compatibility validation, production container build, non-root image-user assertion, health smoke, and image metadata artifact upload.
- GAP: dependency versions are not frozen in `requirements.txt`; there is no committed Python lockfile or hash-pinned install evidence in this worktree. The frozen release candidate must retain the resolved package versions and audit/SBOM outputs from that exact candidate.
- GAP: artifact retention in current workflows is short (`security-ci.yml` and most evidence workflows use 7 days; `estate-mos-live-auth.yml` uses 3 days). Commercial release evidence needs longer owner-controlled retention outside ephemeral Actions artifacts.
- UNKNOWN / VERIFY EXTERNALLY: exact third-party package licences are not proven from repository files or local installed metadata in this worktree. Root project licensing is also unresolved because no root `LICENSE`, `LICENCE`, `COPYING`, or `NOTICE` file was found.

## Security And Supply-Chain Controls

### CI Security Gate

- IMPLEMENTED FACT: `security-ci.yml` grants only `contents: read` at workflow level and runs on a labelled self-hosted trusted estate runner.
- IMPLEMENTED FACT: the vulnerability step runs `pip-audit -r requirements.txt --format json --output pip-audit.json` with `continue-on-error: true`, then the explicit `Enforce vulnerability gate` step exits non-zero when `steps.audit.outcome == 'failure'`.
- IMPLEMENTED FACT: the same job generates a CycloneDX JSON SBOM with `cyclonedx-py requirements requirements.txt --output-format JSON --output-file sbom-python.json`.
- GAP: because `requirements.txt` uses version ranges, the audit and SBOM describe the resolver outcome at run time, not a committed immutable dependency graph.
- GAP: remediation policy is not fully codified. `SECURITY_DEPLOYMENT.md` says dependency/SBOM scanning and remediation policy are required before production, but this worktree does not contain severity SLAs, deferral approval rules, reachability triage rules, or an exception register.

### Dependabot

- IMPLEMENTED FACT: `.github/dependabot.yml` schedules weekly Monday updates for both Python dependencies and GitHub Actions, with labels and open-PR limits.
- GAP: no repo evidence was found for mandatory review/merge rules, SLA treatment for security Dependabot PRs, or licence-change review before merging dependency updates.

### GitHub Actions Hardening

- IMPLEMENTED FACT: workflow `permissions:` are mostly least-privilege read-only. `cloud-ci.yml`, `security-ci.yml`, `estate-gate.yml`, live proof workflows, and provider evidence workflows use `contents: read`.
- IMPLEMENTED FACT: no `pull_request_target`, `workflow_run`, or `issue_comment` privileged external triggers were found in `.github/workflows`.
- IMPLEMENTED FACT: `.github/gha-runner-allowlist.json` records a policy requiring trusted self-hosted labels, forbidding self-hosted execution on `pull_request` and `pull_request_target`, requiring `timeout-minutes`, limiting cron use, and forbidding dangerous retry loops. `cloud-ci.yml` runs `scripts/gha-runner-policy-check.py`.
- GAP: `openai-explicit-transfer-autopatch.yml` has `permissions: contents: write` and writes/commits/pushes to a fixed branch. It is manual-only and pinned-action-based, but it remains a privileged mutation workflow that should not be treated as normal release CI evidence.
- GAP: two phone proof/preflight workflows run on `ubuntu-latest`; the allowlist target is zero GitHub-hosted compute, and `cloud-ci.yml` enforces the policy when it runs, but those workflows themselves are not release security gates.

### Secret Hygiene

- IMPLEMENTED FACT: CI secret scans reject obvious private-key, OpenAI-style key, Twilio account SID, and Twilio secret-key patterns in tracked non-example, non-Markdown files.
- IMPLEMENTED FACT: `operational_logging.py` has an allowlisted event schema and redacts authorization, body, caller, credential, email, key, number, password, phone, secret, signature, token, transcript, bearer values, OpenAI-style keys, email addresses, phone numbers, and provider IDs.
- IMPLEMENTED FACT: provider evidence workflow asserts generated Twilio evidence does not contain obvious plaintext phone numbers or Twilio SIDs before uploading.
- GAP: the CI secret scan is regex-based and explicitly excludes Markdown. It is a guardrail, not proof of full history scanning or professional secret-discovery coverage.

### Container Controls

- IMPLEMENTED FACT: `Dockerfile` uses `python:3.12-slim`, disables bytecode, disables pip version checks, installs with `--no-cache-dir`, creates a `maintenanceos` system user/group, copies application files with that ownership, sets `USER maintenanceos`, exposes `8000`, and defines a `/health` healthcheck.
- IMPLEMENTED FACT: `docker-compose.yml` runs API and worker containers with `read_only: true`, `tmpfs: /tmp`, `cap_drop: [ALL]`, `security_opt: no-new-privileges:true`, `init: true`, loopback-bound API port, and separate `backend`/`egress` networks. The database also uses `no-new-privileges:true`.
- IMPLEMENTED FACT: `cloud-ci.yml` builds the production image, asserts `Config.User` equals `maintenanceos`, smoke-tests `/health`, and uploads image inspect metadata.
- GAP: base image digest pinning, container image vulnerability scanning, signed image/provenance attestations, and immutable deployment image references are not proven in this worktree.

### Test And Runtime Security

- IMPLEMENTED FACT: `api.py` disables OpenAPI/docs routes, enforces internal bearer auth with `hmac.compare_digest`, requires a tenant boundary for the internal API, validates JSON shape and bounded fields, gates public provider ingress, verifies Twilio signatures, restricts provider callbacks to the dedicated test number, and blocks remote AI side-effect enabling unless explicitly configured.
- IMPLEMENTED FACT: `webhook_security.py` fails closed unless Twilio signature verification is enabled and credentials/signatures are present; it also checks public HTTPS origin and dedicated test-number readiness.
- IMPLEMENTED FACT: `ingress_security.py` bounds request sizes, WebSocket event sizes, public HTTP rate limits, and response security headers (`nosniff`, `DENY`, `no-referrer`, `no-store`).
- IMPLEMENTED FACT: `security.py` rejects weak/missing `APP_SECRET`, signs expiring contractor/resident links with HMAC-SHA256, verifies with constant-time comparison, and uses PBKDF2-SHA256 for local password hashes.
- IMPLEMENTED FACT: tests cover secret handling, stdlib security helpers, Twilio webhook signatures, staged voice routes, API boundary limits/security headers, tenant isolation, cross-tenant concurrency red-team cases, pilot runtime guardrails, provider webhooks, render inventory redaction, and USH identity lifecycle.
- DESIGN INTENT: `SECURITY_DEPLOYMENT.md` requires trusted TLS/WSS ingress, edge/body/rate limits, private admin/database surfaces, central redacted logs, least-privilege service identities, secret rotation, managed PostgreSQL backups/restore drills, strong staff authentication/MFA/SSO, tamper-resistant audit storage, malware scanning for future uploads, load/failover/DR tests, independent penetration testing, and professional legal/privacy/telecoms/housing review before production.
- GAP: several items in `SECURITY_DEPLOYMENT.md` remain required-before-production controls rather than implemented facts in this worktree.

## Frozen Release Candidate Evidence To Rerun And Retain

For the eventual frozen release candidate, retain evidence against the exact commit SHA, exact dependency resolution, and exact container image built from that commit:

- RERUN / RETAIN: `security-ci.yml` run log showing `pip check`, `pip-audit`, CycloneDX SBOM generation, artifact upload, and vulnerability gate result.
- RERUN / RETAIN: `pip-audit.json` from the frozen candidate. If any finding exists, retain triage with package, advisory, installed version, fix version, reachability, owner decision, target date, and explicit deferral approval.
- RERUN / RETAIN: `sbom-python.json` from the frozen candidate plus the resolver context needed to reproduce it. Because there is no lockfile, also retain the installed package/version list from the same run or add a release-candidate lock/freeze artifact.
- RERUN / RETAIN: Cloud CI run log for the exact frozen candidate showing runner policy, secret scan, dependency consistency, compile, deterministic tests, TLS/WSS probe, Python 3.12 compatibility, container build, non-root assertion, health smoke, and image metadata artifact.
- RERUN / RETAIN: `maintenanceos-image-inspect.json` or equivalent image metadata for the exact image promoted to release.
- RERUN / RETAIN: Dependabot status for Python and GitHub Actions at freeze, including open security PRs, dismissed alerts, and licence-impact review for dependency updates.
- RERUN / RETAIN: workflow pin audit for `.github/workflows/*.yml` proving every `uses:` reference remains a full commit SHA and no privileged external trigger has been introduced.
- RERUN / RETAIN: secret scan evidence against tracked source and a separate owner-controlled confirmation that no release secrets are stored in source, logs, or artifacts.
- RERUN / RETAIN: root project licence/copyright decision and third-party licence register approved by owner/counsel before commercial distribution.
- RERUN / RETAIN: evidence retention copy outside short-lived GitHub Actions artifacts, with access control, checksum, run URL, commit SHA, UTC timestamp, and approver.

## Vulnerability Remediation Policy Gaps

- GAP: no explicit severity SLA is present for critical/high/medium dependency vulnerabilities.
- GAP: no written rule defines when `pip-audit` findings may be deferred, who approves deferral, how reachability is assessed, or when deferred findings expire.
- GAP: no commercial release evidence-retention period is defined; current Actions artifact retention is not enough for launch due diligence.
- GAP: no formal policy requires licence review when Dependabot changes direct or transitive packages.
- GAP: no lockfile/hash policy exists for reproducing a frozen candidate dependency graph.

Recommended release policy evidence: adopt a short release-candidate exception register that records advisory ID, package, installed version, severity, reachability, fix/mitigation, decision, owner, expiry date, and retained audit/SBOM artifact links. Do not suppress the CI vulnerability gate without this retained owner-approved record.

## Repository Licence Status

- IMPLEMENTED FACT: no root `LICENSE`, `LICENCE`, `COPYING`, or `NOTICE` file was found in this worktree.
- UNKNOWN / VERIFY EXTERNALLY: the repository's own outbound licence and copyright ownership are not established by repository evidence.
- GAP: before commercial release, owner/counsel must decide and record whether the product is proprietary/internal, licensed to customers under contract only, open-sourced in whole or part, or subject to third-party assignment/contract restrictions. This is an unresolved owner/counsel issue, not a legal conclusion.

## Direct Dependency Licence Audit

Evidence boundary: direct dependencies are taken from `requirements.txt`. No `.venv`, `*.dist-info` metadata, package lockfile, root licence file, or local Python launcher was available in this worktree to prove exact installed package licences. Therefore every direct package licence below is marked for external verification.

| Direct dependency | Requirement in repo | Licence status | Source to verify |
| --- | --- | --- | --- |
| `cryptography` | `cryptography>=50.0.1,<51` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `cryptography` |
| `fastapi` | `fastapi>=0.115,<1` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `fastapi` |
| `uvicorn[standard]` | `uvicorn[standard]>=0.30,<1` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata, extras dependency list, and upstream repository licence for `uvicorn` plus resolved `standard` extras |
| `streamlit` | `streamlit>=1.42,<2` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `streamlit` |
| `sqlalchemy` | `sqlalchemy>=2,<3` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `SQLAlchemy` |
| `psycopg[binary]` | `psycopg[binary]>=3.2,<4` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata, binary distribution terms, and upstream repository licence for `psycopg` |
| `python-dotenv` | `python-dotenv>=1,<2` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `python-dotenv` |
| `openai` | `openai>=1.40,<3` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `openai` |
| `google-genai` | `google-genai>=1.36,<2` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `google-genai` |
| `websockets` | `websockets>=13,<16` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `websockets` |
| `httpx` | `httpx>=0.27,<1` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `httpx` |
| `twilio` | `twilio>=9,<10` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `twilio` |
| `python-multipart` | `python-multipart>=0.0.9,<1` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `python-multipart` |
| `pillow` | `pillow>=12.3,<13` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `Pillow` |
| `apscheduler` | `apscheduler>=3.10,<4` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `APScheduler` |
| `pytest` | `pytest>=9.0.3,<10` | UNKNOWN / VERIFY EXTERNALLY | PyPI package metadata and upstream repository licence for `pytest`; also decide whether test-only dependency is shipped in the commercial artifact |

## Release Baseline Decision

- IMPLEMENTED FACT: SCA, SBOM generation, Dependabot, secret-pattern scans, pinned workflow actions, a CI vulnerability gate, non-root container runtime checks, container hardening, and a substantial runtime/test security suite already exist.
- DESIGN INTENT: release documents require these controls to be rerun and evidenced before final commercial release.
- GAP: frozen-candidate reproducibility, long-term evidence retention, formal vulnerability-remediation policy, base-image/container vulnerability evidence, and licence register/legal ownership decisions remain open.
- UNKNOWN / VERIFY EXTERNALLY: exact third-party package licences, transitive licences, commercial licence obligations, and repository outbound licence/ownership status require external/source-of-truth verification before commercial release.
