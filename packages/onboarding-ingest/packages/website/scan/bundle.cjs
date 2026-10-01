"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/onboarding-ingest/packages/website/scan/index.ts
var index_exports = {};
__export(index_exports, {
  main: () => main
});
module.exports = __toCommonJS(index_exports);

// packages/onboarding-ingest/src/extract.ts
var MAX_FIELD_CHARS = 4e3;
var USER_AGENT = "MaintenanceOS-OnboardingScan/0.1 (+https://github.com/chapelgate/maintenanceos-website; untrusted-data)";
var DAY_RE = /\b(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekdays?|weekends?)\b/i;
var TIME_RE = /\b(\d{1,2}[:.]\d{2}|\d{1,2}\s?(am|pm))\b/i;
var TIME_RANGE_RE = /\d{1,2}(?:[:.]\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)?\s*(?:-|–|—|to)\s*\d{1,2}(?:[:.]\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)?/i;
var ALL_HOURS_RE = /\b(open(?:ing)?(?:\s+hours)?|hours).{0,24}(24\s*\/\s*7|24\s*hours)\b|\b(24\s*\/\s*7|24\s*hours).{0,24}(open(?:ing)?|hours)\b/i;
var GENERIC_NAME_RE = /^(home|welcome|untitled|index|website)$/i;
var GENERIC_NAV_RE = /^(home|homepage|about(?: us)?|our story|contact(?: us)?|get in touch|stay in touch|support us|connect|links|residents?|blog|news|privacy(?: policy)?|terms(?: of (?:service|use)?)?|login|log in|sign in|sign up|register|cart|basket|checkout|faqs?|gallery|testimonials?|reviews?|careers?|jobs?|book now|get a quote|request a quote|menu|skip to (?:content|main)|cookies?|(?:our )?services)$/i;
var CTA_QUESTION_RE = /^(ready to|get started|cookie|subscribe|sign up)/i;
var BUSINESS_ITEMTYPE_RE = /schema\.org\/(LocalBusiness|Organization|ProfessionalService|Store|Plumber|Electrician|Locksmith|RoofingContractor|HVACBusiness|GeneralContractor|HomeAndConstructionBusiness|Attorney|Dentist|Physician|AutoRepair|FoodEstablishment)\b/i;
var BUSINESS_TYPES = /* @__PURE__ */ new Set([
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
  "foodestablishment"
]);
function asUntrustedText(value, max = MAX_FIELD_CHARS) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/[ \t\f\v]+/g, " ").replace(/\s*\n\s*/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
}
function decodeEntities(raw) {
  return raw.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    const code = Number.parseInt(hex, 16);
    return Number.isFinite(code) ? String.fromCodePoint(code) : "";
  }).replace(/&#(\d+);/g, (_, dec) => {
    const code = Number.parseInt(dec, 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : "";
  });
}
function stripHtmlToText(html) {
  const withoutNoise = html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ");
  return asUntrustedText(
    decodeEntities(withoutNoise.replace(/<[^>]+>/g, " "))
  );
}
function innerText(fragment) {
  return asUntrustedText(decodeEntities(fragment.replace(/<[^>]+>/g, " ")));
}
function firstMatch(html, re) {
  const m = re.exec(html);
  if (!m?.[1]) return void 0;
  const text = asUntrustedText(decodeEntities(m[1].replace(/<[^>]+>/g, " ")));
  return text || void 0;
}
function extractTitle(html) {
  return firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
}
function extractH1(html) {
  return firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
}
function metaContent(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta\\b[^>]*?(?:property|name)=["']${escaped}["'][^>]*?content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta\\b[^>]*?content=["']([^"']+)["'][^>]*?(?:property|name)=["']${escaped}["'][^>]*>`,
      "i"
    )
  ];
  for (const re of patterns) {
    const m = re.exec(html);
    if (m?.[1]) {
      const text = asUntrustedText(decodeEntities(m[1]));
      if (text) return text;
    }
  }
  return void 0;
}
function parseJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while (m = re.exec(html)) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
    }
  }
  return blocks;
}
function asRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value;
}
function flattenJsonLd(value, out) {
  if (Array.isArray(value)) {
    for (const item of value) flattenJsonLd(item, out);
    return;
  }
  const rec = asRecord(value);
  if (!rec) return;
  out.push(rec);
  if (rec["@graph"] !== void 0) flattenJsonLd(rec["@graph"], out);
}
function typesOf(rec) {
  const raw = rec["@type"];
  if (typeof raw === "string") return [raw.toLowerCase()];
  if (Array.isArray(raw)) {
    return raw.filter((item) => typeof item === "string").map((item) => item.toLowerCase());
  }
  return [];
}
function stringField(value) {
  if (typeof value === "string") {
    const text = asUntrustedText(value);
    return text || void 0;
  }
  if (Array.isArray(value)) {
    const parts = value.map((item) => typeof item === "string" ? asUntrustedText(item) : "").filter(Boolean);
    return parts.length ? parts.join("\n") : void 0;
  }
  return void 0;
}
function nameOfOffer(value) {
  const rec = asRecord(value);
  if (!rec) return stringField(value);
  return stringField(rec.name) || nameOfOffer(rec.itemOffered) || stringField(rec.serviceType);
}
function collectServices(rec, into) {
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
            const name2 = nameOfOffer(el);
            if (name2) into.push(name2);
          }
          continue;
        }
        const name = nameOfOffer(item);
        if (name) into.push(name);
      }
    } else if (value !== void 0) {
      const recItem = asRecord(value);
      if (recItem) collectServices(recItem, into);
      const name = nameOfOffer(value);
      if (name) into.push(name);
    }
  }
}
function schemaDayToken(value) {
  return asUntrustedText(value.replace(/https?:\/\/schema\.org\//gi, ""));
}
function daysFromSchema(value) {
  if (typeof value === "string") {
    const text = schemaDayToken(value);
    return text || void 0;
  }
  if (Array.isArray(value)) {
    const days = value.map((item) => typeof item === "string" ? schemaDayToken(item) : "").filter(Boolean);
    return days.length ? days.join(", ") : void 0;
  }
  return void 0;
}
function formatHoursSpec(value) {
  const rec = asRecord(value);
  if (!rec) return stringField(value);
  const days = daysFromSchema(rec.dayOfWeek);
  const opens = stringField(rec.opens);
  const closes = stringField(rec.closes);
  if (days && opens && closes) return `${days} ${opens}\u2013${closes}`;
  if (opens && closes) return `${opens}\u2013${closes}`;
  return stringField(rec.description);
}
function collectHours(rec, into) {
  const hours = stringField(rec.openingHours);
  if (hours) into.push(hours);
  const spec = rec.openingHoursSpecification;
  if (Array.isArray(spec)) {
    for (const item of spec) {
      const line = formatHoursSpec(item);
      if (line) into.push(line);
    }
  } else if (spec !== void 0) {
    const line = formatHoursSpec(spec);
    if (line) into.push(line);
  }
}
function collectFaqs(rec, into) {
  const entities = rec.mainEntity;
  const list = Array.isArray(entities) ? entities : entities ? [entities] : [];
  for (const item of list) {
    const q = asRecord(item);
    if (!q) continue;
    const question = stringField(q.name) || stringField(q.question);
    const answerRec = asRecord(q.acceptedAnswer);
    const answer = answerRec && (stringField(answerRec.text) || stringField(answerRec.name)) || stringField(q.acceptedAnswer);
    if (question && answer) {
      into.push(`Q: ${question}
A: ${answer}`);
    }
  }
}
function pushContactValue(value, into) {
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
  if (rec.telephone !== void 0) pushContactValue(rec.telephone, into);
  if (rec.email !== void 0) pushContactValue(rec.email, into);
}
function collectContact(rec, phones, emails) {
  if (rec.telephone !== void 0) pushContactValue(rec.telephone, phones);
  if (rec.email !== void 0) pushContactValue(rec.email, emails);
  if (rec.contactPoint !== void 0) {
    const points = Array.isArray(rec.contactPoint) ? rec.contactPoint : [rec.contactPoint];
    for (const point of points) {
      const recPoint = asRecord(point);
      if (!recPoint) continue;
      if (recPoint.telephone !== void 0) {
        pushContactValue(recPoint.telephone, phones);
      }
      if (recPoint.email !== void 0) pushContactValue(recPoint.email, emails);
    }
  }
}
function countryText(value) {
  const direct = stringField(value);
  if (direct) return direct;
  const rec = asRecord(value);
  if (!rec) return void 0;
  return stringField(rec.name);
}
function formatPostalAddress(value) {
  const direct = stringField(value);
  if (direct) return direct;
  const rec = asRecord(value);
  if (!rec) return void 0;
  const parts = [
    stringField(rec.streetAddress),
    stringField(rec.addressLocality),
    stringField(rec.addressRegion),
    stringField(rec.postalCode),
    countryText(rec.addressCountry)
  ].filter((item) => Boolean(item));
  return parts.length ? asUntrustedText(parts.join(", "), 500) : void 0;
}
function locationText(value) {
  const direct = stringField(value);
  if (direct) return direct;
  const rec = asRecord(value);
  if (!rec) return void 0;
  return formatPostalAddress(rec.address) || formatPostalAddress(rec) || stringField(rec.name);
}
function collectLocations(rec, into) {
  for (const key of ["address", "location", "areaServed"]) {
    const value = rec[key];
    const list = Array.isArray(value) ? value : value !== void 0 ? [value] : [];
    for (const item of list) {
      const text = locationText(item);
      if (text) into.push(text);
    }
  }
}
function isBusinessNode(rec) {
  const types = typesOf(rec);
  if (types.some((t) => BUSINESS_TYPES.has(t) || t.includes("business"))) {
    return true;
  }
  if (types.includes("faqpage") || types.includes("question") || types.includes("webpage")) {
    return false;
  }
  if (rec.openingHours !== void 0 || rec.openingHoursSpecification !== void 0 || rec.makesOffer !== void 0 || rec.telephone !== void 0) {
    return types.length === 0;
  }
  return types.length === 0 && typeof rec.name === "string";
}
function extractJsonLd(html) {
  const nodes = [];
  for (const block of parseJsonLdBlocks(html)) flattenJsonLd(block, nodes);
  let businessName;
  let greeting;
  const hours = [];
  const services = [];
  const faqs = [];
  const locations = [];
  const phones = [];
  const emails = [];
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
  const unique = (items) => [...new Set(items)].slice(0, 16);
  return {
    businessName,
    greeting,
    hours: unique(hours).join("\n") || void 0,
    services: unique(services).join("\n") || void 0,
    faqs: unique(faqs).join("\n\n") || void 0,
    locations: unique(locations),
    phones: unique(phones),
    emails: unique(emails)
  };
}
function itempropValues(html, prop) {
  const escaped = prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const found = [];
  const patterns = [
    new RegExp(
      `itemprop=["']${escaped}["'][^>]*content=["']([^"']+)["']`,
      "gi"
    ),
    new RegExp(
      `content=["']([^"']+)["'][^>]*itemprop=["']${escaped}["']`,
      "gi"
    ),
    new RegExp(
      `<([a-z0-9]+)\\b[^>]*itemprop=["']${escaped}["'][^>]*>([\\s\\S]*?)</\\1>`,
      "gi"
    )
  ];
  for (const re of patterns) {
    let m;
    while (m = re.exec(html)) {
      const raw = m[2] ?? m[1];
      if (!raw) continue;
      const text = innerText(raw);
      if (text) found.push(text);
    }
  }
  return [...new Set(found)];
}
function businessMicrodataSlice(html) {
  const match = BUSINESS_ITEMTYPE_RE.exec(html);
  if (!match || match.index === void 0) return void 0;
  return html.slice(match.index, match.index + 12e3);
}
function extractMicrodata(html) {
  const scoped = businessMicrodataSlice(html);
  const hoursSrc = scoped ?? html;
  const addressParts = [
    itempropValues(hoursSrc, "streetAddress")[0],
    itempropValues(hoursSrc, "addressLocality")[0],
    itempropValues(hoursSrc, "addressRegion")[0],
    itempropValues(hoursSrc, "postalCode")[0],
    itempropValues(hoursSrc, "addressCountry")[0]
  ].filter((item) => Boolean(item));
  const locations = [
    ...addressParts.length ? [asUntrustedText(addressParts.join(", "), 500)] : [],
    ...itempropValues(hoursSrc, "areaServed")
  ].filter(Boolean);
  const name = scoped ? itempropValues(scoped, "name")[0] : void 0;
  const slogan = itempropValues(scoped ?? html, "slogan")[0];
  const hours = uniqueJoin(itempropValues(hoursSrc, "openingHours"));
  const services = uniqueJoin(itempropValues(hoursSrc, "serviceType"));
  return {
    businessName: name && !isGenericName(name) ? name : void 0,
    greeting: slogan,
    hours,
    services,
    locations: [...new Set(locations)].slice(0, 16),
    phones: itempropValues(html, "telephone").slice(0, 4),
    emails: itempropValues(html, "email").slice(0, 4)
  };
}
function headingSection(html, headingRe, limit = 800) {
  const heading = new RegExp(
    `<h[1-4]\\b[^>]*>\\s*(${headingRe.source})\\s*</h[1-4]>`,
    "i"
  );
  const m = heading.exec(html);
  if (!m || m.index === void 0) return void 0;
  const after = html.slice(m.index + m[0].length, m.index + m[0].length + 2500);
  const nextHeading = after.search(/<h[1-4]\b/i);
  const slice = after.slice(0, nextHeading === -1 ? after.length : nextHeading);
  const listItems = [
    ...slice.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)
  ].map((item) => innerText(item[1])).filter(Boolean).slice(0, 12);
  if (listItems.length >= 2) return listItems.join("\n");
  const text = stripHtmlToText(slice).slice(0, limit);
  if (!text) return void 0;
  if (text.split("\n").length >= 2) return text;
  if (text.length >= 24) return text;
  return void 0;
}
function looksLikeHours(text) {
  return DAY_RE.test(text) && TIME_RE.test(text);
}
function looksLikeHoursPattern(text) {
  if (text.length < 8 || text.length > 140) return false;
  if (ALL_HOURS_RE.test(text)) return true;
  if (!DAY_RE.test(text) || !TIME_RE.test(text)) return false;
  if (TIME_RANGE_RE.test(text)) return true;
  return /\b(open(?:ing)?|hours|closed)\b/i.test(text);
}
function extractTableHours(html) {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  const out = [];
  for (const row of rows) {
    const cells = [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => innerText(cell[1])).filter(Boolean);
    const line = cells.join(" ");
    if (looksLikeHoursPattern(line)) out.push(line);
  }
  return out.slice(0, 8);
}
function extractHoursFromVisibleText(html) {
  const fromTable = extractTableHours(html);
  const text = stripHtmlToText(html);
  const hits = [...fromTable];
  const day = new RegExp(DAY_RE.source, "gi");
  let m;
  while (m = day.exec(text)) {
    const window = text.slice(m.index, m.index + 90).replace(/\s+/g, " ").trim();
    const range = TIME_RANGE_RE.exec(window);
    if (!range) continue;
    const rangeEnd = (range.index ?? 0) + range[0].length;
    const snippet = asUntrustedText(
      window.slice(0, rangeEnd).replaceAll("\uFFFD", "\u2013"),
      140
    );
    if (looksLikeHoursPattern(snippet)) hits.push(snippet);
    if (hits.length >= 12) break;
  }
  if (ALL_HOURS_RE.test(text)) {
    const all = text.match(ALL_HOURS_RE);
    if (all?.[0]) hits.push(asUntrustedText(all[0]));
  }
  const distinct = hits.filter(
    (item, index, all) => !all.some(
      (other, otherIndex) => otherIndex != index && other.length > item.length && other.toLowerCase().includes(item.toLowerCase())
    )
  );
  return uniqueJoin(distinct);
}
function extractNavBlocks(html) {
  const blocks = [];
  for (const re of [
    /<nav\b[^>]*>([\s\S]*?)<\/nav>/gi,
    /<([a-z0-9]+)\b[^>]*role=["']navigation["'][^>]*>([\s\S]*?)<\/\1>/gi,
    /<header\b[^>]*>([\s\S]*?)<\/header>/gi,
    /<ul\b[^>]*class=["'][^"']*\b(?:nav|menu|navbar)[^"']*["'][^>]*>([\s\S]*?)<\/ul>/gi
  ]) {
    let m;
    while (m = re.exec(html)) {
      const body = m[2] ?? m[1];
      if (body) blocks.push(body);
    }
  }
  return blocks;
}
function extractServicesFromNav(html) {
  const labels = [];
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
  if (unique.length < 2) return void 0;
  return unique.join("\n");
}
function extractServiceSubheadings(html) {
  const heading = /<h([1-3])\b[^>]*>\s*(?:our\s+)?(?:services?|accomm?odation|housing options?|support services?|what we (?:do|offer|provide))\s*<\/h\1>/i;
  const m = heading.exec(html);
  if (!m || m.index === void 0) return void 0;
  const level = Number(m[1]);
  const after = html.slice(
    m.index + m[0].length,
    m.index + m[0].length + 16e3
  );
  const next = after.search(new RegExp(`<h[1-${level}]\\b`, "i"));
  const section = after.slice(0, next === -1 ? after.length : next);
  const labels = [
    ...section.matchAll(/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)
  ].map((item) => innerText(item[2])).filter(
    (item) => item.length >= 2 && item.length <= 80 && !GENERIC_NAV_RE.test(item)
  );
  const unique = [...new Set(labels)].slice(0, 24);
  return unique.length >= 2 ? unique.join("\n") : void 0;
}
function looksLikeQuestion(text) {
  if (text.length < 6 || text.length > 160) return false;
  if (CTA_QUESTION_RE.test(text)) return false;
  if (/\?/.test(text)) return true;
  return /^(do|does|did|is|are|can|will|what|when|where|who|why|how|should)\b/i.test(
    text
  );
}
function extractDetailsFaqs(html) {
  const pairs = [
    ...html.matchAll(
      /<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi
    )
  ].map((m) => {
    const q = innerText(m[1]);
    const a = innerText(m[2]);
    return q && a ? `Q: ${q}
A: ${a}` : "";
  }).filter(Boolean).slice(0, 12);
  return pairs.length ? pairs.join("\n\n") : void 0;
}
function extractDtDdFaqs(html) {
  const pairs = [
    ...html.matchAll(
      /<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi
    )
  ].map((m) => {
    const q = innerText(m[1]);
    const a = innerText(m[2]);
    if (!looksLikeQuestion(q) || !a || a.length < 8) return "";
    return `Q: ${q}
A: ${a}`;
  }).filter(Boolean).slice(0, 12);
  return pairs.length >= 2 ? pairs.join("\n\n") : void 0;
}
function extractQuestionHeadingFaqs(html) {
  const pairs = [
    ...html.matchAll(
      /<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>\s*<(p|div)\b[^>]*>([\s\S]*?)<\/\3>/gi
    )
  ].map((m) => {
    const q = innerText(m[2]);
    const a = innerText(m[4]);
    if (!looksLikeQuestion(q) || !a || a.length < 8) return "";
    return `Q: ${q}
A: ${a}`;
  }).filter(Boolean).slice(0, 12);
  return pairs.length >= 2 ? pairs.join("\n\n") : void 0;
}
function extractAriaFaqs(html) {
  const pairs = [
    ...html.matchAll(
      /<button\b[^>]*aria-expanded=["'][^"']+["'][^>]*>([\s\S]*?)<\/button>\s*<([a-z0-9]+)\b[^>]*>([\s\S]*?)<\/\2>/gi
    )
  ].map((m) => {
    const q = innerText(m[1]);
    const a = innerText(m[3]);
    if (!looksLikeQuestion(q) || !a || a.length < 8) return "";
    return `Q: ${q}
A: ${a}`;
  }).filter(Boolean).slice(0, 12);
  return pairs.length >= 2 ? pairs.join("\n\n") : void 0;
}
function extractHeuristicFaqs(html) {
  const details = extractDetailsFaqs(html);
  if (details) return { text: details, source: "details" };
  const aria = extractAriaFaqs(html);
  if (aria) return { text: aria, source: "details" };
  const dtdd = extractDtDdFaqs(html);
  if (dtdd) return { text: dtdd, source: "heading" };
  const headings = extractQuestionHeadingFaqs(html);
  if (headings) return { text: headings, source: "heading" };
  return void 0;
}
function isPlausiblePhone(value) {
  const text = asUntrustedText(value, 80);
  if (!/^\+?[\d\s().-]+$/.test(text)) return false;
  const digits = text.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}
function phoneIdentity(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0044") && digits.length >= 12) return "0" + digits.slice(4);
  if (digits.startsWith("44") && digits.length >= 11) return "0" + digits.slice(2);
  return digits;
}
function dedupePhones(values, max = 8) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
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
function isPlausibleEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 120;
}
function extractTelMailto(html) {
  const phones = [];
  const emails = [];
  const telAnchors = html.matchAll(
    /<a\b[^>]*href=["']tel:([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
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
    emails: [...new Set(emails)].slice(0, 4)
  };
}
function safeDecode(raw) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
var UK_POSTCODE_RE = /\b(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i;
function headingSectionHtml(html, headingRe, maxChars = 8e3) {
  const heading = new RegExp(
    `<h([1-4])\\b[^>]*>\\s*(${headingRe.source})\\s*</h\\1>`,
    "i"
  );
  const m = heading.exec(html);
  if (!m || m.index === void 0) return void 0;
  const level = Number(m[1]);
  const after = html.slice(
    m.index + m[0].length,
    m.index + m[0].length + maxChars
  );
  const next = after.search(new RegExp(`<h[1-${level}]\\b`, "i"));
  return after.slice(0, next === -1 ? after.length : next);
}
function visibleBlocks(fragment) {
  const blocks = [];
  for (const match of fragment.matchAll(
    /<(p|address|li)\b[^>]*>([\s\S]*?)<\/\1>/gi
  )) {
    const text = innerText(match[2]);
    if (text) blocks.push(text);
  }
  return blocks;
}
function visiblePhoneCandidates(text) {
  const matches = text.match(/(?:\+?44\s?(?:\(0\)\s?)?|0)[\d\s().-]{7,}\d/g) ?? [];
  return dedupePhones(matches, 8);
}
function visibleEmailCandidates(text) {
  const matches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  return [
    ...new Set(
      matches.map((item) => asUntrustedText(item, 120)).filter(isPlausibleEmail)
    )
  ].slice(0, 8);
}
function extractVisibleContactSection(html) {
  const fragment = headingSectionHtml(
    html,
    /contact us|contact details|get in touch|find us/
  );
  if (!fragment) return { phones: [], emails: [], locations: [] };
  const blocks = visibleBlocks(fragment);
  const phones = dedupePhones(
    blocks.flatMap((block) => visiblePhoneCandidates(block)),
    8
  );
  const emails = [
    ...new Set(blocks.flatMap((block) => visibleEmailCandidates(block)))
  ].slice(0, 8);
  const locations = [
    ...new Set(
      blocks.filter((block) => UK_POSTCODE_RE.test(block)).map((block) => asUntrustedText(block, 500)).filter((block) => block.length >= 8 && block.length <= 500)
    )
  ].slice(0, 16);
  return { phones, emails, locations };
}
function formatContactHints(phones, emails) {
  const lines = [];
  for (const phone of [...new Set(phones)].slice(0, 4)) {
    if (isPlausiblePhone(phone)) lines.push(`Phone: ${phone}`);
  }
  for (const email of [...new Set(emails)].slice(0, 4)) {
    if (isPlausibleEmail(email)) lines.push(`Email: ${email}`);
  }
  return lines.length ? lines.join("\n") : void 0;
}
function cleanedTitleName(html) {
  const title = extractTitle(html);
  if (!title) return void 0;
  const first = title.split(/\s*[|–—]\s*/)[0]?.trim();
  const candidate = first && first.length >= 2 && first.length <= 80 ? first : title;
  return candidate && !isGenericName(candidate) ? candidate : void 0;
}
function isGenericName(name) {
  return GENERIC_NAME_RE.test(name.trim());
}
function extractSameOriginScriptSrcs(html, pageUrl) {
  const srcs = [];
  const re = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let m;
  while (m = re.exec(html)) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    let next;
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
function decodeJsStringBody(raw) {
  try {
    return asUntrustedText(JSON.parse(`"${raw}"`), 500);
  } catch {
    return void 0;
  }
}
function quotedJsStrings(fragment, limit = 64) {
  const out = [];
  const re = /"((?:\\.|[^"\\])*)"/g;
  let match;
  while ((match = re.exec(fragment)) && out.length < limit) {
    const value = decodeJsStringBody(match[1] ?? "");
    if (value) out.push(value);
  }
  return out;
}
function extractStructuredBusinessHtmlFromScript(script) {
  const localBusiness = /["@']?@type["@']?\s*:\s*["']LocalBusiness["']/gi;
  const regions = [];
  let marker;
  while ((marker = localBusiness.exec(script)) && regions.length < 3) {
    regions.push(
      script.slice(
        Math.max(0, marker.index - 1e3),
        Math.min(script.length, marker.index + 14e3)
      )
    );
  }
  if (!regions.length) return void 0;
  const hours = [];
  const services = [];
  const phones = [];
  const emails = [];
  let businessName = "";
  for (const region of regions) {
    if (!businessName) {
      const nameMatch = /\bname\s*:\s*"((?:\\.|[^"\\])*)"/i.exec(region);
      const name = nameMatch?.[1] ? decodeJsStringBody(nameMatch[1]) : void 0;
      if (name && !GENERIC_NAV_RE.test(name)) businessName = name;
    }
    for (const match of region.matchAll(
      /\bopeningHours\s*:\s*\[([\s\S]{1,2000}?)\]/gi
    )) {
      hours.push(...quotedJsStrings(match[1] ?? "", 24));
    }
    for (const match of region.matchAll(
      /\bitemOffered\s*:\s*\{[\s\S]{0,500}?\bname\s*:\s*"((?:\\.|[^"\\])*)"/gi
    )) {
      const value = decodeJsStringBody(match[1] ?? "");
      if (value && !GENERIC_NAV_RE.test(value)) services.push(value);
    }
    for (const match of region.matchAll(
      /\bserviceType\s*:\s*"((?:\\.|[^"\\])*)"/gi
    )) {
      const value = decodeJsStringBody(match[1] ?? "");
      if (value) services.push(value);
    }
    for (const match of region.matchAll(
      /\btelephone\s*:\s*"((?:\\.|[^"\\])*)"/gi
    )) {
      const value = decodeJsStringBody(match[1] ?? "");
      if (value && isPlausiblePhone(value)) phones.push(value);
    }
    for (const match of region.matchAll(
      /\bemail\s*:\s*"((?:\\.|[^"\\])*)"/gi
    )) {
      const value = decodeJsStringBody(match[1] ?? "");
      if (value && isPlausibleEmail(value)) emails.push(value);
    }
  }
  const cleanHours = [...new Set(hours)].slice(0, 14);
  const cleanServices = [...new Set(services)].slice(0, 24);
  const cleanPhones = [...new Set(phones)].slice(0, 4);
  const cleanEmails = [...new Set(emails)].slice(0, 4);
  if (!businessName && !cleanHours.length && !cleanServices.length && !cleanPhones.length && !cleanEmails.length) {
    return void 0;
  }
  const record = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness"
  };
  if (businessName) record.name = businessName;
  if (cleanHours.length) record.openingHours = cleanHours;
  if (cleanServices.length) {
    record.makesOffer = cleanServices.map((name) => ({
      itemOffered: { "@type": "Service", name }
    }));
  }
  if (cleanPhones.length === 1) record.telephone = cleanPhones[0];
  else if (cleanPhones.length > 1) record.telephone = cleanPhones;
  if (cleanEmails.length === 1) record.email = cleanEmails[0];
  else if (cleanEmails.length > 1) record.email = cleanEmails;
  return `<script type="application/ld+json">${JSON.stringify(record)}</script>`;
}
function extractSameOriginHrefs(html, pageUrl) {
  const hrefs = [];
  const re = /<a\b[^>]*href=["']([^"'#]+)["']/gi;
  let m;
  while (m = re.exec(html)) {
    const raw = m[1]?.trim();
    if (!raw || raw.startsWith("mailto:") || raw.startsWith("tel:")) continue;
    let next;
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
var USEFUL_PATH = [
  { re: /\/(about|about-us|our-story)\/?$/i, weight: 10 },
  { re: /\/(services|our-services|what-we-do|what-we-offer)\/?$/i, weight: 10 },
  {
    re: /\/(living-with-us|supported-housing|housing-options|accommodation|our-accommodation)\/?$/i,
    weight: 9
  },
  { re: /\/(faq|faqs|frequently-asked-questions)\/?$/i, weight: 10 },
  { re: /\/(hours|opening-hours|openinghours|times)\/?$/i, weight: 9 },
  { re: /\/(contact|contact-us)\/?$/i, weight: 8 },
  { re: /\/(residents|rough-sleeping|report-rough-sleeping)\/?$/i, weight: 5 }
];
function rankCandidateUrls(urls, origin) {
  const scored = urls.map((raw) => {
    let url;
    try {
      url = new URL(raw);
    } catch {
      return { raw, weight: 0 };
    }
    if (url.origin !== origin.origin) return { raw, weight: 0 };
    url.hash = "";
    url.search = "";
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const originPath = origin.pathname.replace(/\/+$/, "") || "/";
    if (path === "/" || path === originPath) {
      return { raw, weight: 0 };
    }
    const hit = USEFUL_PATH.find((item) => item.re.test(path));
    return { raw: url.toString(), weight: hit?.weight ?? 0 };
  }).filter((item) => item.weight > 0);
  scored.sort((a, b) => b.weight - a.weight);
  return [...new Set(scored.map((item) => item.raw))];
}
function setField(draft, fieldMeta, key, value, source, confidence) {
  if (!value || draft[key]) return;
  draft[key] = value;
  fieldMeta[key] = { source, confidence };
}
function parseFaqFacts(value) {
  if (!value) return void 0;
  const pairs = [];
  const re = /Q:\s*([^\n]+)\nA:\s*([\s\S]*?)(?=\n\n(?:Q:|Phone:|Email:)|$)/g;
  let match;
  while ((match = re.exec(value)) && pairs.length < 100) {
    const question = asUntrustedText(match[1], 500);
    const answer = asUntrustedText(match[2], 2e3);
    if (question && answer) pairs.push({ question, answer });
  }
  return pairs.length ? pairs : void 0;
}
function splitFactLines(value, maxItems = 100) {
  if (!value) return void 0;
  const items = value.split(/\n+/).map((item) => asUntrustedText(item, 300)).filter(Boolean);
  const unique = [...new Set(items)].slice(0, maxItems);
  return unique.length ? unique : void 0;
}
function extractDraftFromHtml(pages) {
  const draft = {};
  const warnings = [];
  const fieldMeta = {};
  const jsonLdHours = [];
  const jsonLdServices = [];
  const jsonLdFaqs = [];
  const microHours = [];
  const microServices = [];
  const locations = [];
  const phones = [];
  const emails = [];
  let locationMeta;
  let contactMeta;
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
    if ((visibleContact.phones.length || visibleContact.emails.length) && !contactMeta) {
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
      const ogTitle = metaContent(page.html, "og:title") || metaContent(page.html, "twitter:title");
      if (ogTitle && !isGenericName(ogTitle)) {
        const first = ogTitle.split(/\s*[|–—]\s*/)[0]?.trim() || ogTitle;
        setField(draft, fieldMeta, "businessName", first, "meta", "low");
        break;
      }
    }
  }
  if (draft.businessName && /[|]/.test(draft.businessName)) {
    const siteName = pages.map((page) => metaContent(page.html, "og:site_name")).find((value) => value && !isGenericName(value));
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
    "high"
  );
  setField(
    draft,
    fieldMeta,
    "hours",
    uniqueJoin(microHours),
    "microdata",
    "high"
  );
  if (!draft.hours) {
    for (const page of pages) {
      const section = headingSection(
        page.html,
        /opening hours|business hours|our hours|office hours/
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
    "high"
  );
  setField(
    draft,
    fieldMeta,
    "services",
    uniqueJoin(microServices),
    "microdata",
    "high"
  );
  if (!draft.services) {
    for (const page of pages) {
      const section = headingSection(
        page.html,
        /our services|services we offer|what we do|what we offer|what we provide|our work|housing options|support services|services/
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
          "medium"
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
    "high"
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
          "medium"
        );
        break;
      }
    }
  }
  const contact = formatContactHints(phones, emails);
  if (contact) {
    if (draft.faqs) {
      const already = contact.split("\n").every((line) => (draft.faqs ?? "").includes(line.replace(/^(Phone|Email): /, "")));
      if (!already) {
        draft.faqs = `${draft.faqs}

${contact}`.slice(0, MAX_FIELD_CHARS);
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
  for (const key of Object.keys(fieldMeta)) {
    if (fieldMeta[key]?.confidence === "low") {
      warnings.push(`${key}_low_confidence`);
    }
  }
  warnings.push("untrusted_crawl_text");
  const cleanDraft = omitEmpty(draft);
  const uniqueLocations = [...new Set(locations.map((item) => asUntrustedText(item, 500)).filter(Boolean))].slice(0, 16);
  const uniquePhones = dedupePhones(phones, 8);
  const uniqueEmails = [...new Set(emails.map((item) => asUntrustedText(item, 120)).filter(isPlausibleEmail))].slice(0, 8);
  const facts = {};
  const factMeta = {};
  const website = pages[0]?.url;
  if (website) {
    try {
      const parsed = new URL(website);
      if (parsed.protocol === "https:") {
        facts.website = parsed.toString();
        factMeta.website = { source: "fetched_url", confidence: "high" };
      }
    } catch {
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
      ...uniquePhones.length ? { phones: uniquePhones } : {},
      ...uniqueEmails.length ? { emails: uniqueEmails } : {}
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
    factMeta
  };
}
function uniqueJoin(items, sep = "\n") {
  const unique = [...new Set(items.map((item) => item.trim()).filter(Boolean))];
  return unique.length ? unique.join(sep).slice(0, MAX_FIELD_CHARS) : void 0;
}
function omitEmpty(draft) {
  const out = {};
  for (const [key, value] of Object.entries(draft)) {
    if (value && value.trim()) out[key] = value.trim().slice(0, MAX_FIELD_CHARS);
  }
  return out;
}
function omitEmptyMeta(fieldMeta, draft) {
  const out = {};
  for (const key of Object.keys(fieldMeta)) {
    if (draft[key] && fieldMeta[key]) out[key] = fieldMeta[key];
  }
  return out;
}

// packages/onboarding-ingest/src/fetch-safe.ts
var import_promises = __toESM(require("node:dns/promises"), 1);
var import_node_https = __toESM(require("node:https"), 1);
var import_node_net = require("node:net");

// packages/onboarding-ingest/src/ssrf.ts
var BLOCKED_HOSTNAMES = /* @__PURE__ */ new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "metadata",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
  "kubernetes.default",
  "kubernetes.default.svc",
  "kubernetes.default.svc.cluster.local"
]);
var BLOCKED_HOSTNAME_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".lan",
  ".home",
  ".corp",
  ".private"
];
function normalizeHostname(hostname) {
  return hostname.toLowerCase().replace(/\.$/, "").replace(/^\[|\]$/g, "");
}
function isBlockedMetadataHost(hostname) {
  const h = normalizeHostname(hostname);
  if (BLOCKED_HOSTNAMES.has(h)) return true;
  if (h === "metadata.google.internal") return true;
  if (h.startsWith("metadata.")) return true;
  return false;
}
function parseIPv4Literal(hostname) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (!m) return null;
  const parts = [m[1], m[2], m[3], m[4]];
  const octets = [];
  for (const part of parts) {
    if (part.length > 1 && part.startsWith("0")) return null;
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    octets.push(n);
  }
  return octets;
}
function isPrivateOrReservedIPv4(a, b, _c = 0, _d = 0) {
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;
  return false;
}
function isPrivateOrReservedIPv6(hostname) {
  const h = normalizeHostname(hostname);
  if (h === "::" || h === "0:0:0:0:0:0:0:0" || h === "::0") return true;
  if (h === "::1" || h === "0:0:0:0:0:0:0:1") return true;
  const mappedDotted = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(h);
  if (mappedDotted) {
    const v4 = parseIPv4Literal(mappedDotted[1]);
    if (!v4) return true;
    return isPrivateOrReservedIPv4(...v4);
  }
  const mappedHex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(h);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16);
    const lo = parseInt(mappedHex[2], 16);
    return isPrivateOrReservedIPv4(
      hi >> 8 & 255,
      hi & 255,
      lo >> 8 & 255,
      lo & 255
    );
  }
  if (/^fe[89ab]/i.test(h)) return true;
  if (/^f[cd]/i.test(h)) return true;
  if (/^ff/i.test(h)) return true;
  return false;
}
function isProbablyPublicHostname(hostname) {
  const h = normalizeHostname(hostname);
  if (!h) return false;
  if (isBlockedMetadataHost(h)) return false;
  if (BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => h.endsWith(suffix))) {
    return false;
  }
  const v4 = parseIPv4Literal(h);
  if (v4) return !isPrivateOrReservedIPv4(...v4);
  if (h.includes(":")) {
    return !isPrivateOrReservedIPv6(h);
  }
  return h.includes(".");
}
function allowPublicHttpsUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (url.protocol !== "https:") {
    return {
      ok: false,
      reason: url.protocol === "http:" ? "http_not_allowed" : "unsupported_scheme"
    };
  }
  if (url.username || url.password) {
    return { ok: false, reason: "userinfo_not_allowed" };
  }
  if (!isProbablyPublicHostname(url.hostname)) {
    return { ok: false, reason: "non_public_host" };
  }
  return { ok: true, url };
}
function assertResolvedAddressesPublic(addresses) {
  if (!addresses.length) return { ok: false, reason: "no_addresses" };
  for (const addr of addresses) {
    const h = normalizeHostname(addr);
    const v4 = parseIPv4Literal(h);
    if (v4) {
      if (isPrivateOrReservedIPv4(...v4)) {
        return { ok: false, reason: "non_public_resolved_ip" };
      }
      continue;
    }
    if (h.includes(":")) {
      if (isPrivateOrReservedIPv6(h)) {
        return { ok: false, reason: "non_public_resolved_ip" };
      }
      continue;
    }
    return { ok: false, reason: "unrecognised_address" };
  }
  return { ok: true };
}

// packages/onboarding-ingest/src/types.ts
var ScanError = class extends Error {
  constructor(code, message, httpStatus = 400) {
    super(message);
    this.name = "ScanError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
};

// packages/onboarding-ingest/src/fetch-safe.ts
var DEFAULT_MAX_REDIRECTS = 4;
var DEFAULT_PAGE_TIMEOUT_MS = 4e3;
var DEFAULT_MAX_BYTES_PER_PAGE = 256 * 1024;
function header(headers, name) {
  const want = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === want) return value;
  }
  return "";
}
async function defaultLookup(hostname) {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (parseIPv4Literal(host) || host.includes(":")) {
    return [host];
  }
  const records = await import_promises.default.lookup(host, { all: true, verbatim: true });
  return [...new Set(records.map((row) => row.address))];
}
function httpsGetToIp(url, ip, opts) {
  return new Promise((resolve, reject) => {
    const port = url.port ? Number(url.port) : 443;
    const headers = {
      Host: url.host,
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.1",
      "Accept-Language": "en-GB,en;q=0.8",
      "Accept-Encoding": "identity",
      Connection: "close"
    };
    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    const family = (0, import_node_net.isIP)(ip);
    if (family !== 4 && family !== 6) {
      reject(new ScanError("fetch_failed", "Resolved target was not an IP address.", 422));
      return;
    }
    const req = import_node_https.default.request(
      {
        // Keep the original hostname as the HTTP/TLS authority, but pin Node's
        // DNS lookup to the public address that was already validated above.
        // This preserves SSRF rebinding protection without routing the request
        // through a raw-IP virtual host.
        hostname,
        port,
        family,
        autoSelectFamily: false,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        servername: hostname,
        headers,
        lookup: (_hostname, options, callback) => {
          if (typeof options === "object" && options !== null && options.all) {
            callback(null, [{ address: ip, family }]);
            return;
          }
          callback(null, ip, family);
        },
        timeout: opts.timeoutMs
      },
      (res) => {
        const chunks = [];
        let size = 0;
        res.on("data", (chunk) => {
          size += chunk.length;
          if (size > opts.maxBytes) {
            req.destroy();
            reject(
              new ScanError(
                "response_too_large",
                "The page exceeded the fetch size cap.",
                422
              )
            );
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => {
          const rawHeaders = {};
          for (const [key, value] of Object.entries(res.headers)) {
            if (typeof value === "string") rawHeaders[key] = value;
            else if (Array.isArray(value)) rawHeaders[key] = value.join(", ");
          }
          resolve({
            status: res.statusCode ?? 0,
            headers: rawHeaders,
            body: Buffer.concat(chunks).toString("utf8"),
            url
          });
        });
      }
    );
    req.on("timeout", () => {
      req.destroy();
      reject(
        new ScanError("timeout", "The page fetch timed out.", 504)
      );
    });
    req.on("error", (err) => {
      reject(
        new ScanError(
          "fetch_failed",
          err instanceof Error ? err.message : "Fetch failed.",
          422
        )
      );
    });
    req.end();
  });
}
async function fetchPublicHttps(raw, options = {}) {
  const lookup = options.lookup ?? defaultLookup;
  const get = options.get ?? httpsGetToIp;
  const timeoutMs = Math.max(
    250,
    Math.min(options.timeoutMs ?? DEFAULT_PAGE_TIMEOUT_MS, options.remainingMs ?? DEFAULT_PAGE_TIMEOUT_MS)
  );
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES_PER_PAGE;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  let current = raw;
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const allow = allowPublicHttpsUrl(current);
    if (!allow.ok) {
      throw new ScanError(allow.reason, ssrfMessage(allow.reason), 400);
    }
    let addresses;
    try {
      addresses = await lookup(allow.url.hostname);
    } catch (err) {
      if (err instanceof ScanError) throw err;
      throw new ScanError(
        "dns_failed",
        "Could not resolve this hostname.",
        422
      );
    }
    const ipCheck = assertResolvedAddressesPublic(addresses);
    if (!ipCheck.ok) {
      throw new ScanError(ipCheck.reason, ssrfMessage(ipCheck.reason), 400);
    }
    const orderedAddresses = [
      ...addresses.filter((address) => Boolean(parseIPv4Literal(address))),
      ...addresses.filter((address) => !parseIPv4Literal(address))
    ];
    let response2 = null;
    let lastError = null;
    const addressAttemptsStarted = Date.now();
    for (const address of orderedAddresses) {
      const elapsed = Date.now() - addressAttemptsStarted;
      const attemptTimeoutMs = Math.max(250, timeoutMs - elapsed);
      if (elapsed >= timeoutMs) break;
      try {
        const candidate = await get(allow.url, address, {
          timeoutMs: attemptTimeoutMs,
          maxBytes
        });
        response2 = candidate;
        if (candidate.status !== 401 && candidate.status !== 403) break;
      } catch (err) {
        lastError = err;
      }
    }
    if (!response2) {
      if (lastError instanceof ScanError) throw lastError;
      throw new ScanError(
        "fetch_failed",
        lastError instanceof Error ? lastError.message : "Fetch failed.",
        422
      );
    }
    if (response2.status >= 300 && response2.status < 400) {
      const location = header(response2.headers, "location");
      if (!location) {
        throw new ScanError(
          "redirect_missing_location",
          "The site returned a redirect without a Location header.",
          422
        );
      }
      if (hop === maxRedirects) {
        throw new ScanError(
          "too_many_redirects",
          "The site redirected too many times.",
          422
        );
      }
      let next;
      try {
        next = new URL(location, allow.url);
      } catch {
        throw new ScanError("invalid_url", "Redirect Location was not a valid URL.", 400);
      }
      current = next.toString();
      continue;
    }
    return response2;
  }
  throw new ScanError("too_many_redirects", "The site redirected too many times.", 422);
}
function ssrfMessage(reason) {
  switch (reason) {
    case "http_not_allowed":
      return "Only HTTPS business URLs are accepted.";
    case "unsupported_scheme":
      return "Only HTTPS business URLs are accepted.";
    case "userinfo_not_allowed":
      return "URLs with usernames or passwords are not accepted.";
    case "non_public_host":
    case "non_public_resolved_ip":
      return "This URL is not a public website and will not be fetched.";
    case "invalid_url":
      return "Enter a valid HTTPS URL.";
    default:
      return "This URL is not allowed.";
  }
}
function isHtmlOrText(contentType) {
  const type = contentType.toLowerCase();
  if (!type) return true;
  return type.includes("text/html") || type.includes("application/xhtml") || type.includes("text/plain") || type.includes("application/xml") || type.includes("text/xml");
}

// packages/onboarding-ingest/src/scan.ts
var MAX_PAGES = 5;
var MAX_TOTAL_BYTES = 768 * 1024;
var TOTAL_DEADLINE_MS = 12e3;
var MAX_STATIC_SCRIPT_ASSETS = 1;
var MAX_STATIC_SCRIPT_BYTES = 640 * 1024;
var OUR_USER_AGENT_TOKEN = "MaintenanceOS-OnboardingScan";
function isWebIngestEnabled(env = process.env) {
  const value = env.ONBOARDING_WEB_INGEST;
  return value === "true" || value === "1";
}
function pathMatches(rule, pathname) {
  if (!rule) return false;
  if (rule === "/") return true;
  return pathname.startsWith(rule);
}
function parseRobotsTxt(body, userAgent = OUR_USER_AGENT_TOKEN) {
  const lines = body.split(/\r?\n/).map((line) => line.replace(/#.*$/, "").trim());
  const groups = [];
  let current = null;
  for (const line of lines) {
    if (!line) continue;
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();
    if (key === "user-agent") {
      if (!current || current.allow.length || current.disallow.length) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if (key === "allow" && current) {
      current.allow.push(value);
    } else if (key === "disallow" && current) {
      current.disallow.push(value);
    }
  }
  const ua = userAgent.toLowerCase();
  const specific = groups.find(
    (group) => group.agents.some((agent) => agent !== "*" && ua.includes(agent))
  );
  const star = groups.find((group) => group.agents.includes("*"));
  const chosen = specific ?? star;
  return {
    allow: chosen?.allow ?? [],
    disallow: chosen?.disallow ?? [],
    unavailable: false
  };
}
function isPathAllowed(rules, pathname) {
  if (rules.unavailable) return true;
  const path = pathname || "/";
  let decision = null;
  let matchedLen = -1;
  for (const rule of rules.disallow) {
    if (pathMatches(rule, path) && rule.length >= matchedLen) {
      decision = false;
      matchedLen = rule.length;
    }
  }
  for (const rule of rules.allow) {
    if (pathMatches(rule, path) && rule.length >= matchedLen) {
      decision = true;
      matchedLen = rule.length;
    }
  }
  return decision !== false;
}
async function loadRobots(origin, deps, remainingMs) {
  const robotsUrl = new URL("/robots.txt", origin).toString();
  try {
    const res = await fetchPublicHttps(robotsUrl, {
      lookup: deps.lookup,
      get: deps.get,
      remainingMs,
      timeoutMs: Math.min(DEFAULT_PAGE_TIMEOUT_MS, remainingMs),
      maxBytes: 64 * 1024,
      maxRedirects: 2
    });
    if (res.status === 404 || res.status === 410) {
      return { allow: [], disallow: [], unavailable: false };
    }
    if (res.status >= 400) {
      return { allow: [], disallow: [], unavailable: true };
    }
    return parseRobotsTxt(res.body);
  } catch {
    return { allow: [], disallow: [], unavailable: true };
  }
}
async function runScan(rawUrl, options = {}) {
  const enabled = options.enabled ?? isWebIngestEnabled();
  if (!enabled) {
    return {
      ok: false,
      error: "scan_disabled",
      message: "Onboarding web ingest is disabled. Set ONBOARDING_WEB_INGEST=true to enable crawling.",
      warnings: ["scan_disabled"]
    };
  }
  const allow = allowPublicHttpsUrl(rawUrl);
  if (!allow.ok) {
    return {
      ok: false,
      error: allow.reason,
      message: ssrfMessage(allow.reason),
      warnings: ["ssrf_denied"]
    };
  }
  const now = options.now ?? Date.now;
  const started = now();
  const remaining = () => TOTAL_DEADLINE_MS - (now() - started);
  const warnings = [];
  const sources = [];
  const pages = [];
  let totalBytes = 0;
  const robots = await loadRobots(allow.url, options, remaining());
  if (robots.unavailable) warnings.push("robots_unavailable");
  if (!isPathAllowed(robots, allow.url.pathname || "/")) {
    return {
      ok: false,
      error: "robots_disallow",
      message: "robots.txt disallows fetching this URL. No content was invented.",
      warnings: ["robots_disallow"]
    };
  }
  const queued = [allow.url.toString()];
  const seen = /* @__PURE__ */ new Set();
  while (queued.length && pages.length < MAX_PAGES) {
    if (remaining() < 400) {
      warnings.push("time_budget");
      break;
    }
    if (totalBytes >= MAX_TOTAL_BYTES) {
      warnings.push("byte_budget");
      break;
    }
    const next = queued.shift();
    if (!next || seen.has(next)) continue;
    seen.add(next);
    let nextUrl;
    try {
      nextUrl = new URL(next);
    } catch {
      continue;
    }
    if (!isPathAllowed(robots, nextUrl.pathname || "/")) {
      warnings.push("robots_skipped_path");
      continue;
    }
    try {
      const res = await fetchPublicHttps(next, {
        lookup: options.lookup,
        get: options.get,
        remainingMs: remaining(),
        timeoutMs: DEFAULT_PAGE_TIMEOUT_MS,
        maxBytes: Math.min(
          DEFAULT_MAX_BYTES_PER_PAGE,
          MAX_TOTAL_BYTES - totalBytes
        ),
        maxRedirects: DEFAULT_MAX_REDIRECTS
      });
      const type = Object.entries(res.headers).find(
        ([key]) => key.toLowerCase() === "content-type"
      )?.[1] ?? "";
      if (!isHtmlOrText(type)) {
        warnings.push("skipped_non_html");
        continue;
      }
      if (res.status >= 400) {
        warnings.push(`http_${res.status}`);
        continue;
      }
      const bytes = Buffer.byteLength(res.body, "utf8");
      totalBytes += bytes;
      sources.push({ url: res.url.toString(), status: res.status, bytes });
      pages.push({ url: res.url.toString(), html: res.body });
      if (pages.length === 1) {
        const extra = rankCandidateUrls(
          extractSameOriginHrefs(res.body, res.url),
          allow.url
        );
        for (const href of extra) {
          if (!seen.has(href) && queued.length + pages.length < MAX_PAGES) {
            queued.push(href);
          }
        }
      }
    } catch (err) {
      if (err instanceof ScanError && err.code.includes("non_public")) {
        return {
          ok: false,
          error: err.code,
          message: err.message,
          warnings: ["ssrf_denied"]
        };
      }
      warnings.push(err instanceof ScanError ? err.code : "fetch_failed");
    }
  }
  if (!pages.length) {
    return {
      ok: false,
      error: "fetch_failed",
      message: "No public pages could be fetched. No crawl results were invented.",
      warnings: warnings.length ? warnings : ["no_pages_fetched"]
    };
  }
  let extracted = extractDraftFromHtml(pages);
  if ((!extracted.draft.hours || !extracted.draft.services) && pages.length > 0 && remaining() >= 500 && totalBytes < MAX_TOTAL_BYTES) {
    const firstPage = pages[0];
    let firstUrl = null;
    try {
      firstUrl = new URL(firstPage.url);
    } catch {
      firstUrl = null;
    }
    if (firstUrl) {
      const scriptUrls = extractSameOriginScriptSrcs(firstPage.html, firstUrl).slice(0, MAX_STATIC_SCRIPT_ASSETS);
      for (const scriptUrl of scriptUrls) {
        if (remaining() < 400 || totalBytes >= MAX_TOTAL_BYTES) break;
        let parsed;
        try {
          parsed = new URL(scriptUrl);
        } catch {
          continue;
        }
        if (!isPathAllowed(robots, parsed.pathname || "/")) {
          warnings.push("robots_skipped_script");
          continue;
        }
        const remainingBytes = MAX_TOTAL_BYTES - totalBytes;
        if (remainingBytes < 1024) break;
        try {
          const res = await fetchPublicHttps(scriptUrl, {
            lookup: options.lookup,
            get: options.get,
            remainingMs: remaining(),
            timeoutMs: DEFAULT_PAGE_TIMEOUT_MS,
            maxBytes: Math.min(MAX_STATIC_SCRIPT_BYTES, remainingBytes),
            maxRedirects: DEFAULT_MAX_REDIRECTS
          });
          if (res.status >= 400) {
            warnings.push(`script_http_${res.status}`);
            continue;
          }
          const type = Object.entries(res.headers).find(
            ([key]) => key.toLowerCase() === "content-type"
          )?.[1] ?? "";
          if (!/(?:java|ecma)script/i.test(type) && !/\.m?js$/i.test(res.url.pathname)) {
            warnings.push("skipped_non_script_asset");
            continue;
          }
          const bytes = Buffer.byteLength(res.body, "utf8");
          totalBytes += bytes;
          const synthetic = extractStructuredBusinessHtmlFromScript(res.body);
          if (!synthetic) continue;
          sources.push({ url: res.url.toString(), status: res.status, bytes });
          pages.push({ url: res.url.toString(), html: synthetic });
          warnings.push("static_script_schema_fallback");
          extracted = extractDraftFromHtml(pages);
          break;
        } catch (err) {
          warnings.push(
            err instanceof ScanError ? `script_${err.code}` : "script_fetch_failed"
          );
        }
      }
    }
  }
  return {
    ok: true,
    untrusted: true,
    draft: extracted.draft,
    warnings: [.../* @__PURE__ */ new Set([...warnings, ...extracted.warnings])],
    sources,
    ...Object.keys(extracted.facts).length ? { facts: extracted.facts } : {},
    ...Object.keys(extracted.factMeta).length ? { factMeta: extracted.factMeta } : {},
    ...Object.keys(extracted.fieldMeta).length ? { fieldMeta: extracted.fieldMeta } : {}
  };
}

// packages/onboarding-ingest/packages/website/scan/index.ts
var RATE_WINDOW_MS = 6e4;
var RATE_MAX = 20;
var rateBuckets = /* @__PURE__ */ new Map();
function allowRate(ip, now = Date.now()) {
  const cutoff = now - RATE_WINDOW_MS;
  const previous = (rateBuckets.get(ip) ?? []).filter((stamp) => stamp > cutoff);
  if (previous.length >= RATE_MAX) {
    rateBuckets.set(ip, previous);
    return false;
  }
  previous.push(now);
  rateBuckets.set(ip, previous);
  return true;
}
function response(statusCode, body, origin = "") {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept"
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return { statusCode, headers, body };
}
function statusFor(result) {
  if (result.ok) return 200;
  switch (result.error) {
    case "scan_disabled":
      return 503;
    case "invalid_url":
    case "http_not_allowed":
    case "unsupported_scheme":
    case "userinfo_not_allowed":
    case "non_public_host":
    case "non_public_resolved_ip":
      return 400;
    case "timeout":
      return 504;
    default:
      return 422;
  }
}
async function main(event = {}) {
  const method = event.http?.method?.toUpperCase() ?? "GET";
  const headers = event.http?.headers ?? {};
  const origin = headers.origin ?? "";
  const clientIp = (headers["x-forwarded-for"] ?? "unknown").split(",")[0]?.trim() || "unknown";
  if (method === "OPTIONS") return response(204, "", origin);
  if (method !== "POST") {
    return response(405, { ok: false, error: "method_not_allowed" }, origin);
  }
  if (!allowRate(clientIp)) {
    return response(
      429,
      {
        ok: false,
        error: "rate_limited",
        message: "Too many scan requests. Try again shortly."
      },
      origin
    );
  }
  const url = typeof event.url === "string" ? event.url.trim() : "";
  if (!url) {
    return response(
      400,
      {
        ok: false,
        error: "invalid_url",
        message: "JSON body must include a string url."
      },
      origin
    );
  }
  try {
    const result = await runScan(url, { enabled: true });
    return response(statusFor(result), result, origin);
  } catch {
    return response(
      500,
      {
        ok: false,
        error: "internal_error",
        message: "The scan service failed. No crawl results were invented.",
        warnings: ["internal_error"]
      },
      origin
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
