/** Industry role pages — copy from INDUSTRIES_CONTENT_PACK (DRAFT; Claims Verifier pending). */

export type IndustryRole = {
  slug: string;
  label: string;
  card: string;
  title: string;
  sub: string;
  job: string[];
  fits: string[];
  safety: string;
  willNotClaim: string;
  metaDescription: string;
};

export const industryRoles: IndustryRole[] = [
  {
    slug: "landlords",
    label: "Landlords",
    card: "Catch maintenance reports without inventing jobs or spending authority.",
    title: "Maintenance calls that become structured work — not inventing the job.",
    sub: "For UK landlords who need caller details captured clearly, safety paths that latch for a person, and no AI authority over money or dispatches.",
    job: [
      "Missed or half-reported maintenance calls when you cannot pick up.",
      "Residents describing emergencies in everyday language — you need structure, not improvisation.",
      "Risk of anyone (human or model) promising refunds, bookings, or “we’ll send someone now” without a process.",
      "Wanting a system that respects UK emergency guidance (999), not US defaults.",
    ],
    fits: [
      "Intake: AI receptionist layer is designed to collect caller details and classify issues in UK maintenance language — under testing, not a public always-on line.",
      "Controlled triage: deterministic rules own lifecycle, escalations, and approvals. Critical safety paths are designed to latch until a person clears them.",
      "Human oversight: callers can request a live transfer (explicit request). The system is designed not to invent bookings, dispatches, refunds, or safety assurances.",
      "Ops objects: multi-tenant properties, residents, contractors, work orders, jobs, and communications exist in product source and are under testing for release.",
    ],
    safety:
      "No payment, refund, compensation, fee-waiver, or client-money execution authority. See Security for tenant isolation and audit framing.",
    willNotClaim:
      "No “landlords already live on our phone line.” No fabricated landlord logos or occupancy stats. No concurrent-line marketing numbers.",
    metaDescription:
      "Structured maintenance intake for UK landlords. Rules own safety and money boundaries. Pilot-stage.",
  },
  {
    slug: "letting-agents",
    label: "Letting agents",
    card: "Structured intake across portfolios — rules stay in charge.",
    title: "Portfolio maintenance intake without the model running the agency.",
    sub: "For UK letting agents who need consistent caller capture across landlords and tenants, with rules — not improvisation — owning safety and money boundaries.",
    job: [
      "High call volume across many properties; notes get lost between phones and inboxes.",
      "Tenants and landlords both calling — roles and permissions must stay clear.",
      "Pressure to “just sort it” while liability sits with the agency and landlord.",
      "Need for escalation queues when something must wait for a person.",
    ],
    fits: [
      "Multi-tenant maintenance-operations design: properties, residents, contractors, work orders, jobs, communications.",
      "AI collects and classifies; server rules own consequential decisions.",
      "Escalation queues / human review are part of the designed control model.",
      "Explicit-request human transfer supported in source; quality still under retest.",
      "Quotes/invoices checks may exist in product; no payment or refund authority — never marketed as billing automation.",
    ],
    safety: "Money and safety stay out of the model’s hands. See Security for trust boundaries.",
    willNotClaim:
      "No agency case studies. No “replaces your helpdesk today.” No live multi-line production scale numbers.",
    metaDescription:
      "Portfolio maintenance intake for UK letting agents. Pre-launch briefing available.",
  },
  {
    slug: "property-managers",
    label: "Property managers",
    card: "Multi-tenant ops: properties, residents, contractors, work orders.",
    title: "Multi-tenant maintenance ops with AI for intake — rules for the operation.",
    sub: "For UK property managers who run properties, residents, contractors, and work orders and need accountable triage without autonomous dispatch.",
    job: [
      "Coordinating jobs across sites without a single structured intake spine.",
      "Safety-critical reports that must not be “handled” by a model alone.",
      "Auditability: what was said, what was classified, what a human cleared.",
      "Supervisors need visibility; public customer portals are not the pre-launch promise.",
    ],
    fits: [
      "Verified-in-source multi-tenant system spanning work orders, properties, residents, contractors, jobs, communications.",
      "Deterministic safety/lifecycle rules override AI.",
      "Critical safety latch requiring human clearance.",
      "Streamlit supervisor dashboard exists as internal supervisor tooling — not presented as a public customer portal GA.",
      "Customer portal / public account login: not available as GA.",
    ],
    safety:
      "Tenant isolation and audit/action evidence are designed capabilities. No certifications invented. See Security.",
    willNotClaim:
      "No fake property-manager firm logos. No “dashboard for your residents today.” No production call-pilot authorised claim.",
    metaDescription:
      "Multi-tenant maintenance ops with AI intake and deterministic controls.",
  },
  {
    slug: "maintenance-companies",
    label: "Maintenance companies",
    card: "Cleaner handoffs into jobs and communications — under testing.",
    title: "Cleaner handoffs into jobs and communications — under testing.",
    sub: "For maintenance companies that receive work from landlords, agents, and managers and need structured intake upstream of the job — without AI inventing dispatches.",
    job: [
      "Incomplete job details from phone-only reporting.",
      "Disputes over what was promised on the call.",
      "Need for clear escalation when safety or access is unclear.",
      "Avoiding any system that auto-commits vans, slots, or fees.",
    ],
    fits: [
      "Work orders, jobs, contractors, and communications are first-class in the product model (under testing for release).",
      "Intake is designed to collect caller details; rules block invented bookings/dispatches.",
      "Human transfer on explicit request keeps consequential commitments with people.",
      "Voice layer: built for UK terminology — under testing; further controlled testing underway.",
    ],
    safety: "No payment/refund authority. Safety latch and human clearance. See Security.",
    willNotClaim:
      "No contractor marketplace pitch. No “we dispatch your team automatically.” No invented SLA percentages.",
    metaDescription:
      "Structured handoffs into jobs and communications — under testing.",
  },
  {
    slug: "housing-associations",
    label: "Housing associations",
    card: "Safety latch and escalation queues designed for accountable housing ops.",
    title: "Accountable intake for housing maintenance — humans clear what matters.",
    sub: "For UK housing associations and housing providers who need structured reporting, safety latching, and escalation queues without over-claiming live voice GA.",
    job: [
      "Vulnerable residents and safety-critical fabric issues need clear escalation.",
      "Audit trails matter for governance — not marketing dashboards with fake KPIs.",
      "Multiple channels of report; phone still drops unstructured detail.",
      "Zero tolerance for a model inventing safety assurances or compensation promises.",
    ],
    fits: [
      "Deterministic rules override AI on safety/lifecycle.",
      "Critical safety latch requiring human clearance.",
      "Escalation queues / human review in the designed control model.",
      "Must-not-invent controls for bookings, dispatches, refunds, compensation, account info, and safety assurances.",
      "UK/999 guidance in source and regression tests — framed as designed behaviour; live-carrier retest still required.",
    ],
    safety: "No client-money or compensation execution. No ISO/SOC2 claims. See Security.",
    willNotClaim:
      "No housing-provider customer list. No regulatory certification badges. No “compliant out of the box” legal claims.",
    metaDescription:
      "Safety latch and escalation for accountable housing maintenance ops.",
  },
  {
    slug: "facilities-management",
    label: "Facilities management",
    card: "Triage and audit trails for sites that need human clearance.",
    title: "Site maintenance triage with clearance and audit in the loop.",
    sub: "For UK facilities management teams coordinating sites, contractors, and urgent reports — AI for capture, rules and people for consequential steps.",
    job: [
      "Mixed urgent and routine reports across sites.",
      "Need for consistent classification before a contractor moves.",
      "Evidence of what was approved versus what a model suggested.",
      "Avoiding chatbot-style “we’ve fixed it” language.",
    ],
    fits: [
      "Multi-tenant properties, contractors, work orders, jobs, communications.",
      "Controlled triage via deterministic server rules.",
      "Audit events / action evidence as designed trust capability.",
      "Human oversight for transfer and clearance; no autonomous dispatch story.",
    ],
    safety: "Money prohibitions apply. See Security.",
    willNotClaim:
      "No FM enterprise logos. No uptime or site-count vanity metrics. No “AI runs your FM operation.”",
    metaDescription:
      "Site triage with human clearance and audit framing. Pre-launch.",
  },
  {
    slug: "councils",
    label: "Councils",
    card: "Controlled intake and oversight language for public-sector maintenance.",
    title: "Controlled maintenance intake language for public-sector teams.",
    sub: "For council and local-authority maintenance contacts evaluating early access — honest about pilot stage, strict about safety and money boundaries.",
    job: [
      "Public callers expect clarity; systems must not over-promise.",
      "Emergency wording must follow UK practice (999), not improvised scripts.",
      "Procurement-sensitive evaluation: no fake readiness or certifications.",
      "Need human clearance on critical safety paths.",
    ],
    fits: [
      "Built for UK terminology — under testing (including 999 guidance where relevant).",
      "Deterministic safety latch and escalation queues.",
      "Explicit-request human transfer; no inventing of safety assurances or compensation.",
      "Pre-launch only: join list / early demo briefing — not a live public service claim.",
    ],
    safety:
      "Tenant isolation and audit framing only as designed capabilities. No procurement win claims. See Security.",
    willNotClaim:
      "No “approved for local government” badges. No named council customers. No live telephony GA.",
    metaDescription:
      "Controlled intake language for public-sector maintenance evaluation.",
  },
  {
    slug: "holiday-lets",
    label: "Holiday lets",
    card: "Guest-facing maintenance calls structured without autonomous dispatch.",
    title: "Guest maintenance calls, structured — without autonomous dispatch.",
    sub: "For UK holiday-let operators who get out-of-hours guest reports and need clear capture, safety boundaries, and human handover — not a model inventing engineer visits.",
    job: [
      "Guests calling about boilers, access, leaks — often outside office hours.",
      "Risk of anyone promising a contractor visit or compensation on the spot.",
      "Owners/managers need structured notes tied to the property.",
      "Want UK-appropriate emergency guidance if a guest describes danger.",
    ],
    fits: [
      "Intake designed to collect caller details and classify issues (voice under testing).",
      "Rules own safety latch, escalations, approvals; AI must not invent dispatches, bookings, refunds, or compensation.",
      "Multi-tenant properties and communications model supports property-scoped ops (under testing for release).",
      "Explicit-request human transfer when a person must decide.",
    ],
    safety: "No payment/refund/compensation authority. See Security.",
    willNotClaim:
      "No OTA partnership badges. No occupancy or booking-channel integrations as live features. No “24/7 live guest line” claim.",
    metaDescription:
      "Guest maintenance calls structured without autonomous dispatch.",
  },
];

export function getIndustryRole(slug: string): IndustryRole | undefined {
  return industryRoles.find((r) => r.slug === slug);
}
