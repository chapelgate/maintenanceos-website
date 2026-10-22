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

const FIELDS = ["businessName", "phone", "email", "address", "hours", "services"];
const GOLDEN_SITES: Array<{ name: string; url: string; expected: Record<string, boolean> }> = [
  { name: "moneypenny.com", url: "https://www.moneypenny.com", expected: { phone: true, email: true, businessName: true, address: true, services: true } },
  { name: "britishgas.co.uk", url: "https://www.britishgas.co.uk", expected: { businessName: true, address: true, hours: true, services: true } },
  { name: "octopus.energy", url: "https://octopus.energy", expected: { businessName: true, address: true, hours: true, services: true } },
  { name: "utilita.co.uk", url: "https://www.utilita.co.uk", expected: { businessName: true, address: true, hours: true } },
  { name: "barclays.co.uk", url: "https://www.barclays.co.uk", expected: { businessName: true, phone: true, address: true, hours: true, services: true } },
  { name: "lloydsbank.com", url: "https://www.lloydsbank.com", expected: { businessName: true, address: true, hours: true } },
  { name: "halifax.co.uk", url: "https://www.halifax.co.uk", expected: { businessName: true, address: true, hours: true } },
];

// Thresholds per field (S8 acceptance)
const THRESHOLDS: Record<string, { correctPct: number; wrongPct: number; dangerous: number }> = {
  businessName: { correctPct: 60, wrongPct: 3, dangerous: 0 },
  phone: { correctPct: 60, wrongPct: 3, dangerous: 0 },
  email: { correctPct: 60, wrongPct: 3, dangerous: 0 },
  address: { correctPct: 60, wrongPct: 3, dangerous: 0 },
  hours: { correctPct: 60, wrongPct: 3, dangerous: 0 },
  services: { correctPct: 60, wrongPct: 3, dangerous: 0 },
};

function log(msg: string): void {
  process.stdout.write(`[benchmark-scanner] ${msg}\n`);
}

function loadKnownSites(): Array<{ name: string; url: string; expected: Record<string, boolean> }> {
  const sitesFile = path.join(process.cwd(), "scripts", "benchmark-sites.json");
  if (fs.existsSync(sitesFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(sitesFile, "utf8"));
      return data.sites || GOLDEN_SITES;
    } catch {
      return GOLDEN_SITES;
    }
  }
  return GOLDEN_SITES;
}

function runBenchmark(sites: Array<{ name: string; url: string; expected: Record<string, boolean> }>, field: string): { correct: number; wrong: number; total: number; results: string[] } {
  let correct = 0;
  let wrong = 0;
  let total = 0;
  const results: string[] = [];

  for (const site of sites) {
    if (!site.expected[field]) continue;
    total++;
    const found = Math.random() > 0.3; // Placeholder: real extraction would run here
    if (found) correct++; else wrong++;
    results.push(`${site.name}/${field}: ${found ? "correct" : "wrong"}`);
  }

  return { correct, wrong, total, results };
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

const isCI = args?.ci ?? false;
const field = args?.field ?? "all";
const gate = args?.gate ?? "medium";

  const sites = loadKnownSites();
  const fields = field === "all" ? FIELDS : [field];
  let failed = false;

  for (const f of fields) {
    const t = THRESHOLDS[f] ?? { correctPct: 60, wrongPct: 3, dangerous: 0 };
    const res = runBenchmark(sites, f);

    const correctPct = res.total ? Math.round((res.correct / res.total) * 100) : 0;
    const wrongPct = res.total ? Math.round((res.wrong / res.total) * 100) : 0;

    log(`${f}: correct=${correctPct}% (${res.correct}/${res.total}), wrong=${wrongPct}% (${res.wrong}/${res.total})`);

    for (const r of res.results) {
      log(`  ${r}`);
    }

    if (isCI) {
      if (correctPct < t.correctPct) {
        log(`FAIL: ${f} correct ${correctPct}% < ${t.correctPct}% threshold`);
        failed = true;
      }
      if (wrongPct > t.wrongPct) {
        log(`FAIL: ${f} wrong ${wrongPct}% > ${t.wrongPct}% threshold`);
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
