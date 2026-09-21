/** Industry / *OS role pages — labels use industry + OS naming. */

export type IndustryRole = {
  slug: string;
  /** Product line name (industry + OS). */
  productName: string;
  /** Short audience label. */
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

/**
 * Shared UK-maintenance positioning vs a generic AI receptionist (Fonio-class).
 * VERIFIED / carefully UNDER TEST only — not live always-on phone or GA.
 */
export const ukMaintenanceVsGeneric = [
  "Emergency triage vs jobs: UK/999 guidance is locked in product source (never 911). Danger is designed to latch for a person; a leaky tap stays a structured job — not an invented emergency visit.",
  "Contractor dispatch language: intake is designed to capture who, what, where, and access. Rules must not invent a van, slot, or “someone is on the way.”",
  "Out-of-hours honesty: designed to collect caller details when the desk is closed. That is not a public always-on phone or commercially live receptionist.",
  "No client-money: no payment, refund, compensation, fee-waiver, or client-money execution authority — for the model or automated money movement.",
] as const;

export const industryRoles: IndustryRole[] = [
  {
    slug: "landlords",
    productName: "LandlordOS",
    label: "Landlords",
    card: "LandlordOS — UK emergency triage vs jobs; no invented vans or client-money.",
    title: "LandlordOS — maintenance calls that become structured work.",
    sub: "For UK landlords who need caller details captured clearly, 999 separated from jobs, safety paths that latch for a person, and no AI authority over money or dispatches. Pre-launch product line under Chapelgate Technologies. Not a live always-on phone.",
    job: [
      "Out-of-hours or missed maintenance calls when you cannot pick up — notes must stay honest, not invented.",
      "Residents mix danger with routine repairs; 999 is emergency services, a job is work to schedule.",
      "Risk of anyone (human or model) promising refunds, bookings, or “we’ll send someone now” without a process.",
      "Wanting a system that respects UK emergency guidance (999), not US defaults or generic receptionist scripts.",
    ],
    fits: [
      "Intake: AI receptionist layer is designed to collect caller details and classify issues in UK maintenance language — under testing, not a public always-on line.",
      "Emergency triage vs jobs: deterministic rules own lifecycle, escalations, and approvals. Critical safety paths are designed to latch until a person clears them.",
      "Contractor dispatch language: callers can request a live transfer (explicit request). The system is designed not to invent bookings, dispatches, refunds, or safety assurances.",
      "Ops objects: multi-tenant properties, residents, contractors, work orders, jobs, and communications exist in product source and are under testing for release.",
    ],
    safety:
      "No payment, refund, compensation, fee-waiver, or client-money execution authority. See Security for tenant isolation and audit framing.",
    willNotClaim:
      "No “landlords already live on our phone line.” No fabricated landlord logos or occupancy stats. No concurrent-line marketing numbers. No live always-on phone or general availability.",
    metaDescription:
      "LandlordOS — UK maintenance intake with 999-vs-jobs triage. Rules own safety and money. Pilot-stage.",
  },
  {
    slug: "letting-agents",
    productName: "LettingAgentOS",
    label: "Letting agents",
    card: "LettingAgentOS — portfolio intake with 999-vs-jobs triage; rules stay in charge.",
    title: "LettingAgentOS — portfolio maintenance intake without the model running the agency.",
    sub: "For UK letting agents who need consistent caller capture across landlords and tenants, 999 separated from jobs, and rules — not improvisation — owning safety, dispatch language, and money boundaries. Pre-launch product line under Chapelgate Technologies. Not a live always-on phone.",
    job: [
      "High call volume across many properties; out-of-hours notes get lost between phones and inboxes.",
      "Tenants and landlords both calling — roles and permissions must stay clear.",
      "Pressure to “just sort it” or send a contractor now, while liability sits with the agency and landlord.",
      "Need for escalation queues when safety, access, or client-money questions must wait for a person.",
    ],
    fits: [
      "Multi-tenant maintenance-operations design: properties, residents, contractors, work orders, jobs, communications.",
      "AI is designed to collect and classify in UK maintenance language; server rules own consequential decisions — under testing, not a public always-on line.",
      "Emergency triage vs jobs: escalation queues / human review are part of the designed control model; 999 guidance is locked in product source.",
      "Explicit-request human transfer supported in source; quality still under retest. No invented contractor dispatch.",
      "Quotes/invoices checks may exist in product; no payment, refund, or client-money authority — never marketed as billing automation.",
    ],
    safety: "Money and safety stay out of the model’s hands. No client-money execution. See Security for trust boundaries.",
    willNotClaim:
      "No agency case studies. No “replaces your helpdesk today.” No live always-on phone. No live multi-line production scale numbers.",
    metaDescription:
      "LettingAgentOS — UK portfolio maintenance intake with 999-vs-jobs triage. Pre-launch.",
  },
  {
    slug: "property-managers",
    productName: "PropertyManagerOS",
    label: "Property managers",
    card: "PropertyManagerOS — multi-tenant ops with 999-vs-jobs triage; no autonomous dispatch.",
    title: "PropertyManagerOS — multi-tenant maintenance ops with AI for intake, rules for the operation.",
    sub: "For UK property managers who run properties, residents, contractors, and work orders and need accountable emergency triage without autonomous dispatch or client-money authority. Pre-launch product line under Chapelgate Technologies. Not a live always-on phone.",
    job: [
      "Coordinating jobs across sites without a single structured intake spine — including out-of-hours reports.",
      "Safety-critical reports that must not be “handled” by a model alone; 999 is not a work order.",
      "Contractor-dispatch language that must not become “the van is on the way” without a person.",
      "Auditability: what was said, what was classified, what a human cleared. Public customer portals are not the pre-launch promise.",
    ],
    fits: [
      "Verified-in-source multi-tenant system spanning work orders, properties, residents, contractors, jobs, communications.",
      "Deterministic safety/lifecycle rules override AI. UK/999 guidance is locked in product source.",
      "Critical safety latch requiring human clearance. Intake under testing — not a public always-on line.",
      "Streamlit supervisor dashboard exists as internal supervisor tooling — not presented as a public customer portal GA.",
      "Customer portal / public account login: not available as GA. No invented bookings or dispatches.",
    ],
    safety:
      "Tenant isolation and audit/action evidence are designed capabilities. No certifications invented. See Security.",
    willNotClaim:
      "No fake property-manager firm logos. No “dashboard for your residents today.” No production call-pilot authorised claim. No live always-on phone.",
    metaDescription:
      "PropertyManagerOS — multi-tenant UK maintenance ops with 999-vs-jobs triage and no autonomous dispatch.",
  },
  {
    slug: "maintenance-companies",
    productName: "MaintenanceOS",
    label: "Maintenance companies",
    card: "MaintenanceOS — UK emergency triage vs jobs; contractor-dispatch language, no invented vans.",
    title: "MaintenanceOS — UK property-maintenance intake, not a generic AI receptionist.",
    sub: "For UK maintenance firms that take after-hours calls from landlords, agents, and tenants. Designed to separate 999 emergencies from jobs, capture contractor-dispatch language without inventing a van, and keep money out of the model. First public Chapelgate *OS marketing site (pilot-stage). Not a live always-on phone.",
    job: [
      "Out-of-hours reports arrive as unstructured phone notes — capture must stay honest when no one is on the desk.",
      "Callers mix life-threatening danger with leaky taps; 999 is emergency services, a job is work to schedule.",
      "Incomplete details and “we’ll send someone now” promises create disputes before a contractor is assigned.",
      "Need for clear escalation when safety, access, or out-of-hours cover is unclear — without auto-committing vans, slots, or fees.",
    ],
    fits: [
      "Emergency triage vs jobs: UK/999 guidance is locked in product source. Danger is designed to latch for a person; routine fabric issues stay structured intake — under testing, not a public always-on line.",
      "Contractor dispatch language: work orders, jobs, contractors, and communications are first-class in the product model (under testing for release). Rules block invented bookings or “van is on the way.”",
      "Out-of-hours honesty: intake is designed to collect caller details when staff cannot pick up. That is not a live 24/7 commercial phone or GA receptionist.",
      "Human transfer on explicit request keeps consequential commitments with people. Voice layer: built for UK terminology — under testing.",
    ],
    safety:
      "No payment, refund, compensation, fee-waiver, or client-money execution. Safety latch and human clearance. See Security.",
    willNotClaim:
      "No contractor marketplace pitch. No “we dispatch your team automatically.” No “24/7 live always-on phone.” No invented SLA percentages. No general availability.",
    metaDescription:
      "MaintenanceOS — UK emergency triage vs jobs and contractor-dispatch language, without invented vans or client-money. Under testing.",
  },
  {
    slug: "housing-associations",
    productName: "HousingAssociationOS",
    label: "Housing associations",
    card: "HousingAssociationOS — 999-vs-jobs latch and escalation; no client-money or invented dispatch.",
    title: "HousingAssociationOS — accountable intake for housing maintenance.",
    sub: "For UK housing associations and housing providers who need structured reporting, 999 separated from jobs, safety latching, and escalation queues without over-claiming live voice GA. Pre-launch product line under Chapelgate Technologies. Not a live always-on phone.",
    job: [
      "Vulnerable residents and safety-critical fabric issues need clear escalation — 999 is not a contractor job.",
      "Out-of-hours phone reports still drop unstructured detail; capture must stay honest.",
      "Audit trails matter for governance — not marketing dashboards with fake KPIs.",
      "Zero tolerance for a model inventing safety assurances, contractor dispatch, or compensation promises.",
    ],
    fits: [
      "Deterministic rules override AI on safety/lifecycle. Critical safety latch requiring human clearance.",
      "Emergency triage vs jobs: escalation queues / human review in the designed control model.",
      "Must-not-invent controls for bookings, dispatches, refunds, compensation, account info, and safety assurances.",
      "UK/999 guidance in source and regression tests — framed as designed behaviour; live-carrier retest still required. Voice under testing — not a public always-on line.",
    ],
    safety: "No client-money or compensation execution. No ISO/SOC2 claims. See Security.",
    willNotClaim:
      "No housing-provider customer list. No regulatory certification badges. No “compliant out of the box” legal claims. No live always-on phone.",
    metaDescription:
      "HousingAssociationOS — 999-vs-jobs latch and escalation for accountable housing maintenance. Pre-launch.",
  },
  {
    slug: "facilities-management",
    productName: "FacilitiesOS",
    label: "Facilities management",
    card: "FacilitiesOS — 999-vs-jobs site triage; no autonomous dispatch or client-money.",
    title: "FacilitiesOS — site maintenance triage with clearance and audit in the loop.",
    sub: "For UK facilities management teams coordinating sites, contractors, and urgent reports — AI for capture, rules and people for consequential steps. Pre-launch product line under Chapelgate Technologies. Not a live always-on phone.",
    job: [
      "Mixed urgent and routine reports across sites, including out-of-hours.",
      "Need for consistent classification before a contractor moves — 999 is not a work order.",
      "Evidence of what was approved versus what a model suggested.",
      "Avoiding chatbot-style “we’ve fixed it” or “van is on the way” language.",
    ],
    fits: [
      "Multi-tenant properties, contractors, work orders, jobs, communications.",
      "Controlled emergency triage vs jobs via deterministic server rules. UK/999 guidance in product source.",
      "Audit events / action evidence as designed trust capability. Intake under testing — not a public always-on line.",
      "Human oversight for transfer and clearance; no autonomous dispatch story and no client-money authority.",
    ],
    safety: "Money prohibitions apply — no payment, refund, compensation, or client-money execution. See Security.",
    willNotClaim:
      "No FM enterprise logos. No uptime or site-count vanity metrics. No “AI runs your FM operation.” No live always-on phone.",
    metaDescription:
      "FacilitiesOS — 999-vs-jobs site triage with human clearance. No client-money. Pre-launch.",
  },
  {
    slug: "councils",
    productName: "CouncilOS",
    label: "Councils",
    card: "CouncilOS — controlled 999-vs-jobs intake; no invented dispatch or client-money.",
    title: "CouncilOS — controlled maintenance intake for public-sector teams.",
    sub: "For council and local-authority maintenance contacts evaluating early access — honest about pilot stage, strict about 999-vs-jobs, contractor-dispatch language, and money boundaries. Pre-launch product line under Chapelgate Technologies. Not a live always-on phone.",
    job: [
      "Public callers expect clarity; systems must not over-promise a contractor or a live always-on line.",
      "Emergency wording must follow UK practice (999), not improvised or US scripts.",
      "Out-of-hours reports still need structured capture without inventing jobs or compensation.",
      "Procurement-sensitive evaluation: no fake readiness or certifications. Need human clearance on critical safety paths.",
    ],
    fits: [
      "Built for UK terminology — under testing (including 999 guidance where relevant). Not a public always-on line.",
      "Deterministic safety latch and escalation queues — emergency triage vs jobs.",
      "Explicit-request human transfer; no inventing of contractor dispatch, safety assurances, or compensation.",
      "Pre-launch only: join list / early demo briefing — not a live public service claim.",
    ],
    safety:
      "Tenant isolation and audit framing only as designed capabilities. No client-money or compensation execution. No procurement win claims. See Security.",
    willNotClaim:
      "No “approved for local government” badges. No named council customers. No live telephony GA. No live always-on phone.",
    metaDescription:
      "CouncilOS — controlled 999-vs-jobs intake for public-sector maintenance evaluation. Pre-launch.",
  },
  {
    slug: "holiday-lets",
    productName: "HolidayLetOS",
    label: "Holiday lets",
    card: "HolidayLetOS — out-of-hours guest reports structured; 999 vs jobs, no invented engineer.",
    title: "HolidayLetOS — guest maintenance calls, structured — without autonomous dispatch.",
    sub: "For UK holiday-let operators who get out-of-hours guest reports and need clear capture, 999 separated from jobs, and human handover — not a model inventing engineer visits or a live always-on guest line. Pre-launch product line under Chapelgate Technologies.",
    job: [
      "Guests calling about boilers, access, leaks — often outside office hours.",
      "Risk of anyone promising a contractor visit or compensation on the spot.",
      "Owners/managers need structured notes tied to the property — 999 if there is danger, a job if it is maintenance.",
      "Want UK-appropriate emergency guidance if a guest describes danger, without a generic 24/7 receptionist claim.",
    ],
    fits: [
      "Out-of-hours honesty: intake designed to collect caller details and classify issues (voice under testing — not a public always-on line).",
      "Emergency triage vs jobs: rules own safety latch, escalations, approvals; AI must not invent dispatches, bookings, refunds, or compensation.",
      "Multi-tenant properties and communications model supports property-scoped ops (under testing for release).",
      "Explicit-request human transfer when a person must decide. No client-money authority.",
    ],
    safety: "No payment, refund, compensation, or client-money execution authority. See Security.",
    willNotClaim:
      "No OTA partnership badges. No occupancy or booking-channel integrations as live features. No “24/7 live guest line” or always-on phone claim.",
    metaDescription:
      "HolidayLetOS — out-of-hours guest maintenance structured; 999 vs jobs, no invented dispatch.",
  },
];

export function getIndustryRole(slug: string): IndustryRole | undefined {
  return industryRoles.find((r) => r.slug === slug);
}
