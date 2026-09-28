import {
  AGENT_CAPABILITIES,
  type AgentBlueprintV1,
  type AgentCapability,
  validateAgentBlueprintV1,
} from "./agent-blueprint.ts";
import { agentTemplateFor } from "./agent-selection.ts";

export const CUSTOMER_VOICE_PROFILES = [
  {
    id: "choose_later",
    label: "Choose during commissioning",
    description:
      "Keep the production voice undecided until the final voice is tested and approved.",
  },
  {
    id: "uk_warm",
    label: "Warm UK",
    description: "A warmer, conversational UK voice preference.",
  },
  {
    id: "uk_clear",
    label: "Clear UK",
    description: "A clear, direct UK voice preference.",
  },
  {
    id: "uk_calm",
    label: "Calm UK",
    description: "A calmer UK voice preference for measured conversations.",
  },
] as const;

export type CustomerVoiceProfile =
  (typeof CUSTOMER_VOICE_PROFILES)[number]["id"];

export type CustomerActionId = "maintenance_jobs" | "appointments";

export type CustomerAgentConfiguration = {
  voiceProfile: CustomerVoiceProfile;
  enabledActions: CustomerActionId[];
  humanTransfer: "disabled" | "explicit_request";
};

export type CustomerActionOption = {
  id: CustomerActionId;
  label: string;
  description: string;
};

const ACTION_CAPABILITIES: Record<CustomerActionId, readonly AgentCapability[]> = {
  maintenance_jobs: ["create_maintenance_job"],
  appointments: ["check_calendar", "book_appointment"],
};

const ACTION_COPY: Record<CustomerActionId, Omit<CustomerActionOption, "id">> = {
  maintenance_jobs: {
    label: "Create maintenance jobs",
    description:
      "Capture a repair request as a structured maintenance job after collecting the required details.",
  },
  appointments: {
    label: "Manage appointments",
    description:
      "Check approved calendar availability and create a booking only through the configured calendar capability.",
  },
};

const CORE_CAPABILITIES = ["answer_information", "take_message"] as const satisfies readonly AgentCapability[];

function validateBlueprint(value: unknown): AgentBlueprintV1 {
  const result = validateAgentBlueprintV1(value);
  if (!result.ok) {
    throw new Error(
      "AgentBlueprint v1 validation failed: " + result.errors.join("; "),
    );
  }
  return result.value;
}

function voiceProfileFromBlueprint(
  blueprint: AgentBlueprintV1,
): CustomerVoiceProfile {
  const value = blueprint.agent.voiceProfile;
  if (!value) return "choose_later";
  if (
    value === "uk_warm" ||
    value === "uk_clear" ||
    value === "uk_calm"
  ) {
    return value;
  }
  throw new Error("Unsupported customer voice preference.");
}

export function customerActionOptionsForBlueprint(
  value: AgentBlueprintV1,
): CustomerActionOption[] {
  const blueprint = validateBlueprint(value);
  const template = agentTemplateFor(blueprint.agent.type);
  return (Object.keys(ACTION_CAPABILITIES) as CustomerActionId[])
    .filter((id) =>
      ACTION_CAPABILITIES[id].every((capability) =>
        template.allow.includes(capability),
      ),
    )
    .map((id) => ({ id, ...ACTION_COPY[id] }));
}

export function customerTransferSupported(
  value: AgentBlueprintV1,
): boolean {
  const blueprint = validateBlueprint(value);
  return agentTemplateFor(blueprint.agent.type).allow.includes("transfer_call");
}

export function customerConfigurationForBlueprint(
  value: AgentBlueprintV1,
): CustomerAgentConfiguration {
  const blueprint = validateBlueprint(value);
  const availableActions = customerActionOptionsForBlueprint(blueprint);
  const enabledActions = availableActions
    .filter((action) =>
      ACTION_CAPABILITIES[action.id].every((capability) =>
        blueprint.permissions.allow.includes(capability),
      ),
    )
    .map((action) => action.id);

  const transferSupported = customerTransferSupported(blueprint);
  const transferEnabled =
    transferSupported &&
    blueprint.permissions.allow.includes("transfer_call") &&
    blueprint.rules.humanTransfer === "explicit_request";

  if (
    blueprint.permissions.allow.includes("transfer_call") !== transferEnabled
  ) {
    throw new Error("Customer transfer configuration is inconsistent.");
  }

  return {
    voiceProfile: voiceProfileFromBlueprint(blueprint),
    enabledActions,
    humanTransfer: transferEnabled ? "explicit_request" : "disabled",
  };
}

export function applyCustomerAgentConfiguration(
  value: AgentBlueprintV1,
  configuration: CustomerAgentConfiguration,
): AgentBlueprintV1 {
  const blueprint = validateBlueprint(value);
  if (blueprint.lifecycle.stage !== "draft") {
    throw new Error("Customer configuration requires a draft AgentBlueprint.");
  }

  const template = agentTemplateFor(blueprint.agent.type);
  const availableActions = new Set(
    customerActionOptionsForBlueprint(blueprint).map((item) => item.id),
  );
  const requestedActions = new Set(configuration.enabledActions);

  for (const action of requestedActions) {
    if (!availableActions.has(action)) {
      throw new Error("Requested action is not available for this agent role.");
    }
  }

  if (
    !CUSTOMER_VOICE_PROFILES.some(
      (profile) => profile.id === configuration.voiceProfile,
    )
  ) {
    throw new Error("Unsupported customer voice preference.");
  }

  const transferSupported = customerTransferSupported(blueprint);
  if (
    configuration.humanTransfer === "explicit_request" &&
    !transferSupported
  ) {
    throw new Error("Human transfer is not available for this agent role.");
  }

  const allow = new Set<AgentCapability>();
  for (const capability of CORE_CAPABILITIES) {
    if (template.allow.includes(capability)) allow.add(capability);
  }
  for (const action of requestedActions) {
    for (const capability of ACTION_CAPABILITIES[action]) allow.add(capability);
  }
  if (
    transferSupported &&
    configuration.humanTransfer === "explicit_request"
  ) {
    allow.add("transfer_call");
  }

  for (const capability of allow) {
    if (!template.allow.includes(capability)) {
      throw new Error("Customer configuration cannot expand role permissions.");
    }
  }

  const allowed = AGENT_CAPABILITIES.filter((capability) => allow.has(capability));
  const denied = AGENT_CAPABILITIES.filter((capability) => !allow.has(capability));
  const calendarEnabled =
    allow.has("check_calendar") || allow.has("book_appointment");

  const next: AgentBlueprintV1 = {
    ...blueprint,
    agent: {
      ...blueprint.agent,
      ...(configuration.voiceProfile === "choose_later"
        ? { voiceProfile: undefined }
        : { voiceProfile: configuration.voiceProfile }),
    },
    permissions: {
      allow: allowed,
      deny: denied,
    },
    rules: {
      ...blueprint.rules,
      humanTransfer:
        configuration.humanTransfer === "explicit_request"
          ? "explicit_request"
          : "disabled",
      forbiddenActions: [...blueprint.rules.forbiddenActions],
    },
    integrations: blueprint.integrations.map((integration) => ({
      ...integration,
      enabled:
        integration.kind === "calendar"
          ? calendarEnabled
          : integration.enabled,
    })),
    privacy: { ...blueprint.privacy },
  };

  return validateBlueprint(next);
}
