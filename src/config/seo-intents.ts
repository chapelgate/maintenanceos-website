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
    title: "Repair Reporting Software for UK Landlords",
    primaryQuery: "property maintenance software for UK landlords",
    summary: "Take tenant repair reports, keep anything dangerous in front of a person, and keep a record of what happened. Repair intake for UK landlords.",
  },
  "letting-agents": {
    title: "Repair Reporting for UK Letting Agents",
    primaryQuery: "property maintenance software for UK letting agents",
    summary: "Repair intake for letting agents: tenant reports captured, dangerous ones kept with a person, no invented promises, and a record you can show landlords.",
  },
  "property-managers": {
    title: "Repair Intake for UK Property Managers",
    primaryQuery: "property maintenance software for UK property managers",
    summary: "Repair reports across many buildings, captured as structured requests, with dangerous ones kept with a person and a record of what happened. For UK property managers.",
  },
  "maintenance-companies": {
    title: "Call & Job Intake for UK Maintenance Companies",
    primaryQuery: "maintenance management software for UK maintenance companies",
    summary: "For maintenance firms taking repair calls from landlords, agents and residents: structured job intake, dangerous reports kept with a person, no invented dispatch.",
  },
  "housing-associations": {
    title: "Repairs Reporting for Housing Associations",
    primaryQuery: "housing maintenance software UK",
    summary: "Repair intake for UK housing associations: reports captured as structured requests, safety-critical cases held for an authorised person, and an audit trail on the case.",
  },
  "facilities-management": {
    title: "Facilities maintenance software for UK FM teams",
    primaryQuery: "facilities maintenance software UK",
    summary: "For facilities teams coordinating sites, contractors, and urgent maintenance reports while keeping consequential decisions with rules and authorised people.",
  },
  councils: {
    title: "Repairs Reporting Software for UK Councils",
    primaryQuery: "council maintenance software UK",
    summary: "Repair intake for council housing and public-sector maintenance teams: structured capture, safety-critical cases held for an authorised officer, and an audit trail.",
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
