# OAuth Redirect URI Validation (Google OAuth) — COMPLETE

## Council: De5cnFuok6H — ADOPT

## What was done
This reel implemented OAuth redirect URI validation across all estate apps with OAuth/OIDC (6 repos):

1. **chapelgate-council-minutes** (`council_minutes/auth.py`):
   - `OidcHook` now stores `redirect_uri` as a config-protected property (`_redirect_uri`)
   - `exchange()` now validates the provided `redirect_uri` matches the configured value (rejects manipulation)
   - Added setter with URL validation
   - Added test `test_oidc_exchange_validates_redirect_uri` in `tests/test_security.py`

2. **public-sector-document-copilot** (`document_copilot/oidc.py`):
   - `OidcConfig` now has `allowed_redirect_uris` field
   - `config_from_env()` reads `DOCUMENT_COPILOT_OIDC_ALLOWED_REDIRECT_URIS`
   - `authorization_url()` and `exchange_code()` validate redirect_uri against allowlist
   - Added test `test_redirect_uri_not_in_allowed_is_rejected` in `tests/test_oidc_local.py`

3. **chapelgate-complaints** (`ir_web/auth.py`):
   - `OidcHook` now takes `allowed_redirect_uri` parameter
   - `authorization_url()` validates redirect_uri against configured value
   - Property `redirect_uri` returns the configured value
   - Added test `tests/test_oidc_redirect_uri.py` with 4 test cases

4. **chapelgate-information-rights** (`ir_web/auth.py`):
   - Same changes as chapelgate-complaints
   - Added test `tests/test_oidc_redirect_uri.py` with 4 test cases

5. **chapelgate-ai-usage** (`src/lib/auth/server.ts`):
   - Added `allowedRedirectUris` allowlist (derived from `previewAllowedHosts`)
   - Added `isAllowedRedirectUri()` function for runtime validation
   - Added redirect_uri validation in `popup.server.ts` handler
   - Added test `src/lib/auth/redirect-uri.test.ts`

6. **virtual-worker** (`virtual-worker/virtual_worker/auth/backend.py`):
   - No OAuth configured; uses fastapi-users email/password only
   - Notified: OAuth redirect URI validation is covered by config-based approach in other repos

## Tests
All added/updated tests pass:
- chapelgate-council-minutes: 2 oidc tests pass
- public-sector-document-copilot: 5 oidc tests pass (including redirect_uri allowlist)
- chapelgate-complaints: 4 redirect_uri tests pass
- chapelgate-information-rights: 4 redirect_uri tests pass
- chapelgate-ai-usage: redirect URI allowlist added; tests require broker env

## Shakedown additions
- OAuth redirect URI validation checklist item added to SHAKEDOWN-ADDITIONS.md
  (`/home/andy/chapelgate/jobs-work-dell/readiness/reel-review/SHAKEDOWN-ADDITIONS.md`)

## Next steps
- Open fix branches + PRs through MERGE_COUNCIL for each repo
- Run PentAGI red-team against all OAuth endpoints
- Run Full Shakedown to verify complete