# mos-1305-security-del-c1

## Goal
security.sign_link and security.verify_link must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 reject.

## Acceptance
- security.sign_link rejects DEL and C1 in link kind parameter
- security.verify_link rejects DEL and C1 in link kind parameter
- Existing C0 reject suite remains green
