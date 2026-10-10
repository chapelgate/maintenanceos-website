# MaintenanceOS Human Blockers

No genuine human blocker remains for the 2026-09-27 temporary voice-canary retirement.

The accepted MaintenanceOS runtime remains on DigitalOcean droplet 601962983. The temporary canary 602509753 has been archived and retired.

## 2026-09-27 — Step 9 external/phone adapters

No genuine human blocker is currently identified. Implementation and focused verification are complete in an isolated worktree; Linux whole-repository verification is being completed through existing estate infrastructure. The accepted live telephone path remains untouched.

## 2026-09-27 — Step 9 final status

No genuine human blocker remains. Whole-repository Linux verification, dual-Python regression, TLS/WSS, staging safety assertions and product-container smoke checks are complete. GitHub artifact storage quota exhaustion affects only post-test artifact upload and is not a Step 9 product blocker. The accepted live telephone path was not modified.


## 2026-09-30 — MaintenanceOS stalled-turn hotfix production access

A genuine human/authority blocker remains for deploying the verified stalled-turn hotfix to the accepted DigitalOcean runtime.

- Verified hotfix: `51da30f`, tag `maintenanceos-stalled-turn-hotfix-20260930`.
- Linux verification: GitHub Actions run `36716049092` passed focused voice regression and the full deterministic suite (373 passed, 1 deselected).
- Live host: DigitalOcean droplet `601962983` (`maintenanceos-production-voice-rollback`).
- Blocker: no authenticated non-destructive write path to that host is available to the current authorised principals. SSH is reachable but rejects the estate runner key; GitHub repo/environment deploy secrets are absent; the DigitalOcean connector cannot execute commands inside an existing droplet.
- Exact human action required: restore or provide an authorised existing-host deployment credential/path for droplet `601962983` (preferably add the estate runner's deployment public key to the live host or restore the estate's approved MOS deployment identity). Do not paste private keys, Twilio credentials, Gemini credentials, or DigitalOcean tokens into chat.
- Once that authorised path exists, deploy only tag `maintenanceos-stalled-turn-hotfix-20260930`, restart `maintenanceos.service`, verify `/health`, place one controlled PSTN call, and roll back immediately if greeting/turn recovery regresses.


### 2026-09-30 — final authorised-path exhaustion evidence

The blocker above has now been independently re-proved rather than assumed.

- Connected Desktop Commander device `CG` was checked without requesting or exposing credentials: no SSH-agent identity was available, no local public deployment key was present, and BatchMode probes to `cg-automation@165.227.227.9` and `root@165.227.227.9` both returned SSH exit 255.
- A temporary isolated GitHub diagnostic branch `diag/mos-existing-ssh-path-20260930` ran on the existing `chapelgate-pool-mos` / `estate-trusted` runner.
- Diagnostic run `36746015189` completed successfully and proved: no SSH authentication agent, no public key in the runner user's `~/.ssh`, `cg-automation` authentication = no, `root` authentication = no.
- No production mutation was attempted by the diagnostic. The accepted live droplet remains unchanged.
- The frozen product tag still resolves exactly to `51da30f1ab5f5060c280150d9b90869bfab9ec57`; comparison against accepted baseline `4f5bb42cbb267ad040273932a97e9090425496de` is exactly one commit and changes only `gemini_voice.py` plus `tests/test_gemini_latency_tuning.py`.
- Therefore no remaining safe machine-only deployment route is available through the currently authorised DigitalOcean, GitHub runner, or connected Desktop Commander paths. Rebuild/reset/credential-reset/duplicate-host workarounds remain rejected because they would increase production risk instead of repairing the missing deployment identity.


## 2026-09-30 — Post-call email production commissioning

The post-call email/report code is fully verified and safe for canonical source promotion. A separate live commissioning blocker remains: existing authenticated SSH to the accepted MaintenanceOS runtime is unavailable, and no authorised remote-exec path exposed by the connected DigitalOcean tooling can write the running host. Do not bypass access controls, rebuild the golden phone host, reset credentials, or reroute the live number merely to deploy this formatter-only change. Commission it when an already-authorised runtime deployment identity/path is restored.


## 2026-09-30 — Restore the existing MaintenanceOS deployment identity

This is the only remaining blocker for the post-call email change. Product code is merged to canonical `main` and fully green in CI; the live phone runtime has deliberately not been touched.

Required human/admin action:
1. Restore the **existing** estate machine-access path for MaintenanceOS; do not generate a new routine SSH key.
2. Enrol droplet `601962983` / `165.227.227.9` as a verified MaintenanceOS target for the canonical USH identity `cg-automation-live-lease` using the existing `cg-automation` account and the already-authorised central key.
3. Bootstrap/restore the renewable `maintenanceos-v1-pilot` USH workload identity in the authorised admin environment using `scripts/ush_establish_mos_identity.py` with the USH bootstrap credential available there. Do not put `DIGITALOCEAN_TOKEN`, SSH private keys, or bootstrap secrets into chat, source control, or Cursor.
4. Once that existing authority path is restored, deploy only canonical `main`, verify `/health`, confirm `main_number_changed=false`, and test one controlled post-call email before declaring live commissioning complete.

Evidence: laptop SSH authentication failed; trusted-runner USH diagnostic run `36763673477` reports `USH_DURABLE_IDENTITY_REQUIRED`; canonical USH machine registry currently has no MaintenanceOS target.


## 2026-10-06 — CG-000082 email release live test-number deployment

The email-only release can be merged and fully verified without touching the golden phone line. A genuine existing-host authority blocker remains for putting the new formatter onto the running MaintenanceOS test path.

Current evidence:
- existing-host BatchMode SSH authentication to droplet `601962983` is unavailable from the connected authorised desktop;
- GitHub repository Actions exposes no deployment secret or variable names;
- the current read-only USH broker reports `USH_NETWORK`, no durable MaintenanceOS workload identity, and `ready_for_do_provision=false`;
- connected DigitalOcean tooling can inspect/manage droplet lifecycle but exposes no authorised command-execution channel inside this existing host.

Exact human/admin action required after canonical CI is green:
1. Restore the **existing approved MaintenanceOS deployment identity/path** for droplet `601962983` / `165.227.227.9`; prefer restoring the canonical `cg-automation-live-lease` / USH target rather than creating an ad-hoc credential.
2. Do not paste private SSH keys, Twilio credentials, Resend credentials, USH bootstrap secrets or DigitalOcean tokens into chat.
3. Once the approved path is restored, deploy only the email/reporting files from canonical main, restart the existing service through that approved path, verify health and unchanged golden-line markers, then place the next controlled call to **+44 2922 716489**.
4. Do not change or reroute the golden production phone line as part of this release.


## 2026-10-06 — Commercial release external/human gates after machine reconciliation

### CR-13B managed identity provider configuration
Status: GENUINE ADMIN/PROVIDER BLOCKER

Auth0 is the selected managed IdP for the first design-partner release, but the actual tenant/application/API configuration is not available to the current authorised machine paths.

Exact action required:
1. Create or approve the MaintenanceOS Auth0 tenant/subscription and application/API.
2. Record only NON-SECRET configuration facts through the approved config path: Auth0 domain/issuer, API audience, application/client ID, exact namespaced tenant/organisation claim, exact namespaced role claim, exact MFA/assurance claim and values, a real token/session correlation identifier, access-token lifetime/revocation/session policy, and allowed callback/logout/origin URLs.
3. Do not place Auth0 client secrets, signing keys, management tokens, passwords or private keys in GitHub/chat.
4. After those facts exist, rebuild the adapter from current `main`, enforce MFA/tenant/role/session requirements through the existing fail-closed identity contract, run HIGH_RISK Estate Gate and Linux regression, then live-verify against the configured Auth0 tenant.

Tracked in GitHub issue #137.

### Production recovery evidence
Status: GENUINE RELEASE/INFRASTRUCTURE BLOCKER

The repository has a complete recovery test plan and local SQLite proof, but no executed production-like managed PostgreSQL backup/PITR restore drill for the release candidate.

Exact action required before commercial release:
1. Nominate/configure the approved production-like managed PostgreSQL target and backup mode.
2. Authorise the isolated synthetic-data restore/PITR/migration-rollback drill defined in `docs/commercial_release/ROLLBACK_RECOVERY_PROOF_PLAN.md`.
3. Retain measured recovery evidence and independent review.
4. Do not treat the existing live-droplet snapshots as proof of database PITR.

This blocker does not require changing or rerouting the golden phone line.

### Existing MaintenanceOS deployment identity
Status: STILL OPEN

The previously recorded existing-host authority blocker for droplet `601962983` remains authoritative. Restore the approved `cg-automation-live-lease` / USH MaintenanceOS deployment path rather than creating ad-hoc credentials or rebuilding the host.

## 2026-10-10 - Laptop SSH route to the live voice host exists; decision needed (issue #147)

- **Finding:** from laptop `CG`, the SSH alias `mos-gemini` now authenticates to droplet `601962983` (`165.227.227.9`, hostname `maintenanceos-production-voice-rollback`) as `root` in BatchMode. This contradicts the 2026-09-30 entries above, which recorded laptop SSH as failing.
- **Use so far:** read-only only. One snapshot of `/opt/maintenanceos/app` was taken (database, `__pycache__` and `.cursor` excluded) and the temporary tarball was removed from `/tmp`. Nothing on the host was changed, restarted or deployed.
- **Not the recorded approved path:** the entries above name the approved path as the `cg-automation-live-lease` / USH MaintenanceOS identity. A root key on the owner's laptop is not that path.
- **Human decision required (Andy):** decide whether laptop `CG` â†’ `mos-gemini` (root) is an approved deployment route for this host. If yes, record it here with its scope (deploy, rollback, read-only telemetry) and keep the key on CG only. If no, keep it read-only or remove it, and continue restoring the USH path.
- **Live host drift (blocks a safe deploy of `main`):** `/opt/maintenanceos/DEPLOYED_COMMIT` = `ROLLBACK_PRE_PR69_AFTER_LIVE_REJECTION`, and the app folder is not a git checkout. Compared with `main` @ `d6103f8`:
  - 16 Python files differ.
  - Live-only code exists in `voice_bridge.py` (+570/-210 lines: provider reconnect, soft recover, latency recording), `api.py` (pending voice-lease cleanup using `VOICE_PENDING_LEASE_TIMEOUT_SECONDS`, which is set in the live env), `call_capacity.py` (lease helpers) and `post_call_extractor.py` (live-only file).
  - `main`-only code includes `awaab_policy`, `awaab_runtime`, `lifecycle_runtime`, `identity_contract`, `data_lifecycle`, `commercial_release_controls` and `safety_messages`. `models.py` has 50 more lines on `main`, which is a schema difference against the live SQLite database.
  - Deploying `main` as-is would drop the live-only fixes and run new models against the live database. The live-only code in those other files must be reconciled into `main` first, one reviewed slice per file group.
- `gemini_voice.py` reconciliation (stall watchdog from `51da30f`, 600 ms silence default, live call-handling rules) is in the PR for issue #147. The live host stays unchanged until Andy approves the route and the drift is reconciled.

### 2026-10-10 (evening): Andy approved the mos-gemini laptop SSH route for voice deploys (temporary)
- Decision: Andy approved the laptop root SSH route (`ssh mos-gemini` from CG to droplet 601962983, maintenanceos-production-voice-rollback) for voice deploys **for now**. This resolves the "Andy must decide" item in the 2026-10-10 laptop-SSH entry above.
- Still to do: restore the least-privilege deploy lease route later and retire root SSH for deploys once it's back.
- Conditions on any deploy over this route: reconciliation PRs merged, Linux Cloud CI green on main, main a safe superset of live, and no DB migration needed (if one is needed, stop and report to Andy). A full backup of /opt/maintenanceos/app and /etc/maintenanceos.env, a SHA version marker, a one-command rollback, a /health check and a few minutes of log watching are all required, with immediate rollback on any problem.
- Status at time of writing: **not deployed**. Blockers:
  1. Both self-hosted Cloud CI runners (chapelgate-pool-mos, chapelgate-pool2-mos) are offline. Run 38071853570 for b3c165e has been queued since 18:28 BST.
  2. Drift is not fully reconciled. The post-call email design differs (main has the rebuilt verified-facts report, live has post_call_extractor plus the cg58 call_notifications), and a dozen other files have drifted.
  3. Main's models add three tables (awaab_cases, data_lifecycle_holds, data_lifecycle_requests). init_db() on start would create them, which is an additive migration that Andy needs to decide on. See docs/migrations/2026-10-10-live-schema-plan.md.
  4. Main's render_prepare.py configures the Twilio voice webhook on start; live's does not.
