import { LegalDraftBanner } from "@/components/LegalDraftBanner";
import { LegalPageChrome } from "@/components/LegalPageChrome";
import { PageHero } from "@/components/PageHero";
import {
  CREATE_INGEST_PRIVACY_ANCHOR,
  CREATE_INGEST_PRIVACY_NOTE,
} from "@/lib/create-ingest-privacy";
import { JsonLd } from "@/components/JsonLd";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Privacy Policy (Draft)",
  description:
    "Draft privacy notice scaffold for the WorkSmartOS website. Pending legal review — not final policy.",
  path: "/privacy/",
});

const sections: { id: string; title: string; body: string }[] = [
  {
    id: "about",
    title: "About this privacy notice",
    body: "This draft covers the public WorkSmartOS website and related lead forms. MaintenanceOS is a product described on that site. It is not a finished product privacy policy unless counsel extends it.",
  },
  {
    id: "who-we-are",
    title: "Who we are (data controller)",
    body: "Chapelgate Limited (company number 12340004), registered office C/O Wainwrights Accountants, Faversham House, Wirral International Business Park, Old Hall Road, Bromborough, Wirral, CH62 3NX. Director: Andrew John Cartwright. ICO registration: pending counsel confirmation — number not published on this draft notice.",
  },
  {
    id: "scope",
    title: "Scope of this notice",
    body: "This notice applies to the pre-launch marketing website only; it does not describe future product or app-account processing unless counsel adds that scope.",
  },
  {
    id: "personal-data",
    title: "Personal data we may collect",
    body: "Categories only until verified: contact details from forms; a public website URL you submit on /create; hosting/network technical data; privacy-minimised site-use events (event type and pathname only, plus bounded conversion target/lead type where relevant); cookie or similar technology data if introduced (see Cookies); and communications you send us. Stored website.event records exclude visitor identifiers, email, referrer, query string, user-agent, and fingerprints.",
  },
  {
    id: "how-collected",
    title: "How we collect data",
    body: "Sources include a public website URL you submit on /create, ordinary hosting/network technical data, and any email you send us directly. Website content is used only to extract reviewable business facts; private/internal targets are blocked and missing facts are not invented. Online enquiry forms and the measurement beacon are temporarily unavailable: the previous Railway-hosted control plane returns Application not found, so this site does not post leads or events there and does not claim a submission was stored. Please email info@chapelgatetechnologies.com. No invented business data and no invented third-party lists.",
  },
  {
    id: CREATE_INGEST_PRIVACY_ANCHOR,
    title: "Website URL setup (/create)",
    body: CREATE_INGEST_PRIVACY_NOTE,
  },
  {
    id: "purposes",
    title: "Why we use personal data (purposes)",
    body: "Placeholder purposes: respond to enquiries and demo requests; operate and secure the site; measure aggregate site use with privacy-minimised first-party events; monitor form/site errors; and improve content. Lawful-basis wording remains for counsel to confirm.",
  },
  {
    id: "lawful-bases",
    title: "Lawful bases",
    body: "Legitimate interests for enquiry emails and for a website URL submitted on /create.",
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    body: "See the Cookie notice for categories and consent. No analytics or marketing cookies and no third-party analytics tags are loaded today. First-party operational measurement is cookieless and does not use browser storage or a persistent visitor identifier.",
  },
  {
    id: "sharing",
    title: "Who we share data with",
    body: "The website is hosted and processed by DigitalOcean. Transfers of personal data outside the UK/EEA are covered by the UK IDTA / UK Addendum. No third-party analytics vendor is used. For the draft planned subprocessor register (pending legal review — not a live Twilio/SendGrid/Google processing claim on this static pre-launch site), see the <a href=\"/subprocessors/\" className=\"text-accent underline\">Subprocessor page</a>.",
  },
  {
    id: "transfers",
    title: "International transfers",
    body: "Pending counsel review: transfer mechanisms if any processor is outside the UK/EEA are not yet final on this draft notice.",
  },
  {
    id: "retention",
    title: "How long we keep data",
    body: "Enquiry emails are retained for 12 months by default. Other retention periods are subject to legal review.",
  },
  {
    id: "protection",
    title: "How we protect data",
    body: "High-level organisational and technical measures apply; see Security for product trust narrative without over-claiming certifications.",
  },
  {
    id: "rights",
    title: "Your rights",
    body: "You have the right to access, rectify, erase, restrict, and port your personal data, to object to processing, to withdraw consent (where applicable), and to complain to the Information Commissioner's Office (ICO).",
  },
  {
    id: "exercise-rights",
    title: "How to exercise your rights",
    body: "Email info@chapelgatetechnologies.com with your request. We will respond within one month, as UK GDPR requires.",
  },
  {
    id: "children",
    title: "Children",
    body: "Pending counsel review: age threshold for children not yet final — this site is aimed at businesses and property professionals, not children.",
  },
  {
    id: "changes",
    title: "Changes to this notice",
    body: "Pending counsel review: how updates will be shown (date and material-change practice) is not yet final on this draft notice.",
  },
  {
    id: "contact",
    title: "Contact us",
    body: "Privacy contact is info@chapelgatetechnologies.com. Online enquiries are temporarily unavailable.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={contentPageJsonLd("/privacy/", "Privacy Policy (Draft)", "Draft privacy notice scaffold for the WorkSmartOS website. Pending legal review — not final policy.", [
          { name: "Privacy", path: "/privacy/" },
        ])}
      />
      <PageHero
        eyebrow="Legal · Draft"
        title="Privacy Policy (Draft)"
        lede="Scaffold privacy notice for the WorkSmartOS website. Headings and one-line placeholders only — pending legal review."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <LegalDraftBanner />
        <LegalPageChrome noticeLabel="privacy notice" />
        <div className="space-y-10">
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-24"
              aria-labelledby={`privacy-${s.id}`}
            >
              <h2
                id={`privacy-${s.id}`}
                className="text-xl font-semibold text-ink"
              >
                {s.title}
              </h2>
              <p className="mt-2 text-muted">{s.body}</p>
              {s.id === "website-url-ingest" ? (
                <p className="mt-2 text-muted">
                  Related:{" "}
                  <a href="/create/" className="text-accent underline">
                    Create from website
                  </a>
                  .
                </p>
              ) : null}
              {s.id === "cookies" ? (
                <p className="mt-2 text-muted">
                  Full detail:{" "}
                  <a href="/cookies/" className="text-accent underline">
                    Cookie Policy (Draft)
                  </a>
                  .
                </p>
              ) : null}
              {s.id === "protection" ? (
                <p className="mt-2 text-muted">
                  Related:{" "}
                  <a href="/security/" className="text-accent underline">
                    Security
                  </a>
                  .
                </p>
              ) : null}
              {s.id === "contact" ? (
                <p className="mt-2 text-muted">
                  <a href="/contact/" className="text-accent underline">
                    Contact form
                  </a>
                  .
                </p>
              ) : null}
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-muted" aria-hidden="false">
          To be completed by legal review.
        </p>
      </div>
    </>
  );
}
