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
    const window2 = text.slice(m.index, m.index + 90).replace(/\s+/g, " ").trim();
    const range = TIME_RANGE_RE.exec(window2);
    if (!range) continue;
    const rangeEnd = (range.index ?? 0) + range[0].length;
    const snippet = asUntrustedText(
      window2.slice(0, rangeEnd).replaceAll("\uFFFD", "\u2013"),
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
var import_node_zlib = require("node:zlib");

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
function decodeResponseBodyForText(input) {
  if (!input.acceptCompressed) return input.body;
  const encoding = header(input.headers, "content-encoding").toLowerCase();
  const contentType2 = header(input.headers, "content-type").toLowerCase();
  const gzipFile = /(?:application\/gzip|application\/x-gzip)/i.test(contentType2) || /\.gz$/i.test(input.url.pathname);
  if (encoding && encoding !== "identity" && encoding !== "gzip") {
    throw new ScanError(
      "unsupported_content_encoding",
      "The response used an unsupported content encoding.",
      422
    );
  }
  let payload = input.body;
  if (encoding === "gzip" || gzipFile) {
    try {
      payload = (0, import_node_zlib.gunzipSync)(payload, {
        maxOutputLength: input.maxDecompressedBytes
      });
    } catch (error) {
      const code = typeof error === "object" && error !== null && "code" in error ? String(error.code ?? "") : "";
      const message = error instanceof Error ? error.message : String(error);
      const tooLarge = code === "ERR_BUFFER_TOO_LARGE" || /max(?:imum)? output|larger than|too large/i.test(message);
      throw new ScanError(
        tooLarge ? "response_too_large" : "content_decode_failed",
        tooLarge ? "The decompressed response exceeded the allowed size." : "The compressed response could not be decoded as gzip.",
        422
      );
    }
  }
  if (payload.length > input.maxDecompressedBytes) {
    throw new ScanError(
      "response_too_large",
      "The decompressed response exceeded the allowed size.",
      422
    );
  }
  return payload;
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
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.1",
      "Accept-Language": "en-GB,en;q=0.8",
      "Accept-Encoding": opts.acceptCompressed ? "gzip, identity" : "identity",
      ...opts.headers ?? {},
      Host: url.host,
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
          let payload;
          try {
            payload = decodeResponseBodyForText({
              body: Buffer.concat(chunks),
              url,
              headers: rawHeaders,
              acceptCompressed: opts.acceptCompressed,
              maxDecompressedBytes: opts.maxDecompressedBytes ?? opts.maxBytes
            });
          } catch (error) {
            reject(error);
            return;
          }
          resolve({
            status: res.statusCode ?? 0,
            headers: rawHeaders,
            body: payload.toString("utf8"),
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
function httpsGetBytesToIp(url, ip, opts) {
  return new Promise((resolve, reject) => {
    const port = url.port ? Number(url.port) : 443;
    const headers = {
      "User-Agent": USER_AGENT,
      Accept: "application/pdf,text/plain,text/csv,application/csv;q=0.9,*/*;q=0.1",
      "Accept-Language": "en-GB,en;q=0.8",
      "Accept-Encoding": "identity",
      ...opts.headers ?? {},
      Host: url.host,
      Connection: "close"
    };
    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    const family = (0, import_node_net.isIP)(ip);
    if (family !== 4 && family !== 6) {
      reject(
        new ScanError(
          "fetch_failed",
          "Resolved target was not an IP address.",
          422
        )
      );
      return;
    }
    const req = import_node_https.default.request(
      {
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
        let settled = false;
        res.on("data", (chunk) => {
          if (settled) return;
          size += chunk.length;
          if (size > opts.maxBytes) {
            settled = true;
            req.destroy();
            reject(
              new ScanError(
                "response_too_large",
                "The document exceeded the fetch size cap.",
                422
              )
            );
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => {
          if (settled) return;
          settled = true;
          const rawHeaders = {};
          for (const [key, value] of Object.entries(res.headers)) {
            if (typeof value === "string") rawHeaders[key] = value;
            else if (Array.isArray(value)) rawHeaders[key] = value.join(", ");
          }
          const payload = Buffer.concat(chunks);
          resolve({
            status: res.statusCode ?? 0,
            headers: rawHeaders,
            body: new Uint8Array(
              payload.buffer,
              payload.byteOffset,
              payload.byteLength
            ),
            url
          });
        });
      }
    );
    req.on("timeout", () => {
      req.destroy();
      reject(new ScanError("timeout", "The document fetch timed out.", 504));
    });
    req.on("error", (err) => {
      reject(
        new ScanError(
          "fetch_failed",
          err instanceof Error ? err.message : "Document fetch failed.",
          422
        )
      );
    });
    req.end();
  });
}
async function fetchPublicHttpsBytes(raw, options = {}) {
  const lookup = options.lookup ?? defaultLookup;
  const get = options.get ?? httpsGetBytesToIp;
  const timeoutMs = Math.max(
    250,
    Math.min(
      options.timeoutMs ?? DEFAULT_PAGE_TIMEOUT_MS,
      options.remainingMs ?? DEFAULT_PAGE_TIMEOUT_MS
    )
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
    const ipv4Addresses = addresses.filter(
      (address) => Boolean(parseIPv4Literal(address))
    );
    const ipv6Addresses = addresses.filter(
      (address) => !parseIPv4Literal(address)
    );
    const orderedAddresses = ipv4Addresses.length ? ipv4Addresses : ipv6Addresses;
    let response2 = null;
    let lastError = null;
    const addressAttemptsStarted = Date.now();
    for (const address of orderedAddresses) {
      const elapsed = Date.now() - addressAttemptsStarted;
      if (elapsed >= timeoutMs) break;
      const attemptTimeoutMs = Math.max(250, timeoutMs - elapsed);
      try {
        const candidate = await get(allow.url, address, {
          timeoutMs: attemptTimeoutMs,
          maxBytes,
          headers: options.headers
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
    if (response2.status >= 300 && response2.status < 400 && response2.status !== 304) {
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
        throw new ScanError(
          "invalid_url",
          "Redirect Location was not a valid URL.",
          400
        );
      }
      if (options.allowedOrigin && next.origin !== options.allowedOrigin) {
        throw new ScanError(
          "cross_origin_redirect",
          "The document redirected outside the submitted website.",
          422
        );
      }
      current = next.toString();
      continue;
    }
    return response2;
  }
  throw new ScanError(
    "too_many_redirects",
    "The site redirected too many times.",
    422
  );
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
    const ipv4Addresses = addresses.filter(
      (address) => Boolean(parseIPv4Literal(address))
    );
    const ipv6Addresses = addresses.filter(
      (address) => !parseIPv4Literal(address)
    );
    const orderedAddresses = ipv4Addresses.length ? ipv4Addresses : ipv6Addresses;
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
          maxBytes,
          headers: options.headers,
          acceptCompressed: options.acceptCompressed,
          maxDecompressedBytes: options.maxDecompressedBytes
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
    if (response2.status >= 300 && response2.status < 400 && response2.status !== 304) {
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
      if (options.allowedOrigin && next.origin !== options.allowedOrigin) {
        throw new ScanError(
          "cross_origin_redirect",
          "The page redirected outside the submitted website.",
          422
        );
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
function isHtmlOrText(contentType2) {
  const type = contentType2.toLowerCase();
  if (!type) return true;
  return type.includes("text/html") || type.includes("application/xhtml") || type.includes("text/plain") || type.includes("application/xml") || type.includes("text/xml");
}

// packages/onboarding-ingest/src/scan.ts
var MAX_PAGES = 5;
var MAX_TOTAL_BYTES = 768 * 1024;
var TOTAL_DEADLINE_MS = 12e3;
var MAX_STATIC_SCRIPT_ASSETS = 1;
var MAX_STATIC_SCRIPT_BYTES = 640 * 1024;
var READER_FALLBACK_ORIGIN = "https://r.jina.ai";
var READER_FALLBACK_TIMEOUT_MS = 9e3;
var READER_FALLBACK_MAX_BYTES = 256 * 1024;
var MAX_READER_PAGES = 4;
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
function isReaderChallengePage(html) {
  const title = /<title[^>]*>\s*([^<]{1,160})\s*<\/title>/i.exec(html)?.[1]?.trim() ?? "";
  if (/^security verification$/i.test(title)) return true;
  const text = html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
  const challengeMarkers = [
    "verify you are human",
    "verify you're human",
    "verify you\u2019re human",
    "checking your browser",
    "security verification",
    "captcha"
  ];
  const markerCount = challengeMarkers.filter((marker) => text.includes(marker)).length;
  return markerCount >= 2;
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
  const readerFallbackEnabled = options.readerFallback ?? (!options.lookup && !options.get);
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
  const readerEligibleFailure = warnings.includes("http_401") || warnings.includes("http_403") || warnings.includes("fetch_failed");
  if (!pages.length && readerFallbackEnabled && readerEligibleFailure && remaining() >= 1e3) {
    const readerQueue = [allow.url.toString()];
    const readerSeen = /* @__PURE__ */ new Set();
    while (readerQueue.length && pages.length < MAX_READER_PAGES && remaining() >= 1e3 && totalBytes < MAX_TOTAL_BYTES) {
      const target = readerQueue.shift();
      if (!target || readerSeen.has(target)) continue;
      readerSeen.add(target);
      let targetUrl;
      try {
        targetUrl = new URL(target);
      } catch {
        continue;
      }
      if (targetUrl.protocol !== "https:" || targetUrl.origin !== allow.url.origin) {
        continue;
      }
      if (!isPathAllowed(robots, targetUrl.pathname || "/")) {
        warnings.push("robots_skipped_reader_path");
        continue;
      }
      const remainingBytes = MAX_TOTAL_BYTES - totalBytes;
      if (remainingBytes < 1024) break;
      const readerUrl = `${READER_FALLBACK_ORIGIN}/${targetUrl.toString()}`;
      try {
        let acceptedBody = null;
        for (let attempt = 0; attempt < 2; attempt += 1) {
          const res = await fetchPublicHttps(readerUrl, {
            lookup: options.readerLookup,
            get: options.readerGet,
            remainingMs: remaining(),
            timeoutMs: Math.min(READER_FALLBACK_TIMEOUT_MS, remaining()),
            maxBytes: Math.min(READER_FALLBACK_MAX_BYTES, remainingBytes),
            maxRedirects: 2,
            headers: {
              Accept: "text/html",
              "X-Respond-With": "html",
              "X-No-Cache": "true"
            }
          });
          if (res.status >= 400) {
            warnings.push(`reader_http_${res.status}`);
            break;
          }
          if (!/<(?:html|head|body)\b/i.test(res.body)) {
            warnings.push("reader_non_html");
            break;
          }
          if (isReaderChallengePage(res.body)) {
            if (attempt === 0 && remaining() >= 1e3) {
              warnings.push("reader_challenge_retry");
              continue;
            }
            warnings.push("reader_challenge_rejected");
            break;
          }
          acceptedBody = res.body;
          break;
        }
        if (!acceptedBody) continue;
        const bytes = Buffer.byteLength(acceptedBody, "utf8");
        totalBytes += bytes;
        sources.push({
          url: targetUrl.toString(),
          status: 200,
          bytes
        });
        pages.push({
          url: targetUrl.toString(),
          html: acceptedBody
        });
        if (pages.length === 1) {
          const extra = rankCandidateUrls(
            extractSameOriginHrefs(acceptedBody, targetUrl),
            allow.url
          );
          for (const href of extra) {
            if (!readerSeen.has(href) && readerQueue.length + pages.length < MAX_READER_PAGES) {
              readerQueue.push(href);
            }
          }
        }
      } catch (err) {
        warnings.push(
          err instanceof ScanError ? `reader_${err.code}` : "reader_fetch_failed"
        );
      }
    }
    if (pages.length) warnings.push("reader_fallback_used");
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

// packages/onboarding-ingest/src/scanner-v2-foundation.ts
var import_node_crypto = require("node:crypto");
var SCANNER_V2_ENV = "ONBOARDING_SCANNER_V2";
function isScannerV2Enabled(env = process.env) {
  const value = env[SCANNER_V2_ENV];
  return value === "true" || value === "1";
}
function sha256(parts) {
  const hash = (0, import_node_crypto.createHash)("sha256");
  for (const part of parts) {
    hash.update(part, "utf8");
    hash.update("\0", "utf8");
  }
  return hash.digest("hex");
}
function stableContentHash(text) {
  return sha256([text.replace(/\r\n?/g, "\n")]);
}
function stableChunkId(canonicalUrl, ordinal, text) {
  return sha256([
    canonicalUrl,
    String(ordinal),
    stableContentHash(text)
  ]);
}
function sortedDispositions(dispositions) {
  return [...dispositions].sort(
    (a, b) => a.url.localeCompare(b.url, "en", { sensitivity: "variant" })
  );
}
function buildCrawlManifest(input) {
  const urls = sortedDispositions(input.urls);
  const counts = {
    queued: urls.filter((item) => item.status === "queued").length,
    fetched: urls.filter((item) => item.status === "fetched").length,
    duplicate: urls.filter((item) => item.status === "duplicate").length,
    policySkipped: urls.filter((item) => item.status === "policy_skipped").length,
    robotsSkipped: urls.filter((item) => item.status === "robots_skipped").length,
    unresolved: urls.filter((item) => item.status === "unresolved").length
  };
  const state = input.requestedState === "COMPLETE" && (counts.queued > 0 || counts.unresolved > 0) ? "PARTIAL" : input.requestedState;
  return {
    crawlId: input.crawlId,
    origin: input.origin,
    state,
    discovered: urls.length,
    ...counts,
    urls
  };
}

// packages/onboarding-ingest/src/scanner-v2-content.ts
var DEFAULT_MAX_CHUNK_CHARS = 1400;
var DEFAULT_CHUNK_OVERLAP_CHARS = 160;
var BLOCK_BOUNDARY_RE = /<\/?(?:address|article|aside|blockquote|div|main|section|p|li|ol|ul|dl|dt|dd|table|thead|tbody|tfoot|tr|td|th|figure|figcaption|details|summary|header|footer|nav|h[1-6])\b[^>]*>/gi;
var NAMED_ENTITIES = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
  pound: "\xA3"
};
function decodeHtmlEntities(value) {
  return value.replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|([a-z][a-z0-9]+));/gi,
    (_match, decimal, hex, named) => {
      if (decimal) {
        const code = Number.parseInt(decimal, 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : " ";
      }
      if (hex) {
        const code = Number.parseInt(hex, 16);
        return Number.isFinite(code) ? String.fromCodePoint(code) : " ";
      }
      return named ? NAMED_ENTITIES[named.toLowerCase()] ?? " " : " ";
    }
  );
}
function normalizeText(value) {
  return decodeHtmlEntities(
    value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ")
  ).replace(/\u00a0/g, " ").replace(/[\t\f\v]+/g, " ").replace(/ *\n */g, "\n").replace(/[ ]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
function headerValue(headers, name) {
  if (!headers) return void 0;
  const entry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === name.toLowerCase()
  );
  return entry?.[1]?.trim() || void 0;
}
function stableJson(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map((item) => stableJson(item)).join(",") + "]";
  }
  const object = value;
  return "{" + Object.keys(object).sort().map((key) => JSON.stringify(key) + ":" + stableJson(object[key])).join(",") + "}";
}
function extractTitle2(html) {
  const value = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const text = value ? normalizeText(value) : "";
  return text || void 0;
}
function attributeValue(tag, name) {
  const quoted = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "i"
  ).exec(tag);
  if (quoted) return decodeHtmlEntities(quoted[1] ?? quoted[2] ?? "").trim() || void 0;
  const bare = new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, "i").exec(tag);
  return bare?.[1] ? decodeHtmlEntities(bare[1]).trim() : void 0;
}
function removeNonContentMarkup(html) {
  return html.replace(/<!--([\s\S]*?)-->/g, " ").replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ").replace(/<template\b[\s\S]*?<\/template>/gi, " ").replace(/<svg\b[\s\S]*?<\/svg>/gi, " ");
}
function visibleLines(html) {
  const text = decodeHtmlEntities(
    removeNonContentMarkup(html).replace(/<br\s*\/?>/gi, "\n").replace(BLOCK_BOUNDARY_RE, "\n").replace(/<[^>]+>/g, " ")
  ).replace(/\u00a0/g, " ").replace(/[\t\f\v]+/g, " ").replace(/[ ]{2,}/g, " ");
  return text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
}
function extractBoilerplate(html) {
  const blocks = [];
  const pattern = /<(nav|footer|header)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const cleanedHtml = html.replace(pattern, (_full, rawKind, inner) => {
    const text = normalizeText(inner);
    if (text) {
      const tag = rawKind.toLowerCase();
      const kind = tag === "nav" ? "navigation" : tag === "footer" ? "footer" : "header";
      blocks.push({
        kind,
        text,
        headingPath: [],
        boilerplate: true,
        atomic: false
      });
    }
    return " ";
  });
  return { cleanedHtml, blocks };
}
function replaceStructuredRegions(html) {
  let working = html;
  working = working.replace(
    /<details\b[^>]*>([\s\S]*?)<\/details>/gi,
    (_full, inner) => {
      const summaryMatch = /<summary\b[^>]*>([\s\S]*?)<\/summary>/i.exec(inner);
      const question = summaryMatch?.[1] ? normalizeText(summaryMatch[1]) : "";
      const withoutSummary = inner.replace(
        /<summary\b[^>]*>[\s\S]*?<\/summary>/i,
        " "
      );
      const answer = normalizeText(withoutSummary);
      const combined = question && answer ? `Q: ${question}
A: ${answer}` : question || answer;
      return combined ? `<p data-scanner-kind="faq">${escapeForPseudoHtml(combined)}</p>` : " ";
    }
  );
  working = working.replace(
    /<table\b[^>]*>([\s\S]*?)<\/table>/gi,
    (_full, inner) => {
      const rows = [];
      for (const match of inner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
        const cells = [
          ...(match[1] ?? "").matchAll(
            /<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi
          )
        ].map((cell) => normalizeText(cell[1] ?? "")).filter(Boolean);
        if (cells.length) rows.push(cells.join(" | "));
      }
      return rows.map(
        (row) => `<p data-scanner-kind="table_row">${escapeForPseudoHtml(row)}</p>`
      ).join("");
    }
  );
  working = working.replace(
    /<dl\b[^>]*>([\s\S]*?)<\/dl>/gi,
    (_full, inner) => {
      const entries = [];
      const terms = [
        ...inner.matchAll(
          /<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi
        )
      ];
      for (const match of terms) {
        const term = normalizeText(match[1] ?? "");
        const description = normalizeText(match[2] ?? "");
        if (term && description) entries.push(`${term}: ${description}`);
      }
      return entries.map(
        (entry) => `<p data-scanner-kind="definition">${escapeForPseudoHtml(entry)}</p>`
      ).join("");
    }
  );
  working = working.replace(
    /<figure\b[^>]*>([\s\S]*?)<\/figure>/gi,
    (_full, inner) => {
      const caption = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i.exec(
        inner
      )?.[1];
      const alt = /<img\b[^>]*>/i.exec(inner)?.[0];
      const captionText = caption ? normalizeText(caption) : "";
      const altText = alt ? attributeValue(alt, "alt") ?? "" : "";
      const text = [captionText, altText && altText !== captionText ? altText : ""].filter(Boolean).join(" \u2014 ");
      return text ? `<p data-scanner-kind="figure">${escapeForPseudoHtml(text)}</p>` : " ";
    }
  );
  working = working.replace(/<img\b[^>]*>/gi, (tag) => {
    const alt = attributeValue(tag, "alt");
    return alt ? `<p data-scanner-kind="figure">${escapeForPseudoHtml(alt)}</p>` : " ";
  });
  return working;
}
function escapeForPseudoHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function extractHeadingRecords(html) {
  const out = [];
  for (const match of html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const text = normalizeText(match[2] ?? "");
    if (!text) continue;
    out.push({
      level: Number(match[1]),
      text,
      index: match.index ?? 0
    });
  }
  return out;
}
function blockKindFromTag(tag, attributes) {
  const explicit = attributeValue(attributes, "data-scanner-kind");
  if (explicit === "faq" || explicit === "table_row" || explicit === "definition" || explicit === "figure") {
    return explicit;
  }
  if (tag === "li") return "list_item";
  return "paragraph";
}
function structuredBlocks(html) {
  const processed = replaceStructuredRegions(removeNonContentMarkup(html));
  const headings = extractHeadingRecords(processed);
  const events = headings.map((heading) => ({
    type: "heading",
    ...heading
  }));
  for (const match of processed.matchAll(
    /<(p|li)\b([^>]*)>([\s\S]*?)<\/\1>/gi
  )) {
    const text = normalizeText(match[3] ?? "");
    if (!text) continue;
    const kind = blockKindFromTag(
      (match[1] ?? "p").toLowerCase(),
      match[2] ?? ""
    );
    events.push({
      type: "block",
      index: match.index ?? 0,
      kind,
      text,
      atomic: kind === "faq" || kind === "table_row" || kind === "definition" || kind === "figure"
    });
  }
  events.sort((a, b) => a.index - b.index);
  const headingPath = [];
  const blocks = [];
  const represented = /* @__PURE__ */ new Set();
  for (const event of events) {
    if (event.type === "heading") {
      headingPath.splice(event.level - 1);
      headingPath[event.level - 1] = event.text;
      continue;
    }
    const normalized = event.text.trim();
    if (!normalized) continue;
    represented.add(normalized.toLowerCase());
    blocks.push({
      kind: event.kind,
      text: normalized,
      headingPath: headingPath.filter(Boolean),
      boilerplate: false,
      atomic: event.atomic
    });
  }
  for (const line of visibleLines(processed)) {
    const key = line.toLowerCase();
    if (represented.has(key)) continue;
    if (headings.some((heading) => heading.text.toLowerCase() === key)) continue;
    if (line.length < 12) continue;
    represented.add(key);
    blocks.push({
      kind: "body",
      text: line,
      headingPath: [],
      boilerplate: false,
      atomic: false
    });
  }
  return blocks;
}
function pageHeadings(html) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const heading of extractHeadingRecords(removeNonContentMarkup(html))) {
    const key = heading.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(heading.text);
  }
  return out;
}
function splitLongText(text, maxChars, overlapChars) {
  if (text.length <= maxChars) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + maxChars);
    if (end < text.length) {
      const sentenceBreak = Math.max(
        text.lastIndexOf(". ", end),
        text.lastIndexOf("! ", end),
        text.lastIndexOf("? ", end),
        text.lastIndexOf("\n", end)
      );
      const wordBreak = text.lastIndexOf(" ", end);
      const candidate = sentenceBreak > start + Math.floor(maxChars * 0.55) ? sentenceBreak + 1 : wordBreak > start + Math.floor(maxChars * 0.55) ? wordBreak : end;
      end = candidate;
    }
    const piece = text.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end >= text.length) break;
    start = Math.max(end - overlapChars, start + 1);
  }
  return chunks;
}
function chunkBlocks(input) {
  const maxChars = Math.max(
    400,
    Math.min(4e3, Math.trunc(input.maxChars ?? DEFAULT_MAX_CHUNK_CHARS))
  );
  const overlapChars = Math.max(
    0,
    Math.min(
      Math.floor(maxChars / 3),
      Math.trunc(input.overlapChars ?? DEFAULT_CHUNK_OVERLAP_CHARS)
    )
  );
  const chunks = [];
  let ordinal = 0;
  let pendingText = "";
  let pendingHeadingPath = [];
  const emit = (text, headingPath) => {
    for (const piece of splitLongText(text, maxChars, overlapChars)) {
      const contentHash = stableContentHash(piece);
      chunks.push({
        id: stableChunkId(input.canonicalUrl, ordinal, piece),
        canonicalUrl: input.canonicalUrl,
        ...input.title ? { title: input.title } : {},
        headingPath: [...headingPath],
        text: piece,
        ordinal,
        contentHash
      });
      ordinal += 1;
    }
  };
  const flush = () => {
    if (!pendingText.trim()) return;
    emit(pendingText.trim(), pendingHeadingPath);
    pendingText = "";
    pendingHeadingPath = [];
  };
  for (const block of input.blocks) {
    if (block.boilerplate) continue;
    if (block.atomic) {
      flush();
      emit(block.text, block.headingPath);
      continue;
    }
    const sameHeading = pendingText && pendingHeadingPath.join("\0") === block.headingPath.join("\0");
    const candidate = sameHeading ? pendingText + "\n" + block.text : block.text;
    if (!sameHeading) flush();
    if (sameHeading && candidate.length > maxChars) {
      flush();
    }
    if (!pendingText) {
      pendingHeadingPath = [...block.headingPath];
      pendingText = block.text;
    } else {
      pendingText += "\n" + block.text;
    }
  }
  flush();
  return chunks;
}
function extractPageInternal(input) {
  const requested = new URL(input.requestedUrl);
  const canonical = new URL(input.canonicalUrl ?? input.requestedUrl);
  const safeCanonical = canonical.toString();
  const boilerplate = extractBoilerplate(input.html);
  const mainHtml = boilerplate.cleanedHtml;
  const contentBlocks = structuredBlocks(mainHtml);
  const boilerplateBlocks = boilerplate.blocks;
  const headings = pageHeadings(input.html);
  const allVisible = [
    ...boilerplateBlocks.map((block) => block.text),
    ...headings,
    ...contentBlocks.map((block) => block.text)
  ].map((line) => line.trim()).filter(Boolean);
  const visibleText2 = [...new Set(allVisible)].join("\n");
  const extracted = extractDraftFromHtml([
    { url: safeCanonical, html: input.html }
  ]);
  const structuredFacts = structuredClone(
    extracted.facts
  );
  const contentHash = stableContentHash(
    visibleText2 + "\n\0structured\0\n" + stableJson(structuredFacts)
  );
  const fetchedAt = input.fetchedAt ?? (/* @__PURE__ */ new Date()).toISOString();
  const page = {
    requestedUrl: requested.toString(),
    canonicalUrl: safeCanonical,
    ...extractTitle2(input.html) ? { title: extractTitle2(input.html) } : {},
    headings,
    visibleText: visibleText2,
    structuredFacts,
    contentType: input.contentType ?? "text/html",
    fetchMode: input.fetchMode ?? "http",
    contentHash,
    ...input.discoveredFrom ? { discoveredFrom: input.discoveredFrom } : {},
    fetchedAt,
    ...headerValue(input.headers, "etag") ? { etag: headerValue(input.headers, "etag") } : {},
    ...headerValue(input.headers, "last-modified") ? { lastModified: headerValue(input.headers, "last-modified") } : {}
  };
  return {
    page,
    contentBlocks,
    boilerplateBlocks,
    chunks: chunkBlocks({
      canonicalUrl: safeCanonical,
      title: page.title,
      blocks: contentBlocks
    })
  };
}
function extractScannerV2Page(input) {
  return extractPageInternal(input);
}

// packages/onboarding-ingest/src/scanner-v2-url-policy.ts
var DEFAULT_MAX_PATH_DEPTH = 16;
var DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE = 64;
var DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY = 24;
var TRACKING_PARAM_NAMES = /* @__PURE__ */ new Set([
  "dclid",
  "fbclid",
  "gclid",
  "gbraid",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "twclid",
  "wbraid",
  "_ga",
  "_gl"
]);
var SESSION_OR_TOKEN_PARAM = /^(?:sid|session|sessionid|session_id|phpsessid|jsessionid|aspsessionid|token|access_token|auth|auth_token|csrf|csrf_token|nonce)$/i;
var BLOCKED_PATH_SEGMENTS = /* @__PURE__ */ new Set([
  "admin",
  "administrator",
  "basket",
  "cart",
  "checkout",
  "login",
  "logout",
  "my-account",
  "account",
  "wp-admin",
  "wp-login.php"
]);
var SEARCH_PATH_SEGMENTS = /* @__PURE__ */ new Set([
  "search",
  "search-results",
  "searchresults"
]);
var CALENDAR_QUERY_PARAMS = /* @__PURE__ */ new Set([
  "calendar",
  "date",
  "day",
  "month",
  "year"
]);
function boundedPathDepth(value) {
  if (!Number.isFinite(value)) return DEFAULT_MAX_PATH_DEPTH;
  return Math.max(
    1,
    Math.min(DEFAULT_MAX_PATH_DEPTH, Math.trunc(value))
  );
}
function decodedPathSegments(url) {
  return url.pathname.split("/").filter(Boolean).map((segment) => {
    try {
      return decodeURIComponent(segment).toLowerCase();
    } catch {
      return segment.toLowerCase();
    }
  });
}
function isTrackingParam(name) {
  const lower = name.toLowerCase();
  return lower.startsWith("utm_") || TRACKING_PARAM_NAMES.has(lower);
}
function sortSearchParams(url) {
  const entries = [...url.searchParams.entries()].sort(([ak, av], [bk, bv]) => {
    const key = ak.localeCompare(bk, "en", { sensitivity: "variant" });
    return key || av.localeCompare(bv, "en", { sensitivity: "variant" });
  });
  url.search = "";
  for (const [key, value] of entries) url.searchParams.append(key, value);
}
function normalizeScannerV2Url(raw, origin, options = {}) {
  let parsed;
  try {
    parsed = new URL(raw, origin);
  } catch {
    return {
      ok: false,
      displayUrl: raw.trim() || "invalid-url",
      reason: "invalid_url",
      incomplete: false
    };
  }
  parsed.hash = "";
  if (parsed.protocol !== "https:") {
    return {
      ok: false,
      displayUrl: parsed.toString(),
      reason: "insecure_scheme",
      incomplete: false
    };
  }
  if (parsed.origin !== origin.origin) {
    return {
      ok: false,
      displayUrl: parsed.toString(),
      reason: "cross_origin",
      incomplete: false
    };
  }
  const allowed = allowPublicHttpsUrl(parsed.toString());
  if (!allowed.ok) {
    return {
      ok: false,
      displayUrl: parsed.toString(),
      reason: "non_public_url",
      incomplete: false
    };
  }
  parsed = new URL(allowed.url.toString());
  parsed.hash = "";
  const segments = decodedPathSegments(parsed);
  const applyContentPolicy = options.applyContentPolicy ?? true;
  const maxPathDepth = boundedPathDepth(options.maxPathDepth);
  if (applyContentPolicy && segments.length > maxPathDepth) {
    return {
      ok: false,
      displayUrl: parsed.toString(),
      reason: "path_depth_limit",
      incomplete: true
    };
  }
  if (applyContentPolicy) {
    if (segments.some((segment) => BLOCKED_PATH_SEGMENTS.has(segment))) {
      return {
        ok: false,
        displayUrl: parsed.toString(),
        reason: "blocked_path",
        incomplete: false
      };
    }
    if (segments.some((segment) => SEARCH_PATH_SEGMENTS.has(segment))) {
      return {
        ok: false,
        displayUrl: parsed.toString(),
        reason: "search_endpoint",
        incomplete: false
      };
    }
    for (const [name] of parsed.searchParams) {
      if (SESSION_OR_TOKEN_PARAM.test(name)) {
        return {
          ok: false,
          displayUrl: parsed.toString(),
          reason: "session_or_token_parameter",
          incomplete: false
        };
      }
    }
  }
  const beforeTrackingRemoval = new URL(parsed.toString());
  sortSearchParams(beforeTrackingRemoval);
  const strippedTrackingParams = [];
  for (const name of [...parsed.searchParams.keys()]) {
    if (!isTrackingParam(name)) continue;
    strippedTrackingParams.push(name);
    parsed.searchParams.delete(name);
  }
  sortSearchParams(parsed);
  const aliasUrl = beforeTrackingRemoval.toString();
  const normalized = parsed.toString();
  return {
    ok: true,
    url: normalized,
    ...aliasUrl !== normalized ? { aliasUrl } : {},
    strippedTrackingParams: [...new Set(strippedTrackingParams)].sort()
  };
}
function attributeValue2(tag, name) {
  const quoted = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "i"
  ).exec(tag);
  if (quoted) return quoted[1] ?? quoted[2] ?? void 0;
  const bare = new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, "i").exec(tag);
  return bare?.[1];
}
function extractScannerV2CanonicalLink(input) {
  let page;
  let origin;
  try {
    page = new URL(input.pageUrl);
    origin = new URL(input.origin);
  } catch {
    return null;
  }
  for (const match of input.html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = attributeValue2(tag, "rel");
    if (!rel?.split(/\s+/).some((value) => value.toLowerCase() === "canonical")) {
      continue;
    }
    const href = attributeValue2(tag, "href");
    if (!href) continue;
    return normalizeScannerV2Url(href, origin, {
      maxPathDepth: input.maxPathDepth,
      applyContentPolicy: true
    });
  }
  return null;
}
function calendarFamily(url) {
  const queryKeys = [...url.searchParams.keys()].map((key) => key.toLowerCase());
  if (queryKeys.some((key) => CALENDAR_QUERY_PARAMS.has(key))) {
    const copy2 = new URL(url.toString());
    for (const key of [...copy2.searchParams.keys()]) {
      if (CALENDAR_QUERY_PARAMS.has(key.toLowerCase())) {
        copy2.searchParams.set(key, ":date");
      }
    }
    sortSearchParams(copy2);
    return copy2.toString();
  }
  const segments = url.pathname.split("/").filter(Boolean);
  let foundYear = false;
  const normalized = segments.map((segment) => {
    if (/^(?:19|20|21)\d{2}$/.test(segment)) {
      foundYear = true;
      return ":year";
    }
    if (foundYear && /^(?:0?[1-9]|1[0-2])$/.test(segment)) return ":month";
    if (foundYear && /^(?:0?[1-9]|[12]\d|3[01])$/.test(segment)) return ":day";
    return segment;
  });
  if (!foundYear) return null;
  const copy = new URL(url.toString());
  copy.pathname = "/" + normalized.join("/");
  return copy.toString();
}
function queryFamily(url) {
  if ([...url.searchParams.keys()].length === 0) return null;
  const keys = [...url.searchParams.keys()].map((key) => key.toLowerCase()).sort();
  return `${url.origin}${url.pathname}?${keys.join("&")}`;
}
var ScannerV2FrontierTrapGuard = class {
  constructor(options = {}) {
    this.queryFamilies = /* @__PURE__ */ new Map();
    this.calendarFamilies = /* @__PURE__ */ new Map();
    const requestedQuery = options.maxQueryVariantsPerSignature;
    const requestedCalendar = options.maxCalendarVariantsPerFamily;
    this.maxQueryVariants = Number.isFinite(requestedQuery) ? Math.max(
      1,
      Math.min(
        DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE,
        Math.trunc(requestedQuery)
      )
    ) : DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE;
    this.maxCalendarVariants = Number.isFinite(requestedCalendar) ? Math.max(
      1,
      Math.min(
        DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY,
        Math.trunc(requestedCalendar)
      )
    ) : DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY;
  }
  evaluate(rawUrl) {
    const url = new URL(rawUrl);
    const calendar = calendarFamily(url);
    if (calendar) {
      let variants = this.calendarFamilies.get(calendar);
      if (!variants) {
        variants = /* @__PURE__ */ new Set();
        this.calendarFamilies.set(calendar, variants);
      }
      if (!variants.has(rawUrl) && variants.size >= this.maxCalendarVariants) {
        return {
          ok: false,
          reason: "calendar_variant_limit",
          incomplete: true
        };
      }
      variants.add(rawUrl);
    }
    const query = queryFamily(url);
    if (query) {
      let variants = this.queryFamilies.get(query);
      if (!variants) {
        variants = /* @__PURE__ */ new Set();
        this.queryFamilies.set(query, variants);
      }
      if (!variants.has(rawUrl) && variants.size >= this.maxQueryVariants) {
        return {
          ok: false,
          reason: "query_variant_limit",
          incomplete: true
        };
      }
      variants.add(rawUrl);
    }
    return { ok: true };
  }
};

// packages/onboarding-ingest/src/scanner-v2-discovery.ts
var DEFAULT_MAX_SITEMAP_DOCUMENTS = 64;
var DEFAULT_MAX_SITEMAP_DEPTH = 4;
var DEFAULT_MAX_DISCOVERED_URLS = 1e4;
var DEFAULT_MAX_HTML_PAGES = 1e4;
var DEFAULT_MAX_SITEMAP_BYTES = 512 * 1024;
var DEFAULT_MAX_HTML_BYTES = 2 * 1024 * 1024;
var DEFAULT_SITEMAP_TIMEOUT_MS = 5e3;
var DEFAULT_HTML_TIMEOUT_MS = 5e3;
function boundedInt(value, fallback, minimum, maximum) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(
    maximum,
    Math.max(minimum, Math.trunc(value))
  );
}
function decodeXml(value) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}
function tagText(xml, name) {
  const match = new RegExp(
    `<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`,
    "i"
  ).exec(xml);
  const value = match?.[1] ? decodeXml(match[1]).trim() : "";
  return value || void 0;
}
function parseSitemapXml(xml) {
  const root = /<sitemapindex\b/i.test(xml) ? "sitemapindex" : /<urlset\b/i.test(xml) ? "urlset" : "unknown";
  if (root === "unknown") return { kind: root, entries: [] };
  const itemTag = root === "sitemapindex" ? "sitemap" : "url";
  const items = [
    ...xml.matchAll(
      new RegExp(`<${itemTag}\\b[^>]*>([\\s\\S]*?)<\\/${itemTag}>`, "gi")
    )
  ];
  const entries = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of items) {
    const body = item[1] ?? "";
    const loc = tagText(body, "loc");
    if (!loc || seen.has(loc)) continue;
    seen.add(loc);
    const lastmod = tagText(body, "lastmod");
    entries.push(lastmod ? { loc, lastmod } : { loc });
  }
  return { kind: root, entries };
}
function parseRobotsSitemaps(body, baseOrigin) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    const match = /^sitemap\s*:\s*(\S.*?)\s*$/i.exec(line);
    if (!match?.[1]) continue;
    let url;
    try {
      url = new URL(match[1], baseOrigin);
    } catch {
      continue;
    }
    url.hash = "";
    if (url.protocol !== "https:" || url.origin !== baseOrigin.origin) continue;
    const allow = allowPublicHttpsUrl(url.toString());
    if (!allow.ok) continue;
    const canonical = allow.url.toString();
    if (!seen.has(canonical)) {
      seen.add(canonical);
      out.push(canonical);
    }
  }
  return out;
}
function normalizeDiscoveredUrl(raw, origin, options = {}) {
  const result = normalizeScannerV2Url(raw, origin, {
    maxPathDepth: options.maxPathDepth,
    applyContentPolicy: options.applyContentPolicy
  });
  return result.ok ? result.url : null;
}
var UrlAccumulator = class {
  constructor(maxUrls) {
    this.rows = /* @__PURE__ */ new Map();
    this.limitReached = false;
    this.droppedByLimit = 0;
    this.maxUrls = maxUrls;
  }
  add(row) {
    if (this.rows.has(row.url)) return false;
    if (this.rows.size >= this.maxUrls) {
      this.limitReached = true;
      this.droppedByLimit += 1;
      return false;
    }
    this.rows.set(row.url, structuredClone(row));
    return true;
  }
  update(url, patch) {
    const current = this.rows.get(url);
    if (!current) return;
    this.rows.set(url, { ...current, ...structuredClone(patch) });
  }
  get(url) {
    const row = this.rows.get(url);
    return row ? structuredClone(row) : void 0;
  }
  values() {
    return [...this.rows.values()].map((row) => structuredClone(row));
  }
};
async function fetchRobotsForDiscovery(origin, options) {
  const url = new URL("/robots.txt", origin);
  try {
    const response2 = await fetchPublicHttps(url.toString(), {
      lookup: options.lookup,
      get: options.get,
      timeoutMs: Math.min(
        options.sitemapTimeoutMs ?? DEFAULT_SITEMAP_TIMEOUT_MS,
        DEFAULT_PAGE_TIMEOUT_MS
      ),
      maxBytes: 64 * 1024,
      maxRedirects: 2
    });
    if (response2.status === 404 || response2.status === 410) {
      return {
        body: "",
        rules: parseRobotsTxt(""),
        warning: "robots_not_found",
        incomplete: false
      };
    }
    if (response2.status >= 400) {
      return {
        body: "",
        rules: parseRobotsTxt(""),
        warning: `robots_http_${response2.status}`,
        incomplete: true
      };
    }
    return {
      body: response2.body,
      rules: parseRobotsTxt(response2.body),
      source: {
        url: response2.url.toString(),
        status: response2.status,
        bytes: Buffer.byteLength(response2.body, "utf8")
      },
      incomplete: false
    };
  } catch {
    return {
      body: "",
      rules: parseRobotsTxt(""),
      warning: "robots_unavailable",
      incomplete: true
    };
  }
}
function responseContentType(headers) {
  return Object.entries(headers).find(
    ([key]) => key.toLowerCase() === "content-type"
  )?.[1] ?? "";
}
function isHtmlType(contentType2) {
  return /(?:text\/html|application\/xhtml\+xml)/i.test(contentType2);
}
function isPlainTextType(contentType2) {
  return /^text\/plain\b/i.test(contentType2);
}
async function fetchScannerV2DiscoveryPage(url, options) {
  let firstError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await fetchPublicHttps(url, {
        lookup: options.lookup,
        get: options.get,
        timeoutMs: options.timeoutMs,
        maxBytes: options.maxBytes,
        maxDecompressedBytes: options.maxBytes,
        acceptCompressed: true,
        maxRedirects: DEFAULT_MAX_REDIRECTS
      });
    } catch (error) {
      if (!(error instanceof ScanError) || !["timeout", "fetch_failed", "dns_failed"].includes(error.code) || attempt === 1) {
        throw error;
      }
      firstError = error;
    }
  }
  throw firstError;
}
function terminalHttpDisposition(status) {
  if ([401, 403, 404, 410].includes(status)) {
    return { status: "policy_skipped", reason: `http_${status}` };
  }
  return { status: "unresolved", reason: `http_${status}` };
}
async function discoverScannerV2Frontier(rawUrl, options = {}) {
  const initial = allowPublicHttpsUrl(rawUrl);
  if (!initial.ok) {
    throw new Error(`scanner_v2_discovery_denied:${initial.reason}`);
  }
  const origin = new URL(initial.url.origin);
  const maxSitemapDocuments = boundedInt(
    options.maxSitemapDocuments,
    DEFAULT_MAX_SITEMAP_DOCUMENTS,
    1,
    DEFAULT_MAX_SITEMAP_DOCUMENTS
  );
  const maxSitemapDepth = boundedInt(
    options.maxSitemapDepth,
    DEFAULT_MAX_SITEMAP_DEPTH,
    0,
    DEFAULT_MAX_SITEMAP_DEPTH
  );
  const maxDiscoveredUrls = boundedInt(
    options.maxDiscoveredUrls,
    DEFAULT_MAX_DISCOVERED_URLS,
    1,
    DEFAULT_MAX_DISCOVERED_URLS
  );
  const maxHtmlPages = boundedInt(
    options.maxHtmlPages,
    DEFAULT_MAX_HTML_PAGES,
    1,
    DEFAULT_MAX_HTML_PAGES
  );
  const maxSitemapBytes = boundedInt(
    options.maxSitemapBytes,
    DEFAULT_MAX_SITEMAP_BYTES,
    1024,
    DEFAULT_MAX_SITEMAP_BYTES
  );
  const maxHtmlBytes = boundedInt(
    options.maxHtmlBytes,
    DEFAULT_MAX_HTML_BYTES,
    1024,
    DEFAULT_MAX_HTML_BYTES
  );
  const sitemapTimeoutMs = boundedInt(
    options.sitemapTimeoutMs,
    DEFAULT_SITEMAP_TIMEOUT_MS,
    250,
    DEFAULT_SITEMAP_TIMEOUT_MS
  );
  const htmlTimeoutMs = boundedInt(
    options.htmlTimeoutMs,
    DEFAULT_HTML_TIMEOUT_MS,
    250,
    DEFAULT_HTML_TIMEOUT_MS
  );
  const maxPathDepth = boundedInt(
    options.maxPathDepth,
    DEFAULT_MAX_PATH_DEPTH,
    1,
    DEFAULT_MAX_PATH_DEPTH
  );
  const maxQueryVariantsPerSignature = boundedInt(
    options.maxQueryVariantsPerSignature,
    DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE,
    1,
    DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE
  );
  const maxCalendarVariantsPerFamily = boundedInt(
    options.maxCalendarVariantsPerFamily,
    DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY,
    1,
    DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY
  );
  const warnings = [];
  const sitemapSources = [];
  const pageSources = [];
  const urls = new UrlAccumulator(maxDiscoveredUrls);
  const trapGuard = new ScannerV2FrontierTrapGuard({
    maxQueryVariantsPerSignature,
    maxCalendarVariantsPerFamily
  });
  const contentOwnerByHash = /* @__PURE__ */ new Map();
  let discoveryIncomplete = false;
  const root = normalizeScannerV2Url(initial.url.toString(), origin, {
    maxPathDepth,
    applyContentPolicy: true
  });
  if (!root.ok) {
    throw new Error(`scanner_v2_discovery_policy:${root.reason}`);
  }
  if (root.aliasUrl) {
    urls.add({
      url: root.aliasUrl,
      canonicalUrl: root.url,
      status: "duplicate",
      discoveryReason: "submitted",
      reason: "normalized_url_variant"
    });
  }
  urls.add({
    url: root.url,
    status: "queued",
    discoveryReason: "submitted"
  });
  trapGuard.evaluate(root.url);
  const robots = await fetchRobotsForDiscovery(origin, options);
  if (robots.warning) warnings.push(robots.warning);
  if (robots.source) sitemapSources.push(robots.source);
  discoveryIncomplete = discoveryIncomplete || robots.incomplete;
  function admitPageCandidate(raw, metadata) {
    const normalized = normalizeScannerV2Url(raw, origin, {
      maxPathDepth,
      applyContentPolicy: true
    });
    if (!normalized.ok) {
      urls.add({
        url: normalized.displayUrl,
        status: "policy_skipped",
        discoveryReason: metadata.discoveryReason,
        ...metadata.discoveredFrom ? { discoveredFrom: metadata.discoveredFrom } : {},
        ...metadata.sitemapLastModified ? { sitemapLastModified: metadata.sitemapLastModified } : {},
        reason: normalized.reason
      });
      if (normalized.incomplete) {
        discoveryIncomplete = true;
        warnings.push(normalized.reason);
      }
      return null;
    }
    const trap = trapGuard.evaluate(normalized.url);
    if (!trap.ok) {
      urls.add({
        url: normalized.url,
        status: "policy_skipped",
        discoveryReason: metadata.discoveryReason,
        ...metadata.discoveredFrom ? { discoveredFrom: metadata.discoveredFrom } : {},
        ...metadata.sitemapLastModified ? { sitemapLastModified: metadata.sitemapLastModified } : {},
        reason: trap.reason
      });
      discoveryIncomplete = true;
      warnings.push(trap.reason);
      return null;
    }
    const added = urls.add({
      url: normalized.url,
      status: "queued",
      discoveryReason: metadata.discoveryReason,
      ...metadata.discoveredFrom ? { discoveredFrom: metadata.discoveredFrom } : {},
      ...metadata.sitemapLastModified ? { sitemapLastModified: metadata.sitemapLastModified } : {}
    });
    if (normalized.aliasUrl && normalized.aliasUrl !== normalized.url) {
      urls.add({
        url: normalized.aliasUrl,
        canonicalUrl: normalized.url,
        status: "duplicate",
        discoveryReason: metadata.discoveryReason,
        ...metadata.discoveredFrom ? { discoveredFrom: metadata.discoveredFrom } : {},
        ...metadata.sitemapLastModified ? { sitemapLastModified: metadata.sitemapLastModified } : {},
        reason: "normalized_url_variant"
      });
    }
    return { url: normalized.url, added };
  }
  const declared = parseRobotsSitemaps(robots.body, origin);
  const sitemapQueue = declared.length > 0 ? declared.map((url) => ({ url, depth: 0, declared: true })) : [{
    url: new URL("/sitemap.xml", origin).toString(),
    depth: 0,
    declared: false
  }];
  const sitemapSeen = /* @__PURE__ */ new Set();
  let sitemapUrlsDiscovered = 0;
  while (sitemapQueue.length > 0) {
    const next = sitemapQueue.shift();
    if (!next) continue;
    const normalizedSitemap = normalizeDiscoveredUrl(next.url, origin, {
      maxPathDepth,
      applyContentPolicy: false
    });
    if (!normalizedSitemap) {
      warnings.push("sitemap_url_rejected");
      if (next.declared) discoveryIncomplete = true;
      continue;
    }
    if (sitemapSeen.has(normalizedSitemap)) continue;
    if (next.depth > maxSitemapDepth) {
      warnings.push("sitemap_depth_limit");
      discoveryIncomplete = true;
      continue;
    }
    if (sitemapSeen.size >= maxSitemapDocuments) {
      warnings.push("sitemap_document_limit");
      discoveryIncomplete = true;
      break;
    }
    sitemapSeen.add(normalizedSitemap);
    let response2;
    try {
      response2 = await fetchPublicHttps(normalizedSitemap, {
        lookup: options.lookup,
        get: options.get,
        timeoutMs: sitemapTimeoutMs,
        maxBytes: maxSitemapBytes,
        maxDecompressedBytes: maxSitemapBytes,
        acceptCompressed: true,
        maxRedirects: DEFAULT_MAX_REDIRECTS
      });
    } catch {
      warnings.push("sitemap_fetch_failed");
      discoveryIncomplete = true;
      continue;
    }
    if (response2.status === 404 || response2.status === 410) {
      if (!next.declared && next.depth === 0 && sitemapSeen.size === 1) {
        warnings.push("sitemap_not_found");
      } else {
        warnings.push(`sitemap_http_${response2.status}`);
        discoveryIncomplete = true;
      }
      continue;
    }
    if (response2.status >= 400) {
      warnings.push(`sitemap_http_${response2.status}`);
      discoveryIncomplete = true;
      continue;
    }
    const type = responseContentType(response2.headers);
    if (type && !/(?:xml|text\/plain|application\/octet-stream|application\/gzip|application\/x-gzip)/i.test(type)) {
      warnings.push("sitemap_content_type_rejected");
      discoveryIncomplete = true;
      continue;
    }
    const bytes = Buffer.byteLength(response2.body, "utf8");
    if (bytes > maxSitemapBytes) {
      warnings.push("sitemap_byte_limit");
      discoveryIncomplete = true;
      continue;
    }
    sitemapSources.push({
      url: response2.url.toString(),
      status: response2.status,
      bytes
    });
    const parsed = parseSitemapXml(response2.body);
    if (parsed.kind === "unknown") {
      warnings.push("sitemap_invalid_xml");
      discoveryIncomplete = true;
      continue;
    }
    if (parsed.kind === "sitemapindex") {
      for (const entry of parsed.entries) {
        const normalized = normalizeDiscoveredUrl(entry.loc, origin, {
          maxPathDepth,
          applyContentPolicy: false
        });
        if (!normalized) {
          warnings.push("sitemap_child_rejected");
          discoveryIncomplete = true;
          continue;
        }
        if (next.depth >= maxSitemapDepth) {
          warnings.push("sitemap_depth_limit");
          discoveryIncomplete = true;
          continue;
        }
        if (!sitemapSeen.has(normalized)) {
          sitemapQueue.push({
            url: normalized,
            depth: next.depth + 1,
            declared: true
          });
        }
      }
      continue;
    }
    for (const entry of parsed.entries) {
      const admitted = admitPageCandidate(entry.loc, {
        discoveryReason: "sitemap",
        discoveredFrom: response2.url.toString(),
        ...entry.lastmod ? { sitemapLastModified: entry.lastmod } : {}
      });
      if (!admitted) {
        warnings.push("sitemap_page_rejected");
        continue;
      }
      if (admitted.added) sitemapUrlsDiscovered += 1;
    }
  }
  if (urls.limitReached) {
    warnings.push("discovered_url_limit");
    discoveryIncomplete = true;
  }
  const pageQueue = urls.values().filter((row) => row.status === "queued").map((row) => row.url);
  const pageQueued = new Set(pageQueue);
  const pageAttempted = /* @__PURE__ */ new Set();
  let htmlFetchAttempts = 0;
  let htmlPagesFetched = 0;
  let htmlLinksDiscovered = 0;
  while (pageQueue.length > 0) {
    const pageUrl = pageQueue.shift();
    if (!pageUrl || pageAttempted.has(pageUrl)) continue;
    pageAttempted.add(pageUrl);
    const current = urls.get(pageUrl);
    if (!current || current.status !== "queued") continue;
    let parsed;
    try {
      parsed = new URL(pageUrl);
    } catch {
      urls.update(pageUrl, {
        status: "unresolved",
        reason: "invalid_queued_url"
      });
      discoveryIncomplete = true;
      continue;
    }
    if (!isPathAllowed(robots.rules, parsed.pathname || "/")) {
      urls.update(pageUrl, {
        status: "robots_skipped",
        reason: "robots_disallow"
      });
      continue;
    }
    if (htmlFetchAttempts >= maxHtmlPages) {
      warnings.push("html_page_limit");
      discoveryIncomplete = true;
      break;
    }
    htmlFetchAttempts += 1;
    let response2;
    try {
      response2 = await fetchScannerV2DiscoveryPage(pageUrl, {
        lookup: options.lookup,
        get: options.get,
        timeoutMs: htmlTimeoutMs,
        maxBytes: maxHtmlBytes
      });
    } catch (error) {
      urls.update(pageUrl, {
        status: "unresolved",
        reason: error instanceof ScanError ? error.code : "fetch_failed"
      });
      discoveryIncomplete = true;
      continue;
    }
    if (response2.url.origin !== origin.origin) {
      urls.update(pageUrl, {
        status: "policy_skipped",
        reason: "cross_origin_redirect"
      });
      warnings.push("cross_origin_redirect");
      continue;
    }
    if (response2.status >= 400) {
      const terminal = terminalHttpDisposition(response2.status);
      urls.update(pageUrl, terminal);
      if (terminal.status === "unresolved") discoveryIncomplete = true;
      continue;
    }
    const contentType2 = responseContentType(response2.headers);
    const bytes = Buffer.byteLength(response2.body, "utf8");
    pageSources.push({
      url: response2.url.toString(),
      status: response2.status,
      bytes
    });
    if (!isHtmlType(contentType2) && !isPlainTextType(contentType2)) {
      urls.update(pageUrl, {
        status: "policy_skipped",
        reason: "content_type_not_stage2_html"
      });
      continue;
    }
    const finalUrlPolicy = normalizeScannerV2Url(
      response2.url.toString(),
      origin,
      {
        maxPathDepth,
        applyContentPolicy: true
      }
    );
    if (!finalUrlPolicy.ok) {
      urls.update(pageUrl, {
        status: "policy_skipped",
        reason: finalUrlPolicy.reason
      });
      if (finalUrlPolicy.incomplete) {
        discoveryIncomplete = true;
        warnings.push(finalUrlPolicy.reason);
      }
      continue;
    }
    const effectiveUrl = finalUrlPolicy.url;
    const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
    const contentHash = stableContentHash(response2.body);
    if (effectiveUrl !== pageUrl) {
      const existingFinal = urls.get(effectiveUrl);
      if (existingFinal) {
        urls.update(effectiveUrl, {
          status: "fetched",
          canonicalUrl: effectiveUrl,
          fetchedAt,
          contentHash
        });
      } else {
        urls.add({
          url: effectiveUrl,
          status: "fetched",
          discoveryReason: "canonical",
          discoveredFrom: pageUrl,
          canonicalUrl: effectiveUrl,
          fetchedAt,
          contentHash
        });
      }
      urls.update(pageUrl, {
        status: "duplicate",
        canonicalUrl: effectiveUrl,
        reason: "redirect_canonical",
        contentHash,
        fetchedAt
      });
    }
    let canonicalTarget = effectiveUrl;
    let canonicalReason = null;
    if (isHtmlType(contentType2)) {
      const canonical = extractScannerV2CanonicalLink({
        html: response2.body,
        pageUrl: response2.url.toString(),
        origin: origin.origin,
        maxPathDepth
      });
      if (canonical?.ok && canonical.url !== effectiveUrl) {
        const admittedCanonical = admitPageCandidate(canonical.url, {
          discoveryReason: "canonical",
          discoveredFrom: effectiveUrl
        });
        if (admittedCanonical) {
          canonicalTarget = admittedCanonical.url;
          canonicalReason = "rel_canonical";
          if (admittedCanonical.added && !pageQueued.has(admittedCanonical.url)) {
            pageQueued.add(admittedCanonical.url);
            pageQueue.push(admittedCanonical.url);
          }
        }
      } else if (canonical && !canonical.ok) {
        warnings.push("canonical_rejected");
      }
    }
    if (!canonicalReason) {
      const existingOwner = contentOwnerByHash.get(contentHash);
      if (existingOwner && existingOwner !== effectiveUrl) {
        canonicalTarget = existingOwner;
        canonicalReason = "content_hash_duplicate";
      } else {
        contentOwnerByHash.set(contentHash, effectiveUrl);
      }
    } else {
      contentOwnerByHash.set(contentHash, canonicalTarget);
    }
    if (canonicalReason) {
      const existingEffective = urls.get(effectiveUrl);
      if (existingEffective) {
        urls.update(effectiveUrl, {
          status: "duplicate",
          canonicalUrl: canonicalTarget,
          reason: canonicalReason,
          contentHash,
          fetchedAt
        });
      } else {
        urls.add({
          url: effectiveUrl,
          status: "duplicate",
          discoveryReason: "canonical",
          discoveredFrom: pageUrl,
          canonicalUrl: canonicalTarget,
          reason: canonicalReason,
          contentHash,
          fetchedAt
        });
      }
      if (pageUrl !== effectiveUrl) {
        urls.update(pageUrl, {
          status: "duplicate",
          canonicalUrl: canonicalTarget,
          reason: canonicalReason === "rel_canonical" ? "redirect_then_rel_canonical" : "redirect_then_content_hash_duplicate",
          contentHash,
          fetchedAt
        });
      }
    } else {
      const existingEffective = urls.get(effectiveUrl);
      if (existingEffective) {
        urls.update(effectiveUrl, {
          status: "fetched",
          canonicalUrl: effectiveUrl,
          contentHash,
          fetchedAt
        });
      }
      if (pageUrl === effectiveUrl) {
        urls.update(pageUrl, {
          status: "fetched",
          canonicalUrl: effectiveUrl,
          contentHash,
          fetchedAt
        });
      }
    }
    if (!isHtmlType(contentType2)) continue;
    htmlPagesFetched += 1;
    if (options.onHtmlPage && !canonicalReason) {
      try {
        await options.onHtmlPage({
          requestedUrl: pageUrl,
          canonicalUrl: effectiveUrl,
          html: response2.body,
          contentType: contentType2 || "text/html",
          fetchMode: "http",
          ...current.discoveredFrom ? { discoveredFrom: current.discoveredFrom } : {},
          fetchedAt,
          headers: response2.headers
        });
      } catch {
        urls.update(effectiveUrl, {
          status: "unresolved",
          canonicalUrl: effectiveUrl,
          reason: "html_page_consumer_failed",
          contentHash,
          fetchedAt
        });
        if (pageUrl !== effectiveUrl) {
          urls.update(pageUrl, {
            status: "unresolved",
            canonicalUrl: effectiveUrl,
            reason: "html_page_consumer_failed",
            contentHash,
            fetchedAt
          });
        }
        warnings.push("html_page_consumer_failed");
        discoveryIncomplete = true;
      }
    }
    const hrefs = extractSameOriginHrefs(response2.body, response2.url);
    for (const href of hrefs) {
      const admitted = admitPageCandidate(href, {
        discoveryReason: "html_link",
        discoveredFrom: effectiveUrl
      });
      if (!admitted?.added) continue;
      htmlLinksDiscovered += 1;
      if (!pageQueued.has(admitted.url)) {
        pageQueued.add(admitted.url);
        pageQueue.push(admitted.url);
      }
    }
    if (urls.limitReached) {
      warnings.push("discovered_url_limit");
      discoveryIncomplete = true;
      break;
    }
  }
  const stillQueued = urls.values().some((row) => row.status === "queued");
  if (stillQueued) discoveryIncomplete = true;
  const requestedState = discoveryIncomplete ? "PARTIAL" : "DISCOVERING";
  const manifest = buildCrawlManifest({
    crawlId: "scanner-v2-discovery",
    origin: origin.origin,
    requestedState,
    urls: urls.values()
  });
  return {
    manifest,
    sitemapSources,
    pageSources,
    sitemapDocuments: sitemapSeen.size,
    sitemapUrlsDiscovered,
    htmlPagesFetched,
    htmlLinksDiscovered,
    urlsDroppedByLimit: urls.droppedByLimit,
    warnings: [...new Set(warnings)],
    limitReached: urls.limitReached,
    incomplete: discoveryIncomplete
  };
}

// packages/onboarding-ingest/src/scanner-v2-documents.ts
var import_node_worker_threads = require("node:worker_threads");
var DEFAULT_DOCUMENT_FETCH_TIMEOUT_MS = 8e3;
var MAX_DOCUMENT_FETCH_TIMEOUT_MS = 2e4;
var DEFAULT_DOCUMENT_PARSE_TIMEOUT_MS = 8e3;
var MAX_DOCUMENT_PARSE_TIMEOUT_MS = 2e4;
var DEFAULT_MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;
var MAX_DOCUMENT_BYTES = 16 * 1024 * 1024;
var DEFAULT_MAX_DOCUMENT_TEXT_CHARS = 2e6;
var MAX_DOCUMENT_TEXT_CHARS = 4e6;
var DEFAULT_MAX_PDF_PAGES = 500;
var MAX_PDF_PAGES = 1e3;
var DEFAULT_DOCUMENT_CHUNK_CHARS = 1400;
var DEFAULT_DOCUMENT_CHUNK_OVERLAP = 120;
var PDF_WORKER_MAX_OLD_SPACE_MB = 256;
var PDF_WORKER_MAX_YOUNG_SPACE_MB = 32;
var PDF_WORKER_STACK_MB = 8;
var SUPPORTED_EXTENSIONS = /* @__PURE__ */ new Set([".pdf", ".txt", ".csv"]);
var UNSUPPORTED_TEXT_DOCUMENT_EXTENSIONS = /* @__PURE__ */ new Set([
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".odt",
  ".ods",
  ".odp",
  ".rtf"
]);
var OFFICE_MIME_RE = /(?:application\/(?:msword|rtf|vnd\.ms-|vnd\.openxmlformats-officedocument|vnd\.oasis\.opendocument))/i;
function boundedInt2(value, fallback, minimum, maximum) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(value)));
}
function contentType(headers) {
  const value = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === "content-type"
  )?.[1];
  return (value ?? "").split(";", 1)[0].trim().toLowerCase();
}
function extension(url) {
  const match = /\.[a-z0-9]{1,8}$/i.exec(url.pathname);
  return match?.[0]?.toLowerCase() ?? "";
}
function isScannerV2SupportedDocumentUrl(rawUrl) {
  try {
    return SUPPORTED_EXTENSIONS.has(extension(new URL(rawUrl)));
  } catch {
    return false;
  }
}
function isScannerV2UnsupportedTextDocumentUrl(rawUrl) {
  try {
    return UNSUPPORTED_TEXT_DOCUMENT_EXTENSIONS.has(
      extension(new URL(rawUrl))
    );
  } catch {
    return false;
  }
}
function isScannerV2UnsupportedDocumentContentType(type) {
  return OFFICE_MIME_RE.test(type);
}
function startsWithPdfMagic(bytes) {
  if (bytes.byteLength < 5) return false;
  return bytes[0] === 37 && bytes[1] === 80 && bytes[2] === 68 && bytes[3] === 70 && bytes[4] === 45;
}
function hasNulByte(bytes) {
  const sample = bytes.subarray(0, Math.min(bytes.byteLength, 64 * 1024));
  return sample.includes(0);
}
function classifyDocument(input) {
  const ext = extension(input.url);
  const type = input.type;
  if (isScannerV2UnsupportedDocumentContentType(type)) {
    return { ok: false, reason: "unsupported_document", incomplete: true };
  }
  if (UNSUPPORTED_TEXT_DOCUMENT_EXTENSIONS.has(ext)) {
    return { ok: false, reason: "unsupported_document", incomplete: true };
  }
  const pdfClaimed = type === "application/pdf" || ext === ".pdf";
  if (pdfClaimed) {
    if (!startsWithPdfMagic(input.bytes)) {
      return {
        ok: false,
        reason: "document_signature_mismatch",
        incomplete: true
      };
    }
    return { ok: true, kind: "pdf" };
  }
  const csvClaimed = type === "text/csv" || type === "application/csv" || ext === ".csv";
  if (csvClaimed) {
    if (hasNulByte(input.bytes)) {
      return {
        ok: false,
        reason: "document_binary_text_rejected",
        incomplete: true
      };
    }
    return { ok: true, kind: "csv" };
  }
  const textClaimed = type === "text/plain" || ext === ".txt";
  if (textClaimed) {
    if (hasNulByte(input.bytes)) {
      return {
        ok: false,
        reason: "document_binary_text_rejected",
        incomplete: true
      };
    }
    return { ok: true, kind: "text" };
  }
  return { ok: false, reason: "unsupported_document", incomplete: true };
}
function cleanText(value) {
  return value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n").replace(/[ \t]{2,}/g, " ").replace(/\n{4,}/g, "\n\n\n").trim();
}
function splitText(text, maxChars = DEFAULT_DOCUMENT_CHUNK_CHARS, overlapChars = DEFAULT_DOCUMENT_CHUNK_OVERLAP) {
  if (text.length <= maxChars) return text ? [text] : [];
  const out = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + maxChars);
    if (end < text.length) {
      const newline = text.lastIndexOf("\n", end);
      const sentence = Math.max(
        text.lastIndexOf(". ", end),
        text.lastIndexOf("! ", end),
        text.lastIndexOf("? ", end)
      );
      const word = text.lastIndexOf(" ", end);
      const floor = start + Math.floor(maxChars * 0.55);
      if (newline > floor) end = newline;
      else if (sentence > floor) end = sentence + 1;
      else if (word > floor) end = word;
    }
    const piece = text.slice(start, end).trim();
    if (piece) out.push(piece);
    if (end >= text.length) break;
    start = Math.max(start + 1, end - overlapChars);
  }
  return out;
}
function chunksForText(input) {
  const chunks = [];
  let ordinal = 0;
  for (const section of input.sections) {
    for (const piece of splitText(section.text)) {
      const hash = stableContentHash(piece);
      chunks.push({
        id: stableChunkId(input.canonicalUrl, ordinal, piece),
        canonicalUrl: input.canonicalUrl,
        ...input.title ? { title: input.title } : {},
        headingPath: section.heading,
        text: piece,
        ordinal,
        contentHash: hash
      });
      ordinal += 1;
    }
  }
  return chunks;
}
function titleFromUrl(url) {
  const name = url.pathname.split("/").filter(Boolean).at(-1);
  if (!name) return void 0;
  let decoded = name;
  try {
    decoded = decodeURIComponent(name);
  } catch {
  }
  const stripped = decoded.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return stripped || void 0;
}
var PDF_WORKER_SOURCE = String.raw`
const { parentPort, workerData } = require("node:worker_threads");

(async () => {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(workerData.bytes);
  const loadingTask = getDocument({
    data,
    isEvalSupported: false,
    useWorkerFetch: false,
    stopAtErrors: true,
  });

  try {
    const pdf = await loadingTask.promise;
    let title;
    try {
      const metadata = await pdf.getMetadata();
      const candidate = metadata && metadata.info && metadata.info.Title;
      if (typeof candidate === "string" && candidate.trim()) {
        title = candidate.trim().slice(0, 500);
      }
    } catch {}

    const pageLimit = Math.min(pdf.numPages, workerData.maxPages);
    const pages = [];
    let totalChars = 0;
    let truncated = pdf.numPages > pageLimit;

    for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        const strings = [];
        for (const item of content.items || []) {
          if (item && typeof item.str === "string" && item.str.trim()) {
            strings.push(item.str.trim());
          }
        }
        let text = strings.join(" ").replace(/\s+/g, " ").trim();
        const remaining = workerData.maxTextChars - totalChars;
        if (remaining <= 0) {
          truncated = true;
          break;
        }
        if (text.length > remaining) {
          text = text.slice(0, remaining);
          truncated = true;
        }
        totalChars += text.length;
        pages.push({ pageNumber, text });
        if (truncated) break;
      } finally {
        page.cleanup();
      }
    }

    parentPort.postMessage({
      ok: true,
      title,
      pages,
      totalPages: pdf.numPages,
      truncated,
    });
  } finally {
    await loadingTask.destroy();
  }
})().catch((error) => {
  parentPort.postMessage({
    ok: false,
    error:
      error instanceof Error
        ? error.message
        : String(error),
  });
});
`;
var pdfJsScannerV2Parser = async (bytes, options) => {
  return await new Promise((resolve, reject) => {
    const worker = new import_node_worker_threads.Worker(PDF_WORKER_SOURCE, {
      eval: true,
      resourceLimits: {
        maxOldGenerationSizeMb: PDF_WORKER_MAX_OLD_SPACE_MB,
        maxYoungGenerationSizeMb: PDF_WORKER_MAX_YOUNG_SPACE_MB,
        stackSizeMb: PDF_WORKER_STACK_MB
      },
      workerData: {
        bytes,
        maxPages: options.maxPages,
        maxTextChars: options.maxTextChars
      }
    });
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      void worker.terminate();
      reject(new Error("document_parse_timeout"));
    }, options.timeoutMs);
    timer.unref?.();
    const finish = () => {
      clearTimeout(timer);
      void worker.terminate();
    };
    worker.once("message", (message) => {
      if (settled) return;
      settled = true;
      finish();
      if (typeof message === "object" && message !== null && "ok" in message && message.ok === true) {
        const value = message;
        resolve({
          ...value.title ? { title: value.title } : {},
          pages: Array.isArray(value.pages) ? value.pages : [],
          totalPages: Number(value.totalPages ?? 0),
          truncated: value.truncated === true
        });
        return;
      }
      const detail = typeof message === "object" && message !== null && "error" in message ? String(message.error ?? "") : "";
      reject(new Error(detail || "document_parse_failed"));
    });
    worker.once("error", (error) => {
      if (settled) return;
      settled = true;
      finish();
      reject(error);
    });
    worker.once("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(
        new Error(
          code === 0 ? "document_parser_exited_without_result" : `document_parser_exit_${code}`
        )
      );
    });
  });
};
async function withTimeout(promise, timeoutMs) {
  return await new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("document_parse_timeout"));
    }, timeoutMs);
    timer.unref?.();
    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
function failure(url, reason, message, warnings = [], incomplete = true) {
  return {
    ok: false,
    incomplete,
    url,
    reason,
    message,
    warnings: [...new Set(warnings)]
  };
}
async function ingestScannerV2Document(rawUrl, options) {
  let origin;
  try {
    origin = new URL(options.origin);
  } catch {
    return failure(rawUrl, "invalid_origin", "The crawl origin was invalid.");
  }
  const policy = normalizeScannerV2Url(rawUrl, origin, {
    applyContentPolicy: true
  });
  if (!policy.ok) {
    return failure(
      policy.displayUrl,
      policy.reason,
      "The document URL was outside the Scanner V2 public-site policy.",
      [policy.reason],
      policy.incomplete
    );
  }
  const fetchTimeoutMs = boundedInt2(
    options.fetchTimeoutMs,
    DEFAULT_DOCUMENT_FETCH_TIMEOUT_MS,
    250,
    MAX_DOCUMENT_FETCH_TIMEOUT_MS
  );
  const parseTimeoutMs = boundedInt2(
    options.parseTimeoutMs,
    DEFAULT_DOCUMENT_PARSE_TIMEOUT_MS,
    250,
    MAX_DOCUMENT_PARSE_TIMEOUT_MS
  );
  const maxBytes = boundedInt2(
    options.maxBytes,
    DEFAULT_MAX_DOCUMENT_BYTES,
    1024,
    MAX_DOCUMENT_BYTES
  );
  const maxTextChars = boundedInt2(
    options.maxTextChars,
    DEFAULT_MAX_DOCUMENT_TEXT_CHARS,
    1024,
    MAX_DOCUMENT_TEXT_CHARS
  );
  const maxPdfPages = boundedInt2(
    options.maxPdfPages,
    DEFAULT_MAX_PDF_PAGES,
    1,
    MAX_PDF_PAGES
  );
  let response2;
  try {
    response2 = await fetchPublicHttpsBytes(policy.url, {
      lookup: options.lookup,
      get: options.get,
      timeoutMs: fetchTimeoutMs,
      maxBytes,
      maxRedirects: DEFAULT_MAX_REDIRECTS,
      allowedOrigin: origin.origin
    });
  } catch (error) {
    const reason = typeof error === "object" && error !== null && "code" in error ? String(error.code ?? "fetch_failed") : error instanceof Error ? error.message : "fetch_failed";
    return failure(
      policy.url,
      reason,
      "The public document could not be fetched safely.",
      [reason]
    );
  }
  if (response2.status >= 400) {
    return failure(
      response2.url.toString(),
      `document_http_${response2.status}`,
      "The public document returned an HTTP error.",
      [`document_http_${response2.status}`]
    );
  }
  const finalPolicy = normalizeScannerV2Url(response2.url.toString(), origin, {
    applyContentPolicy: true
  });
  if (!finalPolicy.ok) {
    return failure(
      response2.url.toString(),
      finalPolicy.reason,
      "The fetched document resolved outside the Scanner V2 public-site policy.",
      [finalPolicy.reason],
      finalPolicy.incomplete
    );
  }
  const type = contentType(response2.headers);
  const classified = classifyDocument({
    url: response2.url,
    type,
    bytes: response2.body
  });
  if (!classified.ok) {
    return failure(
      response2.url.toString(),
      classified.reason,
      classified.reason === "unsupported_document" ? "This public document format is not supported by Scanner V2 yet." : "The public document did not match its declared text-bearing format.",
      [classified.reason],
      classified.incomplete
    );
  }
  const fetchedAt = options.fetchedAt ?? (/* @__PURE__ */ new Date()).toISOString();
  const source = {
    url: finalPolicy.url,
    status: response2.status,
    bytes: response2.body.byteLength,
    contentType: type
  };
  let title = titleFromUrl(new URL(finalPolicy.url));
  let visibleText2 = "";
  let sections = [];
  let complete = true;
  const warnings = [];
  if (classified.kind === "pdf") {
    let parsed;
    try {
      parsed = await withTimeout(
        (options.pdfParser ?? pdfJsScannerV2Parser)(
          response2.body,
          {
            timeoutMs: parseTimeoutMs,
            maxPages: maxPdfPages,
            maxTextChars
          }
        ),
        parseTimeoutMs
      );
    } catch (error) {
      const reason = error instanceof Error && /timeout/i.test(error.message) ? "document_parse_timeout" : "document_parse_failed";
      return failure(
        finalPolicy.url,
        reason,
        "The PDF could not be parsed within the Scanner V2 safety boundary.",
        [reason]
      );
    }
    if (parsed.title) title = parsed.title;
    sections = parsed.pages.map((page2) => ({
      heading: ["PDF", `Page ${page2.pageNumber}`],
      text: cleanText(page2.text)
    })).filter((page2) => page2.text);
    visibleText2 = sections.map((page2) => `${page2.heading.at(-1)}
${page2.text}`).join("\n\n");
    if (parsed.truncated) {
      complete = false;
      warnings.push("document_limit_reached");
    }
  } else {
    const decoded = cleanText(new TextDecoder("utf-8").decode(response2.body));
    if (decoded.length > maxTextChars) {
      visibleText2 = decoded.slice(0, maxTextChars);
      complete = false;
      warnings.push("document_limit_reached");
    } else {
      visibleText2 = decoded;
    }
    sections = [
      {
        heading: [classified.kind === "csv" ? "CSV document" : "Text document"],
        text: visibleText2
      }
    ];
  }
  if (!visibleText2.trim()) {
    return failure(
      finalPolicy.url,
      "document_empty_text",
      "The public document contained no extractable text.",
      ["document_empty_text"]
    );
  }
  const contentHash = stableContentHash(visibleText2);
  const page = {
    requestedUrl: policy.url,
    canonicalUrl: finalPolicy.url,
    ...title ? { title } : {},
    headings: sections.map((section) => section.heading.at(-1) ?? "").filter(Boolean),
    visibleText: visibleText2,
    structuredFacts: {},
    contentType: type || (classified.kind === "pdf" ? "application/pdf" : classified.kind === "csv" ? "text/csv" : "text/plain"),
    fetchMode: "document",
    contentHash,
    ...options.discoveredFrom ? { discoveredFrom: options.discoveredFrom } : {},
    fetchedAt,
    ...response2.headers.etag ? { etag: response2.headers.etag } : {},
    ...response2.headers["last-modified"] ? { lastModified: response2.headers["last-modified"] } : {}
  };
  const chunks = chunksForText({
    canonicalUrl: page.canonicalUrl,
    ...title ? { title } : {},
    sections
  });
  return {
    ok: true,
    complete,
    kind: classified.kind,
    source,
    page,
    chunks,
    warnings
  };
}
async function ingestScannerV2ManifestDocuments(manifest, options = {}) {
  const rows = manifest.urls.map((row) => structuredClone(row));
  const pages = [];
  const chunks = [];
  const sources = [];
  const warnings = [];
  let attempted = 0;
  let succeeded = 0;
  let incomplete = manifest.state === "PARTIAL" || manifest.unresolved > 0;
  const replaceRow = (url, patch) => {
    const index = rows.findIndex((row) => row.url === url);
    if (index < 0) return;
    rows[index] = { ...rows[index], ...structuredClone(patch) };
  };
  for (const row of rows) {
    if (isScannerV2UnsupportedTextDocumentUrl(row.url)) {
      attempted += 1;
      incomplete = true;
      warnings.push("unsupported_document");
      replaceRow(row.url, {
        status: "unresolved",
        reason: "unsupported_document"
      });
      continue;
    }
    if (!isScannerV2SupportedDocumentUrl(row.url)) continue;
    attempted += 1;
    const result = await ingestScannerV2Document(row.url, {
      origin: manifest.origin,
      ...options,
      ...row.discoveredFrom ? { discoveredFrom: row.discoveredFrom } : {}
    });
    if (!result.ok) {
      incomplete = incomplete || result.incomplete;
      warnings.push(...result.warnings, result.reason);
      replaceRow(row.url, {
        status: result.incomplete ? "unresolved" : "policy_skipped",
        reason: result.reason
      });
      continue;
    }
    succeeded += 1;
    pages.push(result.page);
    chunks.push(...result.chunks);
    sources.push(result.source);
    warnings.push(...result.warnings);
    if (!result.complete) {
      incomplete = true;
      replaceRow(row.url, {
        status: "unresolved",
        canonicalUrl: result.page.canonicalUrl,
        reason: "document_limit_reached",
        contentHash: result.page.contentHash,
        fetchedAt: result.page.fetchedAt
      });
      continue;
    }
    replaceRow(row.url, {
      status: "fetched",
      canonicalUrl: result.page.canonicalUrl,
      reason: void 0,
      contentHash: result.page.contentHash,
      fetchedAt: result.page.fetchedAt
    });
  }
  const requestedState = incomplete ? "PARTIAL" : manifest.state === "COMPLETE" ? "COMPLETE" : manifest.state;
  return {
    manifest: buildCrawlManifest({
      crawlId: manifest.crawlId,
      origin: manifest.origin,
      requestedState,
      urls: rows
    }),
    pages,
    chunks,
    sources,
    attempted,
    succeeded,
    warnings: [...new Set(warnings)],
    incomplete
  };
}

// packages/onboarding-ingest/src/scanner-v2-renderer.ts
var DEFAULT_RENDER_MAX_DOM_BYTES = 512 * 1024;
var MAX_RENDER_DOM_BYTES = 1024 * 1024;
var DEFAULT_RENDER_MAX_TOTAL_BYTES = 4 * 1024 * 1024;
var MAX_RENDER_TOTAL_BYTES = 8 * 1024 * 1024;
var DEFAULT_RENDER_MAX_RESOURCE_BYTES = 1024 * 1024;
function visibleText(html) {
  return html.replace(/<!--([\s\S]*?)-->/g, " ").replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ").replace(/<template\b[\s\S]*?<\/template>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}
function decideScannerV2RenderEscalation(input) {
  const text = visibleText(input.rawHtml);
  const scripts = [...input.rawHtml.matchAll(/<script\b[^>]*>/gi)].length;
  const meaningfulBlocks = [
    ...input.rawHtml.matchAll(
      /<(?:p|li|article|section|table|details|address)\b[^>]*>[\s\S]*?<\/(?:p|li|article|section|table|details|address)>/gi
    )
  ].filter((match) => visibleText(match[0]).length >= 40).length;
  const hasAppRoot = /<(?:div|main)\b[^>]*(?:id|data-app|data-reactroot)=["'][^"']*(?:root|app|application)[^"']*["'][^>]*>\s*<\/(?:div|main)>/i.test(
    input.rawHtml
  ) || /<div\b[^>]*id=["'](?:root|app|__next)["'][^>]*>\s*<\/div>/i.test(
    input.rawHtml
  );
  if (scripts > 0 && hasAppRoot && text.length < 400) {
    return { render: true, reason: "app_shell" };
  }
  if (scripts > 0 && text.length < 180 && meaningfulBlocks === 0) {
    return { render: true, reason: "thin_html" };
  }
  if (Number.isFinite(input.extractedVisibleTextChars) && input.extractedVisibleTextChars === 0 && scripts > 0) {
    return { render: true, reason: "extractor_empty" };
  }
  return { render: false, reason: "raw_html_sufficient" };
}

// packages/onboarding-ingest/src/scanner-v2-scan.ts
var V2_LIVE_MAX_HTML_PAGES = 250;
var V2_LIVE_MAX_DISCOVERED_URLS = 2500;
var V2_LIVE_MAX_SITEMAP_DOCUMENTS = 32;
var V2_SUMMARY_MAX_PAGES = 128;
var V2_SUMMARY_MAX_HTML_BYTES = 32 * 1024 * 1024;
var V2_RESPONSE_MAX_KNOWLEDGE_CHARS = 45e4;
var V2_RESPONSE_MAX_KNOWLEDGE_CHUNKS = 300;
function boundedInt3(value, fallback, minimum, maximum) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.trunc(value)));
}
function boundedKnowledge(chunks, maxChars, maxChunks) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  let chars = 0;
  for (const chunk of chunks) {
    if (out.length >= maxChunks || chars >= maxChars) break;
    if (seen.has(chunk.id)) continue;
    const remaining = maxChars - chars;
    if (remaining < 80) break;
    const text = chunk.text.trim().slice(0, remaining);
    if (!text) continue;
    seen.add(chunk.id);
    out.push({
      url: chunk.canonicalUrl,
      ...chunk.title ? { title: chunk.title } : {},
      headingPath: [...chunk.headingPath],
      text,
      contentHash: chunk.contentHash
    });
    chars += text.length;
  }
  return out;
}
async function recoverReaderPage(page, options) {
  const readerUrl = `${READER_FALLBACK_ORIGIN}/${page.requestedUrl}`;
  let lastReason = "reader_fetch_failed";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response2 = await fetchPublicHttps(readerUrl, {
      lookup: options.readerLookup,
      get: options.readerGet,
      timeoutMs: READER_FALLBACK_TIMEOUT_MS,
      maxBytes: READER_FALLBACK_MAX_BYTES,
      maxRedirects: 2,
      headers: {
        Accept: "text/html",
        "X-Respond-With": "html",
        "X-No-Cache": "true"
      }
    });
    if (response2.status >= 400) {
      lastReason = `reader_http_${response2.status}`;
      break;
    }
    if (!/<(?:html|head|body)\b/i.test(response2.body)) {
      lastReason = "reader_non_html";
      break;
    }
    if (isReaderChallengePage(response2.body)) {
      lastReason = "reader_challenge_rejected";
      if (attempt === 0) continue;
      break;
    }
    return {
      ...page,
      html: response2.body,
      fetchMode: "reader"
    };
  }
  throw new Error(lastReason);
}
async function runScannerV2Scan(rawUrl, options = {}) {
  const enabled = options.enabled ?? isWebIngestEnabled();
  const v2Enabled = options.scannerV2Enabled ?? isScannerV2Enabled();
  if (!enabled || !v2Enabled) {
    return {
      ok: false,
      error: "scan_disabled",
      message: "Scanner V2 is disabled. The Scanner V1 rollback path remains available.",
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
  const maxSummaryPages = boundedInt3(
    options.maxSummaryPages,
    V2_SUMMARY_MAX_PAGES,
    1,
    V2_SUMMARY_MAX_PAGES
  );
  const maxSummaryHtmlBytes = boundedInt3(
    options.maxSummaryHtmlBytes,
    V2_SUMMARY_MAX_HTML_BYTES,
    1024,
    V2_SUMMARY_MAX_HTML_BYTES
  );
  const maxKnowledgeChars = boundedInt3(
    options.maxKnowledgeChars,
    V2_RESPONSE_MAX_KNOWLEDGE_CHARS,
    1024,
    V2_RESPONSE_MAX_KNOWLEDGE_CHARS
  );
  const maxKnowledgeChunks = boundedInt3(
    options.maxKnowledgeChunks,
    V2_RESPONSE_MAX_KNOWLEDGE_CHUNKS,
    1,
    V2_RESPONSE_MAX_KNOWLEDGE_CHUNKS
  );
  const summaryPages = [];
  const corpusChunks = [];
  let summaryBytes = 0;
  let summaryTruncated = false;
  const adapterWarnings = [];
  const readerFallbackEnabled = options.readerFallback ?? (!options.lookup && !options.get);
  const consumePage = async (page) => {
    let sourcePage = page;
    const renderDecision = decideScannerV2RenderEscalation({
      rawHtml: page.html
    });
    if (renderDecision.render) {
      if (!readerFallbackEnabled) {
        adapterWarnings.push("scanner_v2_render_required");
        throw new Error("scanner_v2_render_required");
      }
      try {
        sourcePage = await recoverReaderPage(page, options);
        adapterWarnings.push("reader_fallback_used");
      } catch (error) {
        adapterWarnings.push(
          error instanceof Error && error.message ? error.message : "reader_fetch_failed"
        );
        throw error;
      }
    }
    const extracted2 = extractScannerV2Page(sourcePage);
    corpusChunks.push(...extracted2.chunks);
    const bytes = Buffer.byteLength(sourcePage.html, "utf8");
    if (summaryPages.length < maxSummaryPages && summaryBytes + bytes <= maxSummaryHtmlBytes) {
      summaryPages.push({
        url: sourcePage.canonicalUrl ?? sourcePage.requestedUrl,
        html: sourcePage.html
      });
      summaryBytes += bytes;
    } else {
      summaryTruncated = true;
    }
  };
  const discovery = await discoverScannerV2Frontier(allow.url.toString(), {
    ...options,
    maxHtmlPages: Math.min(
      options.maxHtmlPages ?? V2_LIVE_MAX_HTML_PAGES,
      V2_LIVE_MAX_HTML_PAGES
    ),
    maxDiscoveredUrls: Math.min(
      options.maxDiscoveredUrls ?? V2_LIVE_MAX_DISCOVERED_URLS,
      V2_LIVE_MAX_DISCOVERED_URLS
    ),
    maxSitemapDocuments: Math.min(
      options.maxSitemapDocuments ?? V2_LIVE_MAX_SITEMAP_DOCUMENTS,
      V2_LIVE_MAX_SITEMAP_DOCUMENTS
    ),
    onHtmlPage: consumePage
  });
  const documents = await ingestScannerV2ManifestDocuments(
    discovery.manifest,
    options.documentOptions ?? {}
  );
  corpusChunks.push(...documents.chunks);
  const extracted = extractDraftFromHtml(summaryPages);
  const warnings = [
    ...adapterWarnings,
    ...discovery.warnings,
    ...documents.warnings,
    ...extracted.warnings
  ];
  const partial = discovery.incomplete || documents.incomplete;
  if (partial) warnings.push("scanner_v2_partial");
  if (summaryTruncated) warnings.push("scanner_v2_summary_truncated");
  const knowledge = boundedKnowledge(
    corpusChunks,
    maxKnowledgeChars,
    maxKnowledgeChunks
  );
  if (knowledge.length < corpusChunks.length) {
    warnings.push("scanner_v2_response_knowledge_truncated");
  }
  const facts = {
    ...extracted.facts,
    website: extracted.facts.website ?? allow.url.toString()
  };
  const factMeta = {
    ...extracted.factMeta,
    website: extracted.factMeta.website ?? { confidence: "high", source: "fetched_url" }
  };
  const scannerV2 = {
    state: partial ? "PARTIAL" : "COMPLETE",
    discovered: documents.manifest.discovered,
    fetched: documents.manifest.fetched,
    unresolved: documents.manifest.unresolved,
    knowledgeChunks: knowledge.length
  };
  if (summaryPages.length === 0 && knowledge.length === 0 && Object.keys(extracted.draft).length === 0) {
    return {
      ok: false,
      error: "fetch_failed",
      message: "No usable public website content could be indexed. No crawl results were invented.",
      warnings: [...new Set(warnings.length ? warnings : ["no_pages_fetched"])]
    };
  }
  return {
    ok: true,
    untrusted: true,
    draft: extracted.draft,
    warnings: [...new Set(warnings)],
    sources: [
      ...discovery.pageSources,
      ...documents.sources.map((source) => ({
        url: source.url,
        status: source.status,
        bytes: source.bytes
      }))
    ],
    ...Object.keys(facts).length ? { facts } : {},
    ...Object.keys(factMeta).length ? { factMeta } : {},
    ...Object.keys(extracted.fieldMeta).length ? { fieldMeta: extracted.fieldMeta } : {},
    ...knowledge.length ? { knowledge } : {},
    scannerV2
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
    const result = isScannerV2Enabled() ? await runScannerV2Scan(url, {
      enabled: true,
      scannerV2Enabled: true
    }) : await runScan(url, { enabled: true });
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
