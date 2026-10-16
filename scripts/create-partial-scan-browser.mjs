/**
 * Browser proof for a PARTIAL scanner result on /create.
 * Serves the static export and mocks POST /api/website/scan.
 *
 *   npm run build && node scripts/create-partial-scan-browser.mjs
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const port = 4173;
const origin = `http://127.0.0.1:${port}`;

const partialBody = {
  ok: true,
  draft: {
    businessName: "Alley Gates",
    services: "Alley gate installation",
  },
  warnings: ["http_401", "scanner_v2_partial"],
  scannerV2: {
    state: "PARTIAL",
    discovered: 4,
    fetched: 2,
    unresolved: 1,
  },
};

const zeroFetchBody = {
  ok: true,
  draft: {},
  warnings: ["scanner_v2_partial"],
  scannerV2: {
    state: "PARTIAL",
    discovered: 1,
    fetched: 0,
    unresolved: 0,
  },
};

const crawlingBody = {
  ok: true,
  draft: {
    businessName: "Town Heating",
    services: "Boiler repair",
  },
  facts: {
    website: "https://trades.example/",
    businessName: "Town Heating",
    address: "Bromborough, Wirral",
    contact: { phones: ["07774179685", "01516 532 896"] },
    services: ["Boiler repair"],
  },
  factMeta: {
    address: {
      source: "heading",
      confidence: "low",
      sourceUrl: "https://trades.example/",
    },
    contact: { source: "contact_link", confidence: "medium" },
  },
  warnings: ["http_404", "content_type_not_supported", "scanner_v2_in_progress"],
  scannerV2: {
    state: "CRAWLING",
    discovered: 40,
    fetched: 8,
    unresolved: 0,
  },
};

const crawlingDoneBody = {
  ...crawlingBody,
  draft: {
    businessName: "Town Heating",
    services: "Boiler repair\nCentral heating",
  },
  warnings: ["http_404"],
  scannerV2: {
    state: "COMPLETE",
    discovered: 40,
    fetched: 12,
    unresolved: 0,
  },
};

const blockedBody = {
  ok: true,
  outcome: "blocked_by_site",
  draft: {},
  warnings: ["http_403", "blocked_by_site", "scanner_v2_partial"],
  scannerV2: {
    state: "PARTIAL",
    discovered: 1,
    fetched: 0,
    unresolved: 0,
  },
};

let mode = "partial";
let crawlCalls = 0;
const server = spawn("npx", ["serve", "out", "-l", String(port)], {
  stdio: "ignore",
  detached: false,
});

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/create/`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("static server did not start");
}

try {
  await waitForServer();
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.route("**/api/website/scan", async (route) => {
      const body =
        mode === "partial"
          ? partialBody
          : mode === "blocked"
            ? blockedBody
            : mode === "crawling"
              ? (crawlCalls += 1) < 3
                ? {
                    ...crawlingBody,
                    scannerV2: {
                      ...crawlingBody.scannerV2,
                      fetched: crawlCalls === 1 ? 2 : 4,
                    },
                  }
                : crawlingDoneBody
              : mode === "crawling-stuck"
                ? (crawlCalls += 1, crawlingBody)
              : zeroFetchBody;
      if (mode === "crawling" || mode === "crawling-stuck") {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });

    await page.goto(`${origin}/create/`);
    await page.locator("[data-create-hydrated='true']").waitFor();
    await page.locator("input[name='businessUrl']").fill("https://alleygates.co.uk");
    await page.locator("input[name='email']").fill("owner@example.com");
    await page.locator("[data-create-primary-action]").click();

    const partial = page.locator("[data-scan-partial]");
    await partial.waitFor({ timeout: 15_000 });
    const partialText = await partial.innerText();
    assert.match(partialText, /Partial website check/);
    assert.match(partialText, /Found: business name, services/);
    assert.match(partialText, /Still blank, for you to fill in: greeting, opening hours, questions and answers/);
    assert.match(partialText, /Read 2 of 4 discovered public pages/);
    assert.match(partialText, /fill the gaps yourself/);
    assert.match(partialText, /Nothing was invented/);
    await page.locator("[data-create-primary-action]").click();

    await page.locator("input[name='agent-type'][value='receptionist']").check();
    await page.locator("[data-create-primary-action]").click();
    await page.locator("[data-scan-partial]").waitFor();
    const hours = page.getByLabel("Hours", { exact: false });
    await hours.fill("Monday to Friday, 8am to 5pm");
    assert.equal(await hours.inputValue(), "Monday to Friday, 8am to 5pm");
    const reviewText = await page.locator("[data-scan-partial]").innerText();
    assert.match(reviewText, /opening hours/);
    assert.doesNotMatch(reviewText, /Still blank, for you to fill in: greeting, opening hours/);

    mode = "zero";
    await page.goto(`${origin}/create/`);
    await page.locator("[data-create-hydrated='true']").waitFor();
    await page.locator("input[name='businessUrl']").fill("https://alleygates.co.uk");
    await page.locator("input[name='email']").fill("owner@example.com");
    await page.locator("[data-create-primary-action]").click();
    await page.getByText(/could not read any public pages/i).waitFor({ timeout: 15_000 });
    assert.equal(await page.locator("[data-scan-partial]").count(), 0);
    await page.locator("[data-create-primary-action]").click();
    await page.getByText(/What do you want your AI to do/i).waitFor();

    mode = "blocked";
    await page.goto(`${origin}/create/`);
    await page.locator("[data-create-hydrated='true']").waitFor();
    await page.locator("input[name='businessUrl']").fill("https://alleygates.co.uk");
    await page.locator("input[name='email']").fill("owner@example.com");
    await page.locator("[data-create-primary-action]").click();
    const blocked = page.locator("[data-scan-blocked]");
    await blocked.waitFor({ timeout: 15_000 });
    const blockedText = await blocked.innerText();
    assert.match(blockedText, /blocks automated reading/i);
    assert.match(blockedText, /typing the details/i);
    assert.match(blockedText, /pasting wording/i);
    assert.match(blockedText, /178\.128\.171\.45/);
    assert.match(blockedText, /ask the host/i);
    assert.equal(await page.locator("[data-scan-partial]").count(), 0);
    const primary = page.locator("[data-create-primary-action]");
    await primary.click();
    await page.locator("input[name='agent-type'][value='receptionist']").check();
    await primary.click();
    const services = page.getByLabel("Services", { exact: false });
    await services.waitFor();
    await services.fill("Alley gate installation, typed in by hand");
    assert.match(await services.inputValue(), /typed in by hand/);
    assert.match(await page.locator("[data-scan-host-allow]").innerText(), /178\.128\.171\.45/);

    mode = "crawling";
    crawlCalls = 0;
    await page.goto(`${origin}/create/`);
    await page.locator("[data-create-hydrated='true']").waitFor();
    await page.locator("input[name='businessUrl']").fill("https://trades.example");
    await page.locator("input[name='email']").fill("owner@example.com");
    await page.locator("[data-create-primary-action]").click();
    await page.getByText(/Reading more pages \(\d+ pages so far\)/).waitFor({ timeout: 15_000 });
    await page.getByText(/Scanner result: COMPLETE/).waitFor({ timeout: 15_000 });
    assert.equal(crawlCalls, 3);
    assert.equal(await page.locator("[data-scan-crawling]").count(), 0);
    assert.equal(await page.locator("[data-scan-large-site]").count(), 0);

    mode = "crawling-stuck";
    crawlCalls = 0;
    await page.goto(`${origin}/create/`);
    await page.locator("[data-create-hydrated='true']").waitFor();
    await page.locator("input[name='businessUrl']").fill("https://trades.example");
    await page.locator("input[name='email']").fill("owner@example.com");
    await page.locator("[data-create-primary-action]").click();
    const crawling = page.locator("[data-scan-crawling]");
    await crawling.waitFor({ timeout: 20_000 });
    assert.equal(crawlCalls, 5);
    const crawlingText = await crawling.innerText();
    assert.match(crawlingText, /page budget/i);
    assert.match(crawlingText, /usable/i);
    assert.match(await page.locator("[data-scan-large-site]").innerText(), /contact page or the services page/i);
    assert.match(await page.locator("[data-scan-skipped]").innerText(), /Some pages were skipped/);
    assert.doesNotMatch(crawlingText, /failed/i);
    const continueScan = page.locator("[data-scan-continue]");
    assert.equal(await continueScan.isEnabled(), true);
    assert.equal(await page.locator("[data-create-primary-action]").isEnabled(), true);
    await continueScan.click();
    await page.getByText(/Scanner result: CRAWLING/).waitFor({ timeout: 15_000 });
    assert.equal(await page.locator("[data-scan-crawling]").count(), 1);
    await page.locator("[data-create-primary-action]").click();
    await page.locator("input[name='agent-type'][value='receptionist']").check();
    await page.locator("[data-create-primary-action]").click();
    const address = page.getByLabel("Address", { exact: false });
    await address.waitFor();
    assert.equal(await address.inputValue(), "Bromborough, Wirral");
    assert.equal(
      await page.getByLabel("Phone", { exact: false }).inputValue(),
      "07774179685 / 01516 532 896",
    );
    await address.fill("1 Dock Road, Liverpool");
    assert.equal(await address.inputValue(), "1 Dock Road, Liverpool");
    console.log("create-partial-scan-browser=ok");
  } finally {
    await browser.close();
  }
} finally {
  server.kill("SIGTERM");
}
