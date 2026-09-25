# Step 6 conversion funnel

Date: 2026-09-25
Owner: MOS Website Manager

## Primary conversion goal

The primary website conversion is **Create from website** at `/create/`.

That path collects a public business URL and email, lets the visitor review the draft, produces the pre-launch knowledge pack, and submits an early-access request. It does not provision a live phone number.

## Secondary conversions

Secondary paths are deliberately subordinate:

- **See it work** — evidence/demo path, not the primary commercial conversion.
- **Request early access** — short human-briefing enquiry.
- **Join launch list** — low-commitment update request.
- **Contact** — human enquiry, not a support desk.

## CTA hierarchy rule

Every important buyer page must have one visually dominant primary action. When two actions are shown together, `CtaPair` renders **Create from website** as the filled primary button and the secondary action as a text-link treatment.

Do not promote two equal primary buttons on the same decision point.

## Form rule

All public commercial enquiry forms reuse `LeadCaptureForm`. Email is the only required field. Name, organisation, role, and message are optional.

`/create/` continues to use `CreateReceptionistForm` because it has a different website→review→pack workflow, but final lead submission still uses the shared lead adapter.

## Delivery rule

A conversion is not complete merely because the browser shows success. Step 6 closes only when a real endpoint accepts the lead, the visitor gets truthful acknowledgement, and the lead reaches an existing human follow-up channel.
