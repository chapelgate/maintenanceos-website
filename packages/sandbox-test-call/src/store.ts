import type {
  ReceptionistDraft,
  ReceptionistDraftResult,
  SandboxSession,
  SandboxStore,
  SandboxTest,
} from "./types.ts";

export function createMemoryStore(): SandboxStore {
  const sessions = new Map<string, SandboxSession>();
  const tests = new Map<string, SandboxTest>();
  let sessionSeq = 0;

  return {
    create(
      draft: ReceptionistDraft,
      now: Date,
      built: ReceptionistDraftResult,
    ): SandboxSession {
      sessionSeq += 1;
      const session: SandboxSession = {
        id: `sandbox_sess_${sessionSeq}`,
        kind: "sandbox",
        status: "ready",
        draft,
        knowledgePack: built.knowledgePack,
        systemPrompt: built.systemPrompt,
        limitations: built.limitations,
        createdAt: now.toISOString(),
        liveCall: false,
        liveNumber: null,
        productionTelephony: false,
        frozenLivePathUntouched: true,
      };
      sessions.set(session.id, session);
      return session;
    },
    get(id: string): SandboxSession | undefined {
      return sessions.get(id);
    },
    recordTest(test: SandboxTest): void {
      tests.set(test.id, test);
    },
    getTest(id: string): SandboxTest | undefined {
      return tests.get(id);
    },
  };
}
