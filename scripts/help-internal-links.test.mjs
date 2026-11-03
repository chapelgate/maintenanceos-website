import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HELP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/content/help");
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "out");

function read(name) {
  return fs.readFileSync(path.join(HELP, name), "utf8");
}

// Markdown links: [text](url) — capture the URL
const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;

// Build the set of exported HTML page paths (recursive).
const exportedPaths = new Set();
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_next") || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (entry.name === "index.html") {
      const rel = path.relative(OUT, dir);
      exportedPaths.add(rel ? "/" + rel + "/" : "/");
      continue;
    }
    if (entry.name.endsWith(".html")) {
      const rel = path.relative(OUT, dir);
      const base = rel ? rel.replace(/\.html$/, "") : entry.name.replace(/\.html$/, "");
      exportedPaths.add("/" + base + "/");
    }
  }
}
walk(OUT);

const articles = fs.readdirSync(HELP).filter((f) => f.endsWith(".mdx"));

test("every internal link in a help article resolves to an exported page", () => {
  const problems = [];
  for (const article of articles) {
    const content = read(article);
    for (const match of content.matchAll(linkRe)) {
      const href = match[2];
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
      if (href.startsWith("http://") || href.startsWith("https://")) continue;
      if (!href.startsWith("/help/")) continue;

      const normalized = href.endsWith("/") ? href : href + "/";
      if (!exportedPaths.has(normalized)) {
        problems.push(`${article}: ${href} → ${normalized} not exported`);
      }
    }
  }
  assert.equal(problems.length, 0, "Unexported internal help links:\n" + problems.join("\n"));
});

test("api-quickstart and integration-overview use absolute /help/ links", () => {
  const quickstart = read("api-quickstart.mdx");
  assert.doesNotMatch(quickstart, /\(\.\/api-reference\)/);
  assert.doesNotMatch(quickstart, /\(\.\/webhook-events\)/);
  assert.doesNotMatch(quickstart, /\(\.\/api-rate-limits\)/);
  assert.doesNotMatch(quickstart, /\(\.\/sandbox-guide\)/);
  assert.doesNotMatch(quickstart, /\(\.\/api-migration\)/);
  assert.match(quickstart, /\((\/help\/api-reference\/)\)/);
  assert.match(quickstart, /\((\/help\/webhook-events\/)\)/);
  assert.match(quickstart, /\((\/help\/api-rate-limits\/)\)/);
  assert.match(quickstart, /\((\/help\/sandbox-guide\/)\)/);
  assert.match(quickstart, /\((\/help\/api-migration\/)\)/);

  const integration = read("integration-overview.mdx");
  assert.doesNotMatch(integration, /\(\.\/api-quickstart\)/);
  assert.doesNotMatch(integration, /\(\.\/webhook-guide\)/);
  assert.match(integration, /\((\/help\/api-quickstart\/)\)/);
  assert.match(integration, /\((\/help\/webhook-guide\/)\)/);
});
