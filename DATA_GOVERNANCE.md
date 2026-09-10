# Data Governance Requirements

This is an engineering requirements note, not legal advice or a compliance claim.

Before real people or properties are used, the operator must document and obtain
professional approval for lawful purpose, transparency, controller/processor roles,
data minimisation, access rights, retention, deletion, incident response, provider
contracts, international transfers, and any call-recording or monitoring notices.

## Data Classes

- Resident identity/contact and verification attempts.
- Property address, access and emergency notes.
- Repair descriptions, safety flags, photos/evidence, communications, and audit.
- Call metadata, transcript, model/provider identifiers, and action evidence.
- Contractor identity, qualifications, insurance, performance, quote, and invoice.
- Staff identity, role, approvals, overrides, and security events.

## Required Controls

- Collect only fields needed for the active maintenance purpose.
- Do not place access codes, unnecessary addresses, or full contact details in AI
  prompts, logs, alerts, or error messages.
- Separate tenant data in application queries, links, jobs, exports, and backups.
- Define retention per data class and legal/operational hold; implement scheduled
  deletion and independently test it before real data.
- Preserve safety and audit records when an incident/complaint hold applies; an
  ordinary deletion request must not silently destroy required evidence.
- Restrict transcript access, record views/exports, and provide a reviewed process
  for access, correction, deletion, and breach response.
- Use synthetic data until these controls and notices are approved operationally.

The current build does not yet implement a production retention/deletion scheduler,
legal-hold workflow, or external evidence store. Those are production blockers.
