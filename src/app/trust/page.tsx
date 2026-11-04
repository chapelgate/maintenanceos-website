import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Trust & Verification",
  description:
    "Companies House, DPIA status, recording disclosure, certifications, pre-launch status, and voice demo details for WorkSmartOS.",
  path: "/trust/",
});

export default function TrustPage() {
  return (
    <>
      <JsonLd
        data={contentPageJsonLd("/trust/", "Trust & Verification", "Consolidated trust information for WorkSmartOS: Companies House link, DPIA status, recording disclosure, certification status, pre-launch status, and voice demo details.", [
          { name: "Trust & Verification", path: "/trust/" },
        ])}
      />
      <PageHero
        eyebrow="Trust · Pre-launch"
        title="Trust & Verification"
        lede="One place for the facts about our legal entity, data practices, certifications, and what the voice demo actually does. No invented claims."
      />

      <section className="mx-auto max-w-3xl space-y-12 px-4 py-12">
        <section aria-labelledby="companies-house">
          <h2 id="companies-house" className="text-xl font-semibold text-ink">
            Legal Entity
          </h2>
          <p className="mt-2 text-sm text-muted">
            WorkSmartOS and MaintenanceOS are products of Chapelgate Limited,
            registered in England and Wales.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <strong>Company name:</strong> Chapelgate Limited
            </li>
            <li>
              <strong>Company number:</strong> 12340004
            </li>
            <li>
              <strong>Registered office:</strong> C/O Wainwrights Accountants,
              Faversham House, Wirral International Business Park, Old Hall Road,
              Bromborough, Wirral, CH62 3NX
            </li>
            <li>
              <strong>Director:</strong> Andrew John Cartwright
            </li>
            <li>
              <strong>Companies House register:</strong>{" "}
              <a
                href="https://find-and-update.company-information.service.gov.uk/company/12340004"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline"
              >
                View on Companies House
              </a>
            </li>
          </ul>
        </section>

        <section aria-labelledby="dpia" className="border-t border-border pt-8">
          <h2 id="dpia" className="text-xl font-semibold text-ink">
            Data Protection Impact Assessment (DPIA)
          </h2>
          <p className="mt-2 text-sm text-muted">
            A DPIA is required under UK GDPR Article 35 for processing that is
            likely to result in a high risk to the rights and freedoms of natural
            persons. The MaintenanceOS product involves AI-assisted intake of
            maintenance reports, which may involve automated decision-making and
            voice recording.
          </p>
          <p className="mt-2 text-sm text-muted">
            <strong>Status:</strong> DPIA is in progress and will be completed
            before general availability. The DPIA will cover:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted list-disc list-inside">
            <li>AI-assisted intake and automated decision-making</li>
            <li>Voice recording and transcription processing</li>
            <li>Subprocessor data flows (DigitalOcean, Cloudflare, Twilio, Google, SendGrid)</li>
            <li>International transfers and UK IDTA / UK Addendum coverage</li>
          </ul>
          <p className="mt-2 text-sm text-muted">
            The completed DPIA will be published here with a summary of findings
            and mitigations. Until then, no DPIA sign-off is claimed.
          </p>
        </section>

        <section aria-labelledby="recording" className="border-t border-border pt-8">
          <h2 id="recording" className="text-xl font-semibold text-ink">
            Call Recording & Voice AI Disclosure
          </h2>
          <p className="mt-2 text-sm text-muted">
            The MaintenanceOS voice demo and any future voice features involve
            recording and processing of audio.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted list-disc list-inside">
            <li>
              <strong>What is recorded:</strong> Audio from the caller during a
              demo call or sandbox test call.
            </li>
            <li>
              <strong>How it is processed:</strong> In the browser demo, audio is
              processed by the browser's Web Speech API (no server voice
              pipeline). The preview demo number (when enabled) would route
              via Twilio to a server voice function. No human listens to demo
              recordings unless explicitly escalated.
            </li>
            <li>
              <strong>Retention:</strong> Demo recordings are not stored
              persistently. Transcription text may be logged for debugging and
              product improvement. Retention periods will be defined in the
              final DPIA and privacy policy.
            </li>
            <li>
              <strong>Legal basis:</strong> Legitimate interest for demo
              evaluation; explicit consent will be obtained for any production
              voice features.
            </li>
            <li>
              <strong>Caller notice:</strong> The demo greeting states that the
              call is recorded and processed by AI. Callers who do not consent
              should hang up.
            </li>
          </ul>
          <p className="mt-2 text-sm text-muted">
            This disclosure is honest about current capabilities. No claims are
            made about real-time human monitoring, medical-grade accuracy, or
            compliance frameworks beyond what is documented here.
          </p>
        </section>

        <section aria-labelledby="certifications" className="border-t border-border pt-8">
          <h2 id="certifications" className="text-xl font-semibold text-ink">
            Certification Status
          </h2>
          <p className="mt-2 text-sm text-muted">
            We do not hold and do not claim any of the following certifications:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted list-disc list-inside">
            <li>ISO 27001 (Information Security Management)</li>
            <li>SOC 2 Type I or Type II</li>
            <li>Cyber Essentials (PLANNED — not held)</li>
            <li>ISO 9001 (Quality Management)</li>
            <li>PCI DSS</li>
            <li>HIPAA</li>
            <li>Any &ldquo;bank-grade&rdquo;, &ldquo;military-grade&rdquo;, or equivalent marketing claims</li>
          </ul>
          <p className="mt-2 text-sm text-muted">
            Security controls are implemented in product source code and
            infrastructure configuration. See the{" "}
            <a href="/security/" className="text-accent underline">
              Security
            </a>
            {" "}
            page for the architectural controls that exist today.
          </p>
        </section>

        <section aria-labelledby="prelaunch" className="border-t border-border pt-8">
          <h2 id="prelaunch" className="text-xl font-semibold text-ink">
            Pre-Launch Status
          </h2>
          <p className="mt-2 text-sm text-muted">
            MaintenanceOS is <strong>pre-launch</strong> and <strong>not
            commercially generally available</strong>.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted list-disc list-inside">
            <li>
              The website, scanner, and voice demo are functional previews.
            </li>
            <li>
              No paid plans are available for purchase.
            </li>
            <li>
              Enquiry and demo forms collect interest only; no contract is
              formed.
            </li>
            <li>
              Legal pages (Privacy, Cookies, Terms) are <strong>DRAFT FOR LEGAL
              REVIEW</strong> and not final policy.
            </li>
            <li>
              The scanner reads public websites only; private/internal targets
              are blocked.
            </li>
                <li>
                  Voice demo runs in the browser via WebRTC (no app install) or
                  via a preview demo phone number (when the preview gate is
                  enabled) — it is not a live always-on phone or production
                  service.
                </li>
          </ul>
          <p className="mt-2 text-sm text-muted">
            General availability will be announced publicly. Interested parties
            can{" "}
            <a href="/demo/" className="text-accent underline">
              request an early demo
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="voice-demo" className="border-t border-border pt-8">
          <h2 id="voice-demo" className="text-xl font-semibold text-ink">
            Voice Demo — Browser Sandbox & Preview Number
          </h2>
          <p className="mt-2 text-sm text-muted">
            The voice AI receptionist can be tried in two ways:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted list-disc list-inside">
            <li>
              <strong>Browser sandbox (/create):</strong> WebRTC-based test call
              runs entirely in the browser. No phone number required. Audio is
              processed by the browser's Web Speech API.
            </li>
            <li>
              <strong>Preview demo number (when enabled):</strong> A UK geographic
              number routed via Twilio to a server voice function. Only available
              when the preview gate is enabled — not a public 24/7 answering
              service. Not a live always-on phone. Not a production answering
              service.
            </li>
          </ul>
          <p className="mt-2 text-sm text-muted">
            The browser demo uses the browser's Web Speech API. The preview
            number (when enabled) would use: Twilio → server voice function →
            Gemini (LLM) → Piper (TTS). No client data leaves the call session.
            The sandbox does not persist audio. The preview number does not store
            recordings beyond the session.
          </p>
          <p className="mt-2 text-sm text-muted">
            Voice gate: The AI only reads back facts it extracted with high
            confidence. Low-confidence fields are reported as &ldquo;Unknown &mdash;
            not found&rdquo; rather than guessed.
          </p>
        </section>

        <section aria-labelledby="related" className="border-t border-border pt-8">
          <h2 id="related" className="text-xl font-semibold text-ink">
            Related Pages
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <a href="/security/" className="text-accent underline">
                Security and Data Separation
              </a>
            </li>
            <li>
              <a href="/subprocessors/" className="text-accent underline">
                Subprocessor List
              </a>
            </li>
            <li>
              <a href="/vulnerability-disclosure/" className="text-accent underline">
                Vulnerability Disclosure
              </a>
            </li>
            <li>
              <a href="/privacy/" className="text-accent underline">
                Privacy Policy (Draft)
              </a>
            </li>
            <li>
              <a href="/cookies/" className="text-accent underline">
                Cookie Policy (Draft)
              </a>
            </li>
            <li>
              <a href="/terms/" className="text-accent underline">
                Terms of Service (Draft)
              </a>
            </li>
            <li>
              <a href="/accessibility/" className="text-accent underline">
                Accessibility
              </a>
            </li>
            <li>
              <a href="/status/" className="text-accent underline">
                System Status
              </a>
            </li>
          </ul>
        </section>
      </section>

      <p className="mx-auto max-w-3xl px-4 py-12 text-sm text-muted">
        Related pre-launch pages:{" "}
        <a href="/help/" className="font-medium text-accent underline-offset-4 hover:underline">Help</a>
        {" · "}
        <a href="/security/" className="font-medium text-accent underline-offset-4 hover:underline">Security</a>
        {" · "}
        <a href="/contact/" className="font-medium text-accent underline-offset-4 hover:underline">Contact</a>
        {" · "}
        <a href="/demo/" className="font-medium text-accent underline-offset-4 hover:underline">Early demo</a>
        . Documentation surfaces only — not a live trust support desk.
      </p>
    </>
  );
}