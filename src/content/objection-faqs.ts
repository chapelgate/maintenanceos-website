/**
 * Claims-safe objection pack for home and /how-it-works (not /features).
 * UK English. Do not add per-question CTAs — Create / Join sits after the set.
 */

export type ObjectionFaqItem = {
  question: string;
  answer: string;
};

export const objectionFaqItems: readonly ObjectionFaqItem[] = [
  {
    question: "Is there a live always-on phone line I can call now?",
    answer:
      "No. Voice intake is in commissioning preview. Request an early demo to preview capabilities.",
  },
  {
    question: "Can it book or reschedule calendar appointments?",
    answer:
      "Not as a present claim. Live calendar booking is tracked with product, not active on this site.",
  },
  {
    question: "Will MaintenanceOS invent bookings, dispatches, or refunds?",
    answer:
      "No. Fixed rules own safety and money. The assistant never commits budget or invents a van dispatch.",
  },
  {
    question: "What about emergencies vs routine jobs (UK)?",
    answer:
      "UK 999 guidance (never 911). Critical safety latches for authorised human clearance.",
  },
  {
    question: "Why only seven features on /features?",
    answer:
      "Those are the cards we stand behind today: 4 VERIFIED and 3 PREVIEW.",
  },
  {
    question: "What if the caller asks for a person?",
    answer:
      "The assistant immediately transfers to your team or latches the request for human callback.",
  },
  {
    question: "Can the AI dispatch a contractor?",
    answer:
      "No. Only authorised staff on your team can approve dispatches and commit budgets.",
  },
  {
    question: "What happens if the system encounters an unknown issue?",
    answer:
      "Unknown situations are safely latched for human review rather than guessing.",
  },
];
