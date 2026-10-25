import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");

function section(title) {
  console.log("\n=== " + title + " ===");
}

function note(msg) {
  console.log("  - " + msg);
}

section("MaintenanceOS synthetic pre-launch demo (read-only)");
const site = fs.readFileSync(path.join(ROOT, "src/config/site.ts"), "utf8");
const launch = site.match(/publicLaunch:\s*envFlag\([^)]+\)/);
note(launch ? launch[0] : "publicLaunch not found");

section("Steps");
note("1. Open the local site (run npm run dev first).");
note("2. Home, then the create flow, synthetic data only.");
note("3. Read the accessibility page. Automated checks are not a WCAG sign-off.");
note("4. Contact is a direct enquiry only, pre-launch.");
note("5. Compare public/release.json with git rev-parse HEAD after a build.");

section("Never do in this demo");
note("Do not set NEXT_PUBLIC_PUBLIC_LAUNCH=true.");
note("Do not call the golden phone line.");
note("Do not enter live customer records.");
note("Do not publish prices or accept payment.");

console.log("\nDemo complete. All steps are read-only and local.");
