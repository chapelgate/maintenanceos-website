import assert from "node:assert/strict";
import test from "node:test";
import {
  buildReceptionistDraft,
  TRUSTED_CONSTRAINTS_MARKER,
} from "./receptionist-draft.ts";

test("src re-export builds a claims-safe pack for /create", () => {
  const result = buildReceptionistDraft({
    businessName: "Acme",
    hours: "",
    services: "",
  });
  assert.equal(result.knowledgePack.hours, undefined);
  assert.equal(result.knowledgePack.services, undefined);
  assert.equal(result.knowledgePack.liveCall, false);
  assert.match(result.systemPrompt, TRUSTED_CONSTRAINTS_MARKER);
  assert.match(result.systemPrompt, /not a live customer phone line/i);
  assert.ok(result.limitations.some((line) => /Opening hours are missing/i.test(line)));
});
