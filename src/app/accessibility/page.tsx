import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Accessibility",
  description:
    "Accessibility target, audit scope, known issues, remediation plan, feedback contact. Not a public-sector statement or certification.",
  path: "/accessibility/",
});

export default function AccessibilityPage() {
  return (
    <>
      <JsonLd
        data={contentPageJsonLd("/accessibility/", "Accessibility", "Accessibility target, audit scope, known issues, remediation plan, feedback contact. Not a public-sector statement or certification.", [
          { name: "Accessibility", path: "/accessibility/" },
        ])}
      />
      <PageHero
        eyebrow="Voluntary note"
        title="Accessibility target and audit summary"
        lede="This page records the accessibility target for this site, the scope and results of automated checks, known issues, the remediation plan, and how to report barriers. It is not a public-sector accessibility statement, not a certification, and not a sign-off by a person using assistive technology."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 text-muted">
        <section aria-labelledby="a11y-scope">
          <h2 id="a11y-scope" className="text-xl font-semibold text-ink">
            What this page is
          </h2>
          <p className="mt-2">
            Regulation 8 of the Public Sector Bodies (Websites and Mobile
            Applications) (No. 2) Accessibility Regulations 2018 (SI 2018/952)
            is about accessibility statements for public sector bodies. This
            page is not that statement. This site does not claim the operator
            is a public sector body, and it does not claim compliance with the
            Equality Act 2010.
          </p>
        </section>

        <section aria-labelledby="a11y-target">
          <h2 id="a11y-target" className="text-xl font-semibold text-ink">
            Conformance target
          </h2>
          <p className="mt-2">
            Target: WCAG 2.2 Level AA.
          </p>
          <p className="mt-2">
            Status: Conformance is <strong>not verified</strong>. This page
            describes the automated checks that have run, the gaps in testing,
            and the work remaining. We do not claim full WCAG 2.2 AA
            conformance, a Lighthouse accessibility score, a WAVE result, or an
            assistive-technology sign-off.
          </p>
        </section>

        <section aria-labelledby="a11y-run">
          <h2 id="a11y-run" className="text-xl font-semibold text-ink">
            Automated checks (WebKit axe)
          </h2>
          <p className="mt-2">
            axe-core 4.13.0 ran in Playwright WebKit 26.6 against a local static
            export, at two viewports (iPhone 13: 390×844; Desktop Safari:
            1280×800). Coverage is the estate WebKit axe gate, not a full-site
            audit.
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Baseline CI run 39312522438 (19 October 2026): Home, Create, Demo, Features, Pricing, Security, Accessibility — reported no violations on those seven routes</li>
            <li>Later gate additions: Help (/help/), Subprocessors (/subprocessors/), Vulnerability disclosure (/vulnerability-disclosure/)</li>
            <li>Current WebKit matrix also gates: About, Accessibility, AI receptionist, Blog index, Buyers, Compare index, Contact, Cookies, FAQ, How it works, How we keep control, Industries index, Integrations index, Privacy, Property maintenance software, Status, Terms, Trust</li>
            <li>Nested sample (mw-156 + mw-157): /industries/landlords/, /industries/housing-associations/, /blog/ai-voice-demo-browser-only-what-it-means/, /blog/why-safety-latches-matter-in-ai-receptionists/, /compare/worksmartos-vs-moneypenny/, /compare/worksmartos-vs-phena/, /integrations/google/, /integrations/outlook/, /help/getting-started/</li>
            <li>Dashboard preview (mw-158): /dashboard/ — SAMPLE / DEMO only; robots noindex; not a live customer portal</li>
            <li>Not-found export (mw-159): /404/ — pre-launch recovery page; robots noindex; no price or live phone</li>
            <li>Nested sample (mw-160): /industries/councils/, /industries/property-managers/, /blog/structured-repair-intake-vs-free-text-forms/, /compare/worksmartos-vs-answerconnect/, /integrations/calcom/, /help/data-security/ — all carry robots noindex; none claim checkout, live phone, published price, live SLA, or WCAG 2.2 AA certification.</li>
            <li>Help billing gate (mw-162): /help/billing-subscriptions/, /help/getting-help/, /help/faq/ — pre-launch honesty; no published price, live phone, or live SLA</li>
            <li>Nested sample (mw-163): /industries/holiday-lets/, /industries/letting-agents/, /blog/uk-property-maintenance-software-landscape-2026/, /compare/worksmartos-vs-fixflo/, /integrations/calendly/, /help/safety-latches/ — all carry robots noindex; none claim checkout, live phone, published price, live SLA, or WCAG 2.2 AA certification.</li>
            <li>Help ops gate (mw-164): /help/accessibility-features/, /help/troubleshooting-common-issues/, /help/gas-safety-compliance/ — pre-launch honesty; no published price, live phone, live SLA, or WCAG 2.2 AA certification.</li>
          </ul>
          <p className="mt-2">
            <strong>Result:</strong> Those gated routes reported no axe
            violations in their respective runs. Each checked route returned
            HTTP 200, had one heading at level 1, and did not overflow
            horizontally. WebKit recorded no uncaught page error.
          </p>
          <p className="mt-2">
            <strong>Scope limitations:</strong> This is an automated subset
            check on the routes listed in
            <code>tests/webkit-a11y/a11y.test.mjs</code>. A representative
            nested sample is gated across four waves (industry roles, blog
            posts, compare vendor pages, integration providers, and help
            articles). The dashboard preview route is also axe-gated as a
            SAMPLE / DEMO page, and the exported /404/ not-found page is
            axe-gated. Other nested or dynamic routes are not claimed as
            covered. It does not test physical iPhone or Mac Safari,
            nor any screen reader or assistive technology — those
            remain owner-only checks. It tests axe-core tags <code>wcag2a</code>, <code>wcag2aa</code>,
            <code>wcag21aa</code>, and <code>wcag22aa</code>. That is still an
            automated subset, not a full WCAG 2.2 AA conformance claim.
          </p>
        </section>

        <section aria-labelledby="a11y-known">
          <h2 id="a11y-known" className="text-xl font-semibold text-ink">
            Known issues and testing gaps
          </h2>
          <ul className="mt-2 list-disc list-inside space-y-2">
            <li>
              <strong>Nested and dynamic routes:</strong> The WebKit axe
              gate covers the static routes listed in
              <code>tests/webkit-a11y/a11y.test.mjs</code>, plus a
              representative nested sample: /industries/landlords/,
              /industries/housing-associations/, /industries/councils/,
              /industries/property-managers/, /industries/holiday-lets/,
              /industries/letting-agents/,
              /blog/ai-voice-demo-browser-only-what-it-means/,
              /blog/why-safety-latches-matter-in-ai-receptionists/,
              /blog/structured-repair-intake-vs-free-text-forms/,
              /blog/uk-property-maintenance-software-landscape-2026/,
              /compare/worksmartos-vs-moneypenny/,
              /compare/worksmartos-vs-phena/,
              /compare/worksmartos-vs-answerconnect/,
              /compare/worksmartos-vs-fixflo/,
              /integrations/google/, /integrations/outlook/,
              /integrations/calcom/, /integrations/calendly/,
              /help/getting-started/, /help/data-security/,
              /help/billing-subscriptions/, /help/getting-help/,
              /help/faq/, /help/safety-latches/,
              /help/accessibility-features/,
              /help/troubleshooting-common-issues/,
              /help/gas-safety-compliance/,
              /dashboard/ (SAMPLE / DEMO preview; noindex), and
              /404/ (exported not-found recovery page; noindex).
              Other nested blog, compare, industry, and integration pages,
              and remaining help articles beyond the gated sample, are not
              claimed as covered. Help index, subprocessors, and
              vulnerability disclosure remain gated.
            </li>
            <li>
              <strong>Owner-only device and AT checks:</strong> Physical
              Safari/iOS and assistive-technology passes are not claimed from
              this page. They remain Andy-only launch checks.
            </li>
            <li>
              <strong>WCAG 2.2 still not fully covered:</strong> The gate
              now includes axe tags <code>wcag21aa</code> and <code>wcag22aa</code>
              alongside <code>wcag2a</code>/<code>wcag2aa</code>. axe-core still
              cannot prove full WCAG 2.2 AA (for example criteria without automated
              rules, and any AT/device checks). Do not read a green gate as
              certification.
            </li>
            <li>
              <strong>No assistive-technology testing:</strong> No manual
              screen-reader (NVDA, VoiceOver, JAWS), voice-control, or
              switch-access testing has been performed.
            </li>
            <li>
              <strong>S26 source merge is not a production deploy claim:</strong>{" "}
              Accessibility remediation from PR #315 (skip link, brand warning
              contrast, <code>aria-live=&apos;polite&apos;</code> on voice
              transcript, Create/Demo form labels) is merged in source. This
              page does not claim a production redeploy, a live host SHA, or
              that those fixes are verified on a public production URL.
            </li>
          </ul>
        </section>

        <section aria-labelledby="a11y-plan">
          <h2 id="a11y-plan" className="text-xl font-semibold text-ink">
            Remediation plan
          </h2>
          <ol className="mt-2 list-decimal list-inside space-y-3">
            <li>
              <strong>Keep source honesty separate from deploy:</strong> S26
              (PR #315) is already merged in source. Any production redeploy,
              DNS, or live host verification stays outside this page and is not
              claimed here.
            </li>
            <li>
              <strong>Nested sample gated:</strong> A representative nested
              sample across four waves (six industries, four blogs, four
              compares, four integrations, and help article samples) plus the
              dashboard SAMPLE preview and the exported /404/ not-found page
              are now in the WebKit axe matrix. Expanding to every nested
              page remains optional and is not claimed here.
            </li>
            <li>
              <strong>Automated WCAG 2.2 tags enabled:</strong> The WebKit
              axe gate now requests <code>wcag21aa</code> and <code>wcag22aa</code>
              as well as <code>wcag2a</code>/<code>wcag2aa</code>. Manual AT and
              device checks remain required before any conformance claim.
            </li>
            <li>
              <strong>Manual assistive-technology audit:</strong> Conduct
              screen-reader testing (VoiceOver on iOS/macOS, NVDA on Windows)
              on core user flows: home → create → demo, and the enquiry form.
            </li>
            <li>
              <strong>Publish updated statement:</strong> After each
              milestone above, update this page with the new scope, results,
              and any remaining gaps.
            </li>
          </ol>
        </section>

        <section aria-labelledby="a11y-contact">
          <h2 id="a11y-contact" className="text-xl font-semibold text-ink">
            Feedback and barrier reports
          </h2>
          <p className="mt-2">
            If you encounter an accessibility barrier on this site, please
            contact us at
            <a href="mailto:info@chapelgatetechnologies.com" className="underline hover:no-underline">
              info@chapelgatetechnologies.com
            </a>
            . Barrier reports are reviewed by a person. This site does not
            publish a response-time SLA or remediation deadline.
          </p>
        </section>
      </div>
    </>
  );
}
