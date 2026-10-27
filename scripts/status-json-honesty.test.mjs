<path>/root/jobs-work/readiness-loop/worktrees/mw-126-status-json-honesty/scripts/status-json-honesty.test.mjs</path>
<type>file</type>
<content>
1: import assert from "node:assert/strict";
2: import fs from "node:fs";
3: import path from "node:path";
4: import test from "node:test";
5: import { fileURLToPath } from "node:url";
6: 
7: const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
8: const status = JSON.parse(
9:   fs.readFileSync(path.join(ROOT, "public/status.json"), "utf8"),
10: );
11: const page = fs.readFileSync(path.join(ROOT, "src/app/status/page.tsx"), "utf8");
12: 
13: test("status.json denies live status, uptime, and SLA", () => {
14:   assert.equal(status.schema, 1);
15:   assert.equal(status.live, false);
16:   assert.equal(status.public_launch, false);
17:   assert.equal(status.sla_claim, false);
18:   assert.equal(status.uptime_percent, null);
19:   assert.equal(status.incident_feed, false);
20:   assert.match(status.note, /No live status/);
21:   assert.match(status.note, /SLA/);
22:   assert.doesNotMatch(JSON.stringify(status), /99\.\d%/);
23: });
24: 
25: test("status.json names Chapelgate Limited with company number", () => {
26:   assert.equal(status.product, "MaintenanceOS");
27:   assert.equal(status.brand, "WorkSmartOS");
28:   assert.equal(status.publisher, "Chapelgate Limited");
29:   assert.equal(status.company_number, "12340004");
30: });
31: 
32: test("status page links status.json and denies SLA claims", () => {
33:   assert.match(page, /href="\/status\.json"/);
34:   assert.match(page, /sla_claim false/);
35:   assert.match(page, /uptime_percent null/);
36:   assert.match(page, /does\s+not publish an SLA/);
37:   assert.match(page, /index: false/);
38:   assert.doesNotMatch(page, /99\.\d%/);
39:   assert.doesNotMatch(page, /uptime guarantee/i);
40: });

(End of file - total 40 lines)
</content>