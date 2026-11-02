# mos-1302-secret-patterns-del-c1

## Goal
secret_patterns.secret_key_known must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 reject.

## Acceptance
- secret_key_known rejects DEL and C1 in key string
- Existing C0 reject suite remains green
