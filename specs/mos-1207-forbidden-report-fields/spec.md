# mos-1207-forbidden-report-fields
FEATURE: expand FORBIDDEN_REPORT_FIELDS to reject session/csrf-shaped report keys

## What
Report builders already fail closed on a forbidden key set, but session/csrf/cookie shaped keys are not listed.

## Acceptance
- FORBIDDEN_REPORT_FIELDS includes csrf_token, cookie, session, session_id, bearer
- Existing report suites stay green
- Named lock test proves the expanded set
