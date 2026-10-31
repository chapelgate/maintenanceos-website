# Accessibility Conformance — WCAG 2.2 AA

Product: MaintenanceOS / WorkSmart OS maintenance config.
Scope: public-facing contractor portal HTML surfaces rendered by `api.py`.
Status: synthetic demo documentation; not a formal audit. Formal WCAG 2.2 AA conformance is a release gate and is not claimed here.

## Applies to

- `/contractor/decision` (GET/POST)
- `/contractor/availability` (GET/POST)
- `/contractor/complete` (GET/POST)
- All contractor portal pages served through `_portal_page`

## Conformance claims (self-assessed, synthetic only)

| WCAG 2.2 AA criterion | Status | Evidence |
|---|---|---|
| 1.4.10 Reflow | Partial | Single-column portal forms; no two-dimensional scrolling at 320px equivalent |
| 1.4.3 Contrast (Minimum) | Partial | Default browser foreground/background; no custom colour palette |
| 2.1.1 Keyboard | Partial | Native `<button>` and `<input>` controls are keyboard-operable |
| 2.4.1 Bypass Blocks | Yes | Skip-to-main link (`href="#main-content"`) on every portal page |
| 2.4.4 Link Purpose (In Context) | Yes | Button text describes the action ("Accept job", "Decline job", "Submit availability", "Submit completion") |
| 2.4.6 Headings and Labels | Yes | `<h1>` heading per page; `<label for>` associated with each `<input>`/`<textarea>` |
| 3.2.2 On Input | Yes | Form submission is explicit (button); no automatic context change |
| 4.1.2 Name, Role, Value | Yes | Native HTML controls expose name/role/value to assistive technology |

## Known gaps (not claimed)

- No formal contrast audit against 4.5:1 (normal text) / 3:1 (large text).
- No screen-reader verification.
- No focus-visible indicator customisation beyond browser defaults.
- No reduced-motion preference handling.

## Honesty

This document is for internal synthetic-demo evidence only. It is not a WCAG 2.2 AA certificate, not a sale, not live customer records, and does not set `commercial_release_ready` true.
