import { Buffer } from "node:buffer";
import type {
  AdapterProbeResult,
  AdapterTransport,
  TwilioConnector,
} from "./types.ts";

type TwilioNumber = {
  voice_url?: unknown;
  voice_method?: unknown;
  voice_application_sid?: unknown;
  trunk_sid?: unknown;
  sms_url?: unknown;
  sms_method?: unknown;
  sms_application_sid?: unknown;
};

function value(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function endpoint(base: string, path: string): string {
  return new URL(path, base.endsWith("/") ? base : base + "/").toString();
}

function basicAuth(user: string, secret: string): string {
  return "Basic " + Buffer.from(user + ":" + secret, "utf8").toString("base64");
}

function resourceUrl(connector: TwilioConnector): string {
  return (
    "https://api.twilio.com/2010-04-01/Accounts/" +
    connector.accountSid +
    "/IncomingPhoneNumbers/" +
    connector.incomingPhoneNumberSid +
    ".json"
  );
}

function desiredFields(
  connector: TwilioConnector,
  kinds: ReadonlySet<"telephony" | "sms">,
): Record<string, string> {
  const fields: Record<string, string> = {};
  if (kinds.has("telephony")) {
    fields.VoiceUrl = endpoint(connector.publicBaseUrl, "voice/inbound");
    fields.VoiceMethod = "POST";
  }
  if (kinds.has("sms")) {
    fields.SmsUrl = endpoint(connector.publicBaseUrl, "messaging/inbound");
    fields.SmsMethod = "POST";
  }
  return fields;
}

function matches(
  remote: TwilioNumber,
  desired: Record<string, string>,
): boolean {
  if (
    desired.VoiceUrl &&
    (value(remote.voice_url) !== desired.VoiceUrl ||
      value(remote.voice_method).toUpperCase() !== "POST")
  ) {
    return false;
  }
  if (
    desired.SmsUrl &&
    (value(remote.sms_url) !== desired.SmsUrl ||
      value(remote.sms_method).toUpperCase() !== "POST")
  ) {
    return false;
  }
  return true;
}

async function inspect(
  connector: TwilioConnector,
  auth: string,
  transport: AdapterTransport,
): Promise<{ ok: true; remote: TwilioNumber } | { ok: false; detail: string }> {
  const response = await transport({
    method: "GET",
    url: resourceUrl(connector),
    headers: { Authorization: auth, Accept: "application/json" },
  });
  if (response.status !== 200) {
    return { ok: false, detail: "Twilio number inspection failed with HTTP " + response.status + "." };
  }
  try {
    const parsed = JSON.parse(response.body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, detail: "Twilio number inspection returned invalid JSON." };
    }
    return { ok: true, remote: parsed as TwilioNumber };
  } catch {
    return { ok: false, detail: "Twilio number inspection returned invalid JSON." };
  }
}

export async function probeTwilioConnector(input: {
  connector: TwilioConnector;
  kinds: ReadonlySet<"telephony" | "sms">;
  env?: NodeJS.ProcessEnv;
  transport: AdapterTransport;
  mutationsEnabled?: boolean;
}): Promise<AdapterProbeResult> {
  const env = input.env ?? process.env;
  const apiKey = env[input.connector.apiKeyEnv]?.trim() ?? "";
  const apiSecret = env[input.connector.apiSecretEnv] ?? "";
  if (!apiKey || !apiSecret) {
    return {
      ok: false,
      checks: [{
        id: "twilio_credentials",
        ok: false,
        detail: "Twilio server credentials are not configured.",
      }],
    };
  }

  const auth = basicAuth(apiKey, apiSecret);
  const first = await inspect(input.connector, auth, input.transport);
  if (!first.ok) {
    return { ok: false, checks: [{ id: "twilio_inspect", ok: false, detail: first.detail }] };
  }

  if (
    input.kinds.has("telephony") &&
    (value(first.remote.voice_application_sid) || value(first.remote.trunk_sid))
  ) {
    return {
      ok: false,
      checks: [{
        id: "twilio_voice_route_owner",
        ok: false,
        detail: "Twilio voice routing is owned by a Voice Application or trunk; voiceUrl would be ignored.",
      }],
    };
  }
  if (input.kinds.has("sms") && value(first.remote.sms_application_sid)) {
    return {
      ok: false,
      checks: [{
        id: "twilio_sms_route_owner",
        ok: false,
        detail: "Twilio SMS routing is owned by a Messaging Application; smsUrl would be ignored.",
      }],
    };
  }

  const desired = desiredFields(input.connector, input.kinds);
  if (matches(first.remote, desired)) {
    return {
      ok: true,
      checks: [{
        id: "twilio_routes_match",
        ok: true,
        detail: "Twilio number routes already match the MaintenanceOS HTTPS endpoints.",
      }],
    };
  }

  if (!input.mutationsEnabled) {
    return {
      ok: false,
      checks: [{
        id: "twilio_mutation_required",
        ok: false,
        detail: "Twilio routing differs from the desired MaintenanceOS endpoints and mutations are disabled.",
      }],
    };
  }

  const body = new URLSearchParams(desired).toString();
  const updated = await input.transport({
    method: "POST",
    url: resourceUrl(input.connector),
    headers: {
      Authorization: auth,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (updated.status < 200 || updated.status >= 300) {
    return {
      ok: false,
      checks: [{
        id: "twilio_update",
        ok: false,
        detail: "Twilio routing update failed with HTTP " + updated.status + ".",
      }],
    };
  }

  const verify = await inspect(input.connector, auth, input.transport);
  if (!verify.ok || !matches(verify.remote, desired)) {
    return {
      ok: false,
      checks: [{
        id: "twilio_verify",
        ok: false,
        detail: verify.ok
          ? "Twilio routing did not match after update."
          : verify.detail,
      }],
    };
  }

  return {
    ok: true,
    checks: [{
      id: "twilio_routes_verified",
      ok: true,
      detail: "Twilio number routes were updated and verified.",
    }],
  };
}
