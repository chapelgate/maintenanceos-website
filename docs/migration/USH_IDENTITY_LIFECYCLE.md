# MaintenanceOS → USH identity lifecycle

## Problem (fixed)

`POST /v1/principals/register` returns a bearer from `IdentityService.issue_token()` with **default TTL 3600s**. Persisting that value as `USH_WORKLOAD_TOKEN` recreates a manual blocker every hour. That pattern is **forbidden**.

## Correct architecture

| Layer | What | Lifetime | Storage |
| --- | --- | --- | --- |
| Durable trust root | Ed25519 workload keypair for `maintenanceos-v1-pilot` | Until revoked/rotated | `$MOS_SECRETS_DIR/ush-identity/private.pem` + `identity.json` |
| Ephemeral session | Short-lived USH bearer | ~3600s (USH-issued) | `bearer.cache.json` only (disposable) |
| Renewal | `POST /v1/auth/workload` with signed assertion | Automatic before expiry | No human |

```text
bootstrap (once, admin) → register principal + public key + policy
runtime → sign assertion with private key
       → exchange → short-lived bearer
       → use bearer for /v1/capabilities|credentials|operations
       → before expiry, re-exchange (no human)
revocation → USH denies exchange → MOS fails closed
```

## Code

- `ush_identity.py` — generate/load keypair, assert, exchange, ensure_access_token
- `ush_client.py` — all authenticated calls go through renewable identity
- `scripts/ush_establish_mos_identity.py` — one-time bootstrap; **never** writes permanent `USH_WORKLOAD_TOKEN`
- Tests: `tests/test_ush_identity_lifecycle.py`

## Proven by tests

1. Register’s 3600s bearer is **not** persisted as `USH_WORKLOAD_TOKEN`
2. Advancing time past bearer TTL → automatic re-exchange succeeds
3. Process restart + wiped bearer cache → durable key reloads; re-exchange succeeds
4. USH principal revocation → renewal fails closed
5. Missing durable identity → fail closed (legacy env bearer ignored)
6. `private.pem` / `identity.json` / `bearer.cache.json` are mode `0600`; identity dir `0700`
7. Parallel callers near expiry single-flight refresh (one exchange)
8. Legacy `USH_WORKLOAD_TOKEN` env cannot override durable renewable identity

## Git hygiene

`.gitignore` excludes `ush-identity/`, `*.pem`, and `USH_WORKLOAD_TOKEN` so durable keys and ephemeral bearers never enter git.
## DigitalOcean token

Still vaulted only in USH (`DO_USH_DEPLOY`). Never place in Cursor, GitHub, MOS source, or prompts.

## PR #57

Do **not** merge until this lifecycle remains green in CI and review is complete. Do **not** ask Andy for bootstrap credentials until this PR’s identity tests are accepted.
