import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

function readRepoFile(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

function parseHexColor(hex) {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = Number.parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]) {
  const transform = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [transform(r), transform(g), transform(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hexA, hexB) {
  const lumA = relativeLuminance(parseHexColor(hexA));
  const lumB = relativeLuminance(parseHexColor(hexB));
  const brightest = Math.max(lumA, lumB);
  const darkest = Math.min(lumA, lumB);
  return (brightest + 0.05) / (darkest + 0.05);
}

function parseThemeTokens(css) {
  const tokens = {};
  const re = /--color-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/g;
  let match;
  while ((match = re.exec(css)) !== null) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}

const OWNED_ROUTES = [
  "src/routes/index.tsx",
  "src/routes/login.tsx",
  "src/routes/signup.tsx",
  "src/routes/app/index.tsx",
  "src/routes/app/$orgId/index.tsx",
  "src/routes/app/$orgId/evidence.index.tsx",
  "src/routes/app/$orgId/evidence.$docId.tsx",
  "src/routes/app/$orgId/facts.tsx",
  "src/routes/app/$orgId/questionnaires.index.tsx",
  "src/routes/app/$orgId/questionnaires.$qid.tsx",
  "src/routes/app/$orgId/packs.index.tsx",
  "src/routes/app/$orgId/packs.$packId.tsx",
  "src/routes/app/$orgId/compliance.tsx",
  "src/routes/app/$orgId/decisions.tsx",
  "src/routes/app/$orgId/opportunities.tsx",
  "src/routes/app/$orgId/entities.tsx",
  "src/routes/app/$orgId/exports.tsx",
  "src/routes/app/$orgId/team.tsx",
  "src/routes/app/$orgId/audit.tsx",
  "src/routes/app/$orgId/control-mcp.tsx",
];

const NAMED_ARIA_ROLES = ["button", "link", "textbox", "combobox", "checkbox", "radio", "switch"];

export function findAriaSnapshotIssues(snapshotText) {
  const issues = [];
  const text = String(snapshotText ?? "");
  const headings = [...text.matchAll(/heading "([^"]*)"/g)]
    .map((m) => m[1].trim())
    .filter(Boolean);
  if (headings.length === 0) {
    issues.push("no heading with an accessible name");
  }
  const hasLandmark = /(?:^|\n)\s*- (?:banner|main|navigation|contentinfo|complementary|region|article):/.test(
    text,
  );
  if (!hasLandmark) {
    issues.push("no landmark (banner, main, navigation, contentinfo, region, or article)");
  }
  for (const line of text.split("\n")) {
    for (const role of NAMED_ARIA_ROLES) {
      const match = line.match(new RegExp(`^\\s*- ${role}\\b(.*)$`));
      if (!match) continue;
      if (!/"[^"]*[^"\s][^"]*"/.test(match[1])) {
        issues.push(`${role} has no accessible name: ${line.trim()}`);
      }
    }
    if (/^\s*- heading\b/.test(line) && !/heading "[^"]*[^"\s][^"]*"/.test(line)) {
      issues.push(`heading has no accessible name: ${line.trim()}`);
    }
  }
  return { issues, headings };
}

describe("WCAG 2.2 AA design tokens, focus, and reduced motion (src/styles.css)", () => {
  const css = readRepoFile("src/styles.css");
  const tokens = parseThemeTokens(css);

  it("maintains >= 4.5:1 normal-text contrast on both paper and paper-2 surfaces", () => {
    const surfaces = ["paper", "paper-2"];
    const foregrounds = ["ink", "ink-soft", "muted", "forest", "amber-ink", "red-ink"];
    for (const surface of surfaces) {
      assert.ok(tokens[surface], `Missing surface token --color-${surface}`);
      for (const fg of foregrounds) {
        assert.ok(tokens[fg], `Missing foreground token --color-${fg}`);
        const ratio = contrastRatio(tokens[fg], tokens[surface]);
        assert.ok(
          ratio >= 4.5,
          `Token --color-${fg} (${tokens[fg]}) on --color-${surface} (${tokens[surface]}) has contrast ${ratio.toFixed(2)}:1 (< 4.5:1)`,
        );
      }
    }
    const primaryBtnRatio = contrastRatio(tokens["forest-fg"], tokens.forest);
    assert.ok(
      primaryBtnRatio >= 4.5,
      `Primary button --color-forest-fg on --color-forest has contrast ${primaryBtnRatio.toFixed(2)}:1 (< 4.5:1)`,
    );
    const dangerBtnRatio = contrastRatio(tokens.paper, tokens["red-ink"]);
    assert.ok(
      dangerBtnRatio >= 4.5,
      `Danger button --color-paper on --color-red-ink has contrast ${dangerBtnRatio.toFixed(2)}:1 (< 4.5:1)`,
    );
  });

  it("defines visible keyboard focus indicator (:focus-visible) and prefers-reduced-motion rules", () => {
    assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*2px\s+solid\s+var\(--color-forest\)/s);
    assert.match(css, /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/);
    assert.match(css, /animation-duration:\s*0\.01ms\s*!important/);
    assert.match(css, /transition-duration:\s*0\.01ms\s*!important/);
  });
});

describe("WCAG 2.2 AA shell, skip link, landmarks, and status badges", () => {
  it("provides a skip-to-content link targeting #main in __root.tsx", () => {
    const rootSrc = readRepoFile("src/routes/__root.tsx");
    assert.match(rootSrc, /href="#main"[^>]*>\s*Skip to content\s*<\/a>/);
    assert.match(rootSrc, /id="content"/);
  });

  it("exposes semantic landmarks, aria-labels, and 44x44 mobile menu toggle in OrgShell", () => {
    const shellSrc = readRepoFile("src/components/org-shell.tsx");
    assert.match(shellSrc, /<header\b/);
    assert.match(shellSrc, /<nav\b[^>]*aria-label="Organisation"/);
    assert.match(shellSrc, /<aside\b[^>]*aria-label="Organisation sidebar"/);
    assert.match(shellSrc, /<main\b/);
    assert.match(shellSrc, /aria-expanded=\{open\}/);
    assert.match(shellSrc, /aria-label="Toggle navigation"/);
    assert.match(shellSrc, /min-h-11\s+min-w-11/);
    assert.match(shellSrc, /role="dialog"[\s\S]*?aria-modal="true"[\s\S]*?aria-label="Navigation"/);
  });

  it("uses high-contrast text tokens in StatusBadge and avoids muted text on paper-2", () => {
    const badgeSrc = readRepoFile("src/components/status-badge.tsx");
    assert.equal(badgeSrc.includes("text-muted"), false, "StatusBadge must not pair text-muted with bg-paper-2");
    assert.match(badgeSrc, /text-ink border-line bg-paper-2/);
  });
});

describe("WCAG 2.2 AA route headings, form labels, error associations, and live regions", () => {
  it("gives every owned route an h1 heading and no skipped heading levels", () => {
    for (const rel of OWNED_ROUTES) {
      const src = readRepoFile(rel);
      const levels = [...src.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
      assert.ok(levels.includes(1), `${rel} must render an <h1> heading`);
      const uniqueLevels = [...new Set(levels)].sort((a, b) => a - b);
      for (let i = 1; i < uniqueLevels.length; i++) {
        assert.equal(
          uniqueLevels[i] - uniqueLevels[i - 1],
          1,
          `${rel} skips heading levels: found h${uniqueLevels.join(", h")}`,
        );
      }
    }
  });

  it("wires form error states with aria-invalid, aria-describedby, and role='alert'", () => {
    const formRoutes = [
      ["src/routes/login.tsx", "login-error"],
      ["src/routes/signup.tsx", "signup-error"],
      ["src/routes/app/index.tsx", "create-org-error"],
      ["src/routes/app/index.tsx", "join-org-error"],
      ["src/routes/app/$orgId/evidence.index.tsx", "upload-evidence-error"],
      ["src/routes/app/$orgId/evidence.$docId.tsx", "replace-doc-error"],
      ["src/routes/app/$orgId/evidence.$docId.tsx", "paste-doc-error"],
      ["src/routes/app/$orgId/entities.tsx", "create-entity-error"],
      ["src/routes/app/$orgId/team.tsx", "invite-error"],
      ["src/routes/app/$orgId/team.tsx", "delete-org-error"],
    ];
    for (const [rel, errId] of formRoutes) {
      const src = readRepoFile(rel);
      assert.match(src, new RegExp(`id="${errId}"`), `${rel} must define error id="${errId}"`);
      assert.match(src, new RegExp(`aria-describedby=\\{[^}]*"${errId}"`), `${rel} must reference ${errId} via aria-describedby`);
      assert.match(src, /aria-invalid=/, `${rel} must set aria-invalid on form controls`);
      assert.match(src, /role="alert"/, `${rel} must announce errors with role="alert"`);
    }
  });

  it("ensures every input, select, and textarea in owned routes has an enclosing label or aria-label", () => {
    for (const rel of OWNED_ROUTES) {
      const src = readRepoFile(rel);
      const tagRegex = /<(input|select|textarea)\b([\s\S]*?)\/?>/g;
      let match;
      while ((match = tagRegex.exec(src)) !== null) {
        const tag = match[1];
        const attrs = match[2];
        if (/type="hidden"/.test(attrs)) continue;
        const hasAriaLabel = /aria-label=|aria-labelledby=/.test(attrs);
        const before = src.slice(Math.max(0, match.index - 450), match.index);
        const lastOpenLabel = before.lastIndexOf("<label");
        const lastCloseLabel = before.lastIndexOf("</label>");
        const insideLabel = lastOpenLabel !== -1 && lastOpenLabel > lastCloseLabel;
        assert.ok(
          hasAriaLabel || insideLabel,
          `${rel} has unlabelled <${tag}> near offset ${match.index}: ${match[0].slice(0, 120)}`,
        );
      }
    }
  });

  it("does not strip keyboard focus outlines or shrink button tap targets below min-h-11", () => {
    for (const rel of OWNED_ROUTES) {
      const src = readRepoFile(rel);
      assert.equal(src.includes("outline-none"), false, `${rel} must not use outline-none without a visible focus indicator`);
      assert.equal(src.includes("min-h-8"), false, `${rel} must not shrink interactive buttons with min-h-8`);
    }
  });

  it("uses proper table column headers in compliance.tsx and dt/dd pairs in control-mcp.tsx", () => {
    const complianceSrc = readRepoFile("src/routes/app/$orgId/compliance.tsx");
    assert.match(complianceSrc, /<th\s+scope="col"/);
    assert.match(complianceSrc, /aria-pressed=\{bucket === b\}/);

    const mcpSrc = readRepoFile("src/routes/app/$orgId/control-mcp.tsx");
    assert.match(mcpSrc, /<dl\b[\s\S]*?<dt\b[\s\S]*?<dd\b/);
  });
});

function pickFreePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      srv.close((err) => (err ? reject(err) : resolve(port)));
    });
    srv.on("error", reject);
  });
}

async function waitHttp(url, serverLog, timeoutMs = Number(process.env.EW_A11Y_WAIT_HTTP_MS || 60000)) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // retry until server is ready
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for ${url}. Server log:\n${serverLog.join("")}`);
}

const directInvocation =
  process.env.EW_RUN_BROWSER_A11Y === "1" ||
  process.argv.filter((a) => a.endsWith(".test.mjs")).length === 1;

describe("Live browser axe-core WCAG 2.2 AA and ARIA snapshot verification", { skip: !directInvocation }, () => {
  // Overall deadline so a stuck Chromium/vite cannot hang the host forever.
  // Does not claim WCAG 2.2 AA passed; only bounds the live suite runtime.
  const LIVE_A11Y_DEADLINE_MS = Number(process.env.EW_A11Y_DEADLINE_MS || 240000);
  // When the whole integration suite runs in one process, ~40 sibling test
  // files spawn their own vite/PGLite clusters and starve this dev server's
  // first cold transform; the live browser then never reaches the app in
  // time. Scale every per-step wait with the same factor so the test stays
  // honest standalone and survives under full-suite load.
  const LOAD_FACTOR = Number(process.env.EW_A11Y_LOAD_FACTOR || 1);
  const waitMs = (base) => Math.round(base * LOAD_FACTOR);
  it(
    "passes axe-core WCAG 2.2 AA, ARIA landmark/heading/form snapshots, and keyboard focus across public and app routes",
    { timeout: waitMs(LIVE_A11Y_DEADLINE_MS) },
    async () => {
    const { chromium } = await import("playwright");
    const AxeBuilder = (await import("@axe-core/playwright")).default;

    let server = null;
    let browser = null;
    const serverLog = [];
    let base = process.env.EW_A11Y_BASE_URL || "";

    if (!base) {
      const port = await pickFreePort();
      base = `http://127.0.0.1:${port}`;
      const env = {
        ...process.env,
        PGLITE_DATA_DIR: ":memory:",
        BETTER_AUTH_SECRET: "a11y-test-secret-please-keep-32-chars-minimum-0000",
        BETTER_AUTH_URL: base,
        EW_HTTP_PORT: String(port),
      };
      delete env.DATABASE_URL;

      server = spawn(
        process.execPath,
        [
          "scripts/with-app-env.mjs",
          process.execPath,
          "node_modules/vite/bin/vite.js",
          "dev",
          "--host",
          "127.0.0.1",
          "--port",
          String(port),
        ],
        { cwd: ROOT, env, stdio: ["ignore", "pipe", "pipe"] },
      );
      server.stdout.on("data", (d) => serverLog.push(String(d)));
      server.stderr.on("data", (d) => serverLog.push(String(d)));
      server.on("exit", (code, signal) => {
        serverLog.push(`[vite-exit code=${code} signal=${signal}]\n`);
      });
      await waitHttp(`${base}/`, serverLog);
    }

    browser = await Promise.race([
      chromium.launch({ headless: true }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Chromium launch exceeded ${Math.min(waitMs(60000), waitMs(LIVE_A11Y_DEADLINE_MS))}ms deadline`)),
          Math.min(waitMs(60000), waitMs(LIVE_A11Y_DEADLINE_MS)),
        ),
      ),
    ]);
    try {
      if (base && !server) {
        await waitHttp(`${base}/`, serverLog);
      }
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();

      async function auditRoute(path, { expectNav = true, expectBanner = true, navigate = true } = {}) {
        const headingNames = {
          "/": "Never claim what the business cannot prove.",
          "/login": "Sign in",
          "/signup": "Create an account",
          "/app": "Organisations",
          "/app/org_": "Overview",
          "evidence": "Evidence",
          "facts": "Facts",
          "questionnaires": "Questionnaires",
          "packs": "Response packs",
          "compliance": "Compliance",
          "decisions": "Decision Inbox",
          "opportunities": "Opportunities",
          "entities": "Entities & inbox",
          "exports": "Exports",
          "team": "Team",
          "audit": "Audit",
          "control-mcp": "Chapelgate MCP",
        };

        function getHeadingName(path) {
          if (path === "/") return headingNames["/"];
          if (path === "/login") return headingNames["/login"];
          if (path === "/signup") return headingNames["/signup"];
          if (path === "/app") return headingNames["/app"];
          if (path.startsWith("/app/org_") && path.split("/").length === 3) return headingNames["/app/org_"];
          const segments = path.split("/").filter(Boolean);
          const last = segments[segments.length - 1];
          return headingNames[last] || "";
        }

        const expectedHeading = getHeadingName(path);

        if (navigate) {
          await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded", timeout: waitMs(30000) });
        }
        let axeResults;
        let ariaTree;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            if (expectedHeading) {
              await page.getByRole("heading", { level: 1, name: expectedHeading }).waitFor({ state: "visible", timeout: waitMs(15000) });
            } else {
              await page.waitForSelector("h1", { timeout: waitMs(15000) });
            }
            await page.waitForSelector("main", { timeout: waitMs(15000) });
            if (path === "/signup") {
              await page.getByRole("textbox", { name: "Name" }).waitFor({ state: "visible", timeout: waitMs(15000) });
            }
            await page.waitForTimeout(500);
            let settled = false;
            for (let settleAttempt = 0; settleAttempt < 15; settleAttempt++) {
              await page.waitForTimeout(settleAttempt === 0 ? 300 : 200);
              ariaTree = await page.locator("body").ariaSnapshot();
              const { issues } = findAriaSnapshotIssues(ariaTree);
              const hasBanner = /banner:/.test(ariaTree);
              const hasMain = /main:/.test(ariaTree);
              const hasNav = /navigation/.test(ariaTree);
              const hasH1 = /heading\s+"[^"]+"\s+\[level=1\]/.test(ariaTree);
              const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const hasExpectedHeading = expectedHeading
                ? new RegExp(`heading\\s+"${escapeRegex(expectedHeading)}"\\s+\\[level=1\\]`).test(ariaTree)
                : /heading\s+"[^"]+"\\s+\\[level=1\\]/.test(ariaTree);
              const signupFormReady =
                path !== "/signup" ||
                (/textbox "Name"/.test(ariaTree) &&
                  /textbox "Email"/.test(ariaTree) &&
                  /textbox "Password"/.test(ariaTree) &&
                  /button "Create account"/.test(ariaTree) &&
                  !/Checking whether new accounts are open/.test(ariaTree));
              if (
                issues.length === 0 &&
                hasMain &&
                hasH1 &&
                hasExpectedHeading &&
                signupFormReady &&
                (expectBanner === false || hasBanner) &&
                (expectNav === false || hasNav)
              ) {
                settled = true;
                break;
              }
              await page.waitForTimeout(200);
            }
            if (!settled) {
              throw new Error(`ARIA tree did not settle for ${path}`);
            }
            axeResults = await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
              .analyze();
            break;
          } catch (err) {
            if (attempt < 2 && /Execution context was destroyed|Target page, context or browser has been closed/i.test(String(err))) {
              await page.waitForTimeout(1000);
              continue;
            }
            throw err;
          }
        }

        assert.deepEqual(
          axeResults.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.map((n) => n.html),
          })),
          [],
          `axe WCAG 2.2 AA violations on ${path}`,
        );

        const { issues } = findAriaSnapshotIssues(ariaTree);
        assert.deepEqual(issues, [], `ARIA snapshot issues on ${path}: ${issues.join("; ")}`);
        if (expectBanner) {
          assert.match(ariaTree, /banner:/, `${path}: missing banner landmark in accessibility tree`);
        }
        assert.match(ariaTree, /main:/, `${path}: missing main landmark in accessibility tree`);
        if (expectNav) {
          assert.match(ariaTree, /navigation/, `${path}: missing navigation landmark in accessibility tree`);
        }
        assert.match(ariaTree, /heading\s+"[^"]+"\s+\[level=1\]/, `${path}: missing level=1 heading in accessibility tree`);
        return ariaTree;
      }

      const homeTree = await auditRoute("/", { expectNav: true, expectBanner: true, navigate: true });
      assert.match(homeTree, /link "Skip to content"/);

      await page.keyboard.press("Tab");
      const firstFocused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        const style = window.getComputedStyle(el);
        return {
          text: (el.textContent ?? "").trim(),
          href: el.getAttribute("href"),
          outlineStyle: style.outlineStyle,
          outlineWidth: style.outlineWidth,
        };
      });
      assert.equal(firstFocused?.text, "Skip to content");
      assert.equal(firstFocused?.href, "#main");
      assert.notEqual(firstFocused?.outlineStyle, "none");

      const loginTree = await auditRoute("/login", { expectNav: false, expectBanner: false });
      assert.match(loginTree, /textbox "Email"/);
      assert.match(loginTree, /textbox "Password"/);
      assert.match(loginTree, /button "Sign in with email"/);

      const signupTree = await auditRoute("/signup", { expectNav: false, expectBanner: false });
      assert.match(signupTree, /textbox "Name"/);
      assert.match(signupTree, /textbox "Email"/);
      assert.match(signupTree, /textbox "Password"/);
      assert.match(signupTree, /button "Create account"/);

      const email = `a11y.${Date.now()}@example.com`;
      const password = "CorrectHorseBattery1";
      await page.getByLabel("Name").fill("A11y Reviewer");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Create account" }).click();
      await page.waitForURL(/\/app/, { timeout: waitMs(20000) });

      await page.getByRole("heading", { name: "Organisations" }).waitFor({ state: "visible", timeout: waitMs(20000) });

      await auditRoute("/app", { expectNav: false, expectBanner: true, navigate: false });

      await page.getByPlaceholder("Organisation name").fill("Example Vendor (Sample) Ltd");
      await page.getByRole("button", { name: "Create organisation" }).click();
      const orgLink = page.getByRole("link", { name: /Example Vendor/ });
      await orgLink.waitFor({ state: "visible", timeout: waitMs(15000) });
      const href = await orgLink.getAttribute("href");
      assert.ok(href && href.startsWith("/app/org_"), `Expected org link href, got ${href}`);
      const orgId = href.split("/")[2];
      await orgLink.click();
      await page.waitForURL(/\/app\/org_/, { timeout: waitMs(20000) });

      await auditRoute(`/app/${orgId}`, { expectNav: true, expectBanner: true, navigate: false });

      const loadDemoBtn = page.getByRole("button", { name: "Load demonstration pack" });
      await loadDemoBtn.click();
      await page.getByText(/Loaded \d+ files/).waitFor({ timeout: waitMs(60000) });

      const orgRoutes = [
        `/app/${orgId}/evidence`,
        `/app/${orgId}/facts`,
        `/app/${orgId}/questionnaires`,
        `/app/${orgId}/packs`,
        `/app/${orgId}/compliance`,
        `/app/${orgId}/decisions`,
        `/app/${orgId}/opportunities`,
        `/app/${orgId}/entities`,
        `/app/${orgId}/exports`,
        `/app/${orgId}/team`,
        `/app/${orgId}/audit`,
        `/app/${orgId}/control-mcp`,
      ];

      for (const routePath of orgRoutes) {
        await auditRoute(routePath, { expectNav: true });
      }
    } finally {
      try {
        if (browser) await browser.close();
      } catch {
        // browser may never have launched
      }
      if (server && !server.killed) {
        server.kill("SIGTERM");
        await new Promise((r) => setTimeout(r, 1000));
        if (!server.killed) server.kill("SIGKILL");
      }
    }
  });
});
