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
