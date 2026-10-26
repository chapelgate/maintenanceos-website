# MaintenanceOS Master Problem Log

## 2026-09-27 — Temporary voice canary cost drift
Status: RESOLVED

- Problem: DigitalOcean droplet 602509753 (`maintenanceos-local-voice-canary-temp`) remained active at $48/month after Gemini/Gacrux became the accepted voice baseline.
- Safety requirement: do not disturb the accepted MaintenanceOS telephone path.
- Accepted baseline evidence: droplet 601962983, public endpoint 165.227.227.9, Gemini/Gacrux, frozen in commit 4f5bb42cbb267ad040273932a97e9090425496de.
- Preservation: snapshot 247299118 (`maintenanceos-local-voice-canary-final-archive-20260927`) completed and is available in lon1.
- Resolution: droplet 602509753 deleted after snapshot completion.
- Verification: accepted runtime droplet 601962983 remained active after deletion.
- Result: DigitalOcean Droplet plan run-rate reduced from $164/month to $116/month.

## 2026-09-27 — Concurrent live-host restore during cleanup
Status: RESOLVED

- Problem: while the canary archive was being created, an independent restore action (3434192169) ran against live droplet 601962983.
- Safety response: canary deletion was held.
- Restore completed at 2026-09-27T15:47:44Z.
- Verification: droplet 601962983 returned to active state before canary deletion proceeded.

## 2026-09-27 — Step 9 provider boundary was implicit
Status: RESOLVED

- Problem: realtime AI selection used direct provider branching and phone-number configuration was directly Twilio-specific, increasing the risk that a future provider integration would modify shared runtime logic.
- Constraint: preserve deterministic MaintenanceOS safety, tenant isolation, signatures, test-number gates and the accepted live telephone path.
- Resolution: added immutable allowlisted realtime and phone-provider adapter contracts around the existing implementations; no provider implementation or deterministic core logic was replaced.
- Fail-closed rule: unknown realtime providers close with WebSocket policy code 1008; unknown phone providers fail before provider-side webhook mutation.
- Safe defaults remain `ENABLE_PUBLIC_PROVIDER_INGRESS=false` and `ENABLE_REALTIME_VOICE=false`.
- Focused baseline before change: 20/20 tests passed.
- Focused post-change acceptance: 29/29 tests passed.
- Production routing, phone numbers, credentials and deployment were not changed.

## 2026-09-27 — Step 9 full-suite Windows collection mismatch
Status: RESOLVED — VERIFIED ON LINUX ESTATE RUNNER

- Problem: the repository-wide pytest run cannot collect two existing concurrency tests on Windows because `concurrency_loadtest.py` imports the POSIX-only Python `resource` module.
- Evidence: `tests/test_concurrency_ladder.py` and `tests/test_concurrency_red_team.py` fail at import with `ModuleNotFoundError: No module named 'resource'` before any Step 9 test executes.
- WSL is installed only as a relay with no bash distribution; Docker Desktop Linux engine is not running.
- Response: do not weaken or skip the concurrency tests; verify the complete suite on the existing Linux estate runner lane instead.
- This is an execution-environment mismatch, not evidence of a Step 9 regression.

## 2026-09-27 — Existing TestClient deprecation warning
Status: OBSERVED — NON-BLOCKING

- Focused tests emit Starlette's existing `anyio.abc.BlockingPortal` deprecation warning.
- No dependency upgrade is being mixed into Step 9 because that would expand scope and regression risk; retain as follow-up maintenance evidence.

## 2026-09-27 — Step 9 static-quality import findings
Status: RESOLVED

- Problem: Ruff UP035 identified new `Callable`/`Awaitable` imports from `typing` instead of `collections.abc`, and I001 identified import ordering in `render_prepare.py`.
- Resolution: moved runtime ABC imports to `collections.abc` and sorted the touched import block without changing behavior.
- Verification: Ruff passes on every Step 9 Python file; focused adapter/provider/staged-route suite remains 29/29 PASS; `git diff --check` is clean.

## 2026-09-27 — Estate Linux CI runner lacks `python` alias in container-build job
Status: RECORDED — OUTSIDE STEP 9 PRODUCT CHANGE

- Evidence: verification run 36349021511 built the production image successfully and passed the non-root image contract, then the smoke script exited 127 because the runner job invoked `python` but only `python3` is present.
- Step 9 response: use `python3` only in the isolated verification-branch harness so the product image can be smoke-tested; do not mix a permanent estate CI repair into the adapter product change.

## 2026-09-27 — Estate Linux CI runner lacks Docker Compose plugin
Status: RECORDED — OUTSIDE STEP 9 PRODUCT CHANGE

- Evidence: verification run 36349021511 staging-config exited 125 because `docker compose` is unavailable on that runner.
- Step 9 response: the isolated verification branch falls back to checking the literal locked-down staging safety keys when Compose is unavailable. The staging compose file itself is unchanged by Step 9.

## 2026-09-27 — GitHub Actions Node 20 action deprecation annotation
Status: RECORDED — NON-BLOCKING FOLLOW-UP

- The estate runner reports that pinned `actions/checkout` / `actions/setup-python` actions still target Node 20 and are being forced to Node 24.
- This warning does not affect Step 9 correctness and is intentionally not combined with the provider-adapter product change.

## 2026-09-27 — Step 9 Linux whole-repository verification closure
Status: RESOLVED

- Tested product SHA: `1f372e0a705eb03f4ce8f0e43fe22ff9b8caa20b` on estate Linux CI run `36349495565`, attempt 2.
- Python 3.13 deterministic suite: 389 passed, 1 deselected, 16 pre-existing warnings.
- TLS/WSS transport probe: PASS on attempt 1.
- Python 3.12 compatibility suite: 389 passed, 1 deselected, 16 pre-existing warnings.
- Staging safety assertions: PASS; provider ingress, realtime voice, live email, live messaging and remote AI side-effect enable remain disabled.
- Production container: build PASS; non-root runtime PASS; `/health` smoke PASS; metadata generation PASS.
- Therefore the earlier Windows `resource` collection mismatch is closed by equivalent whole-repository Linux verification rather than by weakening tests.

## 2026-09-27 — Estate runner transient cancellation during Step 9 verification
Status: RESOLVED BY RETRY, NO PRODUCT CHANGE

- Run `36349495565` attempt 1 received an executor cancellation immediately after all 389 deterministic tests had passed.
- Retry attempt 2 on the exact same SHA completed the deterministic suite, TLS/WSS probe and Python 3.12 compatibility suite successfully.
- No code change was made in response to the transient cancellation.

## 2026-09-27 — GitHub artifact storage quota exhausted
Status: RECORDED — NON-BLOCKING TO STEP 9

- Container verification completed successfully through build, non-root check, `/health` smoke and metadata generation.
- The subsequent `actions/upload-artifact` step failed because GitHub reported the repository/account artifact storage quota is full and recalculates usage every 6–12 hours.
- This occurred after all product/container acceptance gates and does not alter runtime correctness. No destructive artifact deletion was performed as part of this narrow Step 9 change.


## 2026-09-30 — Live Gemini call greets then stalls silent
Status: ROOT CAUSE ISOLATED — HOTFIX VERIFIED — LIVE DEPLOY BLOCKED

- Symptom: owner placed a real call to the accepted MaintenanceOS test number; the initial Gemini/Gacrux greeting played, then the call went silent after caller speech.
- Live runtime remained healthy at `https://165-227-227-9.sslip.io/health` with HTTP 200 and realtime voice enabled.
- DigitalOcean action history shows no reboot, restore, rebuild or other host mutation on droplet `601962983` since 2026-09-27, ruling out same-day infrastructure drift.
- Accepted live baseline: commit/evidence `4f5bb42cbb267ad040273932a97e9090425496de`, host marker `ROLLBACK_PRE_PR69_AFTER_LIVE_REJECTION`, Gemini/Gacrux.
- The frozen live baseline predates commit `330d042596bcb38c870aa1e4660105c791e1f98d` (`fix(voice): recover stalled response turns`), which adds a bounded no-response watchdog after a finished caller turn. It also predates the later safer 600 ms Gemini VAD default from `d6cc4148413ce4b309081e158dd0f4e881a78a16`.
- Narrow backport created from the accepted baseline only: `51da30f` on branch `hotfix/mos-stalled-turn-20260930`, tag `maintenanceos-stalled-turn-hotfix-20260930`. Product changes are limited to `gemini_voice.py` and `tests/test_gemini_latency_tuning.py`.
- Local focused voice verification: 55 passed. Wider Windows regression: 359 passed with one unrelated Windows POSIX-permission assertion.
- Independent Linux estate verification run `36716049092`: focused voice regression PASS; full deterministic regression PASS with 373 passed, 1 deselected, 16 pre-existing warnings.
- The failed earlier Linux run `36715807296` did not exercise product tests; it stopped at a pre-existing runner-policy check. A test-only rerun isolated that infrastructure issue and proved the product patch.
- No live deployment was made during investigation.
- Safe production-write routes were exhausted: DigitalOcean connector has no remote-exec capability; the estate runner reaches the private/public SSH ports but root authentication is denied; repository/environment Action secret inventory is empty from the authorised GitHub principal.
- Do not rebuild, restore, reset credentials or replace the accepted live droplet merely to force this hotfix onto production. Preserve rollback and use an authenticated existing-host deployment lane.


### 2026-09-30 — deployment-path exhaustion verification
Status: VERIFIED HUMAN/AUTHORITY BLOCKER — PRODUCT HOTFIX REMAINS FROZEN

- Existing connected Windows device was tested read-only for an already-installed SSH deployment identity; none was available and both `cg-automation` and `root` BatchMode probes failed with exit 255.
- Existing estate-trusted runner was tested on isolated diagnostic branch `diag/mos-existing-ssh-path-20260930`.
- First diagnostic run `36745932316` exposed a test-harness defect: implicit shell `-e` aborted on the expected failed SSH probe before the result could be recorded. The diagnostic only was corrected; production and product code were untouched.
- Corrected run `36746015189` PASS: runner `chapelgate-pool-mos` had no SSH agent and no public key under the runner user's `~/.ssh`; authentication to the accepted host failed for both `cg-automation` and `root`.
- Hotfix tag `maintenanceos-stalled-turn-hotfix-20260930` was re-read and is identical to product SHA `51da30f1ab5f5060c280150d9b90869bfab9ec57`.
- The verified hotfix remains exactly one commit ahead of the accepted live baseline and touches only the stalled-turn implementation plus its regression tests.
- No destructive recovery, password reset, rebuild, restore, replacement droplet, provider reroute or credential exposure was attempted.
- Next executable action remains restoring an approved existing-host deployment identity. After that, deploy only the frozen tag, restart the service, verify health, then reproduce the original caller turn on a controlled real PSTN call before closing this problem.


## 2026-09-30 — MaintenanceOS post-call email quality and caller ANI
Status: RESOLVED — VERIFIED AGAINST CURRENT MAIN; GOLDEN VOICE PATH UNTOUCHED

- Symptom: internal MaintenanceOS/SOS emails were technically delivered but were poor operational reports: repeated fields, transcript-heavy content, and no clear originating caller number.
- Root cause: post-call formatting relied too heavily on transcript parsing and the downstream Twilio lookup retrieved only the Chapelgate destination number.
- Fix: post-call metadata now retrieves both Twilio caller ANI and the Chapelgate number dialled from the persisted CallSid after the call. The realtime voice/webhook/media path is unchanged.
- Email field provenance is explicit: Caller Number = network ANI; Contact Number = spoken callback; Number Called = Chapelgate line.
- Missing, invalid or withheld ANI fails closed. Withheld ANI is never suggested as a callback route.
- UK +44/local 0 forms are canonicalised before callback comparison.
- Repair parsing now handles common caller wording including `locks broken` and `key won't fit the lock` before assistant fallback.
- Job-card output no longer duplicates the same name/address/gate fields. The raw transcript remains only as audit evidence with a recognition-error warning.
- Immutable verified product blobs: `call_notifications.py=1fdb6238852836f7cf3b02959c343b2a1e5ebaac`; `tests/test_call_notifications.py=589ba3308b822722c936e614f2ad97878f93c9ba`.
- Original isolated verification run `36760682433` passed focused post-call/email/voice tests, full Python 3.13 regression, TLS/WSS route regression, and full Python 3.12 regression.
- Current-main reconciliation run `36762089062` passed the same focused, full Python 3.13, TLS/WSS and Python 3.12 gates before promotion.
- Reconciliation proof: current main had no changes to the email product files since their common ancestor, so only the verified email implementation/tests were replayed; unrelated newer main commits were preserved.


## 2026-09-30 — Main CI blocked by estate-recovery runner policy
Status: RESOLVED — POLICY CHECK VERIFIED

- Post-merge MaintenanceOS Cloud CI run `36762801791` stopped before product tests because `.github/workflows/estate-mos-live-auth.yml` selected `estate-recovery` but omitted the repository-required `estate-trusted` self-hosted runner label.
- This failure predated and was unrelated to the post-call email product change.
- Surgical fix: preserved the existing `estate-recovery` selector and added `estate-trusted`; no workflow steps, secrets, permissions, triggers, product code, deployment targets or phone routing changed.
- Local repository policy validation: `python scripts/gha-runner-policy-check.py .` PASS; 7 workflows scanned; hosted compute target remains £0.


### 2026-09-30 — post-call commissioning path exhaustion
Status: CODE COMPLETE / LIVE COMMISSIONING BLOCKED BY EXISTING ACCESS PATH

- Canonical `main` commit `5aece8505e9d3019ee4e3e0f7f146c11c3953137` passed MaintenanceOS Cloud CI run `36763122681` end-to-end: runner policy, secret scan, dependency checks, compile, deterministic Python 3.13 suite, TLS/WSS probe, and Python 3.12 compatibility all PASS.
- Public live health at `https://165-227-227-9.sslip.io/health` remained HTTP healthy with `realtime_voice=true`, `active_calls=0`, and `main_number_changed=false`.
- DigitalOcean inventory confirms the prior MOS production droplet ID `602169737` no longer exists. The only MaintenanceOS droplet currently present is `601962983 maintenanceos-production-voice-rollback` at `165.227.227.9`.
- Existing laptop MaintenanceOS SSH key: `165.232.47.24` timed out; `165.227.227.9` rejected authentication. No mutation occurred.
- USH production health is OK at `138.68.183.183`; DigitalOcean adapter `DO_USH_DEPLOY` is registered and kill switch is false.
- Local and trusted-estate-runner read-only USH checks both report `USH_DURABLE_IDENTITY_REQUIRED`; no durable MaintenanceOS workload identity is present.
- Estate runner diagnostic run `36763673477` confirms `durable_workload_identity_present=false`, `ready_for_do_provision=false`, and broker return code 4.
- Canonical USH machine-access registry contains verified targets for HLO, Cheap Trips, and USH itself only. MaintenanceOS is not yet a verified target for `cg-automation-live-lease`.
- Safe autonomous routes are exhausted. Do not create a replacement SSH identity, reset root credentials, rebuild/restore the live droplet, expose a DigitalOcean token, or reroute the golden phone line merely to deploy this formatter-only change.


## 2026-09-30 — Post-call email expert pass 2
Status: RESOLVED — VERIFIED AND FROZEN; GOLDEN VOICE PATH UNTOUCHED

- Expert lenses applied: telephony metadata/provenance, backend data integrity, operations readability, privacy/security, and adversarial QA.
- Residual defect after pass 1: assistant wording could still influence category/section detection because classification and key/repair topic checks searched the full transcript.
- Fix: classification and report-section detection now use caller-originated evidence only. Assistant prompts/instructions no longer create repair/key/master-key facts.
- Bounded exceptions preserve useful context without reopening broad trust: a caller reply to a specific key-order prompt can establish key-order intent; a comprehensive structured read-back can supply a fault only when explicitly confirmed or left unchallenged. Personal identity/contact fields still require the higher confirmation standard.
- Repair faults become the primary operational category when a vetted fault exists; secondary key/master-key enquiries remain separate sections.
- Specific physical faults such as `lock is missing` outrank generic vandalism context. A detailed structured fault can replace a generic vandalism note but cannot override a specific caller-reported physical fault.
- Caller-number wording now states `network caller ID; not identity-verified`.
- Added deterministic manual-review gate: missing spoken callback, conflicting network/spoken numbers, call-review classification, or incomplete repair fields require manual review.
- Added adversarial tests proving assistant-only words cannot classify a call, unconfirmed assistant faults are not promoted, assistant key scripts do not create key sections, and phone-number conflicts/missing callbacks trigger review.
- Focused local regression: 80 passed.
- Independent estate-runner verification run `36778405541`, attempt 2, on product SHA `8c7ab6eb831d16e6d26fdf0de8dfd58ca7289353`: focused post-call/email/voice PASS; full Python 3.13 deterministic regression PASS (407 passed, 1 deselected); TLS/WSS route PASS; Python 3.12 compatibility PASS.
- Attempt 1 on the same SHA passed focused, full Python 3.13 and TLS/WSS, then the self-hosted runner received a shutdown signal while unpacking the Python 3.12 cache. No product test failed; the exact-SHA rerun passed.
- Immutable tag: `maintenanceos-post-call-email-expert2-20260930-8c7ab6e`.


## 2026-10-06 — CG-000082 post-call email regression, stale worker mirror and job-card redesign
Status: CODE VERIFIED — CANONICAL MERGE/CI PENDING; LIVE TEST DEPLOYMENT ACCESS RECHECKED

- Real failure: CG-000082 contained caller evidence for gate 1079, Warwick Road, a keeper that would not engage, and gates still open, but the received email failed to promote those facts and used an old transcript-heavy layout.
- Deployment/version finding: the canonical root email implementation was materially newer than the live-looking output, while `cloud-workers-sync/jobs/maintenanceos/call_notifications.py` and `email_gateway.py` were stale copies. This created a repeatable route for old email behaviour to be reintroduced even after the canonical source had been fixed.
- Fix boundary: post-call email/reporting only. No Twilio routing, realtime voice, voice model, greeting, barge-in, transfer, provider voice code or golden-line file is changed.
- Extraction fix: bounded noisy-STT recovery recognises gate-number anchors such as the observed `geht's Nummer 1079`; street-only alley locations such as `Warwick Road`; keeper engagement faults; and an explicit current-state `Gate remains open` condition. Arbitrary standalone numbers are not promoted.
- Data-integrity fix: postcode is now part of the repair completeness/review gate. Missing name, spoken callback, postcode or area remains missing and is surfaced under Needs Confirmation rather than fabricated.
- Email UX fix: scan-first subject/status, job summary, caller details, confirmation/data-quality block, provider metadata and transcript-at-bottom audit section. HTML remains escaped and has a plain-text equivalent.
- External benchmark recorded in `docs/POST_CALL_EMAIL_QUALITY_20261006.md`: PagerDuty, ServiceNow, Zendesk and Intercom notification patterns were compared and reduced to the smallest compatible operational design.
- Drift fix: canonical email code/tests are mirrored into `cloud-workers-sync`; `tests/test_post_call_email_sync.py` now fails if those email mirrors diverge again.
- Exact CG-000082 regression fixture proves gate 1079, Warwick Road, keeper fault and open-gate state while refusing to invent name, spoken callback, postcode or area.
- Focused canonical verification: 44 passed. Mirrored worker verification: 42 passed.
- Broad Windows verification: 500 passed; the only runnable failure is the existing Unix-mode `0600` assertion on Windows. Two additional concurrency modules cannot collect on Windows because Python's POSIX `resource` module is unavailable. These are platform constraints, not email failures; Linux CI remains the final whole-repository gate.
- Diff audit: only post-call email code, email worker mirrors, tests, sync manifest and benchmark/problem documentation changed. No voice file is present in the change set.
- Current authorised deployment-path recheck: direct existing-host SSH remains unavailable; repository Actions secrets/variables are empty; the read-only USH broker reports `USH_NETWORK`, `durable_workload_identity_present=false`, and `ready_for_do_provision=false`. No credential reset, rebuild, restore, duplicate host or phone reroute was attempted.

### 2026-10-06 — local verification worktree volatility
Status: RESOLVED BY PERSISTENCE STRATEGY CHANGE

- A disposable local Git checkout unexpectedly returned to a clean state without a Git reflog reset and removed untracked patch helpers.
- No product commit was lost because the accepted edits had not yet been promoted.
- Mitigation: all accepted release slices are now committed directly to the isolated GitHub branch `fix/post-call-email-quality-20261006-v2`; local machines are used only for disposable verification clones.


### 2026-10-06 — adversarial short-number false positive
Status: RESOLVED BEFORE LIVE TEST

- Adversarial verification against canonical main proved that generic phrases such as `order number 1234` and `invoice number 1079` could be promoted to gate numbers by the newly broadened recovery path.
- This was treated as a real correctness defect, not accepted as a trade-off for higher extraction recall.
- Fix: generic `number N` extraction now requires explicit gate/correction context from the caller or the immediately preceding assistant prompt. The special phonetic gate anchor needed by CG-000082 (`geht's Nummer 1079`) remains supported.
- Regression tests prove order, invoice and reference numbers do not populate `gate_number`, while `Assistant: What is the gate number? / Caller: number 625` still does.
- Focused canonical verification after the repair: 46 passed. Worker-mirror verification: 44 passed.


## 2026-10-06 — Commercial-release continuation reconciliation
Status: MACHINE WORK RECONCILED TO CURRENT SAFE BOUNDARY — EXTERNAL/HUMAN RELEASE GATES REMAIN

- Canonical email/reporting repair for CG-000082 is merged. The follow-up Chapelgate governance defect was repaired by PR #136; Estate Gate run `37497507725` passed and the evidence-only fix merged as `4adf550dd7f1ef7cc684aac0e6150397e3b4350e`.
- The email repair remains source/CI evidence only until it is deployed through the already-approved MaintenanceOS existing-host path and proved by one controlled test-number call. No golden-line routing or voice runtime was changed.
- CR-13A lifecycle runtime and CR-13C Awaab runtime are already present on canonical `main`. Their old worker branches are stale/diverged history and must not be re-run or wholesale-merged.
- CR-13B managed identity remains blocked on real provider configuration. `docs/commercial_release/MANAGED_IDP_DECISION.md` selects Auth0 Essentials, but no real Chapelgate Auth0 tenant/application/API values are proven in source.
- The stale branch `worker/cr13b-auth0-staging-20261006` is not release-ready: review found that required MFA/assurance is collected but not enforced by its adapter path, and it fabricates a local session identifier when a real revocation-correlatable identifier is absent. It is also behind current `main`. Do not merge it wholesale.
- Current DigitalOcean inventory confirms live MaintenanceOS droplet `601962983` is active and has preserved rollback snapshots, but the droplet currently reports no scheduled backup IDs/window. This does not prove managed-database backup/PITR. The existing `docs/commercial_release/ROLLBACK_RECOVERY_PROOF_PLAN.md` explicitly remains a plan: a production-like managed PostgreSQL restore/PITR/migration rollback drill with measured evidence is still required before commercial release.
- No new service, queue, database, router, worker type, control plane, production host, or phone route was created during this reconciliation.


## 2026-10-26 — Lifecycle sweep main CI request-status regression
Status: OPEN — ENGINEERING (NOT HUMAN_BLOCKED); production impact NOT ESTABLISHED

- Reproduced evidence: MaintenanceOS Cloud CI push run [40378898676](https://github.com/chapelgate/maintenanceos-v1-pilot/actions/runs/40378898676), primary-test job 121769519058, on main commit `03bd2700e6a5200ec4a75f3a9efb90aafa3b4e08` (merged PR #313), failed 26 Oct at 18:36 UTC. Deterministic suite: 237 passed, 1 failed, 1 deselected, then stopped; deployment/container-build steps skipped.
- Exact failure: `tests/test_execute_request_pending.py::test_execute_rejects_completed_request` expects `lifecycle_request_not_pending`, but `execute_lifecycle_sweep` raises `lifecycle_job_not_running` first. Existing pending-request test fixtures use `MagicMock` jobs without explicit `status="RUNNING"`; runtime now validates job status first. This is an observed CI/test-fixture incompatibility; it is not proof the new fail-closed job-status guard is wrong or that production is affected.
- Smallest safe owner action: within the one canonical `AUTONOMOUS_WORK_SLICES.md` authority, reconcile the already-owned lifecycle work and update only the affected test fixtures to provide a valid RUNNING job where testing later request-status behaviour. Keep the runtime guard fail-closed; independently rerun the exact failing test, the neighbouring lifecycle tests, and then the existing deterministic CI/compatibility gate before PASS. Do not bypass CI, merge overlapping readiness branches blindly, or touch the frozen phone line/voice.
- Worker-start truth: GitHub Actions primary-test was a real executing CI job with substantive pytest output, but is NOT proof that any persistent autonomous owner is ACTIVE. No new worker/service/queue was commissioned by this evidence record.
