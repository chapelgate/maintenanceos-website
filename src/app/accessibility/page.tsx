import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Accessibility",
  description:
    "Voluntary note of an automated accessibility check on this pre-launch site. Not a public-sector accessibility statement and not a certification.",
  path: "/accessibility/",
});

export default function AccessibilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Voluntary note"
        title="Accessibility checks we have actually run"
        lede="This page records an automated check of this pre-launch website. It is not a public-sector accessibility statement, not a certification, and not a sign-off by a person using assistive technology."
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
        <section aria-labelledby="a11y-run">
          <h2 id="a11y-run" className="text-xl font-semibold text-ink">
            Automated check on 12 October 2026
          </h2>
          <p className="mt-2">
            axe-core 4.10.3 ran in Playwright WebKit 26.6 against a local
            static export of this site, at a 1440 by 900 viewport. The routes
            were the home page, create, demo, features, pricing, security, and
            this page. That is not a physical iPhone or Mac Safari check, and
            not a pass by a person using a screen reader or other assistive
            technology.
          </p>
          <p className="mt-2" id="a11y-result">
            axe-core 4.10.3 reported no violations on those seven routes in
            that run. Each route returned HTTP 200, had one heading at level
            1, and did not overflow horizontally. WebKit recorded no uncaught
            page error.
          </p>
        </section>
      </div>
    </>
  );
}
