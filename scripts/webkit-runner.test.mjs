import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflow = fs.readFileSync(
  path.join(ROOT, ".github/workflows/webkit-a11y.yml"),
  "utf8",
);

test("webkit accessibility runs on the estate runner without hosted spend", () => {
  assert.match(workflow, /runs-on: \[self-hosted, estate\]/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /actions: write/);
  assert.match(
    workflow,
    /actions\/checkout@11d5960a326750d5838078e36cf38b85af677262/,
  );
  assert.match(
    workflow,
    /actions\/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020/,
  );
  assert.match(
    workflow,
    /actions\/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02/,
  );
  assert.match(workflow, /npx playwright install webkit/);
  assert.doesNotMatch(workflow, /ubuntu-latest/);
  assert.doesNotMatch(workflow, /pull_request_target/);
  assert.doesNotMatch(workflow, /--with-deps/);
  assert.doesNotMatch(workflow, /^\s*secrets:/m);
});
