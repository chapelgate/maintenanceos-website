# Fix

Revert #333 in full. This restores onboardingScanEndpoint to /api/website/scan and restores the doesNotMatch guards on NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT. The S28 validate scanner stub will be redone separately without changing the production endpoint.
