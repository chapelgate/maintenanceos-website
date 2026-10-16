import { hoursAreSpeakable } from "./extract.ts";
import type { CorpusIndex, CorpusSearchHit } from "./scanner-v2-retrieval.ts";

export const DEFAULT_GROUNDED_RETRIEVAL_LIMIT = 5;
export const MAX_GROUNDED_ANSWER_CHARS = 900;

export type GroundedValue<T> = {
  value: T;
  sourceUrls: string[];
};

export type GroundedFaq = {
  question: string;
  answer: string;
  sourceUrls: string[];
};

export type ReceptionistGroundingFacts = {
  businessName?: GroundedValue<string>;
  hours?: GroundedValue<string>;
  services?: GroundedValue<string[]>;
  locations?: GroundedValue<string[]>;
  phones?: GroundedValue<string[]>;
  emails?: GroundedValue<string[]>;
  faqs?: GroundedFaq[];
};

export type GroundedEvidence = {
  chunkId: string;
  canonicalUrl: string;
  text: string;
  score: number;
};

export type GroundedAnswerSource =
  | "structured.hours"
  | "structured.services"
  | "structured.locations"
  | "structured.phones"
  | "structured.emails"
  | "structured.faqs"
  | "corpus.extractive"
  | "corpus.synthesized"
  | "missing";

export type GroundedReceptionistAnswer = {
  text: string;
  supportStatus: "supported" | "not_found";
  source: GroundedAnswerSource;
  sourceUrls: string[];
  retrievedChunkIds: string[];
  evidence: GroundedEvidence[];
};

export type GroundedSynthesizer = (input: {
  question: string;
  evidence: readonly GroundedEvidence[];
}) => Promise<string | undefined>;

export type GroundedAnswerOptions = {
  crawlId: string;
  index: CorpusIndex;
  facts?: ReceptionistGroundingFacts;
  retrievalLimit?: number;
  synthesizer?: GroundedSynthesizer;
};

const STOP = new Set([
  "a","an","and","are","as","at","be","by","can","could","did","do","does",
  "for","from","have","how","i","in","is","it","me","of","on","or","our",
  "please","tell","that","the","their","there","they","this","to","what",
  "when","where","which","with","would","you","your",
]);

function normalize(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function matchStem(token: string): string {
  if (token.length <= 4) return token;
  if (token.endsWith("ies") && token.length > 5) {
    return token.slice(0, -3) + "y";
  }
  if (token.endsWith("ing") && token.length > 6) {
    let base = token.slice(0, -3);
    if (base.length > 3 && base.at(-1) === base.at(-2)) base = base.slice(0, -1);
    return base;
  }
  if (token.endsWith("ed") && token.length > 5) {
    let base = token.slice(0, -2);
    if (base.length > 3 && base.at(-1) === base.at(-2)) base = base.slice(0, -1);
    return base;
  }
  if (token.endsWith("es") && token.length > 5) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 4) return token.slice(0, -1);
  return token;
}

function tokens(value: string): string[] {
  return (
    normalize(value).match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu) ?? []
  )
    .map(matchStem)
    .filter((token) => token.length >= 2 && !STOP.has(token));
}

function uniqueUrls(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

function structuredAnswer(
  source: GroundedAnswerSource,
  text: string,
  urls: readonly string[],
): GroundedReceptionistAnswer {
  return {
    text,
    supportStatus: "supported",
    source,
    sourceUrls: uniqueUrls(urls),
    retrievedChunkIds: [],
    evidence: [],
  };
}

function exactIntent(question: string):
  | "hours"
  | "services"
  | "locations"
  | "phones"
  | "emails"
  | null {
  const q = normalize(question);
  if (
    /\b(opening hours?|hours?|opening times?|when are you open|what time.*open)\b/.test(q)
  ) return "hours";
  if (
    /\b(services?|what do you do|what does .* do|what do you offer|what work do you do)\b/.test(q)
  ) return "services";
  if (
    /\b(email|e-mail|email address|contact email)\b/.test(q)
  ) return "emails";
  if (
    /\b(phone|telephone|number|call you|contact number)\b/.test(q)
  ) return "phones";
  if (
    /\b(address|addresses|location|locations|where are you|where is .* based)\b/.test(q)
  ) return "locations";
  return null;
}

function matchStructuredFaq(
  question: string,
  faqs: readonly GroundedFaq[],
): GroundedFaq | undefined {
  const qTokens = new Set(tokens(question));
  if (!qTokens.size) return undefined;

  let best: GroundedFaq | undefined;
  let bestScore = 0;
  for (const faq of faqs) {
    const faqTokens = new Set(tokens(faq.question + " " + faq.answer));
    let score = 0;
    for (const token of qTokens) if (faqTokens.has(token)) score += 1;
    if (score > bestScore) {
      best = faq;
      bestScore = score;
    }
  }
  return bestScore >= 2 ? best : undefined;
}

function sentenceCandidates(text: string): string[] {
  const normalized = text.replace(/\r\n?/g, "\n").trim();
  const lines = normalized
    .split(/\n+/)
    .map((value) => value.trim())
    .filter(Boolean);

  const out: string[] = [];
  for (const line of lines) {
    const parts = line
      .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
      .map((value) => value.trim())
      .filter(Boolean);
    if (parts.length) out.push(...parts);
    else if (line) out.push(line);
  }
  return out.length ? out : [normalized];
}

function answerCueBonus(question: string, candidate: string): number {
  const q = normalize(question);
  const c = normalize(candidate);
  let bonus = 0;

  const asksDuration =
    /\b(how long|lead time|wait(?:ing)? time|take to|delivery time)\b/.test(q);
  if (
    asksDuration &&
    /\b(?:up to\s+)?(?:\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*(?:hour|hours|day|days|week|weeks|month|months)\b/.test(c)
  ) {
    bonus += 35;
  }

  const asksPrice = /\b(how much|price|cost|fee|charge)\b/.test(q);
  if (asksPrice && /£\s*\d+(?:[.,]\d{1,2})?/.test(c)) {
    bonus += 35;
  }

  const asksReturns = /\b(return|returns|refund|refunds|exchange|exchanges)\b/.test(q);
  if (
    asksReturns &&
    /\b(return|returns|refund|refunds|faulty|exchange|exchanged)\b/.test(c)
  ) {
    bonus += 35;
  }

  const asksEnumeration =
    /\b(what|which)\s+(?:types?|kinds?|styles?)\b/.test(q) ||
    /\bwhat\s+.*\s+do you offer\b/.test(q);
  const commaCount = (candidate.match(/,/g) ?? []).length;
  if (
    asksEnumeration &&
    (/\b(?:including|include|such as)\b/i.test(candidate) || commaCount >= 2)
  ) {
    bonus += 30;
  }

  return bonus;
}

function chooseExtractiveSpan(
  question: string,
  hits: readonly CorpusSearchHit[],
): { text: string; hit: CorpusSearchHit } | undefined {
  const qTokens = new Set(tokens(question));
  let best:
    | { text: string; hit: CorpusSearchHit; score: number; ordinal: number }
    | undefined;

  for (const hit of hits) {
    const headingTokens = new Set(tokens(hit.headingPath.join(" ")));
    let headingOverlap = 0;
    for (const token of qTokens) if (headingTokens.has(token)) headingOverlap += 1;

    const candidates = sentenceCandidates(hit.text);
    for (const [ordinal, candidate] of candidates.entries()) {
      if (!candidate) continue;
      const cTokens = new Set(tokens(candidate));
      let overlap = 0;
      for (const token of qTokens) if (cTokens.has(token)) overlap += 1;

      const identifiers = hit.matchedIdentifiers.filter((identifier) =>
        normalize(candidate).replace(/[\s().-]+/g, "").includes(identifier),
      ).length;

      const score =
        overlap * 10 +
        identifiers * 25 +
        answerCueBonus(question, candidate) +
        headingOverlap * 8 +
        Math.min(hit.score, 20);
      if (
        !best ||
        score > best.score ||
        (score === best.score &&
          (hit.canonicalUrl.localeCompare(best.hit.canonicalUrl) < 0 ||
            (hit.canonicalUrl === best.hit.canonicalUrl &&
              ordinal < best.ordinal)))
      ) {
        best = { text: candidate, hit, score, ordinal };
      }
    }
  }

  if (!best || best.score <= 0) return undefined;
  const text =
    best.text.length <= MAX_GROUNDED_ANSWER_CHARS
      ? best.text
      : best.text.slice(0, MAX_GROUNDED_ANSWER_CHARS).trimEnd();
  return { text, hit: best.hit };
}

function evidenceFromHits(hits: readonly CorpusSearchHit[]): GroundedEvidence[] {
  return hits.map((hit) => ({
    chunkId: hit.chunkId,
    canonicalUrl: hit.canonicalUrl,
    text: hit.text,
    score: hit.score,
  }));
}

function claimTokens(value: string): string[] {
  return [...new Set(tokens(value))];
}

function numericClaims(value: string): string[] {
  return [
    ...new Set(
      normalize(value).match(/(?:£\s*)?\d+(?:[.,]\d+)?%?/g) ?? [],
    ),
  ];
}

/**
 * Conservative verifier for optional local/free-model synthesis.
 * Every meaningful answer token and every numeric claim must already exist
 * somewhere in the supplied evidence. Failure falls back to extractive text.
 */
export function verifyGroundedSynthesis(
  answer: string,
  evidence: readonly GroundedEvidence[],
): boolean {
  const trimmed = answer.trim();
  if (!trimmed || !evidence.length) return false;

  const corpus = normalize(evidence.map((item) => item.text).join("\n"));
  const corpusTokens = new Set(tokens(corpus));
  for (const token of claimTokens(trimmed)) {
    if (!corpusTokens.has(token)) return false;
  }
  for (const claim of numericClaims(trimmed)) {
    if (!corpus.includes(claim)) return false;
  }
  return true;
}

function notFound(): GroundedReceptionistAnswer {
  return {
    text:
      "I couldn't find that information in the reviewed website content I have available.",
    supportStatus: "not_found",
    source: "missing",
    sourceUrls: [],
    retrievedChunkIds: [],
    evidence: [],
  };
}

export async function answerGroundedReceptionistQuestion(
  question: string,
  options: GroundedAnswerOptions,
): Promise<GroundedReceptionistAnswer> {
  const facts = options.facts ?? {};
  const intent = exactIntent(question);

  if (intent === "hours" && facts.hours?.value) {
    if (!hoursAreSpeakable(facts.hours.value)) return notFound();
    return structuredAnswer(
      "structured.hours",
      facts.businessName?.value
        ? `${facts.businessName.value} opening hours are ${facts.hours.value}.`
        : `Opening hours are ${facts.hours.value}.`,
      facts.hours.sourceUrls,
    );
  }

  if (intent === "services" && facts.services?.value?.length) {
    return structuredAnswer(
      "structured.services",
      facts.businessName?.value
        ? `${facts.businessName.value} offers ${facts.services.value.join(", ")}.`
        : `Services include ${facts.services.value.join(", ")}.`,
      facts.services.sourceUrls,
    );
  }

  if (intent === "locations" && facts.locations?.value?.length) {
    return structuredAnswer(
      "structured.locations",
      `Locations on file: ${facts.locations.value.join(", ")}.`,
      facts.locations.sourceUrls,
    );
  }

  if (intent === "phones" && facts.phones?.value?.length) {
    return structuredAnswer(
      "structured.phones",
      `Contact telephone number${facts.phones.value.length === 1 ? "" : "s"}: ${facts.phones.value.join(", ")}.`,
      facts.phones.sourceUrls,
    );
  }

  if (intent === "emails" && facts.emails?.value?.length) {
    return structuredAnswer(
      "structured.emails",
      `Contact email${facts.emails.value.length === 1 ? "" : "s"}: ${facts.emails.value.join(", ")}.`,
      facts.emails.sourceUrls,
    );
  }

  const faq = matchStructuredFaq(question, facts.faqs ?? []);
  if (faq) {
    return structuredAnswer(
      "structured.faqs",
      faq.answer,
      faq.sourceUrls,
    );
  }

  const limit = Number.isFinite(options.retrievalLimit)
    ? Math.max(
        1,
        Math.min(
          DEFAULT_GROUNDED_RETRIEVAL_LIMIT,
          Math.trunc(options.retrievalLimit as number),
        ),
      )
    : DEFAULT_GROUNDED_RETRIEVAL_LIMIT;

  const hits = await options.index.search(options.crawlId, question, limit);
  if (!hits.length) return notFound();

  const meaningfulQueryTerms = new Set(tokens(question)).size;
  const requiredTermMatches = meaningfulQueryTerms >= 3 ? 2 : 1;
  const supportedHits = hits.filter(
    (hit) =>
      hit.matchedIdentifiers.length > 0 ||
      hit.matchedTerms.length >= requiredTermMatches,
  );
  if (!supportedHits.length) return notFound();

  const evidence = evidenceFromHits(supportedHits);
  const extractive = chooseExtractiveSpan(question, supportedHits);
  if (!extractive) return notFound();

  if (options.synthesizer) {
    const synthesized = await options.synthesizer({
      question,
      evidence,
    });
    if (
      typeof synthesized === "string" &&
      verifyGroundedSynthesis(synthesized, evidence)
    ) {
      return {
        text: synthesized.trim().slice(0, MAX_GROUNDED_ANSWER_CHARS),
        supportStatus: "supported",
        source: "corpus.synthesized",
        sourceUrls: uniqueUrls(supportedHits.map((hit) => hit.canonicalUrl)),
        retrievedChunkIds: supportedHits.map((hit) => hit.chunkId),
        evidence,
      };
    }
  }

  return {
    text: extractive.text,
    supportStatus: "supported",
    source: "corpus.extractive",
    sourceUrls: [extractive.hit.canonicalUrl],
    retrievedChunkIds: [extractive.hit.chunkId],
    evidence: [evidence.find((item) => item.chunkId === extractive.hit.chunkId)!],
  };
}
