import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

const description =
  "Pre-launch onboarding: synthetic demo of MaintenanceOS website walkthrough. No live data, no published price, no public launch.";

export const metadata: Metadata = {
  ...contentPageMetadata({
    title: "Onboarding",
    description,
    path: "/onboarding/",
  }),
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch"
        title="Onboarding walkthrough"
        lede="This is a synthetic demo of the MaintenanceOS onboarding flow. It is not an offer for service and it does not start a contract."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 text-muted">
        <section aria-labelledby="onboarding-what">
          <h2 id="onboarding-what" className="text-lg font-semibold text-ink">
            What this is
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>A synthetic demo of the MaintenanceOS onboarding steps.</li>
            <li>No live telephone connection or calendar booking.</li>
            <li>No price is published or available for checkout.</li>
            <li>No chat service is available.</li>
            <li>No live data is claimed.</li>
          </ul>
        </section>
        <section aria-labelledby="onboarding-what-not">
          <h2 id="onboarding-what-not" className="text-lg font-semibold text-ink">
            What this is not
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Not a checkout, and not a published price.</li>
            <li>Not a live phone line, and not a calendar connection.</li>
            <li>Not a chat service, and not public launch.</li>
            <li>Not a claim that WCAG 2.2 AA has been verified.</li>
          </ul>
        </section>
        <section aria-labelledby="onboarding-publisher">
          <h2 id="onboarding-publisher" className="text-lg font-semibold text-ink">
            Publisher
          </h2>
          <p>
            Publisher: Chapelgate Limited, company number 12340004. Passing this
            note does not make the site releasable.
          </p>
        </section>
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
        </p>
      </div>
    </>
  );
}
