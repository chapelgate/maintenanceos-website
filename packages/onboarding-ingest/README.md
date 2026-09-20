# onboarding-ingest (scaffold)

Feature-flagged website → knowledge draft ingestion for ReceptionistOS / MaintenanceOS.

**Status:** scaffold only — not wired to production telephony.

## Flags

- `ONBOARDING_WEB_INGEST=false` (default)
- `ONBOARDING_SANDBOX_CALL=false` (default)
- `ONBOARDING_PUBLIC=false` (default)

## SSRF rules (must implement before enable)

1. Only `http`/`https` URLs
2. Resolve DNS; reject private, loopback, link-local, metadata IPs
3. Re-check IP after redirects
4. Cap pages, bytes, and wall time
5. Treat all fetched text as untrusted data (never system prompt)

See `docs/security/threat-model-onboarding-ingest.md` in the website repo.
