# Security And Deployment Readiness

## Locally Enforced

- Secrets are environment supplied; `.env` is not to be logged or committed.
- Internal API bearer comparison is constant-time and tenant-bound.
- Twilio HTTP and WebSocket requests fail closed when signature validation is not
  enabled or credentials/signatures are absent.
- Request bodies, identifiers, text lengths, numeric values, and JSON shapes are
  bounded and validated.
- Security response headers disable caching, MIME sniffing, framing, and referrer
  leakage on API responses.
- Signed contractor/resident links are scoped, expiring, and replay controlled.
- The database-backed AI side-effect kill switch blocks consequential model actions
  without disabling manual human operations.
- SQLite backup/restore is hash and integrity checked by `backup_restore.py`.

## Required Before Public Test Ingress

- Dedicated synthetic Twilio number only; never the live business number.
- TLS certificate trusted by Twilio and exact externally observed HTTPS/WSS URLs.
- `VERIFY_TWILIO_SIGNATURES=true` and staged proof using provider-delivered
  `X-Twilio-Signature` values, including the WebSocket handshake URL.
- Edge request/body limits and rate limits for HTTP and WebSocket connection starts.
- Firewall/ingress rules limited to required public callbacks; admin/dashboard and
  database remain private.
- Central structured logs with secret/transcript redaction, alerting, correlation
  IDs, access controls, and tested outage notifications.
- Separate least-privilege service identities and secret-store rotation procedure.

## Required Before Production

- Managed PostgreSQL migrations and rollback rehearsed against a production-like
  copy; the local narrow migration helper is not a general migration framework.
- Provider-native encrypted backups, point-in-time recovery where required, and a
  documented restore drill with measured recovery objectives.
- Dependency/SBOM scanning in CI and remediation policy. Local `pip check` proves
  dependency consistency, not absence of vulnerabilities.
- Strong staff authentication, MFA/SSO, session expiry, account lifecycle, and
  per-user API authorisation. The current internal token is a tenant service token.
- Tamper-resistant central audit storage and restricted database administration.
- Object storage, type/size validation, malware scanning, retention, and deletion
  for future evidence uploads.
- Load, multi-process concurrency, failover, and disaster-recovery tests.
- Independent penetration test and professional UK privacy, telecoms, housing,
  safety, employment, insurance, and contract review.

Documentation is not a claim of regulatory compliance or production readiness.
