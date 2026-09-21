import { CtaPair } from "@/components/CtaPair";
import { CustomerDashboard } from "@/components/CustomerDashboard";
import { PageHero } from "@/components/PageHero";
import { siteConfig } from "@/config/site";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: siteConfig.customerDashboardEnabled
    ? "Customer dashboard (SAMPLE / DEMO)"
    : "Customer dashboard — coming / under testing",
  description: siteConfig.customerDashboardEnabled
    ? "Local SAMPLE / DEMO call history, transcripts, and booking stubs. Not live production metrics or a customer portal."
    : "Customer dashboard for call history and transcripts is coming / under testing. Not a live customer portal.",
  path: "/dashboard/",
});

export default function CustomerDashboardPage() {
  const enabled = siteConfig.customerDashboardEnabled;

  return (
    <>
      <PageHero
        eyebrow={enabled ? "Local testing · Pre-launch" : "Coming / under testing · Pre-launch"}
        title={
          enabled
            ? "Customer dashboard — SAMPLE / DEMO foundation"
            : "Customer dashboard — coming / under testing"
        }
        lede={
          enabled
            ? "Call history, a mock transcript, and a bookings stub for local ReceptionistOS testing. Rows are labelled SAMPLE / DEMO. This is not a live customer portal and is not wired to frozen telephony."
            : "A customer dashboard for sandbox call history and transcripts is being built behind a feature flag. This page does not show live metrics, invent customers, or attach a phone line."
        }
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-12">
        <CustomerDashboard />

        <section
          className="mos-glass p-5 text-sm text-muted"
          aria-labelledby="dashboard-limits-heading"
        >
          <h2
            id="dashboard-limits-heading"
            className="text-base font-semibold text-ink"
          >
            Honest limits
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Off by default via{" "}
              <code className="text-xs">NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED</code>
            </li>
            <li>
              SAMPLE / DEMO rows are examples for local testing — never live
              production KPIs
            </li>
            <li>An empty store does not invent customers or call history</li>
            <li>
              Bookings are a calendar-adapter stub, not a confirmed phone
              booking
            </li>
            <li>
              Live telephony changes stay gated until controlled-call criteria
              pass
            </li>
          </ul>
          <div className="mt-5">
            <CtaPair />
          </div>
        </section>
      </div>
    </>
  );
}
