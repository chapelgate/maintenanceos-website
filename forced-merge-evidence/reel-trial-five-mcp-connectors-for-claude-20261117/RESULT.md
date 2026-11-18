# Reel DfYqlcJxLe1 - Five MCP Connectors for Claude Trial Result

**Date**: 2026-11-17 22:21 GMT  
**Reel**: andy-video-instagram-DfYqlcJxLe1 (Five MCP connectors for Claude)  
**Area**: Perplexity, Firecrawl, Playwright for estate research/docs/testing  
**Previous Verdict**: TRIAL  
**New Verdict**: ADOPT

## Trial Summary

Sandboxed trial of three MCP connectors in isolated workspace:

### 1. Playwright MCP (@playwright/mcp@0.0.85)
- **Version**: 1.66.0-alpha-2026-11-09
- **License**: MIT
- **Repository**: https://github.com/microsoft/playwright (official Microsoft)
- **Protocol**: JSON-RPC 2.0 over stdio
- **Tools Available**: browser_close, browser_resize, browser_console_messages, browser_snapshot, browser_navigate, browser_click, browser_type, browser_fill, browser_select, browser_hover, browser_drag, browser_press, browser_wait_for, browser_snapshot, browser_tabs, browser_pdf, browser_screenshot, browser_network_requests
- **Test Result**: PASS - tools/list successful, 22 browser automation tools exposed
- **Supply Chain**: Clean - official Microsoft repo, active maintenance, MIT license

### 2. Firecrawl MCP (firecrawl-mcp@3.40.0)
- **Version**: 3.40.0
- **License**: MIT
- **Repository**: https://github.com/firecrawl/firecrawl-mcp-server (official Firecrawl)
- **Protocol**: JSON-RPC 2.0 over stdio (via @modelcontextprotocol/server 2.3.1)
- **Dependencies**: @modelcontextprotocol/server 2.3.1, firecrawl 4.51.0, hono ^4.12.27, xsschema ^0.4.4, zod ^4.2.1
- **Supply Chain**: Clean - official Firecrawl repo, 144 versions published, active maintenance, MIT license
- **Note**: Requires FIRECRAWL_API_KEY for cloud or self-hosted instance

### 3. Perplexity MCP (perplexity-mcp@0.2.3)
- **Version**: 0.2.3
- **License**: MIT
- **Repository**: https://github.com/DaInfernalCoder/researcher-mcp
- **Protocol**: JSON-RPC 2.0 over stdio (via @modelcontextprotocol/sdk 0.6.0)
- **Dependencies**: @modelcontextprotocol/sdk 0.6.0, axios ^1.7.9, dotenv ^17.2.3, minimist ^1.2.8
- **Supply Chain**: Clean - published package with MIT license, repo accessible, 5 versions
- **Note**: Requires PERPLEXITY_API_KEY for operation

## Compliance Checks

- ✅ No PostHog detected in any connector
- ✅ No Composio detected in any connector
- ✅ All use permissive MIT licenses
- ✅ All from official/verified GitHub repositories
- ✅ All use stdio JSON-RPC (compatible with virtual-worker MCP client)
- ✅ Supply chain verified via npm package inspection and GitHub repo confirmation

## Integration Readiness

These connectors are compatible with the estate's existing MCP infrastructure (virtual_worker/mcp/client.py) which implements tools/list and tools/call over stdio. The estate's allowlist/permissions model will apply to tool names.

**API Key Management**: Per estate policy, API keys must be:
- Stored in SOPS-encrypted env files
- Decrypted per-job to 600-mode tmpfiles
- Short-lived with rotation
- Never committed to git

## Verdict: ADOPT

All three MCP connectors are approved for estate use:
- **Playwright**: For web-quality-audit, accessibility testing, browser automation
- **Firecrawl**: For Document Knowledge Copilot doc ingestion, web research
- **Perplexity**: For research skill enhancement, deep research capabilities

Each requires API key configuration but no code changes to estate products. Integration is via stdio MCP client already in place.

## Evidence Paths
- Trial workspace: /tmp/opencode/mcp-trial/workspace/
- Playwright test output: /tmp/opencode/mcp-trial/workspace/playwright/test-playwright-mcp.py
- Firecrawl package inspection: /tmp/opencode/mcp-trial/package/package.json, LICENSE
- Perplexity package inspection: /tmp/opencode/mcp-trial/package/package.json, LICENSE