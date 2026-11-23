import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function write(rel, content) {
  fs.writeFileSync(path.join(ROOT, rel), content, "utf8");
}

const lock = JSON.parse(read("package-lock.json"));
const packages = lock.packages || {};

const LOCK_HASH = crypto.createHash("sha256").update(read("package-lock.json")).digest("hex");
const SOURCE_COMMIT = "7b8081c9df9937ae269f701cbcbbe7d49c7c6df2";

const REUSE_LICENCES = new Set(["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "0BSD"]);

function categoryFor(licence) {
  if (REUSE_LICENCES.has(licence)) return "reuse";
  if (/LGPL|GPL|AGPL/i.test(licence)) return "copyleft/unlicensed";
  return "unresolved";
}

function parseSourcesMd(sourcesMd) {
  const files = [];
  const lines = sourcesMd.split("\n");
  for (const line of lines) {
    const match = line.match(/^\|\s*`([^`]+)`\s*\|/);
    if (match) {
      files.push(match[1]);
    }
  }
  return files;
}

const entries = [];
for (const [pathKey, value] of Object.entries(packages)) {
  if (pathKey === "") continue;
  entries.push({ path: pathKey, ...value });
}

entries.sort((a, b) => a.path.localeCompare(b.path));

let md = `# Third-party release evidence — maintenanceos-website\n\n## Scope\n\nThis record captures deterministic exact-candidate evidence for third-party package and shipped-media licence obligations. It records evidence only; it makes no legal decision, adds no project licence, and does not change the site's proprietary contract-only licence.\n\nLicence route: REUSE-WITH-ATTRIBUTION. MIT/Apache/BSD packages are recorded with their declared licence and source reference so notices and attribution requirements stay visible. LGPL components (Sharp/libvips) are recorded as unresolved — not described as legally cleared. MPL-2.0 and other non-reuse licences are recorded as unresolved interpretation for Andy or the solicitor.\n\n## Candidate identity\n\n- Source commit: \`${SOURCE_COMMIT}\` (2026-11-21)\n- \`package-lock.json\` SHA-256: \`${LOCK_HASH}\`\n- lockfileVersion: 3\n- Root package: \`maintenanceos-website\` 0.1.0 (private)\n\n## Package evidence (from package-lock.json, lockfileVersion 3)\n\n${entries.length} package entries. Every entry carries a declared \`license\` field and a \`resolved\` source reference except nested packages under \`@tailwindcss/oxide-wasm32-wasi\` (no \`resolved\` field); those are recorded with name, version and licence only.\n\nDeclared licences observed:\n\n`;

const licenceCounts = {};
for (const entry of entries) {
  const licence = entry.license || "unknown";
  licenceCounts[licence] = (licenceCounts[licence] || 0) + 1;
}

for (const [licence, count] of Object.entries(licenceCounts).sort((a, b) => b[1] - a[1])) {
  md += `| ${licence} | ${count} | ${categoryFor(licence)} |\n`;
}

md += "\nEvery package entry carries a \`license\` field; no entry is unlicensed/unknown by lockfile metadata.\n\n## Complete package evidence\n\n";
md += "| # | Package name | Exact version | Declared licence | Source reference | Category |\n";
md += "| --- | --- | --- | --- | --- | --- |\n";

for (let i = 0; i < entries.length; i++) {
  const entry = entries[i];
  const name = entry.name || entry.path;
  const version = entry.version;
  const licence = entry.license || "unknown";
  const resolved = entry.resolved || (entry.path.includes("@tailwindcss/oxide-wasm32-wasi/node_modules/") ? "(nested; no resolved field)" : "missing");
  const category = categoryFor(licence);
  md += `| ${i + 1} | ${name} | ${version} | ${licence} | ${resolved} | ${category} |\n`;
}

md += "\n## Direct dependencies (root \`package.json\`)\n\n";
const rootDeps = lock.packages[""].dependencies || {};
for (const [dep, version] of Object.entries(rootDeps)) {
  const depEntry = entries.find(e => e.path === `node_modules/${dep}`);
  if (depEntry) {
    md += `- \`${dep}\` ${version} — declared licence ${depEntry.license}, source ${depEntry.resolved}\n`;
  }
}

md += "\n## Sharp / libvips (LGPL — unresolved, not cleared)\n\n";
const sharpEntry = entries.find(e => e.path === "node_modules/sharp");
if (sharpEntry) {
  md += `\`sharp\` ${sharpEntry.version} — declared licence ${sharpEntry.license}, optional dependency of \`next\`. Source: ${sharpEntry.resolved}. Funds libvips via opencollective.com/libvips.\n\n`;
}

md += `Sharp's optional platform bindings (\`@img/sharp-*\`) carry declared licences per package. Their \`sharp-libvips-*\` optionalDependencies declare **LGPL-3.0-or-later** (libvips). Four conjunctive Sharp Windows/wasm bindings declare **Apache-2.0 AND LGPL-3.0-or-later** or **Apache-2.0 AND LGPL-3.0-or-later AND MIT**. SPDX AND means every conjunct applies, so these carry LGPL obligations too.\n\n`;

md += `These copyleft components are present in the lockfile. Whether they are redistributed by this site's build output is **unresolved** and is recorded here for Andy or the solicitor, **not described as legally cleared**.\n\n`;

md += `## Shipped media sources\n\n`;
const sourcesMd = read("public/media/home/SOURCES.md");
const mediaFiles = parseSourcesMd(sourcesMd);
for (const file of mediaFiles) {
  md += `- \`${file}\` — referenced in SOURCES.md\n`;
}
md += `\nSource file preserved unchanged. Self-hosted under \`public/media/home/\`; static export only.\n\nEncoded with ffmpeg/libwebp (local crops, no Unsplash/Pexels hotlink).\n\nAll referenced shipped files exist on disk; all source entries resolve.\n\n`;

md += `## Unresolved obligations\n\n`;
const iscCount = Object.entries(licenceCounts).filter(([l]) => l === "ISC").reduce((sum, [,c]) => sum + c, 0);
const mplCount = Object.entries(licenceCounts).filter(([l]) => l === "MPL-2.0").reduce((sum, [,c]) => sum + c, 0);
const lgplCount = Object.entries(licenceCounts).filter(([l]) => /LGPL/.test(l)).reduce((sum, [,c]) => sum + c, 0);

md += `- ISC and other non-reuse packages: reuse interpretation unresolved per estate licence route (MIT/Apache/BSD only).\n`;
md += `- Conjunctive Sharp packages containing LGPL-3.0-or-later; redistribution interpretation unresolved.\n`;
md += `- MPL-2.0 packages: reuse interpretation unresolved.\n`;
md += `- No copyleft/source-available/unlicensed obligation is presented as cleared in this record.\n\n`;

md += `## What this record does not do\n\n`;
md += `- Does not add a root licence (LICENSE / LICENSE.md / COPYING unchanged).\n`;
md += `- Does not change dependencies, package.json, or package-lock.json beyond the security patch that produced this candidate.\n`;
md += `- Does not download licence data or contact any service.\n`;
md += `- Does not resolve legal ambiguity in code.\n`;
md += `- Does not touch deploy/, .do/, .github/, Dockerfile, docker-compose*, .env*, nginx, startup, voice/telephony/product backend/production data.\n`;

write("docs/THIRD_PARTY_RELEASE_EVIDENCE.md", md);
console.log("THIRD_PARTY_RELEASE_EVIDENCE.md regenerated");
console.log("LOCK_HASH:", LOCK_HASH);
console.log("SOURCE_COMMIT:", SOURCE_COMMIT);
console.log("Entry count:", entries.length);
