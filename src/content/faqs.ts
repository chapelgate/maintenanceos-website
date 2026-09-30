/**
 * Claims-safe FAQ copy shared by /faq/ and FAQPage JSON-LD.
 * Expand only with Claims Verifier / Copy sign-off.
 * Path: website URL → website learning → review → configure → browser voice preview → optional save.
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
      "No. The website is in pre-launch mode, with a browser voice receptionist preview available on /create. The public path is website URL → website learning → review → configure → browser voice preview → optional save. You can optionally save the setup or request a human briefing. MaintenanceOS is not commercially generally available, and this is not a live public phone line.",
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
    question: "Does the public site crawl my website?",
    answer:

      "Yes, when you use /create we read a small, bounded set of public HTTPS pages to extract reviewable business facts such as services, contact details and hours when they are present. Private or internal network targets are blocked, robots.txt is honoured, and missing facts stay empty rather than being invented.",

    relatedHref: "/how-it-works/",
    relatedLabel: "How it works",
  },
  {
    question: "If hours or services are missing, do you fill them in?",
    answer:
      "No. Empty hours and services stay empty. You review the draft, then a claims-safe knowledge pack is built from fields that are actually present. Missing facts stay missing — we do not invent business details, bookings, or a live phone number.",
    relatedHref: "/create/",
    relatedLabel: "Create from website",
  },
  {
    question: "Does AI make final safety or money decisions?",
    answer:
      "No. AI assists with intake. Deterministic server rules own safety, lifecycle, approvals, and money boundaries. Critical safety paths require authorised human clearance. AI has no payment, refund, or client-money authority.",
  },
  {
    question: "Is the AI receptionist live for production calls?",
    answer:
      "The browser receptionist is available as an interactive preview. Live telephone voice remains in commissioning preview. We do not claim commercial general availability, a public always-on phone line, an instant live number, or concurrent capacity numbers.",
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
      "Pricing is launching soon. There are no published list prices and no live phone included in a plan. Create from website, or request pricing via an early-access briefing. There is no self-serve checkout. Live telephony and calendar booking are coming / early access — not general availability.",
    relatedHref: "/create/",
    relatedLabel: "Create from website",
  },
  {
    question: "How do I contact you?",
    answer:
      "For product interest, start at Create from website. The contact form is for genuine human enquiries and early access — not live phone provisioning, not a GA support desk, and not an invented SLA. You can also join the launch list or request an early-access briefing on the demo page.",
    relatedHref: "/create/",
    relatedLabel: "Create from website",
  },
  {
    question: "Are you ISO or SOC 2 certified?",
    answer:

      "No. We do not claim ISO, SOC 2, Cyber Essentials, or bank-grade security. Tenant isolation, human clearance, and audit evidence exist in product source as designed controls. Website learning is read-only, bounded and SSRF-guarded. Privacy, cookies, and terms remain DRAFT FOR LEGAL REVIEW. For product interest, start at Create from website.",

    relatedHref: "/create/",
    relatedLabel: "Create from website",
  },
  {
    question: "Do you use cookies or a consent banner?",
    answer:
      "There is no site-wide cookie or consent banner. No analytics or marketing cookies and no third-party analytics tags are loaded. The site uses cookieless first-party operational measurement with no persistent visitor identifier, referrer, query string, or user-agent stored in website event records. The cookie notice is DRAFT FOR LEGAL REVIEW — not final policy and not a Google Analytics, PECR, or GDPR compliance certification. Footer Cookie settings opens that draft notice, not a live preference centre.",
    relatedHref: "/cookies/",
    relatedLabel: "Cookie Policy (Draft)",
  },
];
