import assert from "node:assert/strict";
import test from "node:test";
import { TRUSTED_SANDBOX_CONSTRAINTS } from "../../receptionist-draft/src/index.ts";
import {
  classifyCallerIntent,
  missingOnFileReply,
  runScriptedDemo,
  scriptedReply,
} from "./scripted.ts";

function receptionistTexts(pack: unknown, prompt?: string): string {
  return runScriptedDemo(pack, prompt)
    .filter((turn) => turn.speaker === "receptionist")
    .map((turn) => turn.text)
    .join("\n");
}

test("scripted demo with pack name+hours mentions both", () => {
  const turns = runScriptedDemo({
    businessName: "Acme Plumbing",
    hours: "Mon–Fri 08:00–17:00",
  });
  const text = turns.map((turn) => turn.text).join("\n");
  assert.match(text, /Acme Plumbing/);
  assert.match(text, /Mon–Fri 08:00–17:00/);
  const hoursTurn = turns.find((turn) => turn.source === "knowledge.hours");
  assert.ok(hoursTurn);
  assert.match(hoursTurn.text, /Acme Plumbing/);
  assert.match(hoursTurn.text, /Mon–Fri 08:00–17:00/);
  assert.ok(turns.some((turn) => /not a live phone call/i.test(turn.text)));
});

test("scripted demo with empty hours says not sure / not on file", () => {
  const turns = runScriptedDemo({
    businessName: "Acme Plumbing",
    services: ["Boiler repair"],
  });
  const hoursTurn = turns.find(
    (turn) =>
      turn.speaker === "receptionist" &&
      /opening hours/i.test(turn.text),
  );
  assert.ok(hoursTurn);
  assert.equal(hoursTurn.source, "missing");
  assert.match(hoursTurn.text, /not sure/i);
  assert.match(hoursTurn.text, /not on file/i);
  assert.doesNotMatch(hoursTurn.text, /\d{1,2}:\d{2}/);
  const text = receptionistTexts({
    businessName: "Acme Plumbing",
    services: ["Boiler repair"],
  });
  assert.match(text, /Acme Plumbing/);
  assert.match(text, /Boiler repair/);
});

test("scripted demo never invents missing services or FAQs", () => {
  const turns = runScriptedDemo({ businessName: "Acme" });
  const missing = turns.filter((turn) => turn.source === "missing");
  assert.ok(missing.some((turn) => /opening hours/i.test(turn.text)));
  assert.ok(missing.some((turn) => /services/i.test(turn.text)));
  assert.ok(missing.some((turn) => /FAQs/i.test(turn.text)));
  assert.ok(missing.every((turn) => /not sure/i.test(turn.text) && /not on file/i.test(turn.text)));
});

test("scripted demo follows stored system prompt missing-field wording", () => {
  const prompt = `Answer only from the pack. If asked about a missing field, say you do not have that information.\n\n${TRUSTED_SANDBOX_CONSTRAINTS}`;
  const hoursTurn = runScriptedDemo(
    { businessName: "Reviewed Heat" },
    prompt,
  ).find((turn) => turn.source === "missing" && /opening hours/i.test(turn.text));
  assert.ok(hoursTurn);
  assert.match(hoursTurn.text, /not sure/i);
  assert.match(hoursTurn.text, /not on file/i);
  assert.match(hoursTurn.text, /do not have that information/i);
  const closing = runScriptedDemo({ businessName: "Reviewed Heat" }, prompt).at(-1);
  assert.equal(closing?.source, "systemPrompt");
  assert.equal(
    missingOnFileReply("opening hours", prompt),
    hoursTurn.text,
  );
});

test("scripted demo uses pack FAQs and services without falling back to invented copy", () => {
  const turns = runScriptedDemo({
    businessName: "Acme Plumbing",
    greeting: "Warm homes, honest quotes",
    hours: "9-5",
    services: ["Boiler repair", "Power flushing"],
    faqs: [{ question: "Do you cover London?", answer: "Yes, within the M25." }],
  });
  assert.ok(turns.some((turn) => turn.source === "knowledge.greeting" && /Warm homes/.test(turn.text)));
  assert.ok(turns.some((turn) => turn.text.includes("Acme Plumbing") && /Warm homes/.test(turn.text)));
  assert.ok(
    turns.some(
      (turn) =>
        turn.speaker === "caller" &&
        turn.source === "knowledge.faqs" &&
        turn.text.includes("Do you cover London?"),
    ),
  );
  assert.ok(turns.some((turn) => turn.source === "knowledge.faqs" && turn.text.includes("M25")));
  assert.ok(
    turns.some(
      (turn) =>
        turn.source === "knowledge.services" &&
        /Boiler repair/.test(turn.text) &&
        /Power flushing/.test(turn.text),
    ),
  );
});

const ACME_PACK = {
  businessName: "Acme Plumbing",
  greeting: "Warm homes, honest quotes",
  hours: "Mon–Fri 08:00–17:00",
  services: ["Boiler repair", "Power flushing"],
  faqs: [{ question: "Do you cover London?", answer: "Yes, within the M25." }],
};

test("scriptedReply cites pack hours and services", () => {
  const hours = scriptedReply("What are your opening hours?", ACME_PACK);
  assert.equal(hours.source, "knowledge.hours");
  assert.match(hours.text, /Acme Plumbing/);
  assert.match(hours.text, /Mon–Fri 08:00–17:00/);
  const services = scriptedReply("What services do you offer?", ACME_PACK);
  assert.equal(services.source, "knowledge.services");
  assert.match(services.text, /Boiler repair/);
  assert.match(services.text, /Power flushing/);
});

test("scriptedReply answers natural service questions from reviewed website knowledge", () => {
  const pack = {
    businessName: "Alley Gates",
    services: [
      "Alley Gate Installation",
      "CCTV",
      "Security Fencing",
      "Replacement alley gate keys",
    ],
    faqs: [
      {
        question: "How do I order replacement alley gate keys?",
        answer: "Replacement keys can be ordered through the website key-order page.",
      },
    ],
  };

  const company = scriptedReply("What does your company do?", pack);
  assert.equal(company.source, "knowledge.services");
  assert.match(company.text, /Alley Gate Installation/);
  assert.match(company.text, /CCTV/);

  const keys = scriptedReply(
    "I need to order some alligator keys how do I go about this",
    pack,
  );
  assert.equal(keys.source, "knowledge.faqs");
  assert.match(keys.text, /ordered through the website/i);

  const summary = scriptedReply("What is on your knowledge pack?", pack);
  assert.equal(summary.source, "knowledge.summary");
  assert.match(summary.text, /Alley Gates/);
  assert.match(summary.text, /Replacement alley gate keys/);
});

test("scriptedReply selects the duration sentence within grounded site evidence", () => {
  const reply = scriptedReply(
    "How long can a replacement alley gate key take to arrive?",
    { businessName: "Alley Gates" },
    undefined,
    [{
      url: "https://alleygates.co.uk/product/sefton-alley-gate-key/",
      title: "Sefton Alley Gate Key",
      headingPath: ["Sefton Alley Gate Key"],
      text:
        "To request a replacement alley gate key use the payment form below or contact 0151 321 1920. " +
        "Please note, keys are ordered from a third party and from time of order the key can take up to 6 weeks to be delivered.",
      contentHash: "duration-ranking-fixture",
    }],
  );

  assert.equal(reply.source, "knowledge.site");
  assert.match(reply.text, /6 weeks/i);
  assert.doesNotMatch(reply.text, /contact 0151/i);
});

test("scriptedReply missing hours stays honest and invents no clock", () => {
  const hours = scriptedReply("What are your opening hours?", {
    businessName: "Acme Plumbing",
    services: ["Boiler repair"],
  });
  assert.equal(hours.source, "missing");
  assert.match(hours.text, /not sure/i);
  assert.match(hours.text, /not on file/i);
  assert.doesNotMatch(hours.text, /\d{1,2}:\d{2}/);
});

test("scriptedReply emergency uses UK 999 not 911 and does not dispatch", () => {
  const reply = scriptedReply(
    "This is an emergency — there's a gas leak and someone is hurt.",
    ACME_PACK,
  );
  assert.match(reply.text, /\b999\b/);
  assert.match(reply.text, /not 911/i);
  assert.match(reply.text, /cannot dispatch/i);
  assert.doesNotMatch(reply.text.replace(/not 911/gi, ""), /\b911\b/);
});

test("scriptedReply never invents a booking", () => {
  const reply = scriptedReply(
    "Can you book me an appointment tomorrow at 10:00?",
    ACME_PACK,
  );
  assert.match(reply.text, /cannot book/i);
  assert.match(reply.text, /calendar booking is not connected/i);
  assert.doesNotMatch(reply.text, /you're booked|i(?:'ve| have) booked/i);
});

test("scriptedReply ranks emergency above booking", () => {
  assert.equal(
    classifyCallerIntent(
      "Please book me an emergency gas leak appointment, someone is hurt.",
    ),
    "emergency",
  );
  const reply = scriptedReply(
    "Please book me an emergency gas leak appointment, someone is hurt.",
    ACME_PACK,
  );
  assert.match(reply.text, /\b999\b/);
  assert.match(reply.text, /cannot dispatch/i);
});

test("scriptedReply answers locations from pack", () => {
  const reply = scriptedReply("Where are you located?", {
    businessName: "Acme Plumbing",
    locations: ["Manchester", "Salford"],
  });
  assert.equal(reply.source, "knowledge.locations");
  assert.match(reply.text, /Manchester/);
  assert.match(reply.text, /Salford/);
});

test("scriptedReply answers contact details from pack", () => {
  const reply = scriptedReply("What is your phone number?", {
    businessName: "Acme Plumbing",
    contact: { phone: "0161 123 4567", email: "help@acme.example" },
  });
  assert.equal(reply.source, "knowledge.contact");
  assert.match(reply.text, /0161 123 4567/);
  assert.match(reply.text, /help@acme\.example/);
});

test("scriptedReply answers company intro from pack", () => {
  const reply = scriptedReply("Who are you?", {
    businessName: "Acme Plumbing",
    greeting: "Welcome to Acme.",
  });
  assert.equal(reply.source, "knowledge.businessName");
  assert.match(reply.text, /Acme Plumbing/);
});

test("scriptedReply missing facts includes preview notice", () => {
  const reply = scriptedReply("What are your opening hours?", {
    businessName: "Acme Plumbing",
  });
  assert.equal(reply.source, "missing");
  assert.match(
    reply.text,
    /This is a preview and that detail has not been added yet\./,
  );
});

