# Step 4 demo reuse decision

Date: 2026-09-25
Owner: MOS Website Manager

## Search-first result

The repository was searched before implementation. Existing reusable assets already cover the demonstration need:

- ProductTour: click-to-play, captioned existing product tour.
- CustomerDashboard: labelled SAMPLE/DEMO call history, summaries, transcripts and mock booking data.
- customer-dashboard browser catalogue: fictional local data requiring no backend.
- ProductUiShell: existing illustrative work-order, human-review and rules-hold supervisor view.
- Existing /create and scripted-sandbox code remains separate and is not duplicated.

External GitHub candidates were also checked:
- nilbuild/driver.js — MIT.
- shipshapecode/shepherd — mature tour library.
- katspaugh/wavesurfer.js — BSD-3-Clause waveform/audio UI.

No external package was downloaded because each would duplicate capability already present in the estate and increase dependency/runtime surface. The Step 4 implementation therefore adds no third-party dependency and no new backend.

## Reuse architecture

Homepage See it work CTA
→ existing /demo page
→ existing ProductTour
→ existing CustomerDashboard in explicit demoMode
→ existing in-browser SAMPLE catalogue
→ existing ProductUiShell
→ existing early-access conversion form

demoMode never enables production data. It forces an empty endpoint so the existing browser SAMPLE catalogue is used, and automatically opens its first labelled fictional transcript.

## Safety boundary

The demo is not a live phone, does not use customer data, does not expose production metrics, and does not imply autonomous booking, dispatch or payment.
