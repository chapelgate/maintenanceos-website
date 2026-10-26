# mw-60-trust-cert-lock

## Problem
The trust page already denies ISO 27001, SOC 2, ISO 9001, PCI DSS, HIPAA, and "bank-grade"/"military-grade" claims, but nothing locks that honesty against regression.

## Acceptance
- Trust page states no ISO 27001, SOC 2, ISO 9001, PCI DSS, HIPAA, or "bank-grade"/"military-grade" claims.
- Cyber Essentials remains PLANNED (target Q2 2027) — not claimed as held.
- Security controls section links to /security/ page for architectural controls.
- No future edit may claim a certification not in the denied list.
- `node --test scripts/trust-cert-lock.test.mjs` exits 0.
