import assert from "node:assert/strict";
import test from "node:test";
import { buildScannerV2Corpus } from "./scanner-v2-content.ts";
import {
  DEFAULT_SEARCH_LIMIT,
  InMemoryBm25CorpusIndex,
  MAX_SEARCH_LIMIT,
} from "./scanner-v2-retrieval.ts";
import type { CorpusChunk } from "./types.ts";

function chunk(input: {
  id: string;
  url: string;
  title?: string;
  headings?: string[];
  text: string;
  ordinal?: number;
}): CorpusChunk {
  return {
    id: input.id,
    canonicalUrl: input.url,
    ...(input.title ? { title: input.title } : {}),
    headingPath: input.headings ?? [],
    text: input.text,
    ordinal: input.ordinal ?? 0,
    contentHash: "hash-" + input.id,
  };
}

test("Stage 5 retrieves exact deep-page facts with source trace", async () => {
  const corpus = buildScannerV2Corpus([
    {
      requestedUrl: "https://acme.example/",
      html: "<html><head><title>Acme Heating</title></head><body><h1>Welcome</h1><p>Heating services across Wirral.</p></body></html>",
      fetchedAt: "2026-10-02T16:00:00.000Z",
    },
    {
      requestedUrl: "https://acme.example/installation",
      html: "<html><head><title>Installation Guide</title></head><body><h1>Installation lead time</h1><p>New boiler installations normally take six weeks from confirmed survey.</p></body></html>",
      fetchedAt: "2026-10-02T16:00:00.000Z",
    },
    {
      requestedUrl: "https://acme.example/returns",
      html: "<html><head><title>Returns</title></head><body><h1>Returns policy</h1><p>Unused parts can be returned within 30 days with proof of purchase.</p></body></html>",
      fetchedAt: "2026-10-02T16:00:00.000Z",
    },
  ]);

  const index = new InMemoryBm25CorpusIndex();
  await index.index("crawl-1", corpus.chunks);

  const hits = await index.search(
    "crawl-1",
    "What is the installation lead time?",
    3,
  );
  assert.ok(hits.length > 0);
  assert.equal(hits[0]?.canonicalUrl, "https://acme.example/installation");
  assert.match(hits[0]?.text ?? "", /six weeks/i);
  assert.ok(hits[0]?.chunkId);
  assert.ok((hits[0]?.score ?? 0) > 0);
  assert.ok((hits[0]?.matchedTerms.length ?? 0) > 0);
});

test("Stage 5 deterministic synonym normalization covers bounded paraphrases", async () => {
  const index = new InMemoryBm25CorpusIndex();
  await index.index("crawl-2", [
    chunk({
      id: "returns",
      url: "https://acme.example/returns",
      title: "Returns policy",
      headings: ["Returns"],
      text: "Unused goods may be returned within 30 days.",
    }),
    chunk({
      id: "delivery",
      url: "https://acme.example/delivery",
      title: "Delivery information",
      headings: ["Delivery areas"],
      text: "We deliver throughout Wirral and Liverpool.",
    }),
    chunk({
      id: "price",
      url: "https://acme.example/pricing",
      title: "Pricing",
      headings: ["Call-out fee"],
      text: "The published call-out fee is £95.",
    }),
  ]);

  const refund = await index.search("crawl-2", "Can I get a refund?");
  assert.equal(refund[0]?.chunkId, "returns");

  const shipping = await index.search("crawl-2", "Which areas do you ship to?");
  assert.equal(shipping[0]?.chunkId, "delivery");

  const cost = await index.search("crawl-2", "How much does the call-out cost?");
  assert.equal(cost[0]?.chunkId, "price");

  const pricing = await index.search("crawl-2", "Show me the pricing");
  assert.equal(pricing[0]?.chunkId, "price");
});

test("title and heading matches outrank body-only matches", async () => {
  const index = new InMemoryBm25CorpusIndex();
  await index.index("crawl-3", [
    chunk({
      id: "heading",
      url: "https://acme.example/keys",
      title: "Replacement Keys",
      headings: ["Replacement alley gate keys"],
      text: "Order online using the key order page.",
    }),
    chunk({
      id: "body",
      url: "https://acme.example/news",
      title: "Company News",
      headings: ["Latest update"],
      text: "A long article mentioning replacement alley gate keys in passing.",
    }),
  ]);

  const hits = await index.search("crawl-3", "replacement alley gate keys", 2);
  assert.deepEqual(hits.map((hit) => hit.chunkId), ["heading", "body"]);
  assert.ok((hits[0]?.score ?? 0) > (hits[1]?.score ?? 0));
});

test("exact identifiers are preserved and strongly retrieve the source chunk", async () => {
  const index = new InMemoryBm25CorpusIndex();
  await index.index("crawl-4", [
    chunk({
      id: "contact",
      url: "https://acme.example/contact",
      title: "Contact",
      text: "Call 0151 487 0570 or email help-desk@acme.example. Office postcode CH45 3LR.",
    }),
    chunk({
      id: "other",
      url: "https://acme.example/about",
      title: "About",
      text: "Our office team can help with general enquiries.",
    }),
  ]);

  for (const query of [
    "0151 487 0570",
    "help-desk@acme.example",
    "CH45 3LR",
  ]) {
    const hits = await index.search("crawl-4", query);
    assert.equal(hits[0]?.chunkId, "contact", query);
    assert.ok((hits[0]?.matchedIdentifiers.length ?? 0) >= 1, query);
  }
});

test("unsupported queries return no invented result", async () => {
  const index = new InMemoryBm25CorpusIndex();
  await index.index("crawl-5", [
    chunk({
      id: "hours",
      url: "https://acme.example/hours",
      title: "Opening Hours",
      text: "Monday to Friday 9am to 5pm.",
    }),
  ]);

  assert.deepEqual(
    await index.search("crawl-5", "Do you repair spacecraft engines?"),
    [],
  );
  assert.deepEqual(await index.search("crawl-5", "what do you do"), []);
});

test("re-indexing one crawl replaces stale chunks instead of accumulating them", async () => {
  const index = new InMemoryBm25CorpusIndex();
  await index.index("crawl-6", [
    chunk({
      id: "old",
      url: "https://acme.example/service",
      text: "Old service description about boilers.",
    }),
  ]);
  assert.equal((await index.search("crawl-6", "boilers"))[0]?.chunkId, "old");

  await index.index("crawl-6", [
    chunk({
      id: "new",
      url: "https://acme.example/service",
      text: "New service description about heat pumps.",
    }),
  ]);
  assert.deepEqual(await index.search("crawl-6", "boilers"), []);
  assert.equal((await index.search("crawl-6", "heat pumps"))[0]?.chunkId, "new");
});

test("search ordering is deterministic for equal scores", async () => {
  const index = new InMemoryBm25CorpusIndex();
  await index.index("crawl-7", [
    chunk({
      id: "z",
      url: "https://acme.example/z",
      text: "boiler service",
      ordinal: 0,
    }),
    chunk({
      id: "a2",
      url: "https://acme.example/a",
      text: "boiler service",
      ordinal: 2,
    }),
    chunk({
      id: "a1",
      url: "https://acme.example/a",
      text: "boiler service",
      ordinal: 1,
    }),
  ]);

  const first = await index.search("crawl-7", "boiler service", 10);
  const second = await index.search("crawl-7", "boiler service", 10);
  assert.deepEqual(
    first.map((hit) => hit.chunkId),
    ["a1", "a2", "z"],
  );
  assert.deepEqual(second, first);
});

test("search limits are bounded and index stats aid debugging without exposing hidden state", async () => {
  const index = new InMemoryBm25CorpusIndex();
  const chunks = Array.from({ length: MAX_SEARCH_LIMIT + 10 }, (_, i) =>
    chunk({
      id: "c-" + i,
      url: "https://acme.example/p-" + String(i).padStart(3, "0"),
      text: "boiler servicing entry " + i,
    }),
  );
  await index.index("crawl-8", chunks);

  assert.equal(
    (await index.search("crawl-8", "boiler", 999_999)).length,
    MAX_SEARCH_LIMIT,
  );
  assert.equal(
    (await index.search("crawl-8", "boiler")).length,
    DEFAULT_SEARCH_LIMIT,
  );

  const stats = await index.stats("crawl-8");
  assert.equal(stats.crawlId, "crawl-8");
  assert.equal(stats.documentCount, chunks.length);
  assert.ok(stats.uniqueTermCount > 0);
  assert.ok(stats.averageDocumentLength > 0);

  await index.clear("crawl-8");
  assert.equal((await index.stats("crawl-8")).documentCount, 0);
  assert.deepEqual(await index.search("crawl-8", "boiler"), []);
});
