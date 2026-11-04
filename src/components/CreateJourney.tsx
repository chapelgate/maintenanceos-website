"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import {
  EMPTY_RECEPTIONIST_DRAFT,
  type ReceptionistDraft,
} from "@/lib/onboarding-create";
import type { ReceptionistDraftResult } from "@/lib/receptionist-draft";
import type {
  AgentSandboxQualificationResult,
  AgentSandboxReviewSubject,
} from "@/lib/agent-sandbox-qualification";

const CreateReceptionistForm = dynamic(
  () =>
    import("@/components/CreateReceptionistForm").then(
      (module) => module.CreateReceptionistForm,
    ),
  {
    ssr: false,
    loading: () => (
      <section
        className="rounded-md border border-border bg-surface p-5"
        aria-labelledby="create-form-loading-heading"
        aria-busy="true"
      >
        <h2
          id="create-form-loading-heading"
          className="text-base font-semibold text-ink"
        >
          Start with your website URL
        </h2>
        <p className="mt-2 text-sm text-muted">
          Loading the website setup form…
        </p>
      </section>
    ),
  },
);

const InteractiveReceptionistDemo = dynamic(
  () =>
    import("@/components/SandboxTestCallPanel").then(
      (module) => module.SandboxTestCallPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <section
        className="rounded-md border border-border bg-surface p-5"
        aria-labelledby="interactive-demo-loading-heading"
        aria-busy="true"
      >
        <h2
          id="interactive-demo-loading-heading"
          className="text-base font-semibold text-ink"
        >
          Try your receptionist
        </h2>
        <p className="mt-2 text-sm text-muted">
          Preparing the interactive browser demo…
        </p>
      </section>
    ),
  },
);

/**
 * Owns the reviewed /create state shared with the public interactive demo.
 * The form and demo are code-split so the default DigitalOcean journey does
 * not move the conversation engine into the initial /create JavaScript budget.
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
        <InteractiveReceptionistDemo
          key={reviewSubject?.reviewRecord.revisionId ?? "preview-unreviewed"}
          draft={draft}
          receptionist={receptionist}
          reviewSubject={reviewSubject}
          onQualificationChange={setSandboxQualification}
        />
      </div>
    </>
  );
}
