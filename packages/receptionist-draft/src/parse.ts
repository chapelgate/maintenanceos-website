import {
  MAX_DRAFT_FIELD,
  type KnowledgeFaq,
} from "./types.ts";

export function asDraftText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_DRAFT_FIELD);
}

/** Split only on explicit list breaks. A single line stays one service. */
export function parseServices(raw: string): string[] {
  const text = asDraftText(raw);
  if (!text) return [];
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s+/, "").trim())
    .filter(Boolean);
  if (lines.length > 1) return lines.map((line) => line.slice(0, MAX_DRAFT_FIELD));
  if (text.includes(";")) {
    return text
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.slice(0, MAX_DRAFT_FIELD));
  }
  return [text];
}

/**
 * Parse FAQ notes. Invent nothing: unstructured text becomes a single
 * answer with no fabricated question.
 */
export function parseFaqs(raw: string): KnowledgeFaq[] {
  const text = asDraftText(raw);
  if (!text) return [];
  const pairs = [
    ...text.matchAll(/Q:\s*([\s\S]+?)\s*A:\s*([\s\S]+?)(?=\s*Q:|$)/gi),
  ];
  if (pairs.length) {
    return pairs.map((match) => {
      const item: KnowledgeFaq = {
        answer: (match[2] ?? "").trim().slice(0, MAX_DRAFT_FIELD),
      };
      const question = (match[1] ?? "").trim().slice(0, MAX_DRAFT_FIELD);
      if (question) item.question = question;
      return item;
    }).filter((item) => item.answer);
  }
  return [{ answer: text }];
}
