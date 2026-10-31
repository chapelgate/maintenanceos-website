import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "Admin",
  description:
    "Internal admin overview — pre-launch site status, build evidence, and honesty gates. Not a public page.",
  path: "/admin/",
});

export default function AdminPage() {
  return (
    <>
      <JsonLd
        data={contentPageJsonLd("/admin/", "Admin", "Internal admin overview — pre-launch site status, build evidence, and honesty gates. Not a public page.", [
          { name: "Admin", path: "/admin/" },
        ])}
      />
      <PageHero
        eyebrow="Internal — Pre-launch"
        title="Admin overview"
        lede="This page is for internal review only. It reflects the current pre-launch state and honesty gates. No customer data or live metrics are shown."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 text-sm text-muted">
        <section aria-labelledby="admin-honesty" className="space-y-3">
          <h2 id="admin-honesty" className="text-lg font-semibold text-ink">
            Pre-launch honesty gates
          </h2>
          <ul className="mt-2 space-y-2 list-disc pl-5">
            <li><code>NEXT_PUBLIC_PUBLIC_LAUNCH=false</code> — site fails closed</li>
            <li>All calendar integrations: <strong>coming soon</strong> (not live)</li>
            <li>Chat widget: <strong>not connected</strong> (mailto only)</li>
            <li>Pricing: <strong>placeholder labels only</strong> (not publishable)</li>
            <li>Health monitor: <strong>retired host disabled</strong> (control plane only)</li>
            <li>Demo phone: <strong>not configured</strong> (empty string)</li>
          </ul>
        </section>

        <section aria-labelledby="admin-tests" className="space-y-3">
          <h2 id="admin-tests" className="text-lg font-semibold text-ink">
            Test suite
          </h2>
          <p className="mt-2">
            <code>npm test</code>: 630/630 pass (scripts + packages + lib)
          </p>
          <p>
            Typecheck: <code>tsc --noEmit</code> clean
          </p>
        </section>

        <section aria-labelledby="admin-evidence" className="space-y-3">
          <h2 id="admin-evidence" className="text-lg font-semibold text-ink">
            Build evidence (candidate SHA)
          </h2>
          <ul className="mt-2 space-y-2 list-disc pl-5">
            <li>Rollback evidence artifact (local)</li>
            <li>Secret-scan policy evidence (local)</li>
            <li>Toolchain evidence artifact (local)</li>
            <li>Consolidated candidate evidence (SHA-bound)</li>
            <li>Deployment verification artifacts</li>
          </ul>
        </section>

        <section aria-labelledby="admin-gates" className="space-y-3">
          <h2 id="admin-gates" className="text-lg font-semibold text-ink">
            Gates pending Andy / frozen
          </h2>
          <ul className="mt-2 space-y-2 list-disc pl-5">
            <li>mw-1023-01-licences: exact-candidate third-party licence evidence (blocked)</li>
            <li>mw-1024-01-estate-meta: Estate Gate metadata convergence (queued)</li>
            <li>Solicitor DPIA/DPA/privacy/terms (LAST GATE)</li>
            <li>ICO self-assessment + fee (LAST GATE)</li>
            <li>Companies House recheck (LAST GATE)</li>
            <li>Manual Safari/iOS, keyboard, AT checks (Andy physical)</li>
            <li>NEXT_PUBLIC_PUBLIC_LAUNCH=true approval (Andy)</li>
            <li>Production deploy/nginx: frozen</li>
          </ul>
        </section>
      </div>
    </>
  );
}
