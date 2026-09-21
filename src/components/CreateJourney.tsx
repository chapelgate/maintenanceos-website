"use client";

import { useState } from "react";
import { CreateReceptionistForm } from "@/components/CreateReceptionistForm";
import { SandboxTestCallPanel } from "@/components/SandboxTestCallPanel";
import {
  EMPTY_RECEPTIONIST_DRAFT,
  type ReceptionistDraft,
} from "@/lib/onboarding-create";
import type { ReceptionistDraftResult } from "@/lib/receptionist-draft";

/**
 * Lifts the /create draft and receptionist pack so the sandbox panel can
 * consume reviewed fields after the draft step without Next API routes.
 */
export function CreateJourney() {
  const [draft, setDraft] = useState<ReceptionistDraft>(EMPTY_RECEPTIONIST_DRAFT);
  const [receptionist, setReceptionist] = useState<ReceptionistDraftResult | null>(
    null,
  );

  return (
    <>
      <CreateReceptionistForm
        onDraftChange={setDraft}
        onReceptionistChange={setReceptionist}
      />
      <div className="mt-6">
        <SandboxTestCallPanel draft={draft} receptionist={receptionist} />
      </div>
    </>
  );
}
