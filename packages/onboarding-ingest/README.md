# onboarding-ingest (scaffold)

Feature-flagged website → knowledge draft ingestion for ReceptionistOS / MaintenanceOS.

**Status:** scaffold only — not wired to production telephony.

## Flags

- `ONBOARDING_WEB_INGEST=false` (default)
- `ONBOARDING_SANDBOX_CALL=false` (default)
- `ONBOARDING_PUBLIC=false` (default)

## SSRF helpers (`src/ssrf.ts`)

`allowPublicHttpsUrl` allows **public https only**. It blocks localhost, private/reserved IPv4 and IPv6 literals, cloud metadata hostnames, `.local`/`.internal` names, and userinfo in the URL.

`assertResolvedAddressesPublic` is the post-DNS / post-redirect check. Call it on every resolved address. Fail closed on unparseable values.

Unit tests: `src/ssrf.test.ts` (run via root `npm test`).

## SSRF rules (must implement before enable)

1. Only `https` URLs (`allowPublicHttpsUrl`)
2. Resolve DNS; reject private, loopback, link-local, metadata IPs (`assertResolvedAddressesPublic`)
3. Re-check IP after redirects
4. Cap pages, bytes, and wall time
5. Treat all fetched text as untrusted data (never system prompt)

See `docs/security/threat-model-onboarding-ingest.md` in the website repo.
