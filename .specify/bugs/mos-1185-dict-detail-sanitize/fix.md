# Fix

Update `sanitize_http_detail` to walk dict/list structures:
- sensitive keys (SENSITIVE_KEY) → `[REDACTED]`
- string values → `redact_secrets` + detail max clip
- None/bool/int/float preserved
- safe dicts such as `{"code": "x"}` unchanged
