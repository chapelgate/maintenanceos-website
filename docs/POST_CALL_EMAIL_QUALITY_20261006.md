# Post-call Email Quality Benchmark — 2026-10-06

## Scope lock

This release is email/reporting only.

Out of scope and forbidden for this release:
- Twilio number routing or webhooks;
- realtime voice prompts, greeting, TTS, STT provider, barge-in, turn-taking or transfer behaviour;
- the frozen golden production phone line;
- broad refactors, new services, new queues or new control planes.

The change begins only after a call has been persisted.

## Real failure case

CG-000082 exposed the current failure mode:
- raw STT distorted "gate number 1079" into a phrase resembling "geht's Nummer 1079";
- the street name Warwick Road was present but was not promoted to the structured report;
- "keeper will not go in" was not recognised as a bounded gate fault;
- "the gates are still open" was not surfaced as an operational condition;
- the deployed email looked like a machine dump and did not consistently expose provider metadata.

The fix must recover useful facts without inventing absent data.

## External benchmark

### PagerDuty

Reference: https://support.pagerduty.com/main/docs/email-notifications

PagerDuty puts incident state in the subject and exposes incident number/title, status, urgency, assignee, opened time and service near the top. Long details are bounded rather than allowed to dominate the notification.

Adopted:
- status in the subject;
- stable job identifier in the subject;
- prominent operational status banner;
- concise structured fields ahead of detail.

### ServiceNow

Reference: https://www.servicenow.com/docs/r/zurich/platform-administration/notification-examples.html

ServiceNow's high-priority incident notification example uses priority in the subject and a compact body containing short description, incident number, category, assignment and comments, and recommends preview/testing.

Adopted:
- short operational summary before comments/transcript;
- priority/condition made visually obvious;
- explicit test/preview acceptance before live use.

### Zendesk

Reference: https://support.zendesk.com/hc/en-us/articles/4408886168090-Customizing-your-email-notifications

Zendesk sends both HTML and plain-text versions and recommends previewing/testing email-template changes. Its current guidance also favours restrained HTML because email-client rendering differs.

Adopted:
- multipart HTML plus plain-text equivalent;
- inline, conservative email CSS;
- no external-image dependency;
- semantic headings and escaped user-derived content.

### Intercom

References:
- https://www.intercom.com/help/en/articles/3527623-sending-email-notifications-without-conversation-content-or-history
- https://www.intercom.com/help/en/articles/250-push-email-chat-and-post-notifications-for-customers

Intercom can reduce conversation history and prioritises current, relevant message content rather than forcing the full conversation to dominate a notification.

Adopted:
- operational job card first;
- raw transcript retained only as an audit section;
- missing/uncertain fields separated into a confirmation block.

## Chapelgate target contract

### Subject

Repair:
`[REPAIR][OPEN GATE] Gate 1079 | Warwick Road | CG-000082`

The open-gate marker appears only when caller-originated evidence explicitly says the gate remains open.

### Body order

1. Status/action
2. Job summary
3. Caller details
4. Needs confirmation / data quality
5. Key/master-key information when relevant
6. Other information
7. Provider call metadata
8. Raw transcript — audit only

### Evidence rules

- Twilio ANI, called number and CallSid are provider metadata, not speech-derived facts.
- Assistant prompts are never promoted as caller facts unless an existing bounded confirmation rule proves the read-back was accepted.
- A missing field is not rendered as a wall of "not collected" rows. It is listed once under Needs Confirmation.
- Network caller ID never masquerades as a spoken/confirmed callback.
- No name, postcode, area, address, phone number or gate number may be invented to make the email look complete.
- The raw transcript remains available for audit but is not the operational source of truth.

## Acceptance gates

A release is not accepted unless all are true:

1. CG-000082 recovers gate 1079, Warwick Road, keeper fault and the open-gate condition.
2. CG-000082 does not invent name, spoken callback, postcode or area.
3. Provider caller number, called number, CallSid and call time render when available.
4. Existing correction/read-back tests remain green.
5. HTML escapes caller-derived content.
6. Plain-text and HTML alternatives both remain available.
7. No realtime voice or golden-line file is changed.
8. The worker-sync copy of the email code matches the canonical root copy.
9. Full repository tests and cloud CI pass before live test-number deployment.
10. Live acceptance is performed on +44 2922 716489 only; the golden production phone line is not touched.
