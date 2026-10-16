import { extractDraftFromHtml } from "./extract.ts";
import {
  stableChunkId,
  stableContentHash,
} from "./scanner-v2-foundation.ts";
import type {
  CorpusChunk,
  CrawlFetchMode,
  CrawlPage,
} from "./types.ts";

export const DEFAULT_MAX_CHUNK_CHARS = 1_400;
export const DEFAULT_CHUNK_OVERLAP_CHARS = 160;

export type ScannerV2PageInput = {
  requestedUrl: string;
  canonicalUrl?: string;
  html: string;
  contentType?: string;
  fetchMode?: CrawlFetchMode;
  discoveredFrom?: string;
  fetchedAt?: string;
  headers?: Record<string, string>;
};

export type ScannerV2ContentBlockKind =
  | "paragraph"
  | "list_item"
  | "table_row"
  | "definition"
  | "faq"
  | "figure"
  | "body"
  | "navigation"
  | "footer"
  | "header";

export type ScannerV2ContentBlock = {
  kind: ScannerV2ContentBlockKind;
  text: string;
  headingPath: string[];
  boilerplate: boolean;
};

export type ScannerV2PageExtraction = {
  page: CrawlPage;
  contentBlocks: ScannerV2ContentBlock[];
  boilerplateBlocks: ScannerV2ContentBlock[];
  chunks: CorpusChunk[];
};

export type ScannerV2Corpus = {
  pages: CrawlPage[];
  chunks: CorpusChunk[];
};

type WorkingBlock = ScannerV2ContentBlock & {
  atomic: boolean;
};

const BLOCK_BOUNDARY_RE =
  /<\/?(?:address|article|aside|blockquote|div|main|section|p|li|ol|ul|dl|dt|dd|table|thead|tbody|tfoot|tr|td|th|figure|figcaption|details|summary|header|footer|nav|h[1-6])\b[^>]*>/gi;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
  ndash: "–",
  mdash: "—",
  hellip: "…",
  pound: "£",
};

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|([a-z][a-z0-9]+));/gi,
    (_match, decimal: string | undefined, hex: string | undefined, named: string | undefined) => {
      if (decimal) {
        const code = Number.parseInt(decimal, 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : " ";
      }
      if (hex) {
        const code = Number.parseInt(hex, 16);
        return Number.isFinite(code) ? String.fromCodePoint(code) : " ";
      }
      return named ? (NAMED_ENTITIES[named.toLowerCase()] ?? " ") : " ";
    },
  );
}

function normalizeText(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\u00a0/g, " ")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function headerValue(
  headers: Record<string, string> | undefined,
  name: string,
): string | undefined {
  if (!headers) return undefined;
  const entry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  );
  return entry?.[1]?.trim() || undefined;
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map((item) => stableJson(item)).join(",") + "]";
  }
  const object = value as Record<string, unknown>;
  return (
    "{" +
    Object.keys(object)
      .sort()
      .map((key) => JSON.stringify(key) + ":" + stableJson(object[key]))
      .join(",") +
    "}"
  );
}

function extractTitle(html: string): string | undefined {
  const value = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const text = value ? normalizeText(value) : "";
  return text || undefined;
}

function attributeValue(tag: string, name: string): string | undefined {
  const quoted = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "i",
  ).exec(tag);
  if (quoted) return decodeHtmlEntities(quoted[1] ?? quoted[2] ?? "").trim() || undefined;
  const bare = new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, "i").exec(tag);
  return bare?.[1] ? decodeHtmlEntities(bare[1]).trim() : undefined;
}

function removeNonContentMarkup(html: string): string {
  return html
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<template\b[\s\S]*?<\/template>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ");
}

function visibleLines(html: string): string[] {
  const text = decodeHtmlEntities(
    removeNonContentMarkup(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(BLOCK_BOUNDARY_RE, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\u00a0/g, " ")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/[ ]{2,}/g, " ");

  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractBoilerplate(
  html: string,
): { cleanedHtml: string; blocks: WorkingBlock[] } {
  const blocks: WorkingBlock[] = [];
  const pattern = /<(nav|footer|header)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const cleanedHtml = html.replace(pattern, (_full, rawKind: string, inner: string) => {
    const text = normalizeText(inner);
    if (text) {
      const tag = rawKind.toLowerCase();
      const kind: "navigation" | "footer" | "header" =
        tag === "nav" ? "navigation" : tag === "footer" ? "footer" : "header";
      blocks.push({
        kind,
        text,
        headingPath: [],
        boilerplate: true,
        atomic: false,
      });
    }
    return " ";
  });
  return { cleanedHtml, blocks };
}

function replaceStructuredRegions(html: string): string {
  let working = html;

  working = working.replace(
    /<details\b[^>]*>([\s\S]*?)<\/details>/gi,
    (_full, inner: string) => {
      const summaryMatch = /<summary\b[^>]*>([\s\S]*?)<\/summary>/i.exec(inner);
      const question = summaryMatch?.[1] ? normalizeText(summaryMatch[1]) : "";
      const withoutSummary = inner.replace(
        /<summary\b[^>]*>[\s\S]*?<\/summary>/i,
        " ",
      );
      const answer = normalizeText(withoutSummary);
      const combined =
        question && answer
          ? `Q: ${question}\nA: ${answer}`
          : question || answer;
      return combined
        ? `<p data-scanner-kind="faq">${escapeForPseudoHtml(combined)}</p>`
        : " ";
    },
  );

  working = working.replace(
    /<table\b[^>]*>([\s\S]*?)<\/table>/gi,
    (_full, inner: string) => {
      const rows: string[] = [];
      for (const match of inner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
        const cells = [
          ...(match[1] ?? "").matchAll(
            /<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi,
          ),
        ]
          .map((cell) => normalizeText(cell[1] ?? ""))
          .filter(Boolean);
        if (cells.length) rows.push(cells.join(" | "));
      }
      return rows
        .map(
          (row) =>
            `<p data-scanner-kind="table_row">${escapeForPseudoHtml(row)}</p>`,
        )
        .join("");
    },
  );

  working = working.replace(
    /<dl\b[^>]*>([\s\S]*?)<\/dl>/gi,
    (_full, inner: string) => {
      const entries: string[] = [];
      const terms = [
        ...inner.matchAll(
          /<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi,
        ),
      ];
      for (const match of terms) {
        const term = normalizeText(match[1] ?? "");
        const description = normalizeText(match[2] ?? "");
        if (term && description) entries.push(`${term}: ${description}`);
      }
      return entries
        .map(
          (entry) =>
            `<p data-scanner-kind="definition">${escapeForPseudoHtml(entry)}</p>`,
        )
        .join("");
    },
  );

  working = working.replace(
    /<figure\b[^>]*>([\s\S]*?)<\/figure>/gi,
    (_full, inner: string) => {
      const caption = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i.exec(
        inner,
      )?.[1];
      const alt = /<img\b[^>]*>/i.exec(inner)?.[0];
      const captionText = caption ? normalizeText(caption) : "";
      const altText = alt ? attributeValue(alt, "alt") ?? "" : "";
      const text = [captionText, altText && altText !== captionText ? altText : ""]
        .filter(Boolean)
        .join(" — ");
      return text
        ? `<p data-scanner-kind="figure">${escapeForPseudoHtml(text)}</p>`
        : " ";
    },
  );

  working = working.replace(/<img\b[^>]*>/gi, (tag) => {
    const alt = attributeValue(tag, "alt");
    return alt
      ? `<p data-scanner-kind="figure">${escapeForPseudoHtml(alt)}</p>`
      : " ";
  });

  return working;
}

function escapeForPseudoHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function extractHeadingRecords(html: string): Array<{
  level: number;
  text: string;
  index: number;
}> {
  const out: Array<{ level: number; text: string; index: number }> = [];
  for (const match of html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const text = normalizeText(match[2] ?? "");
    if (!text) continue;
    out.push({
      level: Number(match[1]),
      text,
      index: match.index ?? 0,
    });
  }
  return out;
}

function blockKindFromTag(tag: string, attributes: string): ScannerV2ContentBlockKind {
  const explicit = attributeValue(attributes, "data-scanner-kind");
  if (
    explicit === "faq" ||
    explicit === "table_row" ||
    explicit === "definition" ||
    explicit === "figure"
  ) {
    return explicit;
  }
  if (tag === "li") return "list_item";
  return "paragraph";
}

function structuredBlocks(html: string): WorkingBlock[] {
  const processed = replaceStructuredRegions(removeNonContentMarkup(html));
  const headings = extractHeadingRecords(processed);
  const events: Array<
    | { type: "heading"; index: number; level: number; text: string }
    | {
        type: "block";
        index: number;
        kind: ScannerV2ContentBlockKind;
        text: string;
        atomic: boolean;
      }
  > = headings.map((heading) => ({
    type: "heading",
    ...heading,
  }));

  for (const match of processed.matchAll(
    /<(p|li)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
  )) {
    const text = normalizeText(match[3] ?? "");
    if (!text) continue;
    const kind = blockKindFromTag(
      (match[1] ?? "p").toLowerCase(),
      match[2] ?? "",
    );
    events.push({
      type: "block",
      index: match.index ?? 0,
      kind,
      text,
      atomic:
        kind === "faq" ||
        kind === "table_row" ||
        kind === "definition" ||
        kind === "figure",
    });
  }

  events.sort((a, b) => a.index - b.index);
  const headingPath: string[] = [];
  const blocks: WorkingBlock[] = [];
  const represented = new Set<string>();

  for (const event of events) {
    if (event.type === "heading") {
      headingPath.splice(event.level - 1);
      headingPath[event.level - 1] = event.text;
      continue;
    }
    const normalized = event.text.trim();
    if (!normalized) continue;
    represented.add(normalized.toLowerCase());
    blocks.push({
      kind: event.kind,
      text: normalized,
      headingPath: headingPath.filter(Boolean),
      boilerplate: false,
      atomic: event.atomic,
    });
  }

  // Capture meaningful text from div/section-heavy sites that did not use
  // semantic p/li markup. This is additive and exact-string de-duplicated.
  for (const line of visibleLines(processed)) {
    const key = line.toLowerCase();
    if (represented.has(key)) continue;
    if (headings.some((heading) => heading.text.toLowerCase() === key)) continue;
    if (line.length < 12) continue;
    represented.add(key);
    blocks.push({
      kind: "body",
      text: line,
      headingPath: [],
      boilerplate: false,
      atomic: false,
    });
  }

  return blocks;
}

function pageHeadings(html: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const heading of extractHeadingRecords(removeNonContentMarkup(html))) {
    const key = heading.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(heading.text);
  }
  return out;
}

function splitLongText(
  text: string,
  maxChars: number,
  overlapChars: number,
): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + maxChars);
    if (end < text.length) {
      const sentenceBreak = Math.max(
        text.lastIndexOf(". ", end),
        text.lastIndexOf("! ", end),
        text.lastIndexOf("? ", end),
        text.lastIndexOf("\n", end),
      );
      const wordBreak = text.lastIndexOf(" ", end);
      const candidate =
        sentenceBreak > start + Math.floor(maxChars * 0.55)
          ? sentenceBreak + 1
          : wordBreak > start + Math.floor(maxChars * 0.55)
            ? wordBreak
            : end;
      end = candidate;
    }
    const piece = text.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end >= text.length) break;
    start = Math.max(end - overlapChars, start + 1);
  }
  return chunks;
}

function chunkBlocks(input: {
  canonicalUrl: string;
  title?: string;
  blocks: readonly WorkingBlock[];
  maxChars?: number;
  overlapChars?: number;
}): CorpusChunk[] {
  const maxChars = Math.max(
    400,
    Math.min(4_000, Math.trunc(input.maxChars ?? DEFAULT_MAX_CHUNK_CHARS)),
  );
  const overlapChars = Math.max(
    0,
    Math.min(
      Math.floor(maxChars / 3),
      Math.trunc(input.overlapChars ?? DEFAULT_CHUNK_OVERLAP_CHARS),
    ),
  );

  const chunks: CorpusChunk[] = [];
  let ordinal = 0;
  let pendingText = "";
  let pendingHeadingPath: string[] = [];

  const emit = (text: string, headingPath: string[]) => {
    for (const piece of splitLongText(text, maxChars, overlapChars)) {
      const contentHash = stableContentHash(piece);
      chunks.push({
        id: stableChunkId(input.canonicalUrl, ordinal, piece),
        canonicalUrl: input.canonicalUrl,
        ...(input.title ? { title: input.title } : {}),
        headingPath: [...headingPath],
        text: piece,
        ordinal,
        contentHash,
      });
      ordinal += 1;
    }
  };

  const flush = () => {
    if (!pendingText.trim()) return;
    emit(pendingText.trim(), pendingHeadingPath);
    pendingText = "";
    pendingHeadingPath = [];
  };

  for (const block of input.blocks) {
    if (block.boilerplate) continue;
    if (block.atomic) {
      flush();
      emit(block.text, block.headingPath);
      continue;
    }

    const sameHeading =
      pendingText &&
      pendingHeadingPath.join("\u0000") === block.headingPath.join("\u0000");
    const candidate = sameHeading
      ? pendingText + "\n" + block.text
      : block.text;

    if (!sameHeading) flush();
    if (sameHeading && candidate.length > maxChars) {
      flush();
    }

    if (!pendingText) {
      pendingHeadingPath = [...block.headingPath];
      pendingText = block.text;
    } else {
      pendingText += "\n" + block.text;
    }
  }
  flush();

  return chunks;
}

function extractPageInternal(input: ScannerV2PageInput): ScannerV2PageExtraction {
  const requested = new URL(input.requestedUrl);
  const canonical = new URL(input.canonicalUrl ?? input.requestedUrl);
  const safeCanonical = canonical.toString();
  const boilerplate = extractBoilerplate(input.html);
  const mainHtml = boilerplate.cleanedHtml;
  const contentBlocks = structuredBlocks(mainHtml);
  const boilerplateBlocks = boilerplate.blocks;
  const headings = pageHeadings(input.html);
  const allVisible = [
    ...boilerplateBlocks.map((block) => block.text),
    ...headings,
    ...contentBlocks.map((block) => block.text),
  ]
    .map((line) => line.trim())
    .filter(Boolean);
  const visibleText = [...new Set(allVisible)].join("\n");
  const extracted = extractDraftFromHtml([
    { url: safeCanonical, html: input.html },
  ]);
  const structuredFacts = structuredClone(
    extracted.facts as unknown as Record<string, unknown>,
  );
  if (Object.keys(extracted.factMeta).length) {
    structuredFacts._factMeta = extracted.factMeta;
  }
  const contentHash = stableContentHash(
    visibleText + "\n\u0000structured\u0000\n" + stableJson(structuredFacts),
  );
  const fetchedAt = input.fetchedAt ?? new Date().toISOString();
  const page: CrawlPage = {
    requestedUrl: requested.toString(),
    canonicalUrl: safeCanonical,
    ...(extractTitle(input.html) ? { title: extractTitle(input.html) } : {}),
    headings,
    visibleText,
    structuredFacts,
    contentType: input.contentType ?? "text/html",
    fetchMode: input.fetchMode ?? "http",
    contentHash,
    ...(input.discoveredFrom ? { discoveredFrom: input.discoveredFrom } : {}),
    fetchedAt,
    ...(headerValue(input.headers, "etag")
      ? { etag: headerValue(input.headers, "etag") }
      : {}),
    ...(headerValue(input.headers, "last-modified")
      ? { lastModified: headerValue(input.headers, "last-modified") }
      : {}),
  };

  return {
    page,
    contentBlocks,
    boilerplateBlocks,
    chunks: chunkBlocks({
      canonicalUrl: safeCanonical,
      title: page.title,
      blocks: contentBlocks,
    }),
  };
}

export function extractScannerV2Page(
  input: ScannerV2PageInput,
): ScannerV2PageExtraction {
  return extractPageInternal(input);
}

export function buildScannerV2Corpus(
  inputs: readonly ScannerV2PageInput[],
): ScannerV2Corpus {
  const extracted = inputs.map((input) => extractPageInternal(input));
  const pages = extracted.map((item) => item.page);
  const chunks = extracted.flatMap((item) => item.chunks);

  // Retain repeated site-wide navigation/header/footer text once, rather than
  // letting it dominate every page's retrieval chunks.
  const boilerplateOwners = new Map<
    string,
    { block: WorkingBlock; canonicalUrl: string; title?: string }
  >();
  for (const item of extracted) {
    for (const block of item.boilerplateBlocks) {
      const key = stableContentHash(block.kind + "\u0000" + block.text);
      if (!boilerplateOwners.has(key)) {
        boilerplateOwners.set(key, {
          block: { ...block, atomic: false },
          canonicalUrl: item.page.canonicalUrl,
          ...(item.page.title ? { title: item.page.title } : {}),
        });
      }
    }
  }

  for (const { block, canonicalUrl, title } of boilerplateOwners.values()) {
    const heading =
      block.kind === "footer"
        ? ["Site-wide footer"]
        : block.kind === "navigation"
          ? ["Site-wide navigation"]
          : ["Site-wide header"];
    const sitewide = chunkBlocks({
      canonicalUrl,
      title,
      blocks: [
        {
          ...block,
          headingPath: heading,
          boilerplate: false,
          atomic: false,
        },
      ],
    });
    // Re-number site-wide chunks after normal page chunks for the same source
    // URL so stable IDs never collide on ordinal zero.
    for (const chunk of sitewide) {
      const ordinal =
        chunks.filter((existing) => existing.canonicalUrl === canonicalUrl)
          .length;
      chunks.push({
        ...chunk,
        ordinal,
        id: stableChunkId(canonicalUrl, ordinal, chunk.text),
      });
    }
  }

  chunks.sort((a, b) =>
    a.canonicalUrl === b.canonicalUrl
      ? a.ordinal - b.ordinal
      : a.canonicalUrl.localeCompare(b.canonicalUrl),
  );

  return { pages, chunks };
}
