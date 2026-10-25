import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HELP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/content/help");
const overview = fs.readFileSync(path.join(HELP, "integration-overview.mdx"), "utf8");

test("integration overview does not publish live webhooks, a sandbox, or a rate limit", () => {
  assert.doesNotMatch(overview, /Events available:/);
  assert.doesNotMatch(overview, /Sandbox workspace/);
  assert.doesNotMatch(overview, /API key separate from production/);
  assert.doesNotMatch(overview, /Settings → Integrations → Webhooks/);
  assert.doesNotMatch(overview, /Settings → Integrations → API Usage/);
  assert.match(overview, /not a live webhook/i);
  assert.match(overview, /not a live sandbox/i);
  assert.match(overview, /No rate limit is published/i);
  assert.match(overview, /Endpoint lists are not a live API/);
  assert.match(overview, /not a live integration catalogue/i);
  assert.match(overview, /no API key screen/i);
  assert.match(overview, /^## Webhooks$/m);
  assert.match(overview, /^## Next Steps$/m);
});
