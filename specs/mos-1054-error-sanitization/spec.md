# mos-1054-error-sanitization

## Problem
Named RELEASE_PLAN acceptance for HTTP error sanitization (including JSON payload redaction and truncation) is incomplete after shared secret_patterns consolidation.

## Acceptance
Named tests covering sanitize_http_detail redaction/passthrough/truncation/provider/token types, sanitize_json_payload redaction/safe fields/truncation, and no duplicate regex constants in audit/http_error modules.

## Scope
http_error_text.sanitize_json_payload + tests. No frozen paths.
