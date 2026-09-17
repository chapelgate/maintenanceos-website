# Apply PR #41 / N=2 concurrency sync into chapelgate/cloud-workers

Source: chapelgate/maintenanceos-v1-pilot @ cursor/n2-live-concurrency-e283
(reconciled with main keepalive/warm + concurrency-100 capacity controls)

## Preferred path (canonical Render retarget)

If `RENDER_API_KEY` is available in the Cloud Agent:

```bash
python3 scripts/controlled_n2_deploy.py --dry-run
python3 scripts/controlled_n2_deploy.py --apply --branch cursor/n2-live-concurrency-e283
python3 scripts/n2_preflight.py
```

This targets **only** `maintenanceos-redteam-v2`, never HLO / Cheap Trips / Evidence Wallet.
It records `docs/concurrency_100_evidence/n2-rollback-point.json` before mutating.

## Legacy cloud-workers sync path

The Cursor cloud agent GitHub App installation currently includes ONLY
`chapelgate/maintenanceos-v1-pilot` (repository_selection=selected). It returns
HTTP 404 for `chapelgate/cloud-workers` and cannot clone/push that repo.

ChatGPT (with cloud-workers write access) may apply this package, then Manual Deploy.

From a checkout of chapelgate/cloud-workers on the branch Render deploys:

```bash
rsync -a jobs/maintenanceos/ /path/to/cloud-workers/jobs/maintenanceos/
```

Prefer merging file-by-file without reverting newer live phone behaviour
already present in cloud-workers for Gemini/Twilio/master-key/payment/greeting/email.

## Required overlay (do not skip)

Concurrency + live path:
- call_capacity.py (new)
- ai_session_sim.py (new)
- api.py (capacity on /health + admit_call)
- voice_bridge.py (claim_active_call_session + notifications)
- gemini_voice.py (latency / keepalive receive loop)
- call_notifications.py
- email_gateway.py
- worker.py (stale lease expiry)
- ingress_security.py / provider_webhooks.py / render_prepare.py
- .env.example (capacity + kill-switch + INTERNAL_NOTIFICATION_EMAIL)
- tests/test_concurrency_ladder.py
- tests/test_concurrency_red_team.py
- tests/test_call_notifications.py
- tests/test_gemini_latency_tuning.py
- tests/test_explicit_transfer_only.py
- tests/test_voice_bridge.py

See MANIFEST.txt for the full file list in this package.

## After apply

```bash
cd jobs/maintenanceos
python -m pytest -q
git add -A && git commit -m "Sync MaintenanceOS N=2 concurrency + live call path from PR #41"
git push
```

Then Manual Deploy `maintenanceos-redteam-v2` (auto-deploy is OFF).

Confirm `/health` includes `call_capacity.global_limit >= 2` and `realtime_voice: true`
before Andy places **exactly two** simultaneous test calls.
