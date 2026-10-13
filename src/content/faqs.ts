/**
 * Claims-safe FAQ copy shared by /faq/ and FAQPage JSON-LD.
 * Expand only with Claims Verifier / Copy sign-off.
 * Path: website URL → website learning → review → configure → browser voice preview → optional save.
 * Do not imply a live phone, always-on line, instant live number, or GA.
 */
export type FaqItem = {
  question: string;
  answer: string;
  category: "product" | "safety";
  relatedHref?: string;
  relatedLabel?: string;
};

export const productFaqItems: FaqItem[] = [
  {
    category: "product",
    question: "Is MaintenanceOS commercially available now?",
    answer:
      "No. The public preview follows: website URL → website learning → review → configure → browser voice preview → optional save. MaintenanceOS is not commercially generally available, and this is not a live public phone line.",
    relatedHref: "/demo/",
    relatedLabel: "Request an early demo",
  },
  {
    category: "product",
    question: "Does checking a website assign a live phone number?",
    answer:
      "No, there is no instant live number and no public always-on receptionist. Empty hours and services stay empty, robots.txt is honoured, and missing facts stay empty rather than being invented.",
    relatedHref: "/create/",
    relatedLabel: "Try website preview",
  },
  {
    category: "product",
    question: "When will pricing be published?",
    answer:
      "Pricing is launching soon with no live phone included in a plan. Live telephony and calendar booking are coming / early access — request an early demo to talk pricing.",
    relatedHref: "/demo/",
    relatedLabel: "Request an early demo",
  },
  {
    category: "product",
    question: "How do I contact you?",
    answer:
      "Please email info@chapelgatetechnologies.com for genuine human enquiries and early access. That address is not a GA support desk and not an invented SLA.",
    relatedHref: "/demo/",
    relatedLabel: "Request an early demo",
  },
];

export const safetyFaqItems: FaqItem[] = [
  {
    category: "safety",
    question: "Does AI make safety or money decisions?",
    answer:
      "No. AI assists with intake, while fixed server rules own safety, and dangerous reports require authorised human clearance. Emergency guidance uses UK 999 guidance (never 911).",
    relatedHref: "/how-we-keep-control/",
    relatedLabel: "See safety rules",
  },
  {
    category: "safety",
    question: "Are you ISO or SOC 2 certified?",
    answer:
      "No, we do not claim ISO, SOC 2, or bank-grade security. Website learning is read-only and bounded, and reads a small, bounded set of public HTTPS pages under DRAFT FOR LEGAL REVIEW.",
    relatedHref: "/demo/",
    relatedLabel: "Request an early demo",
  },
  {
    category: "safety",
    question: "Do you use cookies or a consent banner?",
    answer:
      "No, there is no site-wide cookie or consent banner. The site uses cookieless first-party operational measurement with no persistent visitor identifier; Privacy, cookies, and terms remain DRAFT FOR LEGAL REVIEW — not a Google Analytics, PECR, or GDPR compliance certification.",
    relatedHref: "/cookies/",
    relatedLabel: "Cookie Policy (Draft)",
  },
  {
    category: "safety",
    question: "Does the public site crawl external websites?",
    answer:
      "When you use the preview, we read a small, bounded set of public HTTPS pages to extract services and hours. Private addresses are blocked, robots.txt is honoured, and missing facts stay empty.",
    relatedHref: "/how-it-works/",
    relatedLabel: "How it works",
  },
];

export const faqItems: FaqItem[] = [...productFaqItems, ...safetyFaqItems];
