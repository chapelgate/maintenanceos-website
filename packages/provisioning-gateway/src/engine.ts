import { createHash } from "node:crypto";
import {
  validateAgentBlueprintV1,
  type AgentBlueprintV1,
} from "../../../src/lib/agent-blueprint.ts";
import {
  qualifyAgentSandbox,
} from "../../../src/lib/agent-sandbox-qualification.ts";
import {
  PROVISIONING_QUALIFICATION_VERSION,
  REQUIRED_QUALIFICATION_CHECKS,
  provisioningFailure,
  type ProvisioningPrincipal,
  type ProvisioningPublicReceipt,
  type ProvisioningQualification,
  type ProvisioningRequestInput,
  type ProvisioningResult,
  type ProvisioningStore,
} from "./types.ts";

const TENANT_REF = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/;
const REVISION = /^arv1_[0-9a-f]{8}$/;
const EVIDENCE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
): boolean {
  const keys = Object.keys(value).sort();
  return (
    keys.length === allowed.length &&
    keys.every((key) => allowed.includes(key))
  );
}

export function stableProvisioningJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }
  if (Array.isArray(value)) {
    return "[" + value.map(stableProvisioningJson).join(",") + "]";
  }
  const record = value as Record<string, unknown>;
  return (
    "{" +
    Object.keys(record)
      .sort()
      .filter((key) => record[key] !== undefined)
      .map(
        (key) =>
          JSON.stringify(key) + ":" + stableProvisioningJson(record[key]),
      )
      .join(",") +
    "}"
  );
}

function requestHash(value: ProvisioningRequestInput): string {
  return createHash("sha256")
    .update(stableProvisioningJson(value))
    .digest("hex");
}

function validateQualification(value: unknown): ProvisioningQualification | null {
  if (!isRecord(value)) return null;
  if (
    !exactKeys(value, [
      "version",
      "reviewRevisionId",
      "source",
      "sessionId",
      "testId",
      "complete",
      "checks",
      "failedCheckIds",
    ])
  ) {
    return null;
  }
  if (value.version !== PROVISIONING_QUALIFICATION_VERSION) return null;
  if (
    typeof value.reviewRevisionId !== "string" ||
    !REVISION.test(value.reviewRevisionId)
  ) {
    return null;
  }
  if (value.source !== "companion" || value.complete !== true) return null;
  if (
    typeof value.sessionId !== "string" ||
    !EVIDENCE_ID.test(value.sessionId) ||
    typeof value.testId !== "string" ||
    !EVIDENCE_ID.test(value.testId)
  ) {
    return null;
  }
  if (!Array.isArray(value.failedCheckIds) || value.failedCheckIds.length !== 0) {
    return null;
  }
  if (
    !Array.isArray(value.checks) ||
    value.checks.length !== REQUIRED_QUALIFICATION_CHECKS.length
  ) {
    return null;
  }

  const ids: string[] = [];
  for (const item of value.checks) {
    if (
      !isRecord(item) ||
      !exactKeys(item, ["id", "ok"]) ||
      typeof item.id !== "string" ||
      !REQUIRED_QUALIFICATION_CHECKS.includes(
        item.id as (typeof REQUIRED_QUALIFICATION_CHECKS)[number],
      ) ||
      item.ok !== true
    ) {
      return null;
    }
    ids.push(item.id);
  }

  const expected = [...REQUIRED_QUALIFICATION_CHECKS].sort();
  const actual = [...new Set(ids)].sort();
  if (
    actual.length !== expected.length ||
    actual.some((id, index) => id !== expected[index])
  ) {
    return null;
  }

  return structuredClone(value) as ProvisioningQualification;
}

export function validateProvisioningRequest(
  value: unknown,
):
  | { ok: true; value: ProvisioningRequestInput }
  | { ok: false; result: ProvisioningResult } {
  if (
    !isRecord(value) ||
    !exactKeys(value, ["tenantRef", "blueprint", "qualification", "evidence"])
  ) {
    return {
      ok: false,
      result: provisioningFailure(
        "invalid_request",
        "Provisioning request must contain only tenantRef, blueprint, qualification and evidence.",
      ),
    };
  }
  if (typeof value.tenantRef !== "string" || !TENANT_REF.test(value.tenantRef)) {
    return {
      ok: false,
      result: provisioningFailure(
        "invalid_request",
        "Provisioning tenant reference is invalid.",
      ),
    };
  }

  const blueprint = validateAgentBlueprintV1(value.blueprint);
  if (!blueprint.ok) {
    return {
      ok: false,
      result: provisioningFailure(
        "invalid_blueprint",
        "AgentBlueprint v1 validation failed.",
      ),
    };
  }
  if (blueprint.value.lifecycle.stage !== "sandbox_passed") {
    return {
      ok: false,
      result: provisioningFailure(
        "invalid_blueprint",
        "Only a sandbox_passed AgentBlueprint can enter provisioning.",
      ),
    };
  }

  const qualification = validateQualification(value.qualification);
  if (!qualification || !isRecord(value.evidence)) {
    return {
      ok: false,
      result: provisioningFailure(
        "qualification_required",
        "Complete companion sandbox qualification evidence is required.",
      ),
    };
  }

  const evidence = value.evidence as Record<string, unknown>;
  if (!exactKeys(evidence, ["review", "session", "test"])) {
    return {
      ok: false,
      result: provisioningFailure(
        "qualification_required",
        "Provisioning evidence shape is invalid.",
      ),
    };
  }

  try {
    const canonical = qualifyAgentSandbox({
      review: evidence.review as Parameters<typeof qualifyAgentSandbox>[0]["review"],
      source: "companion",
      session: evidence.session as Parameters<typeof qualifyAgentSandbox>[0]["session"],
      test: evidence.test as Parameters<typeof qualifyAgentSandbox>[0]["test"],
    });
    if (
      stableProvisioningJson(canonical.blueprint) !==
        stableProvisioningJson(blueprint.value) ||
      stableProvisioningJson(canonical.record) !==
        stableProvisioningJson(qualification)
    ) {
      return {
        ok: false,
        result: provisioningFailure(
          "qualification_required",
          "Sandbox qualification does not match the supplied AgentBlueprint.",
        ),
      };
    }
  } catch {
    return {
      ok: false,
      result: provisioningFailure(
        "qualification_required",
        "Sandbox qualification could not be recomputed from the supplied evidence.",
      ),
    };
  }

  return {
    ok: true,
    value: {
      tenantRef: value.tenantRef,
      blueprint: blueprint.value,
      qualification,
      evidence: {
        review: evidence.review as ProvisioningRequestInput["evidence"]["review"],
        session: evidence.session as ProvisioningRequestInput["evidence"]["session"],
        test: evidence.test as ProvisioningRequestInput["evidence"]["test"],
      },
    },
  };
}

function advanceToProvisioning(
  blueprint: AgentBlueprintV1,
): AgentBlueprintV1 {
  const next = structuredClone(blueprint);
  next.lifecycle = { stage: "provisioning" };
  const validated = validateAgentBlueprintV1(next);
  if (!validated.ok) {
    throw new Error("Provisioning lifecycle transition produced an invalid blueprint.");
  }
  return validated.value;
}

function publicReceipt(
  record: {
    id: string;
    tenantRef: string;
    status: "provisioning";
    createdAt: string;
  },
  replayed: boolean,
): ProvisioningPublicReceipt {
  return {
    provisioningId: record.id,
    tenantRef: record.tenantRef,
    status: "provisioning",
    blueprintStage: "provisioning",
    createdAt: record.createdAt,
    replayed,
  };
}

export function provisionAgent(input: {
  request: unknown;
  principal: ProvisioningPrincipal;
  idempotencyKey: string;
  store: ProvisioningStore;
  now?: () => Date;
}): ProvisioningResult {
  const parsed = validateProvisioningRequest(input.request);
  if (!parsed.ok) return parsed.result;

  if (!input.principal.tenantRefs.includes(parsed.value.tenantRef)) {
    return provisioningFailure(
      "tenant_forbidden",
      "Authenticated principal is not authorised for this tenant.",
    );
  }

  const hash = requestHash(parsed.value);
  const scope = [
    input.principal.id,
    parsed.value.tenantRef,
    input.idempotencyKey,
  ].join(":");
  const existing = input.store.getIdempotency(scope);
  if (existing) {
    if (existing.requestHash !== hash) {
      return provisioningFailure(
        "idempotency_conflict",
        "Idempotency key was already used for different provisioning content.",
      );
    }
    return {
      ok: true,
      data: publicReceipt(existing.record, true),
    };
  }

  const createdAt = (input.now ?? (() => new Date()))().toISOString();
  const id =
    "prv_" +
    createHash("sha256")
      .update(scope + ":" + hash)
      .digest("hex")
      .slice(0, 24);
  const record = {
    id,
    tenantRef: parsed.value.tenantRef,
    principalId: input.principal.id,
    idempotencyKey: input.idempotencyKey,
    requestHash: hash,
    createdAt,
    status: "provisioning" as const,
    blueprint: advanceToProvisioning(parsed.value.blueprint),
    qualification: parsed.value.qualification,
  };

  input.store.putIdempotency(scope, { requestHash: hash, record });

  return {
    ok: true,
    data: publicReceipt(record, false),
  };
}
