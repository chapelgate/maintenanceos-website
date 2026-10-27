# mw-129-release-json-honesty

## Goal
Extend the build-time release.json marker so buyers and crawlers see explicit denials of public launch, commercial GA, and live phone.

## Acceptance
- scripts/write-release-marker.mjs writes public_launch, commercial_ga, and live_phone as false.
- node --test scripts/release-json-honesty.test.mjs passes.
- Existing commit/builtAt marker behaviour remains.
