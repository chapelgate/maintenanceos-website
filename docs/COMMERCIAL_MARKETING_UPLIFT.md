# Commercial marketing uplift — claims-safe pass

**Date:** 2026-09-23  
**Branch:** `cursor/commercial-marketing-uplift-645c`  
**Posture:** PRE-LAUNCH. Product under construction. Marketing + onboarding UI only.

This note is the evidence pack for the commercial credibility pass on home, pricing, demo, create, contact, about, FAQ, and features. It does **not** claim live telephony, GA, or social proof.

## What changed

| Surface | Uplift | Claims posture |
|---|---|---|
| Home | Clearer H1 (UK ops + AI intake + rules). 3-step start (Website → Review pack → Early access). Honesty chips under the trust strip. Five UK playbook cards. Pillars demoted to `h3` under one `h2`. Role chips link to all eight verticals. | UNDER TEST / pre-launch. No live phone. No logos. |
| Pricing | Request-pricing card kept. Added conceptual **Designed to include** vs **Not sold as live yet**. Shared funnel strip. | No invented list prices. No live phone in a plan. |
| Demo + Create | Same primary path strip. Demo steps restyled as a numbered honesty ladder with UNDER TEST chips. | Does not assign a live number. Not a public DID. |
| Contact / About / FAQ | Contact routes Create / launch list / briefing as cards. About uses UK ops voice and names Chapelgate without invented bios. FAQ uses exclusive `<details name>`. | No SLA, no support desk, no live phone. |
| Features | Compact cards; bullets behind native “Learn more” `<details>` (searchable). Two-column on `md` when a group has two cards. | Still 5 VERIFIED + 2 UNDER TEST. |
| SEO / a11y | Home title now “UK maintenance operations — website to knowledge pack”. `#main` is `tabIndex={-1}` for the skip link. Pre-launch banner hover contrast fixed. CTA min-height 44px. | Funnel meta guard unchanged. |

**Not added:** multi-*OS live portfolio, Planned Chapelgate range strip (awaiting Local green-light), customer logos, testimonials, metrics, SOC2/ISO, live demo DID, invented £ figures.

## How to verify

1. `npm ci && npm test && npm run build` — static export must write `out/`.
2. Open `/`, `/pricing/`, `/demo/`, `/create/` on the static server (`npx serve out`).
3. Home: primary button is **Create from website**; secondary is **Request early access**. Three onboarding cards deep-link to `/create/` or `/demo/#demo`. Trust strip has no logos. Playbooks are labelled “Scenario:”, not testimonials.
4. Pricing: request-pricing card; inclusions/exclusions; no currency amounts.
5. Demo: path ladder + “What this is not”; forms do not mention a phone number to call.
6. Create: same funnel strip as demo; form still does not provision a number.
7. Keyboard: skip link reveals and moves focus into `#main`; header Escape still closes menus.
8. Claims grep: no “beats Fonio”, no “SOC 2 Type”, no “go live in 30”, no fake customer counts.

## Claims self-check

| Check | Result |
|---|---|
| Present-fact copy limited to VERIFIED register rows | Pass — new home/pricing copy uses designed-to / under testing / pre-launch |
| UNDER TEST labelled on 3-step and demo ladder | Pass — `FeatureStatusChip` |
| No commercially live / GA | Pass |
| No public always-on / live DID | Pass — demo “What this is not” + funnel strip |
| No invented £ / plan cards | Pass — tests forbid `£` on `/pricing` |
| No logos, testimonials, metrics, certs | Pass — honesty chips + forbid list |
| `/industries` still eight equal UK verticals | Pass — hub line added; role chips do not collapse the set |
| Static `output: 'export'` | Pass — unchanged |
| No new paid infra / telephony | Pass — website-only |

## Residual gaps (owner / live product)

These stay out of this PR and belong on MASTER_PROBLEMS / GENUINE_HUMAN_BLOCKERS if still open:

- Live scan on staging (`NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` + DigitalOcean droplet + static rebuild).
- Form endpoint that actually emails / queues leads (local stub still truthful).
- Controlled telephony GO — no public demo number until the register upgrades.
- Published list prices — only after real packages exist.
- Multi-*OS Planned band — Local green-light still required.
- Unearned certifications, customer proof, and analytics/consent (cookies stay DRAFT).
- Legal pages remain DRAFT FOR LEGAL REVIEW.

## Verify locally

```bash
npm ci
npm test
npm run build
npx serve out
```
