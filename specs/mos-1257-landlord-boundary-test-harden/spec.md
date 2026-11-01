# mos-1257-landlord-boundary-test-harden
FEATURE: harden mos-1256 reuse acceptance against polluted shared DB boundaries

## What
Reuse test crashed inserting TenantBoundary when client_id already had a row in shared sqlite.

## Acceptance
- preexisting boundary setup is get-or-create
- open_synthetic_portfolio still succeeds and keeps SYNTHETIC_TEST mode
