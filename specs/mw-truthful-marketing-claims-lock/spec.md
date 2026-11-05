# mw-truthful-marketing-claims-lock spec

## Goal
Lock truthful marketing claims coverage at 10/10: the signed claims register must be independently validated to cover all VERIFIED rows and deny live commercial claims.

## Acceptance
- Register contains V-02 through V-06, O-01 through O-07, S-01 through S-04, R-04, R-06
- Register denies commercially live / GA
- Register references product checkpoint SHA
- Safe automation model doc cross-links V-claims
- `npm test`, lint, typecheck, build pass
- Public launch remains disabled; no deploy, live nginx, production, voice, or golden-line path changes
