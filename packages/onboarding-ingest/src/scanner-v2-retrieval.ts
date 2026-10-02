import type { CorpusChunk } from "./types.ts";

export const DEFAULT_SEARCH_LIMIT = 8;
export const MAX_SEARCH_LIMIT = 50;

const BM25_K1 = 1.2;
const BM25_B = 0.75;
const TITLE_WEIGHT = 3.0;
const HEADING_WEIGHT = 2.0;
const BODY_WEIGHT = 1.0;
const EXACT_PHRASE_BONUS = 2.5;
const EXACT_IDENTIFIER_BONUS = 4.0;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "do",
  "does",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "our",
  "the",
  "to",
  "what",
  "when",
  "where",
  "which",
  "with",
  "you",
  "your",
]);

const SYNONYM_GROUPS = [
  ["price", "prices", "pricing", "cost", "costs", "charge", "charges", "fee", "fees"],
  ["hours", "hour", "opening", "open", "times", "time"],
  ["return", "returns", "refund", "refunds"],
  ["delivery", "deliver", "delivers", "shipping", "ship"],
  ["installation", "install", "installs", "fitting", "fit"],
  ["telephone", "phone", "call", "calling"],
  ["address", "location", "locations"],
  ["service", "services", "work"],
  ["wait", "waiting", "leadtime", "lead-time"],
] as const;

const SYNONYM_CANONICAL = new Map<string, string>();
for (const group of SYNONYM_GROUPS) {
  const canonical = group[0]!;
  for (const token of group) SYNONYM_CANONICAL.set(token, canonical);
}

const IDENTIFIER_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(?:\+?44\s?\(0\)\s?|\+?44\s?|0)(?:\d[\s().-]?){8,12}\b/g,
  /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi,
  /\b[A-Z]{2,}[\-_]?\d{2,}[A-Z0-9\-_]*\b/gi,
  /\b\d+(?:\.\d+)?%\b/g,
  /£\s?\d+(?:\.\d{1,2})?/g,
] as const;

export type CorpusSearchHit = {
  chunkId: string;
  canonicalUrl: string;
  title?: string;
  headingPath: string[];
  text: string;
  ordinal: number;
  score: number;
  matchedTerms: string[];
  matchedIdentifiers: string[];
};

export type CorpusIndexStats = {
  crawlId: string;
  documentCount: number;
  uniqueTermCount: number;
  averageDocumentLength: number;
};

export interface CorpusIndex {
  index(crawlId: string, chunks: readonly CorpusChunk[]): Promise<void>;
  search(
    crawlId: string,
    query: string,
    limit?: number,
  ): Promise<CorpusSearchHit[]>;
  stats(crawlId: string): Promise<CorpusIndexStats>;
  clear(crawlId: string): Promise<void>;
}

type IndexedDocument = {
  chunk: CorpusChunk;
  terms: Map<string, number>;
  weightedLength: number;
  searchableText: string;
  identifiers: Set<string>;
};

type CrawlIndex = {
  documents: IndexedDocument[];
  documentFrequency: Map<string, number>;
  averageDocumentLength: number;
};

function normalizeUnicode(value: string): string {
  return value.normalize("NFKC").toLowerCase();
}

function stem(token: string): string {
  if (token.length <= 4) return token;
  if (token.endsWith("ies") && token.length > 5) {
    return token.slice(0, -3) + "y";
  }
  if (token.endsWith("ing") && token.length > 6) {
    const base = token.slice(0, -3);
    if (base.length > 3) return base;
  }
  if (token.endsWith("ed") && token.length > 5) return token.slice(0, -2);
  if (token.endsWith("es") && token.length > 5) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 4) return token.slice(0, -1);
  return token;
}

function canonicalToken(token: string): string {
  const raw = normalizeUnicode(token);
  const direct = SYNONYM_CANONICAL.get(raw);
  if (direct) return direct;
  const stemmed = stem(raw);
  return SYNONYM_CANONICAL.get(stemmed) ?? stemmed;
}

function tokenize(value: string): string[] {
  const words = normalizeUnicode(value).match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu) ?? [];
  const out: string[] = [];
  for (const word of words) {
    const token = canonicalToken(word);
    if (!token || STOP_WORDS.has(token)) continue;
    out.push(token);
  }
  return out;
}

function normalizeIdentifier(value: string): string {
  return normalizeUnicode(value).replace(/[\s().-]+/g, "");
}

function extractIdentifiers(value: string): Set<string> {
  const out = new Set<string>();
  for (const pattern of IDENTIFIER_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of value.matchAll(pattern)) {
      const raw = match[0]?.trim();
      if (!raw) continue;
      out.add(normalizeIdentifier(raw));
    }
  }
  return out;
}

function termFrequency(tokens: readonly string[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const token of tokens) out.set(token, (out.get(token) ?? 0) + 1);
  return out;
}

function mergeWeightedTerms(
  target: Map<string, number>,
  source: Map<string, number>,
  weight: number,
): void {
  for (const [term, count] of source) {
    target.set(term, (target.get(term) ?? 0) + count * weight);
  }
}

function buildDocument(chunk: CorpusChunk): IndexedDocument {
  const titleTokens = tokenize(chunk.title ?? "");
  const headingTokens = tokenize(chunk.headingPath.join(" "));
  const bodyTokens = tokenize(chunk.text);
  const terms = new Map<string, number>();
  mergeWeightedTerms(terms, termFrequency(titleTokens), TITLE_WEIGHT);
  mergeWeightedTerms(terms, termFrequency(headingTokens), HEADING_WEIGHT);
  mergeWeightedTerms(terms, termFrequency(bodyTokens), BODY_WEIGHT);
  const weightedLength =
    titleTokens.length * TITLE_WEIGHT +
    headingTokens.length * HEADING_WEIGHT +
    bodyTokens.length * BODY_WEIGHT;
  const searchableText = normalizeUnicode(
    [chunk.title ?? "", chunk.headingPath.join(" "), chunk.text].join("\n"),
  );
  return {
    chunk: structuredClone(chunk),
    terms,
    weightedLength: Math.max(weightedLength, 1),
    searchableText,
    identifiers: extractIdentifiers(searchableText),
  };
}

function requestedLimit(value: number | undefined): number {
  if (!Number.isFinite(value)) return DEFAULT_SEARCH_LIMIT;
  return Math.max(1, Math.min(MAX_SEARCH_LIMIT, Math.trunc(value as number)));
}

function roundedScore(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function exactPhrase(value: string): string {
  return normalizeUnicode(value).replace(/\s+/g, " ").trim();
}

export class InMemoryBm25CorpusIndex implements CorpusIndex {
  private readonly indexes = new Map<string, CrawlIndex>();

  async index(
    crawlId: string,
    chunks: readonly CorpusChunk[],
  ): Promise<void> {
    const documents = [...chunks]
      .map((chunk) => buildDocument(chunk))
      .sort((a, b) =>
        a.chunk.canonicalUrl === b.chunk.canonicalUrl
          ? a.chunk.ordinal - b.chunk.ordinal || a.chunk.id.localeCompare(b.chunk.id)
          : a.chunk.canonicalUrl.localeCompare(b.chunk.canonicalUrl),
      );

    const documentFrequency = new Map<string, number>();
    let totalLength = 0;
    for (const document of documents) {
      totalLength += document.weightedLength;
      for (const term of document.terms.keys()) {
        documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
      }
    }

    this.indexes.set(crawlId, {
      documents,
      documentFrequency,
      averageDocumentLength: documents.length
        ? totalLength / documents.length
        : 0,
    });
  }

  async search(
    crawlId: string,
    query: string,
    limit?: number,
  ): Promise<CorpusSearchHit[]> {
    const index = this.indexes.get(crawlId);
    if (!index || index.documents.length === 0) return [];

    const queryTokens = [...new Set(tokenize(query))];
    const queryIdentifiers = extractIdentifiers(query);
    if (queryTokens.length === 0 && queryIdentifiers.size === 0) return [];

    const phrase = exactPhrase(query);
    const results: CorpusSearchHit[] = [];
    const documentCount = index.documents.length;
    const averageLength = Math.max(index.averageDocumentLength, 1);

    for (const document of index.documents) {
      let score = 0;
      const matchedTerms: string[] = [];
      for (const term of queryTokens) {
        const tf = document.terms.get(term) ?? 0;
        if (tf <= 0) continue;
        matchedTerms.push(term);
        const df = index.documentFrequency.get(term) ?? 0;
        const idf = Math.log(
          1 + (documentCount - df + 0.5) / (df + 0.5),
        );
        const denominator =
          tf +
          BM25_K1 *
            (1 -
              BM25_B +
              BM25_B * (document.weightedLength / averageLength));
        score += idf * ((tf * (BM25_K1 + 1)) / denominator);
      }

      const matchedIdentifiers = [...queryIdentifiers].filter((identifier) =>
        document.identifiers.has(identifier),
      );
      if (matchedIdentifiers.length > 0) {
        score += matchedIdentifiers.length * EXACT_IDENTIFIER_BONUS;
      }

      if (
        phrase.length >= 4 &&
        queryTokens.length >= 2 &&
        document.searchableText.includes(phrase)
      ) {
        score += EXACT_PHRASE_BONUS;
      }

      if (score <= 0) continue;

      const chunk = document.chunk;
      results.push({
        chunkId: chunk.id,
        canonicalUrl: chunk.canonicalUrl,
        ...(chunk.title ? { title: chunk.title } : {}),
        headingPath: [...chunk.headingPath],
        text: chunk.text,
        ordinal: chunk.ordinal,
        score: roundedScore(score),
        matchedTerms: matchedTerms.sort(),
        matchedIdentifiers: matchedIdentifiers.sort(),
      });
    }

    results.sort((a, b) =>
      b.score - a.score ||
      a.canonicalUrl.localeCompare(b.canonicalUrl) ||
      a.ordinal - b.ordinal ||
      a.chunkId.localeCompare(b.chunkId),
    );

    return results.slice(0, requestedLimit(limit));
  }

  async stats(crawlId: string): Promise<CorpusIndexStats> {
    const index = this.indexes.get(crawlId);
    if (!index) {
      return {
        crawlId,
        documentCount: 0,
        uniqueTermCount: 0,
        averageDocumentLength: 0,
      };
    }
    return {
      crawlId,
      documentCount: index.documents.length,
      uniqueTermCount: index.documentFrequency.size,
      averageDocumentLength: roundedScore(index.averageDocumentLength),
    };
  }

  async clear(crawlId: string): Promise<void> {
    this.indexes.delete(crawlId);
  }
}
