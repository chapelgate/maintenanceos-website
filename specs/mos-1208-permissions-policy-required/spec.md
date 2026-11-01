# mos-1208-permissions-policy-required
FEATURE: tighten permissions_configured() required directive set

## What
permissions_configured() only requires camera/microphone/geolocation, while SECURITY_HEADERS already denies clipboard and unload.

## Acceptance
- required set also includes clipboard-read=(), clipboard-write=(), unload=()
- permissions_configured() still true against current SECURITY_HEADERS
- Existing mos-1126 suites stay green
