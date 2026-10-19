import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("S17: Sitemap lastmod generation", () => {
  it("sitemap.ts includes lastModified field", () => {
    const sitemapPath = join(process.cwd(), "src", "app", "sitemap.ts");
    const content = readFileSync(sitemapPath, "utf-8");
    
    // Should have lastModified field in the returned objects
    assert.ok(content.includes("lastModified"), "sitemap.ts should include lastModified field");
  });

  it("robots.ts allows AI bots", () => {
    const robotsPath = join(process.cwd(), "src", "app", "robots.ts");
    const content = readFileSync(robotsPath, "utf-8");
    
    // Should allow GPTBot, ClaudeBot, etc.
    assert.ok(content.includes("GPTBot"), "robots.ts should allow GPTBot");
    assert.ok(content.includes("ClaudeBot"), "robots.ts should allow ClaudeBot");
    assert.ok(content.includes("Google-Extended"), "robots.ts should allow Google-Extended");
    assert.ok(content.includes("OAI-SearchBot"), "robots.ts should allow OAI-SearchBot");
    assert.ok(content.includes("anthropic-ai"), "robots.ts should allow anthropic-ai");
    assert.ok(content.includes("PerplexityBot"), "robots.ts should allow PerplexityBot");
    assert.ok(content.includes("Bytespider"), "robots.ts should allow Bytespider");
    assert.ok(content.includes("CCBot"), "robots.ts should allow CCBot");
  });
});