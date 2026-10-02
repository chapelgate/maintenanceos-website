import assert from "node:assert/strict";
import test from "node:test";
import {
  buildScannerV2Corpus,
  DEFAULT_MAX_CHUNK_CHARS,
  extractScannerV2Page,
} from "./scanner-v2-content.ts";

const PAGE = `<!doctype html>
<html>
<head>
  <title>Acme Heating — Boiler Services</title>
  <script>window.secret = "SCRIPT SHOULD NEVER ENTER CORPUS";</script>
  <style>.hidden{content:"STYLE SHOULD NEVER ENTER CORPUS"}</style>
  <noscript>NOSCRIPT SHOULD NEVER ENTER CORPUS</noscript>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"LocalBusiness","name":"Acme Heating","openingHours":"Mo-Fr 08:00-17:00","makesOffer":[{"itemOffered":{"name":"Boiler servicing"}}]}
  </script>
</head>
<body>
<header><a href="/">Acme Heating</a><a href="/contact">Contact</a></header>
<nav><a href="/services">Services</a><a href="/pricing">Pricing</a></nav>
<main>
  <h1>Boiler Services</h1>
  <p>We service and repair domestic boilers across Wirral.</p>
  <h2>Annual servicing</h2>
  <p>An annual boiler service includes a combustion check and a safety inspection.</p>
  <ul>
    <li>Gas boiler servicing</li>
    <li>Boiler fault diagnosis</li>
  </ul>
  <h2>Prices</h2>
  <table>
    <tr><th>Service</th><th>Price</th></tr>
    <tr><td>Annual service</td><td>£95</td></tr>
  </table>
  <h2>Coverage</h2>
  <dl>
    <dt>Wirral</dt><dd>All CH postcodes and selected L postcodes.</dd>
  </dl>
  <h2>Questions</h2>
  <details>
    <summary>Do you repair combi boilers?</summary>
    <p>Yes. Combi boiler repair is available Monday to Friday.</p>
  </details>
  <figure>
    <img src="/van.jpg" alt="Acme Heating engineer van">
    <figcaption>Our mobile engineer vehicle</figcaption>
  </figure>
  <div>Emergency call-outs are assessed individually and are not guaranteed.</div>
</main>
<footer>Acme Heating Ltd · 0151 555 0100 · Privacy · Terms</footer>
</body>
</html>`;

test("Stage 4 extracts full visible business content and excludes executable/non-visible markup", () => {
  const result = extractScannerV2Page({
    requestedUrl: "https://acme.example/services",
    html: PAGE,
    fetchedAt: "2026-10-02T15:00:00.000Z",
    headers: {
      etag: '"abc123"',
      "last-modified": "Thu, 01 Oct 2026 12:00:00 GMT",
    },
  });

  assert.equal(result.page.title, "Acme Heating — Boiler Services");
  assert.deepEqual(result.page.headings, [
    "Boiler Services",
    "Annual servicing",
    "Prices",
    "Coverage",
    "Questions",
  ]);

  for (const text of [
    "We service and repair domestic boilers across Wirral.",
    "An annual boiler service includes a combustion check and a safety inspection.",
    "Gas boiler servicing",
    "Annual service",
    "£95",
    "All CH postcodes and selected L postcodes.",
    "Do you repair combi boilers?",
    "Combi boiler repair is available Monday to Friday.",
    "Our mobile engineer vehicle",
    "Acme Heating engineer van",
    "Emergency call-outs are assessed individually and are not guaranteed.",
  ]) {
    assert.ok(result.page.visibleText.includes(text), text);
  }

  assert.doesNotMatch(result.page.visibleText, /SCRIPT SHOULD NEVER ENTER CORPUS/);
  assert.doesNotMatch(result.page.visibleText, /STYLE SHOULD NEVER ENTER CORPUS/);
  assert.doesNotMatch(result.page.visibleText, /NOSCRIPT SHOULD NEVER ENTER CORPUS/);

  assert.equal(result.page.etag, '"abc123"');
  assert.equal(
    result.page.lastModified,
    "Thu, 01 Oct 2026 12:00:00 GMT",
  );
  assert.equal(result.page.fetchMode, "http");
  assert.ok(result.page.contentHash.length >= 64);

  const facts = result.page.structuredFacts;
  assert.equal(facts.businessName, "Acme Heating");
  assert.equal(facts.hours, "Mo-Fr 08:00-17:00");
  assert.deepEqual(facts.services, ["Boiler servicing"]);
});

test("Stage 4 keeps structural provenance: service description, table rows, definitions and FAQs are atomic", () => {
  const result = extractScannerV2Page({
    requestedUrl: "https://acme.example/services",
    html: PAGE,
    fetchedAt: "2026-10-02T15:00:00.000Z",
  });

  const annual = result.chunks.find((chunk) =>
    chunk.text.includes("An annual boiler service includes"),
  );
  assert.ok(annual);
  assert.deepEqual(annual.headingPath, ["Boiler Services", "Annual servicing"]);

  const price = result.chunks.find((chunk) =>
    chunk.text.includes("Annual service | £95"),
  );
  assert.ok(price);
  assert.deepEqual(price.headingPath, ["Boiler Services", "Prices"]);

  const definition = result.chunks.find((chunk) =>
    chunk.text.includes("Wirral: All CH postcodes"),
  );
  assert.ok(definition);
  assert.deepEqual(definition.headingPath, ["Boiler Services", "Coverage"]);

  const faq = result.chunks.find((chunk) =>
    chunk.text.includes("Q: Do you repair combi boilers?"),
  );
  assert.ok(faq);
  assert.match(faq.text, /A: Yes\. Combi boiler repair is available Monday to Friday\./);
  assert.deepEqual(faq.headingPath, ["Boiler Services", "Questions"]);

  const figure = result.chunks.find((chunk) =>
    chunk.text.includes("Our mobile engineer vehicle"),
  );
  assert.ok(figure);
  assert.match(figure.text, /Acme Heating engineer van/);
});

test("Stage 4 captures meaningful div-heavy residual text that semantic tags miss", () => {
  const html = `<html><head><title>Div App</title></head><body>
    <div id="root">
      <div class="hero">Same-day LPG bottle delivery is available in selected Liverpool postcodes.</div>
      <div class="note">Orders placed after 3pm are delivered the next working day.</div>
    </div>
  </body></html>`;

  const result = extractScannerV2Page({
    requestedUrl: "https://div.example/",
    html,
    fetchedAt: "2026-10-02T15:00:00.000Z",
  });

  assert.match(result.page.visibleText, /Same-day LPG bottle delivery/);
  assert.match(result.page.visibleText, /Orders placed after 3pm/);
  assert.ok(
    result.chunks.some((chunk) =>
      chunk.text.includes("Same-day LPG bottle delivery"),
    ),
  );
});

test("Stage 4 retains repeated navigation/footer once in the corpus, not once per page", () => {
  const shell = (title: string, body: string) => `<html><head><title>${title}</title></head>
  <body>
    <header>Acme Heating · Call 0151 555 0100</header>
    <nav>Home · Services · Contact</nav>
    <main><h1>${title}</h1><p>${body}</p></main>
    <footer>Acme Heating Ltd · Privacy · Terms</footer>
  </body></html>`;

  const corpus = buildScannerV2Corpus([
    {
      requestedUrl: "https://acme.example/services",
      html: shell("Services", "Boiler servicing and repairs."),
      fetchedAt: "2026-10-02T15:00:00.000Z",
    },
    {
      requestedUrl: "https://acme.example/contact",
      html: shell("Contact", "Email help@acme.example for assistance."),
      fetchedAt: "2026-10-02T15:00:01.000Z",
    },
  ]);

  assert.equal(corpus.pages.length, 2);
  const navChunks = corpus.chunks.filter((chunk) =>
    chunk.headingPath.includes("Site-wide navigation"),
  );
  const headerChunks = corpus.chunks.filter((chunk) =>
    chunk.headingPath.includes("Site-wide header"),
  );
  const footerChunks = corpus.chunks.filter((chunk) =>
    chunk.headingPath.includes("Site-wide footer"),
  );
  assert.equal(navChunks.length, 1);
  assert.equal(headerChunks.length, 1);
  assert.equal(footerChunks.length, 1);

  assert.equal(
    corpus.chunks.filter((chunk) => chunk.text.includes("Boiler servicing and repairs.")).length,
    1,
  );
  assert.equal(
    corpus.chunks.filter((chunk) => chunk.text.includes("help@acme.example")).length,
    1,
  );
});

test("Stage 4 chunk IDs and content hashes are stable across identical recrawls", () => {
  const input = {
    requestedUrl: "https://acme.example/services",
    html: PAGE,
    fetchedAt: "2026-10-02T15:00:00.000Z",
  };
  const first = extractScannerV2Page(input);
  const second = extractScannerV2Page(input);

  assert.equal(first.page.contentHash, second.page.contentHash);
  assert.deepEqual(
    first.chunks.map((chunk) => ({
      id: chunk.id,
      contentHash: chunk.contentHash,
      text: chunk.text,
    })),
    second.chunks.map((chunk) => ({
      id: chunk.id,
      contentHash: chunk.contentHash,
      text: chunk.text,
    })),
  );
});

test("Stage 4 bounds long chunks and carries overlap without losing tail facts", () => {
  const long = Array.from(
    { length: 90 },
    (_, index) =>
      `Sentence ${index + 1} explains a detailed service condition that the receptionist must retain.`,
  ).join(" ");
  const html = `<html><body><h1>Detailed Conditions</h1><p>${long}</p></body></html>`;
  const result = extractScannerV2Page({
    requestedUrl: "https://acme.example/conditions",
    html,
    fetchedAt: "2026-10-02T15:00:00.000Z",
  });

  assert.ok(result.chunks.length > 1);
  assert.ok(
    result.chunks.every(
      (chunk) => chunk.text.length <= DEFAULT_MAX_CHUNK_CHARS,
    ),
  );
  assert.ok(
    result.chunks.some((chunk) =>
      chunk.text.includes("Sentence 90 explains a detailed service condition"),
    ),
  );
  assert.ok(
    result.chunks.every((chunk) =>
      chunk.headingPath.includes("Detailed Conditions"),
    ),
  );
});

test("Stage 4 preserves explicit source URL and discovery provenance", () => {
  const result = extractScannerV2Page({
    requestedUrl: "https://acme.example/services?utm_source=old",
    canonicalUrl: "https://acme.example/services",
    discoveredFrom: "https://acme.example/sitemap.xml",
    html: "<html><body><h1>Services</h1><p>Heat pump maintenance.</p></body></html>",
    fetchedAt: "2026-10-02T15:00:00.000Z",
  });

  assert.equal(
    result.page.requestedUrl,
    "https://acme.example/services?utm_source=old",
  );
  assert.equal(result.page.canonicalUrl, "https://acme.example/services");
  assert.equal(
    result.page.discoveredFrom,
    "https://acme.example/sitemap.xml",
  );
  assert.ok(
    result.chunks.every(
      (chunk) => chunk.canonicalUrl === "https://acme.example/services",
    ),
  );
});
