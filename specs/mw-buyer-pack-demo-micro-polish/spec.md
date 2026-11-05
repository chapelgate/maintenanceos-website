# mw-buyer-pack-demo-micro-polish spec

## Goal
Buyer pack / demo honesty 9/10: buyer page and demo page locked as pre-launch synthetic demos with independent test validation of honesty constraints.

## Acceptance
- Buyer page stays noindex pre-launch pack (index: false)
- Buyer page denies list price, uptime figure, live phone line
- Buyer page denies WCAG 2.2 AA verification claim
- Publisher identity honest (Chapelgate Limited, company number 12340004)
- Cross-references Andy synthetic demo doc constraints
- `npm test`, lint, typecheck, build pass
- Public launch remains disabled; no deploy, live nginx, production, voice, or golden-line path changes
