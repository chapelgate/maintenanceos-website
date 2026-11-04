import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const banner = read("src/components/CookieConsentBanner.tsx");
const settings = read("src/components/CookieSettingsStub.tsx");
const combined = `${banner}\n${settings}`;
test("consent persists only explicit choices and dismisses", () => {
  assert.match(banner, /localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(choice\)\)/);
  assert.match(banner, /if \(!isVisible\) return null/);
  assert.doesNotMatch(banner, /useEffect/);
});
test("accept and reject controls are equally operable", () => {
  assert.match(banner, /Accept optional categories/);
  assert.match(banner, /Reject optional categories/);
  assert.equal((banner.match(/min-h-11 flex-1/g) || []).length, 2);
  assert.doesNotMatch(banner, /role="banner"|aria-live="polite"/);
});
test("settings provide a reversible choice path", () => {
  assert.match(settings, /Current choice/);
  assert.match(settings, /choose\("accept"\)/);
  assert.match(settings, /choose\("reject"\)/);
});
test("copy does not claim optional tags are blocked", () => {
  assert.match(combined, /no analytics or marketing cookies/i);
  assert.doesNotMatch(combined, /blocks? non-essential scripts|WCAG 2\.2 AA compliant/);
});
