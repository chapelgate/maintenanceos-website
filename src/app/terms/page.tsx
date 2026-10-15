import { LegalDraftBanner } from "@/components/LegalDraftBanner";
import { LegalPageChrome } from "@/components/LegalPageChrome";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Terms (Draft)",
  description:
    "Draft website terms of use scaffold for the WorkSmartOS website. Pending legal review — not binding policy.",
  path: "/terms/",
});

const sections: { id: string; title: string; body: string }[] = [
  {
    id: "about",
    title: "About these terms",
    body: "These draft terms cover access to and use of the public WorkSmartOS website. MaintenanceOS is a product on that site. They are a scaffold for counsel, not a finished agreement.",
  },
  {
    id: "who-we-are",
    title: "Who we are",
    body: "Chapelgate Limited (company number 12340004), registered office C/O Wainwrights Accountants, Faversham House, Wirral International Business Park, Old Hall Road, Bromborough, Wirral, CH62 3NX. Director: Andrew John Cartwright.",
  },
  {
    id: "acceptance",
    title: "Acceptance of terms",
    body: "Using the site will mean you agree to these terms once counsel-approved; until then, the draft banner governs expectations.",
  },
  {
    id: "pre-launch",
    title: "Pre-launch and no reliance",
    body: "This site is pre-launch and informational; content may change; it is not an offer of a live commercial service unless expressly stated.",
  },
  {
    id: "accounts",
    title: "Accounts and product access",
    body: "The marketing site is not product login; reserved paths such as /account or /portal are stubs until real — N/A for pre-launch access.",
  },
  {
    id: "lead-forms",
    title: "Lead forms and communications",
    body: "Submit accurate information on launch-list, demo, contact, and /create forms; we may contact you about that request subject to the privacy notice. When requested on /create, website learning reads a small, bounded set of public HTTPS pages to extract reviewable business facts. Missing facts are not invented and the browser voice preview does not activate live telephony. See the Privacy notice (Draft).",
  },
  {
    id: "acceptable-use",
    title: "Acceptable use (summary)",
    body: "Do not misuse the site: no scraping abuse, injecting malware, unauthorized access, form flooding, or unlawful content — full AUP appendix optional; no separate /acceptable-use route.",
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: "[COUNSEL] — ownership of site content, marks, and branding; limited licence to view only as counsel directs.",
  },
  {
    id: "third-party",
    title: "Third-party links",
    body: "Links to external sites are for convenience and do not imply endorsement.",
  },
  {
    id: "disclaimer",
    title: "Disclaimer of warranties",
    body: "No service warranty is provided for the pre-launch marketing site. The site is provided on an “as is” basis.",
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: "Liability is capped at £100 for the free preview. Other limitations are subject to legal review.",
  },
  {
    id: "indemnity",
    title: "Indemnity (if used)",
    body: "[COUNSEL: include or omit] — optional placeholder only.",
  },
  {
    id: "privacy",
    title: "Privacy",
    body: "Personal data and cookies are described in the Privacy and Cookie notices, not in these terms.",
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: "[COUNSEL] — how updates take effect once a final version exists.",
  },
  {
    id: "governing-law",
    title: "Governing law and disputes",
    body: "These terms are governed by the law of England and Wales.",
  },
  {
    id: "contact",
    title: "Contact",
    body: "Operator contact is info@chapelgatetechnologies.com. Online enquiries are temporarily unavailable.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal · Draft"
        title="Terms (Draft)"
        lede="Scaffold website terms of use for the WorkSmartOS website — not a customer SaaS MSA. Pending legal review."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <LegalDraftBanner />
        <LegalPageChrome noticeLabel="terms notice" />
        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.id} aria-labelledby={`terms-${s.id}`}>
              <h2
                id={`terms-${s.id}`}
                className="text-xl font-semibold text-ink"
              >
                {s.title}
              </h2>
              <p className="mt-2 text-muted">{s.body}</p>
              {s.id === "privacy" ? (
                <p className="mt-2 text-muted">
                  See{" "}
                  <a href="/privacy/" className="text-accent underline">
                    Privacy Policy (Draft)
                  </a>{" "}
                  and{" "}
                  <a href="/cookies/" className="text-accent underline">
                    Cookie Policy (Draft)
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
        <p className="mt-12 text-sm text-muted">
          To be completed by legal review. No binding terms until counsel
          completes this scaffold.
        </p>
      </div>
    </>
  );
}
