import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  FileScannerV2JobStore,
  runScannerV2Pipeline,
} from "../packages/onboarding-ingest/src/index.ts";

const releaseSha = process.env.STAGE12_RELEASE_SHA?.trim();
assert.ok(releaseSha, "STAGE12_RELEASE_SHA is required");

const cases = [
  {
    name: "Alley Gates",
    origin: "https://alleygates.co.uk/",
    questions: [
      { question: "What services do you offer?", expectedAny: ["alley gate", "cctv", "security fencing"] },
      { question: "How do I order replacement alley gate keys?", expectedAny: ["key"] },
      { question: "Do you provide CCTV?", expectedAny: ["cctv"] },
      { question: "Do you provide security fencing?", expectedAny: ["security fencing"] },
      { question: "How long can replacement keys take?", expectedAny: ["week"] },
    ],
  },
  {
    name: "Express Gas Delivery",
    origin: "https://expressgasdelivery.com/",
    questions: [
      { question: "What services do you offer?", expectedAny: ["gas"] },
      { question: "What are your opening hours?", expectedAny: ["08:00", "8:00"] },
      { question: "Do you supply propane gas cylinders?", expectedAny: ["propane"] },
      { question: "Do you supply patio gas?", expectedAny: ["patio"] },
      { question: "Do you supply beer gas?", expectedAny: ["beer"] },
    ],
  },
  {
    name: "Forum Housing",
    origin: "https://forumhousing.co.uk/",
    questions: [
      { question: "What services do you offer?", expectedAny: ["support", "housing", "accommodation"] },
      { question: "What are your opening hours?", expectedAny: ["9", "09:00", "5pm", "17:00"] },
      { question: "What support do you provide?", expectedAny: ["support"] },
      { question: "How can someone contact you?", expectedAny: ["contact", "phone", "telephone", "email"] },
      { question: "What housing help is available?", expectedAny: ["housing", "support", "accommodation"] },
    ],
  },
  {
    name: "MaintenanceOS",
    origin: "https://seahorse-app-4oasq.ondigitalocean.app/",
    questions: [
      { question: "What does MaintenanceOS do?", expectedAny: ["maintenance", "property"] },
      { question: "What industries do you support?", expectedAny: ["landlord", "housing", "maintenance", "property"] },
      { question: "What does the AI receptionist do?", expectedAny: ["receptionist"] },
      { question: "How does MaintenanceOS handle property maintenance?", expectedAny: ["maintenance"] },
      { question: "What security information is published?", expectedAny: ["security"] },
    ],
  },
];

const requestedCase = process.env.STAGE12_CASE?.trim();
const selectedCases = requestedCase
  ? cases.filter((item) => item.name === requestedCase)
  : cases;
assert.ok(
  selectedCases.length > 0,
  "No Stage 12 canary case matched STAGE12_CASE=" + String(requestedCase),
);

const allResults = [];
for (const [caseIndex, item] of selectedCases.entries()) {
  const root = await mkdtemp(join(tmpdir(), "scanner-v2-stage12-canary-"));
  try {
    const crawlId =
      "stage12-" +
      String(caseIndex + 1) +
      "-" +
      new URL(item.origin).hostname.replace(/[^a-z0-9]+/gi, "-");
    const started = Date.now();
    const result = await runScannerV2Pipeline({
      store: new FileScannerV2JobStore(root),
      origin: item.origin,
      releaseSha,
      crawlId,
      batchSize: 12,
      maxBatches: 2000,
      processor: {
        readerFallback: true,
        renderTimeoutMs: 15000,
      },
    });

    console.log(
      "STAGE12_PRE_ANSWER=" +
        JSON.stringify({
          name: item.name,
          state: result.manifest.state,
          discovered: result.manifest.discovered,
          fetched: result.manifest.fetched,
          duplicate: result.manifest.duplicate,
          policySkipped: result.manifest.policySkipped,
          robotsSkipped: result.manifest.robotsSkipped,
          unresolved: result.manifest.unresolved,
          queued: result.manifest.queued,
          pageCount: result.pageCount,
          chunkCount: result.chunkCount,
          warnings: result.warnings,
          unresolvedRows: result.manifest.urls
            .filter((row) => row.status === "unresolved")
            .slice(0, 25),
        }),
    );

    assert.equal(
      result.manifest.state,
      "COMPLETE",
      item.name + " crawl was not COMPLETE: " + JSON.stringify({
        state: result.manifest.state,
        discovered: result.manifest.discovered,
        fetched: result.manifest.fetched,
        duplicate: result.manifest.duplicate,
        skipped: result.manifest.policySkipped + result.manifest.robotsSkipped,
        unresolved: result.manifest.unresolved,
        queued: result.manifest.queued,
        warnings: result.warnings,
        unresolvedRows: result.manifest.urls
          .filter((row) => row.status === "unresolved")
          .slice(0, 25),
      }),
    );
    assert.equal(result.manifest.queued, 0);
    assert.equal(result.manifest.unresolved, 0);
    assert.ok(result.pageCount > 0);
    assert.ok(result.chunkCount > 0);
    assert.equal(result.indexStats.documentCount, result.chunkCount);

    const answers = [];
    for (const check of item.questions) {
      const answer = await result.answer(check.question);
      answers.push({
        question: check.question,
        supportStatus: answer.supportStatus,
        source: answer.source,
        text: answer.text,
        sourceUrls: answer.sourceUrls,
        chunkIds: answer.retrievedChunkIds,
      });
      assert.equal(
        answer.supportStatus,
        "supported",
        item.name + " failed supported question: " + check.question + "\n" + JSON.stringify(answer),
      );
      assert.ok(
        answer.sourceUrls.length > 0,
        item.name + " answer lacks source URL: " + check.question,
      );
      const answerText = answer.text.toLowerCase();
      assert.ok(
        check.expectedAny.some((value) => answerText.includes(value.toLowerCase())),
        item.name +
          " answer did not actually address the question: " +
          check.question +
          "\nexpected one of " +
          JSON.stringify(check.expectedAny) +
          "\nanswer=" +
          answer.text,
      );
    }

    const unknown = await result.answer(
      "What is the managing director's favourite colour and childhood nickname?",
    );
    assert.equal(
      unknown.supportStatus,
      "not_found",
      item.name + " invented an unsupported personal fact",
    );

    const deepSources = new Set(
      answers
        .flatMap((answer) => answer.sourceUrls)
        .filter((raw) => {
          try {
            const path = new URL(raw).pathname.replace(/\/+$/, "") || "/";
            return path !== "/";
          } catch {
            return false;
          }
        }),
    );
    assert.ok(
      deepSources.size >= 1,
      item.name + " produced no non-homepage source evidence",
    );

    const summary = {
      name: item.name,
      origin: item.origin,
      durationMs: Date.now() - started,
      manifest: {
        state: result.manifest.state,
        discovered: result.manifest.discovered,
        fetched: result.manifest.fetched,
        duplicate: result.manifest.duplicate,
        policySkipped: result.manifest.policySkipped,
        robotsSkipped: result.manifest.robotsSkipped,
        unresolved: result.manifest.unresolved,
      },
      pageCount: result.pageCount,
      chunkCount: result.chunkCount,
      answers,
      unknown: {
        supportStatus: unknown.supportStatus,
        text: unknown.text,
      },
    };
    allResults.push(summary);
    console.log("STAGE12_SITE_PASS=" + JSON.stringify(summary));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

console.log(
  "SCANNER_V2_STAGE12_REAL_SITE_CANARY=PASS " +
    JSON.stringify({
      releaseSha,
      sites: allResults.map((result) => ({
        name: result.name,
        discovered: result.manifest.discovered,
        fetched: result.manifest.fetched,
        chunks: result.chunkCount,
      })),
    }),
);
