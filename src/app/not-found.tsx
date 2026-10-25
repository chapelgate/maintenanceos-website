import { PageHero } from "@/components/PageHero";

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
