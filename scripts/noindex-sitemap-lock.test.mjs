import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const noindexRoutes = [
  { path: "/dashboard/", page: "src/app/dashboard/page.tsx" },
  { path: "/status/", page: "src/app/status/page.tsx" },
  { path: "/buyers/", page: "src/app/buyers/page.tsx" },
];

test("noindex routes keep robots index false", () => {
  for (const route of noindexRoutes) {
    const page = read(route.page);
    assert.match(
      page,
      /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/,
      `${route.path} must stay noindex`,
    );
    assert.doesNotMatch(page, /buy now/i);
    assert.doesNotMatch(page, /£/);
  }
});

test("marketingPaths and sitemap omit noindex routes", () => {
  const routes = read("src/config/routes.ts");
  const sitemap = read("src/app/sitemap.ts");
  for (const route of noindexRoutes) {
    assert.doesNotMatch(
      routes,
      new RegExp(`"${route.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`),
      `marketingPaths must omit ${route.path}`,
    );
    assert.doesNotMatch(
      sitemap,
      new RegExp(`"${route.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`),
      `sitemap path map must omit ${route.path}`,
    );
  }
  assert.match(sitemap, /marketingPaths\.map/);
});

test("robots.txt disallows noindex routes and does not invent launch sales copy", () => {
  const robots = read("src/app/robots.ts");
  assert.match(robots, /"\/dashboard\/"/);
  assert.match(robots, /"\/status\/"/);
  assert.match(robots, /"\/buyers\/"/);
  assert.doesNotMatch(robots, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(robots, /buy now/i);
  assert.doesNotMatch(robots, /£/);
});
