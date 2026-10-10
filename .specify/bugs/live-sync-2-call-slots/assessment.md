# Assessment: live stale call-slot cleanup missing from main (reconciliation 2 of 4, issue #147)

Route: BUG. Live `api.py` (blob `11eaa44`) and `call_capacity.py` (blob `46d0c79`) equal commit `6ef7227` (never merged). Main still has the base `369d09d` versions, so deploying main would remove the live fix that frees an admission slot when Twilio receives stream TwiML but never opens the Media Stream (signed probes, carrier failures). Without it, such calls can permanently consume call slots. The live env already sets `VOICE_PENDING_LEASE_TIMEOUT_SECONDS`.
