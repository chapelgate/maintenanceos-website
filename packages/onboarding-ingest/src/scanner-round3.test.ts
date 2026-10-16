import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  addressAroundPostcode,
  extractDraftFromHtml,
  isUkPlaceName,
  normalizeUkPhone,
  publicBusinessName,
} from "./extract.ts";
import { registrableDomain, sameRegistrableSite } from "./ssrf.ts";

const fixture = (name: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "fixtures", name), "utf8");

test("http upgrades to https and www stays on the same registrable site", () => {
  assert.equal(registrableDomain("www.harrisheating.co.uk"), "harrisheating.co.uk");
  assert.equal(registrableDomain("salsbarbers.co.uk"), "salsbarbers.co.uk");
  assert.equal(
    sameRegistrableSite(new URL("https://harrisheating.co.uk/"), new URL("https://www.harrisheating.co.uk/")),
    true,
  );
  assert.equal(
    sameRegistrableSite(new URL("https://www.salsbarbers.co.uk/"), new URL("https://salsbarbers.co.uk/")),
    true,
  );
  assert.equal(
    sameRegistrableSite(new URL("https://wirralvet.co.uk/"), new URL("https://ivc.co.uk/")),
    false,
  );
});

test("addresses anchor on the postcode and drop phone, email, and label prefixes", () => {
  const result = extractDraftFromHtml([
    { url: "https://sirthomas.example/", html: fixture("address-junk.html") },
  ]);
  assert.equal(result.facts.address, "5 Sir Thomas St, Liverpool, L1 6BW");
  assert.doesNotMatch(result.facts.address ?? "", /FIND US|CONTACT INFO|OPENING HOURS|hello@|0151/i);
  assert.equal(
    addressAroundPostcode("Available 24/7, kitchen is open, 1 High Street, York, YO1 7HH"),
    "1 High Street, York, YO1 7HH",
  );
  assert.equal(
    addressAroundPostcode(
      "Dunlop Tyres, Michelin Tyres, Talk to us, 1 Mosedale Road Croft Business Park Bromborough Wirral, CH62 3QZ",
    ),
    "1 Mosedale Road, Croft Business Park, Bromborough, CH62 3QZ",
  );
  assert.equal(
    addressAroundPostcode("FIND US, 5 Sir Thomas St, Liverpool, L1 6BW"),
    "5 Sir Thomas St, Liverpool, L1 6BW",
  );
  assert.equal(
    addressAroundPostcode("Address: 19 Hamilton Square, Birkenhead, CH41 6AY"),
    "19 Hamilton Square, Birkenhead, CH41 6AY",
  );
  assert.equal(
    addressAroundPostcode("Cancellation Policy, 10 King Street, Manchester, M2 4WU"),
    "10 King Street, Manchester, M2 4WU",
  );
});

test("UK phones are E.164 and glued or +0 forms are rejected", () => {
  assert.equal(normalizeUkPhone("0151 526 1117"), "+441515261117");
  assert.equal(normalizeUkPhone("+44 151 526 1117"), "+441515261117");
  assert.equal(normalizeUkPhone("0151 526 1117 228"), undefined);
  assert.equal(normalizeUkPhone("+0161 773 5133"), undefined);
  assert.equal(normalizeUkPhone("0161 773 5133"), "+441617735133");
  const result = extractDraftFromHtml([
    {
      url: "https://phones.example/contact",
      html: "<p><a href=\"tel:01515261117228\">0151 526 1117 228</a> <a href=\"tel:+01617735133\">+0161 773 5133</a> <a href=\"tel:01617735133\">0161 773 5133</a></p>",
    },
  ]);
  assert.deepEqual(result.facts.contact?.phones, ["+441617735133"]);
});

test("a parent press mailbox loses to the site's own contact address", () => {
  const result = extractDraftFromHtml([
    {
      url: "https://wirralvet.co.uk/contact",
      html: `<a href="mailto:press@linnaeusgroup.co.uk">press</a><a href="mailto:hello@wirralvet.co.uk">hello</a>`,
    },
  ]);
  assert.deepEqual(result.facts.contact?.emails, ["hello@wirralvet.co.uk"]);
});

test("visible opening hours beat disagreeing structured data and kitchen hours are ignored", () => {
  const ideal = extractDraftFromHtml([
    {
      url: "https://idealelectrical.example/",
      html: `<script type="application/ld+json">{"@type":"Electrician","name":"Ideal Electrical","openingHours":"Mo-Su 00:00-23:59"}</script><h2>Opening hours</h2><p>Monday to Friday 8:00am – 5:00pm</p>`,
    },
  ]);
  assert.match(ideal.facts.hours ?? "", /Monday to Friday/i);
  assert.doesNotMatch(ideal.facts.hours ?? "", /00:00|24/);
  const kitchen = extractDraftFromHtml([
    {
      url: "https://urbanangel.example/",
      html: "<p>The kitchen is open Monday to Friday 12:00-15:00</p><h1>Urban Angel Cafe</h1>",
    },
  ]);
  assert.equal(kitchen.facts.hours, undefined);
});

test("services, places, and FAQs stay inside real sections", () => {
  const noisy = extractDraftFromHtml([
    {
      url: "https://noisy.example/",
      html: `<nav><a href="/prices">Prices</a><a href="/vouchers">Vouchers</a><a href="/old">Home old</a><a href="https://facebook.com">Facebook</a></nav>
        <h2>Areas we cover</h2><ul><li>Privacy Statement</li><li>Sep 2024</li><li>Birkenhead</li></ul>
        <h2>Privacy</h2><details><summary>How are complaints handled?</summary><p>Suggested text: read the privacy policy complaints procedure.</p></details>
        <h2>FAQ</h2><h3>What time do you open?</h3><p>Do you take cards?</p><h3>Do you take cards?</h3><p>Yes, all major cards are accepted.</p><h3>Where do you work?</h3><p>Across Birkenhead and the Wirral.</p>`,
    },
  ]);
  assert.equal(noisy.facts.services, undefined);
  assert.deepEqual(noisy.facts.locations, ["Birkenhead"]);
  const faqBlob = JSON.stringify(noisy.facts.faqs ?? []);
  assert.equal(noisy.draft.faqs, undefined);
  assert.doesNotMatch(faqBlob, /Suggested text|privacy policy|What time do you open|Do you take cards/i);
  assert.equal(isUkPlaceName("Privacy Statement"), false);
  assert.equal(isUkPlaceName("Sep 2024"), false);
  assert.equal(isUkPlaceName("Birkenhead"), true);
});

test("names prefer a real brand over a slug or a one-word fragment", () => {
  assert.equal(publicBusinessName("File Not Found"), undefined);
  const slug = extractDraftFromHtml([
    {
      url: "https://kbjoineryservices.co.uk/",
      html: `<title>kbjoineryservices</title><meta property="og:site_name" content="KB Joinery Services" />`,
    },
  ]);
  assert.equal(slug.facts.businessName, "KB Joinery Services");
  const fragment = extractDraftFromHtml([
    {
      url: "https://adams.example/",
      html: `<title>Adam</title><h1>Adam's Barbers</h1><footer>© 2024 Adam's Barbers</footer>`,
    },
  ]);
  assert.equal(fragment.facts.businessName, "Adam's Barbers");
  const acronym = extractDraftFromHtml([
    { url: "https://lmh.example/", html: "<title>LMH</title><h1>LMH</h1>" },
  ]);
  assert.equal(acronym.facts.businessName, undefined);
});

test("multi-branch pages return each location", () => {
  const result = extractDraftFromHtml([
    {
      url: "https://branches.example/",
      html: `<script type="application/ld+json">{"@graph":[
        {"@type":"LocalBusiness","name":"North","telephone":"0151 111 1111","address":{"streetAddress":"1 North Road","addressLocality":"Birkenhead","postalCode":"CH41 1AA"},"openingHours":"Mo-Fr 09:00-17:00"},
        {"@type":"LocalBusiness","name":"South","telephone":"0151 222 2222","address":{"streetAddress":"2 South Road","addressLocality":"Bromborough","postalCode":"CH62 2BB"},"openingHours":"Mo-Fr 10:00-16:00"}
      ]}</script>`,
    },
  ]);
  assert.equal(result.facts.branches?.length, 2);
  assert.match(JSON.stringify(result.facts.branches), /CH41 1AA/);
  assert.match(JSON.stringify(result.facts.branches), /CH62 2BB/);
  assert.match(JSON.stringify(result.facts.branches), /\+441511111111/);
});

test("split price and hour cells on a barber page are readable", () => {
  const result = extractDraftFromHtml([
    { url: "https://northernbarbers.example/contact", html: fixture("northern-barbers.html") },
  ]);
  assert.equal(result.facts.businessName, "Northern Barbers");
  assert.match(result.facts.hours ?? "", /8\.30/);
  assert.match(result.facts.hours ?? "", /5\.30/);
  assert.match(result.facts.address ?? "", /12 Market Street/);
  assert.match(result.facts.address ?? "", /CH41 2AB/);
  assert.deepEqual(result.facts.contact?.phones, ["+441516478890"]);
  assert.ok(result.facts.pricing?.some((line) => /Cut/.test(line) && /£18/.test(line)));
});
