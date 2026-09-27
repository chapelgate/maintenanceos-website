import {
  validateAgentBlueprintV1,
  type AgentBlueprintV1,
  type IntegrationKind,
} from "../../../src/lib/agent-blueprint.ts";
import { prepareTtncBinding } from "./ttnc.ts";
import type {
  AdapterPreparation,
  ConnectorRegistry,
  PreparedAdapterBinding,
  TtncSecretRegistry,
} from "./types.ts";

const REF = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function sameExceptAdaptersAndLifecycle(
  before: AgentBlueprintV1,
  after: AgentBlueprintV1,
): boolean {
  const left = structuredClone(before);
  const right = structuredClone(after);
  left.integrations = [];
  right.integrations = [];
  left.lifecycle = { stage: "provisioning" };
  right.lifecycle = { stage: "provisioning" };
  return JSON.stringify(left) === JSON.stringify(right);
}

export function prepareAgentAdapters(input: {
  blueprint: AgentBlueprintV1;
  connectorRefs: string[];
  registry: ConnectorRegistry;
  ttncSecrets: TtncSecretRegistry;
}): AdapterPreparation {
  const blueprintValidation = validateAgentBlueprintV1(input.blueprint);
  if (!blueprintValidation.ok) {
    throw new Error("AgentBlueprint v1 validation failed.");
  }
  const blueprint = blueprintValidation.value;
  if (blueprint.lifecycle.stage !== "provisioning") {
    throw new Error("Only a provisioning AgentBlueprint can prepare adapters.");
  }
  if (
    !Array.isArray(input.connectorRefs) ||
    input.connectorRefs.length === 0 ||
    input.connectorRefs.length > 5 ||
    new Set(input.connectorRefs).size !== input.connectorRefs.length ||
    input.connectorRefs.some((ref) => !REF.test(ref))
  ) {
    throw new Error("Connector refs are invalid.");
  }

  const seenKinds = new Set<IntegrationKind>();
  const bindings: PreparedAdapterBinding[] = [];
  for (const ref of input.connectorRefs) {
    const connector = input.registry.get(ref);
    if (!connector) throw new Error("Connector is not configured: " + ref);
    if (seenKinds.has(connector.kind)) {
      throw new Error("Only one connector per integration kind may be prepared.");
    }
    seenKinds.add(connector.kind);

    if (connector.kind === "telephony") {
      if (connector.provider !== "ttnc") {
        throw new Error("Unsupported telephony provider.");
      }
      const secret = input.ttncSecrets.getWebhookSecret(connector.ref);
      if (!secret) throw new Error("TTNC webhook secret is not configured.");
      bindings.push(
        prepareTtncBinding({
          connector,
          webhookSecret: secret,
        }),
      );
      continue;
    }

    bindings.push({
      kind: connector.kind,
      connectorRef: connector.ref,
      provider: connector.provider,
      state: "prepared",
      activationRequired: true,
    });
  }

  const next = structuredClone(blueprint);
  next.integrations = bindings.map((binding) => ({
    kind: binding.kind,
    connectorRef: binding.connectorRef,
    enabled: true,
  }));
  next.lifecycle = { stage: "ready" };

  const validation = validateAgentBlueprintV1(next);
  if (!validation.ok) {
    throw new Error("Prepared AgentBlueprint failed validation.");
  }
  if (!sameExceptAdaptersAndLifecycle(blueprint, validation.value)) {
    throw new Error("Adapter preparation changed protected AgentBlueprint fields.");
  }

  return {
    blueprint: validation.value,
    bindings,
    activationRequired: true,
  };
}
