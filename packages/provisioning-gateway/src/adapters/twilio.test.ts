import assert from "node:assert/strict";
import test from "node:test";
import { probeTwilioConnector } from "./twilio.ts";
import type { AdapterTransportRequest, TwilioConnector } from "./types.ts";

const connector: TwilioConnector = {
  ref: "twilio_primary",
  provider: "twilio",
  kinds: ["telephony", "sms"],
  accountSid: "AC" + "a".repeat(32),
  incomingPhoneNumberSid: "PN" + "b".repeat(32),
  publicBaseUrl: "https://voice.example.com/",
  apiKeyEnv: "TWILIO_API_KEY",
  apiSecretEnv: "TWILIO_API_SECRET",
};
const env = {
  TWILIO_API_KEY: "SK" + "c".repeat(32),
  TWILIO_API_SECRET: "server-secret-value",
};

function remote(overrides: Record<string, unknown> = {}) {
  return {
    voice_url: "https://voice.example.com/voice/inbound",
    voice_method: "POST",
    voice_application_sid: null,
    trunk_sid: null,
    sms_url: "https://voice.example.com/messaging/inbound",
    sms_method: "POST",
    sms_application_sid: null,
    ...overrides,
  };
}

test("matching Twilio route passes without a provider mutation", async () => {
  const requests: AdapterTransportRequest[] = [];
  const result = await probeTwilioConnector({
    connector,
    kinds: new Set(["telephony"]),
    env,
    mutationsEnabled: false,
    transport: async (request) => {
      requests.push(request);
      return { status: 200, body: JSON.stringify(remote()) };
    },
  });
  assert.equal(result.ok, true);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "GET");
});

test("Voice Application or trunk ownership fails closed", async () => {
  for (const override of [
    { voice_application_sid: "AP" + "d".repeat(32) },
    { trunk_sid: "TK" + "e".repeat(32) },
  ]) {
    const result = await probeTwilioConnector({
      connector,
      kinds: new Set(["telephony"]),
      env,
      transport: async () => ({ status: 200, body: JSON.stringify(remote(override)) }),
    });
    assert.equal(result.ok, false);
    assert.match(result.checks[0].detail, /would be ignored/i);
  }
});

test("mismatched Twilio route does not mutate when mutations are disabled", async () => {
  const methods: string[] = [];
  const result = await probeTwilioConnector({
    connector,
    kinds: new Set(["telephony"]),
    env,
    mutationsEnabled: false,
    transport: async (request) => {
      methods.push(request.method);
      return {
        status: 200,
        body: JSON.stringify(remote({ voice_url: "https://old.example.com/" })),
      };
    },
  });
  assert.equal(result.ok, false);
  assert.deepEqual(methods, ["GET"]);
  assert.equal(result.checks[0].id, "twilio_mutation_required");
});

test("enabled mutation updates only reviewed routing fields then re-verifies", async () => {
  const requests: AdapterTransportRequest[] = [];
  let getCount = 0;
  const result = await probeTwilioConnector({
    connector,
    kinds: new Set(["telephony", "sms"]),
    env,
    mutationsEnabled: true,
    transport: async (request) => {
      requests.push(request);
      if (request.method === "POST") {
        assert.match(request.body ?? "", /VoiceUrl=/);
        assert.match(request.body ?? "", /VoiceMethod=POST/);
        assert.match(request.body ?? "", /SmsUrl=/);
        assert.match(request.body ?? "", /SmsMethod=POST/);
        assert.doesNotMatch(request.body ?? "", /StatusCallback|FriendlyName|VoiceApplicationSid|TrunkSid/);
        return { status: 200, body: "{}" };
      }
      getCount += 1;
      return {
        status: 200,
        body: JSON.stringify(
          getCount === 1
            ? remote({ voice_url: "https://old.example.com/", sms_url: "https://old.example.com/sms" })
            : remote(),
        ),
      };
    },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(requests.map((x) => x.method), ["GET", "POST", "GET"]);
});

test("SMS application ownership and missing credentials fail before mutation", async () => {
  const conflict = await probeTwilioConnector({
    connector,
    kinds: new Set(["sms"]),
    env,
    transport: async () => ({
      status: 200,
      body: JSON.stringify(remote({ sms_application_sid: "AP" + "f".repeat(32) })),
    }),
  });
  assert.equal(conflict.ok, false);
  assert.equal(conflict.checks[0].id, "twilio_sms_route_owner");

  let called = false;
  const missing = await probeTwilioConnector({
    connector,
    kinds: new Set(["telephony"]),
    env: {},
    transport: async () => {
      called = true;
      return { status: 500, body: "" };
    },
  });
  assert.equal(missing.ok, false);
  assert.equal(called, false);
  assert.equal(missing.checks[0].id, "twilio_credentials");
});
