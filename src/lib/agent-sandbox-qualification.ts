import { agentReviewRevision, finalizeAgentReview, type AgentReviewRecord } from "./agent-review.ts";
import {
  validateAgentBlueprintV1,
  type AgentBlueprintV1,
} from "./agent-blueprint.ts";
import type {
  ScanBusinessFactMeta,
  ScanDraftFieldMeta,
} from "./onboarding-create.ts";
import {
  runBrowserScriptedDemo,
  type SandboxSession,
  type SandboxTest,
} from "./sandbox-test-call.ts";

export const AGENT_SANDBOX_QUALIFICATION_VERSION =
  "agent_sandbox_qualification_v1" as const;

export type AgentSandboxSource = "companion" | "browser_mock";

export type AgentSandboxReviewSubject = {
  blueprint: AgentBlueprintV1;
  knowledgePack: unknown;
  systemPrompt: string;
  factMeta?: ScanBusinessFactMeta;
  fieldMeta?: ScanDraftFieldMeta;
  missing?: string[];
  reviewRecord: AgentReviewRecord;
};

export type AgentSandboxQualificationCheck = {
  id: string;
  ok: boolean;
};

export type AgentSandboxQualificationRecord = {
  version: typeof AGENT_SANDBOX_QUALIFICATION_VERSION;
  reviewRevisionId: string;
  source: AgentSandboxSource;
  sessionId: string;
  testId: string;
  complete: boolean;
  checks: AgentSandboxQualificationCheck[];
  failedCheckIds: string[];
};

export type AgentSandboxQualificationResult = {
  record: AgentSandboxQualificationRecord;
  blueprint: AgentBlueprintV1;
};

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }
  if (Array.isArray(value)) {
    return "[" + value.map(stableJson).join(",") + "]";
  }
  const record = value as Record<string, unknown>;
  return (
    "{" +
    Object.keys(record)
      .sort()
      .filter((key) => record[key] !== undefined)
      .map((key) => JSON.stringify(key) + ":" + stableJson(record[key]))
      .join(",") +
    "}"
  );
}

function validateBlueprint(value: unknown): AgentBlueprintV1 {
  const result = validateAgentBlueprintV1(value);
  if (!result.ok) {
    throw new Error(
      "AgentBlueprint v1 validation failed: " + result.errors.join("; "),
    );
  }
  return result.value;
}

function sameJson(left: unknown, right: unknown): boolean {
  return stableJson(left) === stableJson(right);
}

function reviewedBlueprintFor(subject: AgentSandboxReviewSubject): AgentBlueprintV1 {
  return finalizeAgentReview({
    blueprint: subject.blueprint,
    knowledgePack: subject.knowledgePack,
    systemPrompt: subject.systemPrompt,
    factMeta: subject.factMeta,
    fieldMeta: subject.fieldMeta,
    missing: subject.missing,
    record: subject.reviewRecord,
  });
}

export function buildAgentSandboxQualificationRecord(input: {
  reviewedBlueprint: AgentBlueprintV1;
  knowledgePack: unknown;
  systemPrompt: string;
  factMeta?: ScanBusinessFactMeta;
  fieldMeta?: ScanDraftFieldMeta;
  missing?: string[];
  reviewRecord: AgentReviewRecord;
  source: AgentSandboxSource;
  session: SandboxSession;
  test: SandboxTest;
}): AgentSandboxQualificationRecord {
  const reviewed = validateBlueprint(input.reviewedBlueprint);
  const expectedRevision = agentReviewRevision({
    blueprint: reviewed,
    knowledgePack: input.knowledgePack,
    systemPrompt: input.systemPrompt,
    factMeta: input.factMeta,
    fieldMeta: input.fieldMeta,
    missing: input.missing,
  });
  const expectedTurns = runBrowserScriptedDemo(
    input.knowledgePack,
    input.systemPrompt,
  );

  const checks: AgentSandboxQualificationCheck[] = [
    {
      id: "lifecycle_reviewed",
      ok: reviewed.lifecycle.stage === "reviewed",
    },
    {
      id: "review_revision_current",
      ok:
        input.reviewRecord.complete === true &&
        input.reviewRecord.revisionId === expectedRevision,
    },
    {
      id: "companion_boundary",
      ok: input.source === "companion",
    },
    {
      id: "sandbox_session_only",
      ok:
        input.session.kind === "sandbox" &&
        input.session.status === "ready" &&
        input.session.liveCall === false &&
        input.session.liveNumber === null,
    },
    {
      id: "session_exact_knowledge_pack",
      ok: sameJson(input.session.knowledgePack, input.knowledgePack),
    },
    {
      id: "session_exact_system_prompt",
      ok: input.session.systemPrompt === input.systemPrompt,
    },
    {
      id: "scripted_test_only",
      ok:
        input.test.mode === "scripted" &&
        input.test.status === "scripted_demo_complete" &&
        input.test.sessionId === input.session.id &&
        input.test.liveCall === false &&
        input.test.liveNumber === null,
    },
    {
      id: "scripted_transcript_exact",
      ok: sameJson(input.test.turns, expectedTurns),
    },
  ];
  const failedCheckIds = checks.filter((check) => !check.ok).map((check) => check.id);

  return {
    version: AGENT_SANDBOX_QUALIFICATION_VERSION,
    reviewRevisionId: expectedRevision,
    source: input.source,
    sessionId: input.session.id,
    testId: input.test.id,
    complete: failedCheckIds.length === 0,
    checks,
    failedCheckIds,
  };
}

export function finalizeAgentSandboxQualification(input: {
  reviewedBlueprint: AgentBlueprintV1;
  knowledgePack: unknown;
  systemPrompt: string;
  factMeta?: ScanBusinessFactMeta;
  fieldMeta?: ScanDraftFieldMeta;
  missing?: string[];
  reviewRecord: AgentReviewRecord;
  source: AgentSandboxSource;
  session: SandboxSession;
  test: SandboxTest;
  record: AgentSandboxQualificationRecord;
}): AgentBlueprintV1 {
  const reviewed = validateBlueprint(input.reviewedBlueprint);
  if (reviewed.lifecycle.stage !== "reviewed") {
    throw new Error(
      "Only a reviewed AgentBlueprint can advance through sandbox qualification.",
    );
  }
  const canonical = buildAgentSandboxQualificationRecord({
    reviewedBlueprint: reviewed,
    knowledgePack: input.knowledgePack,
    systemPrompt: input.systemPrompt,
    factMeta: input.factMeta,
    fieldMeta: input.fieldMeta,
    missing: input.missing,
    reviewRecord: input.reviewRecord,
    source: input.source,
    session: input.session,
    test: input.test,
  });
  if (!canonical.complete || !sameJson(input.record, canonical)) {
    throw new Error(
      "Sandbox qualification is incomplete or inconsistent; lifecycle cannot advance to sandbox_passed.",
    );
  }

  return validateBlueprint({
    ...reviewed,
    permissions: {
      allow: [...reviewed.permissions.allow],
      deny: [...reviewed.permissions.deny],
    },
    rules: {
      ...reviewed.rules,
      forbiddenActions: [...reviewed.rules.forbiddenActions],
    },
    integrations: reviewed.integrations.map((item) => ({ ...item })),
    privacy: { ...reviewed.privacy },
    lifecycle: { stage: "sandbox_passed" },
  });
}

export function qualifyAgentSandbox(input: {
  review: AgentSandboxReviewSubject;
  source: AgentSandboxSource;
  session: SandboxSession;
  test: SandboxTest;
}): AgentSandboxQualificationResult {
  const reviewedBlueprint = reviewedBlueprintFor(input.review);
  const record = buildAgentSandboxQualificationRecord({
    reviewedBlueprint,
    knowledgePack: input.review.knowledgePack,
    systemPrompt: input.review.systemPrompt,
    factMeta: input.review.factMeta,
    fieldMeta: input.review.fieldMeta,
    missing: input.review.missing,
    reviewRecord: input.review.reviewRecord,
    source: input.source,
    session: input.session,
    test: input.test,
  });
  const blueprint = finalizeAgentSandboxQualification({
    reviewedBlueprint,
    knowledgePack: input.review.knowledgePack,
    systemPrompt: input.review.systemPrompt,
    factMeta: input.review.factMeta,
    fieldMeta: input.review.fieldMeta,
    missing: input.review.missing,
    reviewRecord: input.review.reviewRecord,
    source: input.source,
    session: input.session,
    test: input.test,
    record,
  });
  return { record, blueprint };
}

export function qualificationMatchesReview(
  result: AgentSandboxQualificationResult | null | undefined,
  reviewRevisionId: string,
): result is AgentSandboxQualificationResult {
  if (!result || !result.record.complete) return false;
  if (result.record.reviewRevisionId !== reviewRevisionId) return false;
  if (result.record.source !== "companion") return false;
  const blueprint = validateAgentBlueprintV1(result.blueprint);
  return blueprint.ok && blueprint.value.lifecycle.stage === "sandbox_passed";
}
