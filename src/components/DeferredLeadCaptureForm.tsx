"use client";

import dynamic from "next/dynamic";
import type { LeadCaptureFormProps } from "@/components/LeadCaptureForm";

const DeferredLeadCaptureFormComponent = dynamic(
  () =>
    import("@/components/LeadCaptureForm").then(
      (module) => module.LeadCaptureForm,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted" aria-busy="true">
        Loading enquiry form…
      </p>
    ),
  },
);

export function DeferredLeadCaptureForm(props: LeadCaptureFormProps) {
  return <DeferredLeadCaptureFormComponent {...props} />;
}
