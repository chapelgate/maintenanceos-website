"use client";

import { useState } from "react";
import { CreateReceptionistForm } from "@/components/CreateReceptionistForm";
import { SandboxTestCallPanel } from "@/components/SandboxTestCallPanel";
import {
  EMPTY_RECEPTIONIST_DRAFT,
  type ReceptionistDraft,
} from "@/lib/onboarding-create";

/**
 * Lifts the /create draft so the sandbox panel can use reviewed fields
 * after the draft step without adding Next API routes.
 */
export function CreateJourney() {
  const [draft, setDraft] = useState<ReceptionistDraft>(EMPTY_RECEPTIONIST_DRAFT);

  return (
    <>
      <CreateReceptionistForm onDraftChange={setDraft} />
      <div className="mt-6">
        <SandboxTestCallPanel draft={draft} />
      </div>
    </>
  );
}
