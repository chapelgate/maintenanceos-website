export const AGENT_BLUEPRINT_SCHEMA_VERSION = "1.0.0" as const;
export const AGENT_BLUEPRINT_PRODUCT_BASELINE_SHA =
  "5eb0f92f2633e20e4d280835d3e6577e3f206c8b" as const;
export const AGENT_BLUEPRINT_PRODUCT_BASELINE_DATE = "2026-09-27" as const;

export const AGENT_TYPES = [
  "receptionist",
  "maintenance_desk",
  "booking_assistant",
  "customer_service",
  "sales_enquiry",
  "custom",
] as const;

export const AGENT_CAPABILITIES = [
  "answer_information",
  "take_message",
  "create_maintenance_job",
  "check_calendar",
  "book_appointment",
  "send_email",
  "send_sms",
  "transfer_call",
] as const;

export const INTEGRATION_KINDS = [
  "telephony",
  "calendar",
  "email",
  "crm",
  "sms",
] as const;

export type AgentType = (typeof AGENT_TYPES)[number];
export type AgentCapability = (typeof AGENT_CAPABILITIES)[number];
export type IntegrationKind = (typeof INTEGRATION_KINDS)[number];
export type Confidence = "high" | "medium" | "low" | "confirmed";
export type BlueprintStage =
  | "draft"
  | "reviewed"
  | "sandbox_passed"
  | "provisioning"
  | "ready"
  | "active";

export type AgentBlueprintV1 = {
  schemaVersion: typeof AGENT_BLUEPRINT_SCHEMA_VERSION;
  blueprintId: string;
  createdAt: string;
  compatibility: {
    productBaselineSha: typeof AGENT_BLUEPRINT_PRODUCT_BASELINE_SHA;
    productBaselineDate: typeof AGENT_BLUEPRINT_PRODUCT_BASELINE_DATE;
    runtimeContract: "maintenanceos-v1";
  };
  identity: {
    businessName: string;
    website: string;
    locations?: string[];
    contact?: { phone?: string; email?: string };
  };
  agent: {
    type: AgentType;
    objective: string;
    greeting: string;
    language: string;
    voiceProfile?: string;
  };
  knowledge: {
    untrustedWebsiteContent: true;
    services?: string[];
    hours?: string;
    faqs?: Array<{ question: string; answer: string }>;
    sources?: Array<{
      url: string;
      fields: Array<
        "businessName" | "website" | "locations" | "contact" | "services" | "hours" | "faqs"
      >;
      sourceType:
        | "jsonld" | "microdata" | "meta" | "title" | "heading"
        | "nav" | "pattern" | "contact_link" | "details" | "operator";
      confidence: Confidence;
    }>;
  };
  permissions: {
    allow: AgentCapability[];
    deny: AgentCapability[];
  };
  rules: {
    unavailableInformation: "say_not_on_file" | "offer_human_route" | "take_message";
    humanTransfer: "disabled" | "explicit_request" | "policy_only";
    forbiddenActions: Array<
      | "financial_commitment"
      | "autonomous_dispatch"
      | "credential_disclosure"
      | "policy_override"
      | "unrestricted_external_action"
    >;
  };
  integrations: Array<{
    kind: IntegrationKind;
    connectorRef?: string;
    enabled: boolean;
  }>;
  privacy: {
    recordCalls: boolean;
    transcribeCalls: boolean;
    retentionDays: number;
  };
  lifecycle: {
    stage: BlueprintStage;
  };
};

export type AgentBlueprintValidation =
  | { ok: true; value: AgentBlueprintV1 }
  | { ok: false; errors: string[] };

const FORBIDDEN_KEY = /(?:^|_)(?:api_?key|secret|password|token|credential|auth)(?:$|_)/i;
const SHA40 = /^[0-9a-f]{40}$/;
const BLUEPRINT_ID = /^abp_[A-Za-z0-9][A-Za-z0-9_-]{7,63}$/;
const CONNECTOR_REF = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function rejectSecretKeys(value: unknown, path: string, errors: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectSecretKeys(item, path + "[" + index + "]", errors));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEY.test(key)) errors.push(path + "." + key + ": credential-like fields are forbidden");
    rejectSecretKeys(child, path + "." + key, errors);
  }
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  required: readonly string[],
  path: string,
  errors: string[],
): void {
  const allow = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allow.has(key)) errors.push(path + "." + key + ": unexpected field");
  }
  for (const key of required) {
    if (!(key in value)) errors.push(path + "." + key + ": required");
  }
}

function stringField(
  value: unknown,
  path: string,
  errors: string[],
  min = 1,
  max = 4000,
): value is string {
  if (typeof value !== "string") {
    errors.push(path + ": expected string");
    return false;
  }
  const len = value.trim().length;
  if (len < min || len > max) errors.push(path + ": length must be " + min + "-" + max);
  return true;
}

function booleanField(value: unknown, path: string, errors: string[]): value is boolean {
  if (typeof value !== "boolean") {
    errors.push(path + ": expected boolean");
    return false;
  }
  return true;
}

function enumField<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string,
  errors: string[],
): value is T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    errors.push(path + ": invalid value");
    return false;
  }
  return true;
}

function httpsUrl(value: unknown, path: string, errors: string[]): value is string {
  if (!stringField(value, path, errors, 1, 2048)) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname) throw new Error("not https");
    return true;
  } catch {
    errors.push(path + ": expected absolute https URL");
    return false;
  }
}

function stringArray(
  value: unknown,
  path: string,
  errors: string[],
  maxItems: number,
  maxItemLength: number,
): value is string[] {
  if (!Array.isArray(value)) {
    errors.push(path + ": expected array");
    return false;
  }
  if (value.length > maxItems) errors.push(path + ": too many items");
  value.forEach((item, index) => stringField(item, path + "[" + index + "]", errors, 1, maxItemLength));
  if (new Set(value).size !== value.length) errors.push(path + ": duplicate items are not allowed");
  return true;
}

export function validateAgentBlueprintV1(value: unknown): AgentBlueprintValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { ok: false, errors: ["$: expected object"] };

  rejectSecretKeys(value, "$", errors);
  exactKeys(
    value,
    ["schemaVersion", "blueprintId", "createdAt", "compatibility", "identity", "agent",
      "knowledge", "permissions", "rules", "integrations", "privacy", "lifecycle"],
    ["schemaVersion", "blueprintId", "createdAt", "compatibility", "identity", "agent",
      "knowledge", "permissions", "rules", "integrations", "privacy", "lifecycle"],
    "$",
    errors,
  );

  if (value.schemaVersion !== AGENT_BLUEPRINT_SCHEMA_VERSION) errors.push("$.schemaVersion: unsupported version");
  if (!stringField(value.blueprintId, "$.blueprintId", errors, 12, 68) ||
      !BLUEPRINT_ID.test(value.blueprintId)) {
    errors.push("$.blueprintId: invalid id");
  }
  if (!stringField(value.createdAt, "$.createdAt", errors, 20, 40) ||
      Number.isNaN(Date.parse(value.createdAt))) {
    errors.push("$.createdAt: invalid date-time");
  }

  if (!isRecord(value.compatibility)) errors.push("$.compatibility: expected object");
  else {
    exactKeys(
      value.compatibility,
      ["productBaselineSha", "productBaselineDate", "runtimeContract"],
      ["productBaselineSha", "productBaselineDate", "runtimeContract"],
      "$.compatibility",
      errors,
    );
    const sha = value.compatibility.productBaselineSha;
    if (typeof sha !== "string" || !SHA40.test(sha)) {
      errors.push("$.compatibility.productBaselineSha: expected 40-char lowercase SHA");
    } else if (sha !== AGENT_BLUEPRINT_PRODUCT_BASELINE_SHA) {
      errors.push("$.compatibility.productBaselineSha: unsupported product baseline");
    }
    if (value.compatibility.productBaselineDate !== AGENT_BLUEPRINT_PRODUCT_BASELINE_DATE) {
      errors.push("$.compatibility.productBaselineDate: unsupported baseline date");
    }
    if (value.compatibility.runtimeContract !== "maintenanceos-v1") {
      errors.push("$.compatibility.runtimeContract: unsupported runtime contract");
    }
  }

  if (!isRecord(value.identity)) errors.push("$.identity: expected object");
  else {
    exactKeys(
      value.identity,
      ["businessName", "website", "locations", "contact"],
      ["businessName", "website"],
      "$.identity",
      errors,
    );
    stringField(value.identity.businessName, "$.identity.businessName", errors, 1, 200);
    httpsUrl(value.identity.website, "$.identity.website", errors);
    if (value.identity.locations !== undefined) {
      stringArray(value.identity.locations, "$.identity.locations", errors, 50, 300);
    }
    if (value.identity.contact !== undefined) {
      if (!isRecord(value.identity.contact)) errors.push("$.identity.contact: expected object");
      else {
        exactKeys(value.identity.contact, ["phone", "email"], [], "$.identity.contact", errors);
        if (value.identity.contact.phone !== undefined) {
          stringField(value.identity.contact.phone, "$.identity.contact.phone", errors, 1, 50);
        }
        if (value.identity.contact.email !== undefined) {
          if (
            stringField(value.identity.contact.email, "$.identity.contact.email", errors, 3, 254) &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.identity.contact.email)
          ) {
            errors.push("$.identity.contact.email: invalid email");
          }
        }
      }
    }
  }

  if (!isRecord(value.agent)) errors.push("$.agent: expected object");
  else {
    exactKeys(
      value.agent,
      ["type", "objective", "greeting", "language", "voiceProfile"],
      ["type", "objective", "greeting", "language"],
      "$.agent",
      errors,
    );
    enumField(value.agent.type, AGENT_TYPES, "$.agent.type", errors);
    stringField(value.agent.objective, "$.agent.objective", errors, 1, 500);
    stringField(value.agent.greeting, "$.agent.greeting", errors, 1, 500);
    stringField(value.agent.language, "$.agent.language", errors, 2, 35);
    if (value.agent.voiceProfile !== undefined) {
      stringField(value.agent.voiceProfile, "$.agent.voiceProfile", errors, 1, 100);
    }
  }

  if (!isRecord(value.knowledge)) errors.push("$.knowledge: expected object");
  else {
    exactKeys(
      value.knowledge,
      ["untrustedWebsiteContent", "services", "hours", "faqs", "sources"],
      ["untrustedWebsiteContent"],
      "$.knowledge",
      errors,
    );
    if (value.knowledge.untrustedWebsiteContent !== true) {
      errors.push("$.knowledge.untrustedWebsiteContent: must be true");
    }
    if (value.knowledge.services !== undefined) {
      stringArray(value.knowledge.services, "$.knowledge.services", errors, 100, 300);
    }
    if (value.knowledge.hours !== undefined) {
      stringField(value.knowledge.hours, "$.knowledge.hours", errors, 1, 2000);
    }
    if (value.knowledge.faqs !== undefined) {
      if (!Array.isArray(value.knowledge.faqs)) errors.push("$.knowledge.faqs: expected array");
      else {
        if (value.knowledge.faqs.length > 100) errors.push("$.knowledge.faqs: too many items");
        value.knowledge.faqs.forEach((faq, index) => {
          const path = "$.knowledge.faqs[" + index + "]";
          if (!isRecord(faq)) errors.push(path + ": expected object");
          else {
            exactKeys(faq, ["question", "answer"], ["question", "answer"], path, errors);
            stringField(faq.question, path + ".question", errors, 1, 500);
            stringField(faq.answer, path + ".answer", errors, 1, 2000);
          }
        });
      }
    }
    if (value.knowledge.sources !== undefined) {
      if (!Array.isArray(value.knowledge.sources)) errors.push("$.knowledge.sources: expected array");
      else {
        if (value.knowledge.sources.length > 200) errors.push("$.knowledge.sources: too many items");
        const fieldNames = ["businessName", "website", "locations", "contact", "services", "hours", "faqs"] as const;
        const sourceTypes = ["jsonld", "microdata", "meta", "title", "heading", "nav", "pattern", "contact_link", "details", "operator"] as const;
        const confidences = ["high", "medium", "low", "confirmed"] as const;
        value.knowledge.sources.forEach((source, index) => {
          const path = "$.knowledge.sources[" + index + "]";
          if (!isRecord(source)) errors.push(path + ": expected object");
          else {
            exactKeys(source, ["url", "fields", "sourceType", "confidence"],
              ["url", "fields", "sourceType", "confidence"], path, errors);
            httpsUrl(source.url, path + ".url", errors);
            if (!Array.isArray(source.fields) || source.fields.length === 0) {
              errors.push(path + ".fields: expected non-empty array");
            } else {
              source.fields.forEach((field, fieldIndex) =>
                enumField(field, fieldNames, path + ".fields[" + fieldIndex + "]", errors));
              if (new Set(source.fields).size !== source.fields.length) {
                errors.push(path + ".fields: duplicate items are not allowed");
              }
            }
            enumField(source.sourceType, sourceTypes, path + ".sourceType", errors);
            enumField(source.confidence, confidences, path + ".confidence", errors);
          }
        });
      }
    }
  }

  if (!isRecord(value.permissions)) errors.push("$.permissions: expected object");
  else {
    exactKeys(value.permissions, ["allow", "deny"], ["allow", "deny"], "$.permissions", errors);
    const validateCapabilities = (input: unknown, path: string): AgentCapability[] => {
      if (!Array.isArray(input)) {
        errors.push(path + ": expected array");
        return [];
      }
      input.forEach((item, index) =>
        enumField(item, AGENT_CAPABILITIES, path + "[" + index + "]", errors));
      if (new Set(input).size !== input.length) errors.push(path + ": duplicate items are not allowed");
      return input.filter(
        (item): item is AgentCapability =>
          typeof item === "string" && AGENT_CAPABILITIES.includes(item as AgentCapability),
      );
    };
    const allow = validateCapabilities(value.permissions.allow, "$.permissions.allow");
    const deny = validateCapabilities(value.permissions.deny, "$.permissions.deny");
    const overlap = allow.filter((item) => deny.includes(item));
    if (overlap.length) {
      errors.push("$.permissions: capability cannot be both allowed and denied: " + overlap.join(", "));
    }
  }

  if (!isRecord(value.rules)) errors.push("$.rules: expected object");
  else {
    exactKeys(
      value.rules,
      ["unavailableInformation", "humanTransfer", "forbiddenActions"],
      ["unavailableInformation", "humanTransfer", "forbiddenActions"],
      "$.rules",
      errors,
    );
    enumField(
      value.rules.unavailableInformation,
      ["say_not_on_file", "offer_human_route", "take_message"] as const,
      "$.rules.unavailableInformation",
      errors,
    );
    enumField(
      value.rules.humanTransfer,
      ["disabled", "explicit_request", "policy_only"] as const,
      "$.rules.humanTransfer",
      errors,
    );
    const forbidden = [
      "financial_commitment", "autonomous_dispatch", "credential_disclosure",
      "policy_override", "unrestricted_external_action",
    ] as const;
    if (!Array.isArray(value.rules.forbiddenActions)) {
      errors.push("$.rules.forbiddenActions: expected array");
    } else {
      value.rules.forbiddenActions.forEach((item, index) =>
        enumField(item, forbidden, "$.rules.forbiddenActions[" + index + "]", errors));
      if (new Set(value.rules.forbiddenActions).size !== value.rules.forbiddenActions.length) {
        errors.push("$.rules.forbiddenActions: duplicate items are not allowed");
      }
    }
  }

  if (!Array.isArray(value.integrations)) errors.push("$.integrations: expected array");
  else {
    if (value.integrations.length > 50) errors.push("$.integrations: too many items");
    value.integrations.forEach((integration, index) => {
      const path = "$.integrations[" + index + "]";
      if (!isRecord(integration)) errors.push(path + ": expected object");
      else {
        exactKeys(integration, ["kind", "connectorRef", "enabled"], ["kind", "enabled"], path, errors);
        enumField(integration.kind, INTEGRATION_KINDS, path + ".kind", errors);
        booleanField(integration.enabled, path + ".enabled", errors);
        if (
          integration.connectorRef !== undefined &&
          (!stringField(integration.connectorRef, path + ".connectorRef", errors, 1, 128) ||
            !CONNECTOR_REF.test(integration.connectorRef))
        ) {
          errors.push(path + ".connectorRef: invalid opaque reference");
        }
      }
    });
  }

  if (!isRecord(value.privacy)) errors.push("$.privacy: expected object");
  else {
    exactKeys(
      value.privacy,
      ["recordCalls", "transcribeCalls", "retentionDays"],
      ["recordCalls", "transcribeCalls", "retentionDays"],
      "$.privacy",
      errors,
    );
    booleanField(value.privacy.recordCalls, "$.privacy.recordCalls", errors);
    booleanField(value.privacy.transcribeCalls, "$.privacy.transcribeCalls", errors);
    if (
      !Number.isInteger(value.privacy.retentionDays) ||
      (value.privacy.retentionDays as number) < 0 ||
      (value.privacy.retentionDays as number) > 3650
    ) {
      errors.push("$.privacy.retentionDays: expected integer 0-3650");
    }
  }

  if (!isRecord(value.lifecycle)) errors.push("$.lifecycle: expected object");
  else {
    exactKeys(value.lifecycle, ["stage"], ["stage"], "$.lifecycle", errors);
    enumField(
      value.lifecycle.stage,
      ["draft", "reviewed", "sandbox_passed", "provisioning", "ready", "active"] as const,
      "$.lifecycle.stage",
      errors,
    );
  }

  return errors.length
    ? { ok: false, errors }
    : { ok: true, value: value as AgentBlueprintV1 };
}
