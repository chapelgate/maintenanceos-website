import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE = path.join(ROOT, ".website-manager");
const OUT = process.env.HEALTH_ARTIFACT_PATH
  ? path.resolve(process.env.HEALTH_ARTIFACT_PATH)
  : path.join(STATE, "health-artifact.json");

function head() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .trim()
    .toLowerCase();
}

const monitor = fs.readFileSync(
  path.join(ROOT, "scripts/website-health-monitor.mjs"),
  "utf8",
);

const defaultOriginMatch = monitor.match(
  /WEBSITE_SITE_URL[^\n]*\n\s*"([^"]+)"/,
);
const defaultOrigin = defaultOriginMatch?.[1] ?? null;
const controlPlaneConfigured =
  Boolean(process.env.WEBSITE_CONTROL_PLANE?.trim()) &&
  process.env.WEBSITE_CONTROL_PLANE.trim() !== "";

const artifact = {
  schema: 1,
  kind: "offline-health-artifact",
  recordedAt: new Date().toISOString(),
  head: head(),
  mode: "offline-config",
  network: false,
  defaultOrigin,
  controlPlaneConfigured,
  controlPlaneOptInOnly: /WEBSITE_CONTROL_PLANE/.test(monitor),
  retiredRailwayDefaultAbsent: !/railway\.app/.test(monitor),
  bans: [
    "Offline artifact only — no live HTTP probe in this script",
    "Does not deploy or alter nginx",
    "Does not set NEXT_PUBLIC_PUBLIC_LAUNCH=true",
    "Does not call the golden phone line",
  ],
  ok:
    defaultOrigin === "https://worksmartos.co.uk" &&
    /WEBSITE_CONTROL_PLANE/.test(monitor) &&
    !/railway\.app/.test(monitor),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(artifact, null, 2) + "\n", "utf8");
console.log(JSON.stringify(artifact, null, 2));
if (!artifact.ok) process.exitCode = 1;
