import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/config/site";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = {
  ...contentPageMetadata({
    title: "Admin",
    description:
      "Internal admin overview — live pre-launch flag status and honesty gates. Not a public page.",
    path: "/admin/",
  }),
  robots: { index: false, follow: false },
};

function flagLabel(on: boolean): string {
  return on ? "enabled" : "disabled";
}

export default function AdminPage() {
  const publicLaunch = siteConfig.publicLaunch;
  const calendar = siteConfig.calendarAdaptersEnabled;
  const sandbox = siteConfig.sandboxTestCallEnabled;
  const dashboard = siteConfig.customerDashboardEnabled;
  const demoPhone = siteConfig.demoPhoneNumber.trim();
  const formEndpoint = siteConfig.formEndpoint;
  const measurement = siteConfig.measurementEndpoint;

  return (
    <>
      <JsonLd
        data={contentPageJsonLd(
          "/admin/",
          "Admin",
          "Internal admin overview — live pre-launch flag status and honesty gates. Not a public page.",
          [{ name: "Admin", path: "/admin/" }],
        )}
      />
      <PageHero
        eyebrow="Internal — Pre-launch"
        title="Admin overview"
        lede="This page is for internal review only. Flag values are read from the current build. No customer records or operational KPIs are shown."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 text-sm text-muted">
        <section aria-labelledby="admin-flags" className="space-y-3">
          <h2 id="admin-flags" className="text-lg font-semibold text-ink">
            Live build flags
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <code>publicLaunch</code>:{" "}
              <strong data-admin-flag="publicLaunch">{flagLabel(publicLaunch)}</strong>
              {publicLaunch ? "" : " — site fails closed"}
            </li>
            <li>
              <code>calendarAdaptersEnabled</code>:{" "}
              <strong data-admin-flag="calendar">{flagLabel(calendar)}</strong>
            </li>
            <li>
              <code>sandboxTestCallEnabled</code>:{" "}
              <strong data-admin-flag="sandbox">{flagLabel(sandbox)}</strong>
            </li>
            <li>
              <code>customerDashboardEnabled</code>:{" "}
              <strong data-admin-flag="dashboard">{flagLabel(dashboard)}</strong>
            </li>
            <li>
              Demo phone:{" "}
              <strong data-admin-flag="demoPhone">
                {demoPhone ? "configured" : "not configured"}
              </strong>
            </li>
            <li>
              Form endpoint:{" "}
              <strong data-admin-flag="formEndpoint">
                {formEndpoint ? "configured" : "mailto fallback"}
              </strong>
            </li>
            <li>
              Measurement endpoint:{" "}
              <strong data-admin-flag="measurement">
                {measurement ? "configured" : "disabled"}
              </strong>
            </li>
          </ul>
        </section>

        <section aria-labelledby="admin-honesty" className="space-y-3">
          <h2 id="admin-honesty" className="text-lg font-semibold text-ink">
            Pre-launch honesty gates
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>All calendar integrations: <strong>coming soon</strong> (not live)</li>
            <li>Chat widget: <strong>not connected</strong> (mailto only)</li>
            <li>Pricing: <strong>placeholder labels only</strong> (not publishable)</li>
            <li>Health monitor: <strong>retired host disabled</strong> (control plane only)</li>
          </ul>
        </section>

        <section aria-labelledby="admin-gates" className="space-y-3">
          <h2 id="admin-gates" className="text-lg font-semibold text-ink">
            Gates pending Andy / frozen
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>mw-1023-01-licences: exact-candidate third-party licence evidence</li>
            <li>mw-1024-01-estate-meta: Estate Gate metadata convergence</li>
            <li>Solicitor DPIA/DPA/privacy/terms (LAST GATE)</li>
            <li>ICO self-assessment + fee (LAST GATE)</li>
            <li>Companies House recheck (LAST GATE)</li>
            <li>Manual Safari/iOS, keyboard, AT checks (Andy physical)</li>
            <li>NEXT_PUBLIC_PUBLIC_LAUNCH=true approval (Andy)</li>
            <li>Production deploy/nginx: frozen</li>
            <li>Onboarding scanner: frozen (t835u) — not operated from this page</li>
          </ul>
        </section>

        <section aria-labelledby="admin-internal-nav" className="space-y-3">
          <h2 id="admin-internal-nav" className="text-lg font-semibold text-ink">
            Internal review pages
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-xs">
            <li><a href="/buyers/" className="text-accent underline-offset-4 hover:underline">Buyers note</a> — synthetic demo pack, no price/uptime</li>
            <li><a href="/onboarding/" className="text-accent underline-offset-4 hover:underline">Onboarding walkthrough</a> — ordered steps; scanner frozen (t835u)</li>
            <li><a href="/accessibility/" className="text-accent underline-offset-4 hover:underline">Accessibility</a> — target, gaps, no WCAG AA claim</li>
            <li><a href="/status/" className="text-accent underline-offset-4 hover:underline">Status</a> — live build flags mirror</li>
            <li><a href="/create/" className="text-accent underline-offset-4 hover:underline">Create preview</a> — receptionist draft, no live provisioning</li>
            <li><a href="/compare/" className="text-accent underline-offset-4 hover:underline">Compare</a> — feature parity table, no competitor PII</li>
          </ul>
        </section>

        <p className="text-sm text-muted">
          Related pre-launch pages:{" "}
          <a href="/help/" className="font-medium text-accent underline-offset-4 hover:underline">Help</a>
          {" · "}
          <a href="/trust/" className="font-medium text-accent underline-offset-4 hover:underline">Trust</a>
          {" · "}
          <a href="/security/" className="font-medium text-accent underline-offset-4 hover:underline">Security</a>
          {" · "}
          <a href="/status/" className="font-medium text-accent underline-offset-4 hover:underline">Status</a>
          {" · "}
          <a href="/contact/" className="font-medium text-accent underline-offset-4 hover:underline">Contact</a>
          . Internal review surface only — not a live ops console, and not a customer admin portal.
        </p>
      </div>
    </>
  );
}
