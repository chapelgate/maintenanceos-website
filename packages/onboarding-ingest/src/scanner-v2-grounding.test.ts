import assert from "node:assert/strict";
import test from "node:test";
import { buildScannerV2Corpus } from "./scanner-v2-content.ts";
import { InMemoryBm25CorpusIndex } from "./scanner-v2-retrieval.ts";
import {
  answerGroundedReceptionistQuestion,
  verifyGroundedSynthesis,
  type GroundedEvidence,
  type ReceptionistGroundingFacts,
} from "./scanner-v2-grounding.ts";

const FETCHED_AT = "2026-10-02T17:00:00.000Z";

function htmlPage(url: string, title: string, heading: string, body: string) {
  return {
    requestedUrl: url,
    html:
      "<html><head><title>" +
      title +
      "</title></head><body><main><h1>" +
      heading +
      "</h1><p>" +
      body +
      "</p></main></body></html>",
    fetchedAt: FETCHED_AT,
  };
}

async function fixture() {
  const corpus = buildScannerV2Corpus([
    htmlPage(
      "https://acme.example/",
      "Acme Property Services",
      "Welcome",
      "Acme Property Services provides maintenance and installation services.",
    ),
    htmlPage(
      "https://acme.example/installation",
      "Installation",
      "Installation lead time",
      "New gate installations normally take six weeks from the confirmed survey.",
    ),
    htmlPage(
      "https://acme.example/eligibility",
      "Eligibility",
      "Who can use the service",
      "The supported installation scheme is available to housing associations and local authorities.",
    ),
    htmlPage(
      "https://acme.example/delivery",
      "Delivery",
      "Delivery area",
      "Replacement parts are delivered throughout Wirral and Liverpool.",
    ),
    htmlPage(
      "https://acme.example/returns",
      "Returns",
      "Returns policy",
      "Unused parts can be returned within 30 days when proof of purchase is provided.",
    ),
    htmlPage(
      "https://acme.example/pricing",
      "Published pricing",
      "Call-out fee",
      "The published standard call-out fee is £95 including VAT.",
    ),
    htmlPage(
      "https://acme.example/contact/jobs",
      "Job reporting",
      "How to report a repair",
      "Repair requests should be submitted through the online repair form.",
    ),
    htmlPage(
      "https://acme.example/christmas-hours",
      "Christmas hours",
      "Christmas opening hours",
      "The office closes at 1pm on Christmas Eve and reopens on 2 January.",
    ),
    htmlPage(
      "https://acme.example/keys",
      "Replacement keys",
      "How to order replacement keys",
      "Replacement keys must be ordered through the website key-order page.",
    ),
    htmlPage(
      "https://acme.example/warranty",
      "Warranty",
      "Installation warranty",
      "New installations include a 12 month workmanship warranty.",
    ),
    htmlPage(
      "https://acme.example/cancellations",
      "Cancellations",
      "Survey cancellation",
      "Survey appointments can be cancelled without charge up to 24 hours before the visit.",
    ),
    htmlPage(
      "https://acme.example/parking",
      "Parking",
      "Engineer parking",
      "Customers should provide legal parking access for the engineer where possible.",
    ),
  ]);

  const index = new InMemoryBm25CorpusIndex();
  await index.index("crawl-stage6", corpus.chunks);

  const facts: ReceptionistGroundingFacts = {
    businessName: {
      value: "Acme Property Services",
      sourceUrls: ["https://acme.example/"],
    },
    hours: {
      value: "Monday to Friday, 9am to 5pm",
      sourceUrls: ["https://acme.example/contact"],
    },
    services: {
      value: ["Gate installation", "Repairs", "Replacement keys"],
      sourceUrls: ["https://acme.example/services"],
    },
    locations: {
      value: ["Wirral", "Liverpool"],
      sourceUrls: ["https://acme.example/contact"],
    },
    phones: {
      value: ["0151 555 0100"],
      sourceUrls: ["https://acme.example/contact"],
    },
    emails: {
      value: ["help@acme.example"],
      sourceUrls: ["https://acme.example/contact"],
    },
    faqs: [
      {
        question: "Do you charge for cancelled surveys?",
        answer: "Survey appointments can be cancelled without charge up to 24 hours before the visit.",
        sourceUrls: ["https://acme.example/cancellations"],
      },
    ],
  };

  return { index, facts };
}

test("Stage 6 exact structured intents win before corpus retrieval and retain source URLs", async () => {
  const { index, facts } = await fixture();

  const cases = [
    {
      q: "What are your opening hours?",
      source: "structured.hours",
      contains: "Monday to Friday, 9am to 5pm",
      url: "https://acme.example/contact",
    },
    {
      q: "What services do you offer?",
      source: "structured.services",
      contains: "Gate installation",
      url: "https://acme.example/services",
    },
    {
      q: "Where are you located?",
      source: "structured.locations",
      contains: "Wirral",
      url: "https://acme.example/contact",
    },
    {
      q: "What is your telephone number?",
      source: "structured.phones",
      contains: "0151 555 0100",
      url: "https://acme.example/contact",
    },
    {
      q: "What is your email address?",
      source: "structured.emails",
      contains: "help@acme.example",
      url: "https://acme.example/contact",
    },
  ] as const;

  for (const item of cases) {
    const answer = await answerGroundedReceptionistQuestion(item.q, {
      crawlId: "crawl-stage6",
      index,
      facts,
    });
    assert.equal(answer.supportStatus, "supported", item.q);
    assert.equal(answer.source, item.source, item.q);
    assert.ok(answer.text.toLowerCase().includes(item.contains.toLowerCase()), item.q);
    assert.deepEqual(answer.sourceUrls, [item.url], item.q);
    assert.deepEqual(answer.retrievedChunkIds, [], item.q);
  }
});

test("Stage 6 answers 10 deep-site questions from corpus evidence with traceable sources", async () => {
  const { index, facts } = await fixture();

  const cases = [
    ["How long does a new gate installation take?", "six weeks", "/installation"],
    ["Who is eligible for the supported installation scheme?", "housing associations and local authorities", "/eligibility"],
    ["Where do you deliver replacement parts?", "Wirral and Liverpool", "/delivery"],
    ["Can I return unused parts?", "returned within 30 days", "/returns"],
    ["How much is the standard call-out?", "£95", "/pricing"],
    ["How should I report a repair?", "online repair form", "/contact/jobs"],
    ["What time do you close on Christmas Eve?", "1pm on Christmas Eve", "/christmas-hours"],
    ["How do I order replacement keys?", "website key-order page", "/keys"],
    ["What warranty comes with a new installation?", "12 month workmanship warranty", "/warranty"],
    ["Do I need to provide parking for the engineer?", "legal parking access", "/parking"],
  ] as const;

  for (const [question, expectedText, expectedPath] of cases) {
    const answer = await answerGroundedReceptionistQuestion(question, {
      crawlId: "crawl-stage6",
      index,
      facts,
    });
    assert.equal(answer.supportStatus, "supported", question);
    assert.equal(answer.source, "corpus.extractive", question);
    assert.ok(answer.text.toLowerCase().includes(expectedText.toLowerCase()), question);
    assert.equal(answer.sourceUrls.length, 1, question);
    assert.ok((answer.sourceUrls[0] ?? "").endsWith(expectedPath), question);
    assert.equal(answer.retrievedChunkIds.length, 1, question);
    assert.equal(answer.evidence.length, 1, question);
    assert.equal(answer.evidence[0]?.chunkId, answer.retrievedChunkIds[0], question);
    assert.equal(answer.evidence[0]?.canonicalUrl, answer.sourceUrls[0], question);
    assert.ok(
      answer.evidence[0]?.text.includes(answer.text),
      "extractive answer must be an exact evidence substring: " + question,
    );
  }
});

test("structured FAQ is used before generic corpus search", async () => {
  const { index, facts } = await fixture();
  const answer = await answerGroundedReceptionistQuestion(
    "Will I be charged if I cancel my survey?",
    { crawlId: "crawl-stage6", index, facts },
  );
  assert.equal(answer.source, "structured.faqs");
  assert.match(answer.text, /without charge up to 24 hours/i);
  assert.deepEqual(answer.sourceUrls, ["https://acme.example/cancellations"]);
  assert.deepEqual(answer.retrievedChunkIds, []);
});

test("duration and price questions prefer answer-bearing sentences inside a retrieved chunk", async () => {
  const corpus = buildScannerV2Corpus([
    htmlPage(
      "https://acme.example/keys",
      "Keys",
      "Key ordering",
      "If a previous occupier did not provide the alley gate key, a landlord may need to provide one. Keys can take up to 6 weeks to be delivered, but are usually delivered within three weeks. A Wirral alley gate key costs £22.00.",
    ),
  ]);
  const index = new InMemoryBm25CorpusIndex();
  await index.index("cue-ranking", corpus.chunks);

  const duration = await answerGroundedReceptionistQuestion(
    "How long can an alley gate key take to arrive?",
    { crawlId: "cue-ranking", index },
  );
  assert.equal(duration.supportStatus, "supported");
  assert.match(duration.text, /up to 6 weeks/i);

  const price = await answerGroundedReceptionistQuestion(
    "How much does a Wirral alley gate key cost?",
    { crawlId: "cue-ranking", index },
  );
  assert.equal(price.supportStatus, "supported");
  assert.match(price.text, /£22\.00/i);
});

test("list questions prefer enumerated detail over generic type wording", async () => {
  const corpus = buildScannerV2Corpus([
    htmlPage(
      "https://acme.example/fencing",
      "Security fencing",
      "Fencing options",
      "We can offer different types of domestic and commercial fencing. We offer many fencing styles and designs including mesh fencing, palisade fencing, timber fencing, twin mesh fencing and bespoke fencing.",
    ),
  ]);
  const index = new InMemoryBm25CorpusIndex();
  await index.index("list-cue", corpus.chunks);

  const answer = await answerGroundedReceptionistQuestion(
    "What types of security fencing do you offer?",
    { crawlId: "list-cue", index },
  );
  assert.equal(answer.supportStatus, "supported");
  assert.match(answer.text, /including mesh fencing, palisade fencing, timber fencing/i);
});

test("returns questions prefer policy sentences over product-title overlap", async () => {
  const corpus = buildScannerV2Corpus([
    htmlPage(
      "https://acme.example/keys",
      "Keys",
      "Key products",
      "Wirral Alley Gate Key Wirral Alley Gate Key. Only if alley gate keys are proven to be faulty will they be collected and exchanged. At no point will any refund be given.",
    ),
  ]);
  const index = new InMemoryBm25CorpusIndex();
  await index.index("returns-cue", corpus.chunks);

  const answer = await answerGroundedReceptionistQuestion(
    "Can I return an alley gate key for a refund?",
    { crawlId: "returns-cue", index },
  );
  assert.equal(answer.supportStatus, "supported");
  assert.match(answer.text, /faulty|refund|exchanged/i);
});

test("unsupported question returns honest not-found and never invents evidence", async () => {
  const { index, facts } = await fixture();
  const answer = await answerGroundedReceptionistQuestion(
    "Do you repair spacecraft engines on Mars?",
    { crawlId: "crawl-stage6", index, facts },
  );
  assert.equal(answer.supportStatus, "not_found");
  assert.equal(answer.source, "missing");
  assert.match(answer.text, /couldn't find that information/i);
  assert.deepEqual(answer.sourceUrls, []);
  assert.deepEqual(answer.retrievedChunkIds, []);
  assert.deepEqual(answer.evidence, []);
});

test("summary compatibility facts do not override a supported deep-page answer", async () => {
  const { index, facts } = await fixture();
  const answer = await answerGroundedReceptionistQuestion(
    "How do I order replacement keys?",
    { crawlId: "crawl-stage6", index, facts },
  );
  assert.equal(answer.source, "corpus.extractive");
  assert.match(answer.text, /website key-order page/i);
  assert.doesNotMatch(answer.text, /^Acme Property Services offers/i);
});

test("optional synthesizer receives retrieved evidence only and accepted synthesis stays evidence-supported", async () => {
  const { index, facts } = await fixture();
  let observedEvidence: readonly GroundedEvidence[] = [];

  const answer = await answerGroundedReceptionistQuestion(
    "How much is the standard call-out?",
    {
      crawlId: "crawl-stage6",
      index,
      facts,
      synthesizer: async ({ evidence }) => {
        observedEvidence = evidence;
        return "The published standard call-out fee is £95 including VAT.";
      },
    },
  );

  assert.ok(observedEvidence.length > 0);
  assert.equal(answer.source, "corpus.synthesized");
  assert.match(answer.text, /£95 including VAT/i);
  assert.ok(answer.sourceUrls.some((url) => url.endsWith("/pricing")));
  assert.ok(answer.retrievedChunkIds.length > 0);
});

test("unsupported synthesizer additions are rejected and safely fall back to extractive evidence", async () => {
  const { index, facts } = await fixture();

  const answer = await answerGroundedReceptionistQuestion(
    "How much is the standard call-out?",
    {
      crawlId: "crawl-stage6",
      index,
      facts,
      synthesizer: async () =>
        "The published standard call-out fee is £95 including VAT and includes a free annual service.",
    },
  );

  assert.equal(answer.source, "corpus.extractive");
  assert.match(answer.text, /£95 including VAT/i);
  assert.doesNotMatch(answer.text, /free annual service/i);
});

test("grounded synthesis verifier rejects new numbers and unsupported claim words", () => {
  const evidence: GroundedEvidence[] = [
    {
      chunkId: "price",
      canonicalUrl: "https://acme.example/pricing",
      text: "The published standard call-out fee is £95 including VAT.",
      score: 5,
    },
  ];
  assert.equal(
    verifyGroundedSynthesis(
      "The published standard call-out fee is £95 including VAT.",
      evidence,
    ),
    true,
  );
  assert.equal(
    verifyGroundedSynthesis(
      "The published standard call-out fee is £195 including VAT.",
      evidence,
    ),
    false,
  );
  assert.equal(
    verifyGroundedSynthesis(
      "The published standard call-out fee is £95 including VAT with warranty.",
      evidence,
    ),
    false,
  );
});
