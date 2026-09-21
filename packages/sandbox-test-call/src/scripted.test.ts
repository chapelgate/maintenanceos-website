import assert from "node:assert/strict";
import test from "node:test";
import { TRUSTED_SANDBOX_CONSTRAINTS } from "../../receptionist-draft/src/index.ts";
import { missingOnFileReply, runScriptedDemo } from "./scripted.ts";

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
