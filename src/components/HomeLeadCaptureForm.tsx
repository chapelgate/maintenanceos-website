"use client";

import dynamic from "next/dynamic";
import type { LeadType } from "@/config/site";

const LeadCaptureForm = dynamic(
  () =>
    import("@/components/LeadCaptureForm").then(
      (module) => module.LeadCaptureForm,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted" aria-busy="true">
        Loading launch list form…
      </p>
    ),
  },
);

interface HomeLeadCaptureFormProps {
  leadType: LeadType;
  submitLabel: string;
  showOrganisation?: boolean;
}

export function HomeLeadCaptureForm({
  leadType,
  submitLabel,
  showOrganisation = false,
}: HomeLeadCaptureFormProps) {
  return (
    <LeadCaptureForm
      leadType={leadType}
      submitLabel={submitLabel}
      showOrganisation={showOrganisation}
    />
  );
}
