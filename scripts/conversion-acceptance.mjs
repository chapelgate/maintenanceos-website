import fs from "node:fs";

const site = fs.readFileSync("src/config/site.ts", "utf8");
const cta = fs.readFileSync("src/components/CtaPair.tsx", "utf8");
const lead = fs.readFileSync("src/components/LeadCaptureForm.tsx", "utf8");
const create = fs.readFileSync("src/components/CreateReceptionistForm.tsx", "utf8");
const demo = fs.readFileSync("src/components/DemoConversionTabs.tsx", "utf8");
const contact = fs.readFileSync("src/app/contact/page.tsx", "utf8");

const failures = [];

function requireMatch(text, pattern, message) {
  if (!pattern.test(text)) failures.push(message);
}

requireMatch(cta, /primaryHref = "\/create\//, "primary CTA is not /create/");
requireMatch(cta, /primaryLabel = "Create from website"/, "primary CTA label drifted");
requireMatch(lead, /Only email is required\. Everything else is optional\./,
  "shared lead form required-field contract drifted");
requireMatch(lead, /accepted into the lead queue/, "truthful accepted acknowledgement missing");
requireMatch(create, /submitLead/, "/create final submission no longer uses shared lead adapter");
requireMatch(demo, /leadType="launch_list"/, "demo launch-list conversion missing");
requireMatch(demo, /leadType="early_demo"/, "demo early-demo conversion missing");
requireMatch(contact, /leadType="contact"/, "contact conversion missing");
requireMatch(site, /rsfm-control-plane-production\.up\.railway\.app\/v1\/public\/website-leads/,
  "production website-lead endpoint drifted");

const controlPlane = "https://rsfm-control-plane-production.up.railway.app";
const websiteOrigin = process.env.WEBSITE_SITE_URL ||
  "https://maintenanceos.chapelgatetechnologies.com";

const ready = await fetch(controlPlane + "/ready", {
  headers: { "user-agent": "MaintenanceOS-Conversion-Acceptance/1.0" },
});
const readyText = await ready.text();
if (ready.status !== 200 || !/"backend"\s*:\s*"postgres"/.test(readyText)) {
  failures.push(`control plane readiness failed: HTTP ${ready.status}`);
}

for (const endpoint of ["/v1/public/website-leads", "/v1/public/website-events"]) {
  const response = await fetch(controlPlane + endpoint, {
    method: "OPTIONS",
    headers: {
      Origin: websiteOrigin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
      "user-agent": "MaintenanceOS-Conversion-Acceptance/1.0",
    },
  });
  const allow = response.headers.get("access-control-allow-origin");
  if (response.status >= 400) {
    failures.push(`${endpoint} preflight HTTP ${response.status}`);
  }
  if (allow !== websiteOrigin) {
    failures.push(`${endpoint} CORS origin mismatch: ${allow || "missing"}`);
  }
}

console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  websiteOrigin,
  controlPlane,
  productionPostPerformed: false,
  readyStatus: ready.status,
  failures,
  ok: failures.length === 0,
}, null, 2));

if (failures.length) process.exitCode = 1;
