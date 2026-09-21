#!/usr/bin/env node
/**
 * Health smoke for the local Fonio companion stack.
 * Prints PASS/FAIL/SKIP per process. Exit 1 if any required check fails.
 *
 *   node scripts/fonio-local-smoke.mjs
 *   node scripts/fonio-local-smoke.mjs --no-dashboard
 *   node scripts/fonio-local-smoke.mjs --form-stub
 *
 * /health is 200 even when companion flags are OFF. This script also asserts
 * the local-e2e flags are ON (and that sandbox/calendar/dashboard deny telephony).
 */
const DEFAULT_TIMEOUT_MS = 2500;

/** Ports and service names from package READMEs / server.ts (do not invent). */
export const COMPANIONS = [
  {
    id: "onboarding-scan",
    required: true,
    url: "http://127.0.0.1:8788/health",
    service: "maintenanceos-onboarding-scan",
    expect: { ok: true, ingestEnabled: true, sandboxCall: false },
  },
  {
    id: "calendar-adapters",
    required: true,
    url: "http://127.0.0.1:8789/health",
    service: "maintenanceos-calendar-adapters",
    expect: { ok: true, adaptersEnabled: true, telephony: false },
  },
  {
    id: "sandbox-test-call",
    required: true,
    url: "http://127.0.0.1:8790/health",
    service: "maintenanceos-sandbox-test-call",
    expect: { ok: true, sandboxEnabled: true, telephony: false, liveCall: false },
  },
  {
    id: "customer-dashboard",
    required: false,
    url: "http://127.0.0.1:8791/health",
    service: "maintenanceos-customer-dashboard",
    expect: { ok: true, dashboardEnabled: true, telephony: false },
  },
  {
    id: "form-stub",
    required: false,
    url: "http://127.0.0.1:8787/health",
    service: "maintenanceos-form-stub",
    expect: { ok: true, sends_email: false },
  },
];

export function parseSmokeArgs(argv) {
  const options = {
    dashboard: true,
    formStub: false,
    only: /** @type {string | null} */ (null),
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--no-dashboard" || arg === "--core") options.dashboard = false;
    else if (arg === "--dashboard") options.dashboard = true;
    else if (arg === "--form-stub") options.formStub = true;
    else if (arg === "--only") {
      options.only = argv[i + 1] ?? "";
      i += 1;
    } else if (arg === "--timeout-ms") {
      options.timeoutMs = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "-h" || arg === "--help") options.help = true;
    else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

export function selectCompanions(options) {
  if (options.only) {
    const found = COMPANIONS.filter((item) => item.id === options.only);
    if (found.length === 0) {
      throw new Error(`Unknown companion id: ${options.only}`);
    }
    return found.map((item) => ({ ...item, required: true }));
  }
  return COMPANIONS.map((item) => {
    if (item.id === "customer-dashboard") {
      return { ...item, required: Boolean(options.dashboard) };
    }
    if (item.id === "form-stub") {
      return { ...item, required: Boolean(options.formStub) };
    }
    return { ...item };
  }).filter((item) => {
    if (item.id === "customer-dashboard") return options.dashboard || item.required;
    if (item.id === "form-stub") return options.formStub;
    return true;
  });
}

/**
 * @param {{ companion: (typeof COMPANIONS)[number], status?: number, json?: unknown, error?: string }} input
 */
export function evaluateHealth(input) {
  const { companion, status, json, error } = input;
  if (error) {
    if (!companion.required) {
      return { result: "SKIP", detail: error };
    }
    return { result: "FAIL", detail: error };
  }
  if (status !== 200) {
    return {
      result: "FAIL",
      detail: `HTTP ${status} (expected 200)`,
    };
  }
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return { result: "FAIL", detail: "response was not a JSON object" };
  }
  const body = /** @type {Record<string, unknown>} */ (json);
  if (companion.service && body.service !== companion.service) {
    return {
      result: "FAIL",
      detail: `service=${JSON.stringify(body.service)} (expected ${companion.service})`,
    };
  }
  for (const [key, expected] of Object.entries(companion.expect)) {
    if (body[key] !== expected) {
      return {
        result: "FAIL",
        detail: `${key}=${JSON.stringify(body[key])} (expected ${JSON.stringify(expected)}; /health is 200 even when flags are off)`,
      };
    }
  }
  return { result: "PASS", detail: summarize(body, companion.expect) };
}

function summarize(body, expect) {
  return Object.keys(expect)
    .map((key) => `${key}=${JSON.stringify(body[key])}`)
    .join(" ");
}

export async function fetchHealth(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const text = await res.text();
    let json = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }
    return { status: res.status, json };
  } catch (err) {
    const name = err && typeof err === "object" && "name" in err ? err.name : "";
    if (name === "AbortError") {
      return { error: `timeout after ${timeoutMs}ms` };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { error: message };
  } finally {
    clearTimeout(timer);
  }
}

export async function runSmoke(options, fetchFn = fetchHealth) {
  const selected = selectCompanions(options);
  const rows = [];
  for (const companion of selected) {
    const fetched = await fetchFn(companion.url, options.timeoutMs);
    const evaluated = evaluateHealth({ companion, ...fetched });
    rows.push({
      id: companion.id,
      url: companion.url,
      required: companion.required,
      ...evaluated,
    });
  }
  const failed = rows.filter((row) => row.result === "FAIL");
  return { ok: failed.length === 0, rows };
}

export function formatSmokeReport(rows) {
  const width = Math.max(...rows.map((row) => row.id.length), 8);
  return rows
    .map((row) => {
      const tag = row.result.padEnd(4, " ");
      return `${tag}  ${row.id.padEnd(width, " ")}  ${row.url}  ${row.detail}`;
    })
    .join("\n");
}

function printHelp() {
  console.log(`Usage: node scripts/fonio-local-smoke.mjs [options]

  --dashboard       Require customer-dashboard /health with flags ON (default)
  --no-dashboard    Skip dashboard (core scan + calendar + sandbox only)
  --form-stub       Also require form-stub /health (sends_email=false)
  --only <id>       Check one companion from: ${COMPANIONS.map((c) => c.id).join(", ")}
  --timeout-ms <n>  Per-request timeout (default ${DEFAULT_TIMEOUT_MS})

PASS requires HTTP 200 plus companion flags ON. This is not a live-call test.
`);
}

async function main(argv) {
  let options;
  try {
    options = parseSmokeArgs(argv);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    printHelp();
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    printHelp();
    return;
  }
  const { ok, rows } = await runSmoke(options);
  console.log(formatSmokeReport(rows));
  if (!ok) {
    console.error("\nFAIL: one or more required companions were unhealthy or still flagged off.");
    process.exitCode = 1;
  }
}

const entry = process.argv[1] ? process.argv[1].replace(/\\/g, "/") : "";
if (entry.endsWith("fonio-local-smoke.mjs")) {
  await main(process.argv.slice(2));
}
