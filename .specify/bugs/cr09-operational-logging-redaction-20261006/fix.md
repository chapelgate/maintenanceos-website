# Fix

Add one isolated test module for the existing operational_logging.py behavior.

Cover:
- sensitive-key redaction;
- bearer/API-key/email/phone/provider-ID value redaction;
- safe-field allowlist;
- fail-closed disabled logging;
- event-name normalization and formatter-time scrubbing.

No production code change.