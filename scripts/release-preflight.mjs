import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  console.error("release preflight requires npm_execpath from an npm-run invocation");
  process.exit(2);
}

function run(command, args, label) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });
  if (result.status !== 0) {
    console.error(`release preflight failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

const dirty = execFileSync("git", ["status", "--porcelain"], {
  encoding: "utf8",
}).trim();
if (dirty) {
  console.error("release preflight requires a clean Git working tree");
  console.error(dirty);
  process.exit(2);
}

const head = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim().toLowerCase();

run(process.execPath, [npmCli, "run", "audit:ci"], "dependency audit gate");
run(process.execPath, [npmCli, "run", "lint"], "eslint");
run(process.execPath, [npmCli, "test"], "full test suite");
run(process.execPath, [npmCli, "run", "build"], "production static build");
run(process.execPath, [npmCli, "run", "functional:smoke"], "functional export smoke");
run(process.execPath, [npmCli, "run", "performance:budget"], "performance budget");
run(process.execPath, [npmCli, "run", "accessibility:check"], "accessibility gate");

const marker = JSON.parse(fs.readFileSync("public/release.json", "utf8"));
if (String(marker.commit || "").toLowerCase() !== head) {
  console.error(
    `release marker ${marker.commit || "missing"} does not match HEAD ${head}`,
  );
  process.exit(3);
}
if (!fs.existsSync("out/release.json")) {
  console.error("static export does not contain release.json");
  process.exit(4);
}

console.log(JSON.stringify({
  ok: true,
  head,
  branch: execFileSync("git", ["branch", "--show-current"], {
    encoding: "utf8",
  }).trim(),
  releaseMarker: marker,
}, null, 2));
