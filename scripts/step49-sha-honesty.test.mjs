import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const markdownPath = join(ROOT, "docs/STEP49_RELEASE_ROLLBACK.md");
const mdContent = readFileSync(markdownPath, "utf8");

let documentedSha = null;
const shaMatch = mdContent.match(/PR #100 merged as `([0-9a-f]{40})`/);
if (shaMatch) {
  documentedSha = shaMatch[1];
}

let currentSha = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: ROOT,
  encoding: "utf8",
}).trim();

test("STEP49 documented SHA exists in git history and is ancestor of HEAD", () => {
  assert.ok(
    documentedSha,
    "No documented SHA found in STEP49_RELEASE_ROLLBACK.md",
  );

  // Verify the documented SHA is a valid git object
  const shaExists = execFileSync(
    "git",
    ["cat-file", "-t", documentedSha],
    { cwd: ROOT, encoding: "utf8" },
  ).trim();
  assert.equal(shaExists, "commit", `SHA ${documentedSha} is not a commit`);

  // Verify the documented SHA is an ancestor of HEAD (but not necessarily equal)
  execFileSync(
    "git",
    ["merge-base", "--is-ancestor", documentedSha, "HEAD"],
    { cwd: ROOT, encoding: "utf8" },
  );
});

// Supporting check: documented SHA must differ from current HEAD (honesty)
test("STEP49 documented SHA must not equal current HEAD", () => {
  assert.ok(
    documentedSha,
    "No documented SHA found",
  );
  assert.notStrictEqual(
    documentedSha,
    currentSha,
    "Documented SHA must differ from current HEAD — do not claim live SHA equals this HEAD",
  );
});
