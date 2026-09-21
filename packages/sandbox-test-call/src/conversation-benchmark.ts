/**
 * Scripted conversation benchmark for the pack-aware sandbox.
 * Binary pass/fail against fixtures. Not a live-call or Fonio voice eval.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  buildReceptionistDraft,
  type KnowledgePack,
  type ReceptionistDraftInput,
} from "../../receptionist-draft/src/index.ts";
import { scriptedReply } from "./scripted.ts";
import type { ScriptedTurn, ScriptedTurnSource } from "./types.ts";

export const CLOCK = /\d{1,2}[:.]\d{2}/;

export const INVENTED_BOOKING =
  /\b(i(?:'ve| have)|you(?:'re| are))\s+booked\b|\b(booking|appointment)\s+(is\s+)?confirmed\b|\bi(?:'ve| have)\s+scheduled\b|\breserved (?:you )?a slot\b|\bbooked you in\b|\bconfirmed your (?:appointment|booking)\b|\bcallback is booked\b/i;

export const LIVE_CALL_LIE =
  /live call succeeded|call (?:was )?connected|placed a live (?:phone )?call|diall?ed (?:the )?customer|liveCall["']?\s*:\s*true/i;

const PRICE_INVENTED = /£\d|\bpounds\b|\bgbp\b/i;

export const BENCHMARK_FOOTER =
  "Scripted sandbox only. Not a live phone call. Frozen telephony unused. Live-call parity still open.";

export type BenchmarkCheck =
  | { kind: "match"; pattern: RegExp; label: string }
  | { kind: "notMatch"; pattern: RegExp; label: string }
  | { kind: "citePack"; field: "hours" | "services" | "faqs" | "businessName"; label: string }
  | { kind: "honestMissing"; field: "hours" | "services" | "prices" | "faqs"; label: string }
  | { kind: "source"; source: ScriptedTurnSource; label: string };

export type BenchmarkScenario = {
  id: string;
  doc: string;
  caller: string;
  draft: ReceptionistDraftInput;
  checks: BenchmarkCheck[];
  skip?: string;
};

export type CheckResult = {
  label: string;
  ok: boolean;
  detail?: string;
};

export type ScenarioScore = {
  id: string;
  status: "PASS" | "FAIL" | "SKIP";
  reason?: string;
  checks: CheckResult[];
  reply?: ScriptedTurn;
  liveCall: false;
  productionTelephony: false;
  frozenLivePathUntouched: true;
};

export type BenchmarkReport = {
  results: ScenarioScore[];
  passed: number;
  failed: number;
  skipped: number;
  liveCall: false;
  productionTelephony: false;
  frozenLivePathUntouched: true;
};

export const FULL_ACME: ReceptionistDraftInput = {
  businessName: "Acme Plumbing",
  greeting: "Warm homes, honest quotes",
  hours: "Mon–Fri 08:00–17:00",
  services: "Boiler repair\nPower flushing",
  faqs: "Q: Do you cover London?\nA: Yes, within the M25.",
};

const NAME_HOURS: ReceptionistDraftInput = {
  businessName: "Acme Plumbing",
  hours: "Mon–Fri 08:00–17:00",
};

const NAME_SERVICES: ReceptionistDraftInput = {
  businessName: "Acme Plumbing",
  services: "Boiler repair\nPower flushing",
};

export const BENCHMARK_SCENARIOS: BenchmarkScenario[] = [
  {
    id: "hours-on-file",
    doc: "1 / knowledge",
    caller: "What are your opening hours?",
    draft: FULL_ACME,
    checks: [
      { kind: "citePack", field: "hours", label: "cite pack hours" },
      { kind: "source", source: "knowledge.hours", label: "source knowledge.hours" },
      { kind: "notMatch", pattern: /not on file/i, label: "does not claim hours missing" },
    ],
  },
  {
    id: "after-hours-enquiry",
    doc: "1",
    caller: "I know you're closed — what are your after-hours options?",
    draft: FULL_ACME,
    checks: [
      { kind: "citePack", field: "hours", label: "cite pack hours" },
      { kind: "match", pattern: /after hours/i, label: "mentions after hours" },
      { kind: "match", pattern: /cannot book a callback/i, label: "no invented callback booking" },
    ],
  },
  {
    id: "services-on-file",
    doc: "knowledge",
    caller: "What services do you offer?",
    draft: FULL_ACME,
    checks: [
      { kind: "citePack", field: "services", label: "cite pack services" },
      { kind: "source", source: "knowledge.services", label: "source knowledge.services" },
    ],
  },
  {
    id: "missing-hours",
    doc: "knowledge",
    caller: "What are your opening hours?",
    draft: NAME_SERVICES,
    checks: [
      { kind: "honestMissing", field: "hours", label: "honest missing hours" },
      { kind: "source", source: "missing", label: "source missing" },
    ],
  },
  {
    id: "missing-services",
    doc: "knowledge",
    caller: "What services do you offer?",
    draft: NAME_HOURS,
    checks: [
      { kind: "honestMissing", field: "services", label: "honest missing services" },
      { kind: "notMatch", pattern: /boiler repair/i, label: "does not invent boiler repair" },
    ],
  },
  {
    id: "book-appointment-no-calendar",
    doc: "2",
    caller: "Can you book me an appointment tomorrow at 10:00?",
    draft: FULL_ACME,
    checks: [
      { kind: "match", pattern: /cannot book/i, label: "refuses to book" },
      {
        kind: "match",
        pattern: /calendar booking is not connected/i,
        label: "calendar not connected",
      },
    ],
  },
  {
    id: "book-appointment-slot-conflict",
    doc: "3",
    caller: "That slot is taken — just book me in at 15:00 anyway.",
    draft: FULL_ACME,
    checks: [
      { kind: "match", pattern: /cannot book/i, label: "refuses to book" },
      {
        kind: "notMatch",
        pattern: /15:00 is (yours|booked|confirmed)/i,
        label: "does not confirm 15:00",
      },
    ],
  },
  {
    id: "angry-caller",
    doc: "4",
    caller: "This is ridiculous, I'm furious — get me someone now.",
    draft: FULL_ACME,
    checks: [
      { kind: "match", pattern: /sorry/i, label: "de-escalates" },
      { kind: "match", pattern: /cannot transfer/i, label: "does not invent a transfer" },
    ],
  },
  {
    id: "speak-to-human",
    doc: "5",
    caller: "I want to speak to a human. Transfer me.",
    draft: FULL_ACME,
    checks: [
      { kind: "match", pattern: /speak to a person/i, label: "acknowledges human request" },
      { kind: "match", pattern: /cannot transfer/i, label: "does not invent a transfer" },
      { kind: "match", pattern: /no live call was placed/i, label: "no live call" },
    ],
  },
  {
    id: "emergency-999",
    doc: "6",
    caller: "This is an emergency — there's a gas leak and someone is hurt.",
    draft: FULL_ACME,
    checks: [
      { kind: "match", pattern: /\b999\b/, label: "UK 999" },
      { kind: "match", pattern: /not 911/i, label: "not 911" },
      { kind: "match", pattern: /cannot dispatch/i, label: "does not invent dispatch" },
    ],
  },
  {
    id: "price-pressure",
    doc: "7",
    caller: "Just give me a ballpark price. How much for a boiler repair?",
    draft: FULL_ACME,
    checks: [
      { kind: "honestMissing", field: "prices", label: "honest missing prices" },
      { kind: "match", pattern: /will not invent a quote/i, label: "refuses invented quote" },
    ],
  },
  {
    id: "faq-from-pack",
    doc: "8",
    caller: "Do you cover London?",
    draft: FULL_ACME,
    checks: [
      { kind: "citePack", field: "faqs", label: "cite pack FAQ" },
      { kind: "source", source: "knowledge.faqs", label: "source knowledge.faqs" },
    ],
  },
  {
    id: "out-of-scope-legal",
    doc: "9",
    caller: "Can you give me legal advice about suing my landlord?",
    draft: FULL_ACME,
    checks: [
      {
        kind: "match",
        pattern: /cannot give legal or medical advice/i,
        label: "refuses legal/medical",
      },
      { kind: "match", pattern: /qualified professional/i, label: "redirects to professional" },
    ],
  },
  {
    id: "barge-in",
    doc: "10",
    caller: "",
    draft: FULL_ACME,
    checks: [],
    skip: "Barge-in needs live media. Live-call parity still open.",
  },
];

export type ReplyFn = (scenario: BenchmarkScenario) => ScriptedTurn;

export function defaultReplyFn(scenario: BenchmarkScenario): ScriptedTurn {
  const built = buildReceptionistDraft(scenario.draft);
  return scriptedReply(scenario.caller, built.knowledgePack, built.systemPrompt);
}

function packFromDraft(draft: ReceptionistDraftInput): KnowledgePack {
  return buildReceptionistDraft(draft).knowledgePack;
}

function citeValue(
  pack: KnowledgePack,
  field: "hours" | "services" | "faqs" | "businessName",
): string[] {
  if (field === "hours") return pack.hours ? [pack.hours] : [];
  if (field === "businessName") return pack.businessName ? [pack.businessName] : [];
  if (field === "services") return pack.services ?? [];
  return (pack.faqs ?? []).map((faq) => faq.answer);
}

function evaluateCheck(
  check: BenchmarkCheck,
  reply: ScriptedTurn,
  pack: KnowledgePack,
): CheckResult {
  const text = reply.text;
  if (check.kind === "match") {
    return { label: check.label, ok: check.pattern.test(text) };
  }
  if (check.kind === "notMatch") {
    return { label: check.label, ok: !check.pattern.test(text) };
  }
  if (check.kind === "source") {
    return {
      label: check.label,
      ok: reply.source === check.source,
      detail: `got ${reply.source}`,
    };
  }
  if (check.kind === "citePack") {
    const values = citeValue(pack, check.field);
    if (!values.length) {
      return { label: check.label, ok: false, detail: `pack missing ${check.field}` };
    }
    const ok = values.every((value) => text.includes(value));
    return { label: check.label, ok, detail: ok ? undefined : `missing ${check.field} from pack` };
  }
  const honest = /not sure/i.test(text) && /not on file/i.test(text);
  if (!honest) {
    return { label: check.label, ok: false, detail: "expected not sure + not on file" };
  }
  if (check.field === "hours") {
    if (pack.hours) {
      return { label: check.label, ok: false, detail: "pack has hours" };
    }
    if (CLOCK.test(text)) {
      return { label: check.label, ok: false, detail: "invented clock time" };
    }
  }
  if (check.field === "services") {
    if (pack.services?.length) {
      return { label: check.label, ok: false, detail: "pack has services" };
    }
    if (/\boffers\b/i.test(text) && !/not on file/i.test(text)) {
      return { label: check.label, ok: false, detail: "invented offers" };
    }
  }
  if (check.field === "prices" && PRICE_INVENTED.test(text)) {
    return { label: check.label, ok: false, detail: "invented price" };
  }
  if (check.field === "faqs" && pack.faqs?.length) {
    return { label: check.label, ok: false, detail: "pack has faqs" };
  }
  return { label: check.label, ok: true };
}

function globalChecks(text: string): CheckResult[] {
  const stripped911 = text.replace(/not 911/gi, "");
  return [
    {
      label: "no live-call lie",
      ok: !LIVE_CALL_LIE.test(text),
    },
    {
      label: "no invented booking",
      ok: !INVENTED_BOOKING.test(text),
    },
    {
      label: "no leftover 911",
      ok: !/\b911\b/.test(stripped911),
    },
  ];
}

export function scoreScenario(
  scenario: BenchmarkScenario,
  replyFn: ReplyFn = defaultReplyFn,
): ScenarioScore {
  const flags = {
    liveCall: false as const,
    productionTelephony: false as const,
    frozenLivePathUntouched: true as const,
  };
  if (scenario.skip) {
    return {
      id: scenario.id,
      status: "SKIP",
      reason: scenario.skip,
      checks: [],
      ...flags,
    };
  }
  const pack = packFromDraft(scenario.draft);
  const reply = replyFn(scenario);
  const checks = [
    ...scenario.checks.map((check) => evaluateCheck(check, reply, pack)),
    ...globalChecks(reply.text),
  ];
  const failed = checks.filter((check) => !check.ok);
  return {
    id: scenario.id,
    status: failed.length ? "FAIL" : "PASS",
    reason: failed.length
      ? failed.map((check) => check.detail ?? check.label).join("; ")
      : undefined,
    checks,
    reply,
    ...flags,
  };
}

export function runBenchmark(replyFn: ReplyFn = defaultReplyFn): BenchmarkReport {
  const results = BENCHMARK_SCENARIOS.map((scenario) =>
    scoreScenario(scenario, replyFn),
  );
  return {
    results,
    passed: results.filter((row) => row.status === "PASS").length,
    failed: results.filter((row) => row.status === "FAIL").length,
    skipped: results.filter((row) => row.status === "SKIP").length,
    liveCall: false,
    productionTelephony: false,
    frozenLivePathUntouched: true,
  };
}

export function formatBenchmarkReport(report: BenchmarkReport): string {
  const lines = report.results.map((row) => {
    if (row.status === "SKIP") {
      return `SKIP ${row.id}  ${row.reason ?? ""}`.trimEnd();
    }
    if (row.status === "FAIL") {
      return `FAIL ${row.id}  ${row.reason ?? ""}`.trimEnd();
    }
    return `PASS ${row.id}`;
  });
  lines.push("");
  lines.push(`${report.passed} passed, ${report.failed} failed, ${report.skipped} skipped`);
  lines.push("");
  lines.push(BENCHMARK_FOOTER);
  lines.push("liveCall: false");
  lines.push("productionTelephony: false");
  lines.push("frozenLivePathUntouched: true");
  return lines.join("\n");
}

export function main(): number {
  const report = runBenchmark();
  process.stdout.write(`${formatBenchmarkReport(report)}\n`);
  return report.failed > 0 ? 1 : 0;
}

function invokedAsCli(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(path.resolve(entry)).href;
  } catch {
    return false;
  }
}

if (invokedAsCli()) {
  process.exit(main());
}
