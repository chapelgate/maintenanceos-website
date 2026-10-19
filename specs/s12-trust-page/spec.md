# Specification: Trust Page Hardening (S12)

## Objective
Update the /security/ page with Cyber Essentials PLANNED status and links to vulnerability disclosure and subprocessor pages.

## Acceptance Criteria
- "Cyber Essentials: PLANNED (target Q2 2027)" appears on the /security/ page
- Link to /vulnerability-disclosure/ page is present from /security/
- Link to /subprocessors/ page is present from /security/
- Acceptance test passes: `curl -s https://worksmartos.co.uk/security/ | grep -q "PLANNED"`
- No existing functionality broken

## Sources
- MASTER_PLAN.md S12 — Security: Trust Page Hardening
- RULES.md — Common rules for implementation