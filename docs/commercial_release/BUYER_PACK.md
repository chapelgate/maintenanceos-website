# Buyer Pack — WorkSmart OS / MaintenanceOS maintenance config

Status: SYNTHETIC ONLY / NOT A SALE / NOT A LIVE ONBOARDING AUTHORISATION

This pack is for Chapelgate internal tender evidence and design-partner demos. It describes the synthetic demo surface only. It does not onboard a real buyer, take live personal data, arm the golden phone line, or set `commercial_release_ready` true.

## What this pack covers

- Product presentation: `MaintenanceOS` default, `WorkSmart OS` when `PRODUCT_PROFILE=worksmartos` is set; unknown profiles fail closed (`product_profile.py`).
- Runtime guards: data lifecycle, external identity, social housing, and retention policy all return false by default (`commercial_release_controls.py`).
- Audit redaction: bearer tokens, OpenAI keys, emails, phone numbers, and provider IDs are redacted in audit detail, HTTP error detail, and structured operational log events (`secret_patterns.py`, `audit_text.py`, `http_error_text.py`, `operational_logging.py`).
- Security headers: `x-frame-options: DENY`, `referrer-policy: no-referrer`, `cache-control: no-store`, `permissions-policy`, `cross-origin-opener-policy: same-origin`, `x-content-type-options: nosniff` (`ingress_security.SECURITY_HEADERS`).
- Accessibility baseline: skip-to-main link, viewport meta, `lang="en-GB"`, landmark `<main>`, labelled form controls (`api.py`).

## What this pack is not

- Not a commercial offer, price, or contract.
- Not live customer records, production credentials, or IdP cutover.
- Not a controlled call on the golden phone line.
- Not central monitoring, managed PostgreSQL restore, or a release GO.
- Not WCAG 2.2 AA certification (see `ACCESSIBILITY_WCAG_2_2_AA.md`).

## Honesty locks

- `commercial_release_ready` remains false until Andy clears the last gates.
- England social housing stays off.
- Buyer conversations stay on Andy's calendar; this pack does not contact councils or landlords.
- No live PII is used anywhere in this pack.
