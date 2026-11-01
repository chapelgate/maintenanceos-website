# mos-1255-email-lookup-bounded-format
FEATURE: EMAIL_LOOKUP_MAX acceptance uses a valid-format email at the bound

## What
resident_by_email now requires EMAIL_RE format. The max-length acceptance used a bare a*N string, so the session never opened and the bound check was false-red.

## Acceptance
- bounded valid-format email of length EMAIL_LOOKUP_MAX opens SessionLocal
- blank/overlong still reject without opening a session
