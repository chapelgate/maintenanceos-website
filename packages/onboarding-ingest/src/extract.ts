/**
 * Claims-safe extractors. Only copy values that are visibly present.
 * Never invent hours, services, FAQs, or a receptionist greeting.
 *
 * All returned strings are untrusted page data.
 */

import type { PartialDraft } from "./types.ts";

export const MAX_FIELD_CHARS = 4000;
export const USER_AGENT =
  "MaintenanceOS-OnboardingScan/0.1 (+https://github.com/chapelgate/maintenanceos-website; untrusted-data)";

const DAY_RE =
  /\b(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
const TIME_RE = /\b(\d{1,2}[:.]\d{2}|\d{1,2}\s?(am|pm))\b/i;

export function asUntrustedText(value: string, max = MAX_FIELD_CHARS): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

export function decodeEntities(raw: string): string {
  return raw
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    })
    .replace(/&#(\d+);/g, (_, dec: string) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    });
}

export function stripHtmlToText(html: string): string {
  const withoutNoise = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  return asUntrustedText(
    decodeEntities(withoutNoise.replace(/<[^>]+>/g, " ")),
  );
}

function firstMatch(html: string, re: RegExp): string | undefined {
  const m = re.exec(html);
  if (!m?.[1]) return undefined;
  const text = asUntrustedText(decodeEntities(m[1].replace(/<[^>]+>/g, " ")));
  return text || undefined;
}

export function extractTitle(html: string): string | undefined {
  return firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
}

export function extractH1(html: string): string | undefined {
  return firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
}

function metaContent(html: string, key: string): string | undefined {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta\\b[^>]*?(?:property|name)=["']${escaped}["'][^>]*?content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta\\b[^>]*?content=["']([^"']+)["'][^>]*?(?:property|name)=["']${escaped}["'][^>]*>`,
      "i",
    ),
  ];
  for (const re of patterns) {
    const m = re.exec(html);
    if (m?.[1]) {
      const text = asUntrustedText(decodeEntities(m[1]));
      if (text) return text;
    }
  }
  return undefined;
}

function parseJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      // Malformed JSON-LD is ignored — do not invent a parse.
    }
  }
  return blocks;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function flattenJsonLd(value: unknown, out: Record<string, unknown>[]): void {
  if (Array.isArray(value)) {
    for (const item of value) flattenJsonLd(item, out);
    return;
  }
  const rec = asRecord(value);
  if (!rec) return;
  out.push(rec);
  if (rec["@graph"] !== undefined) flattenJsonLd(rec["@graph"], out);
}

function typesOf(rec: Record<string, unknown>): string[] {
  const raw = rec["@type"];
  if (typeof raw === "string") return [raw.toLowerCase()];
  if (Array.isArray(raw)) {
    return raw
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.toLowerCase());
  }
  return [];
}

function stringField(value: unknown): string | undefined {
  if (typeof value === "string") {
    const text = asUntrustedText(value);
    return text || undefined;
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => (typeof item === "string" ? asUntrustedText(item) : ""))
      .filter(Boolean);
    return parts.length ? parts.join("\n") : undefined;
  }
  return undefined;
}

function nameOfOffer(value: unknown): string | undefined {
  const rec = asRecord(value);
  if (!rec) return stringField(value);
  return (
    stringField(rec.name) ||
    nameOfOffer(rec.itemOffered) ||
    stringField(rec.serviceType)
  );
}

function collectServices(rec: Record<string, unknown>, into: string[]): void {
  for (const key of ["makesOffer", "hasOfferCatalog", "hasOffer", "serviceType"]) {
    const value = rec[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        const recItem = asRecord(item);
        if (recItem && key === "hasOfferCatalog") {
          collectServices(recItem, into);
          continue;
        }
        if (recItem && Array.isArray(recItem.itemListElement)) {
          for (const el of recItem.itemListElement) {
            const name = nameOfOffer(el);
            if (name) into.push(name);
          }
          continue;
        }
        const name = nameOfOffer(item);
        if (name) into.push(name);
      }
    } else if (value !== undefined) {
      const recItem = asRecord(value);
      if (recItem) collectServices(recItem, into);
      const name = nameOfOffer(value);
      if (name) into.push(name);
    }
  }
}

function formatHoursSpec(value: unknown): string | undefined {
  const rec = asRecord(value);
  if (!rec) return stringField(value);
  const days = stringField(rec.dayOfWeek)?.replace(/https?:\/\/schema\.org\//g, "");
  const opens = stringField(rec.opens);
  const closes = stringField(rec.closes);
  if (days && opens && closes) return `${days} ${opens}–${closes}`;
  if (opens && closes) return `${opens}–${closes}`;
  return stringField(rec.description);
}

function collectHours(rec: Record<string, unknown>, into: string[]): void {
  const hours = stringField(rec.openingHours);
  if (hours) into.push(hours);
  const spec = rec.openingHoursSpecification;
  if (Array.isArray(spec)) {
    for (const item of spec) {
      const line = formatHoursSpec(item);
      if (line) into.push(line);
    }
  } else if (spec !== undefined) {
    const line = formatHoursSpec(spec);
    if (line) into.push(line);
  }
}

function collectFaqs(rec: Record<string, unknown>, into: string[]): void {
  const entities = rec.mainEntity;
  const list = Array.isArray(entities) ? entities : entities ? [entities] : [];
  for (const item of list) {
    const q = asRecord(item);
    if (!q) continue;
    const question = stringField(q.name) || stringField(q.question);
    const answerRec = asRecord(q.acceptedAnswer);
    const answer =
      (answerRec && (stringField(answerRec.text) || stringField(answerRec.name))) ||
      stringField(q.acceptedAnswer);
    if (question && answer) {
      into.push(`Q: ${question}\nA: ${answer}`);
    }
  }
}

export type JsonLdExtract = {
  businessName?: string;
  greeting?: string;
  hours?: string;
  services?: string;
  faqs?: string;
};

export function extractJsonLd(html: string): JsonLdExtract {
  const nodes: Record<string, unknown>[] = [];
  for (const block of parseJsonLdBlocks(html)) flattenJsonLd(block, nodes);

  let businessName: string | undefined;
  let greeting: string | undefined;
  const hours: string[] = [];
  const services: string[] = [];
  const faqs: string[] = [];

  for (const rec of nodes) {
    const types = typesOf(rec);
    const isOrg = types.some((t) =>
      [
        "organization",
        "localbusiness",
        "professionalservice",
        "homeandconstructionbusiness",
        "store",
      ].includes(t),
    );
    if (isOrg || types.length === 0) {
      businessName ||= stringField(rec.name);
      greeting ||= stringField(rec.slogan);
      collectHours(rec, hours);
      collectServices(rec, services);
    }
    if (types.includes("faqpage") || rec.mainEntity) {
      collectFaqs(rec, faqs);
    }
  }

  const unique = (items: string[]) => [...new Set(items)].slice(0, 16);

  return {
    businessName,
    greeting,
    hours: unique(hours).join("\n") || undefined,
    services: unique(services).join("\n") || undefined,
    faqs: unique(faqs).join("\n\n") || undefined,
  };
}

function headingSection(
  html: string,
  headingRe: RegExp,
  limit = 800,
): string | undefined {
  const heading = new RegExp(
    `<h[1-4]\\b[^>]*>\\s*(${headingRe.source})\\s*</h[1-4]>`,
    "i",
  );
  const m = heading.exec(html);
  if (!m || m.index === undefined) return undefined;
  const after = html.slice(m.index + m[0].length, m.index + m[0].length + 2500);
  const nextHeading = after.search(/<h[1-4]\b/i);
  const slice = after.slice(0, nextHeading === -1 ? after.length : nextHeading);
  const listItems = [
    ...slice.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi),
  ]
    .map((item) =>
      asUntrustedText(decodeEntities(item[1].replace(/<[^>]+>/g, " "))),
    )
    .filter(Boolean)
    .slice(0, 12);
  if (listItems.length >= 2) return listItems.join("\n");
  const text = stripHtmlToText(slice).slice(0, limit);
  return text || undefined;
}

function looksLikeHours(text: string): boolean {
  return DAY_RE.test(text) && TIME_RE.test(text);
}

function extractDetailsFaqs(html: string): string | undefined {
  const pairs = [
    ...html.matchAll(
      /<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi,
    ),
  ]
    .map((m) => {
      const q = asUntrustedText(decodeEntities(m[1].replace(/<[^>]+>/g, " ")));
      const a = asUntrustedText(decodeEntities(m[2].replace(/<[^>]+>/g, " ")));
      return q && a ? `Q: ${q}\nA: ${a}` : "";
    })
    .filter(Boolean)
    .slice(0, 12);
  return pairs.length ? pairs.join("\n\n") : undefined;
}

export function extractSameOriginHrefs(
  html: string,
  pageUrl: URL,
): string[] {
  const hrefs: string[] = [];
  const re = /<a\b[^>]*href=["']([^"'#]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const raw = m[1]?.trim();
    if (!raw || raw.startsWith("mailto:") || raw.startsWith("tel:")) continue;
    let next: URL;
    try {
      next = new URL(raw, pageUrl);
    } catch {
      continue;
    }
    if (next.protocol !== "https:") continue;
    if (next.hostname !== pageUrl.hostname) continue;
    next.hash = "";
    hrefs.push(next.toString());
  }
  return [...new Set(hrefs)];
}

const USEFUL_PATH = [
  { re: /\/(about|about-us|our-story)\/?$/i, weight: 10 },
  { re: /\/(services|our-services|what-we-do)\/?$/i, weight: 10 },
  { re: /\/(faq|faqs|frequently-asked-questions)\/?$/i, weight: 10 },
  { re: /\/(hours|opening-hours|openinghours|times)\/?$/i, weight: 9 },
  { re: /\/(contact|contact-us)\/?$/i, weight: 6 },
];

export function rankCandidateUrls(urls: string[], origin: URL): string[] {
  const scored = urls
    .map((raw) => {
      let url: URL;
      try {
        url = new URL(raw);
      } catch {
        return { raw, weight: 0 };
      }
      if (url.origin !== origin.origin) return { raw, weight: 0 };
      const path = url.pathname.replace(/\/+$/, "") || "/";
      const originPath = origin.pathname.replace(/\/+$/, "") || "/";
      if (path === "/" || path === originPath) {
        return { raw, weight: 0 };
      }
      const hit = USEFUL_PATH.find((item) => item.re.test(path));
      return { raw: url.toString(), weight: hit?.weight ?? 0 };
    })
    .filter((item) => item.weight > 0);
  scored.sort((a, b) => b.weight - a.weight);
  return [...new Set(scored.map((item) => item.raw))];
}

export function extractDraftFromHtml(
  pages: { url: string; html: string }[],
): { draft: PartialDraft; warnings: string[] } {
  const draft: PartialDraft = {};
  const warnings: string[] = [];
  const jsonLdHours: string[] = [];
  const jsonLdServices: string[] = [];
  const jsonLdFaqs: string[] = [];

  for (const page of pages) {
    const jsonLd = extractJsonLd(page.html);
    draft.businessName ||= jsonLd.businessName;
    draft.greeting ||= jsonLd.greeting;
    if (jsonLd.hours) jsonLdHours.push(jsonLd.hours);
    if (jsonLd.services) jsonLdServices.push(jsonLd.services);
    if (jsonLd.faqs) jsonLdFaqs.push(jsonLd.faqs);
  }

  if (!draft.businessName) {
    for (const page of pages) {
      draft.businessName =
        metaContent(page.html, "og:site_name") ||
        extractTitle(page.html) ||
        extractH1(page.html);
      if (draft.businessName) break;
    }
  }

  if (!draft.hours) {
    draft.hours = uniqueJoin(jsonLdHours);
  }
  if (!draft.hours) {
    for (const page of pages) {
      const section = headingSection(
        page.html,
        /opening hours|business hours|our hours|office hours/,
      );
      if (section && looksLikeHours(section)) {
        draft.hours = section;
        break;
      }
    }
  }

  if (!draft.services) {
    draft.services = uniqueJoin(jsonLdServices);
  }
  if (!draft.services) {
    for (const page of pages) {
      const section = headingSection(
        page.html,
        /our services|services we offer|what we do|services/,
      );
      if (section && section.split("\n").length >= 2) {
        draft.services = section;
        break;
      }
    }
  }

  if (!draft.faqs) {
    draft.faqs = uniqueJoin(jsonLdFaqs, "\n\n");
  }
  if (!draft.faqs) {
    for (const page of pages) {
      const details = extractDetailsFaqs(page.html);
      if (details) {
        draft.faqs = details;
        break;
      }
    }
  }

  if (draft.businessName && /[|]/.test(draft.businessName)) {
    const siteName = pages
      .map((page) => metaContent(page.html, "og:site_name"))
      .find(Boolean);
    if (siteName) draft.businessName = siteName;
  }

  if (!draft.greeting) {
    warnings.push("greeting_not_found");
  }
  if (!draft.businessName) warnings.push("business_name_not_found");
  if (!draft.hours) warnings.push("hours_not_found");
  if (!draft.services) warnings.push("services_not_found");
  if (!draft.faqs) warnings.push("faqs_not_found");
  warnings.push("untrusted_crawl_text");

  return { draft: omitEmpty(draft), warnings };
}

function uniqueJoin(items: string[], sep = "\n"): string | undefined {
  const unique = [...new Set(items.map((item) => item.trim()).filter(Boolean))];
  return unique.length ? unique.join(sep).slice(0, MAX_FIELD_CHARS) : undefined;
}

function omitEmpty(draft: PartialDraft): PartialDraft {
  const out: PartialDraft = {};
  for (const [key, value] of Object.entries(draft) as [keyof PartialDraft, string | undefined][]) {
    if (value && value.trim()) out[key] = value.trim().slice(0, MAX_FIELD_CHARS);
  }
  return out;
}
