# CR-08 — MaintenanceOS Website Legal-Source Closure Inventory

**Status:** SOURCE INVENTORY COMPLETE — owner/counsel drafting and approval remain open  
**Website source reviewed:** `chapelgate/maintenanceos-website` @ `f5302f7e28948d292dfe1ec828761165492f077b`  
**Date:** 2026-10-05

This is an exact source-level closure inventory, not final legal drafting or legal advice. It does not remove PRE-LAUNCH status.

## Current source position

The website already does several things correctly:
- repeatedly labels MaintenanceOS **pre-launch** and not generally commercially available;
- labels legal pages **Draft** and pending legal review;
- accurately describes the AI receptionist as a preview and says AI does not hold final authority for safety/money;
- distinguishes sample/demo transcripts from live production;
- states that the current privacy page covers the marketing website and related lead forms rather than pretending to cover future product/app processing;
- documents current marketing-site providers (DigitalOcean static site, Railway/Postgres lead/control path, Resend notifications) and says no third-party analytics vendor is used.

Those controls should be preserved until the final legal/launch gate.

## Explicit unresolved placeholders

### `src/app/privacy/page.tsx`

| Source line | Placeholder | Unresolved subject |
|---:|---|---|
| 26 | `[OWNER / COUNSEL: controller identity]` | legal entity/controller identity, registered address, ICO registration if applicable |
| 56 | `[COUNSEL: map each purpose]` | lawful-basis mapping by purpose |
| 71 | `[COUNSEL]` | international-transfer mechanisms |
| 76 | `[OWNER / COUNSEL: periods]` | retention periods/criteria by category |
| 86 | `[COUNSEL: confirm wording]` | rights wording |
| 91 | `[OWNER: inbox / SLA]` | rights-request contact/process |
| 96 | `[COUNSEL: age threshold]` | age/children wording |
| 101 | `[COUNSEL]` | update/version practice |
| 106 | `[OWNER: email]` | privacy contact |

The page itself says it covers the marketing site and related lead forms and **is not a finished product privacy policy unless counsel extends that scope**. Therefore a commercial MaintenanceOS product cannot rely on this marketing-site notice as its only resident/caller/customer privacy notice.

### `src/app/cookies/page.tsx`

| Source line | Placeholder | Unresolved subject |
|---:|---|---|
| 148 | `[OWNER: list when known]` | essential-cookie inventory |
| 161 | `[OWNER: list or “none currently”]` | preference-cookie inventory/explicit none decision |
| 284 | `[COUNSEL]` | version/date practice |

The current source states no analytics or marketing cookies are configured and that first-party operational measurement is cookieless. Final wording must stay aligned with the actual deployed build; do not add a banner or cookie inventory for technologies that are not present.

### `src/app/terms/page.tsx`

| Source line | Placeholder | Unresolved subject |
|---:|---|---|
| 22 | `[OWNER / COUNSEL]` | operator/legal entity |
| 52 | `[COUNSEL]` | content/mark/branding ownership and site-use licence |
| 62 | `[COUNSEL: UK consumer/B2B fit]` | B2B/consumer scope and disclaimer structure |
| 67 | `[COUNSEL]` | liability caps/exclusions |
| 72 | `[COUNSEL: include or omit]` | optional clause decision |
| 82 | `[COUNSEL]` | terms-update/effective-date practice |
| 87 | `[COUNSEL: confirm]` | governing law/courts |
| 92 | `[OWNER: details]` | operator contact |

## Statutory company disclosure gap

`src/components/SiteFooter.tsx` currently shows:
- “MaintenanceOS by Chapelgate”;
- pre-launch wording;
- copyright;
- links.

It does **not** show, in the reviewed source:
- a company registered number;
- registered office address;
- jurisdiction of registration (England and Wales / Scotland / Northern Ireland);
- a fully verified limited-company legal name/status.

Current GOV.UK guidance says business websites of UK limited companies must show the registered number, registered office address, where the company is registered, and the fact it is a limited company.

Authoritative source:
https://www.gov.uk/running-a-limited-company/signs-stationery-and-promotional-material

**Closure action:** owner must identify the actual contracting Chapelgate entity from verified Companies House data, then counsel/owner inserts the exact statutory disclosure. Do not infer it from “by Chapelgate”.

## Privacy-notice closure gap

Current ICO guidance on the right to be informed includes, as applicable:
- organisation identity/contact details;
- purposes and lawful bases;
- legitimate interests where used;
- recipients/categories;
- third-country/international transfer details/safeguards;
- retention periods or criteria;
- individual rights and complaint route;
- source/categories where data is obtained other than directly;
- significant solely automated decision-making information where applicable.

Authoritative source:
https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/

The current privacy page already scaffolds most of these headings but leaves material fields unresolved. CR-02 and CR-03 now provide the factual provider/data-flow inputs; CR-H03 remains the counsel approval gate.

## AI / voice / transcript disclosure inventory

Source already makes clear on marketing/product pages that:
- MaintenanceOS includes an **AI receptionist** preview;
- AI does not replace authorised human/deterministic control of critical safety/money;
- browser preview is not a live commercial telephone service;
- customer/dashboard transcript examples are labelled SAMPLE/DEMO;
- `AgentReviewGate.tsx` exposes configuration for recording on/off and transcription.

Source does **not** establish one final, counsel-approved production notice explaining:
- at the beginning of a commercial telephone interaction that the caller is interacting with AI;
- whether a given production call is audio-recorded, merely transcribed, or neither;
- the purpose of transcript/recording processing;
- retention/access/deletion for production call data;
- which provider(s) receive live audio/transcript data;
- how the caller can obtain human help where the customer configuration/process offers it.

**Closure action:** final product/call notice must be generated from the actual frozen runtime configuration and CR-02/CR-03 facts. It must not state “recorded” if the runtime only persists transcript text.

## Provider/source consistency checks before final legal copy

The marketing privacy source currently names:
- DigitalOcean for static website hosting;
- Railway/Postgres for lead intake and privacy-minimised website events;
- Resend for notifications/acknowledgements/reports.

CR-02 separately records the MaintenanceOS **product** provider chain, including Gemini/OpenAI, Twilio, DigitalOcean and Resend.

Before finalisation:
1. keep marketing-site and product processing schedules distinct;
2. ensure every live website/provider statement matches deployed configuration;
3. ensure any product privacy notice lists only providers actually active in the frozen candidate;
4. ensure international-transfer wording follows the actual active providers/regions, not the superset of every provider supported in source.

## Cookie-source closure

Current source says:
- no analytics/marketing cookies;
- no third-party analytics tag;
- cookieless first-party operational measurement;
- no persistent visitor identifier;
- consent-preference storage is not currently built.

Therefore:
- do not add a consent banner solely for appearance;
- verify the deployed browser/network storage behaviour before final counsel sign-off;
- if non-essential cookies/storage are introduced later, reopen the cookie inventory/consent gate.

## Files that must be closed before website GA

- `src/app/privacy/page.tsx`
- `src/app/cookies/page.tsx`
- `src/app/terms/page.tsx`
- `src/components/SiteFooter.tsx`
- any production AI/call transparency component or page selected for the final caller/customer disclosure
- corresponding tests/snapshots once final wording is approved

## Items deliberately not changed by CR-08

- no final legal wording;
- no company details guessed;
- no retention periods invented;
- no governing-law/liability wording invented;
- no cookie banner added;
- no golden voice greeting changed;
- no PRE-LAUNCH flag removed;
- no provider/account configuration changed.

## Gate

**CR-08 PASS as a source-closure inventory.**

Actual website legal closure remains part of CR-H03/counsel approval and later release integration. The public site must remain pre-launch until those gates pass.
