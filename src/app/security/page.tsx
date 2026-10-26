import { BentoCard } from "@/components/BentoCard";
import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { SafeAutomationLink } from "@/components/SafeAutomationLink";
import { JsonLd } from "@/components/JsonLd";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Security and Data Separation",
  description:
    "How MaintenanceOS keeps organisation records separate, enforces boundaries, and records actions. No certifications claimed. Pre-launch.",
  path: "/security/",
});

export default function SecurityPage() {
  return (
    <>
      <JsonLd
        data={contentPageJsonLd("/security/", "Security and Data Separation", "How MaintenanceOS keeps organisation records separate, enforces boundaries, and records actions. No certifications claimed. Pre-launch.", [
          { name: "Security", path: "/security/" },
        ])}
      />
      <PageHero
        eyebrow="Trust · Pre-launch"
        title="How we keep your data separate and your actions on record"
        lede="Tenant isolation, zero client-money execution, and an immutable audit trail. Controls sit in source code, not marketing claims."
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Core architectural controls
        </h2>
        <p className="mt-2 text-sm text-muted">
          Controls implemented directly in product source code.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <BentoCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="Tenant Isolation"
            description="Strict separation of organisation records. Data stays inside your workspace, verified by automated test suites."
          />

          <BentoCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Zero Client-Money Authority"
            description="No payment, refund, compensation, fee-waiver, or client-money execution authority. The system cannot move money."
          />

          <BentoCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Audit Trails"
            description="Every intake event and supervisor decision is permanently recorded with user attribution and timestamps."
          />

          <BentoCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            title="Honest Certification Status"
            description="No ISO 27001, SOC 2, or bank-grade claims. Security controls exist in product code rather than certificate theatre."
          />
        </div>
      </section>

      <SafeAutomationLink />

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 border-t border-border">
        <h2 className="text-xl font-semibold text-ink">
          Core architectural controls
        </h2>
        <p className="text-sm text-muted">
          Controls implemented directly in product source code.
        </p>
        <div className="mt-4 flex gap-2">
          <span className="px-3 py-1 text-xs font-medium bg-primary/10 border border-primary rounded">
            Cyber Essentials: PLANNED (target Q2 2027)
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 border-t border-border">
        <h2 className="text-xl font-semibold text-ink">
          Operational verification
        </h2>
        <p className="text-sm text-muted">
          Local acceptance on 10 September 2026 included a full automated test pass, a closed local run, and a backup and restore check. Recorded build checks and security checks passed on the canonical application code. That is not an uptime percentage, latency guarantee, or SLA.
        </p>
        <p className="text-sm text-muted">
          Website learning reads only a small, bounded set of public HTTPS pages. Here, private/internal addresses are blocked, and robots.txt is honoured.
        </p>
        <p className="text-sm text-muted">
          Static-host HTTP response headers for clickjacking defence
          (<code>X-Frame-Options</code> / CSP <code>frame-ancestors</code>) are
          not claimed as resolved on the current static host. That residual risk
          stays open until an authorised host-header change or explicit owner
          acceptance before public launch. This page does not change deploy or
          nginx configuration.
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-4 px-4 pb-12 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-ink">
          Privacy and governance
        </h2>
        <p className="text-sm text-muted">
          Marketing-site privacy, cookies, and terms are <strong>DRAFT FOR LEGAL REVIEW</strong>. Product interest starts at Request an early demo.
        </p>
        <CtaPair
          className="mt-6"
          primaryHref="/demo/"
          primaryLabel="Request an early demo"
          secondaryHref="/vulnerability-disclosure/"
          secondaryLabel="Vulnerability disclosure"
        />
        <CtaPair
          className="mt-6"
          primaryHref="/subprocessors/"
          primaryLabel="Subprocessor page"
          secondaryHref="/vulnerability-disclosure/"
          secondaryLabel="Vulnerability disclosure"
        />

        <p className="mt-4 text-sm text-muted">
          <a href="/vulnerability-disclosure/" className="underline hover:text-accent">
            Vulnerability disclosure page
          </a>
        </p>
        <p className="mt-4 text-sm text-muted">
          <a href="/subprocessors/" className="underline hover:text-accent">
            Subprocessor page
          </a>
        </p>
      </section>
    </>
  );
}
