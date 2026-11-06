# mw-401 Observability release honesty expansion

## Goal
Extend observability/release marker honesty validation to cross-validate all export JSON markers (release + status across out/ and public/) and health artifact consistency, supporting the REVIEW-rd2.md observability 8→9/10 goal.

## Acceptance
- All public/ export JSON markers have consistent schema and honesty fields
- out/ JSON markers match public/ counterparts for schema and honesty
- Health artifact cross-validates with release + status markers
- Consolidated evidence invariants: release + status + health all deny launch+GA+phone+uptime
- `npm test`, lint, typecheck, and build pass
- Public launch remains disabled and no deploy, live nginx, production, voice, or golden-line path changes
