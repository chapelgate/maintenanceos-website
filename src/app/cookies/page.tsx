import { CookieSettingsStub } from "@/components/CookieSettingsStub";
import { LegalDraftBanner } from "@/components/LegalDraftBanner";
import { LegalPageChrome } from "@/components/LegalPageChrome";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Cookie Policy (Draft)",
  description:
    "Draft cookie notice. No analytics or marketing cookies, and no site-wide consent banner. Pending legal review.",
  path: "/cookies/",
});

export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal · Draft"
        title="Cookie Policy (Draft)"
        lede="Draft cookie notice for the MaintenanceOS marketing website. No analytics or marketing cookies are configured; first-party operational measurement is cookieless and uses no persistent visitor identifier. Not a compliance certification."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <LegalDraftBanner />
        <LegalPageChrome noticeLabel="cookie notice" />
        <div className="space-y-10">
          <section aria-labelledby="cookies-about">
            <h2 id="cookies-about" className="text-xl font-semibold text-ink">
              About this cookie notice
            </h2>
              <p className="mt-2 text-muted">
                This draft explains cookies and similar technologies on the MaintenanceOS marketing site, operated by Chapelgate Limited (company number 12340004). It is pending legal and Privacy sign-off. Website-URL ingest on /create is described in the{" "}
                <a
                  href="/privacy/#website-url-ingest"
                  className="text-accent underline"
                >
                  Privacy Policy (Draft)
                </a>
                ; it is not a cookie category.
              </p>
          </section>

          <section aria-labelledby="cookies-what">
            <h2 id="cookies-what" className="text-xl font-semibold text-ink">
              What are cookies?
            </h2>
            <p className="mt-2 text-muted">
              Cookies, local storage, and similar technologies (including
              pixels, if ever used) are small pieces of data stored on your
              device to make sites work or to understand how they are used.
            </p>
          </section>

          <section aria-labelledby="cookies-how">
            <h2 id="cookies-how" className="text-xl font-semibold text-ink">
              How we use cookies
            </h2>
            <p className="mt-2 text-muted">
              We use a four-category scaffold below, and only enable categories
              that exist in the build. None of this is a finished counsel-approved
              policy.
            </p>
          </section>

          <section aria-labelledby="cookies-categories">
            <h2
              id="cookies-categories"
              className="text-xl font-semibold text-ink"
            >
              Cookie categories
            </h2>
            <p className="mt-2 text-muted">
              Essential · Preferences · Analytics · Marketing. UK-style
              default: non-essential off until affirmative consent. Lead-form
              submit is operational, not an analytics cookie category.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Cookie categories, whether required, and current status
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="py-2 pr-3 font-semibold text-ink">
                      Category
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold text-ink">
                      Required?
                    </th>
                    <th scope="col" className="py-2 font-semibold text-ink">
                      Current status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-border">
                    <th scope="row" className="py-2 pr-3 font-medium text-ink">
                      Essential
                    </th>
                    <td className="py-2 pr-3">Yes</td>
                    <td className="py-2">
                      None named in inventory yet. Hosting may set operational
                      cookies; consent-preference storage is not built.
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <th scope="row" className="py-2 pr-3 font-medium text-ink">
                      Preferences
                    </th>
                    <td className="py-2 pr-3">No</td>
                    <td className="py-2">None currently</td>
                  </tr>
                  <tr className="border-b border-border">
                    <th scope="row" className="py-2 pr-3 font-medium text-ink">
                      Analytics
                    </th>
                    <td className="py-2 pr-3">No</td>
                    <td className="py-2">
                      No analytics cookie or third-party analytics tag. First-party
                      cookieless operational measurement only; no browser storage
                      or persistent visitor identifier.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2 pr-3 font-medium text-ink">
                      Marketing
                    </th>
                    <td className="py-2 pr-3">No</td>
                    <td className="py-2">Unused at pre-launch; no cookies</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="cookies-essential">
            <h2
              id="cookies-essential"
              className="text-xl font-semibold text-ink"
            >
              Essential cookies
            </h2>
            <p className="mt-2 text-muted">
              Reserved for required site operation if and when named. Inventory
              is empty — do not invent cookie names. Consent-preference storage
              is not implemented. Do not put analytics or marketing here.
              [OWNER: list when known].
            </p>
          </section>

          <section aria-labelledby="cookies-preferences">
            <h2
              id="cookies-preferences"
              className="text-xl font-semibold text-ink"
            >
              Preferences cookies
            </h2>
            <p className="mt-2 text-muted">
              Remember UI or locale choices if introduced — non-essential;
              default off until consent — [OWNER: list or “none currently”].
              None currently.
            </p>
          </section>

          <section aria-labelledby="cookies-analytics">
            <h2
              id="cookies-analytics"
              className="text-xl font-semibold text-ink"
            >
              Analytics cookies
            </h2>
            <p className="mt-2 text-muted">
              No analytics cookies are configured. First-party cookieless
              operational measurement is built to record only bounded event
              type and pathname data. It uses no cookies, localStorage,
              sessionStorage, persistent visitor identifier, referrer, query
              string, or user-agent in the stored event record. While no
              measurement endpoint is configured, the beacon does not post.
              The previous Railway-hosted control plane returns Application not found, so events are not sent there. There is no third-party
              analytics SDK or tag. This draft remains pending legal review
              and is not a Google Analytics, PECR, or GDPR compliance certification.
            </p>
          </section>

          <section aria-labelledby="cookies-marketing">
            <h2
              id="cookies-marketing"
              className="text-xl font-semibold text-ink"
            >
              Marketing cookies
            </h2>
            <p className="mt-2 text-muted">
              Not used on this pre-launch site; state absence rather than
              inventing tags. Non-essential and default off if ever added.
            </p>
          </section>

          <section aria-labelledby="cookies-inventory">
            <h2
              id="cookies-inventory"
              className="text-xl font-semibold text-ink"
            >
              Cookie inventory table
            </h2>
            <p className="mt-2 text-muted">
              Fill only when a real tag exists; otherwise none configured. Never
              invent cookie names, vendors, or durations.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Cookie inventory: name, provider, purpose, category, duration
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="py-2 pr-3 font-semibold text-ink">
                      Name
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold text-ink">
                      Provider
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold text-ink">
                      Purpose
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold text-ink">
                      Category
                    </th>
                    <th scope="col" className="py-2 font-semibold text-ink">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr>
                    <td className="py-3 pr-3" colSpan={5}>
                      None configured — inventory empty until Essential
                      consent-preference storage or other tags are implemented
                      and named by OWNER.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section
            id="settings"
            className="scroll-mt-24"
            aria-labelledby="cookies-managing"
          >
            <h2
              id="cookies-managing"
              className="text-xl font-semibold text-ink"
            >
              Managing your preferences
            </h2>
            <p className="mt-2 text-muted">
              There is no site-wide consent banner today because no
              non-essential cookies, browser-storage analytics, or marketing tags
              are loaded. The first-party operational measurement described above
              is cookieless and stores no persistent visitor identifier. A
              preference centre would be wired only if optional storage or tags
              are introduced; this page is still a draft, not a live consent
              manager.
            </p>
            <CookieSettingsStub />
          </section>

          <section aria-labelledby="cookies-browser">
            <h2 id="cookies-browser" className="text-xl font-semibold text-ink">
              Browser controls
            </h2>
            <p className="mt-2 text-muted">
              Most browsers let you block or delete cookies; blocking Essential
              cookies may break parts of the site.
            </p>
          </section>

          <section aria-labelledby="cookies-changes">
            <h2 id="cookies-changes" className="text-xl font-semibold text-ink">
              Changes to this notice
            </h2>
            <p className="mt-2 text-muted">
              [COUNSEL] — version and date practice for material updates.
            </p>
          </section>

          <section aria-labelledby="cookies-more">
            <h2 id="cookies-more" className="text-xl font-semibold text-ink">
              More information
            </h2>
            <p className="mt-2 text-muted">
              See the{" "}
              <a href="/privacy/" className="text-accent underline">
                Privacy Policy (Draft)
              </a>{" "}
              and{" "}
              <a href="/contact/" className="text-accent underline">
                contact
              </a>{" "}
              for further questions.
            </p>
          </section>
        </div>
        <p className="mt-12 text-sm text-muted">
          To be completed by legal review.
        </p>
      </div>
    </>
  );
}
