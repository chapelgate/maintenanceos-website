import { publicBusinessName, type FieldConfidence } from "./extract.ts";

export const GOLDEN_MIN_CORRECT_RATE = 0.47;
export const GOLDEN_MAX_WRONG_RATE = 0.03;
export const GOLDEN_MAX_OK_RESPONSE_MS = 25_000;

export type GoldenGrade = "correct" | "partial" | "missing" | "wrong";

export type GoldenFieldExpect = {
  value?: string | string[] | Array<{ question: string; answer: string }>;
  /** Extra accepted spellings. A hit on any of these is correct. */
  accept?: string[];
};

export type GoldenSiteExpect = {
  id: string;
  url: string;
  fields: Partial<
    Record<
      "name" | "phone" | "email" | "address" | "hours" | "services" | "area" | "faqs",
      GoldenFieldExpect
    >
  >;
};

export type GoldenExpectedFile = {
  version: 1;
  thresholds?: {
    minCorrectRate?: number;
    maxWrongRate?: number;
    maxOkResponseMs?: number;
  };
  sites: GoldenSiteExpect[];
};

export type GoldenActual = {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  hoursConfidence?: FieldConfidence;
  services?: string[];
  area?: string[];
  faqs?: Array<{ question: string; answer: string }>;
};

const NAME_JUNK_RE =
  /\.(?:jpe?g|png|gif|webp|svg|ico|pdf|docx?|html?)$/i;

export function goldenNameJunk(name: string | undefined): boolean {
  const text = name?.trim() ?? "";
  if (!text) return false;
  if (text.length > 60 || NAME_JUNK_RE.test(text)) return true;
  if (/[.!?]$/.test(text) || /\b(?:are|is|we|provide)\b/i.test(text)) return true;
  return publicBusinessName(text) === undefined && !/\s/.test(text);
}

export function goldenHoursJunk(hours: string | undefined, confidence?: FieldConfidence): boolean {
  const text = hours?.trim() ?? "";
  if (!text) return false;
  const placeholder = /\b00:00\s*(?:-|–|—|to)\s*(?:23:59|00:00)\b/i.test(text);
  const alwaysOpen = /\b(?:24\s*\/\s*7|24\s*hours|open\s*24)\b/i.test(text);
  if (placeholder && !alwaysOpen) return true;
  if (/\bweekdays?\b/i.test(text)) return false;
  if (/\b(?:monday|mon(?:day)?)\s*(?:to|-|–|—)\s*(?:friday|fri(?:day)?)\b/i.test(text)) return false;
  const days = new Set(
    (text.toLowerCase().match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/g) ?? [])
      .map((day) => day.slice(0, 3)),
  );
  if (days.size === 0 || days.size >= 5) return false;
  return confidence !== "low";
}

export function goldenServicesJunk(services: readonly string[] | undefined): boolean {
  return (services ?? []).some((item) =>
    /@|\[email\s+protected\]|\[at\]|\(at\)|\bemail\s+protected\b/i.test(item) ||
    /(?:\+?44|0)\d[\d\s()-]{8,}/.test(item) ||
    /\b(?:cookies?\s+policy|complaints?\s+procedure|privacy|guides?)\b/i.test(item),
  );
}

export function goldenJunkFailures(actual: GoldenActual): string[] {
  const failures: string[] = [];
  if (goldenNameJunk(actual.name)) failures.push("name_junk");
  if (goldenHoursJunk(actual.hours, actual.hoursConfidence)) failures.push("hours_junk");
  if (goldenServicesJunk(actual.services)) failures.push("services_contact");
  return failures;
}

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function asList(value: GoldenFieldExpect["value"]): string[] {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value;
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "string" ? item : `${item.question} ${item.answer}`,
    );
  }
  return [];
}

export function gradeGoldenField(
  actual: string | string[] | undefined,
  expect: GoldenFieldExpect | undefined,
): GoldenGrade {
  const got = (Array.isArray(actual) ? actual : actual ? [actual] : [])
    .map((item) => item.trim())
    .filter(Boolean);
  if (!expect) return got.length ? "wrong" : "missing";
  const wanted = [...asList(expect.value), ...(expect.accept ?? [])].map(norm).filter(Boolean);
  if (!wanted.length) return got.length ? "wrong" : "missing";
  if (!got.length) return "missing";
  const gotNorm = got.map(norm);
  if (gotNorm.every((item) => wanted.includes(item)) && wanted.every((item) => gotNorm.includes(item) || expect.accept?.map(norm).includes(item))) {
    return "correct";
  }
  if (gotNorm.some((item) => wanted.includes(item))) return "partial";
  return "wrong";
}

export function gradeGoldenSite(
  actual: GoldenActual,
  expect: GoldenSiteExpect,
): Record<string, GoldenGrade> {
  return {
    name: gradeGoldenField(actual.name, expect.fields.name),
    phone: gradeGoldenField(actual.phone, expect.fields.phone),
    email: gradeGoldenField(actual.email, expect.fields.email),
    address: gradeGoldenField(actual.address, expect.fields.address),
    hours: gradeGoldenField(actual.hours, expect.fields.hours),
    services: gradeGoldenField(actual.services, expect.fields.services),
    area: gradeGoldenField(actual.area, expect.fields.area),
    faqs: gradeGoldenField(
      actual.faqs?.map((item) => `${item.question} ${item.answer}`),
      expect.fields.faqs,
    ),
  };
}

export function assertGoldenRates(input: {
  correct: number;
  wrong: number;
  total: number;
  minCorrectRate?: number;
  maxWrongRate?: number;
}): void {
  if (input.total <= 0) throw new Error("golden grade has no fields");
  const correctRate = input.correct / input.total;
  const wrongRate = input.wrong / input.total;
  const minCorrect = input.minCorrectRate ?? GOLDEN_MIN_CORRECT_RATE;
  const maxWrong = input.maxWrongRate ?? GOLDEN_MAX_WRONG_RATE;
  if (correctRate < minCorrect) {
    throw new Error(`golden correct rate ${correctRate.toFixed(3)} is below ${minCorrect}`);
  }
  if (wrongRate > maxWrong) {
    throw new Error(`golden wrong rate ${wrongRate.toFixed(3)} is above ${maxWrong}`);
  }
}

export function assertCanaryTimings(
  responses: readonly { status: number; ms: number }[],
  maxOkResponseMs = GOLDEN_MAX_OK_RESPONSE_MS,
): void {
  for (const response of responses) {
    if (response.status === 200 && response.ms > maxOkResponseMs) {
      throw new Error(`live canary HTTP 200 took ${response.ms}ms`);
    }
  }
}

export function validateGoldenExpected(value: unknown): GoldenExpectedFile {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("golden expected file must be an object");
  }
  const record = value as { version?: unknown; sites?: unknown };
  if (record.version !== 1) throw new Error("golden expected version must be 1");
  if (!Array.isArray(record.sites)) throw new Error("golden expected sites must be an array");
  for (const site of record.sites) {
    if (!site || typeof site !== "object") throw new Error("golden site must be an object");
    const item = site as { id?: unknown; url?: unknown; fields?: unknown };
    if (typeof item.id !== "string" || !item.id.trim()) throw new Error("golden site id is required");
    if (typeof item.url !== "string" || !item.url.startsWith("https://")) {
      throw new Error(`golden site ${item.id} url must be https`);
    }
    if (!item.fields || typeof item.fields !== "object" || Array.isArray(item.fields)) {
      throw new Error(`golden site ${item.id} fields must be an object`);
    }
  }
  return value as GoldenExpectedFile;
}
