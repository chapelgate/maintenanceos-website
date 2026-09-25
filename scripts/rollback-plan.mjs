import { execFileSync } from "node:child_process";

const SHA_RE = /^[0-9a-f]{7,40}$/i;
const input = process.argv[2]?.trim();

if (!input || !SHA_RE.test(input)) {
  console.error("Usage: npm run rollback:plan -- <bad-commit-sha>");
  process.exit(2);
}

let bad;
try {
  bad = execFileSync("git", ["rev-parse", "--verify", input + "^{commit}"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim().toLowerCase();
} catch {
  console.error("Rollback commit does not exist in this repository");
  process.exit(3);
}

const ancestor = execFileSync(
  "git",
  ["merge-base", "--is-ancestor", bad, "HEAD"],
  { stdio: "ignore" },
);
void ancestor;

const short = bad.slice(0, 12);
const branch = `rollback/website-${short}`;
const commands = [
  "git checkout main",
  "git pull --ff-only",
  `git checkout -b ${branch}`,
  `git revert --no-edit ${bad}`,
  "npm run release:preflight",
  `git push -u origin ${branch}`,
  `gh pr create --base main --head ${branch} --title "Rollback website ${short}"`,
  "After merge: EXPECTED_COMMIT=<rollback-merge-sha> npm run deployment:verify",
];

console.log(JSON.stringify({
  ok: true,
  badCommit: bad,
  rollbackBranch: branch,
  strategy: "git-revert-preserve-history",
  commands,
  forbidden: [
    "git reset --hard on shared main",
    "force-push main",
    "manual mutation of DigitalOcean static output",
    "touching MaintenanceOS voice/backend to repair a marketing-site regression",
  ],
}, null, 2));
