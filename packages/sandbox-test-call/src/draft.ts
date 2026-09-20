import type { ReceptionistDraft } from "./types.ts";

const DRAFT_KEYS = [
  "businessName",
  "greeting",
  "hours",
  "services",
  "faqs",
] as const;

const MAX_DRAFT_FIELD = 4000;

export function asDraftString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_DRAFT_FIELD);
}

/** Copy only known draft strings. Missing keys stay empty — never invented. */
export function normalizeDraft(input: unknown): ReceptionistDraft {
  const src =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const nested =
    src.draft && typeof src.draft === "object" && !Array.isArray(src.draft)
      ? (src.draft as Record<string, unknown>)
      : src;
  const out: ReceptionistDraft = {
    businessName: "",
    greeting: "",
    hours: "",
    services: "",
    faqs: "",
  };
  for (const key of DRAFT_KEYS) {
    out[key] = asDraftString(nested[key]);
  }
  return out;
}

export function firstFaqPair(faqs: string): { question: string; answer: string } | null {
  const text = faqs.trim();
  if (!text) return null;
  const qa = text.match(/Q:\s*([\s\S]+?)\s*A:\s*([\s\S]+?)(?=\s*Q:|$)/i);
  if (qa) {
    return { question: qa[1].trim(), answer: qa[2].trim() };
  }
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (lines.length >= 2) {
    return { question: lines[0], answer: lines[1] };
  }
  return { question: "Do you have any frequently asked questions?", answer: text };
}
