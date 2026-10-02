import { Worker } from "node:worker_threads";
import {
  DEFAULT_MAX_REDIRECTS,
  fetchPublicHttpsBytes,
} from "./fetch-safe.ts";
import {
  buildCrawlManifest,
  stableChunkId,
  stableContentHash,
} from "./scanner-v2-foundation.ts";
import { normalizeScannerV2Url } from "./scanner-v2-url-policy.ts";
import type {
  BinaryHttpGetFn,
  CorpusChunk,
  CrawlManifest,
  CrawlPage,
  CrawlUrlDisposition,
  LookupFn,
} from "./types.ts";

export const DEFAULT_DOCUMENT_FETCH_TIMEOUT_MS = 8_000;
export const MAX_DOCUMENT_FETCH_TIMEOUT_MS = 20_000;
export const DEFAULT_DOCUMENT_PARSE_TIMEOUT_MS = 8_000;
export const MAX_DOCUMENT_PARSE_TIMEOUT_MS = 20_000;
export const DEFAULT_MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 16 * 1024 * 1024;
export const DEFAULT_MAX_DOCUMENT_TEXT_CHARS = 2_000_000;
export const MAX_DOCUMENT_TEXT_CHARS = 4_000_000;
export const DEFAULT_MAX_PDF_PAGES = 500;
export const MAX_PDF_PAGES = 1_000;
export const DEFAULT_DOCUMENT_CHUNK_CHARS = 1_400;
export const DEFAULT_DOCUMENT_CHUNK_OVERLAP = 120;

export type ScannerV2DocumentKind = "pdf" | "text" | "csv";

export type ScannerV2PdfPage = {
  pageNumber: number;
  text: string;
};

export type ScannerV2PdfParseResult = {
  title?: string;
  pages: ScannerV2PdfPage[];
  totalPages: number;
  truncated: boolean;
};

export type ScannerV2PdfParser = (
  bytes: Uint8Array,
  options: {
    timeoutMs: number;
    maxPages: number;
    maxTextChars: number;
  },
) => Promise<ScannerV2PdfParseResult>;

export type ScannerV2DocumentSuccess = {
  ok: true;
  complete: boolean;
  kind: ScannerV2DocumentKind;
  source: {
    url: string;
    status: number;
    bytes: number;
    contentType: string;
  };
  page: CrawlPage;
  chunks: CorpusChunk[];
  warnings: string[];
};

export type ScannerV2DocumentFailure = {
  ok: false;
  incomplete: boolean;
  url: string;
  reason: string;
  message: string;
  warnings: string[];
};

export type ScannerV2DocumentResult =
  | ScannerV2DocumentSuccess
  | ScannerV2DocumentFailure;

export type ScannerV2DocumentOptions = {
  origin: string;
  lookup?: LookupFn;
  get?: BinaryHttpGetFn;
  fetchTimeoutMs?: number;
  parseTimeoutMs?: number;
  maxBytes?: number;
  maxTextChars?: number;
  maxPdfPages?: number;
  pdfParser?: ScannerV2PdfParser;
  fetchedAt?: string;
  discoveredFrom?: string;
};

const SUPPORTED_EXTENSIONS = new Set([".pdf", ".txt", ".csv"]);
const UNSUPPORTED_TEXT_DOCUMENT_EXTENSIONS = new Set([
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".odt",
  ".ods",
  ".odp",
  ".rtf",
]);

const OFFICE_MIME_RE =
  /(?:application\/(?:msword|rtf|vnd\.ms-|vnd\.openxmlformats-officedocument|vnd\.oasis\.opendocument))/i;

function boundedInt(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(value as number)));
}

function contentType(headers: Record<string, string>): string {
  const value = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === "content-type",
  )?.[1];
  return (value ?? "").split(";", 1)[0]!.trim().toLowerCase();
}

function extension(url: URL): string {
  const match = /\.[a-z0-9]{1,8}$/i.exec(url.pathname);
  return match?.[0]?.toLowerCase() ?? "";
}

export function isScannerV2SupportedDocumentUrl(rawUrl: string): boolean {
  try {
    return SUPPORTED_EXTENSIONS.has(extension(new URL(rawUrl)));
  } catch {
    return false;
  }
}

export function isScannerV2UnsupportedTextDocumentUrl(
  rawUrl: string,
): boolean {
  try {
    return UNSUPPORTED_TEXT_DOCUMENT_EXTENSIONS.has(
      extension(new URL(rawUrl)),
    );
  } catch {
    return false;
  }
}

export function isScannerV2DocumentContentType(type: string): boolean {
  const normalized = type.split(";", 1)[0]!.trim().toLowerCase();
  return (
    normalized === "application/pdf" ||
    normalized === "text/plain" ||
    normalized === "text/csv" ||
    normalized === "application/csv"
  );
}

export function isScannerV2UnsupportedDocumentContentType(
  type: string,
): boolean {
  return OFFICE_MIME_RE.test(type);
}

function startsWithPdfMagic(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 5) return false;
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

function hasNulByte(bytes: Uint8Array): boolean {
  const sample = bytes.subarray(0, Math.min(bytes.byteLength, 64 * 1024));
  return sample.includes(0);
}

function classifyDocument(input: {
  url: URL;
  type: string;
  bytes: Uint8Array;
}):
  | { ok: true; kind: ScannerV2DocumentKind }
  | { ok: false; reason: string; incomplete: boolean } {
  const ext = extension(input.url);
  const type = input.type;

  if (isScannerV2UnsupportedDocumentContentType(type)) {
    return { ok: false, reason: "unsupported_document", incomplete: true };
  }
  if (UNSUPPORTED_TEXT_DOCUMENT_EXTENSIONS.has(ext)) {
    return { ok: false, reason: "unsupported_document", incomplete: true };
  }

  const pdfClaimed = type === "application/pdf" || ext === ".pdf";
  if (pdfClaimed) {
    if (!startsWithPdfMagic(input.bytes)) {
      return {
        ok: false,
        reason: "document_signature_mismatch",
        incomplete: true,
      };
    }
    return { ok: true, kind: "pdf" };
  }

  const csvClaimed =
    type === "text/csv" || type === "application/csv" || ext === ".csv";
  if (csvClaimed) {
    if (hasNulByte(input.bytes)) {
      return {
        ok: false,
        reason: "document_binary_text_rejected",
        incomplete: true,
      };
    }
    return { ok: true, kind: "csv" };
  }

  const textClaimed = type === "text/plain" || ext === ".txt";
  if (textClaimed) {
    if (hasNulByte(input.bytes)) {
      return {
        ok: false,
        reason: "document_binary_text_rejected",
        incomplete: true,
      };
    }
    return { ok: true, kind: "text" };
  }

  return { ok: false, reason: "unsupported_document", incomplete: true };
}

function cleanText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function splitText(
  text: string,
  maxChars = DEFAULT_DOCUMENT_CHUNK_CHARS,
  overlapChars = DEFAULT_DOCUMENT_CHUNK_OVERLAP,
): string[] {
  if (text.length <= maxChars) return text ? [text] : [];
  const out: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + maxChars);
    if (end < text.length) {
      const newline = text.lastIndexOf("\n", end);
      const sentence = Math.max(
        text.lastIndexOf(". ", end),
        text.lastIndexOf("! ", end),
        text.lastIndexOf("? ", end),
      );
      const word = text.lastIndexOf(" ", end);
      const floor = start + Math.floor(maxChars * 0.55);
      if (newline > floor) end = newline;
      else if (sentence > floor) end = sentence + 1;
      else if (word > floor) end = word;
    }
    const piece = text.slice(start, end).trim();
    if (piece) out.push(piece);
    if (end >= text.length) break;
    start = Math.max(start + 1, end - overlapChars);
  }
  return out;
}

function chunksForText(input: {
  canonicalUrl: string;
  title?: string;
  sections: Array<{ heading: string[]; text: string }>;
}): CorpusChunk[] {
  const chunks: CorpusChunk[] = [];
  let ordinal = 0;
  for (const section of input.sections) {
    for (const piece of splitText(section.text)) {
      const hash = stableContentHash(piece);
      chunks.push({
        id: stableChunkId(input.canonicalUrl, ordinal, piece),
        canonicalUrl: input.canonicalUrl,
        ...(input.title ? { title: input.title } : {}),
        headingPath: section.heading,
        text: piece,
        ordinal,
        contentHash: hash,
      });
      ordinal += 1;
    }
  }
  return chunks;
}

function titleFromUrl(url: URL): string | undefined {
  const name = url.pathname.split("/").filter(Boolean).at(-1);
  if (!name) return undefined;
  let decoded = name;
  try {
    decoded = decodeURIComponent(name);
  } catch {
    // Keep the exact URL component if it is malformed.
  }
  const stripped = decoded.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return stripped || undefined;
}

const PDF_WORKER_SOURCE = String.raw`
const { parentPort, workerData } = require("node:worker_threads");

(async () => {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(workerData.bytes);
  const loadingTask = getDocument({
    data,
    isEvalSupported: false,
    useWorkerFetch: false,
    stopAtErrors: true,
  });

  try {
    const pdf = await loadingTask.promise;
    let title;
    try {
      const metadata = await pdf.getMetadata();
      const candidate = metadata && metadata.info && metadata.info.Title;
      if (typeof candidate === "string" && candidate.trim()) {
        title = candidate.trim().slice(0, 500);
      }
    } catch {}

    const pageLimit = Math.min(pdf.numPages, workerData.maxPages);
    const pages = [];
    let totalChars = 0;
    let truncated = pdf.numPages > pageLimit;

    for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        const strings = [];
        for (const item of content.items || []) {
          if (item && typeof item.str === "string" && item.str.trim()) {
            strings.push(item.str.trim());
          }
        }
        let text = strings.join(" ").replace(/\s+/g, " ").trim();
        const remaining = workerData.maxTextChars - totalChars;
        if (remaining <= 0) {
          truncated = true;
          break;
        }
        if (text.length > remaining) {
          text = text.slice(0, remaining);
          truncated = true;
        }
        totalChars += text.length;
        pages.push({ pageNumber, text });
        if (truncated) break;
      } finally {
        page.cleanup();
      }
    }

    parentPort.postMessage({
      ok: true,
      title,
      pages,
      totalPages: pdf.numPages,
      truncated,
    });
  } finally {
    await loadingTask.destroy();
  }
})().catch((error) => {
  parentPort.postMessage({
    ok: false,
    error:
      error instanceof Error
        ? error.message
        : String(error),
  });
});
`;

export const pdfJsScannerV2Parser: ScannerV2PdfParser = async (
  bytes,
  options,
) => {
  return await new Promise<ScannerV2PdfParseResult>((resolve, reject) => {
    const worker = new Worker(PDF_WORKER_SOURCE, {
      eval: true,
      workerData: {
        bytes,
        maxPages: options.maxPages,
        maxTextChars: options.maxTextChars,
      },
    });

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      void worker.terminate();
      reject(new Error("document_parse_timeout"));
    }, options.timeoutMs);
    timer.unref?.();

    const finish = () => {
      clearTimeout(timer);
      void worker.terminate();
    };

    worker.once("message", (message: unknown) => {
      if (settled) return;
      settled = true;
      finish();
      if (
        typeof message === "object" &&
        message !== null &&
        "ok" in message &&
        (message as { ok?: unknown }).ok === true
      ) {
        const value = message as {
          title?: string;
          pages?: ScannerV2PdfPage[];
          totalPages?: number;
          truncated?: boolean;
        };
        resolve({
          ...(value.title ? { title: value.title } : {}),
          pages: Array.isArray(value.pages) ? value.pages : [],
          totalPages: Number(value.totalPages ?? 0),
          truncated: value.truncated === true,
        });
        return;
      }
      const detail =
        typeof message === "object" &&
        message !== null &&
        "error" in message
          ? String((message as { error?: unknown }).error ?? "")
          : "";
      reject(new Error(detail || "document_parse_failed"));
    });

    worker.once("error", (error) => {
      if (settled) return;
      settled = true;
      finish();
      reject(error);
    });

    worker.once("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(
        new Error(
          code === 0
            ? "document_parser_exited_without_result"
            : `document_parser_exit_${code}`,
        ),
      );
    });
  });
};

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return await new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("document_parse_timeout"));
    }, timeoutMs);
    timer.unref?.();

    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function failure(
  url: string,
  reason: string,
  message: string,
  warnings: string[] = [],
  incomplete = true,
): ScannerV2DocumentFailure {
  return {
    ok: false,
    incomplete,
    url,
    reason,
    message,
    warnings: [...new Set(warnings)],
  };
}

export async function ingestScannerV2Document(
  rawUrl: string,
  options: ScannerV2DocumentOptions,
): Promise<ScannerV2DocumentResult> {
  let origin: URL;
  try {
    origin = new URL(options.origin);
  } catch {
    return failure(rawUrl, "invalid_origin", "The crawl origin was invalid.");
  }

  const policy = normalizeScannerV2Url(rawUrl, origin, {
    applyContentPolicy: true,
  });
  if (!policy.ok) {
    return failure(
      policy.displayUrl,
      policy.reason,
      "The document URL was outside the Scanner V2 public-site policy.",
      [policy.reason],
      policy.incomplete,
    );
  }

  const fetchTimeoutMs = boundedInt(
    options.fetchTimeoutMs,
    DEFAULT_DOCUMENT_FETCH_TIMEOUT_MS,
    250,
    MAX_DOCUMENT_FETCH_TIMEOUT_MS,
  );
  const parseTimeoutMs = boundedInt(
    options.parseTimeoutMs,
    DEFAULT_DOCUMENT_PARSE_TIMEOUT_MS,
    250,
    MAX_DOCUMENT_PARSE_TIMEOUT_MS,
  );
  const maxBytes = boundedInt(
    options.maxBytes,
    DEFAULT_MAX_DOCUMENT_BYTES,
    1024,
    MAX_DOCUMENT_BYTES,
  );
  const maxTextChars = boundedInt(
    options.maxTextChars,
    DEFAULT_MAX_DOCUMENT_TEXT_CHARS,
    1024,
    MAX_DOCUMENT_TEXT_CHARS,
  );
  const maxPdfPages = boundedInt(
    options.maxPdfPages,
    DEFAULT_MAX_PDF_PAGES,
    1,
    MAX_PDF_PAGES,
  );

  let response;
  try {
    response = await fetchPublicHttpsBytes(policy.url, {
      lookup: options.lookup,
      get: options.get,
      timeoutMs: fetchTimeoutMs,
      maxBytes,
      maxRedirects: DEFAULT_MAX_REDIRECTS,
      allowedOrigin: origin.origin,
    });
  } catch (error) {
    const reason =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? String((error as { code?: unknown }).code ?? "fetch_failed")
        : error instanceof Error
          ? error.message
          : "fetch_failed";
    return failure(
      policy.url,
      reason,
      "The public document could not be fetched safely.",
      [reason],
    );
  }

  if (response.status >= 400) {
    return failure(
      response.url.toString(),
      `document_http_${response.status}`,
      "The public document returned an HTTP error.",
      [`document_http_${response.status}`],
    );
  }

  const finalPolicy = normalizeScannerV2Url(response.url.toString(), origin, {
    applyContentPolicy: true,
  });
  if (!finalPolicy.ok) {
    return failure(
      response.url.toString(),
      finalPolicy.reason,
      "The fetched document resolved outside the Scanner V2 public-site policy.",
      [finalPolicy.reason],
      finalPolicy.incomplete,
    );
  }

  const type = contentType(response.headers);
  const classified = classifyDocument({
    url: response.url,
    type,
    bytes: response.body,
  });
  if (!classified.ok) {
    return failure(
      response.url.toString(),
      classified.reason,
      classified.reason === "unsupported_document"
        ? "This public document format is not supported by Scanner V2 yet."
        : "The public document did not match its declared text-bearing format.",
      [classified.reason],
      classified.incomplete,
    );
  }

  const fetchedAt = options.fetchedAt ?? new Date().toISOString();
  const source = {
    url: finalPolicy.url,
    status: response.status,
    bytes: response.body.byteLength,
    contentType: type,
  };

  let title = titleFromUrl(new URL(finalPolicy.url));
  let visibleText = "";
  let sections: Array<{ heading: string[]; text: string }> = [];
  let complete = true;
  const warnings: string[] = [];

  if (classified.kind === "pdf") {
    let parsed: ScannerV2PdfParseResult;
    try {
      parsed = await withTimeout(
        (options.pdfParser ?? pdfJsScannerV2Parser)(
          response.body,
          {
            timeoutMs: parseTimeoutMs,
            maxPages: maxPdfPages,
            maxTextChars,
          },
        ),
        parseTimeoutMs,
      );
    } catch (error) {
      const reason =
        error instanceof Error && /timeout/i.test(error.message)
          ? "document_parse_timeout"
          : "document_parse_failed";
      return failure(
        finalPolicy.url,
        reason,
        "The PDF could not be parsed within the Scanner V2 safety boundary.",
        [reason],
      );
    }

    if (parsed.title) title = parsed.title;
    sections = parsed.pages
      .map((page) => ({
        heading: ["PDF", `Page ${page.pageNumber}`],
        text: cleanText(page.text),
      }))
      .filter((page) => page.text);
    visibleText = sections
      .map((page) => `${page.heading.at(-1)}\n${page.text}`)
      .join("\n\n");
    if (parsed.truncated) {
      complete = false;
      warnings.push("document_limit_reached");
    }
  } else {
    const decoded = cleanText(new TextDecoder("utf-8").decode(response.body));
    if (decoded.length > maxTextChars) {
      visibleText = decoded.slice(0, maxTextChars);
      complete = false;
      warnings.push("document_limit_reached");
    } else {
      visibleText = decoded;
    }
    sections = [
      {
        heading: [classified.kind === "csv" ? "CSV document" : "Text document"],
        text: visibleText,
      },
    ];
  }

  if (!visibleText.trim()) {
    return failure(
      finalPolicy.url,
      "document_empty_text",
      "The public document contained no extractable text.",
      ["document_empty_text"],
    );
  }

  const contentHash = stableContentHash(visibleText);
  const page: CrawlPage = {
    requestedUrl: policy.url,
    canonicalUrl: finalPolicy.url,
    ...(title ? { title } : {}),
    headings: sections.map((section) => section.heading.at(-1) ?? "").filter(Boolean),
    visibleText,
    structuredFacts: {},
    contentType: type || (
      classified.kind === "pdf"
        ? "application/pdf"
        : classified.kind === "csv"
          ? "text/csv"
          : "text/plain"
    ),
    fetchMode: "document",
    contentHash,
    ...(options.discoveredFrom
      ? { discoveredFrom: options.discoveredFrom }
      : {}),
    fetchedAt,
    ...(response.headers.etag
      ? { etag: response.headers.etag }
      : {}),
    ...(response.headers["last-modified"]
      ? { lastModified: response.headers["last-modified"] }
      : {}),
  };
  const chunks = chunksForText({
    canonicalUrl: page.canonicalUrl,
    ...(title ? { title } : {}),
    sections,
  });

  return {
    ok: true,
    complete,
    kind: classified.kind,
    source,
    page,
    chunks,
    warnings,
  };
}

export type ScannerV2DocumentBatchResult = {
  manifest: CrawlManifest;
  pages: CrawlPage[];
  chunks: CorpusChunk[];
  sources: ScannerV2DocumentSuccess["source"][];
  attempted: number;
  succeeded: number;
  warnings: string[];
  incomplete: boolean;
};

export type ScannerV2DocumentBatchOptions = Omit<
  ScannerV2DocumentOptions,
  "origin" | "discoveredFrom"
>;

/**
 * Stage 8 manifest integration.
 *
 * Stage 2/3 already discover same-origin links and retain every URL disposition.
 * This pass consumes only explicit document candidates from that manifest,
 * avoiding any change to the stable HTML discovery loop.
 */
export async function ingestScannerV2ManifestDocuments(
  manifest: CrawlManifest,
  options: ScannerV2DocumentBatchOptions = {},
): Promise<ScannerV2DocumentBatchResult> {
  const rows = manifest.urls.map((row) => structuredClone(row));
  const pages: CrawlPage[] = [];
  const chunks: CorpusChunk[] = [];
  const sources: ScannerV2DocumentSuccess["source"][] = [];
  const warnings: string[] = [];
  let attempted = 0;
  let succeeded = 0;
  let incomplete = manifest.state === "PARTIAL" || manifest.unresolved > 0;

  const replaceRow = (
    url: string,
    patch: Partial<Omit<CrawlUrlDisposition, "url" | "discoveryReason">>,
  ) => {
    const index = rows.findIndex((row) => row.url === url);
    if (index < 0) return;
    rows[index] = { ...rows[index]!, ...structuredClone(patch) };
  };

  for (const row of rows) {
    if (isScannerV2UnsupportedTextDocumentUrl(row.url)) {
      attempted += 1;
      incomplete = true;
      warnings.push("unsupported_document");
      replaceRow(row.url, {
        status: "unresolved",
        reason: "unsupported_document",
      });
      continue;
    }

    if (!isScannerV2SupportedDocumentUrl(row.url)) continue;
    attempted += 1;

    const result = await ingestScannerV2Document(row.url, {
      origin: manifest.origin,
      ...options,
      ...(row.discoveredFrom ? { discoveredFrom: row.discoveredFrom } : {}),
    });

    if (!result.ok) {
      incomplete = incomplete || result.incomplete;
      warnings.push(...result.warnings, result.reason);
      replaceRow(row.url, {
        status: result.incomplete ? "unresolved" : "policy_skipped",
        reason: result.reason,
      });
      continue;
    }

    succeeded += 1;
    pages.push(result.page);
    chunks.push(...result.chunks);
    sources.push(result.source);
    warnings.push(...result.warnings);

    if (!result.complete) {
      incomplete = true;
      replaceRow(row.url, {
        status: "unresolved",
        canonicalUrl: result.page.canonicalUrl,
        reason: "document_limit_reached",
        contentHash: result.page.contentHash,
        fetchedAt: result.page.fetchedAt,
      });
      continue;
    }

    replaceRow(row.url, {
      status: "fetched",
      canonicalUrl: result.page.canonicalUrl,
      reason: undefined,
      contentHash: result.page.contentHash,
      fetchedAt: result.page.fetchedAt,
    });
  }

  const requestedState =
    incomplete
      ? "PARTIAL"
      : manifest.state === "COMPLETE"
        ? "COMPLETE"
        : manifest.state;

  return {
    manifest: buildCrawlManifest({
      crawlId: manifest.crawlId,
      origin: manifest.origin,
      requestedState,
      urls: rows,
    }),
    pages,
    chunks,
    sources,
    attempted,
    succeeded,
    warnings: [...new Set(warnings)],
    incomplete,
  };
}

