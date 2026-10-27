import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SHA_RE = /^[0-9a-f]{7,40}$/i;

function sourceCommit() {
  for (const key of [
    "SOURCE_COMMIT_HASH",
    "COMMIT_SHA",
    "GITHUB_SHA",
    "VERCEL_GIT_COMMIT_SHA",
  ]) {
    const value = process.env[key]?.trim();
    if (value && SHA_RE.test(value)) return value.toLowerCase();
  }

  try {
    const value = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (SHA_RE.test(value)) return value.toLowerCase();
  } catch {
    // Fall through to a hard failure: an unverifiable build must not publish.
  }

  throw new Error(
    "Cannot determine source commit for release marker. " +
      "Provide SOURCE_COMMIT_HASH/COMMIT_SHA or build from a Git checkout.",
  );
}

const publicDir = path.resolve("public");
fs.mkdirSync(publicDir, { recursive: true });

const marker = {
  schema: 1,
  commit: sourceCommit(),
  builtAt: new Date().toISOString(),
  product: "MaintenanceOS",
  brand: "WorkSmartOS",
  publisher: "Chapelgate Limited",
  company_number: "12340004",
  public_launch: false,
  commercial_ga: false,
  live_phone: false,
  note: "Pre-launch synthetic demo release marker. Not commercially generally available. Not a public always-on phone line.",
};

fs.writeFileSync(
  path.join(publicDir, "release.json"),
  JSON.stringify(marker, null, 2) + "\n",
  "utf8",
);
console.log(JSON.stringify(marker));
