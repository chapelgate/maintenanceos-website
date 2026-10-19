# S27 accessibility statement

Visitors need the site's accessibility target, audit scope, unresolved checks,
remediation plan, and a way to report barriers.

Acceptance: /accessibility/ returns 200 and states WCAG 2.2 AA as a target,
conformance not verified, known issues, remediation steps, and feedback contact.
Its links and sitemap entry must resolve. Do not claim a full WCAG audit,
Lighthouse score, WAVE result, or assistive technology sign-off.

Sources accessed 19 October 2026:
- MASTER_PLAN.md S27 and RULES.md in the masterplan workspace.
- https://www.w3.org/WAI/standards-guidelines/wcag/
- https://github.com/chapelgate/maintenanceos-website/actions/runs/39312522438
  reports 24 passing WebKit checks on main 65b1b57729d4a32c2ad497cafe8c526e30c027a3.
- tests/webkit-a11y/accessibility.spec.js defines the actual scope and tags.
- PR #315 remains OPEN with validate failing. S26 fixes are not deployed evidence.

Clarification: S26 is a dependency for claiming completed remediation, not for
honestly reporting outstanding work. This page must explicitly keep that work pending.
