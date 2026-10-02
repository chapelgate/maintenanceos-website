import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_MAX_DOCUMENT_TEXT_CHARS,
  ingestScannerV2Document,
  ingestScannerV2ManifestDocuments,
  isScannerV2DocumentContentType,
  isScannerV2SupportedDocumentUrl,
  isScannerV2UnsupportedDocumentContentType,
  isScannerV2UnsupportedTextDocumentUrl,
} from "./scanner-v2-documents.ts";
import { discoverScannerV2Frontier } from "./scanner-v2-discovery.ts";
import { answerGroundedReceptionistQuestion } from "./scanner-v2-grounding.ts";
import { InMemoryBm25CorpusIndex } from "./scanner-v2-retrieval.ts";
import { ScanError } from "./types.ts";
import type {
  BinaryHttpGetFn,
  HttpGetFn,
  LookupFn,
  SafeBinaryHttpResponse,
  SafeHttpResponse,
} from "./types.ts";

function binaryResponse(input: {
  url: string;
  bytes: Uint8Array | string;
  type: string;
  status?: number;
  headers?: Record<string, string>;
}): SafeBinaryHttpResponse {
  return {
    status: input.status ?? 200,
    headers: {
      "content-type": input.type,
      ...(input.headers ?? {}),
    },
    body:
      typeof input.bytes === "string"
        ? new TextEncoder().encode(input.bytes)
        : input.bytes,
    url: new URL(input.url),
  };
}

function fixtures(
  map: Record<string, SafeBinaryHttpResponse>,
): { lookup: LookupFn; get: BinaryHttpGetFn } {
  return {
    lookup: async () => ["203.0.113.10"],
    get: async (url) =>
      map[url.toString()] ??
      binaryResponse({
        url: url.toString(),
        bytes: "missing",
        type: "text/plain",
        status: 404,
      }),
  };
}

function escapePdfText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function buildPdf(text: string): Uint8Array {
  const content = [
    "BT",
    "/F1 12 Tf",
    "72 720 Td",
    "(" + escapePdfText(text) + ") Tj",
    "ET",
    "",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>",
    "<< /Length " +
      Buffer.byteLength(content, "ascii") +
      " >>\nstream\n" +
      content +
      "endstream",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(body, "ascii"));
    body += String(index + 1) + " 0 obj\n" + objects[index] + "\nendobj\n";
  }

  const xrefOffset = Buffer.byteLength(body, "ascii");
  body += "xref\n0 " + String(objects.length + 1) + "\n";
  body += "0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) {
    body += String(offset).padStart(10, "0") + " 00000 n \n";
  }
  body +=
    "trailer\n<< /Root 1 0 R /Size " +
    String(objects.length + 1) +
    " >>\nstartxref\n" +
    String(xrefOffset) +
    "\n%%EOF\n";

  return new TextEncoder().encode(body);
}

test("document candidate helpers distinguish supported and explicitly unsupported text-bearing formats", () => {
  assert.equal(
    isScannerV2SupportedDocumentUrl("https://acme.example/guide.pdf"),
    true,
  );
  assert.equal(
    isScannerV2SupportedDocumentUrl("https://acme.example/data.csv"),
    true,
  );
  assert.equal(
    isScannerV2SupportedDocumentUrl("https://acme.example/readme.txt"),
    true,
  );
  assert.equal(
    isScannerV2UnsupportedTextDocumentUrl(
      "https://acme.example/policy.docx",
    ),
    true,
  );
  assert.equal(
    isScannerV2UnsupportedTextDocumentUrl(
      "https://acme.example/image.png",
    ),
    false,
  );
  assert.equal(isScannerV2DocumentContentType("application/pdf"), true);
  assert.equal(isScannerV2DocumentContentType("text/csv; charset=utf-8"), true);
  assert.equal(
    isScannerV2UnsupportedDocumentContentType(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ),
    true,
  );
});

test("TXT document ingestion is source-grounded, chunked and retrievable", async () => {
  const url = "https://acme.example/terms.txt";
  const body =
    "Returns policy\nUnused cylinders may be returned within 14 days with proof of purchase.";
  const result = await ingestScannerV2Document(url, {
    origin: "https://acme.example",
    ...fixtures({
      [url]: binaryResponse({
        url,
        bytes: body,
        type: "text/plain; charset=utf-8",
        headers: {
          etag: '"txt-v1"',
          "last-modified": "Thu, 01 Oct 2026 09:00:00 GMT",
        },
      }),
    }),
    fetchedAt: "2026-10-02T12:00:00.000Z",
    discoveredFrom: "https://acme.example/",
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.complete, true);
  assert.equal(result.kind, "text");
  assert.equal(result.page.fetchMode, "document");
  assert.equal(result.page.etag, '"txt-v1"');
  assert.equal(
    result.page.lastModified,
    "Thu, 01 Oct 2026 09:00:00 GMT",
  );
  assert.equal(result.page.discoveredFrom, "https://acme.example/");
  assert.match(result.page.visibleText, /returned within 14 days/i);
  assert.ok(result.chunks.length >= 1);
  assert.equal(
    result.chunks.every((chunk) => chunk.canonicalUrl === url),
    true,
  );

  const index = new InMemoryBm25CorpusIndex();
  await index.index("crawl-doc", result.chunks);
  const hits = await index.search(
    "crawl-doc",
    "How long can unused cylinders be returned?",
  );
  assert.ok(hits.length >= 1);
  assert.equal(hits[0]?.canonicalUrl, url);
  assert.match(hits[0]?.text ?? "", /14 days/i);
});

test("CSV document ingestion preserves public row content for retrieval", async () => {
  const url = "https://acme.example/service-areas.csv";
  const body =
    "postcode,service\nCH44,Alley gate installation\nCH45,CCTV maintenance\n";
  const result = await ingestScannerV2Document(url, {
    origin: "https://acme.example",
    ...fixtures({
      [url]: binaryResponse({
        url,
        bytes: body,
        type: "text/csv",
      }),
    }),
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.kind, "csv");
  assert.match(result.page.visibleText, /CH45,CCTV maintenance/);
  assert.deepEqual(result.chunks[0]?.headingPath, ["CSV document"]);
});

test("real PDF.js parser extracts a PDF-only fact and BM25 retrieves its source", async () => {
  const url = "https://acme.example/installation-guide.pdf";
  const fact =
    "Document-only fact: installation lead time is six weeks for bespoke alley gates.";
  const result = await ingestScannerV2Document(url, {
    origin: "https://acme.example",
    ...fixtures({
      [url]: binaryResponse({
        url,
        bytes: buildPdf(fact),
        type: "application/pdf",
      }),
    }),
    parseTimeoutMs: 10_000,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.kind, "pdf");
  assert.equal(result.complete, true);
  assert.match(result.page.visibleText, /installation lead time is six weeks/i);
  assert.ok(result.chunks.some((chunk) => chunk.headingPath.includes("Page 1")));

  const index = new InMemoryBm25CorpusIndex();
  await index.index("crawl-pdf", result.chunks);
  const hits = await index.search(
    "crawl-pdf",
    "What is the installation lead time for bespoke alley gates?",
  );
  assert.ok(hits.length >= 1);
  assert.equal(hits[0]?.canonicalUrl, url);
  assert.match(hits[0]?.text ?? "", /six weeks/i);
});

test("PDF magic mismatch is rejected instead of feeding non-PDF bytes to the parser", async () => {
  const url = "https://acme.example/fake.pdf";
  let parserCalled = false;
  const result = await ingestScannerV2Document(url, {
    origin: "https://acme.example",
    ...fixtures({
      [url]: binaryResponse({
        url,
        bytes: "<html>not a pdf</html>",
        type: "application/pdf",
      }),
    }),
    pdfParser: async () => {
      parserCalled = true;
      return { pages: [], totalPages: 0, truncated: false };
    },
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.reason, "document_signature_mismatch");
  assert.equal(result.incomplete, true);
  assert.equal(parserCalled, false);
});

test("unsupported Office document is explicit and incomplete, never silently skipped", async () => {
  const url = "https://acme.example/policy.docx";
  const result = await ingestScannerV2Document(url, {
    origin: "https://acme.example",
    ...fixtures({
      [url]: binaryResponse({
        url,
        bytes: new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    }),
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.reason, "unsupported_document");
  assert.equal(result.incomplete, true);
  assert.ok(result.warnings.includes("unsupported_document"));
});

test("PDF parser failure and timeout both remain explicit PARTIAL evidence", async () => {
  const url = "https://acme.example/manual.pdf";
  const base = {
    origin: "https://acme.example",
    ...fixtures({
      [url]: binaryResponse({
        url,
        bytes: buildPdf("A valid PDF for injected parser tests."),
        type: "application/pdf",
      }),
    }),
  };

  const failed = await ingestScannerV2Document(url, {
    ...base,
    pdfParser: async () => {
      throw new Error("synthetic parser failure");
    },
  });
  assert.equal(failed.ok, false);
  if (!failed.ok) {
    assert.equal(failed.reason, "document_parse_failed");
    assert.equal(failed.incomplete, true);
  }

  const timedOut = await ingestScannerV2Document(url, {
    ...base,
    parseTimeoutMs: 250,
    pdfParser: async () => await new Promise(() => {}),
  });
  assert.equal(timedOut.ok, false);
  if (!timedOut.ok) {
    assert.equal(timedOut.reason, "document_parse_timeout");
    assert.equal(timedOut.incomplete, true);
  }
});

test("document text safety ceiling returns useful evidence but never claims completeness", async () => {
  const url = "https://acme.example/large.txt";
  const body = "Useful business detail. ".repeat(
    Math.ceil((DEFAULT_MAX_DOCUMENT_TEXT_CHARS + 100) / 24),
  );
  const result = await ingestScannerV2Document(url, {
    origin: "https://acme.example",
    maxTextChars: 1_024,
    ...fixtures({
      [url]: binaryResponse({
        url,
        bytes: body,
        type: "text/plain",
      }),
    }),
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.complete, false);
  assert.ok(result.warnings.includes("document_limit_reached"));
  assert.ok(result.page.visibleText.length <= 1_024);
});

test("private DNS is rejected before a document connection is attempted", async () => {
  let getCalls = 0;
  const result = await ingestScannerV2Document(
    "https://acme.example/private.pdf",
    {
      origin: "https://acme.example",
      lookup: async () => ["127.0.0.1"],
      get: async () => {
        getCalls += 1;
        throw new Error("must not connect");
      },
    },
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "non_public_resolved_ip");
    assert.equal(result.incomplete, true);
  }
  assert.equal(getCalls, 0);
});

test("cross-origin document redirect is rejected before fetching the second origin", async () => {
  const source = "https://acme.example/manual.pdf";
  let calls = 0;
  const result = await ingestScannerV2Document(source, {
    origin: "https://acme.example",
    lookup: async () => ["203.0.113.10"],
    get: async (url) => {
      calls += 1;
      if (url.origin !== "https://acme.example") {
        throw new Error("cross-origin connection must not occur");
      }
      return binaryResponse({
        url: url.toString(),
        bytes: "",
        type: "text/plain",
        status: 302,
        headers: {
          location: "https://other.example/manual.pdf",
        },
      });
    },
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "cross_origin_redirect");
    assert.equal(result.incomplete, true);
  }
  assert.equal(calls, 1);
});

test("binary text with NUL bytes is rejected instead of indexed as public text", async () => {
  const url = "https://acme.example/data.txt";
  const result = await ingestScannerV2Document(url, {
    origin: "https://acme.example",
    ...fixtures({
      [url]: binaryResponse({
        url,
        bytes: new Uint8Array([0x41, 0x00, 0x42]),
        type: "text/plain",
      }),
    }),
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "document_binary_text_rejected");
    assert.equal(result.incomplete, true);
  }
});

test("no-extension PDF can be identified from trusted response signature + MIME", async () => {
  const url = "https://acme.example/download?id=42";
  const result = await ingestScannerV2Document(url, {
    origin: "https://acme.example",
    ...fixtures({
      [url]: binaryResponse({
        url,
        bytes: buildPdf("Warranty lasts 24 months."),
        type: "application/pdf",
      }),
    }),
    parseTimeoutMs: 10_000,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.kind, "pdf");
  assert.match(result.page.visibleText, /24 months/i);
});

test("Stage 8 manifest pass converts discovered PDF/TXT into corpus evidence and leaves unsupported Office explicit PARTIAL", async () => {
  const pdfUrl = "https://acme.example/gate-installation.pdf";
  const txtUrl = "https://acme.example/returns.txt";
  const docxUrl = "https://acme.example/legacy-policy.docx";
  const pdfFact =
    "The bespoke gate installation lead time is six weeks after final approval.";

  const result = await ingestScannerV2ManifestDocuments(
    {
      crawlId: "crawl-stage8",
      origin: "https://acme.example",
      state: "DISCOVERING",
      discovered: 4,
      queued: 0,
      fetched: 1,
      duplicate: 0,
      policySkipped: 3,
      robotsSkipped: 0,
      unresolved: 0,
      urls: [
        {
          url: "https://acme.example/",
          canonicalUrl: "https://acme.example/",
          status: "fetched",
          discoveryReason: "submitted",
        },
        {
          url: pdfUrl,
          status: "policy_skipped",
          discoveryReason: "document",
          discoveredFrom: "https://acme.example/guides",
          reason: "content_type_not_stage2_html",
        },
        {
          url: txtUrl,
          status: "policy_skipped",
          discoveryReason: "document",
          discoveredFrom: "https://acme.example/policies",
          reason: "content_type_not_stage2_html",
        },
        {
          url: docxUrl,
          status: "policy_skipped",
          discoveryReason: "document",
          discoveredFrom: "https://acme.example/policies",
          reason: "content_type_not_stage2_html",
        },
      ],
    },
    {
      ...fixtures({
        [pdfUrl]: binaryResponse({
          url: pdfUrl,
          bytes: buildPdf(pdfFact),
          type: "application/pdf",
        }),
        [txtUrl]: binaryResponse({
          url: txtUrl,
          bytes:
            "Unused replacement keys may be returned within 14 days with proof of purchase.",
          type: "text/plain",
        }),
      }),
      parseTimeoutMs: 10_000,
      fetchedAt: "2026-10-02T18:58:00.000Z",
    },
  );

  assert.equal(result.attempted, 3);
  assert.equal(result.succeeded, 2);
  assert.equal(result.pages.length, 2);
  assert.ok(result.chunks.length >= 2);
  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.ok(result.warnings.includes("unsupported_document"));

  const pdfRow = result.manifest.urls.find((row) => row.url === pdfUrl);
  assert.equal(pdfRow?.status, "fetched");
  assert.equal(pdfRow?.reason, undefined);
  assert.ok(pdfRow?.contentHash);

  const txtRow = result.manifest.urls.find((row) => row.url === txtUrl);
  assert.equal(txtRow?.status, "fetched");

  const docxRow = result.manifest.urls.find((row) => row.url === docxUrl);
  assert.equal(docxRow?.status, "unresolved");
  assert.equal(docxRow?.reason, "unsupported_document");

  const pdfPage = result.pages.find((page) => page.canonicalUrl === pdfUrl);
  assert.equal(pdfPage?.fetchMode, "document");
  assert.equal(pdfPage?.discoveredFrom, "https://acme.example/guides");
  assert.match(pdfPage?.visibleText ?? "", /six weeks/i);
});

test("Stage 8 PDF-only fact reaches the grounded receptionist with exact source provenance", async () => {
  const pdfUrl = "https://acme.example/deep/installation-guide.pdf";
  const fact =
    "Bespoke alley gate installation normally takes six weeks after final design approval.";

  const batch = await ingestScannerV2ManifestDocuments(
    {
      crawlId: "crawl-pdf-grounding",
      origin: "https://acme.example",
      state: "DISCOVERING",
      discovered: 1,
      queued: 0,
      fetched: 0,
      duplicate: 0,
      policySkipped: 1,
      robotsSkipped: 0,
      unresolved: 0,
      urls: [
        {
          url: pdfUrl,
          status: "policy_skipped",
          discoveryReason: "document",
          discoveredFrom: "https://acme.example/guides",
          reason: "content_type_not_stage2_html",
        },
      ],
    },
    {
      ...fixtures({
        [pdfUrl]: binaryResponse({
          url: pdfUrl,
          bytes: buildPdf(fact),
          type: "application/pdf",
        }),
      }),
      parseTimeoutMs: 10_000,
    },
  );

  assert.equal(batch.incomplete, false);
  assert.equal(batch.manifest.state, "DISCOVERING");
  assert.equal(batch.manifest.fetched, 1);

  const index = new InMemoryBm25CorpusIndex();
  await index.index(batch.manifest.crawlId, batch.chunks);
  const answer = await answerGroundedReceptionistQuestion(
    "How long does bespoke alley gate installation take after design approval?",
    {
      crawlId: batch.manifest.crawlId,
      index,
    },
  );

  assert.equal(answer.supportStatus, "supported");
  assert.equal(answer.source, "corpus.extractive");
  assert.deepEqual(answer.sourceUrls, [pdfUrl]);
  assert.equal(answer.retrievedChunkIds.length, 1);
  assert.match(answer.text, /six weeks/i);
  assert.match(answer.text, /design approval/i);
});

test("Stage 8 truncated document keeps useful chunks but forces manifest PARTIAL", async () => {
  const url = "https://acme.example/large.txt";
  const batch = await ingestScannerV2ManifestDocuments(
    {
      crawlId: "crawl-doc-limit",
      origin: "https://acme.example",
      state: "DISCOVERING",
      discovered: 1,
      queued: 0,
      fetched: 0,
      duplicate: 0,
      policySkipped: 1,
      robotsSkipped: 0,
      unresolved: 0,
      urls: [
        {
          url,
          status: "policy_skipped",
          discoveryReason: "document",
          reason: "content_type_not_stage2_html",
        },
      ],
    },
    {
      maxTextChars: 1_024,
      ...fixtures({
        [url]: binaryResponse({
          url,
          bytes: "Useful public service condition. ".repeat(200),
          type: "text/plain",
        }),
      }),
    },
  );

  assert.equal(batch.pages.length, 1);
  assert.ok(batch.chunks.length >= 1);
  assert.equal(batch.incomplete, true);
  assert.equal(batch.manifest.state, "PARTIAL");
  assert.equal(batch.manifest.unresolved, 1);
  const row = batch.manifest.urls[0];
  assert.equal(row?.status, "unresolved");
  assert.equal(row?.reason, "document_limit_reached");
  assert.ok(row?.contentHash);
});

test("Stage 2 HTML link flows through frontier, Stage 8 PDF ingest, retrieval and receptionist grounding", async () => {
  const origin = "https://acme.example";
  const pdfUrl = origin + "/deep/installation-guide.pdf";
  const fact =
    "Bespoke alley gates take six weeks after final design approval.";

  const lookup: LookupFn = async () => ["203.0.113.10"];
  const htmlGet: HttpGetFn = async (url) => {
    if (url.pathname === "/robots.txt") {
      return {
        status: 200,
        headers: { "content-type": "text/plain" },
        body: "User-agent: *\nAllow: /",
        url,
      };
    }
    if (url.pathname === "/sitemap.xml") {
      return {
        status: 404,
        headers: { "content-type": "text/plain" },
        body: "not found",
        url,
      };
    }
    if (url.pathname === "/") {
      return {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
        body:
          '<html><body><h1>Acme</h1><a href="/deep/installation-guide.pdf">Installation guide</a></body></html>',
        url,
      };
    }
    if (url.pathname === "/deep/installation-guide.pdf") {
      return {
        status: 200,
        headers: { "content-type": "application/pdf" },
        body: "%PDF-1.4 binary-placeholder-for-discovery",
        url,
      };
    }
    return {
      status: 404,
      headers: { "content-type": "text/plain" },
      body: "missing",
      url,
    };
  };

  const discovery = await discoverScannerV2Frontier(origin + "/", {
    lookup,
    get: htmlGet,
  });

  const before = discovery.manifest.urls.find((row) => row.url === pdfUrl);
  assert.ok(before, "Stage 2 must retain the linked PDF in the manifest");
  assert.equal(before?.discoveryReason, "html_link");
  assert.equal(before?.status, "policy_skipped");
  assert.equal(before?.reason, "content_type_not_stage2_html");

  const batch = await ingestScannerV2ManifestDocuments(discovery.manifest, {
    lookup,
    get: async (url) =>
      url.toString() === pdfUrl
        ? binaryResponse({
            url: pdfUrl,
            bytes: buildPdf(fact),
            type: "application/pdf",
          })
        : binaryResponse({
            url: url.toString(),
            bytes: "missing",
            type: "text/plain",
            status: 404,
          }),
    parseTimeoutMs: 10_000,
  });

  const after = batch.manifest.urls.find((row) => row.url === pdfUrl);
  assert.equal(after?.status, "fetched");
  assert.equal(after?.reason, undefined);
  assert.equal(batch.succeeded, 1);
  assert.equal(batch.incomplete, false);
  assert.ok(batch.chunks.some((chunk) => chunk.canonicalUrl === pdfUrl));

  const index = new InMemoryBm25CorpusIndex();
  await index.index(batch.manifest.crawlId, batch.chunks);

  const answer = await answerGroundedReceptionistQuestion(
    "How long does bespoke alley gate installation take after final design approval?",
    {
      crawlId: batch.manifest.crawlId,
      index,
    },
  );

  assert.equal(answer.supportStatus, "supported");
  assert.equal(answer.source, "corpus.extractive");
  assert.deepEqual(answer.sourceUrls, [pdfUrl]);
  assert.equal(answer.retrievedChunkIds.length, 1);
  assert.match(answer.text, /six weeks/i);
  assert.match(answer.text, /final design approval/i);
});

