import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/page.tsx"), "utf8");
const deferredForm = fs.readFileSync(
  path.join(ROOT, "src/components/HomeLeadCaptureForm.tsx"),
  "utf8",
);

test("home defers LeadCaptureForm behind next/dynamic so first paint stays light", () => {
  assert.match(deferredForm, /next\/dynamic/);
  assert.match(
    deferredForm,
    /import\(["']@\/components\/LeadCaptureForm["']\)/,
  );
  assert.match(deferredForm, /ssr:\s*false/);
  assert.match(deferredForm, /Loading launch list form/);
  assert.doesNotMatch(
    page,
    /import \{ LeadCaptureForm \} from ["']@\/components\/LeadCaptureForm["']/,
  );
});

test("home still renders the launch-list lead form after deferral", () => {
  assert.match(page, /<HomeLeadCaptureForm/);
  assert.match(page, /leadType="launch_list"/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("static export setting is unchanged by home lead deferral", () => {
  const config = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  assert.match(config, /output:\s*["']export["']/);
});
