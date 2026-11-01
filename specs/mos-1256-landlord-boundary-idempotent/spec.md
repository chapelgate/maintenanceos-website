# mos-1256-landlord-boundary-idempotent
FEATURE: open_synthetic_portfolio reuses an existing synthetic TenantBoundary

## What
Creating a new Client can collide with an orphan or preexisting TenantBoundary for the same client_id, raising UNIQUE and breaking synthetic landlord demos.

## Acceptance
- preexisting SYNTHETIC_TEST boundary is reused without IntegrityError
- non-synthetic boundary fails closed
- contractor row is added only when missing
