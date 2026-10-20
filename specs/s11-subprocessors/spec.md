# S11 — Security: Subprocessors Page

## Specification

- **Goal**: Transparent list of third-party subprocessors with locations and transfer mechanisms
- **Exact Files**: 
  - `src/app/subprocessors/page.tsx` (new)
  - `src/app/privacy/page.tsx` (add link to /subprocessors/)
  - `src/app/security/page.tsx` (add link to /subprocessors/)
- **Acceptance Test**: `curl -f https://worksmartos.co.uk/subprocessors/` returns 200; table lists 5 subprocessors (DigitalOcean, Cloudflare, Twilio, Google, SendGrid)
- **Size**: S
- **Dependencies**: S0
- **Owner**: WEBSITE_REPO