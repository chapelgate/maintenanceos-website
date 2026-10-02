import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_MAX_DOCUMENT_TEXT_CHARS,
  ingestScannerV2Document,
  isScannerV2DocumentContentType,
  isScannerV2SupportedDocumentUrl,
  isScannerV2UnsupportedDocumentContentType,
  isScannerV2UnsupportedTextDocumentUrl,
} from "./scanner-v2-documents.ts";
import { InMemoryBm25CorpusIndex } from "./scanner-v2-retrieval.ts";
import { ScanError } from "./types.ts";
import type {
  BinaryHttpGetFn,
  LookupFn,
  SafeBinaryHttpResponse,
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
