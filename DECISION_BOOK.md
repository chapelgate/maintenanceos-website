# MaintenanceOS V1 Decision Book

## Authority

AI interprets language. Deterministic rules enforce safety and authority. Humans decide exceptions.

## RED
- gas escape signal
- active fire
- CO alarm
- live/sparking electrical hazard
- uncontrolled major water escape
- structural collapse
- trapped person, including a child or vulnerable person
- immediate threat or safeguarding concern

RED cases must:
- create escalation
- enter HUMAN_REVIEW
- preserve the report verbatim in the audit trail
- never be silently downgraded by an LLM

## AMBER
- unknown classification
- contractor timeout
- repeat repair
- quote above authority
- invoice anomaly
- complaint
- legal dispute
- no-show
- disputed completion

## GREEN
- acknowledge report
- request ordinary missing information
- create work order
- status updates
- reminders
- collect contractor availability
- collect completion evidence
- collect resident confirmation
- calculate SLA

## Spend
No client money movement is implemented.
Quote approval and invoice QA are decision-support gates only.

## Identity
Caller phone number is a matching clue, not identity proof.
Before disclosing property-specific information, require a second known factor.
