import { firstFaqPair } from "./draft.ts";
import type { ReceptionistDraft, ScriptedTurn } from "./types.ts";

/**
 * Deterministic scripted demo against draft fields.
 * Missing fields are stated as missing — never invented as live answers.
 */
export function runScriptedDemo(draft: ReceptionistDraft): ScriptedTurn[] {
  const name = draft.businessName || "this business";
  const greeting = draft.greeting
    ? draft.greeting
    : `Hello, this is a sandbox draft receptionist for ${name}. This is not a live phone line.`;
  const hours = draft.hours
    ? draft.hours
    : "I do not have opening hours in this sandbox draft yet.";
  const services = draft.services
    ? draft.services
    : "I do not have services listed in this sandbox draft yet.";
  const faq = firstFaqPair(draft.faqs);
  const faqQuestion =
    faq?.question ?? "Do you have any frequently asked questions?";
  const faqAnswer = faq
    ? faq.answer
    : "I do not have FAQs in this sandbox draft yet.";

  return [
    {
      speaker: "receptionist",
      text: greeting,
      source: draft.greeting ? "draft.greeting" : "missing",
    },
    {
      speaker: "caller",
      text: "What are your opening hours?",
      source: "script",
    },
    {
      speaker: "receptionist",
      text: hours,
      source: draft.hours ? "draft.hours" : "missing",
    },
    {
      speaker: "caller",
      text: "What services do you offer?",
      source: "script",
    },
    {
      speaker: "receptionist",
      text: services,
      source: draft.services ? "draft.services" : "missing",
    },
    {
      speaker: "caller",
      text: faqQuestion,
      source: faq ? "draft.faqs" : "script",
    },
    {
      speaker: "receptionist",
      text: faqAnswer,
      source: faq ? "draft.faqs" : "missing",
    },
    {
      speaker: "receptionist",
      text: "This was a scripted sandbox demo. It was not a live phone call, no customer number was used, and the frozen production telephony path was not touched.",
      source: "script",
    },
  ];
}
