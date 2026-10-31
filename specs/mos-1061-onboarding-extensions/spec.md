# mos-1061-onboarding-extensions

## Problem
Secret regex patterns were duplicated across secret_patterns.py, audit_text.py, http_error_text.py, and operational_logging.py. secret_patterns only held five patterns while the other modules each reimplemented dozens.

## Acceptance
- Consumers import shared redaction from secret_patterns (no local BEARER_VALUE = re.compile)
- Redaction behaviour preserved across audit/http/ops sites
- OpenAPI docs remain disabled; health has no secrets
- Product profile deny keys / titles unchanged

## Scope
secret_patterns.py expansion; thin wrappers in audit_text.py, http_error_text.py, operational_logging.py; tests. No voice/deploy.
