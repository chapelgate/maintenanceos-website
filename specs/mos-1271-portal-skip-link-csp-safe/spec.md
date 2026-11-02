# mos-1271-portal-skip-link-csp-safe
FEATURE: remove CSP-blocked inline skip-link CSS from portal

## What
CSP is default-src none with no style-src; inline style from mos-1270 cannot apply. Keep visible skip-link + main tabindex without unsafe-inline.

## Acceptance
- _portal_page has no style block
- skip-link class and main tabindex remain
- CSP lock tests stay green (no unsafe-inline)
