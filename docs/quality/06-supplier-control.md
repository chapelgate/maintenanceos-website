# Supplier and External Provider Control (ISO 9001:2015 Clause 8.4)

## Product: maintenanceos-website

### Scope
Covers all external providers that affect product conformity:
- **OmniRoute** (LLM routing, fallback, caching) — 127.0.0.1:20128, container omniroute-local-test
- **Model providers** (via OmniRoute) — free models only (gpt-oss, qwen, llama via OmniRoute)
- **GitHub** (source control, CI/CD, package registry) — chapelgate org
- **Package registries** (npm, PyPI, Go proxy, crates.io) — public + private scopes
- **Docker Hub / GHCR** (base images, built images) — pinned digests
- **Cloudflare** (tunnel for OmniRoute droplet access) — Andy-managed

---

## 8.4.1 General
Chapelgate ensures externally provided processes, products, and services conform to requirements through:
- **Evaluation and selection** (8.4.1) — criteria below
- **Agreements** (8.4.2) — documented expectations
- **Monitoring and re-evaluation** (8.4.3) — continuous via CI/logs
- **Control of changes** (8.4.3) — pinned versions, council review for updates

---

## 8.4.2 Evaluation and Selection Criteria

| Supplier | Criticality | Evaluation Criteria | Selection Evidence |
|----------|-------------|---------------------|-------------------|
| **OmniRoute** | HIGH (core LLM routing) | Local instance only; free models; no telemetry; security-reviewed; container pinned | omniroute/, docker-compose.yml, SECURITY-REVIEW.md |
| **Model providers** (via OmniRoute) | HIGH (AI features) | Free models only; no paid keys; routing/fallback/caching configured; latency recorded | readiness/ai-stack/, OmniRoute config |
| **GitHub** | HIGH (source control, CI) | chapelgate org; 2FA enforced; branch protection; dependabot; SAML (future) | GitHub org settings; .github/workflows/*.yml |
| **Package registries** | HIGH (dependencies) | Public registry; lockfiles pin exact versions; vulnerability scanning in CI | Lockfiles, CI vulnerability workflows |
| **Docker Hub / GHCR** | MEDIUM (base images) | Pinned digests (SHA256); no latest tags; multi-stage-dockerfile skill | Dockerfile, .github/workflows/*.yml |
| **Cloudflare** | LOW (tunnel only) | Andy-managed; no secrets in repo; tunnel to droplet only | tailscale config (local only) |

---

## 8.4.3 Agreements and Controls

### OmniRoute (Primary External Provider)
- **Agreement type**: Local deployment — no commercial contract
- **Requirements imposed**:
  - Free models only (OmniRoute free-only lane)
  - No telemetry, no outbound calls except model APIs
  - Container pinned: diegosouzapw/omniroute:b08a12e8
  - Port binding: 127.0.0.1:20128 only (loopback)
  - Caching enabled, fallback configured, latency recorded per call
- **Monitoring**: 
  - Health endpoint /health checked by foreman timer
  - Latency p50/p95 recorded in readiness docs
  - Council reviews OmniRoute config changes
- **Re-evaluation**: Per release cycle; triggered by model change, latency regression, security finding
- **Contingency**: Direct model calls via LM Studio (Mac) documented in readiness/; graceful degradation

### Model Providers (Via OmniRoute)
- **Agreement type**: OmniRoute routing rules — no direct contracts
- **Requirements imposed**:
  - Free tier only (no spend)
  - Redacted prompts only (selector sends redacted questions → cacheable)
  - cacheControl runtime setting present
- **Monitoring**: OmniRoute logs latency, token cost, cache hit rate per selector call
- **Re-evaluation**: Model performance vs benchmark sets

### GitHub (Source Control & CI)
- **Agreement type**: GitHub Terms of Service + chapelgate org policies
- **Requirements imposed**:
  - Branch protection on main: required status checks, 2 approvals, no self-merge
  - Dependabot alerts enabled; auto-PR for security updates
  - GITHUB_TOKEN least privilege (workflow-scoped)
  - Actions pinned to SHA (github-actions-hardening skill)
- **Monitoring**: 
  - CI gate status on every PR
  - Dependabot PRs auto-reviewed by council
  - Audit log reviewed per release
- **Re-evaluation**: Org policy changes; GitHub feature deprecations

### Package Dependencies
- **Agreement type**: Public registry terms + lockfile pinning
- **Requirements imposed**:
  - Exact version pins (no ranges in lockfiles)
  - Vulnerability scanning runs on every PR
  - HIGH/CRITICAL = block merge
  - SBOM generation on release (if workflow exists)
- **Monitoring**: 
  - Daily scheduled vuln-scan
  - Dependabot PRs for patches
  - Council reviews major version upgrades
- **Re-evaluation**: New vulnerability disclosure; major version release

### Docker Base Images
- **Agreement type**: Docker Hub / GHCR terms
- **Requirements imposed**:
  - Pinned SHA256 digests in Dockerfile (FROM image@sha256:...)
  - No latest or moving tags
  - Multi-stage builds (multi-stage-dockerfile skill)
  - Trivy scan in vulnerability workflow
- **Monitoring**: 
  - Daily Trivy scan of base images
  - Council reviews base image updates
- **Re-evaluation**: Base image security advisory; new LTS release

---

## 8.4.3 Monitoring and Re-evaluation Evidence

| Supplier | Monitoring Mechanism | Frequency | Evidence Location |
|----------|---------------------|-----------|-------------------|
| OmniRoute | Health check + latency logs | Per foreman cycle (2h) + per call | dell-services/*-run.sh, readiness/ai-stack/ |
| Model providers | OmniRoute metrics (latency, cost, cache) | Per call | readiness/ai-stack/ |
| GitHub | CI gate status, Dependabot, audit log | Per PR + daily | GitHub Actions, Security tab, Audit log |
| Package registries | Vulnerability scanning workflows | Per PR + daily schedule | CI vulnerability workflow outputs |
| Docker | Trivy scan of base images | Daily schedule | CI vulnerability workflow |
| Cloudflare | Tunnel health (manual) | Per release | Andy verification |

---

## 8.4.3 Control of Supplier Changes
- **OmniRoute config change**: PR → council review → merge → restart container
- **Model change (OmniRoute routing)**: PR updating routing rules → council review
- **GitHub org policy**: Andy-only; council informed via ANDY-BRIEFING.md
- **Dependency upgrade**: Dependabot PR → CI gates → council review → merge
- **Base image update**: PR with new digest → vuln-scan → council review → merge
- **All changes**: Captured in git history; FAILURE-LOG if regression

---

## Evidence in This Repo
| Control | Evidence Path |
|---------|---------------|
| OmniRoute deployment | omniroute/, dell-services/*-run.sh |
| Model routing config | readiness/ai-stack/ |
| GitHub branch protection | GitHub repo settings (evidence: council merge only) |
| Dependency pinning | Lockfiles (package-lock.json, uv.lock, go.sum, Cargo.lock) |
| Vulnerability scanning | CI vulnerability workflows, outputs |
| SBOM generation | SBOM workflow if exists |
| Docker pinning | Dockerfile (SHA256 digests) |
| Council review of supplier changes | out/council-*/council-*.md |
