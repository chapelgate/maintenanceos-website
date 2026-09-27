import {
  type AgentBlueprintV1,
  type AgentCapability,
  validateAgentBlueprintV1,
} from "./agent-blueprint.ts";
import {
  FIELD_META_SOURCE_LABELS,
  type DraftFieldMeta,
  type ScanBusinessFactKey,
  type ScanBusinessFactMeta,
  type ScanDraftFieldMeta,
} from "./onboarding-create.ts";

export const AGENT_REVIEW_VERSION = "1.0.0" as const;

export type AgentReviewRequirementKind =
  | "mandatory"
  | "low_confidence"
  | "consequential";

export type AgentReviewRequirement = {
  id: string;
  kind: AgentReviewRequirementKind;
  title: string;
  detail: string;
};

export type AgentReviewRecord = {
  version: typeof AGENT_REVIEW_VERSION;
  revisionId: string;
  complete: boolean;
  requiredIds: string[];
  confirmedIds: string[];
  missingIds: string[];
};

export type ReviewedIdentityDraft = {
  locations: string;
  phone: string;
  email: string;
};

export type AgentReviewSubject = {
  blueprint: AgentBlueprintV1;
  knowledgePack: unknown;
  systemPrompt: string;
};

function stableReviewJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }
  if (Array.isArray(value)) {
    return "[" + value.map(stableReviewJson).join(",") + "]";
  }
  const record = value as Record<string, unknown>;
  const entries = Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => JSON.stringify(key) + ":" + stableReviewJson(record[key]));
  return "{" + entries.join(",") + "}";
}

function fnv1a32(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function agentReviewRevision(subject: AgentReviewSubject): string {
  const blueprint = validateBlueprint(subject.blueprint);
  const canonical = stableReviewJson({
    blueprint: {
      ...blueprint,
      // Review evidence follows the configuration across draft -> reviewed.
      lifecycle: { stage: "draft" },
    },
    knowledgePack: subject.knowledgePack,
    systemPrompt: subject.systemPrompt,
  });
  return "arv1_" + fnv1a32(canonical);
}


const CONSEQUENTIAL_CAPABILITIES = new Set<AgentCapability>([
  "create_maintenance_job",
  "check_calendar",
  "book_appointment",
  "send_email",
  "send_sms",
  "transfer_call",
]);

const FACT_LABELS: Record<ScanBusinessFactKey, string> = {
  website: "website",
  businessName: "business name",
  locations: "locations",
  contact: "contact details",
  services: "services",
  hours: "opening hours",
  faqs: "FAQs",
};

const DRAFT_FIELD_LABELS: Record<keyof ScanDraftFieldMeta, string> = {
  businessName: "business name",
  greeting: "greeting",
  hours: "opening hours",
  services: "services",
  faqs: "FAQs",
};

const CAPABILITY_LABELS: Partial<Record<AgentCapability, string>> = {
  create_maintenance_job: "create structured maintenance jobs",
  check_calendar: "check calendar availability",
  book_appointment: "book appointments",
  send_email: "send email",
  send_sms: "send SMS",
  transfer_call: "transfer calls",
};

function validateBlueprint(value: unknown): AgentBlueprintV1 {
  const validation = validateAgentBlueprintV1(value);
  if (!validation.ok) {
    throw new Error(
      "AgentBlueprint v1 validation failed: " + validation.errors.join("; "),
    );
  }
  return validation.value;
}

function uniqueRequirements(
  requirements: AgentReviewRequirement[],
): AgentReviewRequirement[] {
  const seen = new Set<string>();
  return requirements.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function reviewSourceLabel(source: string): string {
  if (source === "fetched_url") return "submitted website URL";
  return FIELD_META_SOURCE_LABELS[source] ?? source;
}

export function reviewFactHint(
  meta: DraftFieldMeta | undefined,
  hasValue: boolean,
): string | null {
  if (!meta || !hasValue) return null;
  const label = reviewSourceLabel(meta.source);
  if (meta.confidence === "low") {
    return `Source: ${label} — low confidence; explicit confirmation is required.`;
  }
  return `Source: ${label} — ${meta.confidence} confidence.`;
}

export function identityDraftFromBlueprint(
  blueprint: AgentBlueprintV1,
): ReviewedIdentityDraft {
  const trusted = validateBlueprint(blueprint);
  return {
    locations: trusted.identity.locations?.join("\n") ?? "",
    phone: trusted.identity.contact?.phone ?? "",
    email: trusted.identity.contact?.email ?? "",
  };
}

function normaliseLocations(value: string): string[] | undefined {
  const locations = value
    .split(/\r?\n/)
    .map((item) => item.trim().replace(/\s+/g, " "))
    .filter(Boolean);
  const unique = [...new Set(locations)].slice(0, 50);
  if (unique.some((item) => item.length > 300)) {
    throw new Error("Each reviewed location must be 300 characters or fewer.");
  }
  return unique.length ? unique : undefined;
}

export function applyReviewedIdentityToAgentBlueprint(
  blueprint: AgentBlueprintV1,
  draft: ReviewedIdentityDraft,
): AgentBlueprintV1 {
  const trusted = validateBlueprint(blueprint);
  const locations = normaliseLocations(draft.locations);
  const phone = draft.phone.trim();
  const email = draft.email.trim();

  if (phone.length > 50) {
    throw new Error("Reviewed phone number must be 50 characters or fewer.");
  }
  if (email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new Error("Reviewed email address is invalid.");
  }

  const next: AgentBlueprintV1 = {
    ...trusted,
    identity: {
      businessName: trusted.identity.businessName,
      website: trusted.identity.website,
      ...(locations ? { locations } : {}),
      ...(phone || email
        ? {
            contact: {
              ...(phone ? { phone } : {}),
              ...(email ? { email } : {}),
            },
          }
        : {}),
    },
    permissions: {
      allow: [...trusted.permissions.allow],
      deny: [...trusted.permissions.deny],
    },
    rules: {
      ...trusted.rules,
      forbiddenActions: [...trusted.rules.forbiddenActions],
    },
    integrations: trusted.integrations.map((item) => ({ ...item })),
    privacy: { ...trusted.privacy },
  };

  return validateBlueprint(next);
}

export function buildAgentReviewRequirements(input: {
  blueprint: AgentBlueprintV1;
  factMeta?: ScanBusinessFactMeta;
  fieldMeta?: ScanDraftFieldMeta;
  missing?: string[];
}): AgentReviewRequirement[] {
  const blueprint = validateBlueprint(input.blueprint);
  const businessNameMeta = input.fieldMeta?.businessName;
  const websiteMeta = input.factMeta?.website;
  const requirements: AgentReviewRequirement[] = [
    {
      id: "fact:businessName",
      kind:
        businessNameMeta?.confidence === "low" ? "low_confidence" : "mandatory",
      title: "Confirm business name",
      detail:
        businessNameMeta?.confidence === "low"
          ? "The scanner marked the business name as low confidence from " +
            reviewSourceLabel(businessNameMeta.source) +
            ". Check or edit it before confirming."
          : "Confirm the reviewed business name is correct.",
    },
    {
      id: "fact:website",
      kind: websiteMeta?.confidence === "low" ? "low_confidence" : "mandatory",
      title: "Confirm website",
      detail:
        websiteMeta?.confidence === "low"
          ? "The scanner marked the website as low confidence from " +
            reviewSourceLabel(websiteMeta.source) +
            ". Check it before confirming."
          : "Confirm this is the correct business website.",
    },
    {
      id: "control:role",
      kind: "mandatory",
      title: "Confirm agent role",
      detail:
        "Confirm this is the intended role: " +
        blueprint.agent.type.replaceAll("_", " ") +
        ".",
    },
    {
      id: "control:ai_output",
      kind: "mandatory",
      title: "Confirm generated AI output",
      detail:
        "Review the generated knowledge pack and prompt content before this configuration can move beyond review.",
    },
  ];

  for (const key of ["locations", "contact"] as const) {
    const meta = input.factMeta?.[key];
    if (!meta || meta.confidence !== "low") continue;
    requirements.push({
      id: "fact:" + key,
      kind: "low_confidence",
      title: "Confirm " + FACT_LABELS[key],
      detail:
        "The scanner marked this as low confidence from " +
        reviewSourceLabel(meta.source) +
        ". Check or edit it before confirming.",
    });
  }

  for (const [key, meta] of Object.entries(input.fieldMeta ?? {}) as Array<
    [keyof ScanDraftFieldMeta, NonNullable<ScanDraftFieldMeta[keyof ScanDraftFieldMeta]>]
  >) {
    if (meta.confidence !== "low" || key === "businessName") continue;
    requirements.push({
      id: "field:" + String(key),
      kind: "low_confidence",
      title: "Confirm " + DRAFT_FIELD_LABELS[key],
      detail:
        "The scanner marked this as low confidence from " +
        reviewSourceLabel(meta.source) +
        ". Check or edit it before confirming.",
    });
  }

  const missingSet = new Set((input.missing ?? []).filter(Boolean));
  if (!blueprint.identity.locations?.length) missingSet.add("locations");
  if (!blueprint.identity.contact?.phone && !blueprint.identity.contact?.email) {
    missingSet.add("contact details");
  }
  const missing = [...missingSet];
  if (missing.length) {
    requirements.push({
      id: "control:missing_data",
      kind: "mandatory",
      title: "Confirm missing information",
      detail:
        "These facts are not on file and will stay missing: " + missing.join(", ") + ".",
    });
  }

  for (const capability of blueprint.permissions.allow) {
    if (!CONSEQUENTIAL_CAPABILITIES.has(capability)) continue;
    requirements.push({
      id: "capability:" + capability,
      kind: "consequential",
      title: "Confirm capability",
      detail:
        "The blueprint allows this capability: " +
        (CAPABILITY_LABELS[capability] ?? capability.replaceAll("_", " ")) +
        ". This does not mean a live connector or phone service is active.",
    });
  }

  if (blueprint.rules.humanTransfer !== "disabled") {
    requirements.push({
      id: "rule:human_transfer",
      kind: "consequential",
      title: "Confirm human-transfer policy",
      detail:
        "Blueprint human-transfer policy is " +
        blueprint.rules.humanTransfer.replaceAll("_", " ") +
        ". No live telephony is activated by this review.",
    });
  }

  for (const integration of blueprint.integrations) {
    if (!integration.enabled) continue;
    requirements.push({
      id: "integration:" + integration.kind,
      kind: "consequential",
      title: "Confirm enabled integration",
      detail: "The " + integration.kind + " integration is enabled.",
    });
  }

  if (
    blueprint.privacy.recordCalls ||
    blueprint.privacy.transcribeCalls ||
    blueprint.privacy.retentionDays > 0
  ) {
    requirements.push({
      id: "privacy:call_data",
      kind: "consequential",
      title: "Confirm call-data settings",
      detail:
        "Call privacy settings include recording=" +
        String(blueprint.privacy.recordCalls) +
        ", transcription=" +
        String(blueprint.privacy.transcribeCalls) +
        ", retentionDays=" +
        String(blueprint.privacy.retentionDays) +
        ".",
    });
  }

  return uniqueRequirements(requirements);
}

export function finalizeAgentReview(input: {
  blueprint: AgentBlueprintV1;
  knowledgePack: unknown;
  systemPrompt: string;
  factMeta?: ScanBusinessFactMeta;
  fieldMeta?: ScanDraftFieldMeta;
  missing?: string[];
  record: AgentReviewRecord;
}): AgentBlueprintV1 {
  const trusted = validateBlueprint(input.blueprint);
  const requirements = buildAgentReviewRequirements({
    blueprint: trusted,
    factMeta: input.factMeta,
    fieldMeta: input.fieldMeta,
    missing: input.missing,
  });
  const record = input.record;
  const revisionId = agentReviewRevision({
    blueprint: trusted,
    knowledgePack: input.knowledgePack,
    systemPrompt: input.systemPrompt,
  });
  const canonical = buildAgentReviewRecord(
    requirements,
    record.confirmedIds,
    revisionId,
  );
  const sameRevision = record.revisionId === canonical.revisionId;
  const sameRequired =
    JSON.stringify(record.requiredIds) === JSON.stringify(canonical.requiredIds);
  const sameConfirmed =
    JSON.stringify(record.confirmedIds) === JSON.stringify(canonical.confirmedIds);
  const sameMissing =
    JSON.stringify(record.missingIds) === JSON.stringify(canonical.missingIds);
  const complete =
    record.version === AGENT_REVIEW_VERSION &&
    record.complete === true &&
    canonical.complete &&
    sameRevision &&
    sameRequired &&
    sameConfirmed &&
    sameMissing;

  if (!complete) {
    throw new Error(
      "Agent review is incomplete or inconsistent; lifecycle cannot advance to reviewed.",
    );
  }

  return validateBlueprint({
    ...trusted,
    permissions: {
      allow: [...trusted.permissions.allow],
      deny: [...trusted.permissions.deny],
    },
    rules: {
      ...trusted.rules,
      forbiddenActions: [...trusted.rules.forbiddenActions],
    },
    integrations: trusted.integrations.map((item) => ({ ...item })),
    privacy: { ...trusted.privacy },
    lifecycle: { stage: "reviewed" },
  });
}

export function buildAgentReviewRecord(
  requirements: AgentReviewRequirement[],
  confirmedIds: readonly string[],
  revisionId: string,
): AgentReviewRecord {
  if (!/^arv1_[0-9a-f]{8}$/.test(revisionId)) {
    throw new Error("Agent review revision ID is invalid.");
  }
  const requiredIds = requirements.map((item) => item.id);
  const submitted = new Set(confirmedIds);
  const confirmed = requiredIds.filter((id) => submitted.has(id));
  const confirmedSet = new Set(confirmed);
  const missingIds = requiredIds.filter((id) => !confirmedSet.has(id));
  return {
    version: AGENT_REVIEW_VERSION,
    revisionId,
    complete: missingIds.length === 0,
    requiredIds,
    confirmedIds: confirmed,
    missingIds,
  };
}
