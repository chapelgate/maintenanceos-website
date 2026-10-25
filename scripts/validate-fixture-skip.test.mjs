import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflow = fs.readFileSync(
  path.join(ROOT, ".github/workflows/website-integration-repair-validation.yml"),
  "utf8",
);

test("fixture-only onboarding changes do not start a hosted validate job", () => {
  assert.match(workflow, /runs-on: \[self-hosted, estate\]/);
  assert.doesNotMatch(workflow, /ubuntu-latest/);
  assert.match(
    workflow,
    /!packages\/onboarding-ingest\/src\/fixtures\/\*\*/,
  );
  assert.match(workflow, /Only onboarding-ingest fixtures changed/);
  assert.match(workflow, /steps\.docker\.outputs\.available == 'true'/);
  assert.match(workflow, /Docker is not available to this runner/);
});
