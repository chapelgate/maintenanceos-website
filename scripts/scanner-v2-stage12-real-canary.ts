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
      "What services do you offer?",
      "How do I order replacement alley gate keys?",
      "Do you provide CCTV?",
      "Do you provide security fencing?",
      "How long can replacement keys take?",
    ],
  },
  {
    name: "Express Gas Delivery",
    origin: "https://expressgasdelivery.com/",
    questions: [
      "What services do you offer?",
      "What are your opening hours?",
      "Do you supply propane gas cylinders?",
      "Do you supply patio gas?",
      "Do you supply beer gas?",
    ],
  },
  {
    name: "Forum Housing",
    origin: "https://forumhousing.co.uk/",
    questions: [
      "What services do you offer?",
      "What are your opening hours?",
      "What support do you provide?",
      "How can someone contact you?",
      "What housing help is available?",
    ],
  },
  {
    name: "MaintenanceOS",
    origin: "https://maintenanceos.co.uk/",
    questions: [
      "What does MaintenanceOS do?",
      "What industries do you support?",
      "What does the AI receptionist do?",
      "How does MaintenanceOS handle property maintenance?",
      "What security information is published?",
    ],
  },
];

const allResults = [];
for (const [caseIndex, item] of cases.entries()) {
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

    const answers = [];
    for (const question of item.questions) {
      const answer = await result.answer(question);
      answers.push({
        question,
        supportStatus: answer.supportStatus,
        source: answer.source,
        text: answer.text,
        sourceUrls: answer.sourceUrls,
        chunkIds: answer.retrievedChunkIds,
      });
      assert.equal(
        answer.supportStatus,
        "supported",
        item.name + " failed supported question: " + question + "\n" + JSON.stringify(answer),
      );
      assert.ok(
        answer.sourceUrls.length > 0,
        item.name + " answer lacks source URL: " + question,
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
