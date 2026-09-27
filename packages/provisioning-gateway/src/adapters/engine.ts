import {
  validateAgentBlueprintV1,
  type AgentBlueprintV1,
  type IntegrationKind,
} from "../../../../src/lib/agent-blueprint.ts";
import type {
  ProvisioningPrincipal,
  ProvisioningRecord,
} from "../types.ts";
import { probeCalendarConnector, probeSignedHttpsConnector } from "./external.ts";
import { connectorByRef } from "./registry.ts";
import { probeTwilioConnector } from "./twilio.ts";
import type {
  AdapterBinding,
  AdapterCheck,
  AdapterPrepareResult,
  AdapterReadinessRecord,
  AdapterRegistry,
  AdapterTransport,
  TwilioConnector,
} from "./types.ts";
import { ADAPTER_READINESS_VERSION } from "./types.ts";

function readyBlueprint(blueprint: AgentBlueprintV1): AgentBlueprintV1 {
  const next = structuredClone(blueprint);
  next.lifecycle = { stage: "ready" };
  const checked = validateAgentBlueprintV1(next);
  if (!checked.ok) {
    throw new Error("Adapter readiness produced an invalid AgentBlueprint.");
  }
  return checked.value;
}

function enabledKinds(record: ProvisioningRecord): IntegrationKind[] {
  return record.blueprint.integrations
    .filter((integration) => integration.enabled)
    .map((integration) => integration.kind);
}

function bindingMap(
  bindings: AdapterBinding[],
): Map<IntegrationKind, AdapterBinding> | null {
  const map = new Map<IntegrationKind, AdapterBinding>();
  for (const binding of bindings) {
    if (map.has(binding.kind)) return null;
    map.set(binding.kind, binding);
  }
  return map;
}

function failure(
  error: AdapterPrepareResult extends { ok: false; error: infer E } ? E : never,
  message: string,
  checks?: AdapterCheck[],
): AdapterPrepareResult {
  return { ok: false, error, message, ...(checks ? { checks } : {}) };
}

export async function prepareAdapterReadiness(input: {
  provisioning: ProvisioningRecord;
  principal: ProvisioningPrincipal;
  bindings: AdapterBinding[];
  registry: AdapterRegistry;
  env?: NodeJS.ProcessEnv;
  transport: AdapterTransport;
  mutationsEnabled?: boolean;
  now?: () => Date;
}): Promise<AdapterPrepareResult> {
  const provisioning = structuredClone(input.provisioning);

  if (
    provisioning.status !== "provisioning" ||
    provisioning.blueprint.lifecycle.stage !== "provisioning"
  ) {
    return failure(
      "invalid_provisioning",
      "Only a provisioning-stage record can enter adapter readiness.",
    );
  }
  if (
    provisioning.tenantRef !== input.provisioning.tenantRef ||
    !input.principal.tenantRefs.includes(provisioning.tenantRef)
  ) {
    return failure(
      "tenant_forbidden",
      "Authenticated principal is not authorised for this provisioning tenant.",
    );
  }

  const kinds = enabledKinds(provisioning);
  if (kinds.length === 0 || new Set(kinds).size !== kinds.length) {
    return failure(
      "invalid_bindings",
      "Provisioning blueprint must contain unique enabled integration intents.",
    );
  }

  const bindings = bindingMap(input.bindings);
  if (!bindings || bindings.size !== kinds.length) {
    return failure(
      "invalid_bindings",
      "Connector bindings must match the reviewed enabled integration intents exactly.",
    );
  }
  for (const kind of kinds) {
    if (!bindings.has(kind)) {
      return failure(
        "invalid_bindings",
        "Connector bindings must match the reviewed enabled integration intents exactly.",
      );
    }
  }
  for (const kind of bindings.keys()) {
    if (!kinds.includes(kind)) {
      return failure(
        "invalid_bindings",
        "Connector binding was supplied for an integration that was not reviewed and enabled.",
      );
    }
  }

  const checks: AdapterCheck[] = [];
  const twilioGroups = new Map<string, {
    connector: TwilioConnector;
    kinds: Set<"telephony" | "sms">;
  }>();

  for (const kind of kinds) {
    const binding = bindings.get(kind)!;
    const reviewed = provisioning.blueprint.integrations.find(
      (integration) => integration.enabled && integration.kind === kind,
    );
    if (reviewed?.connectorRef && reviewed.connectorRef !== binding.connectorRef) {
      return failure(
        "invalid_bindings",
        "Connector binding conflicts with the connector reference reviewed in the blueprint.",
      );
    }

    const connector = connectorByRef(input.registry, binding.connectorRef);
    if (!connector) {
      return failure(
        "connector_not_found",
        "Connector reference is not present in the server-side registry.",
      );
    }
    if (!connector.kinds.includes(kind as never)) {
      return failure(
        "connector_kind_mismatch",
        "Connector does not support the reviewed integration kind.",
      );
    }

    if (connector.provider === "twilio") {
      if (kind !== "telephony" && kind !== "sms") {
        return failure("connector_kind_mismatch", "Twilio connector kind is invalid.");
      }
      const group = twilioGroups.get(connector.ref) ?? {
        connector,
        kinds: new Set<"telephony" | "sms">(),
      };
      group.kinds.add(kind);
      twilioGroups.set(connector.ref, group);
      continue;
    }

    if (connector.provider === "calendar_companion") {
      if (kind !== "calendar") {
        return failure("connector_kind_mismatch", "Calendar connector kind is invalid.");
      }
      const result = await probeCalendarConnector({
        connector,
        transport: input.transport,
      });
      checks.push(
        ...result.checks.map((check) => ({
          ...check,
          kind,
          connectorRef: connector.ref,
        })),
      );
      continue;
    }

    if (connector.provider === "signed_https") {
      if (kind !== "email" && kind !== "crm") {
        return failure("connector_kind_mismatch", "Signed HTTPS connector kind is invalid.");
      }
      const result = await probeSignedHttpsConnector({
        connector,
        kind,
        env: input.env,
        transport: input.transport,
      });
      checks.push(
        ...result.checks.map((check) => ({
          ...check,
          kind,
          connectorRef: connector.ref,
        })),
      );
    }
  }

  for (const { connector, kinds: twilioKinds } of twilioGroups.values()) {
    const result = await probeTwilioConnector({
      connector,
      kinds: twilioKinds,
      env: input.env,
      transport: input.transport,
      mutationsEnabled: input.mutationsEnabled,
    });
    for (const kind of twilioKinds) {
      checks.push(
        ...result.checks.map((check) => ({
          ...check,
          kind,
          connectorRef: connector.ref,
        })),
      );
    }
  }

  const failedCheckIds = checks
    .filter((check) => !check.ok)
    .map((check) => check.id + ":" + check.kind + ":" + check.connectorRef);
  if (failedCheckIds.length) {
    return failure(
      "adapter_not_ready",
      "One or more reviewed integrations are not ready.",
      checks,
    );
  }

  const sortedBindings = kinds
    .map((kind) => bindings.get(kind)!)
    .sort((a, b) => a.kind.localeCompare(b.kind));
  const record: AdapterReadinessRecord = {
    version: ADAPTER_READINESS_VERSION,
    provisioningId: provisioning.id,
    tenantRef: provisioning.tenantRef,
    createdAt: (input.now ?? (() => new Date()))().toISOString(),
    complete: true,
    bindings: sortedBindings,
    checks,
    failedCheckIds: [],
    blueprint: readyBlueprint(provisioning.blueprint),
  };
  return { ok: true, record };
}

export function readinessMatchesProvisioning(
  readiness: AdapterReadinessRecord | null | undefined,
  provisioning: ProvisioningRecord,
): readiness is AdapterReadinessRecord {
  if (!readiness || !readiness.complete) return false;
  if (
    readiness.provisioningId !== provisioning.id ||
    readiness.tenantRef !== provisioning.tenantRef ||
    readiness.blueprint.lifecycle.stage !== "ready"
  ) {
    return false;
  }
  const asProvisioning = structuredClone(readiness.blueprint);
  asProvisioning.lifecycle = { stage: "provisioning" };
  return JSON.stringify(asProvisioning) === JSON.stringify(provisioning.blueprint);
}
