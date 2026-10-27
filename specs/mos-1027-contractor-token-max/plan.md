# Plan
1. Add CONTRACTOR_LINK_TOKEN_MAX=200; reject overlong in verify_link before split/HMAC.
2. Add api._require_contractor_token that raises 400 when overlong; wire all contractor portal endpoints.
3. Add focused tests.
