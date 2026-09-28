import { createHmac, randomUUID } from "node:crypto";
import type {
  AdapterProbeResult,
  AdapterTransport,
  CalendarConnector,
  SignedHttpsConnector,
} from "./types.ts";

function json(body: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function probeCalendarConnector(input: {
  connector: CalendarConnector;
  transport: AdapterTransport;
}): Promise<AdapterProbeResult> {
  const url = new URL("/health", input.connector.endpoint).toString();
  const response = await input.transport({
    method: "GET",
    url,
    headers: { Accept: "application/json" },
  });
  const body = json(response.body);
  if (response.status !== 200 || !body || body.ok !== true || body.adaptersEnabled !== true) {
    return {
      ok: false,
      checks: [{
        id: "calendar_health",
        ok: false,
        detail: "Calendar companion is not enabled and healthy.",
      }],
    };
  }

  const provider = typeof body.provider === "string" ? body.provider : "";
  if (provider !== "google" && provider !== "microsoft") {
    return {
      ok: false,
      checks: [{
        id: "calendar_live_provider",
        ok: false,
        detail: "Calendar companion is not using a live Google or Microsoft provider.",
      }],
    };
  }
  const oauth =
    provider === "google"
      ? body.googleOAuth
      : body.microsoftOAuth;
  if (
    !oauth ||
    typeof oauth !== "object" ||
    Array.isArray(oauth) ||
    (oauth as Record<string, unknown>).clientConfigured !== true ||
    (oauth as Record<string, unknown>).tokenPresent !== true
  ) {
    return {
      ok: false,
      checks: [{
        id: "calendar_oauth_ready",
        ok: false,
        detail: "Calendar provider OAuth is not fully configured.",
      }],
    };
  }

  return {
    ok: true,
    checks: [{
      id: "calendar_ready",
      ok: true,
      detail: "Calendar companion reports a configured live provider and token.",
    }],
  };
}

export async function probeSignedHttpsConnector(input: {
  connector: SignedHttpsConnector;
  kind: "email" | "crm";
  env?: NodeJS.ProcessEnv;
  transport: AdapterTransport;
  nowMs?: number;
  nonce?: string;
}): Promise<AdapterProbeResult> {
  const env = input.env ?? process.env;
  const secret = env[input.connector.secretEnv] ?? "";
  if (secret.length < 32) {
    return {
      ok: false,
      checks: [{
        id: input.kind + "_secret",
        ok: false,
        detail: "Server-side connector signing secret is not configured.",
      }],
    };
  }

  const url = new URL("/health", input.connector.endpoint);
  const timestamp = String(input.nowMs ?? Date.now());
  const nonce = input.nonce ?? randomUUID().replaceAll("-", "");
  const canonical = ["GET", url.pathname, timestamp, nonce].join("\n");
  const signature = createHmac("sha256", secret).update(canonical).digest("hex");
  const response = await input.transport({
    method: "GET",
    url: url.toString(),
    headers: {
      Accept: "application/json",
      "X-MOS-Timestamp": timestamp,
      "X-MOS-Nonce": nonce,
      "X-MOS-Signature": signature,
    },
  });
  const body = json(response.body);
  if (
    response.status !== 200 ||
    !body ||
    body.ok !== true ||
    body.ready !== true ||
    body.kind !== input.kind
  ) {
    return {
      ok: false,
      checks: [{
        id: input.kind + "_health",
        ok: false,
        detail: "Signed HTTPS connector did not confirm readiness for " + input.kind + ".",
      }],
    };
  }

  return {
    ok: true,
    checks: [{
      id: input.kind + "_ready",
      ok: true,
      detail: "Signed HTTPS connector confirmed readiness for " + input.kind + ".",
    }],
  };
}
