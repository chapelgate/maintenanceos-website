# mos-1027-audit-detail-max

## Goal
Fail closed when operations.audit detail exceeds 8000 characters after redaction, before AuditEvent is added.

## Acceptance
- AUDIT_DETAIL_MAX == 8000
- bounded detail still writes
- overlong detail raises ValueError and does not session.add

## Out of scope
Voice, deploy, identity.py, retention policy, commercial runtime flags.
