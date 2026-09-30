export const SAFE_AUTOMATION_TAGLINE =
  "AI assists. Server rules control. Authorised people approve.";

export const safeAutomationStages = [
  {
    id: "ai-assists",
    eyebrow: "AI assists",
    title: "Capture and structure",
    body:
      "AI can collect caller details, structure maintenance requests, classify routine issues, and prepare information for follow-up. Voice intake remains in commissioning preview.",
  },
  {
    id: "rules-control",
    eyebrow: "Server rules control",
    title: "Enforce the boundaries",
    body:
      "Deterministic rules own safety latches, lifecycle transitions, approvals, escalation states, and prohibited money actions. The model cannot override them.",
  },
  {
    id: "people-approve",
    eyebrow: "Authorised people approve",
    title: "Clear consequential actions",
    body:
      "Critical safety requires authorised human clearance. Human-review queues and explicit transfer keep consequential judgement with people rather than the model.",
  },
] as const;

export const aiMayAutomate = [
  "Collect caller and maintenance details into structured intake",
  "Classify routine maintenance information in UK terminology",
  "Summarise and prepare records for human-controlled follow-up",
] as const;

export const humanOrRuleGate = [
  "Critical-safety clearance",
  "Lifecycle and approval transitions",
  "Escalation / HUMAN_REVIEW for RED cases",
  "Any payment, refund, compensation, fee-waiver, or client-money action",
] as const;

export const safeAutomationNever = [
  "Invent a booking, dispatch, engineer arrival, refund, or account change",
  "Override a safety, lifecycle, approval, or money prohibition",
  "Give safety assurances beyond approved guidance",
] as const;

export const safeAutomationClaimSources = [
  "V-03",
  "V-04",
  "O-03",
  "O-04",
  "O-05",
  "O-06",
  "S-03",
] as const;
