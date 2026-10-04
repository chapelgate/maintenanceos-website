export {
  allowPublicHttpsUrl,
  assertResolvedAddressesPublic,
  isProbablyPublicHostname,
} from "./ssrf.ts";
export {
  extractDraftFromHtml,
  asUntrustedText,
  extractJsonLd,
  extractMicrodata,
  extractTelMailto,
} from "./extract.ts";
export {
  fetchPublicHttps,
  fetchPublicHttpsBytes,
  httpsGetBytesToIp,
} from "./fetch-safe.ts";
export { isWebIngestEnabled, runScan } from "./scan.ts";
export {
  extractScannerV2Page,
  buildScannerV2Corpus,
  DEFAULT_MAX_CHUNK_CHARS,
  DEFAULT_CHUNK_OVERLAP_CHARS,
} from "./scanner-v2-content.ts";
export type {
  ScannerV2PageInput,
  ScannerV2ContentBlockKind,
  ScannerV2ContentBlock,
  ScannerV2PageExtraction,
  ScannerV2Corpus,
} from "./scanner-v2-content.ts";
export {
  discoverScannerV2Frontier,
  discoverHtmlLinks,
  parseRobotsSitemaps,
  parseSitemapXml,
  DEFAULT_MAX_SITEMAP_DOCUMENTS,
  DEFAULT_MAX_SITEMAP_DEPTH,
  DEFAULT_MAX_DISCOVERED_URLS,
  DEFAULT_MAX_HTML_PAGES,
  DEFAULT_MAX_SITEMAP_BYTES,
  DEFAULT_MAX_HTML_BYTES,
  DEFAULT_SITEMAP_TIMEOUT_MS,
  DEFAULT_HTML_TIMEOUT_MS,
} from "./scanner-v2-discovery.ts";
export type {
  SitemapKind,
  SitemapEntry,
  ParsedSitemap,
  ScannerV2DiscoveryResult,
  ScannerV2DiscoveryOptions,
} from "./scanner-v2-discovery.ts";
export {
  DEFAULT_MAX_PATH_DEPTH,
  DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE,
  DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY,
  normalizeScannerV2Url,
  extractScannerV2CanonicalLink,
  ScannerV2FrontierTrapGuard,
} from "./scanner-v2-url-policy.ts";
export type {
  ScannerV2UrlPolicyReason,
  ScannerV2UrlPolicyResult,
  ScannerV2UrlPolicyOptions,
  FrontierTrapDecision,
} from "./scanner-v2-url-policy.ts";
export {
  InMemoryBm25CorpusIndex,
  DEFAULT_SEARCH_LIMIT,
  MAX_SEARCH_LIMIT,
} from "./scanner-v2-retrieval.ts";
export type {
  CorpusIndex,
  CorpusSearchHit,
  CorpusIndexStats,
} from "./scanner-v2-retrieval.ts";
export {
  answerGroundedReceptionistQuestion,
  verifyGroundedSynthesis,
  DEFAULT_GROUNDED_RETRIEVAL_LIMIT,
  MAX_GROUNDED_ANSWER_CHARS,
} from "./scanner-v2-grounding.ts";
export {
  ingestScannerV2Document,
  ingestScannerV2ManifestDocuments,
  pdfJsScannerV2Parser,
  isScannerV2SupportedDocumentUrl,
  isScannerV2UnsupportedTextDocumentUrl,
  isScannerV2DocumentContentType,
  isScannerV2UnsupportedDocumentContentType,
  DEFAULT_DOCUMENT_FETCH_TIMEOUT_MS,
  MAX_DOCUMENT_FETCH_TIMEOUT_MS,
  DEFAULT_DOCUMENT_PARSE_TIMEOUT_MS,
  MAX_DOCUMENT_PARSE_TIMEOUT_MS,
  DEFAULT_MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_BYTES,
  DEFAULT_MAX_DOCUMENT_TEXT_CHARS,
  MAX_DOCUMENT_TEXT_CHARS,
  DEFAULT_MAX_PDF_PAGES,
  MAX_PDF_PAGES,
} from "./scanner-v2-documents.ts";
export type {
  ScannerV2DocumentKind,
  ScannerV2PdfPage,
  ScannerV2PdfParseResult,
  ScannerV2PdfParser,
  ScannerV2DocumentSuccess,
  ScannerV2DocumentFailure,
  ScannerV2DocumentResult,
  ScannerV2DocumentOptions,
  ScannerV2DocumentBatchResult,
  ScannerV2DocumentBatchOptions,
} from "./scanner-v2-documents.ts";
export {
  decideScannerV2RenderEscalation,
  renderScannerV2Page,
  playwrightScannerV2BrowserBackend,
  renderFailureDisposition,
  renderResultToPageInput,
  DEFAULT_RENDER_TIMEOUT_MS,
  MAX_RENDER_TIMEOUT_MS,
  DEFAULT_RENDER_MAX_DOM_BYTES,
  MAX_RENDER_DOM_BYTES,
  DEFAULT_RENDER_MAX_TOTAL_BYTES,
  MAX_RENDER_TOTAL_BYTES,
  DEFAULT_RENDER_MAX_RESOURCE_BYTES,
  MAX_RENDER_REQUESTS,
  MAX_RENDER_ORIGINS,
  DEFAULT_RENDER_SETTLE_MS,
  MAX_RENDER_SETTLE_MS,
  DEFAULT_RENDER_MAX_SCROLL_STEPS,
  MAX_RENDER_SCROLL_STEPS,
  DEFAULT_RENDER_SCROLL_SETTLE_MS,
  MAX_RENDER_SCROLL_SETTLE_MS,
  DEFAULT_RENDER_MAX_SHADOW_HOSTS,
  MAX_RENDER_SHADOW_HOSTS,
} from "./scanner-v2-renderer.ts";
export type {
  ScannerV2RenderEscalationReason,
  ScannerV2RenderEscalationDecision,
  ScannerV2RenderRequest,
  ScannerV2RenderResourceResult,
  ScannerV2RenderBlockedRequest,
  ScannerV2BrowserBackendInput,
  ScannerV2BrowserBackendResult,
  ScannerV2BrowserBackend,
  ScannerV2RenderOptions,
  ScannerV2RenderSuccess,
  ScannerV2RenderFailure,
  ScannerV2RenderResult,
} from "./scanner-v2-renderer.ts";
export type {
  GroundedValue,
  GroundedFaq,
  ReceptionistGroundingFacts,
  GroundedEvidence,
  GroundedAnswerSource,
  GroundedReceptionistAnswer,
  GroundedSynthesizer,
  GroundedAnswerOptions,
} from "./scanner-v2-grounding.ts";
export {
  SCANNER_V2_ENV,
  isScannerV2Enabled,
  stableContentHash,
  stableChunkId,
  buildCrawlManifest,
  InMemoryScannerV2Store,
} from "./scanner-v2-foundation.ts";
export {
  SCANNER_V2_STATUS_SOURCE_PREVIEW_LIMIT,
  projectScannerV2OperationalStatus,
} from "./scanner-v2-status.ts";
export type {
  ScannerV2Completeness,
  ScannerV2OperationalStatus,
} from "./scanner-v2-status.ts";
export type {
  CorpusStore,
  FrontierStore,
  CrawlLeaseStore,
} from "./scanner-v2-foundation.ts";
export {
  createScanServer,
  handleScanRequest,
  listenScanServer,
  resolveListenHost,
  resolveListenPort,
  DEFAULT_HOST,
  DEFAULT_PORT,
} from "./server.ts";
export type {
  PartialDraft,
  ReceptionistDraft,
  DraftFieldMeta,
  FieldMeta,
  FieldSource,
  FieldConfidence,
  ScanResult,
  ScanSuccess,
  ScanFailure,
  SafeBinaryHttpResponse,
  BinaryHttpGetFn,
  CrawlState,
  CrawlUrlStatus,
  CrawlDiscoveryReason,
  CrawlFetchMode,
  CrawlUrlDisposition,
  CrawlPage,
  CorpusChunk,
  CrawlManifest,
  CrawlLease,
  CrawlJob,
} from "./types.ts";

export {
  buildScannerV2ConditionalHeaders,
  buildScannerV2RefreshSeed,
  createScannerV2RefreshJob,
  createScannerV2RefreshProcessor,
  FileScannerV2VersionStore,
  commitScannerV2CrawlVersion,
} from "./scanner-v2-refresh.ts";
export type {
  ScannerV2RefreshVersion,
  ScannerV2RefreshOptions,
  ScannerV2RefreshSeed,
  ScannerV2VersionStore,
} from "./scanner-v2-refresh.ts";

export {
  DEFAULT_WORKER_BATCH_SIZE,
  DEFAULT_WORKER_LEASE_MS,
  DEFAULT_WORKER_RETRY_LIMIT,
  FileScannerV2JobStore,
  createScannerV2Job,
  runScannerV2WorkerBatch,
} from "./scanner-v2-worker.ts";
export type {
  ScannerV2JobStore,
  ScannerV2ProcessResult,
  ScannerV2ProcessUrl,
  ScannerV2WorkerBatchResult,
} from "./scanner-v2-worker.ts";
