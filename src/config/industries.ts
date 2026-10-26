/** Industry role pages — plain sector labels. */

export type IndustryBenefit = {
  title: string;
  desc: string;
};

export type IndustryFaq = {
  q: string;
  a: string;
};

export type IndustryRole = {
  slug: string;
  productName: string;
  label: string;
  card: string;
  title: string;
  sub: string;
  benefits: IndustryBenefit[];
  job?: string[];
  fits?: string[];
  safety?: string;
  willNotClaim?: string;
  sections?: { title: string; content: string[] }[];
  faq: IndustryFaq[];
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
    productName: "MaintenanceOS for landlords",
    label: "Landlords",
    card: "Landlords — UK emergency triage vs jobs; no invented vans or client-money.",
    title: "Repair reporting for landlords who can't be on the phone all night",
    sub: "Designed to capture tenant repair reports when the desk is closed. Fixed rules decide urgency; hazardous reports latch for an authorised person.",
    metaDescription: "Take tenant repair reports properly, keep anything dangerous in front of a person, and keep a record of what happened. Repair intake for UK landlords.",
    safety: "No client-money authority — no payment, refund, or compensation. 999 guidance locked for life danger. Not a live always-on phone; under testing.",
    willNotClaim: "No “we dispatch your team automatically.” Pre-launch status only.",
    benefits: [
      {
        title: "Midnight Boiler Calls",
        desc: "Structured intake collects property and fault details so you aren't waking up to unclear voicemails.",
      },
      {
        title: "Emergency Triage vs Routine",
        desc: "Fixed server rules flag dangerous reports like gas or leaks for human clearance; routine jobs wait for morning.",
      },
      {
        title: "Clear Evidence Trail",
        desc: "Complete timestamped record of tenant reports and actions for deposit and maintenance audits.",
      },
    ],
    faq: [
      {
        q: "What happens if a tenant reports a dangerous leak?",
        a: "The system latches the ticket for authorised human clearance and advises immediate safety steps.",
      },
      {
        q: "Can the assistant promise an engineer visit?",
        a: "No. Fixed rules forbid inventing booking slots or contractor arrivals.",
      },
      {
        q: "Does it handle emergency 999 calls?",
        a: "Immediate danger to life receives UK 999 guidance (never 911). Pre-launch and under testing; not a live always-on phone.",
      },
    ],
  },
  {
    slug: "letting-agents",
    productName: "MaintenanceOS for letting agents",
    label: "Letting agents",
    card: "Letting agents — portfolio intake with 999-vs-jobs triage; rules stay in charge.",
    title: "Repair intake for letting agents who carry the blame for both sides",
    sub: "Triage tenant repair calls across your portfolio. Fixed server rules prevent false promises to tenants or landlords.",
    metaDescription: "Repair intake for UK letting agents: take tenant reports consistently, hold safety-critical calls for a person, and keep a record.",
    safety: "No client-money authority — no payment, refund, or fee waivers. 999 guidance locked for life danger. Not a live always-on phone; under testing.",
    willNotClaim: "No “we dispatch your team automatically.” Pre-launch status only.",
    benefits: [
      {
        title: "Three-Way Communication",
        desc: "Captures tenant issues cleanly before bothering landlords or contractors.",
      },
      {
        title: "Fixed Safety Latches",
        desc: "Severe hazards latch for property manager review before any contractor booking.",
      },
      {
        title: "No Invented Commitments",
        desc: "Never promises arrival times or commits client funds without landlord approval.",
      },
    ],
    faq: [
      {
        q: "Can it commit a landlord to repair costs?",
        a: "No. There is zero client-money execution authority; the system cannot approve spending.",
      },
      {
        q: "What happens out of hours?",
        a: "It collects caller details cleanly. Not a live always-on phone; voice intake is under testing.",
      },
      {
        q: "How are emergency calls handled?",
        a: "Immediate danger to life receives 999 guidance (never 911). Pre-launch preview only.",
      },
    ],
  },
  {
    slug: "property-managers",
    productName: "MaintenanceOS for property managers",
    label: "Property managers",
    card: "Property managers — multi-tenant ops with 999-vs-jobs triage; no autonomous dispatch.",
    title: "One way of taking repair reports, across every building you manage",
    sub: "One consistent front door for building maintenance. Fixed rules decide next steps; dangerous issues stay with a person.",
    metaDescription: "Repair reports across many buildings, captured the same way, with dangerous ones kept with a person and a record of what happened. For UK property managers.",
    safety: "No client-money authority — no payment, refund, or compensation. 999 guidance locked for life danger. Not a live always-on phone; under testing.",
    willNotClaim: "No “we dispatch your team automatically.” Pre-launch status only.",
    benefits: [
      {
        title: "Portfolio Consistency",
        desc: "One standard intake process across all managed buildings and communal areas.",
      },
      {
        title: "Structured Handover",
        desc: "Accurate job descriptions ready for contractor dispatch without missing details.",
      },
      {
        title: "Human Approval Gates",
        desc: "Urgent building repairs require named property manager clearance.",
      },
    ],
    faq: [
      {
        q: "Can it handle reports for lots of different buildings?",
        a: "Yes. Properties and work orders sit in isolated organisation spaces.",
      },
      {
        q: "Does it approve contractor spending?",
        a: "No. There is zero client-money authority; the system cannot approve quotes or invoices.",
      },
      {
        q: "What if a resident calls about immediate danger?",
        a: "The assistant provides 999 guidance and latches the ticket for officer review. Under testing; not a live always-on phone.",
      },
    ],
  },
  {
    slug: "maintenance-companies",
    productName: "MaintenanceOS",
    label: "Maintenance companies",
    card: "MaintenanceOS — UK emergency triage vs jobs; contractor-dispatch language, no invented vans.",
    title: "Job intake for maintenance firms that won't promise an engineer you haven't sent",
    sub: "Job intake built for trade operations. Captures trade-specific facts without false arrival times or invented dispatches.",
    metaDescription: "For maintenance firms taking repair calls from landlords, agents and residents: structured job intake, dangerous reports kept with a person, no invented dispatch.",
    safety: "No client-money authority — no payment, refund, or compensation. 999 guidance locked for life danger. Not a live always-on phone; under testing.",
    willNotClaim: "No contractor marketplace pitch. No “we dispatch your team automatically.” No always-on phone claim. Pre-launch status only.",
    benefits: [
      {
        title: "Accurate Job Scopes",
        desc: "Captures trade-specific details before engineers visit, preventing wasted first trips.",
      },
      {
        title: "No False Promises",
        desc: "Never invents arrival slots or promises someone is on the way.",
      },
      {
        title: "Clear Job Records",
        desc: "Complete timestamped intake trail to prevent customer disputes over what was promised.",
      },
    ],
    faq: [
      {
        q: "Will the AI tell a caller an engineer is dispatched?",
        a: "No. The assistant must not invent bookings, arrival times, or contractor dispatches.",
      },
      {
        q: "Can it quote or take customer payment?",
        a: "No. The system has zero client-money execution authority; pricing decisions stay with you.",
      },
      {
        q: "What happens with life-safety emergencies?",
        a: "Directs callers to 999 for danger to life. Under testing; not a live always-on phone.",
      },
    ],
  },
  {
    slug: "housing-associations",
    productName: "MaintenanceOS for housing associations",
    label: "Housing associations",
    card: "Housing associations — 999-vs-jobs latch and escalation; no client-money or invented dispatch.",
    title: "Repairs reporting that keeps dangerous cases in front of a person",
    sub: "Structured repair intake for social housing. Fixed server rules latch emergency hazards and significant damp.",
    metaDescription: "Repair intake for UK housing associations: reports captured consistently, safety-critical cases held for an authorised person, and an audit trail on the case.",
    safety: "No client-money authority — no payment, refund, or compensation. 999 guidance locked for life danger. Not a live always-on phone; under testing.",
    willNotClaim: "No “we dispatch your team automatically.” Pre-launch status only.",
    benefits: [
      {
        title: "Awaab's Law Timescales",
        desc: "Reliable timestamping of first reports for emergency hazards and significant damp.",
      },
      {
        title: "Critical Safety Latching",
        desc: "Hazards are latched until an authorised officer inspects and clears the record.",
      },
      {
        title: "Ombudsman Audit Trail",
        desc: "Comprehensive evidence logs showing exactly what was reported and actioned.",
      },
    ],
    faq: [
      {
        q: "Does MaintenanceOS make us compliant with Awaab's Law?",
        a: "No software guarantees compliance. Your legal duties remain with your organisation.",
      },
      {
        q: "Can the assistant clear hazard latches?",
        a: "No. Only an authorised person can clear critical safety latches.",
      },
      {
        q: "How does it handle emergency calls?",
        a: "Guidance is 999 (never 911). No client-money authority; under testing, not a live always-on phone.",
      },
    ],
  },
  {
    slug: "facilities-management",
    productName: "MaintenanceOS for facilities teams",
    label: "Facilities management",
    card: "Facilities management — 999-vs-jobs site triage; no autonomous dispatch or client-money.",
    title: "Facilities management — site maintenance triage with clearance and audit in the loop.",
    sub: "Site maintenance intake for UK facilities teams. AI assists with capture; server rules control consequential steps.",
    metaDescription: "Facilities management — 999-vs-jobs site triage with human clearance. No client-money. Pre-launch.",
    safety: "No client-money authority — no payment, refund, or compensation. 999 guidance locked for life danger. Not a live always-on phone; under testing.",
    willNotClaim: "No “we dispatch your team automatically.” Pre-launch status only.",
    benefits: [
      {
        title: "Multi-Site Triage",
        desc: "Standardized repair capture across commercial sites, estates, and premises.",
      },
      {
        title: "Controlled Handover",
        desc: "Distinguishes routine building maintenance from urgent site safety hazards.",
      },
      {
        title: "Clearance in the Loop",
        desc: "Server rules control lifecycle; human facilities officers clear contractor dispatches.",
      },
    ],
    faq: [
      {
        q: "Does it dispatch contractors autonomously?",
        a: "No. Autonomous dispatch is prohibited; all consequential actions require human approval.",
      },
      {
        q: "Can it process supplier invoices or payments?",
        a: "No. There is zero client-money authority; payments and refunds cannot be executed.",
      },
      {
        q: "What is the emergency triage process?",
        a: "UK 999 guidance for danger to life. Under testing; not a live always-on phone.",
      },
    ],
  },
  {
    slug: "councils",
    productName: "MaintenanceOS for councils",
    label: "Councils",
    card: "Councils — controlled 999-vs-jobs intake; no invented dispatch or client-money.",
    title: "Repairs reporting for councils that need to show their working",
    sub: "Repair intake for council housing teams. Fixed rules manage statutory repair clocks; safety hazards held for officers.",
    metaDescription: "Repair intake for council housing and public-sector maintenance teams: consistent capture, safety-critical cases held for an authorised officer, and an audit trail.",
    safety: "No client-money authority — no payment, refund, or compensation. 999 guidance locked for life danger. Not a live always-on phone; under testing.",
    willNotClaim: "No “we dispatch your team automatically.” Pre-launch status only.",
    benefits: [
      {
        title: "Statutory Repair Clocks",
        desc: "Timestamps tenant reports for secure tenant Right to Repair timelines and Awaab's Law.",
      },
      {
        title: "Officer Clearance Gates",
        desc: "Safety-critical reports latch for authorised council officer review before contractor dispatch.",
      },
      {
        title: "Ombudsman Audit Trail",
        desc: "Transparent records showing exactly what was reported and actioned by the council.",
      },
    ],
    faq: [
      {
        q: "Does it guarantee Right to Repair compliance?",
        a: "No software meets statutory duties for you. It provides an auditable record of report times.",
      },
      {
        q: "Can it issue refunds or rent compensation?",
        a: "No. The system has zero client-money execution authority.",
      },
      {
        q: "Is it live for public procurement?",
        a: "Pre-launch and under testing. UK 999 guidance for danger; not a live always-on phone.",
      },
    ],
  },
  {
    slug: "holiday-lets",
    productName: "MaintenanceOS for holiday lets",
    label: "Holiday lets",
    card: "Holiday lets — out-of-hours guest reports structured; 999 vs jobs, no invented engineer.",
    title: "Holiday lets — guest maintenance calls, structured — without autonomous dispatch.",
    sub: "Capture out-of-hours guest issues clearly. Fixed rules triage emergencies without false promises or invented visits.",
    metaDescription: "Holiday lets — out-of-hours guest maintenance structured; 999 vs jobs, no invented dispatch.",
    safety: "No client-money authority — no payment, refund, or compensation. 999 guidance locked for life danger. Not a live always-on phone; under testing.",
    willNotClaim: "No “we dispatch your team automatically.” Pre-launch status only.",
    benefits: [
      {
        title: "Out-of-Hours Capture",
        desc: "Collects guest issue details when the office is closed, ready for morning review.",
      },
      {
        title: "No False Arrivals",
        desc: "Never promises false engineer arrival times or on-the-spot guest compensation.",
      },
      {
        title: "Property-Scoped Records",
        desc: "Tickets linked directly to specific holiday cottages and property access instructions.",
      },
    ],
    faq: [
      {
        q: "Does it promise refunds or compensation to guests?",
        a: "No. The assistant has zero client-money authority; refunds cannot be initiated.",
      },
      {
        q: "What if a guest suspects a gas leak?",
        a: "Directs guests to fresh air, the gas emergency line (0800 111 999), and 999 for danger.",
      },
      {
        q: "Is this a live 24/7 call centre?",
        a: "No. Pre-launch and under testing; voice intake is not a live always-on phone.",
      },
    ],
  },
];

export function getIndustryRole(slug: string): IndustryRole | undefined {
  return industryRoles.find((r) => r.slug === slug);
}
