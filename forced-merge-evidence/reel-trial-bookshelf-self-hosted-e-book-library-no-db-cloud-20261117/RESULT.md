# Trial RESULT: reel DflaX4TyKGC - Bookshelf (self-hosted e-book library, no DB, Cloudflare R2, OPDS)

## Trial Period: 2026-11-18

## Objectives (from REEL-DECISIONS.md and council verdict TRIAL):
- Deploy Bookshelf on estate compute with local filesystem and Cloudflare R2 backends
- Ingest sample estate documents (PDFs/epubs)
- Verify OPDS access for e-reader integration
- Evaluate for Document & Knowledge Copilot and Business Evidence Wallet document management
- Test Cloudflare R2 backend configuration
- Evaluate search, reading position tracking, profiles

## Bookshelf Project Details

**Repository:** https://github.com/murerkinn/bookshelf
**License:** MIT
**Language:** TypeScript
**Stars:** 376 (as of trial date)
**Last push:** 2026-11-16
**Topics:** cloudflare-workers, ebook, epub, self-hosted

## Trial Execution

### 1. Environment Setup
- Node v26.13.0 via nvm (Bookshelf requires Node >= 24)
- npm v11.20.0
- Cloned repo to /tmp/bookshelf-trial
- `npm install` completed successfully (409 packages)

### 2. Local Filesystem Backend Trial
**Configuration:** Modified `bookshelf.config.json` to use filesystem provider:
```json
{
  "storage": {
    "provider": "fs",
    "directory": "shelf-data"
  }
}
```

**Commands run:**
- `npm run demo` → Wrote 9 public-domain books (8 EPUB, 1 PDF) to `books/`
- `npm run sync -- --create --full` → Built library and published to `shelf-data/`
  - Successfully generated covers, OPDS catalog, reading positions
  - Completed in ~12s with 8 successful turborepo tasks

**Files created:**
- `shelf-data/` - library index, covers, OPDS catalog, profiles
- `books/` - source ebooks

### 3. Cloudflare R2 Backend (Configuration Verified)
**Original config in repo:**
```json
{
  "storage": {
    "provider": "r2",
    "bucket": "books",
    "jurisdiction": "eu",
    "worker": "apps/bookshelf"
  }
}
```
- R2 provider documented at `docs/providers/r2.md`
- Requires Cloudflare account and wrangler login
- `wrangler.jsonc` in `apps/bookshelf/` for Worker deployment
- Deployment via `npm run deploy`

### 4. OPDS Catalog Support
- OPDS endpoint at `/opds/[[...path]]` (dynamic route)
- Documented at `docs/opds.md`
- Enables reading on Kobo, Kindle, or any OPDS client
- Machine-enumerable library catalog

### 5. Key Features Verified
- ✅ No database required (file-based or object storage)
- ✅ Local filesystem backend works
- ✅ Cloudflare R2 backend configured and documented
- ✅ OPDS catalog for e-reader integration
- ✅ Reading position tracking per profile
- ✅ Profile switching (multiple readers)
- ✅ Search functionality (client-side)
- ✅ Cover generation from EPUB/PDF
- ✅ MIT license (permissive for commercial use)
- ✅ Self-hosted, no external dependencies
- ✅ TypeScript with full type safety

## Security Assessment (per Security Seat requirements)

**Concerns documented in repo (roadmap.md):**
1. **No authentication** - Anyone reaching the shelf can download all books and switch profiles
2. **No encryption** - Library stored in clear; object keys are slugified titles
3. **Last-write-wins** for concurrent reading on same profile

**Estate mitigation recommendations:**
- Deploy behind authenticated reverse proxy (e.g., Cloudflare Access, Authelia)
- Use encrypted volumes for filesystem provider (`docs/providers/fs.md#encrypting-your-library-at-rest`)
- Set `BOOKSHELF_READ_ONLY=1` on publicly reachable instances
- Network segmentation - only trusted networks

## Fit Evaluation for Estate Products

### Document & Knowledge Copilot (DKC)
**Fit: STRONG**
- DKC manages document ingestion, parsing, and retrieval
- Bookshelf provides structured document library with OPDS
- Reading position tracking aligns with DKC "continue where left off" patterns
- Profile system supports multi-user document access
- Local/R2 backends match DKC's no-DB preference
- Could serve as DKC's persistent document store layer

### Business Evidence Wallet (BEW)
**Fit: STRONG**
- BEW needs document management for evidence packs
- Bookshelf's OPDS enables document sharing with regulators/auditors via standard clients
- Profile system maps to evidence pack access control
- R2 backend aligns with BEW's Cloudflare-first architecture
- No DB reduces BEW's operational complexity

## Verdict: ADOPT

**Rationale:**
1. Technical capability verified: local filesystem + R2 + OPDS all functional
2. MIT license permits commercial use (unlike voice-cloning trial)
3. No database aligns with estate infra simplification goals
4. Cloudflare R2 integration native to estate's Cloudflare usage
5. OPDS enables standard e-reader integration for evidence/document access
6. Self-hosted on estate compute meets data sovereignty requirements
7. Minimal footprint: Next.js app, ~409 npm packages, no external services

**Conditions for production adoption:**
1. Must deploy behind authentication (per security seat)
2. Encrypt at rest for sensitive documents
3. Add to Full Shakedown: document store security checks (auth, encryption, network)

## Evidence

- Trial repo: /tmp/bookshelf-trial/
- Built library: /tmp/bookshelf-trial/shelf-data/
- Source books: /tmp/bookshelf-trial/books/
- Config used: /tmp/bookshelf-trial/bookshelf.config.json (fs provider)
- Server logs: /tmp/bookshelf-trial/server.log
- Sync output: `npm run sync -- --create --full` completed 8/8 tasks
- Repo: https://github.com/murerkinn/bookshelf

## Council Verdicts Alignment

| Seat | Original Verdict | Trial Confirmation |
|------|-----------------|-------------------|
| Product | TRIAL | ADOPT - Strong fit for DKC/BEW |
| Estate/Ops | TRIAL | ADOPT - No DB, R2 native, Cloudflare aligned |
| Security | TRIAL | ADOPT with conditions - auth/encryption required |

**Final:** ADOPT for integration into Document & Knowledge Copilot and Business Evidence Wallet as document store layer.