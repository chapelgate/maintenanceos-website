/**
 * Claims-safe extractors. Only copy values that are visibly present.
 * Never invent hours, services, FAQs, or a receptionist greeting.
 *
 * All returned strings are untrusted page data.
 */

import type {
  BusinessFactMeta,
  BusinessFacts,
  DraftFieldMeta,
  FieldConfidence,
  FieldSource,
  PartialDraft,
} from "./types.ts";

export const MAX_FIELD_CHARS = 4000;
export const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 MaintenanceOS-OnboardingScan/0.1";

const DAY_RE =
  /\b(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekdays?|weekends?)\b/i;
const TIME_RE = /\b(\d{1,2}[:.]\d{2}|\d{1,2}\s?(am|pm))\b/i;
const TIME_RANGE_RE =
  /\d{1,2}(?:[:.]\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)?\s*(?:-|–|—|to)\s*\d{1,2}(?:[:.]\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)?/i;
const ALL_HOURS_RE =
  /\b(open(?:ing)?(?:\s+hours)?|hours).{0,24}(24\s*\/\s*7|24\s*hours)\b|\b(24\s*\/\s*7|24\s*hours).{0,24}(open(?:ing)?|hours)\b/i;

const GENERIC_NAME_RE = /^(home|welcome|untitled|index|website)$/i;
const GENERIC_NAV_RE =
  /^(home|homepage|about(?: us)?|our story|contact(?: us)?|get in touch|stay in touch|support us|connect|links|residents?|blog|news|privacy(?: policy)?|terms(?: of (?:service|use)?)?|login|log in|sign in|sign up|register|cart|basket|checkout|faqs?|gallery|testimonials?|reviews?|careers?|jobs?|book now|get a quote|request a quote|menu|skip to (?:content|main)|cookies?|(?:our )?services)$/i;
const CTA_QUESTION_RE = /^(ready to|get started|cookie|subscribe|sign up)/i;

const BUSINESS_ITEMTYPE_RE =
  /schema\.org\/(LocalBusiness|Organization|ProfessionalService|Store|Plumber|Electrician|Locksmith|RoofingContractor|HVACBusiness|GeneralContractor|HomeAndConstructionBusiness|Attorney|Dentist|Physician|AutoRepair|FoodEstablishment)\b/i;

const BUSINESS_TYPES = new Set([
  "organization",
  "localbusiness",
  "professionalservice",
  "homeandconstructionbusiness",
  "store",
  "plumber",
  "electrician",
  "locksmith",
  "roofingcontractor",
  "hvacbusiness",
  "generalcontractor",
  "emergency",
  "attorney",
  "dentist",
  "physician",
  "autorepair",
  "foodestablishment",
]);

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

function innerText(fragment: string): string {
  return asUntrustedText(decodeEntities(fragment.replace(/<[^>]+>/g, " ")));
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

function schemaDayToken(value: string): string {
  return asUntrustedText(value.replace(/https?:\/\/schema\.org\//gi, ""));
}

function daysFromSchema(value: unknown): string | undefined {
  if (typeof value === "string") {
    const text = schemaDayToken(value);
    return text || undefined;
  }
  if (Array.isArray(value)) {
    const days = value
      .map((item) => (typeof item === "string" ? schemaDayToken(item) : ""))
      .filter(Boolean);
    return days.length ? days.join(", ") : undefined;
  }
  return undefined;
}

function formatHoursSpec(value: unknown): string | undefined {
  const rec = asRecord(value);
  if (!rec) return stringField(value);
  const days = daysFromSchema(rec.dayOfWeek);
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

function pushContactValue(value: unknown, into: string[]): void {
  if (typeof value === "string") {
    const text = asUntrustedText(value);
    if (text) into.push(text);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) pushContactValue(item, into);
    return;
  }
  const rec = asRecord(value);
  if (!rec) return;
  if (rec.telephone !== undefined) pushContactValue(rec.telephone, into);
  if (rec.email !== undefined) pushContactValue(rec.email, into);
}

function collectContact(
  rec: Record<string, unknown>,
  phones: string[],
  emails: string[],
): void {
  if (rec.telephone !== undefined) pushContactValue(rec.telephone, phones);
  if (rec.email !== undefined) pushContactValue(rec.email, emails);
  if (rec.contactPoint !== undefined) {
    const points = Array.isArray(rec.contactPoint)
      ? rec.contactPoint
      : [rec.contactPoint];
    for (const point of points) {
      const recPoint = asRecord(point);
      if (!recPoint) continue;
      if (recPoint.telephone !== undefined) {
        pushContactValue(recPoint.telephone, phones);
      }
      if (recPoint.email !== undefined) pushContactValue(recPoint.email, emails);
    }
  }
}


function countryText(value: unknown): string | undefined {
  const direct = stringField(value);
  if (direct) return direct;
  const rec = asRecord(value);
  if (!rec) return undefined;
  return stringField(rec.name);
}

function formatPostalAddress(value: unknown): string | undefined {
  const direct = stringField(value);
  if (direct) return direct;
  const rec = asRecord(value);
  if (!rec) return undefined;
  const parts = [
    stringField(rec.streetAddress),
    stringField(rec.addressLocality),
    stringField(rec.addressRegion),
    stringField(rec.postalCode),
    countryText(rec.addressCountry),
  ].filter((item): item is string => Boolean(item));
  return parts.length ? asUntrustedText(parts.join(", "), 500) : undefined;
}

function locationText(value: unknown): string | undefined {
  const direct = stringField(value);
  if (direct) return direct;
  const rec = asRecord(value);
  if (!rec) return undefined;
  return formatPostalAddress(rec.address) || formatPostalAddress(rec) || stringField(rec.name);
}

function collectLocations(rec: Record<string, unknown>, into: string[]): void {
  for (const key of ["address", "location", "areaServed"]) {
    const value = rec[key];
    const list = Array.isArray(value) ? value : value !== undefined ? [value] : [];
    for (const item of list) {
      const text = locationText(item);
      if (text) into.push(text);
    }
  }
}

function isBusinessNode(rec: Record<string, unknown>): boolean {
  const types = typesOf(rec);
  if (types.some((t) => BUSINESS_TYPES.has(t) || t.includes("business"))) {
    return true;
  }
  if (types.includes("faqpage") || types.includes("question") || types.includes("webpage")) {
    return false;
  }
  if (
    rec.openingHours !== undefined ||
    rec.openingHoursSpecification !== undefined ||
    rec.makesOffer !== undefined ||
    rec.telephone !== undefined
  ) {
    return types.length === 0;
  }
  return types.length === 0 && typeof rec.name === "string";
}

export type JsonLdExtract = {
  businessName?: string;
  greeting?: string;
  hours?: string;
  services?: string;
  faqs?: string;
  locations: string[];
  phones: string[];
  emails: string[];
};

export function extractJsonLd(html: string): JsonLdExtract {
  const nodes: Record<string, unknown>[] = [];
  for (const block of parseJsonLdBlocks(html)) flattenJsonLd(block, nodes);

  let businessName: string | undefined;
  let greeting: string | undefined;
  const hours: string[] = [];
  const services: string[] = [];
  const faqs: string[] = [];
  const locations: string[] = [];
  const phones: string[] = [];
  const emails: string[] = [];

  for (const rec of nodes) {
    const types = typesOf(rec);
    if (isBusinessNode(rec)) {
      businessName ||= stringField(rec.name);
      greeting ||= stringField(rec.slogan);
      collectHours(rec, hours);
      collectServices(rec, services);
      collectContact(rec, phones, emails);
      collectLocations(rec, locations);
    }
    if (types.includes("contactpoint")) {
      collectContact(rec, phones, emails);
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
    locations: unique(locations),
    phones: unique(phones),
    emails: unique(emails),
  };
}

function itempropValues(html: string, prop: string): string[] {
  const escaped = prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const found: string[] = [];
  const patterns = [
    new RegExp(
      `itemprop=["']${escaped}["'][^>]*content=["']([^"']+)["']`,
      "gi",
    ),
    new RegExp(
      `content=["']([^"']+)["'][^>]*itemprop=["']${escaped}["']`,
      "gi",
    ),
    new RegExp(
      `<([a-z0-9]+)\\b[^>]*itemprop=["']${escaped}["'][^>]*>([\\s\\S]*?)</\\1>`,
      "gi",
    ),
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const raw = m[2] ?? m[1];
      if (!raw) continue;
      const text = innerText(raw);
      if (text) found.push(text);
    }
  }
  return [...new Set(found)];
}

function businessMicrodataSlice(html: string): string | undefined {
  const match = BUSINESS_ITEMTYPE_RE.exec(html);
  if (!match || match.index === undefined) return undefined;
  return html.slice(match.index, match.index + 12_000);
}

export type MicrodataExtract = {
  businessName?: string;
  greeting?: string;
  hours?: string;
  services?: string;
  locations: string[];
  phones: string[];
  emails: string[];
};

export function extractMicrodata(html: string): MicrodataExtract {
  const scoped = businessMicrodataSlice(html);
  const hoursSrc = scoped ?? html;
  const addressParts = [
    itempropValues(hoursSrc, "streetAddress")[0],
    itempropValues(hoursSrc, "addressLocality")[0],
    itempropValues(hoursSrc, "addressRegion")[0],
    itempropValues(hoursSrc, "postalCode")[0],
    itempropValues(hoursSrc, "addressCountry")[0],
  ].filter((item): item is string => Boolean(item));
  const locations = [
    ...(addressParts.length ? [asUntrustedText(addressParts.join(", "), 500)] : []),
    ...itempropValues(hoursSrc, "areaServed"),
  ].filter(Boolean);
  const name = scoped
    ? itempropValues(scoped, "name")[0]
    : undefined;
  const slogan = itempropValues(scoped ?? html, "slogan")[0];
  const hours = uniqueJoin(itempropValues(hoursSrc, "openingHours"));
  const services = uniqueJoin(itempropValues(hoursSrc, "serviceType"));
  return {
    businessName: name && !isGenericName(name) ? name : undefined,
    greeting: slogan,
    hours,
    services,
    locations: [...new Set(locations)].slice(0, 16),
    phones: itempropValues(html, "telephone").slice(0, 4),
    emails: itempropValues(html, "email").slice(0, 4),
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
    .map((item) => innerText(item[1]))
    .filter(Boolean)
    .slice(0, 12);
  if (listItems.length >= 2) return listItems.join("\n");
  const text = stripHtmlToText(slice).slice(0, limit);
  if (!text) return undefined;
  if (text.split("\n").length >= 2) return text;
  if (text.length >= 24) return text;
  return undefined;
}

function looksLikeHours(text: string): boolean {
  return DAY_RE.test(text) && TIME_RE.test(text);
}

function looksLikeHoursPattern(text: string): boolean {
  if (text.length < 8 || text.length > 140) return false;
  if (ALL_HOURS_RE.test(text)) return true;
  if (!DAY_RE.test(text) || !TIME_RE.test(text)) return false;
  if (TIME_RANGE_RE.test(text)) return true;
  return /\b(open(?:ing)?|hours|closed)\b/i.test(text);
}

function extractTableHours(html: string): string[] {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  const out: string[] = [];
  for (const row of rows) {
    const cells = [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map((cell) => innerText(cell[1]))
      .filter(Boolean);
    const line = cells.join(" ");
    if (looksLikeHoursPattern(line)) out.push(line);
  }
  return out.slice(0, 8);
}

function extractHoursFromVisibleText(html: string): string | undefined {
  const fromTable = extractTableHours(html);
  const text = stripHtmlToText(html);
  const hits: string[] = [...fromTable];
  const day = new RegExp(DAY_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = day.exec(text))) {
    const window = text.slice(m.index, m.index + 90).replace(/\s+/g, " ").trim();
    const range = TIME_RANGE_RE.exec(window);
    if (!range) continue;
    const rangeEnd = (range.index ?? 0) + range[0].length;
    const snippet = asUntrustedText(
      window.slice(0, rangeEnd).replaceAll("�", "–"),
      140,
    );
    if (looksLikeHoursPattern(snippet)) hits.push(snippet);
    if (hits.length >= 12) break;
  }
  if (ALL_HOURS_RE.test(text)) {
    const all = text.match(ALL_HOURS_RE);
    if (all?.[0]) hits.push(asUntrustedText(all[0]));
  }
  const distinct = hits.filter(
    (item, index, all) =>
      !all.some(
        (other, otherIndex) =>
          otherIndex != index &&
          other.length > item.length &&
          other.toLowerCase().includes(item.toLowerCase()),
      ),
  );
  return uniqueJoin(distinct);
}

function extractNavBlocks(html: string): string[] {
  const blocks: string[] = [];
  for (const re of [
    /<nav\b[^>]*>([\s\S]*?)<\/nav>/gi,
    /<([a-z0-9]+)\b[^>]*role=["']navigation["'][^>]*>([\s\S]*?)<\/\1>/gi,
    /<header\b[^>]*>([\s\S]*?)<\/header>/gi,
    /<ul\b[^>]*class=["'][^"']*\b(?:nav|menu|navbar)[^"']*["'][^>]*>([\s\S]*?)<\/ul>/gi,
  ]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const body = m[2] ?? m[1];
      if (body) blocks.push(body);
    }
  }
  return blocks;
}

export function extractServicesFromNav(html: string): string | undefined {
  const labels: string[] = [];
  for (const block of extractNavBlocks(html)) {
    for (const match of block.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
      const label = innerText(match[1]);
      if (label.length < 2 || label.length > 60) continue;
      if (GENERIC_NAV_RE.test(label)) continue;
      if (/https?:/i.test(label)) continue;
      if (isPlausiblePhone(label) || isPlausibleEmail(label)) continue;
      labels.push(label);
    }
  }
  const unique = [...new Set(labels)].slice(0, 12);
  if (unique.length < 2) return undefined;
  return unique.join("\n");
}

function extractServiceSubheadings(html: string): string | undefined {
  const heading =
    /<h([1-3])\b[^>]*>\s*(?:our\s+)?(?:services?|accomm?odation|housing options?|support services?|what we (?:do|offer|provide))\s*<\/h\1>/i;
  const m = heading.exec(html);
  if (!m || m.index === undefined) return undefined;
  const level = Number(m[1]);
  const after = html.slice(
    m.index + m[0].length,
    m.index + m[0].length + 16_000,
  );
  const next = after.search(new RegExp(`<h[1-${level}]\\b`, "i"));
  const section = after.slice(0, next === -1 ? after.length : next);
  const labels = [
    ...section.matchAll(/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi),
  ]
    .map((item) => innerText(item[2]))
    .filter(
      (item) =>
        item.length >= 2 &&
        item.length <= 80 &&
        !GENERIC_NAV_RE.test(item),
    );
  const unique = [...new Set(labels)].slice(0, 24);
  return unique.length >= 2 ? unique.join("\n") : undefined;
}

function looksLikeQuestion(text: string): boolean {
  if (text.length < 6 || text.length > 160) return false;
  if (CTA_QUESTION_RE.test(text)) return false;
  if (/\?/.test(text)) return true;
  return /^(do|does|did|is|are|can|will|what|when|where|who|why|how|should)\b/i.test(
    text,
  );
}

function extractDetailsFaqs(html: string): string | undefined {
  const pairs = [
    ...html.matchAll(
      /<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi,
    ),
  ]
    .map((m) => {
      const q = innerText(m[1]);
      const a = innerText(m[2]);
      return q && a ? `Q: ${q}\nA: ${a}` : "";
    })
    .filter(Boolean)
    .slice(0, 12);
  return pairs.length ? pairs.join("\n\n") : undefined;
}

function extractDtDdFaqs(html: string): string | undefined {
  const pairs = [
    ...html.matchAll(
      /<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi,
    ),
  ]
    .map((m) => {
      const q = innerText(m[1]);
      const a = innerText(m[2]);
      if (!looksLikeQuestion(q) || !a || a.length < 8) return "";
      return `Q: ${q}\nA: ${a}`;
    })
    .filter(Boolean)
    .slice(0, 12);
  return pairs.length >= 2 ? pairs.join("\n\n") : undefined;
}

function extractQuestionHeadingFaqs(html: string): string | undefined {
  const pairs = [
    ...html.matchAll(
      /<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>\s*<(p|div)\b[^>]*>([\s\S]*?)<\/\3>/gi,
    ),
  ]
    .map((m) => {
      const q = innerText(m[2]);
      const a = innerText(m[4]);
      if (!looksLikeQuestion(q) || !a || a.length < 8) return "";
      return `Q: ${q}\nA: ${a}`;
    })
    .filter(Boolean)
    .slice(0, 12);
  return pairs.length >= 2 ? pairs.join("\n\n") : undefined;
}

function extractAriaFaqs(html: string): string | undefined {
  const pairs = [
    ...html.matchAll(
      /<button\b[^>]*aria-expanded=["'][^"']+["'][^>]*>([\s\S]*?)<\/button>\s*<([a-z0-9]+)\b[^>]*>([\s\S]*?)<\/\2>/gi,
    ),
  ]
    .map((m) => {
      const q = innerText(m[1]);
      const a = innerText(m[3]);
      if (!looksLikeQuestion(q) || !a || a.length < 8) return "";
      return `Q: ${q}\nA: ${a}`;
    })
    .filter(Boolean)
    .slice(0, 12);
  return pairs.length >= 2 ? pairs.join("\n\n") : undefined;
}

function extractHeuristicFaqs(
  html: string,
): { text: string; source: FieldSource } | undefined {
  const details = extractDetailsFaqs(html);
  if (details) return { text: details, source: "details" };
  const aria = extractAriaFaqs(html);
  if (aria) return { text: aria, source: "details" };
  const dtdd = extractDtDdFaqs(html);
  if (dtdd) return { text: dtdd, source: "heading" };
  const headings = extractQuestionHeadingFaqs(html);
  if (headings) return { text: headings, source: "heading" };
  return undefined;
}

function isPlausiblePhone(value: string): boolean {
  const text = asUntrustedText(value, 80);
  if (!/^\+?[\d\s().-]+$/.test(text)) return false;
  const digits = text.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function phoneIdentity(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0044") && digits.length >= 12) return "0" + digits.slice(4);
  if (digits.startsWith("44") && digits.length >= 11) return "0" + digits.slice(2);
  return digits;
}

function dedupePhones(values: string[], max = 8): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const text = asUntrustedText(value, 80);
    if (!isPlausiblePhone(text)) continue;
    const key = phoneIdentity(text);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= max) break;
  }
  return out;
}

function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 120;
}

export function extractTelMailto(html: string): {
  phones: string[];
  emails: string[];
} {
  const phones: string[] = [];
  const emails: string[] = [];

  const telAnchors = html.matchAll(
    /<a\b[^>]*href=["']tel:([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  );
  for (const m of telAnchors) {
    const href = decodeEntities(decodeURIComponent(safeDecode(m[1])));
    const label = innerText(m[2]);
    const candidate = isPlausiblePhone(label) ? label : asUntrustedText(href);
    if (candidate && isPlausiblePhone(candidate)) phones.push(candidate);
  }

  const mailto = html.matchAll(/href=["']mailto:([^"'?]+)["']/gi);
  for (const m of mailto) {
    const email = asUntrustedText(decodeEntities(safeDecode(m[1])));
    if (email && isPlausibleEmail(email)) emails.push(email);
  }

  return {
    phones: [...new Set(phones)].slice(0, 4),
    emails: [...new Set(emails)].slice(0, 4),
  };
}

function safeDecode(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

const UK_POSTCODE_RE =
  /\b(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i;

function headingSectionHtml(
  html: string,
  headingRe: RegExp,
  maxChars = 8000,
): string | undefined {
  const heading = new RegExp(
    `<h([1-4])\\b[^>]*>\\s*(${headingRe.source})\\s*</h\\1>`,
    "i",
  );
  const m = heading.exec(html);
  if (!m || m.index === undefined) return undefined;
  const level = Number(m[1]);
  const after = html.slice(
    m.index + m[0].length,
    m.index + m[0].length + maxChars,
  );
  const next = after.search(new RegExp(`<h[1-${level}]\\b`, "i"));
  return after.slice(0, next === -1 ? after.length : next);
}

function visibleBlocks(fragment: string): string[] {
  const blocks: string[] = [];
  for (const match of fragment.matchAll(
    /<(p|address|li)\b[^>]*>([\s\S]*?)<\/\1>/gi,
  )) {
    const text = innerText(match[2]);
    if (text) blocks.push(text);
  }
  return blocks;
}

function visiblePhoneCandidates(text: string): string[] {
  const matches =
    text.match(/(?:\+?44\s?(?:\(0\)\s?)?|0)[\d\s().-]{7,}\d/g) ?? [];
  return dedupePhones(matches, 8);
}

function visibleEmailCandidates(text: string): string[] {
  const matches =
    text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  return [
    ...new Set(
      matches
        .map((item) => asUntrustedText(item, 120))
        .filter(isPlausibleEmail),
    ),
  ].slice(0, 8);
}

/**
 * Conservative fallback for ordinary visible contact blocks when a site does
 * not use schema.org, tel:, or mailto:. Values are copied only when they
 * visibly match a phone/email/UK-postcode pattern.
 */
export function extractVisibleContactSection(html: string): {
  phones: string[];
  emails: string[];
  locations: string[];
} {
  const fragment = headingSectionHtml(
    html,
    /contact us|contact details|get in touch|find us/,
  );
  if (!fragment) return { phones: [], emails: [], locations: [] };

  const blocks = visibleBlocks(fragment);
  const phones = dedupePhones(
    blocks.flatMap((block) => visiblePhoneCandidates(block)),
    8,
  );
  const emails = [
    ...new Set(blocks.flatMap((block) => visibleEmailCandidates(block))),
  ].slice(0, 8);
  const locations = [
    ...new Set(
      blocks
        .filter((block) => UK_POSTCODE_RE.test(block))
        .map((block) => asUntrustedText(block, 500))
        .filter((block) => block.length >= 8 && block.length <= 500),
    ),
  ].slice(0, 16);

  return { phones, emails, locations };
}

function formatContactHints(phones: string[], emails: string[]): string | undefined {
  const lines: string[] = [];
  for (const phone of [...new Set(phones)].slice(0, 4)) {
    if (isPlausiblePhone(phone)) lines.push(`Phone: ${phone}`);
  }
  for (const email of [...new Set(emails)].slice(0, 4)) {
    if (isPlausibleEmail(email)) lines.push(`Email: ${email}`);
  }
  return lines.length ? lines.join("\n") : undefined;
}

function cleanedTitleName(html: string): string | undefined {
  const title = extractTitle(html);
  if (!title) return undefined;
  const first = title.split(/\s*[|–—]\s*/)[0]?.trim();
  const candidate = first && first.length >= 2 && first.length <= 80 ? first : title;
  return candidate && !isGenericName(candidate) ? candidate : undefined;
}

function isGenericName(name: string): boolean {
  return GENERIC_NAME_RE.test(name.trim());
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
  { re: /\/(services|our-services|what-we-do|what-we-offer)\/?$/i, weight: 10 },
  {
    re: /\/(living-with-us|supported-housing|housing-options|accommodation|our-accommodation)\/?$/i,
    weight: 9,
  },
  { re: /\/(faq|faqs|frequently-asked-questions)\/?$/i, weight: 10 },
  { re: /\/(hours|opening-hours|openinghours|times)\/?$/i, weight: 9 },
  { re: /\/(contact|contact-us)\/?$/i, weight: 8 },
  { re: /\/(residents|rough-sleeping|report-rough-sleeping)\/?$/i, weight: 5 },
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
      url.hash = "";
      // Query variants of the same content waste a bounded crawl slot.
      // Crawl the canonical path once so another useful page can be scanned.
      url.search = "";
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

function setField(
  draft: PartialDraft,
  fieldMeta: DraftFieldMeta,
  key: keyof PartialDraft,
  value: string | undefined,
  source: FieldSource,
  confidence: FieldConfidence,
): void {
  if (!value || draft[key]) return;
  draft[key] = value;
  fieldMeta[key] = { source, confidence };
}

function parseFaqFacts(value: string | undefined): Array<{ question: string; answer: string }> | undefined {
  if (!value) return undefined;
  const pairs: Array<{ question: string; answer: string }> = [];
  const re = /Q:\s*([^\n]+)\nA:\s*([\s\S]*?)(?=\n\n(?:Q:|Phone:|Email:)|$)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value)) && pairs.length < 100) {
    const question = asUntrustedText(match[1], 500);
    const answer = asUntrustedText(match[2], 2000);
    if (question && answer) pairs.push({ question, answer });
  }
  return pairs.length ? pairs : undefined;
}

function splitFactLines(value: string | undefined, maxItems = 100): string[] | undefined {
  if (!value) return undefined;
  const items = value
    .split(/\n+/)
    .map((item) => asUntrustedText(item, 300))
    .filter(Boolean);
  const unique = [...new Set(items)].slice(0, maxItems);
  return unique.length ? unique : undefined;
}

export function extractDraftFromHtml(
  pages: { url: string; html: string }[],
): {
  draft: PartialDraft;
  warnings: string[];
  fieldMeta: DraftFieldMeta;
  facts: BusinessFacts;
  factMeta: BusinessFactMeta;
} {
  const draft: PartialDraft = {};
  const warnings: string[] = [];
  const fieldMeta: DraftFieldMeta = {};
  const jsonLdHours: string[] = [];
  const jsonLdServices: string[] = [];
  const jsonLdFaqs: string[] = [];
  const microHours: string[] = [];
  const microServices: string[] = [];
  const locations: string[] = [];
  const phones: string[] = [];
  const emails: string[] = [];
  let locationMeta: BusinessFactMeta["locations"];
  let contactMeta: BusinessFactMeta["contact"];

  for (const page of pages) {
    const jsonLd = extractJsonLd(page.html);
    setField(draft, fieldMeta, "businessName", jsonLd.businessName, "jsonld", "high");
    setField(draft, fieldMeta, "greeting", jsonLd.greeting, "jsonld", "high");
    if (jsonLd.hours) jsonLdHours.push(jsonLd.hours);
    if (jsonLd.services) jsonLdServices.push(jsonLd.services);
    if (jsonLd.faqs) jsonLdFaqs.push(jsonLd.faqs);
    if (jsonLd.locations.length) {
      locations.push(...jsonLd.locations);
      locationMeta ||= { source: "jsonld", confidence: "high" };
    }
    if (jsonLd.phones.length || jsonLd.emails.length) {
      contactMeta ||= { source: "jsonld", confidence: "high" };
    }
    phones.push(...jsonLd.phones);
    emails.push(...jsonLd.emails);

    const micro = extractMicrodata(page.html);
    if (!draft.businessName) {
      setField(draft, fieldMeta, "businessName", micro.businessName, "microdata", "high");
    }
    if (!draft.greeting) {
      setField(draft, fieldMeta, "greeting", micro.greeting, "microdata", "high");
    }
    if (micro.hours) microHours.push(micro.hours);
    if (micro.services) microServices.push(micro.services);
    if (micro.locations.length) {
      locations.push(...micro.locations);
      locationMeta ||= { source: "microdata", confidence: "high" };
    }
    if (micro.phones.length || micro.emails.length) {
      contactMeta ||= { source: "microdata", confidence: "high" };
    }
    phones.push(...micro.phones);
    emails.push(...micro.emails);

    const links = extractTelMailto(page.html);
    if ((links.phones.length || links.emails.length) && !contactMeta) {
      contactMeta = { source: "contact_link", confidence: "medium" };
    }
    phones.push(...links.phones);
    emails.push(...links.emails);

    const visibleContact = extractVisibleContactSection(page.html);
    if (visibleContact.locations.length && !locationMeta) {
      locationMeta = { source: "heading", confidence: "medium" };
    }
    if (
      (visibleContact.phones.length || visibleContact.emails.length) &&
      !contactMeta
    ) {
      contactMeta = { source: "heading", confidence: "medium" };
    }
    locations.push(...visibleContact.locations);
    phones.push(...visibleContact.phones);
    emails.push(...visibleContact.emails);
  }

  if (!draft.businessName) {
    for (const page of pages) {
      const siteName = metaContent(page.html, "og:site_name");
      if (siteName && !isGenericName(siteName)) {
        setField(draft, fieldMeta, "businessName", siteName, "meta", "medium");
        break;
      }
    }
  }
  if (!draft.businessName) {
    for (const page of pages) {
      const fromTitle = cleanedTitleName(page.html);
      if (fromTitle) {
        setField(draft, fieldMeta, "businessName", fromTitle, "title", "medium");
        break;
      }
    }
  }
  if (!draft.businessName) {
    for (const page of pages) {
      const h1 = extractH1(page.html);
      if (h1 && !isGenericName(h1)) {
        setField(draft, fieldMeta, "businessName", h1, "heading", "medium");
        break;
      }
    }
  }
  if (!draft.businessName) {
    for (const page of pages) {
      const ogTitle = metaContent(page.html, "og:title") ||
        metaContent(page.html, "twitter:title");
      if (ogTitle && !isGenericName(ogTitle)) {
        const first = ogTitle.split(/\s*[|–—]\s*/)[0]?.trim() || ogTitle;
        setField(draft, fieldMeta, "businessName", first, "meta", "low");
        break;
      }
    }
  }

  if (draft.businessName && /[|]/.test(draft.businessName)) {
    const siteName = pages
      .map((page) => metaContent(page.html, "og:site_name"))
      .find((value) => value && !isGenericName(value));
    if (siteName) {
      draft.businessName = siteName;
      fieldMeta.businessName = { source: "meta", confidence: "medium" };
    }
  }

  setField(
    draft,
    fieldMeta,
    "hours",
    uniqueJoin(jsonLdHours),
    "jsonld",
    "high",
  );
  setField(
    draft,
    fieldMeta,
    "hours",
    uniqueJoin(microHours),
    "microdata",
    "high",
  );
  if (!draft.hours) {
    for (const page of pages) {
      const section = headingSection(
        page.html,
        /opening hours|business hours|our hours|office hours/,
      );
      if (section && looksLikeHours(section)) {
        setField(draft, fieldMeta, "hours", section, "heading", "medium");
        break;
      }
    }
  }
  if (!draft.hours) {
    for (const page of pages) {
      const patterned = extractHoursFromVisibleText(page.html);
      if (patterned) {
        setField(draft, fieldMeta, "hours", patterned, "pattern", "low");
        break;
      }
    }
  }

  setField(
    draft,
    fieldMeta,
    "services",
    uniqueJoin(jsonLdServices),
    "jsonld",
    "high",
  );
  setField(
    draft,
    fieldMeta,
    "services",
    uniqueJoin(microServices),
    "microdata",
    "high",
  );
  if (!draft.services) {
    for (const page of pages) {
      const section = headingSection(
        page.html,
        /our services|services we offer|what we do|what we offer|what we provide|our work|housing options|support services|services/,
      );
      if (section && (section.split("\n").length >= 2 || section.length >= 24)) {
        setField(draft, fieldMeta, "services", section, "heading", "medium");
        break;
      }
    }
  }
  if (!draft.services) {
    for (const page of pages) {
      const fromHeadings = extractServiceSubheadings(page.html);
      if (fromHeadings) {
        setField(
          draft,
          fieldMeta,
          "services",
          fromHeadings,
          "heading",
          "medium",
        );
        break;
      }
    }
  }
  if (!draft.services) {
    for (const page of pages) {
      const fromNav = extractServicesFromNav(page.html);
      if (fromNav) {
        setField(draft, fieldMeta, "services", fromNav, "nav", "low");
        break;
      }
    }
  }

  setField(
    draft,
    fieldMeta,
    "faqs",
    uniqueJoin(jsonLdFaqs, "\n\n"),
    "jsonld",
    "high",
  );
  if (!draft.faqs) {
    for (const page of pages) {
      const details = extractDetailsFaqs(page.html);
      if (details) {
        setField(draft, fieldMeta, "faqs", details, "details", "medium");
        break;
      }
    }
  }
  if (!draft.faqs) {
    for (const page of pages) {
      const heuristic = extractHeuristicFaqs(page.html);
      if (heuristic) {
        setField(
          draft,
          fieldMeta,
          "faqs",
          heuristic.text,
          heuristic.source,
          "medium",
        );
        break;
      }
    }
  }

  const contact = formatContactHints(phones, emails);
  if (contact) {
    if (draft.faqs) {
      const already = contact
        .split("\n")
        .every((line) => (draft.faqs ?? "").includes(line.replace(/^(Phone|Email): /, "")));
      if (!already) {
        draft.faqs = `${draft.faqs}\n\n${contact}`.slice(0, MAX_FIELD_CHARS);
        warnings.push("contact_hints_from_page");
      }
    } else {
      setField(draft, fieldMeta, "faqs", contact, "contact_link", "medium");
      warnings.push("contact_hints_from_page");
    }
  }

  if (!draft.greeting) {
    warnings.push("greeting_not_found");
  }
  if (!draft.businessName) warnings.push("business_name_not_found");
  if (!draft.hours) warnings.push("hours_not_found");
  if (!draft.services) warnings.push("services_not_found");
  if (!draft.faqs) warnings.push("faqs_not_found");
  for (const key of Object.keys(fieldMeta) as (keyof DraftFieldMeta)[]) {
    if (fieldMeta[key]?.confidence === "low") {
      warnings.push(`${key}_low_confidence`);
    }
  }
  warnings.push("untrusted_crawl_text");

  const cleanDraft = omitEmpty(draft);
  const uniqueLocations = [...new Set(locations.map((item) => asUntrustedText(item, 500)).filter(Boolean))].slice(0, 16);
  const uniquePhones = dedupePhones(phones, 8);
  const uniqueEmails = [...new Set(emails.map((item) => asUntrustedText(item, 120)).filter(isPlausibleEmail))].slice(0, 8);
  const facts: BusinessFacts = {};
  const factMeta: BusinessFactMeta = {};
  const website = pages[0]?.url;
  if (website) {
    try {
      const parsed = new URL(website);
      if (parsed.protocol === "https:") {
        facts.website = parsed.toString();
        factMeta.website = { source: "fetched_url", confidence: "high" };
      }
    } catch {
      // Fetched URL provenance is optional; never invent it.
    }
  }
  if (cleanDraft.businessName) {
    facts.businessName = cleanDraft.businessName;
    if (fieldMeta.businessName) factMeta.businessName = fieldMeta.businessName;
  }
  if (uniqueLocations.length) {
    facts.locations = uniqueLocations;
    if (locationMeta) factMeta.locations = locationMeta;
  }
  if (uniquePhones.length || uniqueEmails.length) {
    facts.contact = {
      ...(uniquePhones.length ? { phones: uniquePhones } : {}),
      ...(uniqueEmails.length ? { emails: uniqueEmails } : {}),
    };
    if (contactMeta) factMeta.contact = contactMeta;
  }
  const services = splitFactLines(cleanDraft.services);
  if (services) {
    facts.services = services;
    if (fieldMeta.services) factMeta.services = fieldMeta.services;
  }
  if (cleanDraft.hours) {
    facts.hours = cleanDraft.hours;
    if (fieldMeta.hours) factMeta.hours = fieldMeta.hours;
  }
  const faqs = parseFaqFacts(cleanDraft.faqs);
  if (faqs) {
    facts.faqs = faqs;
    if (fieldMeta.faqs) factMeta.faqs = fieldMeta.faqs;
  }

  return {
    draft: cleanDraft,
    warnings,
    fieldMeta: omitEmptyMeta(fieldMeta, cleanDraft),
    facts,
    factMeta,
  };
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

function omitEmptyMeta(fieldMeta: DraftFieldMeta, draft: PartialDraft): DraftFieldMeta {
  const out: DraftFieldMeta = {};
  for (const key of Object.keys(fieldMeta) as (keyof DraftFieldMeta)[]) {
    if (draft[key] && fieldMeta[key]) out[key] = fieldMeta[key];
  }
  return out;
}
