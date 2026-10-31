# Plan: Form Stub CORS Hardening

## Tasks
- [x] Add ALLOWED_ORIGINS const to form-stub-server.mjs
- [x] Rewrite corsHeaders to use explicit allow-list with env override
- [x] Add email redaction in handler before appendJsonl
- [x] Add console.log redaction (masked email)
- [x] Add test: corsHeaders rejects unlisted origins
- [x] Add test: corsHeaders accepts configured allow-list origin
- [x] Add test: corsHeaders accepts localhost dev origins
- [x] Add test: appendJsonl persists redacted email
- [x] Verify npm test passes (630/0)
