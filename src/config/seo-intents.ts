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
    summary: "Tenant repair reports for UK landlords; dangerous cases stay with a person. Pre-launch; not a live phone; no SLA claim.",
  },
  "letting-agents": {
    title: "Repair Reporting for UK Letting Agents",
    primaryQuery: "property maintenance software for UK letting agents",
    summary: "Letting-agent repair intake; dangerous reports stay with a person. Pre-launch; not a live phone; no SLA claim.",
  },
  "property-managers": {
    title: "Repair Intake for UK Property Managers",
    primaryQuery: "property maintenance software for UK property managers",
    summary: "Repair reports across many buildings; dangerous cases stay with a person. Pre-launch; not a live phone; no SLA claim.",
  },
  "maintenance-companies": {
    title: "Call & Job Intake for UK Maintenance Companies",
    primaryQuery: "maintenance management software for UK maintenance companies",
    summary: "Structured job intake for UK maintenance firms; dangerous reports stay with a person. Pre-launch; not a live phone; no SLA claim.",
  },
  "housing-associations": {
    title: "Repairs Reporting for Housing Associations",
    primaryQuery: "housing maintenance software UK",
    summary: "Housing-association repair intake; safety-critical cases stay with an authorised person. Pre-launch; not a live phone; no SLA claim.",
  },
  "facilities-management": {
    title: "Facilities maintenance software for UK FM teams",
    primaryQuery: "facilities maintenance software UK",
    summary: "Facilities teams capture urgent reports; consequential decisions stay with people. Pre-launch; not a live phone; no SLA claim.",
  },
  councils: {
    title: "Repairs Reporting Software for UK Councils",
    primaryQuery: "council maintenance software UK",
    summary: "Council repair intake; safety-critical cases stay with an authorised officer. Pre-launch; not a live phone; no SLA claim.",
  },
  "holiday-lets": {
    title: "Holiday let maintenance software for UK operators",
    primaryQuery: "holiday let maintenance software UK",
    summary: "Out-of-hours guest reports for holiday lets, without invented visits or refunds. Pre-launch; not a live phone; no SLA claim.",
  },
};

export function getIndustrySeoIntent(slug: string): IndustrySeoIntent | undefined {
  return industrySeoIntents[slug];
}
