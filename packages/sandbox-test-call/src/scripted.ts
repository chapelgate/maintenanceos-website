import {
  TRUSTED_CONSTRAINTS_MARKER,
  normalizeKnowledgePack,
  type KnowledgePack,
} from "../../receptionist-draft/src/index.ts";
import type { ScriptedTurn, ScriptedTurnSource } from "./types.ts";

const CLOSING =
  "This was a scripted sandbox demo. It was not a live phone call, no customer number was used, and the frozen production telephony path was not touched.";

function emptyPack(): KnowledgePack {
  return (
    normalizeKnowledgePack({}) ?? {
      untrusted: true,
      kind: "sandbox_knowledge_pack",
      liveCall: false,
      liveNumber: null,
      alwaysOn: false,
      productionTelephony: false,
      missing: ["businessName", "greeting", "hours", "services", "faqs"],
    }
  );
}

function safePack(input: unknown): KnowledgePack {
  return normalizeKnowledgePack(input) ?? emptyPack();
}

/**
 * Missing-field language follows the stored system prompt when present:
 * say we do not have that information. Never invent hours/services.
 */
export function missingOnFileReply(
  fieldLabel: string,
  systemPrompt?: string,
): string {
  const prompt = typeof systemPrompt === "string" ? systemPrompt : "";
  if (
    /do not have that information/i.test(prompt) ||
    /must stay missing/i.test(prompt)
  ) {
    return `I'm not sure — ${fieldLabel} are not on file. I do not have that information.`;
  }
  return `I'm not sure — ${fieldLabel} are not on file in this knowledge pack.`;
}

function includesName(text: string, name: string): boolean {
  return text.toLowerCase().includes(name.toLowerCase());
}

function openingTurn(
  pack: KnowledgePack,
): ScriptedTurn {
  const name = pack.businessName;
  if (pack.greeting) {
    const text =
      name && !includesName(pack.greeting, name)
        ? `${pack.greeting} You're speaking with the sandbox draft receptionist for ${name}.`
        : pack.greeting;
    return { speaker: "receptionist", text, source: "knowledge.greeting" };
  }
  if (name) {
    return {
      speaker: "receptionist",
      text: `Hello, this is a sandbox draft receptionist for ${name}. This is not a live phone line.`,
      source: "knowledge.businessName",
    };
  }
  return {
    speaker: "receptionist",
    text: "Hello, this is a sandbox draft receptionist. This is not a live phone line.",
    source: "missing",
  };
}

function hoursTurn(
  pack: KnowledgePack,
  systemPrompt?: string,
): ScriptedTurn {
  if (pack.hours) {
    const text = pack.businessName
      ? `${pack.businessName} opening hours are ${pack.hours}.`
      : `Opening hours are ${pack.hours}.`;
    return { speaker: "receptionist", text, source: "knowledge.hours" };
  }
  return {
    speaker: "receptionist",
    text: missingOnFileReply("opening hours", systemPrompt),
    source: "missing",
  };
}

function servicesTurn(
  pack: KnowledgePack,
  systemPrompt?: string,
): ScriptedTurn {
  if (pack.services?.length) {
    const listed = pack.services.join(", ");
    const text = pack.businessName
      ? `${pack.businessName} offers ${listed}.`
      : `Services on file: ${listed}.`;
    return { speaker: "receptionist", text, source: "knowledge.services" };
  }
  return {
    speaker: "receptionist",
    text: missingOnFileReply("services", systemPrompt),
    source: "missing",
  };
}

function closingSource(systemPrompt?: string): ScriptedTurnSource {
  if (
    typeof systemPrompt === "string" &&
    systemPrompt.includes(TRUSTED_CONSTRAINTS_MARKER)
  ) {
    return "systemPrompt";
  }
  return "script";
}

/**
 * Deterministic scripted demo against the session knowledge pack.
 * Follows the stored system prompt's missing-field rule. Never invents
 * hours, services, or FAQs that are omitted from the pack.
 */
export function runScriptedDemo(
  pack: unknown,
  systemPrompt?: string,
): ScriptedTurn[] {
  const knowledge = safePack(pack);
  const faq = knowledge.faqs?.[0];

  return [
    openingTurn(knowledge),
    {
      speaker: "caller",
      text: "What are your opening hours?",
      source: "script",
    },
    hoursTurn(knowledge, systemPrompt),
    {
      speaker: "caller",
      text: "What services do you offer?",
      source: "script",
    },
    servicesTurn(knowledge, systemPrompt),
    {
      speaker: "caller",
      text: faq?.question ?? "Do you have any frequently asked questions?",
      source: faq?.question ? "knowledge.faqs" : "script",
    },
    {
      speaker: "receptionist",
      text: faq
        ? faq.answer
        : missingOnFileReply("FAQs", systemPrompt),
      source: faq ? "knowledge.faqs" : "missing",
    },
    {
      speaker: "receptionist",
      text: CLOSING,
      source: closingSource(systemPrompt),
    },
  ];
}
