# S11 — Security: Subprocessors Page

## Plan

- Create `/subprocessors/` page with full table (DO, Cloudflare, Twilio, Google, SendGrid)
- Update `src/app/privacy/page.tsx` — add link to /subprocessors/
- Update `src/app/security/page.tsx` — add link to /subprocessors/
- Acceptance test: `curl -f https://worksmartos.co.uk/subprocessors/` returns 200; table lists 5 subprocessors