import { LegalDraftBanner } from "@/components/LegalDraftBanner";
import { LegalPageChrome } from "@/components/LegalPageChrome";
import { PageHero } from "@/components/PageHero";
import {
  CREATE_INGEST_PRIVACY_ANCHOR,
  CREATE_INGEST_PRIVACY_NOTE,
} from "@/lib/create-ingest-privacy";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Privacy Policy (Draft)",
  description:
    "Draft privacy notice scaffold for the MaintenanceOS marketing website. Pending legal review — not final policy.",
  path: "/privacy/",
});

const sections: { id: string; title: string; body: string }[] = [
  {
    id: "about",
    title: "About this privacy notice",
    body: "This draft covers the public MaintenanceOS marketing site and related lead forms; it is not a finished product privacy policy unless counsel extends it.",
  },
  {
    id: "who-we-are",
    title: "Who we are (data controller)",
    body: "[OWNER / COUNSEL: controller identity] — legal entity name, registered address, and ICO registration if applicable. Do not invent details.",
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
    body: "Sources include forms you submit (launch_list, early_demo, contact, create_receptionist), ordinary hosting/network technical data, and first-party cookieless operational measurement events — plus public pages from a submitted website URL when a scan service is configured. Marketing enquiries and bounded website events use Chapelgate\'s existing Railway-hosted control plane and Postgres store. Enquiries are stored as audited operational lead records; privacy-minimised website events are stored separately. Lead records notify an operator through Resend for human follow-up; aggregate weekly website reports reuse the same sending route. No invented crawl and no invented third-party lists.",
  },
  {
    id: CREATE_INGEST_PRIVACY_ANCHOR,
    title: "Website URL ingest (/create)",
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
    body: "[COUNSEL: map each purpose] — structure for consent, steps toward a contract, legitimate interests, and legal obligation as counsel directs.",
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    body: "See the Cookie notice for categories and consent. No analytics or marketing cookies and no third-party analytics tags are loaded today. First-party operational measurement is cookieless and does not use browser storage or a persistent visitor identifier.",
  },
  {
    id: "sharing",
    title: "Who we share data with",
    body: "Current website path uses DigitalOcean for the static site, an existing Railway-hosted Chapelgate control plane and Postgres store for lead intake plus privacy-minimised website events, and Resend for operator lead notifications and aggregate weekly reports. No third-party analytics vendor is used. Other processor categories remain subject to legal review.",
  },
  {
    id: "transfers",
    title: "International transfers",
    body: "[COUNSEL] — placeholder for transfer mechanisms if any processor is outside the UK/EEA.",
  },
  {
    id: "retention",
    title: "How long we keep data",
    body: "[OWNER / COUNSEL: periods] — retention placeholders by category; do not invent numbers.",
  },
  {
    id: "protection",
    title: "How we protect data",
    body: "High-level organisational and technical measures apply; see Security for product trust narrative without over-claiming certifications.",
  },
  {
    id: "rights",
    title: "Your rights",
    body: "[COUNSEL: confirm wording] — UK GDPR-style rights may include access, rectification, erasure, restriction, portability, objection, withdrawing consent, and complaint to the ICO (DRAFT).",
  },
  {
    id: "exercise-rights",
    title: "How to exercise your rights",
    body: "[OWNER: inbox / SLA] — contact method and expected process placeholders for rights requests.",
  },
  {
    id: "children",
    title: "Children",
    body: "[COUNSEL: age threshold] — this site is aimed at businesses and property professionals, not children.",
  },
  {
    id: "changes",
    title: "Changes to this notice",
    body: "[COUNSEL] — how updates will be shown (date and material-change practice).",
  },
  {
    id: "contact",
    title: "Contact us",
    body: "Privacy contact is [OWNER: email] until confirmed; meanwhile use the contact form for pre-launch enquiries.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal · Draft"
        title="Privacy Policy (Draft)"
        lede="Scaffold privacy notice for the MaintenanceOS marketing website. Headings and one-line placeholders only — pending legal review."
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
