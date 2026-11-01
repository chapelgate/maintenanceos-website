import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

const description =
  "Pre-launch buyer note for the synthetic demo. No price, no live phone, and no public launch.";

export const metadata: Metadata = {
  ...contentPageMetadata({
    title: "Buyer note",
    description,
    path: "/buyers/",
  }),
  robots: { index: false, follow: false },
};

export default function BuyerNotePage() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch"
        title="Buyer note"
        lede="This is a synthetic demo of MaintenanceOS. It is not an offer for sale and it does not start a contract."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 text-muted">
<section aria-labelledby="buyer-look">
        <h2 id="buyer-look" className="text-lg font-semibold text-ink">
          What you can inspect
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>The homepage, which stays a pre-launch preview.</li>
          <li>The scripted browser preview on the demo page.</li>
          <li>The pricing page, which does not publish a list price.</li>
          <li>The status page, which does not show an uptime figure.</li>
          <li>
            The{" "}
            <a href="/trust/" className="font-medium text-accent underline-offset-4 hover:underline">
              trust page
            </a>
            , which records legal-entity and DPIA honesty without certifying release.
          </li>
          <li>
            The{" "}
            <a href="/onboarding/" className="font-medium text-accent underline-offset-4 hover:underline">
              onboarding walkthrough
            </a>
            , which is a read-only demo path (scanner remains frozen).
          </li>
          <li>
            The{" "}
            <a href="/help/" className="font-medium text-accent underline-offset-4 hover:underline">
              help centre
            </a>
            {" "}and{" "}
            <a href="/security/" className="font-medium text-accent underline-offset-4 hover:underline">
              security page
            </a>
            , which stay pre-launch documentation — not a live support desk.
          </li>
        </ul>
      </section>
      <section aria-labelledby="buyer-andy">
        <h2 id="buyer-andy" className="text-lg font-semibold text-ink">
          Andy synthetic demo cross-references
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            See the Andy synthetic demo walkthrough (/accessibility/, /.well-known/security.txt, /vulnerability-disclosure/) for the full read-only checklist. It does not sell, turn on public launch, or connect a calendar.
          </li>
          <li>
            The performance budgets on /accessibility/ are lab-only numbers (raw JS ≤ 600 KB, gzip JS ≤ 190 KB, CSS ≤ 120 KB); they are not field Core Web Vitals or CrUX claims.
          </li>
        </ul>
      </section>
      <section aria-labelledby="buyer-not">
        <h2 id="buyer-not" className="text-lg font-semibold text-ink">
          What this is not
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Not a checkout, and not a published price.</li>
          <li>Not a live phone line, and not a calendar connection.</li>
          <li>Not a chat service, and not public launch.</li>
          <li>Not a claim that WCAG 2.2 AA has been verified.</li>
        </ul>
      </section>
        <p>
          Publisher: Chapelgate Limited, company number 12340004. Passing this
          note does not make the site releasable.
        </p>
        <p>
          <a
            href="/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Homepage
          </a>
          {" · "}
          <a
            href="/demo/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Scripted preview
          </a>
          {" · "}
          <a
            href="/pricing/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Pricing
          </a>
          {" · "}
          <a
            href="/contact/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Contact
          </a>
          {" · "}
          <a
            href="/trust/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Trust
          </a>
          {" · "}
          <a
            href="/onboarding/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Onboarding
          </a>
          {" · "}
          <a
            href="/help/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Help
          </a>
        </p>
      </div>
    </>
  );
}
