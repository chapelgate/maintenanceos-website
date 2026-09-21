/**
 * Claims-safe FAQ copy shared by /faq/ and FAQPage JSON-LD.
 * Expand only with Claims Verifier / Copy sign-off.
 * Path: website URL → check → review → pack → optional scripted sandbox → early access.
 * Do not imply a live phone, always-on line, instant live number, or GA.
 */
export type FaqItem = {
  question: string;
  answer: string;
  relatedHref?: string;
  relatedLabel?: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "Is MaintenanceOS commercially available now?",
    answer:
      "No. The website is in pre-launch / early-access mode. The public path is website URL → check → review → pack → optional scripted sandbox → early access. You can also join the launch list or request an early-access briefing. MaintenanceOS is not commercially generally available, and this is not a live phone.",
    relatedHref: "/create/",
    relatedLabel: "Create from website",
  },
  {
    question: "Does pasting a website URL give me a live phone number?",
    answer:
      "No. Checking a website does not assign a live phone number. There is no public always-on receptionist on this site, and no instant live number after you submit. Early access is a waitlist and human briefing — not live number provisioning.",
    relatedHref: "/create/",
    relatedLabel: "Create from website",
  },
  {
    question: "What happens if the website scan is not configured?",
    answer:
      "If a scan service is not configured, the crawl is queued. We do not invent extracted hours, services, or FAQs. Staging scan is still owner-blocked (Render companion + DigitalOcean env), so a queued crawl is the honest result — not a completed knowledge crawl.",
    relatedHref: "/how-it-works/",
    relatedLabel: "How it works",
  },
  {
    question: "If hours or services are missing from the scan, do you fill them in?",
    answer:
      "No. Empty hours and services stay empty. You review the draft, then a claims-safe knowledge pack is built from fields that are actually present. Missing facts stay missing — we do not invent crawl results, bookings, or a live phone number.",
    relatedHref: "/create/",
    relatedLabel: "Create from website",
  },
  {
    question: "Does AI make final safety or money decisions?",
    answer:
      "No. Deterministic safety rules override AI. Critical safety paths require human clearance. AI has no payment, refund, or client-money authority.",
  },
  {
    question: "Is the AI receptionist live for production calls?",
    answer:
      "It is under testing and in development. Prior validation calls have occurred in a test context only. We do not claim commercial general availability, a public always-on phone line, an instant live number, or concurrent capacity numbers.",
    relatedHref: "/ai-receptionist/",
    relatedLabel: "AI receptionist",
  },
  {
    question: "What about emergency guidance?",
    answer:
      "Product design uses UK terminology and 999 guidance (never 911). A 999 emergency is not a maintenance job. Live-carrier retesting remains part of release readiness — this is not a live always-on emergency line.",
  },
  {
    question: "When will pricing be published?",
    answer:
      "Pricing is launching soon. Request pricing via an early-access briefing while packages are prepared. There is no self-serve checkout on this site.",
    relatedHref: "/demo/#demo",
    relatedLabel: "Request early access",
  },
];
