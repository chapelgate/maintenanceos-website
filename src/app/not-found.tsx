import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "WorkSmartOS is a pre-launch synthetic demo. This address is not a published page.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch"
        title="This page is not on the site"
        lede="WorkSmartOS is a pre-launch synthetic demo. This address is not a published page."
      />
      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-16 text-muted">
        <p>
          Nothing was sold, booked, or connected from this address. This page
          does not publish a price, assign a live phone number, connect a
          calendar, or deliver chat.
        </p>
        <p>
          Related pre-launch pages:{" "}
          <a
            href="/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Back to the homepage
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
            href="/help/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Help
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
            href="/security/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Security
          </a>
          {" · "}
          <a
            href="/contact/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Contact
          </a>
          . Missing-page screen only — not a live support desk.
        </p>
      </div>
    </>
  );
}
