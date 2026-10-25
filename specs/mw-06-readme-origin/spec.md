# mw-06-readme-origin

## Problem

README said unset NEXT_PUBLIC_SITE_URL falls back to the DigitalOcean staging host, but code falls back to https://worksmartos.co.uk.

## Cause

Documentation drift versus src/lib/site-url.ts FALLBACK_SITE_URL.

## Acceptance

- README names https://worksmartos.co.uk and FALLBACK_SITE_URL as the empty-URL fallback.
- README no longer says site-url falls back to the DigitalOcean staging host.
- src/lib/site-url.ts unchanged.
- node --test scripts/readme-origin.test.mjs exits 0.
