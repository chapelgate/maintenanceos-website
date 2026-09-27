import fs from "node:fs";
import path from "node:path";
import type {
  AdapterConnector,
  AdapterRegistry,
  CalendarConnector,
  SignedHttpsConnector,
  TwilioConnector,
} from "./types.ts";

const REF = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SID_AC = /^AC[0-9a-fA-F]{32}$/;
const SID_PN = /^PN[0-9a-fA-F]{32}$/;
const ENV_NAME = /^[A-Z][A-Z0-9_]{2,127}$/;

function httpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function exactKeys(record: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(record).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, i) => key === expected[i]);
}

function parseTwilio(record: Record<string, unknown>): TwilioConnector | null {
  if (!exactKeys(record, [
    "ref", "provider", "kinds", "accountSid", "incomingPhoneNumberSid",
    "publicBaseUrl", "apiKeyEnv", "apiSecretEnv",
  ])) return null;
  if (
    record.provider !== "twilio" ||
    typeof record.ref !== "string" || !REF.test(record.ref) ||
    !Array.isArray(record.kinds) || record.kinds.length === 0 ||
    record.kinds.some((x) => x !== "telephony" && x !== "sms") ||
    new Set(record.kinds).size !== record.kinds.length ||
    typeof record.accountSid !== "string" || !SID_AC.test(record.accountSid) ||
    typeof record.incomingPhoneNumberSid !== "string" || !SID_PN.test(record.incomingPhoneNumberSid) ||
    !httpsUrl(record.publicBaseUrl) ||
    typeof record.apiKeyEnv !== "string" || !ENV_NAME.test(record.apiKeyEnv) ||
    typeof record.apiSecretEnv !== "string" || !ENV_NAME.test(record.apiSecretEnv)
  ) return null;
  return structuredClone(record) as TwilioConnector;
}

function parseCalendar(record: Record<string, unknown>): CalendarConnector | null {
  if (!exactKeys(record, ["ref", "provider", "kinds", "endpoint"])) return null;
  if (
    record.provider !== "calendar_companion" ||
    typeof record.ref !== "string" || !REF.test(record.ref) ||
    !Array.isArray(record.kinds) || record.kinds.length !== 1 || record.kinds[0] !== "calendar" ||
    !httpsUrl(record.endpoint)
  ) return null;
  return structuredClone(record) as CalendarConnector;
}

function parseSigned(record: Record<string, unknown>): SignedHttpsConnector | null {
  if (!exactKeys(record, ["ref", "provider", "kinds", "endpoint", "secretEnv"])) return null;
  if (
    record.provider !== "signed_https" ||
    typeof record.ref !== "string" || !REF.test(record.ref) ||
    !Array.isArray(record.kinds) || record.kinds.length === 0 ||
    record.kinds.some((x) => x !== "email" && x !== "crm") ||
    new Set(record.kinds).size !== record.kinds.length ||
    !httpsUrl(record.endpoint) ||
    typeof record.secretEnv !== "string" || !ENV_NAME.test(record.secretEnv)
  ) return null;
  return structuredClone(record) as SignedHttpsConnector;
}

export function parseAdapterRegistry(value: unknown): AdapterRegistry {
  const root = asRecord(value);
  if (!root || !exactKeys(root, ["connectors"]) || !Array.isArray(root.connectors)) {
    throw new Error("Adapter connector registry is invalid.");
  }
  const connectors: AdapterConnector[] = [];
  for (const raw of root.connectors) {
    const record = asRecord(raw);
    if (!record) throw new Error("Adapter connector registry is invalid.");
    const parsed =
      record.provider === "twilio"
        ? parseTwilio(record)
        : record.provider === "calendar_companion"
          ? parseCalendar(record)
          : record.provider === "signed_https"
            ? parseSigned(record)
            : null;
    if (!parsed) throw new Error("Adapter connector registry is invalid.");
    connectors.push(parsed);
  }
  if (new Set(connectors.map((x) => x.ref)).size !== connectors.length) {
    throw new Error("Adapter connector refs must be unique.");
  }
  return { connectors };
}

export function loadAdapterRegistryFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): AdapterRegistry {
  const file = env.ADAPTER_CONNECTOR_REGISTRY_FILE?.trim();
  if (!file) throw new Error("ADAPTER_CONNECTOR_REGISTRY_FILE is not configured.");
  const resolved = path.resolve(file);
  const stat = fs.statSync(resolved);
  if (!stat.isFile()) throw new Error("Adapter connector registry is not a file.");
  return parseAdapterRegistry(JSON.parse(fs.readFileSync(resolved, "utf8")));
}

export function connectorByRef(
  registry: AdapterRegistry,
  ref: string,
): AdapterConnector | undefined {
  return registry.connectors.find((item) => item.ref === ref);
}
