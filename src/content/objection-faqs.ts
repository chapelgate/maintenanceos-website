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
      "No. Voice intake exists in product source and remains in commissioning preview. Public always-on commercial phone is not on this site until controlled-call gates pass. Path today: request an early demo — not “call the AI now.”",
  },
  {
    question: "Can it book or reschedule calendar appointments?",
    answer:
      "Not as a present claim. Live calendar book/reschedule is not on this site; it’s tracked with product. We don’t market peer-style appointment booking until the register upgrades.",
  },
  {
    question: "Will MaintenanceOS invent bookings, dispatches, or refunds?",
    answer:
      "No. The product must not invent bookings, dispatches, refunds, compensation, account information, or safety assurances. Fixed rules own safety and money — the model does not execute client-money or invent a van.",
  },
  {
    question: "What about emergencies vs routine jobs (UK)?",
    answer:
      "UK 999 guidance (never 911) is VERIFIED. Emergency services stay emergency services; a leaky tap stays structured intake. Critical safety is designed to latch for a person.",
  },
  {
    question: "Why only seven features on /features?",
    answer:
      "Those are the cards we can stand behind today: 4 VERIFIED and 3 PREVIEW. Items other products advertise stay off the marketing page.",
  },
];
