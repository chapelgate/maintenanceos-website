# Next Human-Approved Inputs

Do not paste credentials, tokens, resident data, addresses, access codes, recordings,
or transcripts into chat or GitHub. Use the approved secret store and protected
evidence systems for sensitive material.

## Current checkpoint

Real calls to the receptionist line have already occurred. Therefore the project must
not reset to a pre-call checkpoint or require a fictional "first call" before
continuing.

The immediate next task is evidence reconciliation from the calls already made:

- provider call timestamps, durations, SIDs and final statuses;
- webhook/WebSocket delivery and signature-validation results;
- OpenAI Realtime connection/events/errors and latency;
- transfer attempts, answer/no-answer results and fallback behaviour;
- recordings/transcripts only where they were enabled and can be handled privately;
- observed defects mapped to acceptance criteria with pass/fail/unknown evidence.

Known user-observed live-call defects currently requiring evidence-backed correction
and retest include unacceptable voice/accent quality, US-oriented emergency wording,
and incorrect/inadequate human-transfer behaviour.

## External production-readiness evidence still required

After reconciling the calls already made, verify rather than assume:

- the actual OpenAI project/model and Realtime configuration used by the deployed line;
- the actual Twilio number/routing and staffed human-transfer destination;
- trusted HTTPS/WSS ingress and exact provider callback/stream URLs;
- managed database, private secret injection, logging/alerting and backup/restore;
- least-privilege access to dashboard/admin/database surfaces;
- deterministic UK safety escalation for gas/electrical/water/structural scenarios.

Any new live-call test that changes routing, safety behaviour, provider configuration,
or exposes a real caller remains an explicit operational action and must follow the
current authorised test process. Synthetic tests must never be reported as proof of
live carrier behaviour.
