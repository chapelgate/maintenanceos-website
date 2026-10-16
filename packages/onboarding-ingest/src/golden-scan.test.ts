import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { extractDraftFromHtml } from "./extract.ts";
import {
  assertCanaryTimings,
  assertGoldenRates,
  goldenJunkFailures,
  gradeGoldenSite,
  validateGoldenExpected,
} from "./golden-scan.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

test("golden grader rejects name junk, placeholder hours, and contact in services", () => {
  assert.deepEqual(
    goldenJunkFailures({
      name: "Black and Pink Modern Initials Logo Design_edited.jpg",
      hours: "Mo-Su 00:00-23:59",
      hoursConfidence: "high",
      services: ["[email protected]", "Boiler repair"],
    }).sort(),
    ["hours_junk", "name_junk", "services_contact"],
  );
  assert.equal(
    goldenJunkFailures({
      name: "Acme Plumbing",
      hours: "Saturday 09:00-12:00",
      hoursConfidence: "low",
      services: ["Boiler repair"],
    }).length,
    0,
  );
  assert.ok(
    goldenJunkFailures({
      hours: "Monday 09:00-17:00",
      hoursConfidence: "high",
    }).includes("hours_junk"),
  );

  const extracted = extractDraftFromHtml([
    {
      url: "https://junk.example/",
      html: `<script type="application/ld+json">{"@type":"LocalBusiness","name":"logo.jpg","openingHours":"Mo-Su 00:00-23:59","makesOffer":[{"itemOffered":{"name":"[email protected]"}}]}</script>`,
    },
  ]);
  const failures = goldenJunkFailures({
    name: extracted.draft.businessName,
    hours: extracted.draft.hours,
    hoursConfidence: extracted.fieldMeta.hours?.confidence,
    services: extracted.facts.services,
  });
  assert.equal(failures.includes("name_junk"), extracted.draft.businessName === "logo.jpg");
  if (extracted.draft.hours?.includes("00:00")) assert.ok(failures.includes("hours_junk"));
  if (extracted.facts.services?.some((item) => item.includes("@"))) {
    assert.ok(failures.includes("services_contact"));
  }
});

test("golden rates and canary timing fail closed", () => {
  assert.throws(() => assertGoldenRates({ correct: 4, wrong: 1, total: 10 }));
  assert.doesNotThrow(() => assertGoldenRates({ correct: 5, wrong: 0, total: 10 }));
  assert.throws(() => assertCanaryTimings([{ status: 200, ms: 25_001 }]));
  assert.doesNotThrow(() => assertCanaryTimings([{ status: 200, ms: 25_000 }, { status: 504, ms: 40_000 }]));
});

test("golden expected schema accepts a site and grades one field", () => {
  const sample = validateGoldenExpected({
    version: 1,
    thresholds: { minCorrectRate: 0.47, maxWrongRate: 0.03, maxOkResponseMs: 25000 },
    sites: [
      {
        id: "example",
        url: "https://example.com/",
        fields: {
          name: { value: "Example Domain", accept: ["Example"] },
          services: { value: ["Boiler repair"] },
        },
      },
    ],
  });
  const grades = gradeGoldenSite(
    { name: "Example Domain", services: ["Boiler repair"] },
    sample.sites[0],
  );
  assert.equal(grades.name, "correct");
  assert.equal(grades.services, "correct");
  assert.equal(grades.phone, "missing");

  const schema = JSON.parse(
    readFileSync(join(ROOT, "test/golden/expected.schema.json"), "utf8"),
  );
  assert.equal(schema.properties.version.const, 1);
  assert.equal(schema.properties.thresholds.properties.maxOkResponseMs.default, 25000);
  assert.ok(schema.properties.sites.items.properties.fields.properties.faqs);

  const expectedPath = join(ROOT, "test/golden/expected.json");
  if (existsSync(expectedPath)) {
    const file = validateGoldenExpected(JSON.parse(readFileSync(expectedPath, "utf8")));
    assert.ok(file.sites.length > 0);
  }
});
