# Continuation Step 14 — launch-gate separation

**Date:** 2026-09-27
**Owner:** Website Manager + Legal/Security/QA gate owners
**Baseline:** Step 13 commit `d739043a09997c4d4e4b80af3fc7ae682de68e59`

## Engineering status

The website continuation engineering programme can reach an engineering release
candidate without pretending that human launch approvals have occurred.

## Human launch gates that remain intentionally open

| Gate | Required human evidence |
| --- | --- |
| Legal | Counsel clears controller identity, lawful bases, retention, processor/transfer wording, rights/contact details and final terms |
| Accessibility/browser | Manual keyboard + assistive-technology coverage and broader Safari/iOS/browser review |
| Security | Explicit acceptance of the current static-host response-header/clickjacking residual risk, or a separately reviewed hosting/edge change |
| Owner | Explicit approval before `NEXT_PUBLIC_PUBLIC_LAUNCH=true` |

These are not defects in ordinary website engineering and are not reasons to
create duplicate infrastructure or fabricate sign-off.

## Automated guard

`scripts/launch-gates.test.mjs` locks:

- public launch default = false;
- legal pages remain visibly draft;
- counsel/owner placeholders remain until real details are supplied;
- human launch checkboxes remain unchecked;
- bounded staging red-team evidence remains recorded;
- human launch gates are not mislabeled as current engineering blockers.

No legal conclusion or compliance certification is created by this step.
