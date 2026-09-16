# Apply PR #39 MaintenanceOS sync into chapelgate/cloud-workers

Source: chapelgate/maintenanceos-v1-pilot @ cursor/email-latency-live-fix-d1b9 (2f49ed9 + this sync package)

## Why
The Cursor cloud agent GitHub App installation currently includes ONLY
`chapelgate/maintenanceos-v1-pilot` (repository_selection=selected). It returns
HTTP 404 for `chapelgate/cloud-workers` and cannot clone/push that repo.

ChatGPT (with cloud-workers write access) should apply this package, then deploy.

## Apply
From a checkout of chapelgate/cloud-workers on the branch Render deploys:

```bash
rsync -a jobs/maintenanceos/ \
  # OR copy from this package:
# copy contents of this package's jobs/maintenanceos/ over cloud-workers/jobs/maintenanceos/
```

Prefer merging file-by-file for these paths without reverting newer live phone behaviour
already present in cloud-workers for Gemini/Twilio/master-key/payment/greeting.

## Required overlay files (do not skip)
- call_notifications.py (new)
- email_gateway.py
- voice_bridge.py (notification hook after persist)
- gemini_voice.py (latency VAD/resample/thinking)
- .env.example (INTERNAL_NOTIFICATION_EMAIL + GEMINI_SILENCE_DURATION_MS)
- tests/test_call_notifications.py
- tests/test_gemini_latency_tuning.py
- tests/test_explicit_transfer_only.py
- tests/test_voice_bridge.py
- scripts/send_real_smtp_test.py
- scripts/local_smtp_acceptor.py

Supporting copies included for consistency if cloud-workers copy is stale:
communications.py, idempotency.py, operational_logging.py, models.py,
tenant_security.py, channels.py

## After apply
```bash
cd jobs/maintenanceos
python -m pytest -q
git add -A && git commit -m "Sync MaintenanceOS email notifications and Gemini latency from PR #39"
git push
```

Then ChatGPT may deploy maintenanceos-redteam-v2 from this commit.
