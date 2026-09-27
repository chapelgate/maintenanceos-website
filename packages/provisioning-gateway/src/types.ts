import type { AgentBlueprintV1 } from "../../../src/lib/agent-blueprint.ts";
import type { AgentSandboxReviewSubject } from "../../../src/lib/agent-sandbox-qualification.ts";
import type {
  SandboxSession,
  SandboxTest,
} from "../../../src/lib/sandbox-test-call.ts";
import type {
  AdapterPreparation,
  PreparedAdapterBinding,
} from "../../agent-adapters/src/types.ts";

export const PROVISIONING_QUALIFICATION_VERSION =
  "agent_sandbox_qualification_v1" as const;

export const REQUIRED_QUALIFICATION_CHECKS = [
  "lifecycle_reviewed",
  "review_revision_current",
  "companion_boundary",
  "sandbox_session_only",
  "session_exact_knowledge_pack",
  "session_exact_system_prompt",
  "scripted_test_only",
  "scripted_transcript_exact",
] as const;

export type QualificationCheckId =
  (typeof REQUIRED_QUALIFICATION_CHECKS)[number];

export type ProvisioningQualification = {
  version: typeof PROVISIONING_QUALIFICATION_VERSION;
  reviewRevisionId: string;
  source: "companion";
  sessionId: string;
  testId: string;
  complete: true;
  checks: Array<{ id: QualificationCheckId; ok: true }>;
  failedCheckIds: [];
};

export type ProvisioningEvidence = {
  review: AgentSandboxReviewSubject;
  session: SandboxSession;
  test: SandboxTest;
};

export type ProvisioningRequestInput = {
  tenantRef: string;
  blueprint: AgentBlueprintV1;
  qualification: ProvisioningQualification;
  evidence: ProvisioningEvidence;
};

export type ProvisioningRecord = {
  id: string;
  tenantRef: string;
  principalId: string;
  idempotencyKey: string;
  requestHash: string;
  createdAt: string;
  status: "provisioning";
  blueprint: AgentBlueprintV1;
  qualification: ProvisioningQualification;
};

export type ProvisioningPublicReceipt = {
  provisioningId: string;
  tenantRef: string;
  status: "provisioning";
  blueprintStage: "provisioning";
  createdAt: string;
  replayed: boolean;
};

export type AdapterPreparationRequestInput = {
  provisioningId: string;
  connectorRefs: string[];
};

export type AdapterPreparationRecord = {
  provisioningId: string;
  tenantRef: string;
  principalId: string;
  idempotencyKey: string;
  requestHash: string;
  preparedAt: string;
  status: "ready";
  preparation: AdapterPreparation;
};

export type AdapterPreparationPublicReceipt = {
  provisioningId: string;
  tenantRef: string;
  status: "ready";
  blueprintStage: "ready";
  preparedAt: string;
  replayed: boolean;
  activationRequired: true;
  connectors: Array<
    Pick<PreparedAdapterBinding, "kind" | "connectorRef" | "provider">
  >;
};

export type ProvisioningErrorCode =
  | "gateway_disabled"
  | "auth_not_configured"
  | "authentication_failed"
  | "replay_detected"
  | "tenant_forbidden"
  | "invalid_request"
  | "invalid_blueprint"
  | "qualification_required"
  | "provisioning_not_found"
  | "adapter_not_configured"
  | "idempotency_conflict"
  | "payload_too_large"
  | "browser_origin_forbidden"
  | "rate_limited"
  | "internal_error";

export type ProvisioningFailure = {
  ok: false;
  error: ProvisioningErrorCode;
  message: string;
};

export type ProvisioningSuccess = {
  ok: true;
  data: ProvisioningPublicReceipt | AdapterPreparationPublicReceipt;
};

export type ProvisioningResult = ProvisioningSuccess | ProvisioningFailure;

export type IdempotencyEntry = {
  requestHash: string;
  record: ProvisioningRecord;
};

export type AdapterIdempotencyEntry = {
  requestHash: string;
  record: AdapterPreparationRecord;
};

export type ProvisioningStore = {
  claimNonce(scope: string, nonce: string, expiresAtMs: number, nowMs: number): boolean;
  getIdempotency(scope: string): IdempotencyEntry | undefined;
  putIdempotency(scope: string, entry: IdempotencyEntry): void;
  getProvisioning(id: string): ProvisioningRecord | undefined;
  getAdapterIdempotency(scope: string): AdapterIdempotencyEntry | undefined;
  putAdapterIdempotency(scope: string, entry: AdapterIdempotencyEntry): void;
  getAdapterPreparation(provisioningId: string): AdapterPreparationRecord | undefined;
};

export type ProvisioningPrincipal = {
  id: string;
  keyId: string;
  secret: string;
  tenantRefs: string[];
};

export function provisioningFailure(
  error: ProvisioningErrorCode,
  message: string,
): ProvisioningFailure {
  return { ok: false, error, message };
}
