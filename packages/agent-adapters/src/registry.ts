import type {
  ConnectorDescriptor,
  ConnectorRegistry,
  TtncSecretRegistry,
} from "./types.ts";

const REF = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const UK_OR_E164 = /^(?:\+?44\d{9,10}|0\d{9,10})$/;
const PROVIDER = /^[a-z0-9][a-z0-9._-]{1,63}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
): boolean {
  const keys = Object.keys(value);
  return keys.every((key) => allowed.includes(key));
}

function parseConnector(value: unknown): ConnectorDescriptor | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.ref !== "string" ||
    !REF.test(value.ref) ||
    value.configured !== true ||
    typeof value.kind !== "string" ||
    typeof value.provider !== "string"
  ) {
    return null;
  }

  if (value.kind === "telephony" && value.provider === "ttnc") {
    if (
      !exactKeys(value, [
        "ref",
        "kind",
        "provider",
        "configured",
        "existingNumber",
        "callApplicationId",
        "webhookUrl",
      ]) ||
      typeof value.existingNumber !== "string" ||
      !UK_OR_E164.test(value.existingNumber) ||
      !Number.isInteger(value.callApplicationId) ||
      Number(value.callApplicationId) <= 0 ||
      typeof value.webhookUrl !== "string"
    ) {
      return null;
    }
    try {
      const url = new URL(value.webhookUrl);
      if (url.protocol !== "https:" || !url.hostname) return null;
    } catch {
      return null;
    }
    return structuredClone(value) as ConnectorDescriptor;
  }

  if (
    !["calendar", "email", "crm", "sms"].includes(value.kind) ||
    !PROVIDER.test(value.provider) ||
    value.provider === "ttnc" ||
    !exactKeys(value, ["ref", "kind", "provider", "configured"])
  ) {
    return null;
  }
  return structuredClone(value) as ConnectorDescriptor;
}

export class MemoryConnectorRegistry implements ConnectorRegistry {
  private readonly values = new Map<string, ConnectorDescriptor>();

  constructor(connectors: ConnectorDescriptor[]) {
    for (const connector of connectors) {
      if (this.values.has(connector.ref)) {
        throw new Error("Duplicate connector ref: " + connector.ref);
      }
      this.values.set(connector.ref, structuredClone(connector));
    }
  }

  get(ref: string): ConnectorDescriptor | undefined {
    const found = this.values.get(ref);
    return found ? structuredClone(found) : undefined;
  }
}

export class MemoryTtncSecretRegistry implements TtncSecretRegistry {
  constructor(private readonly secrets: Record<string, string>) {}

  getWebhookSecret(ref: string): string | undefined {
    const secret = this.secrets[ref];
    return typeof secret === "string" && secret.length >= 16
      ? secret
      : undefined;
  }
}

export function loadConnectorRegistryFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): ConnectorRegistry {
  const raw = env.AGENT_CONNECTOR_REGISTRY_JSON?.trim();
  if (!raw) return new MemoryConnectorRegistry([]);
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("AGENT_CONNECTOR_REGISTRY_JSON must be an array.");
  }
  const connectors = parsed.map(parseConnector);
  if (connectors.some((item) => item === null)) {
    throw new Error("AGENT_CONNECTOR_REGISTRY_JSON contains an invalid connector.");
  }
  return new MemoryConnectorRegistry(connectors as ConnectorDescriptor[]);
}

export function loadTtncSecretRegistryFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): TtncSecretRegistry {
  const raw = env.TTNC_WEBHOOK_SECRETS_JSON?.trim();
  if (!raw) return new MemoryTtncSecretRegistry({});
  const parsed = JSON.parse(raw) as unknown;
  if (!isRecord(parsed)) {
    throw new Error("TTNC_WEBHOOK_SECRETS_JSON must be an object.");
  }
  const secrets: Record<string, string> = {};
  for (const [ref, value] of Object.entries(parsed)) {
    if (!REF.test(ref) || typeof value !== "string" || value.length < 16) {
      throw new Error("TTNC_WEBHOOK_SECRETS_JSON contains an invalid secret entry.");
    }
    secrets[ref] = value;
  }
  return new MemoryTtncSecretRegistry(secrets);
}
