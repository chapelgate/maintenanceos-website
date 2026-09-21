import assert from "node:assert/strict";
import test from "node:test";
import {
  BENCHMARK_FOOTER,
  BENCHMARK_SCENARIOS,
  formatBenchmarkReport,
  runBenchmark,
  scoreScenario,
  type BenchmarkScenario,
  type ReplyFn,
} from "./conversation-benchmark.ts";

function scenario(id: string): BenchmarkScenario {
  const found = BENCHMARK_SCENARIOS.find((row) => row.id === id);
  assert.ok(found, id);
  return found;
}

test("default scripted benchmark passes pack fixtures and skips barge-in", () => {
  const report = runBenchmark();
  assert.ok(report.passed >= 12, `expected >=12 PASS, got ${report.passed}`);
  assert.equal(report.failed, 0);
  assert.equal(report.skipped, 1);
  assert.equal(
    report.results.find((row) => row.id === "barge-in")?.status,
    "SKIP",
  );
  assert.equal(report.liveCall, false);
  assert.equal(report.productionTelephony, false);
  assert.equal(report.frozenLivePathUntouched, true);
  const printout = formatBenchmarkReport(report);
  assert.match(printout, /PASS hours-on-file/);
  assert.match(printout, /PASS emergency-999/);
  assert.match(printout, /SKIP barge-in/);
  assert.match(printout, new RegExp(BENCHMARK_FOOTER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(printout, /live call succeeded/i);
});

test("scorer fails invented clock time on missing hours", () => {
  const invented: ReplyFn = () => ({
    speaker: "receptionist",
    text: "We're open 09:00–17:00 every day.",
    source: "missing",
  });
  const scored = scoreScenario(scenario("missing-hours"), invented);
  assert.equal(scored.status, "FAIL");
  assert.match(
    scored.reason ?? "",
    /invented clock time|honest missing hours|expected not sure/,
  );

  const clockWhileHonest: ReplyFn = () => ({
    speaker: "receptionist",
    text: "I'm not sure — opening hours are not on file. Try 09:00–17:00.",
    source: "missing",
  });
  const clocked = scoreScenario(scenario("missing-hours"), clockWhileHonest);
  assert.equal(clocked.status, "FAIL");
  assert.match(clocked.reason ?? "", /invented clock time/);
});

test("scorer fails a live-call success lie even when hours are cited", () => {
  const lie: ReplyFn = () => ({
    speaker: "receptionist",
    text: "Acme Plumbing opening hours are Mon–Fri 08:00–17:00. Live call succeeded.",
    source: "knowledge.hours",
  });
  const scored = scoreScenario(scenario("hours-on-file"), lie);
  assert.equal(scored.status, "FAIL");
  assert.match(scored.reason ?? "", /no live-call lie/);
});

test("scorer fails an invented booking confirmation", () => {
  const lie: ReplyFn = () => ({
    speaker: "receptionist",
    text: "You're booked tomorrow at 10:00.",
    source: "script",
  });
  const scored = scoreScenario(scenario("book-appointment-no-calendar"), lie);
  assert.equal(scored.status, "FAIL");
  assert.match(scored.reason ?? "", /no invented booking|refuses to book/);
});
