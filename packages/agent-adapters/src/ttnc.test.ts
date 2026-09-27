import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  buildTtncSetApplicationXml,
  parseTtncWebhook,
  verifyTtncWebhookSignature,
} from "./ttnc.ts";

const SECRET = "0123456789abcdef0123456789abcdef";
const BODY = JSON.stringify({
  event: {
    anumber: "01245012345",
    bnumber: "02031511000",
    ref: "!5442B5AD54E14",
    event_type: "incoming_call",
  },
});

test("TTNC webhook HMAC verifies the exact raw body and rejects tampering", () => {
  const signature = createHmac("sha256", SECRET).update(BODY).digest("hex");
  assert.equal(
    verifyTtncWebhookSignature({
      rawBody: BODY,
      signature,
      secret: SECRET,
    }),
    true,
  );
  assert.equal(
    verifyTtncWebhookSignature({
      rawBody: BODY + " ",
      signature,
      secret: SECRET,
    }),
    false,
  );
  assert.equal(
    verifyTtncWebhookSignature({
      rawBody: BODY,
      signature: "bad",
      secret: SECRET,
    }),
    false,
  );
});

test("TTNC inbound-call and CDR events normalize without inventing fields", () => {
  assert.deepEqual(parseTtncWebhook(BODY), {
    eventType: "incoming_call",
    ref: "!5442B5AD54E14",
    caller: "01245012345",
    calledNumber: "02031511000",
  });
  const cdr = parseTtncWebhook(
    JSON.stringify({
      event: {
        ref: "!CDR1",
        event_type: "cdr",
        duration: "45",
      },
    }),
  );
  assert.deepEqual(cdr, {
    eventType: "cdr",
    ref: "!CDR1",
    durationSeconds: 45,
  });
});

test("TTNC webhook parser rejects unknown or incomplete event shapes", () => {
  assert.throws(
    () => parseTtncWebhook(JSON.stringify({ event: { event_type: "sms" } })),
    /Unsupported or incomplete/,
  );
  assert.throws(
    () =>
      parseTtncWebhook(
        JSON.stringify({
          event: { event_type: "cdr", ref: "!1", duration: "bad" },
        }),
      ),
    /duration is invalid/,
  );
});

test("TTNC SetApplication plan matches documented NoveroNumbers request and performs no call", () => {
  const xml = buildTtncSetApplicationXml({
    ref: "phone-main",
    kind: "telephony",
    provider: "ttnc",
    configured: true,
    existingNumber: "02922716489",
    callApplicationId: 999,
    webhookUrl: "https://agent.example/v1/telephony/ttnc/phone-main/webhook",
  });
  assert.match(xml, /target="NoveroNumbers"/);
  assert.match(xml, /name="SetApplication"/);
  assert.match(xml, /<Number>02922716489<\/Number>/);
  assert.match(xml, /<call_api_vkey_id>999<\/call_api_vkey_id>/);
  assert.doesNotMatch(xml, /password|secret|credential/i);
});
