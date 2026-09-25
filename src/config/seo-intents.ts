export type SeoIntent = {
  path: string;
  primaryQuery: string;
  secondaryQueries: readonly string[];
  purpose: string;
};

export const buyerIntentMap: readonly SeoIntent[] = [
  { path: "/", primaryQuery: "UK maintenance operations software", secondaryQueries: ["maintenance operations software UK"], purpose: "Category and brand discovery." },
  { path: "/property-maintenance-software/", primaryQuery: "property maintenance software UK", secondaryQueries: ["maintenance management software UK", "property repair management software"], purpose: "Core non-brand commercial discovery." },
  { path: "/ai-receptionist/", primaryQuery: "AI maintenance receptionist", secondaryQueries: ["AI receptionist for property maintenance", "AI maintenance call handling"], purpose: "AI-assisted intake discovery." },
  { path: "/features/", primaryQuery: "maintenance operations software features", secondaryQueries: ["property maintenance workflow software"], purpose: "Feature evaluation." },
  { path: "/how-it-works/", primaryQuery: "maintenance intake workflow software", secondaryQueries: ["maintenance request workflow"], purpose: "Workflow evaluation." },
] as const;

export type IndustrySeoIntent = { title: string; primaryQuery: string; summary: string };

const industrySeoIntents: Record<string, IndustrySeoIntent> = {
  landlords: {
    title: "Property maintenance software for UK landlords",
    primaryQuery: "property maintenance software for UK landlords",
    summary: "For landlords who need maintenance reports captured consistently and separated from safety emergencies, with human control over dispatch and money.",
  },
  "letting-agents": {
    title: "Property maintenance software for UK letting agents",
    primaryQuery: "property maintenance software for UK letting agents",
    summary: "For letting agents coordinating maintenance across landlords, tenants, properties, and contractors without turning AI intake into autonomous agency decisions.",
  },
  "property-managers": {
    title: "Property maintenance software for UK property managers",
    primaryQuery: "property maintenance software for UK property managers",
    summary: "For property managers who need structured maintenance intake across multiple properties, clear escalation, and an auditable path from report to human-controlled action.",
  },
  "maintenance-companies": {
    title: "Maintenance management software for UK maintenance companies",
    primaryQuery: "maintenance management software for UK maintenance companies",
    summary: "For maintenance firms handling calls and work intake from landlords, agents, and residents, with UK emergency wording and no invented engineer dispatch.",
  },
  "housing-associations": {
    title: "Housing maintenance software for UK housing providers",
    primaryQuery: "housing maintenance software UK",
    summary: "For housing providers that need accountable maintenance reporting, safety escalation, and clear human clearance without invented compliance or dispatch claims.",
  },
  "facilities-management": {
    title: "Facilities maintenance software for UK FM teams",
    primaryQuery: "facilities maintenance software UK",
    summary: "For facilities teams coordinating sites, contractors, and urgent maintenance reports while keeping consequential decisions with rules and authorised people.",
  },
  councils: {
    title: "Council maintenance software for UK public-sector teams",
    primaryQuery: "council maintenance software UK",
    summary: "For public-sector maintenance teams evaluating structured intake, UK emergency guidance, auditability, and human-controlled escalation.",
  },
  "holiday-lets": {
    title: "Holiday let maintenance software for UK operators",
    primaryQuery: "holiday let maintenance software UK",
    summary: "For holiday-let operators who need out-of-hours guest maintenance reports captured clearly without invented engineer visits, refunds, or autonomous dispatch.",
  },
};

export function getIndustrySeoIntent(slug: string): IndustrySeoIntent | undefined {
  return industrySeoIntents[slug];
}
