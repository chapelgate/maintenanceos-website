import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  PreparedAdapterBinding,
  TtncConnectorDescriptor,
  TtncWebhookEvent,
} from "./types.ts";

const SIGNATURE = /^[0-9a-f]{64}$/;

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildTtncSetApplicationXml(
  connector: TtncConnectorDescriptor,
): string {
  return [
    '<?xml version="1.0"?>',
    "<NoveroRequest>",
    '  <Request target="NoveroNumbers" name="SetApplication" id="MaintenanceOS">',
    "    <Number>" + xmlEscape(connector.existingNumber) + "</Number>",
    "    <call_api_vkey_id>" +
      String(connector.callApplicationId) +
      "</call_api_vkey_id>",
    "  </Request>",
    "</NoveroRequest>",
  ].join("\n");
}

export function verifyTtncWebhookSignature(input: {
  rawBody: Buffer | string;
  signature: string | undefined;
  secret: string;
}): boolean {
  if (!input.signature || !SIGNATURE.test(input.signature)) return false;
  const expected = createHmac("sha256", input.secret)
    .update(input.rawBody)
    .digest("hex");
  const left = Buffer.from(expected, "hex");
  const right = Buffer.from(input.signature, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

export function parseTtncWebhook(rawBody: Buffer | string): TtncWebhookEvent {
  const parsed = JSON.parse(
    typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"),
  ) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("TTNC webhook body must be a JSON object.");
  }
  const event = (parsed as Record<string, unknown>).event;
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw new Error("TTNC webhook event object is missing.");
  }
  const record = event as Record<string, unknown>;
  const eventType = stringValue(record.event_type);
  const ref = stringValue(record.ref);
  if (
    (eventType !== "incoming_call" && eventType !== "cdr") ||
    !ref
  ) {
    throw new Error("Unsupported or incomplete TTNC webhook event.");
  }

  const durationRaw = stringValue(record.duration);
  const duration = durationRaw === undefined ? undefined : Number(durationRaw);
  if (
    duration !== undefined &&
    (!Number.isFinite(duration) || duration < 0)
  ) {
    throw new Error("TTNC webhook duration is invalid.");
  }

  return {
    eventType,
    ref,
    ...(stringValue(record.anumber) ? { caller: stringValue(record.anumber) } : {}),
    ...(stringValue(record.bnumber)
      ? { calledNumber: stringValue(record.bnumber) }
      : {}),
    ...(duration === undefined
      ? {}
      : { durationSeconds: Math.floor(duration) }),
  };
}

export function prepareTtncBinding(input: {
  connector: TtncConnectorDescriptor;
  webhookSecret: string;
}): PreparedAdapterBinding {
  if (input.webhookSecret.length < 16) {
    throw new Error("TTNC webhook secret is not configured.");
  }
  return {
    kind: "telephony",
    connectorRef: input.connector.ref,
    provider: "ttnc",
    state: "prepared",
    activationRequired: true,
    telephony: {
      existingNumber: input.connector.existingNumber,
      webhookVerification: "hmac-sha256-raw-body",
      setApplicationEndpoint: "https://xml.ttnc.co.uk",
      setApplicationXml: buildTtncSetApplicationXml(input.connector),
      mutationPerformed: false,
    },
  };
}
