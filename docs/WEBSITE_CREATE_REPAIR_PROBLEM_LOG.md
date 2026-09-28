# Website Create Repair — Master Problem Log

Scope: MaintenanceOS website `/create` integration only. No live phone-line, Twilio, carrier, provider-number or telephony runtime changes are permitted.

## P-001 — native Step-1 submission before hydration
- State: FIX CANDIDATE.
- Evidence: frozen `e976d08` renders a normal `type="submit"` button. A pre-hydration tap can therefore invoke browser-native form navigation before React installs `preventDefault`.
- Fix: server HTML now renders the primary control as `type="button"` and disabled until `useSyncExternalStore` reports client hydration; only then may it call `requestSubmit()`.
- Acceptance: slow-JS browser tap must not navigate or reset to Step 1.

## P-002 — completed Create request rejected with HTTP 422
- State: ROOT CAUSE IDENTIFIED / receiver fix required.
- Evidence: production Railway telemetry records the customer iPhone preflight 200 followed by `POST /v1/public/website-leads` 422 at 2026-09-28T15:00:56Z. The frozen frontend sends the full reviewed blueprint, knowledge pack and system prompt in `message`; the receiver capped `message` at 3,000 characters.
- Fix: keep the existing receiver and raise only this bounded field limit to 64 KiB, with regression tests above/below the boundary.

## P-003 — frontend discarded reference and email-handoff truth
- State: FIX CANDIDATE.
- Evidence: receiver returns `reference` and `confirmation_email`, but frozen `lead-adapter.ts` retained only `mode`.
- Fix: parse the explicit receipt fields; treat known post-storage mail failures as accepted-with-warning, never as a lost request.

## P-004 — repeated taps could enter submit before React disabled the button
- State: FIX CANDIDATE.
- Fix: synchronous `submitLockedRef` plus one stable per-journey `submission_id`; backend idempotency remains the second line of defence.

## P-005 — operator website notification mailbox was stale
- State: CONFIG STAGED.
- Evidence: existing Resend test delivered the operator website notification to the old mailbox while the customer receipt path delivered successfully.
- Fix: existing Railway receiver variable `RSFM_WEBSITE_LEAD_NOTIFY_TO` staged as `andy@chapelgatehome.uk`; no new mail platform.

## Failed / unavailable approaches
- Railway AI-agent diagnostic was unavailable because its usage limit was reached; direct service config/source/log inspection supplied the required evidence instead.
- Local Desktop Commander and Opera browser connectors were offline during initial diagnosis, so the possibly uncommitted local hydration experiment has not been overwritten or assumed present.

## Candidate branch checkpoint
- Website candidate branch: `website/mobile-submit-email-20260928`.
- Frozen rollback remains `e976d086652ce5b4e8ce51cf32e535d2e450db92`; no force-update or edits were made to the frozen branch.
