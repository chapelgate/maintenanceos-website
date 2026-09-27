# MaintenanceOS Gemini + Gacrux Baseline — 2026-09-27

Status: ACCEPTED BASELINE

## Runtime
- DigitalOcean droplet: maintenanceos-production-voice-rollback
- Droplet ID: 601962983
- Region: lon1
- Service: maintenanceos.service
- Service state at freeze: active
- Public base URL: https://165-227-227-9.sslip.io
- Test number: +44 29 2271 6489

## Voice configuration
- ENABLE_REALTIME_VOICE=true
- VOICE_PROVIDER=gemini
- GEMINI_LIVE_VOICE=Gacrux
- Gemini API credential: present only in runtime secret environment; not committed to GitHub

## Verification
- Signed Twilio inbound webhook: HTTP 200
- Twilio Media Stream returned: YES
- Real PSTN call on test number completed successfully and was accepted as the working baseline by the owner on 2026-09-27.

## Freeze rule
Do not change provider, voice, telephony route, or runtime behavior from this baseline without:
1. preserving rollback,
2. reproducing the proposed change on the test number,
3. real PSTN acceptance,
4. recording the new baseline only after acceptance.

## Runtime provenance
- Deployed marker on host: ROLLBACK_PRE_PR69_AFTER_LIVE_REJECTION
- Snapshot requested: maintenanceos-gemini-gacrux-baseline-20260927
- Snapshot action: 3433811127
