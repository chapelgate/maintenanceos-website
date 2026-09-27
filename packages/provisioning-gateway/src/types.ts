import type { AgentBlueprintV1 } from "../../../src/lib/agent-blueprint.ts";

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

export type ProvisioningRequestInput = {
  tenantRef: string;
  blueprint: AgentBlueprintV1;
  qualification: ProvisioningQualification;
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

export type ProvisioningErrorCode =
  | "gateway_disabled"
  | "auth_not_configured"
  | "authentication_failed"
  | "replay_detected"
  | "tenant_forbidden"
  | "invalid_request"
  | "invalid_blueprint"
  | "qualification_required"
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
  data: ProvisioningPublicReceipt;
};

export type ProvisioningResult = ProvisioningSuccess | ProvisioningFailure;

export type IdempotencyEntry = {
  requestHash: string;
  record: ProvisioningRecord;
};

export type ProvisioningStore = {
  claimNonce(scope: string, nonce: string, expiresAtMs: number, nowMs: number): boolean;
  getIdempotency(scope: string): IdempotencyEntry | undefined;
  putIdempotency(scope: string, entry: IdempotencyEntry): void;
  getProvisioning(id: string): ProvisioningRecord | undefined;
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
