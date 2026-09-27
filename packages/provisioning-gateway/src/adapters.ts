import { createHash } from "node:crypto";
import { prepareAgentAdapters } from "../../agent-adapters/src/engine.ts";
import type {
  ConnectorRegistry,
  TtncSecretRegistry,
} from "../../agent-adapters/src/types.ts";
import {
  provisioningFailure,
  type AdapterPreparationPublicReceipt,
  type AdapterPreparationRequestInput,
  type ProvisioningPrincipal,
  type ProvisioningResult,
  type ProvisioningStore,
} from "./types.ts";

const PROVISIONING_ID = /^prv_[0-9a-f]{24}$/;
const CONNECTOR_REF = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseRequest(
  value: unknown,
): AdapterPreparationRequestInput | null {
  if (!isRecord(value)) return null;
  const keys = Object.keys(value).sort();
  if (
    keys.length !== 2 ||
    keys[0] !== "connectorRefs" ||
    keys[1] !== "provisioningId" ||
    typeof value.provisioningId !== "string" ||
    !PROVISIONING_ID.test(value.provisioningId) ||
    !Array.isArray(value.connectorRefs) ||
    value.connectorRefs.length === 0 ||
    value.connectorRefs.length > 5 ||
    value.connectorRefs.some(
      (ref) => typeof ref !== "string" || !CONNECTOR_REF.test(ref),
    ) ||
    new Set(value.connectorRefs).size !== value.connectorRefs.length
  ) {
    return null;
  }
  return {
    provisioningId: value.provisioningId,
    connectorRefs: [...value.connectorRefs] as string[],
  };
}

function hashRequest(value: AdapterPreparationRequestInput): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        provisioningId: value.provisioningId,
        connectorRefs: [...value.connectorRefs],
      }),
    )
    .digest("hex");
}

function receipt(
  record: NonNullable<
    ReturnType<ProvisioningStore["getAdapterPreparation"]>
  >,
  replayed: boolean,
): AdapterPreparationPublicReceipt {
  return {
    provisioningId: record.provisioningId,
    tenantRef: record.tenantRef,
    status: "ready",
    blueprintStage: "ready",
    preparedAt: record.preparedAt,
    replayed,
    activationRequired: true,
    connectors: record.preparation.bindings.map((binding) => ({
      kind: binding.kind,
      connectorRef: binding.connectorRef,
      provider: binding.provider,
    })),
  };
}

export function prepareProvisioningAdapters(input: {
  request: unknown;
  principal: ProvisioningPrincipal;
  idempotencyKey: string;
  store: ProvisioningStore;
  registry: ConnectorRegistry;
  ttncSecrets: TtncSecretRegistry;
  now?: () => Date;
}): ProvisioningResult {
  const parsed = parseRequest(input.request);
  if (!parsed) {
    return provisioningFailure(
      "invalid_request",
      "Adapter preparation requires provisioningId and unique connectorRefs.",
    );
  }

  const provisioning = input.store.getProvisioning(parsed.provisioningId);
  if (!provisioning) {
    return provisioningFailure(
      "provisioning_not_found",
      "Provisioning record was not found.",
    );
  }
  if (
    provisioning.principalId !== input.principal.id ||
    !input.principal.tenantRefs.includes(provisioning.tenantRef)
  ) {
    return provisioningFailure(
      "tenant_forbidden",
      "Authenticated principal cannot prepare adapters for this provisioning record.",
    );
  }

  const requestHash = hashRequest(parsed);
  const scope = [
    input.principal.id,
    provisioning.tenantRef,
    parsed.provisioningId,
    input.idempotencyKey,
  ].join(":");
  const existing = input.store.getAdapterIdempotency(scope);
  if (existing) {
    if (existing.requestHash !== requestHash) {
      return provisioningFailure(
        "idempotency_conflict",
        "Idempotency key was already used for different adapter content.",
      );
    }
    return {
      ok: true,
      data: receipt(existing.record, true),
    };
  }

  let preparation;
  try {
    preparation = prepareAgentAdapters({
      blueprint: provisioning.blueprint,
      connectorRefs: parsed.connectorRefs,
      registry: input.registry,
      ttncSecrets: input.ttncSecrets,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Adapter preparation failed.";
    if (/AgentBlueprint|provisioning AgentBlueprint/i.test(message)) {
      return provisioningFailure("invalid_blueprint", message);
    }
    return provisioningFailure("adapter_not_configured", message);
  }

  const record = {
    provisioningId: provisioning.id,
    tenantRef: provisioning.tenantRef,
    principalId: input.principal.id,
    idempotencyKey: input.idempotencyKey,
    requestHash,
    preparedAt: (input.now ?? (() => new Date()))().toISOString(),
    status: "ready" as const,
    preparation,
  };
  input.store.putAdapterIdempotency(scope, { requestHash, record });

  return {
    ok: true,
    data: receipt(record, false),
  };
}
