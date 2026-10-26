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
            Automated check — 19 October 2026 (CI run 39312522438)
          </h2>
          <p className="mt-2">
            axe-core 4.10.3 ran in Playwright WebKit 26.6 against a local
            static export of this site, at two viewports (iPhone 13: 390×844;
            Desktop Safari: 1280×800). The routes tested were:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Home (/) — 2 viewports</li>
            <li>Create (/create/) — 2 viewports</li>
            <li>Demo (/demo/) — 2 viewports</li>
            <li>Features (/features/) — 2 viewports</li>
            <li>Pricing (/pricing/) — 2 viewports</li>
            <li>Security (/security/) — 2 viewports</li>
          </ul>
          <p className="mt-2">
            <strong>Result:</strong> axe-core 4.10.3 reported no violations on those seven routes in that run. Each route returned HTTP 200, had one heading at level 1, and did not overflow horizontally. WebKit recorded no uncaught page error.
          </p>
          <p className="mt-2">
            <strong>Scope limitations:</strong> This is an automated subset
            check. It does not cover the full site (e.g., /faq/, /blog/,
            /trust/, /compare/, /subprocessors/, /vulnerability-disclosure/,
            /accessibility/, /cookies/, /terms/, /privacy/). It does not test
            physical iPhone or Mac Safari, nor any screen reader or assistive
            technology. It tests only WCAG 2.0 A/AA tags in axe-core, not the
            full WCAG 2.2 AA criterion set.
          </p>
        </section>

        <section aria-labelledby="a11y-known">
          <h2 id="a11y-known" className="text-xl font-semibold text-ink">
            Known issues and testing gaps
          </h2>
          <ul className="mt-2 list-disc list-inside space-y-2">
            <li>
              <strong>Incomplete route coverage:</strong> The automated suite
              does not run against /faq/, /blog/, /trust/, /compare/,
              /subprocessors/, /vulnerability-disclosure/, /accessibility/,
              /cookies/, /terms/, /privacy/.
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
              <strong>Expand automated route coverage:</strong> Add the
              remaining public routes to the WebKit accessibility test matrix
              (tests/webkit-a11y/a11y.test.mjs).
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
             . Barrier reports are reviewed by a person. This site does not
             publish a response-time SLA or remediation deadline.
          </p>
        </section>
      </div>
    </>
  );
}
