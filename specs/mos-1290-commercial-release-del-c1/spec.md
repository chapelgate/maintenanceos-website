# mos-1290-commercial-release-del-c1

## Goal
commercial_release_controls.retention_class_known must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 reject.

## Acceptance
- retention_class_known returns False for DEL and C1 in data_class
- Known clean class names still return True
- Existing commercial_release_controls suite remains green
