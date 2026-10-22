#!/usr/bin/env node
/**
 * Scanner benchmark CI script.
 * Runs scanner field extraction against a defined test set and enforces accuracy thresholds.
 *
 * Usage: node scripts/benchmark-scanner.ts --ci [--field=<field>] [--sites=<sites>] [--gate=<gate>]
 *
 * Thresholds (S8 acceptance): correct ≥60%, wrong ≤3%, dangerous = 0
 */

import { parseArgs } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { extractDraftFromHtml } from "../packages/onboarding-ingest/src/extract.ts";

const FIELDS = ["businessName", "phone", "email", "address", "hours", "services"];

// Thresholds per field (S8 acceptance)
const THRESHOLDS: Record<string, { correctPct: number; wrongPct: number; dangerous: number }> = {
  businessName: { correctPct: 60, wrongPct: 3, dangerous: 0 },
  phone: { correctPct: 60, wrongPct: 3, dangerous: 0 },
  email: { correctPct: 60, wrongPct: 3, dangerous: 0 },
  address: { correctPct: 60, wrongPct: 3, dangerous: 0 },
  hours: { correctPct: 60, wrongPct: 3, dangerous: 0 },
  services: { correctPct: 60, wrongPct: 3, dangerous: 0 },
};

interface SiteConfig {
  name: string;
  url: string;
  fixture: string;
  expected: Record<string, string | string[] | null>;
}

function loadKnownSites(): SiteConfig[] {
  const sitesFile = path.join(process.cwd(), "scripts", "benchmark-sites.json");
  if (fs.existsSync(sitesFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(sitesFile, "utf8"));
      return data.sites || [];
    } catch {
      return [];
    }
  }
  return [];
}

function log(msg: string): void {
  process.stdout.write(`[benchmark-scanner] ${msg}\n`);
}

function normalizeValue(value: string | undefined): string {
  return (value || "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .trim()
    .toLowerCase();
}

function compareValues(expected: string | string[] | null, actual: string | string[] | undefined): "correct" | "wrong" | "missing" {
  if (!expected || expected === null) {
    return actual ? "wrong" : "correct";
  }
  if (!actual) {
    return "missing";
  }

  const expectedArr = Array.isArray(expected) ? expected : [expected];
  const actualArr = Array.isArray(actual) ? actual : [actual];

  const expectedNorm = expectedArr.map(normalizeValue).filter(Boolean);
  const actualNorm = actualArr.map(normalizeValue).filter(Boolean);

  if (expectedNorm.length === 0) {
    return actualNorm.length === 0 ? "correct" : "wrong";
  }

  // Check if any expected value is found in actual
  for (const exp of expectedNorm) {
    for (const act of actualNorm) {
      if (act.includes(exp) || exp.includes(act)) {
        return "correct";
      }
    }
  }

  return "wrong";
}

function runBenchmark(sites: SiteConfig[], field: string): { correct: number; wrong: number; missing: number; dangerous: number; total: number; results: string[] } {
  let correct = 0;
  let wrong = 0;
  let missing = 0;
  let dangerous = 0;
  let total = 0;
  const results: string[] = [];

  for (const site of sites) {
    const expected = site.expected[field];
    if (expected === undefined || expected === null) continue;
    total++;

    const fixturePath = path.join(process.cwd(), "scripts", "fixtures", site.fixture);
    if (!fs.existsSync(fixturePath)) {
      results.push(`${site.name}/${field}: FIXTURE MISSING`);
      missing++;
      continue;
    }

    const html = fs.readFileSync(fixturePath, "utf8");
    const result = extractDraftFromHtml([{ url: site.url, html }]);

    let actual: string | string[] | undefined;
    switch (field) {
      case "businessName":
        actual = result.draft.businessName || result.facts.businessName;
        break;
      case "phone":
        actual = result.facts.contact?.phones?.[0];
        break;
      case "email":
        actual = result.facts.contact?.emails?.[0];
        break;
      case "address":
        actual = result.facts.address;
        break;
      case "hours":
        actual = result.draft.hours || result.facts.hours;
        break;
      case "services":
        actual = result.draft.services
          ? result.draft.services.split("\n").map(s => s.trim()).filter(Boolean)
          : result.facts.services;
        break;
    }

    const comparison = compareValues(expected, actual);
    if (comparison === "correct") correct++;
    else if (comparison === "wrong") wrong++;
    else if (comparison === "missing") missing++;

    // Dangerous = wrong extraction that could cause harm (e.g., wrong phone number)
    if (comparison === "wrong" && (field === "phone" || field === "email" || field === "address")) {
      dangerous++;
    }

    results.push(`${site.name}/${field}: ${comparison} (expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)})`);
  }

  return { correct, wrong, missing, dangerous, total, results };
}

async function main(): Promise<void> {
  const parsed = parseArgs({
    options: {
      ci: { type: "boolean" },
      field: { type: "string" },
      sites: { type: "string" },
      gate: { type: "string" },
    },
  });

  const args = parsed.values;

  const isCI = args.ci ?? false;
  const field = args.field ?? "all";

  const sites = loadKnownSites();
  if (sites.length === 0) {
    log("ERROR: No benchmark sites configured. Create scripts/benchmark-sites.json");
    process.exit(1);
  }

  const fields = field === "all" ? FIELDS : [field];
  let failed = false;

  for (const f of fields) {
    const t = THRESHOLDS[f] ?? { correctPct: 60, wrongPct: 3, dangerous: 0 };
    const res = runBenchmark(sites, f);

    const correctPct = res.total ? Math.round((res.correct / res.total) * 100) : 0;
    const wrongPct = res.total ? Math.round((res.wrong / res.total) * 100) : 0;

    log(`${f}: correct=${correctPct}% (${res.correct}/${res.total}), wrong=${wrongPct}% (${res.wrong}/${res.total}), missing=${res.missing}/${res.total}, dangerous=${res.dangerous}`);

    for (const r of res.results) {
      log(`  ${r}`);
    }

    if (isCI) {
      if (res.total === 0) {
        log(`SKIP: ${f} no testable sites in fixtures`);
        continue;
      }
      if (correctPct < t.correctPct) {
        log(`FAIL: ${f} correct ${correctPct}% < ${t.correctPct}% threshold`);
        failed = true;
      }
      if (wrongPct > t.wrongPct) {
        log(`FAIL: ${f} wrong ${wrongPct}% > ${t.wrongPct}% threshold`);
        failed = true;
      }
      if (res.dangerous > t.dangerous) {
        log(`FAIL: ${f} dangerous ${res.dangerous} > ${t.dangerous} threshold`);
        failed = true;
      }
    }
  }

  if (isCI && failed) {
    log("Benchmark CI FAILED: thresholds not met");
    process.exit(1);
  }

  log("Benchmark CI PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
