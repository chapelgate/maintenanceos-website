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
            axe-core 4.10.3 ran in Playwright WebKit 26.6 against a local static
            export, at two viewports (iPhone 13: 390×844; Desktop Safari:
            1280×800). Coverage is the estate WebKit axe gate, not a full-site
            audit.
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Baseline CI run 39312522438 (19 October 2026): Home, Create, Demo, Features, Pricing, Security, Accessibility — reported no violations on those seven routes</li>
            <li>Later gate additions: Help (/help/), Subprocessors (/subprocessors/), Vulnerability disclosure (/vulnerability-disclosure/)</li>
            <li>Current WebKit matrix also gates: About, Accessibility, AI receptionist, Blog index, Buyers, Compare index, Contact, Cookies, FAQ, How it works, How we keep control, Industries index, Integrations index, Privacy, Property maintenance software, Status, Terms, Trust</li>
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
            <code>tests/webkit-a11y/a11y.test.mjs</code>. Nested or dynamic
            routes (individual blog posts, compare vendor pages, industry
            role pages, integration provider pages, dashboard preview) are
            not claimed as covered here. It does not test physical iPhone or Mac Safari,
            nor any screen reader or assistive technology — those
            remain owner-only checks. It tests only WCAG 2.0 A/AA tags in
            axe-core, not the full WCAG 2.2 AA criterion set.
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
              <code>tests/webkit-a11y/a11y.test.mjs</code>. Nested or
              dynamic routes (individual blog posts, compare vendor pages,
              industry role pages, integration provider pages, dashboard
              preview) are not claimed as covered here. Help, subprocessors,
              and vulnerability disclosure are gated.
            </li>
            <li>
              <strong>Owner-only device and AT checks:</strong> Physical
              Safari/iOS and assistive-technology passes are not claimed from
              this page. They remain Andy-only launch checks.
            </li>
            <li>
              <strong>WCAG 2.2 criteria not covered:</strong> axe-core tags
              used were <code>wcag2aa</code> and <code>wcag2a</code> (WCAG 2.0).
              WCAG 2.2 adds new success criteria (e.g., 2.4.11 Focus Not
              Obscured, 2.5.7 Dragging Movements, 3.2.6 Consistent Help,
              3.3.7 Redundant Entry) that are not validated here.
            </li>
            <li>
              <strong>No assistive-technology testing:</strong> No manual
              screen-reader (NVDA, VoiceOver, JAWS), voice-control, or
              switch-access testing has been performed.
            </li>
            <li>
              <strong>S26 remediation pending deployment:</strong> The
              following fixes are merged in PR #315 but not yet deployed to
              production because the <code>validate</code> CI job fails for a
              pre-existing reason unrelated to S26 (static pricing page test
              failure): skip link (already present), brand warning color
              <code>#92400E</code> verified at 4.5:1 on light paper
              <code>#F8FAFC</code>, <code>aria-live=&apos;polite&apos;</code> on voice
              transcript, form label audit on Create and Demo flows.
            </li>
          </ul>
        </section>

        <section aria-labelledby="a11y-plan">
          <h2 id="a11y-plan" className="text-xl font-semibold text-ink">
            Remediation plan
          </h2>
          <ol className="mt-2 list-decimal list-inside space-y-3">
            <li>
              <strong>Deploy S26 fixes:</strong> Resolve the pre-existing
              <code>validate</code> CI failure (static pricing page output) so
              PR #315 can merge and the contrast, <code>aria-live</code>, and
              form-label fixes go live.
            </li>
            <li>
              <strong>Review nested route coverage:</strong> Decide whether
              individual blog, compare, industry, and integration pages need
              their own WebKit axe entries beyond the current index matrix in
              <code>tests/webkit-a11y/a11y.test.mjs</code>.
            </li>
            <li>
              <strong>Upgrade axe-core tags:</strong> Add WCAG 2.2 specific
              tags (<code>wcag21aa</code>, <code>wcag22aa</code>) once
              axe-core supports them, or supplement with manual checks for
              the new criteria.
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
            . We aim to acknowledge within 2 business days and provide a
            remediation timeline.
          </p>
        </section>
      </div>
    </>
  );
}
