/**
 * Claims-safe extractors. Only copy values that are visibly present.
 * Never invent hours, services, FAQs, or a receptionist greeting.
 *
 * All returned strings are untrusted page data.
 */

import { parseFragment, type DefaultTreeAdapterMap } from "parse5";
import { createGunzip, gunzipSync } from "node:zlib";
import { createReadStream, readFileSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type {
  BusinessBranch,
  BusinessFactMeta,
  BusinessFacts,
  DraftFieldMeta,
  FieldConfidence,
  FieldMeta,
  FieldSource,
  PartialDraft,
} from "./types.ts";

export const MAX_FIELD_CHARS = 4000;

interface GazetteerData {
  version: number;
  generated: string;
  postcodeDistricts: string[];
  towns: string[];
  counties: string[];
}

let gazetteerCache: GazetteerData | null = null;

async function loadGazetteer(): Promise<GazetteerData> {
  if (gazetteerCache) return gazetteerCache;
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const gazetteerPath = join(__dirname, "..", "..", "public", "gazetteer.json.gz");
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    pipeline(
      createReadStream(gazetteerPath),
      createGunzip(),
      async function* () {
        for await (const chunk of this) chunks.push(chunk);
      }()
    ).then(() => {
      try {
        const json = Buffer.concat(chunks).toString("utf8");
        gazetteerCache = JSON.parse(json) as GazetteerData;
        resolve(gazetteerCache);
      } catch (err) {
        reject(err);
      }
    }).catch(reject);
  });
}

function getGazetteerSync(): GazetteerData {
  if (gazetteerCache) return gazetteerCache;
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const gazetteerPath = join(__dirname, "..", "..", "..", "public", "gazetteer.json.gz");
  const compressed = readFileSync(gazetteerPath);
  const json = gunzipSync(compressed).toString("utf8");
  gazetteerCache = JSON.parse(json) as GazetteerData;
  return gazetteerCache;
}
/**
 * Honest browser-like agent for the plain HTTPS fetch.
 * Leading Mozilla/Chrome tokens match a normal page request. The product
 * tokens and URL identify the crawl. Robots groups for
 * MaintenanceOS-OnboardingScan still match because that token is included.
 * No Authorization or Cookie is attached.
 */
export const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 WorkSmartOS-OnboardingScan/0.1 (MaintenanceOS-OnboardingScan/0.1; +https://worksmartos.co.uk)";

const DAY_RE =
  /\b(mon|tue|wed|thu|fri|sat|sun|mo|tu|we|th|fr|sa|su|monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekdays?|weekends?)\b/i;
const TIME_RE = /\b(\d{1,2}[:.]\d{2}|\d{1,2}\s?(am|pm))\b/i;
const TIME_RANGE_RE =
  /\d{1,2}(?:[:.]\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)?\s*(?:-|–|—|to)\s*\d{1,2}(?:[:.]\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)?/i;
const ALL_HOURS_RE =
  /\b(open(?:ing)?(?:\s+hours)?|hours).{0,24}(24\s*\/\s*7|24\s*hours)\b|\b(24\s*\/\s*7|24\s*hours).{0,24}(open(?:ing)?|hours)\b/i;

const PLACEHOLDER_HOURS_RE = /\b00:00\s*(?:-|–|—|to)\s*(?:23:59|00:00)\b/i;

const GENERIC_NAME_RE = /^(home|about|welcome|untitled|index|website|error)$/i;
const GENERIC_NAV_RE =
  /^(home|homepage|about(?: us)?|our story|contact(?: us)?|get in touch|stay in touch|support us|connect|links|residents?|blog|news|privacy(?: policy)?|terms(?: of (?:service|use)?)?|login|log in|sign in|sign up|register|cart|basket|checkout|faqs?|gallery|testimonials?|reviews?|careers?|jobs?|book now|get a quote|request a quote|menu|search|skip to (?:content|main)|back(?:\s+to\b.*)?|cookies?|(?:our )?services)$/i;
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
  "restaurant",
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

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  middot: "·",
  bull: "•",
  pound: "£",
};

export function decodeEntities(raw: string): string {
  const decoded = raw
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    })
    .replace(/&#(\d+);/g, (_, dec: string) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    })
    .replace(/&([a-z]+);/gi, (entity, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? entity);
  return decoded.includes("&") && decoded !== raw ? decodeEntities(decoded) : decoded;
}

/** Decode entities, drop tags, and collapse whitespace. Used on every draft field. */
export function sanitizeUntrustedField(value: string, max = MAX_FIELD_CHARS): string {
  const decoded = decodeEntities(value);
  const stripped = decoded.replace(/<[^>]*>/g, " ");
  return asUntrustedText(decodeEntities(stripped), max);
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

type HtmlNode = DefaultTreeAdapterMap["node"];
type HtmlElement = DefaultTreeAdapterMap["element"];
type HtmlText = DefaultTreeAdapterMap["textNode"];

const SKIP_HTML_TAGS = new Set(["script", "style", "noscript", "template"]);
const BLOCK_HTML_TAGS = new Set([
  "address",
  "article",
  "blockquote",
  "br",
  "dd",
  "div",
  "dl",
  "dt",
  "figcaption",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "li",
  "main",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "td",
  "th",
  "tr",
  "ul",
]);

/** Visible text from a real HTML parse. Script, style, and noscript are omitted. */
export function htmlToPlainText(html: string): string {
  const fragment = parseFragment(html);
  let out = "";
  const walk = (node: HtmlNode) => {
    if (node.nodeName === "#text") {
      out += (node as HtmlText).value;
      return;
    }
    if (node.nodeName === "#comment" || node.nodeName === "#documentType") return;
    const element = node as HtmlElement;
    const name = element.nodeName.toLowerCase();
    if (SKIP_HTML_TAGS.has(name)) return;
    const block = BLOCK_HTML_TAGS.has(name);
    if (block) out += "\n";
    for (const child of element.childNodes ?? []) walk(child);
    if (block) out += "\n";
  };
  for (const child of fragment.childNodes) walk(child);
  return asUntrustedText(decodeEntities(out));
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
    if (question?.includes("?") && answer && acceptableFaqAnswer(answer)) {
      into.push(`Q: ${question.trim()}\nA: ${sanitizeUntrustedField(answer, 2000)}`);
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


const REGION_OR_COUNTRY_CODE = /^(?:eng|gb|gbr|uk|usa|us|eu)$/i;

/** Street, locality, and postcode only. Region and country codes such as ENG and GB are omitted. */
export function formatPostalAddress(value: unknown): string | undefined {
  const direct = stringField(value);
  if (direct) return normalizePostalAddress(direct);
  const rec = asRecord(value);
  if (!rec) return undefined;
  const parts = [
    stringField(rec.streetAddress),
    stringField(rec.addressLocality),
    stringField(rec.postalCode),
  ].filter((item): item is string => Boolean(item));
  return parts.length ? normalizePostalAddress(parts.join(", ")) : undefined;
}

function stripAddressCodes(value: string): string | undefined {
  const parts = sanitizeUntrustedField(value, 500)
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !REGION_OR_COUNTRY_CODE.test(part));
  return parts.length ? parts.join(", ") : undefined;
}

function normalizePostalAddress(value: string): string | undefined {
  const stripped = stripAddressCodes(value);
  if (!stripped) return undefined;
  if (!UK_POSTCODE_RE.test(stripped)) return stripped;
  return addressAroundPostcode(stripped) ?? withFormattedPostcode(stripped);
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
  branches: BusinessBranch[];
};

export function extractJsonLd(html: string): JsonLdExtract {
  const nodes: Record<string, unknown>[] = [];
  for (const block of parseJsonLdBlocks(html)) flattenJsonLd(block, nodes);

  let typedName: string | undefined;
  let looseName: string | undefined;
  let greeting: string | undefined;
  const hours: string[] = [];
  const services: string[] = [];
  const faqs: string[] = [];
  const locations: string[] = [];
  const phones: string[] = [];
  const emails: string[] = [];
  const branches: BusinessBranch[] = [];

  for (const rec of nodes) {
    const types = typesOf(rec);
    if (isBusinessNode(rec)) {
      const name = stringField(rec.name);
      const typed = types.some((t) => BUSINESS_TYPES.has(t) || t.includes("business"));
      if (typed) typedName ||= name;
      else looseName ||= name;
      greeting ||= stringField(rec.slogan);
      collectHours(rec, hours);
      collectServices(rec, services);
      collectContact(rec, phones, emails);
      collectLocations(rec, locations);
      const branch = branchFromBusinessNode(rec);
      if (branch) branches.push(branch);
    }
    if (types.includes("contactpoint")) {
      collectContact(rec, phones, emails);
    }
    if (types.includes("faqpage")) {
      collectFaqs(rec, faqs);
    }
  }

  const unique = (items: string[]) => [...new Set(items)].slice(0, 16);

  return {
    businessName: typedName || looseName,
    greeting,
    hours: unique(hours).join("\n") || undefined,
    services: unique(services).join("\n") || undefined,
    faqs: unique(faqs).join("\n\n") || undefined,
    locations: unique(locations),
    phones: unique(phones).map((phone) => normalizeUkPhone(phone) ?? phone),
    emails: unique(emails),
    branches: distinctBranches(branches),
  };
}

function branchFromBusinessNode(rec: Record<string, unknown>): BusinessBranch | undefined {
  const address = formatPostalAddress(rec.address) || formatPostalAddress(rec);
  const phones: string[] = [];
  const emails: string[] = [];
  collectContact(rec, phones, emails);
  const hours: string[] = [];
  collectHours(rec, hours);
  const phone = phones.map((item) => normalizeUkPhone(item)).find((item): item is string => Boolean(item));
  const name = publicBusinessName(stringField(rec.name));
  const hourText = hours.map((item) => plainHours(item)).find(Boolean);
  if (!address && !phone) return undefined;
  return {
    ...(name ? { name } : {}),
    ...(phone ? { phone } : {}),
    ...(address ? { address } : {}),
    ...(hourText ? { hours: hourText } : {}),
  };
}

function extractPriceMentions(html: string): string[] {
  const fragment = headingSectionHtml(html, /prices?|price list|our prices|treatments|menu/);
  if (!fragment) return [];
  const lines: string[] = [];
  for (const row of fragment.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...(row[1] ?? "").matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
      innerText(cell[1] ?? ""),
    );
    const line = joinClockFragments(cells.join(" ")).replace(/\s+/g, " ").trim();
    if (/£\s*\d/.test(line)) lines.push(line);
  }
  for (const item of visibleBlocks(fragment)) {
    const line = joinClockFragments(item);
    if (/£\s*\d/.test(line)) lines.push(line);
  }
  return [...new Set(lines.map((line) => asUntrustedText(line, 80)).filter(Boolean))].slice(0, 12);
}

function distinctBranches(branches: BusinessBranch[]): BusinessBranch[] {
  const seen = new Set<string>();
  const out: BusinessBranch[] = [];
  for (const branch of branches) {
    const key = `${branch.address ?? ""}|${branch.phone ?? ""}`.toLowerCase();
    if (!branch.address || seen.has(key)) continue;
    seen.add(key);
    out.push(branch);
  }
  return out.length >= 2 ? out.slice(0, 12) : [];
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
    itempropValues(hoursSrc, "postalCode")[0],
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

const FOOD_HOURS_RE =
  /\b(?:kitchen|breakfast|brunch|lunch|dinner|last orders|food service|serving food)\b/i;

function joinClockFragments(text: string): string {
  return text
    .replace(/(\d)\s+\.(\d{2})\b/g, "$1.$2")
    .replace(/£\s+(?=\d)/g, "£");
}

function trimHoursLine(line: string): string | undefined {
  const text = joinClockFragments(line.replace(/\s+/g, " ").trim());
  if (!text || text.length > 240 || /<[a-z!/]/i.test(text)) return undefined;
  if (FOOD_HOURS_RE.test(text) && !/\b(?:opening|business|office)\s+hours\b/i.test(text)) {
    return undefined;
  }
  if (ALL_HOURS_RE.test(text)) {
    const all = text.match(ALL_HOURS_RE);
    return all?.[0] ? asUntrustedText(all[0], 140) : undefined;
  }
  if (PLACEHOLDER_HOURS_RE.test(text)) {
    return undefined;
  }
  if (/\bclosed\b/i.test(text) && DAY_RE.test(text) && !TIME_RANGE_RE.test(text)) {
    const closed =
      /((?:mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekdays?|weekends?)\b.{0,24}\bclosed\b)/i.exec(
        text,
      );
    return closed?.[1] ? asUntrustedText(closed[1], 140) : undefined;
  }
  const day = new RegExp(DAY_RE.source, "i").exec(text);
  const range = TIME_RANGE_RE.exec(text);
  if (!day || !range || day.index === undefined || range.index === undefined) return undefined;
  if (range.index < day.index) return undefined;
  const snippet = text
    .slice(day.index, range.index + range[0].length)
    .replace(/^[^A-Za-z0-9]+/, "")
    .trim();
  if (!snippet || snippet.length > 140) return undefined;
  const prose = snippet.replace(/\d{1,2}[.:]\d{2}/g, "").replace(/\b[ap]\.m\./gi, "");
  if (/[.!?]/.test(prose)) return undefined;
  return snippet;
}

/** Keep opening-hours lines and stop at the first line that is not hours. */
export function clipHoursText(text: string): string | undefined {
  const kept: string[] = [];
  let started = false;
  for (const raw of text.split(/\n+/)) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (!line) continue;
    const hours = trimHoursLine(line);
    if (hours) {
      kept.push(hours);
      started = true;
      continue;
    }
    if (started) break;
  }
  const unique = [...new Set(kept)];
  return unique.length ? unique.join("\n") : undefined;
}

function plainHours(value: string): string {
  const plain = /<[a-z!/]/i.test(value) ? htmlToPlainText(value) : value;
  const clipped = clipHoursText(plain);
  if (clipped) return sanitizeUntrustedField(clipped, 500);
  const text = sanitizeUntrustedField(
    plain
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line && !/<[a-z!/]/i.test(line))
      .join("\n"),
    500,
  );
  if (!text || /<[a-z!/]/i.test(text)) return "";
  if (PLACEHOLDER_HOURS_RE.test(text) && !ALL_HOURS_RE.test(text)) return "";
  if (looksLikeHoursPattern(text) || /\b\d{1,2}:\d{2}\b/.test(text) || ALL_HOURS_RE.test(text)) {
    return text;
  }
  return "";
}

function looksLikeHoursPattern(text: string): boolean {
  if (text.length < 8 || text.length > 140) return false;
  if (ALL_HOURS_RE.test(text)) return true;
  if (DAY_RE.test(text) && /\bclosed\b/i.test(text)) return true;
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
    const line = joinClockFragments(cells.join(" "));
    if (looksLikeHoursPattern(line) && !FOOD_HOURS_RE.test(line)) out.push(line);
  }
  return out.slice(0, 8);
}

function extractHoursFromVisibleText(html: string): string | undefined {
  const fromTable = extractTableHours(html);
  const parsed = clipHoursText(joinClockFragments(htmlToPlainText(html)));
  if (parsed) return parsed;
  const text = stripHtmlToText(html);
  const hits: string[] = [...fromTable];
  const day = new RegExp(DAY_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = day.exec(text))) {
    const context = text.slice(Math.max(0, m.index - 60), m.index + 90);
    if (
      FOOD_HOURS_RE.test(context) &&
      !/\b(?:opening|business|office)\s+hours\b/i.test(context)
    ) {
      continue;
    }
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
    /<(?:div|nav)\b[^>]*class=["'][^"']*\b(?:w3-bar|menu-bar|navbar|nav-bar)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|nav)>/gi,
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

function serviceItemsUnderHeading(html: string): string | undefined {
  const heading =
    /<h([1-3])\b[^>]*>\s*((?:our\s+)?(?:services?|what we (?:do|offer|provide)|services we offer|treatments?|menu(?:\s+categories)?))\s*<\/h\1>/i;
  const match = heading.exec(html);
  if (!match || match.index === undefined) return undefined;
  const level = Number(match[1]);
  const after = html.slice(match.index + match[0].length, match.index + match[0].length + 16_000);
  const next = after.search(new RegExp(`<h[1-${level}]\\b`, "i"));
  const section = after.slice(0, next === -1 ? after.length : next);
  const items = [...section.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((item) => innerText(item[1] ?? ""))
    .filter((item) => isServicePhrase(item));
  const unique = [...new Set(items)].slice(0, 12);
  return unique.length ? unique.join("\n") : undefined;
}

/**
 * Grounded services extraction: only JSON-LD (makesOffer, hasOfferCatalog, serviceType)
 * and service pages identified by isServiceSourceUrl (via headingSection with service-related headings).
 * Explicitly rejects nav-based and generic subheading-based extraction.
 */
export function extractGroundedServices(html: string, pageUrl: string): string | undefined {
  const services: string[] = [];

  // 1. Extract from JSON-LD
  const jsonLd = extractJsonLd(html);
  if (jsonLd.services) {
    for (const line of jsonLd.services.split(/\n+/)) {
      const cleaned = sanitizeUntrustedField(line, 80);
      if (cleaned && isServicePhrase(cleaned)) services.push(cleaned);
    }
  }

  // 2. Extract from service pages via serviceItemsUnderHeading (stops at same/higher level headings)
  try {
    if (isServiceSourceUrl(pageUrl)) {
      const listed = serviceItemsUnderHeading(withoutCodeScripts(html));
      if (listed) {
        for (const line of listed.split(/\n+/)) {
          const cleaned = sanitizeUntrustedField(line, 80);
          if (cleaned && isServicePhrase(cleaned)) services.push(cleaned);
        }
      }
    }
  } catch {
    // Invalid URL, skip services page extraction
  }

  const uniqueServices = [...new Set(services)].slice(0, 12);
  return uniqueServices.length ? uniqueServices.join("\n") : undefined;
}

function looksLikeQuestion(text: string): boolean {
  if (text.length < 6 || text.length > 160) return false;
  if (CTA_QUESTION_RE.test(text)) return false;
  if (/\?/.test(text)) return true;
  return /^(do|does|did|is|are|can|will|what|when|where|who|why|how|should)\b/i.test(
    text,
  );
}

const FAQ_BYLINE_RE =
  /\b(?:19|20)\d{2}\b[\s\S]{0,48}\bby\b|\bby\b[\s\S]{0,48}\b(?:19|20)\d{2}\b|^(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+\d{1,2},?\s+\d{4}\b/i;

const FAQ_BOILERPLATE_RE =
  /suggested text:|privacy policy|complaints procedure|cookie policy|all rights reserved/i;

const FAQ_ANSWER_CAP = 500;

/** Shorten a long answer. A following `Q:` stays in the text so the pair splitter can separate it. */
export function cleanFaqAnswer(answer: string): string {
  const text = sanitizeUntrustedField(answer, 2000).trim();
  if (text.length <= FAQ_ANSWER_CAP) return text;
  const slice = text.slice(0, FAQ_ANSWER_CAP);
  const sentence = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "));
  if (sentence >= 80) return slice.slice(0, sentence + 1).trim();
  return slice.trim();
}

export function acceptableFaqAnswer(answer: string): boolean {
  const text = cleanFaqAnswer(answer).replace(/\n+Q:[\s\S]*$/i, "").trim();
  if (text.length < 8) return false;
  if (FAQ_BYLINE_RE.test(text) || FAQ_BOILERPLATE_RE.test(text)) return false;
  if (/\?\s*$/.test(text) && looksLikeQuestion(text)) return false;
  return true;
}

function faqPair(question: string, answer: string): string {
  const q = question.trim();
  const a = cleanFaqAnswer(answer).replace(/\n+Q:[\s\S]*$/i, "").trim();
  if (!q.includes("?") || !acceptableFaqAnswer(a)) return "";
  return `Q: ${q}\nA: ${a}`;
}

/** Details and accordion controls only. Fewer than three real questions is not an FAQ. */
function extractDetailsFaqs(html: string): string | undefined {
  const pairs: string[] = [];
  for (const match of html.matchAll(
    /<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi,
  )) {
    const pair = faqPair(innerText(match[1]), innerText(match[2]));
    if (pair) pairs.push(pair);
  }
  for (const match of html.matchAll(
    /<button\b[^>]*\baria-expanded=["'](?:true|false)["'][^>]*\baria-controls=["']([^"']+)["'][^>]*>([\s\S]*?)<\/button>\s*<div\b[^>]*\bid=["']\1["'][^>]*>([\s\S]*?)<\/div>/gi,
  )) {
    const pair = faqPair(innerText(match[2]), innerText(match[3]));
    if (pair) pairs.push(pair);
  }
  const unique = [...new Set(pairs)].slice(0, 12);
  return unique.length >= 3 ? unique.join("\n\n") : undefined;
}

/**
 * UK national or international form, stored as E.164.
 * Rejects a trunk zero after +, and a house number glued on after a full number.
 */
export function normalizeUkPhone(value: string): string | undefined {
  const text = asUntrustedText(value, 80);
  if (!text || !/^\+?[\d\s().-]+$/.test(text)) return undefined;
  const compact = text.replace(/[\s().-]/g, "");
  if (/^\+0/.test(compact)) return undefined;
  let digits = text.replace(/\D/g, "");
  if (compact.startsWith("+") || compact.startsWith("00")) {
    if (digits.startsWith("0044")) digits = digits.slice(4);
    else if (digits.startsWith("44")) digits = digits.slice(2);
    else return undefined;
    if (digits.startsWith("0")) digits = digits.slice(1);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  } else {
    return undefined;
  }
  if (digits.length < 9 || digits.length > 10 || digits.startsWith("0")) return undefined;
  return `+44${digits}`;
}

function isPlausiblePhone(value: string): boolean {
  return Boolean(normalizeUkPhone(value));
}

export function phoneIdentity(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0044") && digits.length >= 12) return "0" + digits.slice(4);
  if (digits.startsWith("44") && digits.length >= 11) return "0" + digits.slice(2);
  return digits;
}

function dedupePhones(values: string[], max = 8): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const canonical = normalizeUkPhone(value);
    if (!canonical || seen.has(canonical)) continue;
    seen.add(canonical);
    out.push(canonical);
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
    const canonical = candidate ? normalizeUkPhone(candidate) : undefined;
    if (canonical) phones.push(canonical);
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

const STREET_WORD_RE =
  /\b(?:road|street|lane|avenue|ave|close|drive|way|court|place|crescent|terrace|gardens|grove|hill|park|square|chase|mews|row|walk|rise|view|gate|yard|quay|wharf|parade|boulevard|rd|st)\b/i;

const NAV_ADDRESS_RE =
  /^(?:back(?:\s+to\b.*)?|home|homepage|menu|contact(?:\s+us)?|search|skip to (?:content|main))$/i;

/** A postal address needs a UK postcode, or a house number plus a street word. Navigation labels are rejected. */
export function isAcceptableAddress(value: string): boolean {
  const text = sanitizeUntrustedField(value, 500);
  if (!text || text.length < 8 || text.length > 240) return false;
  const parts = text.split(/[\n,]+/).map((part) => part.trim()).filter(Boolean);
  if (
    parts.some((part) => NAV_ADDRESS_RE.test(part.replace(/^[←‹›→\s]+/u, "")))
  ) {
    return false;
  }
  if (UK_POSTCODE_RE.test(text)) return true;
  return /\b\d+[a-z]?\b/i.test(text) && STREET_WORD_RE.test(text);
}

const ADDRESS_LABEL_RE =
  /^(?:find us|contact(?:\s+info|\s+details|\s+us)?|opening hours|address|available|get in touch|location|our location|visit us|where to find us|phone|tel|email|e-mail|call|talk to us|cancellation policy)\b/i;

const REGION_TAIL_RE =
  /^(?:wirral|merseyside|cheshire|lancashire|yorkshire|staffordshire|shropshire|derbyshire|midlands)$/i;

const STREET_LINE_RE =
  /^(.*?\b(?:road|street|lane|avenue|ave|close|drive|way|court|place|crescent|terrace|gardens|grove|hill|square|chase|mews|row|walk|rise|view|gate|yard|quay|wharf|parade|boulevard|rd|st)\b)/i;

const ESTATE_LINE_RE =
  /^(.*?\b(?:business park|industrial estate|trading estate|retail park)\b)/i;

function segmentHasContactToken(part: string): boolean {
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(part)) return true;
  if (/\bat\b/i.test(part) && /\bdot\b/i.test(part)) return true;
  const digits = part.replace(/\D/g, "");
  return digits.length >= 10 && /(?:\+|0)\d/.test(part);
}

function stripAddressLabel(part: string): string {
  return part
    .replace(
      /^(?:find us|contact info|opening hours|address|talk to us|cancellation policy)\s*[:\-]?\s*/i,
      "",
    )
    .trim();
}

function startsWithHouseNumber(part: string): boolean {
  return /^(?:flat|unit|suite|apartment|apt\.?\s*)?\d+[a-z]?\b/i.test(part);
}

/** Drop brand and heading text that sits in front of the house number. */
function cutToHouseNumber(part: string): string {
  const match =
    /(?:^|\s)((?:flat|unit|suite|apartment|apt\.?\s*)?\d+[a-z]?\s+\S.*)$/i.exec(
      part,
    );
  return match?.[1]?.trim() || part.trim();
}

/**
 * Turn "1 Mosedale Road Croft Business Park Bromborough Wirral" into
 * street, estate, and town lines. A trailing county glued onto that blob is
 * omitted. Comma-separated lines are left as the page wrote them.
 */
function splitStreetBlob(part: string): string[] {
  const text = part.replace(/\s+/g, " ").trim();
  const street = STREET_LINE_RE.exec(text);
  if (!street?.[1]) return text ? [text] : [];
  const lines = [street[1].trim()];
  let rest = text.slice(street[1].length).trim();
  const estate = ESTATE_LINE_RE.exec(rest);
  if (estate?.[1]) {
    lines.push(estate[1].trim());
    rest = rest.slice(estate[1].length).trim();
  }
  if (!rest) return lines;
  const words = rest.split(/\s+/);
  while (words.length > 1 && REGION_TAIL_RE.test(words[words.length - 1] ?? "")) {
    words.pop();
  }
  const locality = words.join(" ").trim();
  if (locality && !REGION_TAIL_RE.test(locality)) lines.push(locality);
  return lines;
}

/** Outward code, a space, then the inward code. `M251PZ` becomes `M25 1PZ`. */
export function formatUkPostcode(raw: string): string {
  const match = raw.match(UK_POSTCODE_RE);
  if (!match) return raw.trim();
  const compact = match[0].replace(/\s+/g, "").toUpperCase();
  if (compact === "GIR0AA") return "GIR 0AA";
  if (compact.length < 5) return compact;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

function withFormattedPostcode(value: string): string {
  return value.replace(UK_POSTCODE_RE, (code) => formatUkPostcode(code));
}

/** Take the UK postcode and only the street lines immediately before it. */
export function addressAroundPostcode(text: string): string | undefined {
  const match = UK_POSTCODE_RE.exec(text);
  if (!match || match.index === undefined) return undefined;
  const postcode = formatUkPostcode(match[0]);
  const segments = text
    .slice(0, match.index)
    .split(/[\n,]+/)
    .map((part) => stripAddressLabel(part.trim()))
    .filter(Boolean);
  const kept: string[] = [];
  for (let index = segments.length - 1; index >= 0 && kept.length < 4; index -= 1) {
    const part = segments[index] ?? "";
    if (!part || part.length > 80) break;
    if (NAV_ADDRESS_RE.test(part.replace(/^[←‹›→\s]+/u, ""))) break;
    if (ADDRESS_LABEL_RE.test(part)) break;
    if (segmentHasContactToken(part) || /[\[(]\s*at\s*[\])]/i.test(part)) break;
    if (/\b(?:kitchen|breakfast|available 24)\b/i.test(part)) break;
    kept.unshift(part);
  }
  if (!kept.length) return undefined;
  const houseAt = kept.findIndex((part) => startsWithHouseNumber(cutToHouseNumber(part)));
  const fromHouse = (houseAt >= 0 ? kept.slice(houseAt) : kept).map((part, index) =>
    index === 0 ? cutToHouseNumber(part) : part,
  );
  const lines = fromHouse.flatMap((part, index) =>
    index === 0 ? splitStreetBlob(part) : [part],
  );
  if (!lines.length) return undefined;
  const address = sanitizeUntrustedField(`${lines.join(", ")}, ${postcode}`, 500);
  return address && isAcceptableAddress(address) ? address : undefined;
}

function postcodeKey(value: string): string | undefined {
  const match = value.match(UK_POSTCODE_RE);
  return match?.[0]?.replace(/\s+/g, "").toUpperCase();
}

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
  place?: string;
} {
  const fragment = headingSectionHtml(
    html,
    /contact(?:\s+us|\s+details)?(?:\s+\w+)?|get in touch|find us/,
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
  const place = blocks.find((block) => {
    if (UK_POSTCODE_RE.test(block) || isPlausiblePhone(block) || isPlausibleEmail(block)) {
      return false;
    }
    const words = block.split(/\s+/);
    return block.length >= 4 && block.length <= 80 && words.length <= 6 && !/[.?!]/.test(block);
  });

  return { phones, emails, locations, ...(place ? { place } : {}) };
}

function httpsPageUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function factMetaFor(
  source: FieldSource,
  confidence: "high" | "medium" | "low",
  pageUrl: string,
): FieldMeta {
  const sourceUrl = httpsPageUrl(pageUrl);
  return sourceUrl ? { source, confidence, sourceUrl } : { source, confidence };
}

function withoutCodeScripts(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (block) =>
    /type=["']application\/ld\+json["']/i.test(block) ? block : " ",
  );
}

function partitionLocations(values: string[]): { addresses: string[]; areas: string[] } {
  const addresses: string[] = [];
  const areas: string[] = [];
  for (const value of values) {
    const text = asUntrustedText(value, 500);
    if (!text) continue;
    if (UK_POSTCODE_RE.test(text) || (/\d/.test(text) && text.includes(",") && text.length <= 200)) {
      addresses.push(text);
    } else {
      areas.push(text);
    }
  }
  return { addresses, areas };
}

function isPublicContactEmail(
  email: string,
  siteHost: string,
  pageUrl: string,
  fromContactSurface = false,
): boolean {
  if (!isPlausibleEmail(email) || /["'+\s]/.test(email)) return false;
  const at = email.lastIndexOf("@");
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).replace(/^www\./i, "").toLowerCase();
  if (/^(noreply|no-reply|donotreply|privacy|webmaster)$/i.test(local)) return false;
  const role =
    /^(info|hello|enquiries|enquiry|contact|office|admin|sales|bookings|reception|support|service|accounts|mail)$/i.test(
      local,
    );
  if (role) return true;
  let personalPage = false;
  try {
    personalPage = /\/(blog|news|jobs|careers|team|staff|people)(\/|$)/i.test(new URL(pageUrl).pathname);
  } catch {
    personalPage = false;
  }
  if (personalPage) return false;
  const host = siteHost.replace(/^www\./i, "").toLowerCase();
  if (host && (domain === host || domain.endsWith("." + host) || host.endsWith("." + domain))) return true;
  return fromContactSurface && isSiteContactUrl(pageUrl);
}

/** Higher scores are fetched first. Home, contact, about, services, FAQ, and hours outrank posts. */
export function crawlUrlPriority(raw: string): number {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return 0;
  }
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return 100;
  const joined = segments.join("/");
  if (/(?:^|\/)(?:contact|contact-us|get-in-touch|find-us)(?:\/|$)/i.test(joined)) return 90;
  if (/(?:^|\/)(?:about|about-us|our-story)(?:\/|$)/i.test(joined)) return 80;
  if (/(?:^|\/)(?:services|our-services|what-we-do|what-we-offer|treatments|prices|price-list|pricelist)(?:\/|$)/i.test(joined)) return 70;
  if (/(?:^|\/)(?:faq|faqs|frequently-asked-questions)(?:\/|$)/i.test(joined)) return 60;
  if (/(?:^|\/)(?:hours|opening-hours|openinghours|times|opening-times)(?:\/|$)/i.test(joined)) return 55;
  if (segments.length === 1) return 20;
  return 10;
}

export function isSiteContactUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return true;
  if (segments.length !== 1) return false;
  return /^(?:contact|contact-us|get-in-touch|find-us)$/i.test(segments[0] ?? "");
}

function factPageUrl(url: string, fallback: string): string {
  try {
    if (/\.(?:js|mjs|css|map)$/i.test(new URL(url).pathname)) return fallback;
  } catch {
    return fallback;
  }
  return url;
}

const SERVICE_SLOGAN_RE =
  /\b(?:efficient and friendly|get in touch|contact us|call us|book now|why choose|we pride|years of experience|friendly service|welcome to|our promise|satisfaction guaranteed|free quote)\b/i;

export function isServicePhrase(text: string): boolean {
  const value = sanitizeUntrustedField(text, 80);
  if (!value || /<[^>]+>/.test(value)) return false;
  const words = value.split(/\s+/);
  if (value.length < 3 || value.length > 60 || words.length > 8) return false;
  if (/[.!?]/.test(value)) return false;
  if (GENERIC_NAV_RE.test(value) || SERVICE_SLOGAN_RE.test(value)) return false;
  if (
    /^(?:prices?|vouchers?|home old|facebook|google|instagram|twitter|tiktok|youtube|linkedin|x|sep|sept|nov|jan|feb|mar|apr|jun|jul|aug|oct|dec|january|february|march|april|may|june|july|august|september|october|november|december)$/i.test(
      value,
    )
  ) {
    return false;
  }
  if (/^(?:efficient|friendly|professional|reliable|trusted|quality|welcome|get|contact|call|book|click)\b/i.test(value)) {
    return false;
  }
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) return false;
  if (/\[email\s+protected\]|\[at\]|\(at\)|\bemail\s+protected\b/i.test(value)) return false;
  if (/\bat\b/i.test(value) && /\bdot\b/i.test(value)) return false;
  if (/https?:\/\/|www\./i.test(value)) return false;
  if (UK_POSTCODE_RE.test(value) || isPlausiblePhone(value)) return false;
  if ((value.match(/\d/g) ?? []).length >= 10) return false;
  if (/\b(?:contact|request a valuation|our history|about(?: us)?|cookies?\s+policy|complaints?\s+procedure|privacy|polic(?:y|ies)|procedures?|guides?|how to)\b/i.test(value)) {
    return false;
  }
  if (/\b(?:19|20)\d{2}\b/.test(value)) return false;
  if (/(?:-|–|—)$/.test(value) || /\b(?:and|or|the|of|for|to|with)$/i.test(value)) return false;
  if (words.length >= 6 && /\b(?:we|our|you|your|is|are|will|can)\b/i.test(value)) return false;
  return true;
}

export type ProminentHit = {
  value: string;
  url: string;
  rank: number;
  source: FieldSource;
  confidence: FieldConfidence;
  order?: number;
};

function distinctHits(hits: ProminentHit[], identity: (value: string) => string): ProminentHit[] {
  const groups = new Map<string, ProminentHit>();
  for (const hit of hits) {
    const value = sanitizeUntrustedField(hit.value, 500);
    if (!value) continue;
    const key = identity(value) || value.toLowerCase();
    const next = { ...hit, value };
    const prev = groups.get(key);
    if (!prev || next.rank > prev.rank) groups.set(key, next);
  }
  return [...groups.values()].sort(
    (a, b) =>
      b.rank - a.rank ||
      crawlUrlPriority(b.url) - crawlUrlPriority(a.url) ||
      (a.order ?? 0) - (b.order ?? 0),
  );
}

/** Up to two phones. The first is the most prominent. Low confidence only when other pages were discarded. */
export function chooseProminentPhones(
  hits: ProminentHit[],
  pageUrls: string[] = [],
  limit = 2,
): ProminentHit[] {
  const knownUrls = new Set(pageUrls.length ? pageUrls : hits.map((hit) => hit.url));
  const siteScoped = [...knownUrls].some((url) => isSiteContactUrl(url));
  const everything = distinctHits(hits, phoneIdentity);
  if (!everything.length) return [];
  const broad = siteScoped && (everything.length > 1 || knownUrls.size > 8);
  const siteHits = distinctHits(
    hits.filter((hit) => isSiteContactUrl(hit.url)),
    phoneIdentity,
  );
  const chosen = (broad ? siteHits : everything).slice(0, Math.max(1, limit));
  const discardedOutside = broad && everything.some((hit) => !isSiteContactUrl(hit.url));
  return chosen.map((hit) => (discardedOutside ? { ...hit, confidence: "low" } : hit));
}

const addressIdentity = (value: string) => value.toLowerCase().replace(/\s+/g, " ");

/** A structured postal address with a UK postcode wins over a footer or heading. */
export function chooseProminentAddress(
  hits: ProminentHit[],
  pageUrls: string[],
): ProminentHit | undefined {
  const structured = distinctHits(
    hits.filter(
      (hit) =>
        (hit.source === "jsonld" || hit.source === "microdata") &&
        Boolean(postcodeKey(hit.value)),
    ),
    addressIdentity,
  );
  const picked = structured[0]
    ? structured.length > 1
      ? { ...structured[0], confidence: "low" as const }
      : structured[0]
    : chooseProminentValue(hits, addressIdentity, pageUrls);
  return picked ? { ...picked, value: withFormattedPostcode(picked.value) } : undefined;
}

export function chooseProminentValue(
  hits: ProminentHit[],
  identity: (value: string) => string = (value) => value.trim().toLowerCase(),
  pageUrls: string[] = [],
): ProminentHit | undefined {
  const knownUrls = new Set(pageUrls.length ? pageUrls : hits.map((hit) => hit.url));
  const siteScoped = [...knownUrls].some((url) => isSiteContactUrl(url));
  const everything = distinctHits(hits, identity);
  if (!everything.length) return undefined;
  const broad =
    siteScoped && (everything.length > 1 || knownUrls.size > 8);
  const chosen = broad
    ? distinctHits(hits.filter((hit) => isSiteContactUrl(hit.url)), identity)
    : everything;
  const best = chosen[0];
  if (!best) return undefined;
  return everything.length > 1 ? { ...best, confidence: "low" } : best;
}

function hoursIdentity(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

/** Visible opening hours win when they disagree with JSON-LD or microdata. */
export function chooseOpeningHours(
  hits: ProminentHit[],
  pageUrls: string[] = [],
): ProminentHit | undefined {
  const office = hits.filter(
    (hit) =>
      !FOOD_HOURS_RE.test(hit.value) ||
      (hit.source === "heading" && /\b(?:opening|business|office)\s+hours\b/i.test(hit.value)),
  );
  const visible = office.filter(
    (hit) => hit.source === "heading" || hit.source === "pattern" || hit.source === "footer",
  );
  const structured = office.filter(
    (hit) => hit.source === "jsonld" || hit.source === "microdata",
  );
  const visiblePick = chooseProminentValue(visible, hoursIdentity, pageUrls);
  const structuredPick = chooseProminentValue(structured, hoursIdentity, pageUrls);
  if (
    visiblePick &&
    structuredPick &&
    hoursIdentity(visiblePick.value) !== hoursIdentity(structuredPick.value)
  ) {
    return { ...visiblePick, confidence: "medium" };
  }
  return chooseProminentValue(office.length ? office : hits, hoursIdentity, pageUrls);
}

const ALWAYS_OPEN_RE = /\b(?:24\s*\/\s*7|24\s*hours|open\s*24)\b/i;
const WEEKDAY_TOKEN =
  "monday|tuesday|wednesday|thursday|friday|saturday|sunday|tues|thurs|thur|mon|tue|wed|thu|fri|sat|sun|mo|tu|we|th|fr|sa|su";
const WEEKDAY_INDEX: Record<string, number> = {
  monday: 0, mon: 0, mo: 0,
  tuesday: 1, tue: 1, tues: 1, tu: 1,
  wednesday: 2, wed: 2, we: 2,
  thursday: 3, thu: 3, thur: 3, thurs: 3, th: 3,
  friday: 4, fri: 4, fr: 4,
  saturday: 5, sat: 5, sa: 5,
  sunday: 6, sun: 6, su: 6,
};

function weekdayIndex(token: string): number | undefined {
  return WEEKDAY_INDEX[token.toLowerCase()];
}

function addWeekdaySpan(days: Set<number>, start: number, end: number): void {
  if (start <= end) {
    for (let day = start; day <= end; day += 1) days.add(day);
    return;
  }
  for (let day = start; day <= 6; day += 1) days.add(day);
  for (let day = 0; day <= end; day += 1) days.add(day);
}

/** Weekdays named by a hours string. Two-letter schema tokens count only inside a range or list. */
export function parsedWeekdayCount(value: string): number {
  const days = new Set<number>();
  const text = value.toLowerCase().replace(/[–—]/g, "-");
  if (/\bweekdays?\b/.test(text)) addWeekdaySpan(days, 0, 4);
  if (/\bweekends?\b/.test(text)) addWeekdaySpan(days, 5, 6);
  const rangeRe = new RegExp(`\\b(${WEEKDAY_TOKEN})\\s*(?:to|-)\\s*(${WEEKDAY_TOKEN})\\b`, "gi");
  for (const match of text.matchAll(rangeRe)) {
    const start = weekdayIndex(match[1] ?? "");
    const end = weekdayIndex(match[2] ?? "");
    if (start === undefined || end === undefined) continue;
    addWeekdaySpan(days, start, end);
  }
  const listRe = new RegExp(`\\b(?:${WEEKDAY_TOKEN})(?:\\s*,\\s*(?:${WEEKDAY_TOKEN}))+\\b`, "gi");
  for (const match of text.matchAll(listRe)) {
    for (const part of match[0].split(",")) {
      const index = weekdayIndex(part.trim());
      if (index !== undefined) days.add(index);
    }
  }
  const namedRe =
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tues|thurs|thur|mon|tue|wed|thu|fri|sat|sun)\b/gi;
  for (const match of text.matchAll(namedRe)) {
    const index = weekdayIndex(match[1] ?? "");
    if (index !== undefined) days.add(index);
  }
  return days.size;
}

function lineWithoutPlaceholder(line: string, alwaysOpen: boolean): string | undefined {
  const trimmed = line.trim();
  if (!trimmed) return undefined;
  if (alwaysOpen || !PLACEHOLDER_HOURS_RE.test(trimmed)) return trimmed;
  const stripped = trimmed
    .replace(/\b00:00\s*(?:-|–|—|to)\s*(?:23:59|00:00)\b/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/^[\s,]+|[\s,]+$/g, "")
    .trim();
  if (!stripped || (!/\d/.test(stripped) && !/\b(?:closed|24)\b/i.test(stripped))) return undefined;
  return stripped;
}

export type OpeningHoursAssessment = {
  value: string;
  partial: boolean;
  speakable: boolean;
};

/** Drop 00:00-23:59 and 00:00-00:00 unless the text says the business is open 24 hours. */
export function assessOpeningHours(
  value: string,
  context = "",
): OpeningHoursAssessment | undefined {
  const alwaysOpen = ALWAYS_OPEN_RE.test(value) || ALWAYS_OPEN_RE.test(context);
  const kept = value
    .split(/\n+/)
    .map((line) => lineWithoutPlaceholder(line, alwaysOpen))
    .filter((line): line is string => Boolean(line));
  if (!kept.length) return undefined;
  const next = kept.join("\n");
  const partial = !alwaysOpen && parsedWeekdayCount(next) < 5;
  return { value: next, partial, speakable: !partial };
}

export function hoursAreSpeakable(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  return assessOpeningHours(value)?.speakable === true;
}

const PRESS_MAILBOX_RE = /^(?:press|media|pr|newsdesk|communications|news)@/i;

function emailDomain(email: string): string {
  return email.split("@")[1]?.replace(/^www\./i, "").toLowerCase() ?? "";
}

function emailMatchesHost(email: string, siteHost: string): boolean {
  const domain = emailDomain(email);
  const host = siteHost.replace(/^www\./i, "").toLowerCase();
  if (!domain || !host) return false;
  return domain === host || domain.endsWith(`.${host}`) || host.endsWith(`.${domain}`);
}

/** Prefer a mailbox on the site's own domain, then a contact page. Drop a parent press address. */
export function chooseProminentEmail(
  hits: ProminentHit[],
  pageUrls: string[] = [],
  siteHost = "",
): ProminentHit | undefined {
  const sameDomain = hits.filter(
    (hit) => emailMatchesHost(hit.value, siteHost) && !PRESS_MAILBOX_RE.test(hit.value),
  );
  const pool = (sameDomain.length ? sameDomain : hits.filter((hit) => !PRESS_MAILBOX_RE.test(hit.value))).map(
    (hit) => (isSiteContactUrl(hit.url) ? { ...hit, rank: hit.rank + 2 } : hit),
  );
  return chooseProminentValue(pool, (value) => value.trim().toLowerCase(), pageUrls);
}

/** Cloudflare email protection: first byte is the XOR key. The attribute is not executed. */
export function decodeCloudflareEmail(hex: string): string | undefined {
  const clean = hex.trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(clean) || clean.length < 4 || clean.length % 2 !== 0) return undefined;
  const key = Number.parseInt(clean.slice(0, 2), 16);
  let out = "";
  for (let i = 2; i < clean.length; i += 2) {
    out += String.fromCharCode(Number.parseInt(clean.slice(i, i + 2), 16) ^ key);
  }
  const email = out.trim().toLowerCase();
  return isPlausibleEmail(email) ? email : undefined;
}

function deobfuscateEmailText(text: string): string {
  return decodeEntities(text)
    .replace(/\s*[\[(]\s*at\s*[\])]\s*/gi, "@")
    .replace(/\s*[\[(]\s*dot\s*[\])]\s*/gi, ".");
}

const TRADE_HEADING_RE =
  /\b(?:plumb|heat|boiler|gas|repair|install|servic|maint|drain|bathrooms?|electr|roof|locksmith|hvac|radiator)/i;

function extractTradeServiceHeadings(html: string): string | undefined {
  const found: string[] = [];
  for (const match of html.matchAll(/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const text = innerText(match[2]);
    if (!text || !isServicePhrase(text)) continue;
    if (/\b(?:locations?|areas?|we cover|available at)\b/i.test(text)) continue;
    if (GENERIC_NAV_RE.test(text) || !TRADE_HEADING_RE.test(text)) continue;
    found.push(text);
  }
  const unique = [...new Set(found)].slice(0, 12);
  return unique.length >= 2 ? unique.join("\n") : undefined;
}

const AREA_REJECT_EXACT_RE =
  /^(?:home|about(?:\s+us)?|services|our services|menu|faqs?|contact(?:\s+us)?|england|scotland|wales|northern ireland|united kingdom|uk)$/i;

const AREA_NAV_LABEL_RE =
  /\b(?:plumb(?:er|ers|ing)|electric(?:ian|ians)|heat(?:ing|er)s?|boiler|roof(?:er|ing)|locksmiths?|solicitors?|lawyers?|estate agents?|joiners?|builders?|painters?|cleaners?|gardeners?|valuations?)\b/i;

const PLACE_DENY_RE =
  /\b(?:privacy|policy|statement|copyright|complaint|terms|cookie|facebook|google|instagram|twitter|linkedin|youtube|tiktok|suggested|voucher|prices?|homepage|contact|search|login|january|february|march|april|may|june|july|august|september|october|november|december|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b|\b(?:19|20)\d{2}\b|\b(?:jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/i;

const PLACE_SUFFIX_RE =
  /(?:ton|ham|ley|pool|ford|mouth|bridge|borough|wich|wick|field|hill|wood|well|worth|chester|kirk|shaw|side|heath|moor|port|haven|ness|ington|bourne|caster|minster|wall)$/i;

let gazetteerTowns: Set<string> | null = null;
let gazetteerPostcodeDistricts: Set<string> | null = null;
let gazetteerCounties: Set<string> | null = null;

function initGazetteerSets(): void {
  if (gazetteerTowns) return;
  const g = getGazetteerSync();
  gazetteerTowns = new Set(g.towns.map((t) => t.toLowerCase()));
  gazetteerPostcodeDistricts = new Set(g.postcodeDistricts.map((d) => d.toUpperCase()));
  gazetteerCounties = new Set(g.counties.map((c) => c.toLowerCase()));
}

/** A service-area token must be a postcode district or a UK place, not a legal link or a date. */
export function isUkPlaceName(value: string): boolean {
  initGazetteerSets();
  const text = value.trim();
  if (!text || text.length < 2 || text.length > 40) return false;
  if (AREA_REJECT_EXACT_RE.test(text)) return false;
  if (PLACE_DENY_RE.test(text) || /[0-9@]/.test(text) && !/^[A-Z]{1,2}\d[A-Z\d]?$/i.test(text.replace(/\s+/g, ""))) {
    return false;
  }
  const compact = text.replace(/\s+/g, "");
  if (/^[A-Z]{1,2}\d[A-Z\d]?$/i.test(compact)) {
    return gazetteerPostcodeDistricts!.has(compact.toUpperCase());
  }
  if (AREA_NAV_LABEL_RE.test(text)) return false;
  const key = text.toLowerCase();
  if (gazetteerTowns!.has(key)) return true;
  if (gazetteerCounties!.has(key)) return true;
  const words = text.split(/[\s-]+/);
  if (words.length > 3) return false;
  if (!words.every((word) => /^[A-Za-z][A-Za-z'.]{1,}$/.test(word))) return false;
  return words.some((word) => PLACE_SUFFIX_RE.test(word) || gazetteerTowns!.has(word.toLowerCase()));
}

/** Place names only. Country names, navigation labels, and blank lines are omitted. */
export function serviceAreaNames(values: readonly string[]): string[] {
  return [...new Set(
    values
      .flatMap((item) => item.split(/\n+/))
      .map((item) => item.trim())
      .filter((item) => item && isUkPlaceName(item)),
  )].slice(0, 16);
}

/** Last non-street place before the postcode. */
export function townFromAddress(address: string): string | undefined {
  const match = UK_POSTCODE_RE.exec(address);
  const before = match ? address.slice(0, match.index) : address;
  const parts = before.split(/[\n,]+/).map((part) => part.trim()).filter(Boolean);
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index] ?? "";
    if (!part || /\d/.test(part)) continue;
    if (isUkPlaceName(part)) return part;
  }
  return undefined;
}

function extractCoveredAreas(html: string): string[] {
  const areas: string[] = [];
  const heading = /<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = heading.exec(html))) {
    const title = innerText(match[2]);
    if (!/\b(?:we cover|areas?\b|available at these locations|where we work|service areas?)\b/i.test(title)) {
      continue;
    }
    const level = Number(match[1]);
    const after = html.slice(match.index + match[0].length, match.index + match[0].length + 8000);
    const next = after.search(new RegExp(`<h[1-${level}]\\b`, "i"));
    const section = after.slice(0, next === -1 ? after.length : next);
    for (const item of visibleBlocks(section)) {
      const words = item.split(/\s+/);
      if (item.length < 2 || item.length > 40 || words.length > 4) continue;
      if (/[.?!]/.test(item) || isPlausiblePhone(item) || isPlausibleEmail(item)) continue;
      if (UK_POSTCODE_RE.test(item)) continue;
      if (!isUkPlaceName(item)) continue;
      areas.push(item);
    }
  }
  return [...new Set(areas)].slice(0, 16);
}

function rememberSurfaceEmail(
  into: ProminentHit[],
  email: string,
  pageUrl: string,
  siteHost: string,
  rank: number,
  source: FieldSource,
  confidence: FieldConfidence,
): void {
  const value = sanitizeUntrustedField(email, 120).toLowerCase();
  if (!value || !isPublicContactEmail(value, siteHost, pageUrl, true)) return;
  into.push({ value, url: pageUrl, rank, source, confidence });
}

function extractSurfaceEmails(html: string, pageUrl: string, siteHost: string): ProminentHit[] {
  const hits: ProminentHit[] = [];
  for (const match of html.matchAll(/href=["']mailto:([^"'?\s]+)["']/gi)) {
    rememberSurfaceEmail(
      hits,
      decodeEntities(safeDecode(match[1] ?? "")),
      pageUrl,
      siteHost,
      4,
      "contact_link",
      "medium",
    );
  }
  for (const match of html.matchAll(/\bdata-cfemail=["']([0-9a-f]+)["']/gi)) {
    const email = decodeCloudflareEmail(match[1] ?? "");
    if (!email) continue;
    rememberSurfaceEmail(hits, email, pageUrl, siteHost, 4, "contact_link", "medium");
  }
  const surfaces: string[] = [];
  for (const tag of ["header", "footer"]) {
    const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
    for (const match of html.matchAll(re)) surfaces.push(match[1] ?? "");
  }
  const contact = headingSectionHtml(
    html,
    /contact(?:\s+us|\s+details)?(?:\s+\w+)?|get in touch|find us/,
  );
  if (contact) surfaces.push(contact);
  if (isSiteContactUrl(pageUrl)) surfaces.push(html);
  const text = deobfuscateEmailText(surfaces.map((surface) => stripHtmlToText(surface)).join("\n"));
  for (const email of visibleEmailCandidates(text)) {
    rememberSurfaceEmail(hits, email, pageUrl, siteHost, 3, "heading", "medium");
  }
  return hits;
}

function extractChromePhones(html: string): string[] {
  const chunks: string[] = [];
  for (const tag of ["header", "footer"]) {
    const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
    let match: RegExpExecArray | null;
    while ((match = re.exec(html))) chunks.push(stripHtmlToText(match[1] ?? ""));
  }
  return dedupePhones(chunks.flatMap((chunk) => visiblePhoneCandidates(chunk)), 4);
}

function cleanedTitleName(html: string): string | undefined {
  const title = extractTitle(html);
  if (!title) return undefined;
  const first = title.split(/\s*[|–—]\s*/)[0]?.trim();
  const candidate = first && first.length >= 2 && first.length <= 80 ? first : title;
  return publicBusinessName(candidate);
}

function isGenericName(name: string): boolean {
  return GENERIC_NAME_RE.test(name.trim());
}

const HOSTLIKE_NAME_RE = /^(?:[\w-]+\.)+(?:uk|com|org|net|gov\.uk)$/i;
const ERROR_PAGE_TITLE_RE =
  /404|\bnot found\b|\berror\b|^untitled(?:\s+document)?$/i;

const SENTENCE_VERB_RE = /\s(?:are|is|we|provide)\s/i;
const SENTENCE_STARTER_RE = /^(?:welcome to|we are|our|established|since)\s+/i;

/** A name that is really a sentence, a tagline, or a place tacked on with a comma. */
function isSentenceName(value: string): boolean {
  if (value.length > 60) return true;
  if (/[.]$/.test(value)) return true;
  if (SENTENCE_VERB_RE.test(` ${value} `) || SENTENCE_VERB_RE.test(value)) return true;
  if (SENTENCE_STARTER_RE.test(value)) return true;
  if (
    /,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\.?$/.test(value) &&
    (value.length > 40 || /,\s*[A-Z][a-z]+,\s*[A-Z][a-z]+/.test(value))
  ) {
    return true;
  }
  return false;
}

function strippedName(value: string): string {
  return sanitizeUntrustedField(value, 200)
    .replace(/^welcome to\s+/i, "")
    .replace(/^about\s+/i, "")
    .replace(/^(?:by|copyright)\s+/i, "")
    .replace(/(?:[.\s]|©|\(c\))*proudly created with(?:\s+wix(?:\.com)?)?\.?$/i, "")
    .replace(/\s+all rights reserved\.?$/i, "")
    .replace(/^(?:all rights reserved|proudly created with(?:\s+wix(?:\.com)?)?)\.?$/i, "")
    .replace(/\s*(?:©|\(c\))\s*/g, " ")
    .replace(/\s+\b(?:19|20)\d{2}\b\s*$/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Drop "Welcome to" and names that are only a generic title, a hostname, or a sentence. */
export function publicBusinessName(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const stripped = strippedName(value);
  if (!stripped || isGenericName(stripped) || HOSTLIKE_NAME_RE.test(stripped)) return undefined;
  if (ERROR_PAGE_TITLE_RE.test(stripped)) return undefined;
  if (isSentenceName(stripped)) return undefined;
  if (/\.(?:jpe?g|png|gif|webp|svg|ico|pdf|docx?|html?)$/i.test(stripped)) return undefined;
  return stripped;
}

/** Stricter validation for business names: rejects 404/error pages, about pages, slugs, and other junk. */
export function validateBusinessName(value: string | undefined): boolean {
  if (!value) return false;
  // Check for "About X" patterns BEFORE stripping (strippedName removes "^about\s+")
  const trimmed = value.trim();
  if (/^about\s+/i.test(trimmed)) return false;
  if (/^our\s+story$/i.test(trimmed)) return false;

  const stripped = strippedName(value);
  if (!stripped) return false;
  if (isGenericName(stripped)) return false;
  if (HOSTLIKE_NAME_RE.test(stripped)) return false;
  if (ERROR_PAGE_TITLE_RE.test(stripped)) return false;
  if (isSentenceName(stripped)) return false;
  if (/\.(?:jpe?g|png|gif|webp|svg|ico|pdf|docx?|html?)$/i.test(stripped)) return false;
  // Reject obvious slug-like names: all lowercase, hyphens/underscores, no brand indicators
  // e.g., "plumbing-services", "about-us", "contact-us" but NOT "Lounge83", "Alleygates", "Thin"
  if (!/\s/.test(stripped) && stripped.length <= 30) {
    const lower = stripped.toLowerCase();
    if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(lower)) return false; // kebab-case slug
    if (/^(?:about|home|index|welcome|main|default|contact|services|blog|news|shop|store|admin|login|register|cart|checkout|faq|help|support|privacy|terms|legal|policy|cookie|cookies|us|me)$/i.test(stripped)) return false;
  }
  return true;
}

/** True when the text was dropped because it is a sentence or a place list, not a filename or a nav label. */
function nameRejectedAsSentence(value: string): boolean {
  const stripped = strippedName(value);
  if (!stripped || isGenericName(stripped) || HOSTLIKE_NAME_RE.test(stripped)) return false;
  if (ERROR_PAGE_TITLE_RE.test(stripped)) return false;
  if (/\.(?:jpe?g|png|gif|webp|svg|ico|pdf|docx?|html?)$/i.test(stripped)) return false;
  return isSentenceName(stripped);
}

const DOMAIN_BRAND_WORDS = [
  "accountants",
  "accounting",
  "automotive",
  "barbers",
  "bathrooms",
  "builders",
  "cleaning",
  "construction",
  "consulting",
  "croft",
  "dental",
  "electricians",
  "electrical",
  "garage",
  "gardens",
  "heating",
  "joinery",
  "lettings",
  "locksmiths",
  "motors",
  "plumbing",
  "properties",
  "roofing",
  "services",
  "service",
  "solicitors",
  "solicitor",
  "wirral",
  "liverpool",
  "manchester",
  "birkenhead",
  "chester",
  "london",
];

function segmentDomainSlug(slug: string): string[] | undefined {
  const compact = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (compact.length < 4) return undefined;
  const words = DOMAIN_BRAND_WORDS.slice().sort((a, b) => b.length - a.length);
  const out: string[] = [];
  let index = 0;
  while (index < compact.length) {
    const match = words.find((word) => compact.startsWith(word, index));
    if (match) {
      out.push(match);
      index += match.length;
      continue;
    }
    let end = index + 1;
    while (end < compact.length && !words.some((word) => compact.startsWith(word, end))) {
      end += 1;
    }
    const leftover = compact.slice(index, end);
    if (leftover.length < 2) return undefined;
    out.push(leftover);
    index = end;
  }
  return out.length >= 2 ? out : undefined;
}

function domainBrandTokens(siteHost: string): string[] {
  const slug = siteHost.replace(/^www\./i, "").split(".")[0] ?? "";
  return segmentDomainSlug(slug) ?? [];
}

function titledToken(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function domainBusinessName(siteHost: string): string | undefined {
  const slug = siteHost.replace(/^www\./i, "").split(".")[0]?.replace(/[^a-z0-9]+/gi, " ").trim() ?? "";
  if (slug.replace(/\s+/g, "").length < 4) return undefined;
  const tokens = domainBrandTokens(siteHost);
  const titled = tokens.length >= 2
    ? tokens.map(titledToken).join(" ")
    : slug.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  return publicBusinessName(titled);
}

function isDomainSlug(name: string, siteHost: string): boolean {
  if (/\s/.test(name)) return false;
  const slug = siteHost.replace(/^www\./i, "").split(".")[0]?.replace(/[^a-z0-9]/gi, "").toLowerCase() ?? "";
  const compact = name.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (!slug || compact !== slug) return false;
  // "Lounge83" is the domain label written as a brand. "lounge83" is the raw slug.
  if (/[A-Z]/.test(name) && /[a-z]/.test(name)) return false;
  return true;
}

function isShortNameFragment(name: string): boolean {
  const words = name.trim().split(/\s+/);
  if (words.length !== 1) return false;
  if (name.length <= 4) return true;
  if (/^[A-Z0-9]{2,}$/.test(name)) return true;
  return false;
}

type NameHit = { value: string; source: FieldSource; confidence: FieldConfidence; rank: number };

const TRADE_NAME_RE =
  /^(?:car|cars|servicing|service|services|plumber|plumbers|plumbing|electrician|electricians|electrical|electrics|heating|boiler|boilers|roofer|roofers|roofing|builder|builders|solicitor|solicitors|lawyer|lawyers|locksmith|locksmiths|joiner|joiners|painter|painters|cleaner|cleaners|gardener|gardeners|emergency|repairs|repair|gas|auto|garage|estate|agent|agents)$/i;

const TRADE_PLACE_RE =
  /^(?:wirral|liverpool|birkenhead|chester|manchester|london|leeds|york|birmingham|bromborough|eastham|merseyside|cheshire|wallasey|hoylake|bootle|southport|preston|warrington)$/i;

function clipVerbPhrase(value: string): string {
  const cut = value.split(SENTENCE_VERB_RE)[0]?.trim() || value.trim();
  return cut.replace(/[.\s]+$/g, "");
}

function namePieces(value: string): Array<{ text: string; order: number }> {
  const clipped = clipVerbPhrase(value);
  const parts = clipped
    .split(/\s*(?:\||–|—)\s*|\s+-\s+/)
    .map((part) => clipVerbPhrase(part))
    .filter(Boolean);
  const list = parts.length ? parts : [clipped];
  return list.map((text, order) => ({ text, order }));
}

function domainSlug(siteHost: string): string {
  return siteHost.replace(/^www\./i, "").split(".")[0]?.replace(/[^a-z0-9]/gi, "").toLowerCase() ?? "";
}

function coversDomainTokens(value: string, tokens: string[]): boolean {
  if (tokens.length < 2) return false;
  const words = value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return tokens.every((token) => words.includes(token));
}

function nameMatchesDomain(name: string, siteHost: string): boolean {
  const slug = domainSlug(siteHost);
  if (slug.length < 4) return false;
  const words = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 2 && !/^(?:ltd|limited|llp|plc|group|company|co|uk)$/.test(word));
  const compact = words.join("");
  if (compact === slug) return true;
  const trimmed = slug.replace(/(?:group|ltd|limited|company|co)$/i, "");
  if (trimmed.length >= 4 && trimmed !== slug && compact === trimmed) return true;
  return coversDomainTokens(name, domainBrandTokens(siteHost));
}

function isTradeLabel(name: string): boolean {
  if (
    /^(?:plumbers|electricians|builders|solicitors|roofers|locksmiths|painters|cleaners|gardeners|heating|plumber)\s+in\s+\S+/i.test(
      name,
    )
  ) {
    return true;
  }
  const words = name
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word && !/^(?:and|the|of|in|for|a|our|your|co)$/i.test(word));
  if (words.length < 2 || words.length > 6) return false;
  const trade = words.filter((word) => TRADE_NAME_RE.test(word));
  if (!trade.length) return false;
  const place = words.filter((word) => TRADE_PLACE_RE.test(word));
  const company = words.filter((word) => /^(?:ltd|limited|llp|plc|group|company)$/i.test(word));
  return trade.length + place.length + company.length === words.length && place.length + trade.length >= 2;
}

const TAGLINE_NAME_RE = /^(?:professional|quality|your local|leading|welcome to)\b/i;

/** A slogan that opens with a generic descriptor rather than the business brand. */
function isTaglineName(name: string): boolean {
  return TAGLINE_NAME_RE.test(name.trim());
}

/** "10 Heating Habits for 2026" is a list article, not a business. */
function isListicleName(name: string): boolean {
  return /^\d{1,3}\s+[A-Za-z]/.test(name.trim());
}

function isBoilerplateName(name: string): boolean {
  return /all rights reserved|proudly created with(?:\s+wix(?:\.com)?)?/i.test(name.trim());
}

function isArticlePage(url: string): boolean {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, "") || "/";
    return /\/(?:blog|news|articles?|posts?|insights|20\d{2})(?:\/|$)/i.test(path);
  } catch {
    return false;
  }
}

/** A trade word plus a town, such as "Electricians Liverpool" or "Wirral Estate Agents". */
function isServiceTown(name: string): boolean {
  if (isTradeLabel(name)) return true;
  const words = name
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word && !/^(?:and|the|of|in|for|a|our|your|co|ltd|limited|group)$/i.test(word));
  const trade = words.some((word) => TRADE_NAME_RE.test(word));
  if (trade && /\bin\s+[A-Z][a-z]+/.test(name)) return true;
  return trade && words.some((word) => TRADE_PLACE_RE.test(word));
}

/**
 * The shortest in-order span of the original words that covers the domain brand,
 * such as "Gregorys Heating and Plumbing" inside a longer title.
 */
function domainBrandPhrase(value: string, siteHost: string): string | undefined {
  const tokens = domainBrandTokens(siteHost);
  if (tokens.length < 2) return undefined;
  const words = [...value.matchAll(/[A-Za-z0-9]+/g)];
  if (!words.length) return undefined;
  const norms = words.map((word) => word[0].toLowerCase());
  let start = -1;
  let end = -1;
  let from = 0;
  for (const token of tokens) {
    const index = norms.indexOf(token, from);
    if (index < 0) return undefined;
    if (start < 0) start = index;
    end = index;
    from = index + 1;
  }
  const phrase = words.slice(start, end + 1).map((word) => word[0]).join(" ");
  if (!phrase || isSentenceName(phrase)) return undefined;
  return publicBusinessName(phrase);
}

const HOURS_BLEED_RE =
  /\b(?:closed\s+for\s+lunch|opening\s+hours|\d{1,2}(?::\d{2})?\s*(?:am|pm)(?:\s*(?:[-–—]+|to)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))?)\b/i;
const EMAIL_BLEED_RE = /\b[\w.+-]+@[\w.-]+\b/i;
const HOST_BLEED_RE =
  /\b(?:https?:\/\/\S+|www\.\S+|[\w-]+(?:\.[\w-]+)*\.(?:co\.uk|org\.uk|gov\.uk|com|org|net|uk))\b/i;
const PHONE_BLEED_RE = /\b0\d(?:[\s()-]*\d){8,}\b/;
const NAV_LEGAL_WORD_RE =
  /^(?:terms|conditions|complaints|procedure|contact|privacy|policy|cookies|cookie)$/i;

function hasContactBleed(value: string): boolean {
  return (
    HOURS_BLEED_RE.test(value) ||
    EMAIL_BLEED_RE.test(value) ||
    HOST_BLEED_RE.test(value) ||
    PHONE_BLEED_RE.test(value)
  );
}

function stripContactBleed(value: string): string {
  let next = value.replace(/\b[\w.+-]+@[\w.-]+\b/gi, " ");
  if (HOURS_BLEED_RE.test(value)) {
    next = next
      .replace(/\bclosed\s+for\s+lunch\b/gi, " ")
      .replace(/\bopening\s+hours\b/gi, " ")
      .replace(
        /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)(?:\s*(?:[-–—]+|to)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))?\b/gi,
        " ",
      )
      .replace(/\b(?:closed|lunch)\b/gi, " ");
  }
  next = next
    .replace(/\b(?:https?:\/\/\S+|www\.\S+)\b/gi, " ")
    .replace(/\b[\w-]+(?:\.[\w-]+)*\.(?:co\.uk|org\.uk|gov\.uk|com|org|net|uk)\b/gi, " ")
    .replace(/\b0\d(?:[\s()-]*\d){8,}\b/g, " ");
  return next.replace(/\s+/g, " ").trim();
}

function isNavLegalName(name: string): boolean {
  const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (!words.length) return false;
  const legal = words.filter((word) => NAV_LEGAL_WORD_RE.test(word)).length;
  return legal >= 2 || (legal >= 1 && legal * 2 >= words.length);
}

function acceptableName(text: string, siteHost: string): string | undefined {
  const bled = hasContactBleed(text);
  const source = bled ? stripContactBleed(text) : text;
  if (bled && (!source || !nameMatchesDomain(source, siteHost))) return undefined;
  const value = publicBusinessName(source);
  if (!value || isDomainSlug(value, siteHost)) return undefined;
  if (!validateBusinessName(value)) return undefined;
  if (/^[^A-Za-z0-9]/.test(value) || /(?:\.\.\.|…)\s*$/.test(value)) return undefined;
  const matchesDomain = nameMatchesDomain(value, siteHost);
  if (!matchesDomain && isNavLegalName(value)) return undefined;
  if (
    !matchesDomain &&
    (isTaglineName(value) || isServiceTown(value) || isListicleName(value) || isBoilerplateName(value))
  ) {
    return undefined;
  }
  if (isBoilerplateName(value)) return undefined;
  return value;
}

function candidateName(text: string, siteHost: string): string | undefined {
  const direct = acceptableName(text, siteHost);
  if (direct) return direct;
  if (!nameRejectedAsSentence(text)) return undefined;
  const phrase = domainBrandPhrase(text, siteHost);
  if (!phrase || isDomainSlug(phrase, siteHost)) return undefined;
  if ((isTaglineName(phrase) || isServiceTown(phrase)) && !nameMatchesDomain(phrase, siteHost)) {
    return undefined;
  }
  return phrase;
}

function leadName(value: string): string | undefined {
  const piece = namePieces(value)[0];
  return piece ? publicBusinessName(piece.text) : undefined;
}

function structuredNameConflicts(hits: NameHit[], chosen: string): boolean {
  const wanted = chosen.toLowerCase();
  return hits.some((hit) => {
    if ((hit.source !== "meta" && hit.source !== "title") || hit.rank < 55) return false;
    const lead = leadName(hit.value);
    return Boolean(lead) && lead!.toLowerCase() !== wanted;
  });
}

function platformPathSlug(pageUrl: string): string {
  try {
    const url = new URL(pageUrl);
    if (!/(?:^|\.)wixsite\.com$/i.test(url.hostname.replace(/^www\./i, ""))) return "";
    const segment = url.pathname.split("/").filter(Boolean)[0] ?? "";
    const slug = segment.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (slug.length < 4 || /^(?:site|website|home|index)$/.test(slug)) return "";
    return slug;
  } catch {
    return "";
  }
}

function matchesLaterPiece(value: string, siteHost: string, pathSlug: string): boolean {
  if (nameMatchesDomain(value, siteHost)) return true;
  if (!pathSlug) return false;
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase() === pathSlug;
}

function fallbackBusinessName(siteHost: string, pathSlug: string): string | undefined {
  const fromHost = domainBusinessName(siteHost);
  if (!pathSlug) return fromHost && validateBusinessName(fromHost) ? fromHost : undefined;
  const fromPath = publicBusinessName(pathSlug.replace(/[a-z]/, (letter) => letter.toUpperCase()));
  if (
    fromPath &&
    fromHost &&
    !fromHost.includes(" ") &&
    fromHost.toLowerCase().startsWith(fromPath.toLowerCase()) &&
    fromHost.length > fromPath.length
  ) {
    return validateBusinessName(fromPath) ? fromPath : undefined;
  }
  const chosen = fromHost ?? fromPath;
  return chosen && validateBusinessName(chosen) ? chosen : undefined;
}

function chooseBusinessName(hits: NameHit[], siteHost: string, pathSlug = ""): NameHit | undefined {
  const prepared: NameHit[] = [];
  for (const hit of hits) {
    for (const piece of namePieces(hit.value)) {
      const value = candidateName(piece.text, siteHost);
      if (!value) continue;
      if (piece.order > 0 && !matchesLaterPiece(value, siteHost, pathSlug)) continue;
      prepared.push({ ...hit, value });
    }
  }
  const structured = prepared.find((hit) => hit.source === "jsonld" || hit.source === "microdata");
  if (structured) {
    if (structured.confidence === "high" && structuredNameConflicts(hits, structured.value)) {
      return { ...structured, confidence: "medium" };
    }
    return structured;
  }
  const copyright = prepared.find((hit) => hit.source === "footer");
  if (copyright) {
    return nameMatchesDomain(copyright.value, siteHost)
      ? { ...copyright, confidence: "medium" }
      : copyright;
  }
  const visible = prepared.filter(
    (hit) => hit.source === "meta" || hit.source === "title" || hit.source === "heading",
  );
  const matched = visible.filter((hit) => nameMatchesDomain(hit.value, siteHost));
  const pool = matched.length ? matched : visible;
  pool.sort((a, b) => b.rank - a.rank);
  const top = pool[0];
  if (!top) return undefined;
  const longer = pool.filter((hit) => hit.value.trim().split(/\s+/).length >= 2);
  if (longer.length && isShortNameFragment(top.value)) {
    return longer.sort((a, b) => b.rank - a.rank)[0];
  }
  return validateBusinessName(top.value) ? top : undefined;
}

function logoAlt(html: string): string | undefined {
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0] ?? "";
    if (!/logo/i.test(tag)) continue;
    const alt = /alt=["']([^"']+)["']/i.exec(tag);
    if (alt?.[1]) return decodeEntities(alt[1]);
  }
  return undefined;
}

const COPYRIGHT_NOISE_WORD =
  /^(?:find|us|our|the|home|menu|terms|privacy|policy|designed|by|copyright|all|rights|reserved|welcome|to)$/i;

function tidyCopyrightFragment(value: string): string | undefined {
  const cleaned = value
    .replace(/©|\(c\)|copyright/gi, " ")
    .replace(/\b(?:19|20)\d{2}\b/g, " ")
    .replace(/\bby\b/gi, " ")
    .replace(/[^A-Za-z0-9&'’. -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(/\s+/).filter((word) => word && !COPYRIGHT_NOISE_WORD.test(word));
  const kept = words.slice(-6);
  for (let size = Math.floor(kept.length / 2); size >= 1; size -= 1) {
    const tail = kept.slice(-size).join(" ").toLowerCase();
    const prev = kept.slice(-size * 2, -size).join(" ").toLowerCase();
    if (prev && prev === tail) {
      kept.splice(-size, size);
      break;
    }
  }
  const name = kept.join(" ").trim();
  if (!name || isBoilerplateName(name)) return undefined;
  return name;
}

function copyrightFromText(text: string): string | undefined {
  const flat = text.replace(/\s+/g, " ");
  const wix = /(?:^|[\s©])by\s+([A-Z][^.]{1,80}?)\.?\s*proudly created with(?:\s+wix(?:\.com)?)?/i.exec(flat);
  if (wix?.[1]) {
    const name = tidyCopyrightFragment(wix[1]);
    if (name) return name;
  }
  let rightsAt = -1;
  for (const match of flat.matchAll(/all rights reserved/gi)) {
    if (match.index !== undefined) rightsAt = match.index;
  }
  if (rightsAt >= 0) {
    const name = tidyCopyrightFragment(flat.slice(Math.max(0, rightsAt - 80), rightsAt));
    if (name) return name;
  }
  const after = /(?:©|\(c\))\s*(?:copyright\s+)?(?:(?:19|20)\d{2}\s+)?(?:by\s+)?([A-Za-z][^|.\n]{1,80})/i.exec(flat);
  if (after?.[1]) return tidyCopyrightFragment(after[1]);
  return undefined;
}

function copyrightName(html: string): string | undefined {
  const footers = [...html.matchAll(/<footer\b[^>]*>([\s\S]*?)<\/footer>/gi)].map((match) => match[1] ?? "");
  for (const footer of footers) {
    const name = copyrightFromText(htmlToPlainText(footer));
    if (name) return name;
  }
  return copyrightFromText(htmlToPlainText(html));
}

export function extractSameOriginScriptSrcs(
  html: string,
  pageUrl: URL,
): string[] {
  const srcs: string[] = [];
  const re = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    let next: URL;
    try {
      next = new URL(raw, pageUrl);
    } catch {
      continue;
    }
    if (next.protocol !== "https:") continue;
    if (next.hostname !== pageUrl.hostname) continue;
    next.hash = "";
    srcs.push(next.toString());
  }
  return [...new Set(srcs)].slice(0, 4);
}

function decodeJsStringBody(raw: string): string | undefined {
  try {
    return asUntrustedText(JSON.parse(`"${raw}"`), 500);
  } catch {
    return undefined;
  }
}

function quotedJsStrings(fragment: string, limit = 64): string[] {
  const out: string[] = [];
  const re = /"((?:\\.|[^"\\])*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(fragment)) && out.length < limit) {
    const value = decodeJsStringBody(match[1] ?? "");
    if (value) out.push(value);
  }
  return out;
}

/**
 * Extract only explicit schema-like LocalBusiness literals from a public,
 * same-origin client bundle. The script is never executed.
 *
 * This is intentionally narrow: it exists for static SPA shells where the
 * business facts that will be rendered are compiled into the site's own JS.
 */
export function extractStructuredBusinessHtmlFromScript(
  script: string,
): string | undefined {
  const localBusiness = /["@']?@type["@']?\s*:\s*["']LocalBusiness["']/gi;
  const regions: string[] = [];
  let marker: RegExpExecArray | null;
  while ((marker = localBusiness.exec(script)) && regions.length < 3) {
    regions.push(
      script.slice(
        Math.max(0, marker.index - 1000),
        Math.min(script.length, marker.index + 14_000),
      ),
    );
  }
  if (!regions.length) return undefined;

  const hours: string[] = [];
  const services: string[] = [];
  const phones: string[] = [];
  const emails: string[] = [];
  let businessName = "";

  for (const region of regions) {
    if (!businessName) {
      const nameMatch = /\bname\s*:\s*"((?:\\.|[^"\\])*)"/i.exec(region);
      const name = nameMatch?.[1] ? decodeJsStringBody(nameMatch[1]) : undefined;
      if (name && !GENERIC_NAV_RE.test(name)) businessName = name;
    }

    for (const match of region.matchAll(
      /\bopeningHours\s*:\s*\[([\s\S]{1,2000}?)\]/gi,
    )) {
      hours.push(...quotedJsStrings(match[1] ?? "", 24));
    }

    for (const match of region.matchAll(
      /\bitemOffered\s*:\s*\{[\s\S]{0,500}?\bname\s*:\s*"((?:\\.|[^"\\])*)"/gi,
    )) {
      const value = decodeJsStringBody(match[1] ?? "");
      if (value && !GENERIC_NAV_RE.test(value)) services.push(value);
    }

    for (const match of region.matchAll(
      /\bserviceType\s*:\s*"((?:\\.|[^"\\])*)"/gi,
    )) {
      const value = decodeJsStringBody(match[1] ?? "");
      if (value) services.push(value);
    }

    for (const match of region.matchAll(
      /\btelephone\s*:\s*"((?:\\.|[^"\\])*)"/gi,
    )) {
      const value = decodeJsStringBody(match[1] ?? "");
      if (value && isPlausiblePhone(value)) phones.push(value);
    }

    for (const match of region.matchAll(
      /\bemail\s*:\s*"((?:\\.|[^"\\])*)"/gi,
    )) {
      const value = decodeJsStringBody(match[1] ?? "");
      if (value && isPlausibleEmail(value)) emails.push(value);
    }
  }

  const cleanHours = [...new Set(hours)].slice(0, 14);
  const cleanServices = [...new Set(services)].slice(0, 24);
  const cleanPhones = [...new Set(phones)].slice(0, 4);
  const cleanEmails = [...new Set(emails)].slice(0, 4);

  if (
    !businessName &&
    !cleanHours.length &&
    !cleanServices.length &&
    !cleanPhones.length &&
    !cleanEmails.length
  ) {
    return undefined;
  }

  const record: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
  };
  if (businessName) record.name = businessName;
  if (cleanHours.length) record.openingHours = cleanHours;
  if (cleanServices.length) {
    record.makesOffer = cleanServices.map((name) => ({
      itemOffered: { "@type": "Service", name },
    }));
  }
  if (cleanPhones.length === 1) record.telephone = cleanPhones[0];
  else if (cleanPhones.length > 1) record.telephone = cleanPhones;
  if (cleanEmails.length === 1) record.email = cleanEmails[0];
  else if (cleanEmails.length > 1) record.email = cleanEmails;

  return `<script type="application/ld+json">${JSON.stringify(record)}</script>`;
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
  { re: /\/(contact|contact-us|get-in-touch)\/?$/i, weight: 12 },
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
  const normalized = value.replace(/([^\n])\n(?=Q:)/g, "$1\n\n");
  const pairs: Array<{ question: string; answer: string }> = [];
  const re = /Q:\s*([^\n]+)\nA:\s*([\s\S]*?)(?=\n\n(?:Q:|Phone:|Email:)|$)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(normalized)) && pairs.length < 12) {
    const question = asUntrustedText(match[1], 200).trim();
    const answer = cleanFaqAnswer(match[2] ?? "").replace(/\n+Q:[\s\S]*$/i, "").trim();
    if (question.includes("?") && acceptableFaqAnswer(answer)) {
      pairs.push({ question, answer });
    }
  }
  return pairs.length ? pairs : undefined;
}

function isServiceSourceUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, "") || "/";
    if (/\/(?:blog|news|articles?|posts?|insights|20\d{2})(?:\/|$)/i.test(path)) return false;
    if (path === "/") return true;
    return /\/(?:services?|our-services|what-we-do|what-we-offer|treatments|prices|repairs|support)(?:\/|$)/i.test(path);
  } catch {
    return false;
  }
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
  const jsonLdServices: string[] = [];
  const jsonLdFaqs: string[] = [];
  const microServices: string[] = [];
  const locations: string[] = [];
  const addressHits: ProminentHit[] = [];
  const phoneHits: ProminentHit[] = [];
  const emailHits: ProminentHit[] = [];
  const hourHits: ProminentHit[] = [];
  const nameHits: NameHit[] = [];
  const branches: BusinessBranch[] = [];
  const pricing: string[] = [];
  let locationMeta: BusinessFactMeta["locations"];
  let placeFallback: { text: string; url: string } | undefined;
  let siteHost = "";
  try {
    siteHost = new URL(pages[0]?.url ?? "").hostname;
  } catch {
    siteHost = "";
  }

  const pushPhones = (
    values: string[],
    pageUrl: string,
    rank: number,
    source: FieldSource,
    confidence: FieldConfidence,
  ) => {
    for (const value of values) {
      const canonical = normalizeUkPhone(value);
      if (!canonical) continue;
      phoneHits.push({
        value: canonical,
        url: pageUrl,
        rank,
        source,
        confidence,
        order: phoneHits.length,
      });
    }
  };
  const pushHours = (
    value: string | undefined,
    pageUrl: string,
    rank: number,
    source: FieldSource,
    confidence: FieldConfidence,
  ) => {
    const text = value ? plainHours(value) : "";
    if (!text) return;
    hourHits.push({ value: text, url: pageUrl, rank, source, confidence });
  };

  const rememberLocations = (
    values: string[],
    source: FieldSource,
    confidence: "high" | "medium" | "low",
    pageUrl: string,
  ) => {
    const parted = partitionLocations(values);
    if (parted.addresses.length) {
      for (const address of parted.addresses) {
        const cleaned = stripAddressCodes(address);
        if (!cleaned || !isAcceptableAddress(cleaned)) continue;
        const anchored = UK_POSTCODE_RE.test(cleaned) ? addressAroundPostcode(cleaned) : undefined;
        const text = anchored ?? withFormattedPostcode(cleaned);
        if (!isAcceptableAddress(text)) continue;
        addressHits.push({
          value: text,
          url: pageUrl,
          rank: source === "heading" ? 6 : 5,
          source,
          confidence,
        });
      }
    }
    const places = parted.areas.filter((area) => isUkPlaceName(area));
    if (places.length) {
      locations.push(...places);
      locationMeta ||= factMetaFor(source, confidence, pageUrl);
    }
  };

  for (const page of pages) {
    const factUrl = factPageUrl(page.url, pages[0]?.url ?? page.url);
    const visibleHtml = withoutCodeScripts(page.html);
    const jsonLd = extractJsonLd(page.html);
    if (jsonLd.businessName) {
      nameHits.push({ value: jsonLd.businessName, source: "jsonld", confidence: "high", rank: 40 });
    }
    setField(draft, fieldMeta, "greeting", jsonLd.greeting, "jsonld", "high");
    pushHours(jsonLd.hours, factUrl, 5, "jsonld", "high");
    if (jsonLd.services) jsonLdServices.push(jsonLd.services);
    if (jsonLd.faqs) jsonLdFaqs.push(jsonLd.faqs);
    if (jsonLd.locations.length) {
      rememberLocations(jsonLd.locations, "jsonld", "high", factUrl);
    }
    if (jsonLd.branches.length >= 2) branches.push(...jsonLd.branches);
    pricing.push(...extractPriceMentions(visibleHtml));
    pushPhones(jsonLd.phones, factUrl, 5, "jsonld", "high");
    for (const email of jsonLd.emails) {
      rememberSurfaceEmail(emailHits, email, factUrl, siteHost, 5, "jsonld", "high");
    }

    const micro = extractMicrodata(page.html);
    if (micro.businessName) {
      nameHits.push({ value: micro.businessName, source: "microdata", confidence: "high", rank: 38 });
    }
    if (!draft.greeting) {
      setField(draft, fieldMeta, "greeting", micro.greeting, "microdata", "high");
    }
    pushHours(micro.hours, factUrl, 5, "microdata", "high");
    if (micro.services) microServices.push(micro.services);
    if (micro.locations.length) {
      rememberLocations(micro.locations, "microdata", "high", factUrl);
    }
    pushPhones(micro.phones, factUrl, 5, "microdata", "high");
    for (const email of micro.emails) {
      rememberSurfaceEmail(emailHits, email, factUrl, siteHost, 5, "microdata", "high");
    }

    const links = extractTelMailto(visibleHtml);
    pushPhones(links.phones, factUrl, 4, "contact_link", "medium");
    emailHits.push(...extractSurfaceEmails(visibleHtml, factUrl, siteHost));

    const visibleContact = extractVisibleContactSection(visibleHtml);
    rememberLocations(visibleContact.locations, "heading", "medium", factUrl);
    pushPhones(visibleContact.phones, factUrl, 3, "heading", "medium");
    for (const email of visibleContact.emails) {
      rememberSurfaceEmail(emailHits, email, factUrl, siteHost, 3, "heading", "medium");
    }
    pushPhones(extractChromePhones(visibleHtml), factUrl, 3, "pattern", "medium");
    for (const footer of visibleHtml.matchAll(/<footer\b[^>]*>([\s\S]*?)<\/footer>/gi)) {
      const address = addressAroundPostcode(htmlToPlainText(footer[1] ?? ""));
      if (!address) continue;
      addressHits.push({
        value: address,
        url: factUrl,
        rank: 7,
        source: "footer",
        confidence: "medium",
        order: addressHits.length,
      });
    }
    if (visibleContact.place && !placeFallback && isAcceptableAddress(visibleContact.place)) {
      placeFallback = { text: visibleContact.place, url: factUrl };
    }
    const covered = extractCoveredAreas(visibleHtml);
    if (covered.length) {
      locations.push(...covered);
      locationMeta ||= factMetaFor("heading", "medium", page.url);
    }
  }

  for (const page of pages) {
    const siteName = metaContent(page.html, "og:site_name");
    if (siteName) nameHits.push({ value: siteName, source: "meta", confidence: "high", rank: 60 });
    const title = extractTitle(page.html);
    if (title) {
      const pieces = namePieces(title);
      let pushedAny = false;
      for (const piece of pieces) {
        const value = candidateName(piece.text, siteHost);
        if (value && validateBusinessName(value)) {
          const pieceRank = 55 - piece.order * 5;
          nameHits.push({ value, source: "title", confidence: "medium", rank: pieceRank });
          pushedAny = true;
        }
      }
      const branded = !isArticlePage(page.url) || pieces.some((piece) => {
        const value = candidateName(piece.text, siteHost);
        return Boolean(value && nameMatchesDomain(value, siteHost));
      });
      if (branded) nameHits.push({ value: title, source: "title", confidence: "medium", rank: 55 });
    }
    const logo = logoAlt(page.html);
    if (logo) nameHits.push({ value: logo, source: "meta", confidence: "medium", rank: 20 });
    const h1 = extractH1(page.html);
    if (h1 && !isArticlePage(page.url)) {
      nameHits.push({ value: h1, source: "heading", confidence: "low", rank: 15 });
    }
    const copyright = copyrightName(page.html);
    if (copyright) nameHits.push({ value: copyright, source: "footer", confidence: "low", rank: 10 });
  }
  const pathSlug = platformPathSlug(pages[0]?.url ?? "");
  const chosenName = chooseBusinessName(nameHits, siteHost, pathSlug);
  if (chosenName) {
    setField(
      draft,
      fieldMeta,
      "businessName",
      chosenName.value,
      chosenName.source,
      chosenName.confidence,
    );
  } else {
    // Skip domain fallback for error pages (404, etc.)
    const mainPage = pages[0];
    const mainTitle = mainPage ? extractTitle(mainPage.html) : "";
    const mainUrl = mainPage?.url ?? "";
    const isErrorPage = ERROR_PAGE_TITLE_RE.test(mainTitle ?? "") || /\/404|\/error|\/not-found/i.test(mainUrl);
    if (!isErrorPage) {
      const fromDomain = fallbackBusinessName(siteHost, pathSlug);
      if (fromDomain) {
        setField(draft, fieldMeta, "businessName", fromDomain, "pattern", "low");
      }
    }
  }

  for (const page of pages) {
    const section = headingSectionHtml(
      withoutCodeScripts(page.html),
      /opening hours|business hours|our hours|office hours/,
    );
    if (section) pushHours(section, page.url, 3, "heading", "medium");
  }
  for (const page of pages) {
    if (hourHits.some((hit) => hit.url === page.url)) continue;
    const patterned = extractHoursFromVisibleText(withoutCodeScripts(page.html));
    if (patterned) pushHours(patterned, page.url, 1, "pattern", "low");
  }
  const pageUrls = pages.map((page) => page.url);
  const hourPick = chooseOpeningHours(hourHits, pageUrls);
  const hoursAssessment = hourPick
    ? assessOpeningHours(hourPick.value, hourHits.map((hit) => hit.value).join("\n"))
    : undefined;
  if (hourPick && hoursAssessment) {
    draft.hours = hoursAssessment.value;
    fieldMeta.hours = factMetaFor(
      hourPick.source,
      hoursAssessment.partial ? "low" : hourPick.confidence,
      hourPick.url,
    );
    if (hoursAssessment.partial) warnings.push("hours_partial");
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
      const grounded = extractGroundedServices(withoutCodeScripts(page.html), page.url);
      if (grounded) {
        setField(draft, fieldMeta, "services", grounded, "heading", "medium");
        break;
      }
    }
  }
  if (!draft.services) {
    for (const page of pages) {
      if (!isServiceSourceUrl(page.url)) continue;
      const fromTrades = extractTradeServiceHeadings(withoutCodeScripts(page.html));
      if (fromTrades) {
        setField(draft, fieldMeta, "services", fromTrades, "heading", "medium");
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
  const phonePicks = chooseProminentPhones(phoneHits, pageUrls, 2);
  const phonePick = phonePicks[0];
  const emailPick = chooseProminentEmail(emailHits, pageUrls, siteHost);
  const publicEmails = emailPick ? [emailPick.value] : [];
  const publicPhones = phonePicks.map((hit) => hit.value);
  if (!draft.greeting) {
    warnings.push("greeting_not_found");
  }
  if (!draft.businessName) warnings.push("business_name_not_found");
  if (!draft.hours) warnings.push("hours_not_found");
  if (draft.services) {
    const kept = draft.services
      .split(/\n+/)
      .map((item) => sanitizeUntrustedField(item, 80))
      .filter((item) => isServicePhrase(item));
    const uniqueServices = [...new Set(kept)].slice(0, 12);
    if (uniqueServices.length) draft.services = uniqueServices.join("\n");
    else delete draft.services;
  }
  if (draft.hours) draft.hours = sanitizeUntrustedField(draft.hours, 500);
  if (draft.faqs) {
    const pairs = parseFaqFacts(draft.faqs);
    if (pairs?.length) {
      draft.faqs = pairs.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n");
    } else {
      delete draft.faqs;
    }
  }
  if (!draft.services) warnings.push("services_not_found");
  if (!draft.faqs) warnings.push("faqs_not_found");
  for (const key of Object.keys(fieldMeta) as (keyof DraftFieldMeta)[]) {
    if (fieldMeta[key]?.confidence === "low") {
      warnings.push(`${key}_low_confidence`);
    }
  }
  warnings.push("untrusted_crawl_text");

  const cleanDraft = omitEmpty(draft);
  const uniqueLocations = serviceAreaNames(locations.map((item) => asUntrustedText(item, 500)));
  const uniqueBranches = distinctBranches(branches);
  const uniquePricing = [...new Set(pricing)].slice(0, 12);
  const uniquePhones = publicPhones;
  const uniqueEmails = publicEmails;
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
  if (placeFallback && isAcceptableAddress(placeFallback.text)) {
    addressHits.push({
      value: placeFallback.text,
      url: placeFallback.url,
      rank: 1,
      source: "heading",
      confidence: "low",
    });
  }
  const addressPick = chooseProminentAddress(addressHits, pageUrls);
  if (addressPick) {
    facts.address = addressPick.value;
    factMeta.address = factMetaFor(addressPick.source, addressPick.confidence, addressPick.url);
  }
  let locationList = uniqueLocations;
  let resolvedLocationMeta = locationMeta;
  if (!locationList.length && addressPick) {
    const town = townFromAddress(addressPick.value);
    if (town) {
      locationList = [town];
      resolvedLocationMeta = factMetaFor(addressPick.source, "low", addressPick.url);
    }
  }
  if (locationList.length) {
    facts.locations = locationList;
    if (resolvedLocationMeta) factMeta.locations = resolvedLocationMeta;
  }
  if (uniqueBranches.length >= 2) facts.branches = uniqueBranches;
  if (uniquePricing.length) facts.pricing = uniquePricing;
  if (uniquePhones.length || uniqueEmails.length) {
    facts.contact = {
      ...(uniquePhones.length ? { phones: uniquePhones } : {}),
      ...(uniqueEmails.length ? { emails: uniqueEmails } : {}),
    };
    const contactHit = [phonePick, emailPick]
      .filter((hit): hit is ProminentHit => Boolean(hit))
      .sort((a, b) => b.rank - a.rank)[0];
    if (contactHit) {
      const lowered = phonePick?.confidence === "low" || emailPick?.confidence === "low";
      factMeta.contact = factMetaFor(
        contactHit.source,
        lowered ? "low" : contactHit.confidence,
        contactHit.url,
      );
    }
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
