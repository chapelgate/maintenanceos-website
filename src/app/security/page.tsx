import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { TrustPillars } from "@/components/TrustPillars";
import { SafeAutomationLink } from "@/components/SafeAutomationLink";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Security and Data Separation",
  description:
    "How MaintenanceOS keeps each organisation's records apart, checks phone-provider requests and records actions. No certifications claimed. Pre-launch.",
  path: "/security/",
});

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust · Pre-launch"
        title="How we keep your data separate and your actions on record"
        lede="Tenant isolation, human clearance for critical safety, and a reviewable trail of actions. Website learning reads only a small set of public HTTPS pages, and private or internal addresses are blocked. We do not claim ISO, SOC 2, bank-grade security, or any other certification we have not earned."
      />

      <TrustPillars />

      <SafeAutomationLink />

      <section
        aria-labelledby="controls-heading"
        className="mx-auto max-w-3xl space-y-6 px-4 pb-12"
      >
        <h2 id="controls-heading" className="text-xl font-semibold text-ink">
          Further design controls
        </h2>
        <p className="text-muted">
          These sit in product source as designed behaviour. Live operational
          verification remains on the release checklist — we do not treat
          source presence as a public certification. Local acceptance on 10 September 2026 included a full automated test pass, a closed local run, and a backup and restore check. Recorded build checks and security checks passed on the canonical application code. That is not an uptime percentage, latency guarantee, or SLA.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-muted">
          <li>
            Fixed safety and lifecycle rules are designed to override
            AI suggestions.
          </li>
          <li>
            Telephony request signatures (HTTP/WSS) are verified in source as a
            design control; live verification is still required before launch.
          </li>
          <li>
            AI has no payment, refund, compensation, fee-waiver, or
            client-money execution authority.
          </li>
          <li>
            The receptionist must not invent bookings, dispatches, refunds, or
            safety assurances.
          </li>
          <li>
            Website learning reads only a small, bounded set of public HTTPS
            pages. DNS and redirects are re-checked, private/internal addresses
            are blocked, robots.txt is honoured, and missing facts are not
            invented.
          </li>
        </ul>
      </section>

      <section
        aria-labelledby="nonclaims-heading"
        className="border-y border-border bg-accent-subtle/60"
      >
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 id="nonclaims-heading" className="text-2xl font-semibold text-ink">
            What we do not claim
          </h2>
          <p className="mt-3 text-muted">
            This page is a trust posture, not a certificate wall. Marketing
            must not outrun evidence.
          </p>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-muted">
            <li>
              No ISO 27001, SOC 2, Cyber Essentials, or other certifications —
              we have not earned them, and we will not invent seals, badges, or
              auditor names.
            </li>
            <li>
              No bank-grade, military-grade, or enterprise-grade marketing
              fluff.
            </li>
            <li>
              No fake uptime percentages, customer logos, awards, or named case
              studies.
            </li>
            <li>
              Not commercially generally available. Nothing here is a
              production call-ready or public always-on service claim.
            </li>
            <li>
              No published internal hosts, IPs, or live product dashboards on
              this marketing site.
            </li>
          </ul>
          <p className="mt-6 text-sm text-muted">
            Related:{" "}
            <a
              href="/features/"
              className="text-accent underline hover:text-accent-hover"
            >
              Features
            </a>
            {" · "}
            <a
              href="/how-it-works/"
              className="text-accent underline hover:text-accent-hover"
            >
              How it works
            </a>
            {" · "}
            <a
              href="/ai-receptionist/"
              className="text-accent underline hover:text-accent-hover"
            >
              AI receptionist
            </a>
          </p>
        </div>
      </section>

      <section
        aria-labelledby="legal-heading"
        className="mx-auto max-w-3xl px-4 py-12"
      >
        <h2 id="legal-heading" className="text-xl font-semibold text-ink">
          Privacy and legal
        </h2>
        <p className="mt-3 text-muted">
          Marketing-site privacy, cookies, and terms are{" "}
          <strong>DRAFT FOR LEGAL REVIEW</strong> — scaffolds only, not final
          policy or legal advice. Product trust (this page) is separate from
          those drafts.
        </p>
        <p className="mt-4 text-sm text-muted">
          <a
            href="/privacy/"
            className="text-accent underline hover:text-accent-hover"
          >
            Privacy
          </a>
          {" · "}
          <a
            href="/cookies/"
            className="text-accent underline hover:text-accent-hover"
          >
            Cookies
          </a>
          {" · "}
          <a
            href="/terms/"
            className="text-accent underline hover:text-accent-hover"
          >
            Terms
          </a>
          <span className="ml-1 text-xs text-muted">(draft)</span>
        </p>

        <h2 className="mt-10 text-xl font-semibold text-ink">
          Talk through the controls
        </h2>
        <p className="mt-2 text-muted">
          Product interest starts at Request an early demo. An early-access
          briefing is secondary. We will not present a fake certificate pack.
        </p>
        <CtaPair
          className="mt-6"
          primaryHref="/demo/"
          primaryLabel="Request an early demo"
          secondaryHref="/how-we-keep-control/"
          secondaryLabel="See the safety rules"
        />
      </section>
    </>
  );
}
