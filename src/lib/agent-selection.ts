import {
  AGENT_BLUEPRINT_PRODUCT_BASELINE_DATE,
  AGENT_BLUEPRINT_PRODUCT_BASELINE_SHA,
  AGENT_BLUEPRINT_SCHEMA_VERSION,
  AGENT_CAPABILITIES,
  type AgentBlueprintV1,
  type AgentCapability,
  type AgentType,
  validateAgentBlueprintV1,
} from "./agent-blueprint.ts";
import type { ScanBusinessFacts } from "./onboarding-create.ts";

export type AgentTemplate = {
  type: AgentType;
  label: string;
  summary: string;
  objective: (businessName: string) => string;
  greeting: (businessName: string) => string;
  allow: readonly AgentCapability[];
  humanTransfer: AgentBlueprintV1["rules"]["humanTransfer"];
};

const SAFE_FORBIDDEN_ACTIONS: AgentBlueprintV1["rules"]["forbiddenActions"] = [
  "financial_commitment",
  "autonomous_dispatch",
  "credential_disclosure",
  "policy_override",
  "unrestricted_external_action",
];

export const AGENT_TEMPLATES: readonly AgentTemplate[] = [
  {
    type: "receptionist",
    label: "AI receptionist",
    summary: "Answer routine enquiries, take messages and transfer only when explicitly requested.",
    objective: (name) => "Handle front-desk enquiries for " + name + " and capture messages accurately.",
    greeting: (name) => "Thank you for calling " + name + ". How can I help?",
    allow: ["answer_information", "take_message", "transfer_call"],
    humanTransfer: "explicit_request",
  },
  {
    type: "maintenance_desk",
    label: "Maintenance desk",
    summary: "Capture maintenance issues and create structured maintenance jobs.",
    objective: (name) => "Handle maintenance enquiries for " + name + " and capture repair jobs accurately.",
    greeting: (name) => "Thank you for calling " + name + ". How can I help with your maintenance enquiry?",
    allow: ["answer_information", "take_message", "create_maintenance_job", "transfer_call"],
    humanTransfer: "explicit_request",
  },
  {
    type: "booking_assistant",
    label: "Booking assistant",
    summary: "Answer questions and manage appointments through an approved calendar capability.",
    objective: (name) => "Help callers with appointments for " + name + " using only approved booking capabilities.",
    greeting: (name) => "Thank you for calling " + name + ". How can I help with your booking?",
    allow: ["answer_information", "take_message", "check_calendar", "book_appointment"],
    humanTransfer: "disabled",
  },
  {
    type: "customer_service",
    label: "Customer service",
    summary: "Answer support questions, take messages and escalate on explicit request.",
    objective: (name) => "Handle customer-service enquiries for " + name + " using verified business information.",
    greeting: (name) => "Thank you for calling " + name + ". How can I help with your enquiry?",
    allow: ["answer_information", "take_message", "transfer_call"],
    humanTransfer: "explicit_request",
  },
  {
    type: "sales_enquiry",
    label: "Sales / enquiry assistant",
    summary: "Answer service questions and capture qualified enquiries without making commitments.",
    objective: (name) => "Handle sales and service enquiries for " + name + " without making financial commitments.",
    greeting: (name) => "Thank you for calling " + name + ". How can I help with your enquiry?",
    allow: ["answer_information", "take_message"],
    humanTransfer: "disabled",
  },
  {
    type: "custom",
    label: "Custom agent",
    summary: "Start from the safest information-and-message template; behaviour is refined in the next step.",
    objective: (name) => "Handle approved enquiries for " + name + " within explicitly configured capabilities.",
    greeting: (name) => "Thank you for calling " + name + ". How can I help?",
    allow: ["answer_information", "take_message"],
    humanTransfer: "disabled",
  },
] as const;

export function agentTemplateFor(type: AgentType): AgentTemplate {
  const template = AGENT_TEMPLATES.find((item) => item.type === type);
  if (!template) throw new Error("Unsupported agent type: " + type);
  return template;
}

function deniedCapabilities(allowed: readonly AgentCapability[]): AgentCapability[] {
  return AGENT_CAPABILITIES.filter((capability) => !allowed.includes(capability));
}

function cleanBusinessName(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) throw new Error("Business name is required before choosing an agent.");
  return cleaned.slice(0, 200);
}

function httpsWebsite(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" || !url.hostname) {
    throw new Error("An HTTPS business website is required before choosing an agent.");
  }
  return url.toString();
}

function firstContact(
  facts: ScanBusinessFacts,
): AgentBlueprintV1["identity"]["contact"] | undefined {
  const phone = facts.contact?.phones?.[0]?.trim();
  const email = facts.contact?.emails?.[0]?.trim();
  if (!phone && !email) return undefined;
  return {
    ...(phone ? { phone } : {}),
    ...(email ? { email } : {}),
  };
}

export function buildAgentBlueprintDraft(input: {
  type: AgentType;
  businessName: string;
  businessUrl: string;
  facts?: ScanBusinessFacts;
  blueprintId: string;
  createdAt: string;
}): AgentBlueprintV1 {
  const name = cleanBusinessName(input.businessName);
  const facts = input.facts ?? {};
  const template = agentTemplateFor(input.type);
  const website = httpsWebsite(facts.website ?? input.businessUrl);
  const contact = firstContact(facts);

  const blueprint: AgentBlueprintV1 = {
    schemaVersion: AGENT_BLUEPRINT_SCHEMA_VERSION,
    blueprintId: input.blueprintId,
    createdAt: input.createdAt,
    compatibility: {
      productBaselineSha: AGENT_BLUEPRINT_PRODUCT_BASELINE_SHA,
      productBaselineDate: AGENT_BLUEPRINT_PRODUCT_BASELINE_DATE,
      runtimeContract: "maintenanceos-v1",
    },
    identity: {
      businessName: name,
      website,
      ...(facts.locations?.length ? { locations: facts.locations.slice(0, 50) } : {}),
      ...(contact ? { contact } : {}),
    },
    agent: {
      type: template.type,
      objective: template.objective(name),
      greeting: template.greeting(name),
      language: "en-GB",
    },
    knowledge: {
      untrustedWebsiteContent: true,
      ...(facts.services?.length ? { services: facts.services.slice(0, 100) } : {}),
      ...(facts.hours ? { hours: facts.hours } : {}),
      ...(facts.faqs?.length ? { faqs: facts.faqs.slice(0, 100) } : {}),
    },
    permissions: {
      allow: [...template.allow],
      deny: deniedCapabilities(template.allow),
    },
    rules: {
      unavailableInformation: "say_not_on_file",
      humanTransfer: template.humanTransfer,
      forbiddenActions: [...SAFE_FORBIDDEN_ACTIONS],
    },
    integrations: [],
    privacy: {
      recordCalls: false,
      transcribeCalls: false,
      retentionDays: 0,
    },
    lifecycle: {
      stage: "draft",
    },
  };

  const validation = validateAgentBlueprintV1(blueprint);
  if (!validation.ok) {
    throw new Error("AgentBlueprint v1 validation failed: " + validation.errors.join("; "));
  }
  return validation.value;
}

export function createAgentBlueprintDraft(input: {
  type: AgentType;
  businessName: string;
  businessUrl: string;
  facts?: ScanBusinessFacts;
}): AgentBlueprintV1 {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "")
      : String(Date.now()) + String(Math.floor(Math.random() * 1_000_000));
  return buildAgentBlueprintDraft({
    ...input,
    blueprintId: ("abp_" + random).slice(0, 68),
    createdAt: new Date().toISOString(),
  });
}
