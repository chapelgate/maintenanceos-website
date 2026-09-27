import type {
  AgentBlueprintV1,
  IntegrationKind,
} from "../../../src/lib/agent-blueprint.ts";

export type ConnectorProvider =
  | "ttnc"
  | "calendar-adapters"
  | "managed-email"
  | "managed-crm"
  | "managed-sms";

export type BaseConnectorDescriptor = {
  ref: string;
  kind: IntegrationKind;
  provider: ConnectorProvider;
  configured: true;
};

export type TtncConnectorDescriptor = BaseConnectorDescriptor & {
  kind: "telephony";
  provider: "ttnc";
  existingNumber: string;
  callApplicationId: number;
  webhookUrl: string;
};

export type GenericConnectorDescriptor = BaseConnectorDescriptor & {
  kind: Exclude<IntegrationKind, "telephony">;
  provider: Exclude<ConnectorProvider, "ttnc">;
};

export type ConnectorDescriptor =
  | TtncConnectorDescriptor
  | GenericConnectorDescriptor;

export type ConnectorRegistry = {
  get(ref: string): ConnectorDescriptor | undefined;
};

export type TtncSecretRegistry = {
  getWebhookSecret(ref: string): string | undefined;
};

export type PreparedAdapterBinding = {
  kind: IntegrationKind;
  connectorRef: string;
  provider: ConnectorProvider;
  state: "prepared";
  activationRequired: true;
  telephony?: {
    existingNumber: string;
    webhookVerification: "hmac-sha256-raw-body";
    setApplicationEndpoint: "https://xml.ttnc.co.uk";
    setApplicationXml: string;
    mutationPerformed: false;
  };
};

export type AdapterPreparation = {
  blueprint: AgentBlueprintV1;
  bindings: PreparedAdapterBinding[];
  activationRequired: true;
};

export type TtncWebhookEvent = {
  eventType: "incoming_call" | "cdr";
  ref: string;
  caller?: string;
  calledNumber?: string;
  durationSeconds?: number;
};
