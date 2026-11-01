# mos-1233-retention-class-known
FEATURE: expose retention_class_known helper for REQUIRED_RETENTION_CLASSES

## What
Callers cannot tell whether a data_class string is a recognised commercial retention class without importing the tuple and comparing.

## Acceptance
- retention_class_known True only for REQUIRED_RETENTION_CLASSES
- False for empty/unknown/control-char values
- Named acceptance test green
