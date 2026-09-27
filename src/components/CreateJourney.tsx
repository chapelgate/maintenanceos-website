"use client";

import { useCallback, useState } from "react";
import { CreateReceptionistForm } from "@/components/CreateReceptionistForm";
import { SandboxTestCallPanel } from "@/components/SandboxTestCallPanel";
import {
  EMPTY_RECEPTIONIST_DRAFT,
  type ReceptionistDraft,
} from "@/lib/onboarding-create";
import type { ReceptionistDraftResult } from "@/lib/receptionist-draft";
import type {
  AgentSandboxQualificationResult,
  AgentSandboxReviewSubject,
} from "@/lib/agent-sandbox-qualification";

/**
 * Lifts the /create draft and receptionist pack so the sandbox panel can
 * consume reviewed fields after the draft step without Next API routes.
 */
export function CreateJourney() {
  const [draft, setDraft] = useState<ReceptionistDraft>(EMPTY_RECEPTIONIST_DRAFT);
  const [receptionist, setReceptionist] = useState<ReceptionistDraftResult | null>(
    null,
  );
  const [reviewSubject, setReviewSubject] =
    useState<AgentSandboxReviewSubject | null>(null);
  const [sandboxQualification, setSandboxQualification] =
    useState<AgentSandboxQualificationResult | null>(null);

  const onReviewSubjectChange = useCallback(
    (next: AgentSandboxReviewSubject | null) => {
      setReviewSubject(next);
      setSandboxQualification(null);
    },
    [],
  );

  return (
    <>
      <CreateReceptionistForm
        onDraftChange={setDraft}
        onReceptionistChange={setReceptionist}
        onReviewSubjectChange={onReviewSubjectChange}
        sandboxQualification={sandboxQualification}
      />
      <div className="mt-6">
        <SandboxTestCallPanel
          draft={draft}
          receptionist={receptionist}
          reviewSubject={reviewSubject}
          onQualificationChange={setSandboxQualification}
        />
      </div>
    </>
  );
}
