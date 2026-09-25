# Step 8 safe-automation model

Date: 2026-09-25
Owner: MOS Website Manager

## Canonical public message

**AI assists. Server rules control. Authorised people approve.**

This is the shared public explanation for the product's automation boundary. It replaces fragmented variations on the same idea across the main buyer pages.

## What AI may automate

- Collect caller and maintenance details into structured intake.
- Classify routine maintenance information in UK terminology.
- Summarise and prepare records for human-controlled follow-up.

Voice intake remains under testing. This document does not promote a public always-on phone service.

## What rules control

Deterministic server rules — not the model — own:
- safety latches;
- lifecycle transitions;
- approvals;
- escalation state;
- prohibited money actions.

## What requires people

- Critical-safety clearance requires an authorised person.
- RED cases can enter HUMAN_REVIEW / escalation queues.
- Explicit caller-request transfer keeps judgement with a person.
- The model cannot execute payment, refund, compensation, fee-waiver, or client-money actions.

## What the AI must never invent

- bookings, dispatches, engineer arrivals, refunds, or account changes;
- an override of a safety, lifecycle, approval, or money rule;
- safety assurances beyond approved guidance.

## Evidence boundary

Claims are derived from the signed `PRODUCT_CLAIMS_REGISTER.md` rows:
`V-03`, `V-04`, `O-03`, `O-04`, `O-05`, `O-06`, and `S-03`.

## Reuse decision

Repository search found the same controls already present in `TrustPillars`, the Security page, How it works, AI receptionist, homepage principles, feature inventory, and industry copy. External GitHub search did not identify a reusable diagram library that would improve the result without adding dependency/runtime surface.

The implementation therefore uses one small native React/Tailwind component and one shared config source. No diagram package, animation package, backend, service, or new infrastructure is added.
