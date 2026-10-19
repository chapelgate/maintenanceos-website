import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Subprocessors",
  description:
    "List of third-party subprocessors who process data on behalf of MaintenanceOS. Transparent list with locations and transfer mechanisms.",
  path: "/subprocessors/",
});

export default function SubprocessorsPage() {
  return (
    <>
      <JsonLd
        data={contentPageJsonLd("/subprocessors/", "Subprocessors", "List of third-party subprocessors who process data on behalf of MaintenanceOS. Transparent list with locations and transfer mechanisms.", [
          { name: "Subprocessors", path: "/subprocessors/" },
        ])}
      />
      <PageHero
        eyebrow="Transparency · Pre-launch"
        title="Subprocessors"
        lede="Third-party processors who handle data on our behalf. See locations and transfer mechanisms below."
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Subprocessor Table
        </h2>
        <p className="mt-2 text-sm text-muted">
          The following subprocessors process personal data in connection with the
          WorkSmartOS website and MaintenanceOS product.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full rounded border-border border caption-bottom">
            <thead>
              <tr>
<th className="text-left text-sm font-semibold text-muted pb-2">Subprocessor</th>
                <th className="text-left text-sm font-semibold text-muted pb-2">Location</th>
                <th className="text-left text-sm font-semibold text-muted pb-2">Transfer Mechanism</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium text-ink">DigitalOcean</td>
                <td className="text-muted">United States</td>
                <td className="text-muted">Infrastructure-as-a-Service</td>
              </tr>
              <tr>
                <td className="font-medium text-ink">Cloudflare</td>
                <td className="text-muted">Global (CDN & DNS)</td>
                <td className="text-muted">Infrastructure-as-a-Service</td>
              </tr>
              <tr>
                <td className="font-medium text-ink">Twilio</td>
                <td className="text-muted">Global (CPAU: AU, US, DE, GB)</td>
                <td className="text-muted">Infrastructure-as-a-Service</td>
              </tr>
              <tr>
                <td className="font-medium text-ink">Google</td>
                <td className="text-muted">United States</td>
                <td className="text-muted">Infrastructure-as-a-Service</td>
              </tr>
              <tr>
                <td className="font-medium text-ink">SendGrid</td>
                <td className="text-muted">United States</td>
                <td className="text-muted">Infrastructure-as-a-Service</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}