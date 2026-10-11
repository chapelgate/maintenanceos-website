import {
  TRUSTED_CONSTRAINTS_MARKER,
  normalizeKnowledgePack,
  type KnowledgePack,
  type SiteKnowledgeItem,
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
      missing: [
        "businessName",
        "greeting",
        "hours",
        "services",
        "faqs",
      ],
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
    return `I'm not sure — ${fieldLabel} are not on file. I do not have that information. This is a preview and that detail has not been added yet.`;
  }
  return `I'm not sure — ${fieldLabel} are not on file in this knowledge pack. This is a preview and that detail has not been added yet.`;
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

function locationsTurn(
  pack: KnowledgePack,
  systemPrompt?: string,
): ScriptedTurn {
  if (pack.locations?.length) {
    const listed = pack.locations.join(", ");
    const text = pack.businessName
      ? `${pack.businessName} covers or is located at: ${listed}.`
      : `Locations on file: ${listed}.`;
    return { speaker: "receptionist", text, source: "knowledge.locations" };
  }
  return {
    speaker: "receptionist",
    text: missingOnFileReply("locations", systemPrompt),
    source: "missing",
  };
}

function contactTurn(
  pack: KnowledgePack,
  systemPrompt?: string,
): ScriptedTurn {
  const parts: string[] = [];
  if (pack.contact?.phone) {
    parts.push(`phone ${pack.contact.phone}`);
  }
  if (pack.contact?.email) {
    parts.push(`email ${pack.contact.email}`);
  }
  if (parts.length) {
    const text = pack.businessName
      ? `Contact details for ${pack.businessName}: ${parts.join(", ")}.`
      : `Contact details on file: ${parts.join(", ")}.`;
    return { speaker: "receptionist", text, source: "knowledge.contact" };
  }
  return {
    speaker: "receptionist",
    text: missingOnFileReply("contact details", systemPrompt),
    source: "missing",
  };
}

function companyTurn(
  pack: KnowledgePack,
  systemPrompt?: string,
): ScriptedTurn {
  if (pack.businessName) {
    const text = pack.greeting
      ? `You're speaking with the receptionist for ${pack.businessName}. ${pack.greeting}`
      : `You're speaking with the receptionist for ${pack.businessName}.`;
    return { speaker: "receptionist", text, source: "knowledge.businessName" };
  }
  return {
    speaker: "receptionist",
    text: missingOnFileReply("company details", systemPrompt),
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

const NOT_LIVE =
  "This is a scripted sandbox, not a live phone line. Frozen production telephony is unused.";

export type ScriptedIntent =
  | "emergency"
  | "booking"
  | "price"
  | "out_of_scope"
  | "angry"
  | "human"
  | "after_hours"
  | "hours"
  | "services"
  | "locations"
  | "contact"
  | "company"
  | "live_call"
  | "unknown";

function normalizeQuestion(text: string): string {
  return text.toLowerCase().replace(/[?!.,]/g, "").replace(/\s+/g, " ").trim();
}

const MATCH_STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "are",
  "can",
  "company",
  "could",
  "does",
  "for",
  "from",
  "have",
  "help",
  "how",
  "need",
  "our",
  "please",
  "some",
  "the",
  "this",
  "what",
  "with",
  "would",
  "your",
]);

function knowledgeTokens(text: string): string[] {
  return normalizeQuestion(text)
    .split(" ")
    .map((token) => token.replace(/[^a-z0-9'-]/g, ""))
    .filter(
      (token) =>
        token.length >= 3 &&
        !MATCH_STOP_WORDS.has(token),
    );
}

function tokenOverlapScore(left: string, right: string): number {
  const leftTokens = new Set(knowledgeTokens(left));
  if (!leftTokens.size) return 0;
  const rightTokens = new Set(knowledgeTokens(right));
  let score = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) score += 1;
  }
  return score;
}

function durationAnswerBonus(callerText: string, candidate: string): number {
  const asksForDuration =
    /\bhow long\b|\bwhen\b|\barriv(?:e|al|ing)?\b|\bdeliver(?:y|ed|ing)?\b/i.test(
      callerText,
    );
  if (!asksForDuration) return 0;
  return /\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:hours?|days?|weeks?|months?)\b/i.test(
    candidate,
  )
    ? 3
    : 0;
}

function matchService(
  pack: KnowledgePack,
  callerText: string,
): string | undefined {
  let best: string | undefined;
  let bestScore = 0;
  for (const service of pack.services ?? []) {
    const score = tokenOverlapScore(callerText, service);
    if (score > bestScore) {
      best = service;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : undefined;
}

function knowledgeSummaryTurn(pack: KnowledgePack): ScriptedTurn {
  const parts: string[] = [];
  if (pack.businessName) parts.push(`business name: ${pack.businessName}`);
  if (pack.hours) parts.push(`opening hours: ${pack.hours}`);
  if (pack.services?.length) {
    parts.push(`services: ${pack.services.join(", ")}`);
  }
  if (pack.locations?.length) {
    parts.push(`locations: ${pack.locations.join(", ")}`);
  }
  if (pack.contact?.phone || pack.contact?.email) {
    const contactParts: string[] = [];
    if (pack.contact.phone) contactParts.push(`phone ${pack.contact.phone}`);
    if (pack.contact.email) contactParts.push(`email ${pack.contact.email}`);
    parts.push(`contact: ${contactParts.join(", ")}`);
  }
  if (pack.faqs?.length) {
    parts.push(`${pack.faqs.length} reviewed FAQ${pack.faqs.length === 1 ? "" : "s"}`);
  }
  return {
    speaker: "receptionist",
    text: parts.length
      ? `The reviewed knowledge I have on file includes ${parts.join("; ")}.`
      : "I do not have any reviewed website facts on file yet. This is a preview and that detail has not been added yet.",
    source: parts.length ? "knowledge.summary" : "missing",
  };
}

export function classifyCallerIntent(text: string): ScriptedIntent {
  const t = text.toLowerCase();
  if (
    /\b(emergency|ambulance|fire brigade|gas leak)\b/.test(t) ||
    /someone is hurt/.test(t) ||
    /\b999\b/.test(t) ||
    /\b911\b/.test(t) ||
    /on fire|bleeding|collapsed/.test(t)
  ) {
    return "emergency";
  }
  if (/\b(book|booking|appointment|schedule|scheduled|slot|reschedule)\b/.test(t)) {
    return "booking";
  }
  if (
    /\b(price|prices|quote|quotes|cost|costs|ballpark|fee|fees|gbp|pounds?)\b/.test(
      t,
    ) ||
    /how much/.test(t) ||
    /£/.test(t)
  ) {
    return "price";
  }
  if (/\b(legal|medical|sue|suing|lawsuit|lawyer|solicitor|doctor|diagnos)/.test(t)) {
    return "out_of_scope";
  }
  if (/\b(furious|ridiculous|angry|outraged|disgusted|fed up)\b/.test(t)) {
    return "angry";
  }
  if (
    /speak to (a )?(human|person)/.test(t) ||
    /talk to (a )?(human|person|manager)/.test(t) ||
    /\btransfer( me)?\b/.test(t) ||
    /real (person|human)/.test(t)
  ) {
    return "human";
  }
  if (
    /after[-\s]?hours/.test(t) ||
    /you(?:'re| are) closed/.test(t) ||
    /already closed|closed now/.test(t)
  ) {
    return "after_hours";
  }
  if (
    /opening hours/.test(t) ||
    /\bhours\b/.test(t) ||
    /when (?:are you|do you) open/.test(t) ||
    /what time/.test(t)
  ) {
    return "hours";
  }
  if (
    /\bservices\b/.test(t) ||
    /what do you (?:offer|do)/.test(t) ||
    /what does (?:your|the) company do/.test(t) ||
    /what (?:work|jobs) do you/.test(t)
  ) {
    return "services";
  }
  if (
    /\b(locations?|address|where are you|office|headquarters|postcode|area|areas)\b/.test(t) ||
    /where (?:is|are) (?:you|your|the) (?:based|located|office)/.test(t) ||
    /what areas? do you cover/.test(t)
  ) {
    return "locations";
  }
  if (
    /\b(contact|phone|telephone|email|reach you|call you|get in touch)\b/.test(t) ||
    /how can i (?:contact|call|reach|email)/.test(t) ||
    /what(?:'s| is) your (?:number|phone|email)/.test(t)
  ) {
    return "contact";
  }
  if (
    /\b(who are you|who is this|what company|company name|business name|who am i speaking with)\b/.test(t) ||
    /tell me about (?:the|your) company/.test(t)
  ) {
    return "company";
  }
  if (
    /live call/.test(t) ||
    /diall?ed/.test(t) ||
    /phone (?:call|line) connected/.test(t) ||
    /webrtc/.test(t)
  ) {
    return "live_call";
  }
  return "unknown";
}

export function matchFaq(
  pack: KnowledgePack,
  callerText: string,
): { question?: string; answer: string } | undefined {
  const needle = normalizeQuestion(callerText);
  if (!needle) return undefined;

  let best:
    | { faq: { question?: string; answer: string }; score: number }
    | undefined;

  for (const faq of pack.faqs ?? []) {
    const question = normalizeQuestion(faq.question ?? "");
    if (question && (needle.includes(question) || question.includes(needle))) {
      return faq;
    }

    const score = Math.max(
      tokenOverlapScore(callerText, faq.question ?? ""),
      tokenOverlapScore(callerText, faq.answer),
    );
    if (score >= 2 && (!best || score > best.score)) {
      best = { faq, score };
    }
  }
  return best?.faq;
}

function matchSiteKnowledge(
  siteKnowledge: readonly SiteKnowledgeItem[] | undefined,
  callerText: string,
): { text: string; url: string } | undefined {
  if (!siteKnowledge?.length) return undefined;
  let best:
    | { text: string; url: string; score: number }
    | undefined;

  for (const item of siteKnowledge) {
    const context = [
      item.title ?? "",
      ...(item.headingPath ?? []),
      item.text,
    ].join(" ");
    const itemScore = tokenOverlapScore(callerText, context);
    if (itemScore < 2) continue;

    const sentences = item.text
      .split(/(?<=[.!?])\s+|\n+/)
      .map((part) => part.trim())
      .filter((part) => part.length >= 12 && part.length <= 600);
    const candidates = sentences.length ? sentences : [item.text.trim().slice(0, 600)];
    let answer = candidates[0] ?? "";
    let answerScore =
      tokenOverlapScore(callerText, answer) +
      durationAnswerBonus(callerText, answer);
    for (const candidate of candidates.slice(1)) {
      const score =
        tokenOverlapScore(callerText, candidate) +
        durationAnswerBonus(callerText, candidate);
      if (score > answerScore) {
        answer = candidate;
        answerScore = score;
      }
    }

    const score = itemScore + answerScore;
    if (answer && (!best || score > best.score)) {
      best = { text: answer, url: item.url, score };
    }
  }

  return best ? { text: best.text, url: best.url } : undefined;
}

function policySource(systemPrompt?: string): ScriptedTurnSource {
  return closingSource(systemPrompt);
}

/**
 * One receptionist turn for a caller utterance. Used by the conversation
 * benchmark. `runScriptedDemo` stays a fixed hours → services → FAQ script.
 */
export function scriptedReply(
  callerText: string,
  pack: unknown,
  systemPrompt?: string,
  siteKnowledge?: readonly SiteKnowledgeItem[],
): ScriptedTurn {
  const knowledge = safePack(pack);
  const intent = classifyCallerIntent(callerText);

  if (intent === "emergency") {
    return {
      speaker: "receptionist",
      text: `If this is an emergency in the UK, call 999 now (not 911). I cannot dispatch anyone from this scripted sandbox. ${NOT_LIVE}`,
      source: policySource(systemPrompt),
    };
  }
  if (intent === "booking") {
    return {
      speaker: "receptionist",
      text: `I cannot book an appointment from this scripted sandbox. Calendar booking is not connected here, and I will not invent a confirmed booking. ${NOT_LIVE}`,
      source: policySource(systemPrompt),
    };
  }
  if (intent === "price") {
    return {
      speaker: "receptionist",
      text: `${missingOnFileReply("prices", systemPrompt)} I will not invent a quote. ${NOT_LIVE}`,
      source: "missing",
    };
  }
  if (intent === "out_of_scope") {
    return {
      speaker: "receptionist",
      text: `I cannot give legal or medical advice. Please speak to a qualified professional. ${NOT_LIVE}`,
      source: policySource(systemPrompt),
    };
  }
  if (intent === "angry") {
    return {
      speaker: "receptionist",
      text: `I'm sorry this has been frustrating. I cannot transfer you from this scripted sandbox. No live call was placed. ${NOT_LIVE}`,
      source: policySource(systemPrompt),
    };
  }
  if (intent === "human") {
    return {
      speaker: "receptionist",
      text: `I cannot transfer you to speak to a person from this scripted sandbox. No live call was placed. ${NOT_LIVE}`,
      source: policySource(systemPrompt),
    };
  }
  if (intent === "after_hours") {
    const hours = hoursTurn(knowledge, systemPrompt);
    return {
      speaker: "receptionist",
      text: `${hours.text} I can note that you called after hours, but I cannot book a callback from this scripted sandbox. ${NOT_LIVE}`,
      source: hours.source,
    };
  }
  if (intent === "hours") {
    return hoursTurn(knowledge, systemPrompt);
  }
  if (intent === "services") {
    return servicesTurn(knowledge, systemPrompt);
  }
  if (intent === "locations") {
    return locationsTurn(knowledge, systemPrompt);
  }
  if (intent === "contact") {
    return contactTurn(knowledge, systemPrompt);
  }
  if (intent === "company") {
    return companyTurn(knowledge, systemPrompt);
  }
  if (intent === "live_call") {
    return {
      speaker: "receptionist",
      text: `${NOT_LIVE} No live call was placed.`,
      source: policySource(systemPrompt),
    };
  }

  if (/\bknowledge\s+pack\b|\bwhat (?:do|have) you know\b/i.test(callerText)) {
    return knowledgeSummaryTurn(knowledge);
  }

  const faq = matchFaq(knowledge, callerText);
  if (faq) {
    return {
      speaker: "receptionist",
      text: faq.answer,
      source: "knowledge.faqs",
    };
  }

  const siteEvidence = matchSiteKnowledge(siteKnowledge, callerText);
  if (siteEvidence) {
    return {
      speaker: "receptionist",
      text: siteEvidence.text,
      source: "knowledge.site",
    };
  }

  const matchedService = matchService(knowledge, callerText);
  if (matchedService) {
    return {
      speaker: "receptionist",
      text: knowledge.businessName
        ? `${matchedService} is listed among ${knowledge.businessName}'s reviewed services.`
        : `${matchedService} is listed in the reviewed services.` ,
      source: "knowledge.services",
    };
  }

  if (/\bhours\b/i.test(callerText)) {
    return hoursTurn(knowledge, systemPrompt);
  }
  if (/\bservices\b/i.test(callerText)) {
    return servicesTurn(knowledge, systemPrompt);
  }
  if (/\b(locations?|address|where are you)\b/i.test(callerText)) {
    return locationsTurn(knowledge, systemPrompt);
  }
  if (/\b(contact|phone|telephone|email)\b/i.test(callerText)) {
    return contactTurn(knowledge, systemPrompt);
  }
  return {
    speaker: "receptionist",
    text: missingOnFileReply("those details", systemPrompt),
    source: "missing",
  };
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
