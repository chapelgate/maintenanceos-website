/**
 * Claims-safe FAQ copy shared by /faq/ and FAQPage JSON-LD.
 * Expand only with Claims Verifier / Copy sign-off.
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
      "No. The website is in pre-launch / early-access mode. Start from your website on /create, join the launch list, or request an early-access briefing. MaintenanceOS is not commercially generally available, and this is not a live phone.",
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
      "It is under testing and in development. Prior validation calls have occurred; we do not claim commercial general availability, a public always-on phone line, or concurrent capacity numbers.",
    relatedHref: "/ai-receptionist/",
    relatedLabel: "AI receptionist",
  },
  {
    question: "What about emergency guidance?",
    answer:
      "Product design uses UK terminology and 999 guidance (not 911). Live-carrier retesting remains part of release readiness.",
  },
  {
    question: "When will pricing be published?",
    answer:
      "Pricing is launching soon. Request pricing via an early-access briefing while packages are prepared. There is no self-serve checkout on this site.",
    relatedHref: "/demo/#demo",
    relatedLabel: "Request early access",
  },
];
