import type { AgentBlueprintV1, IntegrationKind } from "../../../../src/lib/agent-blueprint.ts";

export const ADAPTER_READINESS_VERSION = "agent_adapter_readiness_v1" as const;

export type AdapterProvider = "twilio" | "calendar_companion" | "signed_https";

export type TwilioConnector = {
  ref: string;
  provider: "twilio";
  kinds: Array<"telephony" | "sms">;
  accountSid: string;
  incomingPhoneNumberSid: string;
  publicBaseUrl: string;
  apiKeyEnv: string;
  apiSecretEnv: string;
};

export type CalendarConnector = {
  ref: string;
  provider: "calendar_companion";
  kinds: ["calendar"];
  endpoint: string;
};

export type SignedHttpsConnector = {
  ref: string;
  provider: "signed_https";
  kinds: Array<"email" | "crm">;
  endpoint: string;
  secretEnv: string;
};

export type AdapterConnector =
  | TwilioConnector
  | CalendarConnector
  | SignedHttpsConnector;

export type AdapterRegistry = {
  connectors: AdapterConnector[];
};

export type AdapterBinding = {
  kind: IntegrationKind;
  connectorRef: string;
};

export type AdapterCheck = {
  id: string;
  kind: IntegrationKind;
  connectorRef: string;
  ok: boolean;
  detail: string;
};

export type AdapterReadinessRecord = {
  version: typeof ADAPTER_READINESS_VERSION;
  provisioningId: string;
  tenantRef: string;
  createdAt: string;
  complete: boolean;
  bindings: AdapterBinding[];
  checks: AdapterCheck[];
  failedCheckIds: string[];
  blueprint: AgentBlueprintV1;
};

export type AdapterTransportRequest = {
  method: "GET" | "POST";
  url: string;
  headers?: Record<string, string>;
  body?: string;
};

export type AdapterTransportResponse = {
  status: number;
  body: string;
};

export type AdapterTransport = (
  request: AdapterTransportRequest,
) => Promise<AdapterTransportResponse>;

export type AdapterProbeResult = {
  ok: boolean;
  checks: Array<{ id: string; ok: boolean; detail: string }>;
};

export type AdapterPrepareFailureCode =
  | "invalid_provisioning"
  | "tenant_forbidden"
  | "invalid_bindings"
  | "connector_not_found"
  | "connector_kind_mismatch"
  | "connector_not_configured"
  | "adapter_not_ready"
  | "provider_error";

export type AdapterPrepareResult =
  | { ok: true; record: AdapterReadinessRecord }
  | { ok: false; error: AdapterPrepareFailureCode; message: string; checks?: AdapterCheck[] };
