import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Subprocessors",
  description:
    "Draft planned subprocessor register. Pending legal review — not a live Twilio, SendGrid, or Google processing claim on this pre-launch site.",
  path: "/subprocessors/",
});

export default function SubprocessorsPage() {
  return (
    <>
      <JsonLd
        data={contentPageJsonLd(
          "/subprocessors/",
          "Subprocessors (Draft)",
          "Draft planned subprocessor register. Pending legal review — not a live Twilio, SendGrid, or Google processing claim on this pre-launch site.",
          [{ name: "Subprocessors", path: "/subprocessors/" }],
        )}
      />
      <PageHero
        eyebrow="Transparency · Pre-launch draft"
        title="Subprocessors"
        lede="Draft planned register only. Pending legal review. This static pre-launch marketing site does not send enquiry data through Twilio, SendGrid, or Google APIs, and it does not operate a live phone line."
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Subprocessor Table
        </h2>
        <p className="mt-2 text-sm text-muted">
          Status is explicit. Website host rows describe the marketing site host.
          Planned product rows are future product scope only — not proof that this
          website currently processes personal data through those vendors.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full rounded border-border border caption-bottom">
            <thead>
              <tr>
                <th className="text-left text-sm font-semibold text-muted pb-2">
                  Subprocessor
                </th>
                <th className="text-left text-sm font-semibold text-muted pb-2">
                  Status
                </th>
                <th className="text-left text-sm font-semibold text-muted pb-2">
                  Location
                </th>
                <th className="text-left text-sm font-semibold text-muted pb-2">
                  Transfer Mechanism
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium text-ink">DigitalOcean</td>
                <td className="text-muted">Website host</td>
                <td className="text-muted">United States</td>
                <td className="text-muted">Infrastructure-as-a-Service</td>
              </tr>
              <tr>
                <td className="font-medium text-ink">Cloudflare</td>
                <td className="text-muted">Planned product</td>
                <td className="text-muted">Global (CDN & DNS)</td>
                <td className="text-muted">Infrastructure-as-a-Service</td>
              </tr>
              <tr>
                <td className="font-medium text-ink">Twilio</td>
                <td className="text-muted">Planned product</td>
                <td className="text-muted">Global (CPAU: AU, US, DE, GB)</td>
                <td className="text-muted">Infrastructure-as-a-Service</td>
              </tr>
              <tr>
                <td className="font-medium text-ink">Google</td>
                <td className="text-muted">Planned product</td>
                <td className="text-muted">United States</td>
                <td className="text-muted">Infrastructure-as-a-Service</td>
              </tr>
              <tr>
                <td className="font-medium text-ink">SendGrid</td>
                <td className="text-muted">Planned product</td>
                <td className="text-muted">United States</td>
                <td className="text-muted">Infrastructure-as-a-Service</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm text-muted">
          This page is a draft for counsel. It is not a live Twilio telephony claim, not a live SendGrid mail claim, and not a public-launch processor schedule.
        </p>
        <p className="mt-8 text-sm text-muted">
          Related pre-launch pages:{" "}
          <a href="/help/" className="font-medium text-accent underline-offset-4 hover:underline">Help</a>
          {" · "}
          <a href="/privacy/" className="font-medium text-accent underline-offset-4 hover:underline">Privacy</a>
          {" · "}
          <a href="/security/" className="font-medium text-accent underline-offset-4 hover:underline">Security</a>
          {" · "}
          <a href="/contact/" className="font-medium text-accent underline-offset-4 hover:underline">Contact</a>
          . Draft processor list only — not a live counsel desk, and not a live processor schedule.
        </p>
      </section>
    </>
  );
}
