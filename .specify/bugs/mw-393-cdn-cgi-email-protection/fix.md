# mw-393 fix

## Change

`scripts/website-health-monitor.mjs`: after verifying an internal href is same-origin, skip it when `url.pathname.startsWith("/cdn-cgi/")`. Cloudflare's `/cdn-cgi/l/email-protection` is an external-host feature; it is not site content and should not be counted as an internal link.

## Verification

- `npm test`: 630/630 PASS
- `npm run lint`: clean (0 errors, 2 pre-existing warnings)
- `npm run typecheck`: clean
- `npm run build`: green static export
- `npm run website:monitor`: `ok: true`, 0 failures
- No frozen paths touched; `NEXT_PUBLIC_PUBLIC_LAUNCH` remains false
