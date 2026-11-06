# mw-404 Error handling honesty expansion

## Goal
Extend error boundary/global-error honesty validation, supporting the REVIEW-rd2.md observability/error-handling honesty goal.

## Acceptance
- Error pages deny live phone/calendar/chat/booking claims
- Error pages include trust/security recovery links
- Error pages do not expose stack traces or digests
- Error pages document pre-launch synthetic nature honestly
- `npm test`, lint, typecheck, and build pass
- Public launch remains disabled and no deploy, live nginx, production, voice, or golden-line path changes