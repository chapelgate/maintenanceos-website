# MaintenanceOS website integration problem log — 2026-09-28

Scope: website integration only. Live telephony, Twilio routing, provider numbers, voice services and live call traffic are excluded.

## Active acceptance failures

1. MOBILE-NATIVE-RESET — real customer action returned /create to Step 1.
   - Evidence: frozen Step 1 rendered a native HTML form and the first pushed follow-on retained native form semantics.
   - Root-cause class: action before or around hydration could fall back to browser-native form navigation.
   - Fix under verification: Step 1 has no native form element; the action is disabled in server HTML until hydrated and Enter/click are handled only by React.
   - Rollback: e976d086652ce5b4e8ce51cf32e535d2e450db92.

2. FINAL-POST-422 — real iPhone POST to /v1/public/website-leads returned HTTP 422 at 2026-09-28T15:00:56Z.
   - Evidence: production receiver schema limited message to 3,000 characters while the reviewed create payload contains blueprint, pack, prompt and provenance and can exceed that bound.
   - Fix under verification: receiver message bound raised to 64,000 characters with a regression test for a 32,000-character create payload.

3. EMAIL-RECEIPT-SEMANTICS — prior preview success did not prove customer email delivery; email failure after durable storage could surface as a generic failure.
   - Evidence: existing receiver stores first and uses Resend; a deployed confirmation test was accepted by Resend, but the real customer 422 never reached email.
   - Fix under verification: stable submission_id, durable reference, confirmation_email accepted or failed, and persistent success screen that preserves a stored request if mail handoff fails.

4. OPERATOR-NOTIFY-DESTINATION — current website lead notifications are routed to the legacy mailbox instead of the primary business mailbox.
   - Fix pending deployment configuration: RSFM_WEBSITE_LEAD_NOTIFY_TO must be andy@chapelgatehome.uk.

## Verification gates

- Real Chromium mobile viewport with delayed JavaScript/hydration and mobile-like latency.
- Pre-hydration rapid tap: no navigation and no Step-1 reset.
- Scan delay and scan failure.
- Missing-review final Submit produces visible error.
- Final double tap produces one POST, one stored request and one email handoff in the deterministic receiver.
- Degraded email handoff leaves the request visibly received with its reference.
- Full repository tests, accessibility, lint, TypeScript, clean production build, 30-route export, browser viewport smoke and git diff check.
- Public HTTPS black-box acceptance against the production receiver before freeze.
