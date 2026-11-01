import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const contactPage = fs.readFileSync(
  path.join(ROOT, "src/app/contact/page.tsx"),
  "utf8",
);
const deferred = fs.readFileSync(
  path.join(ROOT, "src/components/DeferredLeadCaptureForm.tsx"),
  "utf8",
);

test("DeferredLeadCaptureForm uses next/dynamic with ssr:false and accessible placeholder", () => {
  assert.match(deferred, /next\/dynamic/);
  assert.match(deferred, /import\(["']@\/components\/LeadCaptureForm["']\)/);
  assert.match(deferred, /ssr:\s*false/);
  assert.match(deferred, /aria-busy="true"/);
  assert.match(deferred, /Loading enquiry form/);
});

test("contact page uses DeferredLeadCaptureForm instead of static LeadCaptureForm import", () => {
  assert.match(
    contactPage,
    /import \{ DeferredLeadCaptureForm \} from ["']@\/components\/DeferredLeadCaptureForm["']/,
  );
  assert.match(contactPage, /<DeferredLeadCaptureForm/);
  assert.doesNotMatch(
    contactPage,
    /import \{ LeadCaptureForm \} from ["']@\/components\/LeadCaptureForm["']/,
  );
  assert.doesNotMatch(contactPage, /<LeadCaptureForm/);
});

test("static export setting is unchanged by contact lead deferral", () => {
  const config = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  assert.match(config, /output:\s*["']export["']/);
});
