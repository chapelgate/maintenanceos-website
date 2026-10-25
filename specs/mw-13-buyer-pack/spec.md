# mw-13-buyer-pack

## Problem

A buyer opening the marketing site has no single page that states the synthetic-demo limits: no sale, no price, no live phone, no uptime figure, and no WCAG 2.2 AA claim.

## Cause

Those limits are scattered across pages and review notes.

## Acceptance

- `/buyers/` says the site is a synthetic demo and not an offer for sale.
- It says pricing publishes no list price and status shows no uptime figure.
- It refuses a live phone, a calendar connection, chat, public launch, and a WCAG 2.2 AA verification claim.
- It names Chapelgate Limited and company number 12340004.
- It is `noindex` and is not in `marketingPaths`.
- `node --test scripts/buyer-pack.test.mjs` exits 0.
