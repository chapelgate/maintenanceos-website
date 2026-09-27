import fs from "node:fs";
import path from "node:path";
import type {
  AdapterIdempotencyEntry,
  AdapterPreparationRecord,
  IdempotencyEntry,
  ProvisioningRecord,
  ProvisioningStore,
} from "./types.ts";

type PersistedState = {
  version: 2;
  nonces: Record<string, number>;
  idempotency: Record<string, IdempotencyEntry>;
  provisionings: Record<string, ProvisioningRecord>;
  adapterIdempotency: Record<string, AdapterIdempotencyEntry>;
  adapterPreparations: Record<string, AdapterPreparationRecord>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function emptyState(): PersistedState {
  return {
    version: 2,
    nonces: {},
    idempotency: {},
    provisionings: {},
    adapterIdempotency: {},
    adapterPreparations: {},
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function nonceKey(scope: string, nonce: string): string {
  return scope + ":" + nonce;
}

export class MemoryProvisioningStore implements ProvisioningStore {
  private state = emptyState();

  claimNonce(
    scope: string,
    nonce: string,
    expiresAtMs: number,
    nowMs: number,
  ): boolean {
    for (const [key, expiry] of Object.entries(this.state.nonces)) {
      if (expiry <= nowMs) delete this.state.nonces[key];
    }
    const key = nonceKey(scope, nonce);
    if ((this.state.nonces[key] ?? 0) > nowMs) return false;
    this.state.nonces[key] = expiresAtMs;
    return true;
  }

  getIdempotency(scope: string): IdempotencyEntry | undefined {
    const found = this.state.idempotency[scope];
    return found ? clone(found) : undefined;
  }

  putIdempotency(scope: string, entry: IdempotencyEntry): void {
    this.state.idempotency[scope] = clone(entry);
    this.state.provisionings[entry.record.id] = clone(entry.record);
  }

  getProvisioning(id: string): ProvisioningRecord | undefined {
    const found = this.state.provisionings[id];
    return found ? clone(found) : undefined;
  }

  getAdapterIdempotency(scope: string): AdapterIdempotencyEntry | undefined {
    const found = this.state.adapterIdempotency[scope];
    return found ? clone(found) : undefined;
  }

  putAdapterIdempotency(
    scope: string,
    entry: AdapterIdempotencyEntry,
  ): void {
    this.state.adapterIdempotency[scope] = clone(entry);
    this.state.adapterPreparations[entry.record.provisioningId] =
      clone(entry.record);
  }

  getAdapterPreparation(
    provisioningId: string,
  ): AdapterPreparationRecord | undefined {
    const found = this.state.adapterPreparations[provisioningId];
    return found ? clone(found) : undefined;
  }
}

function parseState(raw: string): PersistedState {
  const parsed = JSON.parse(raw) as unknown;
  if (!isRecord(parsed)) {
    throw new Error("Provisioning gateway state file is invalid.");
  }

  if (
    parsed.version === 1 &&
    isRecord(parsed.nonces) &&
    isRecord(parsed.idempotency) &&
    isRecord(parsed.provisionings)
  ) {
    return {
      version: 2,
      nonces: parsed.nonces as Record<string, number>,
      idempotency: parsed.idempotency as Record<string, IdempotencyEntry>,
      provisionings: parsed.provisionings as Record<string, ProvisioningRecord>,
      adapterIdempotency: {},
      adapterPreparations: {},
    };
  }

  if (
    parsed.version !== 2 ||
    !isRecord(parsed.nonces) ||
    !isRecord(parsed.idempotency) ||
    !isRecord(parsed.provisionings) ||
    !isRecord(parsed.adapterIdempotency) ||
    !isRecord(parsed.adapterPreparations)
  ) {
    throw new Error("Provisioning gateway state file is invalid.");
  }

  return parsed as unknown as PersistedState;
}

export class FileProvisioningStore implements ProvisioningStore {
  private state: PersistedState;
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    if (fs.existsSync(filePath)) {
      this.state = parseState(fs.readFileSync(filePath, "utf8"));
    } else {
      this.state = emptyState();
    }
  }

  private persist(): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const temp = this.filePath + ".tmp-" + process.pid;
    fs.writeFileSync(temp, JSON.stringify(this.state, null, 2) + "\n", {
      encoding: "utf8",
      mode: 0o600,
    });
    try {
      fs.renameSync(temp, this.filePath);
    } catch {
      fs.rmSync(this.filePath, { force: true });
      fs.renameSync(temp, this.filePath);
    }
  }

  claimNonce(
    scope: string,
    nonce: string,
    expiresAtMs: number,
    nowMs: number,
  ): boolean {
    let changed = false;
    for (const [key, expiry] of Object.entries(this.state.nonces)) {
      if (expiry <= nowMs) {
        delete this.state.nonces[key];
        changed = true;
      }
    }
    const key = nonceKey(scope, nonce);
    if ((this.state.nonces[key] ?? 0) > nowMs) {
      if (changed) this.persist();
      return false;
    }
    this.state.nonces[key] = expiresAtMs;
    this.persist();
    return true;
  }

  getIdempotency(scope: string): IdempotencyEntry | undefined {
    const found = this.state.idempotency[scope];
    return found ? clone(found) : undefined;
  }

  putIdempotency(scope: string, entry: IdempotencyEntry): void {
    this.state.idempotency[scope] = clone(entry);
    this.state.provisionings[entry.record.id] = clone(entry.record);
    this.persist();
  }

  getProvisioning(id: string): ProvisioningRecord | undefined {
    const found = this.state.provisionings[id];
    return found ? clone(found) : undefined;
  }

  getAdapterIdempotency(scope: string): AdapterIdempotencyEntry | undefined {
    const found = this.state.adapterIdempotency[scope];
    return found ? clone(found) : undefined;
  }

  putAdapterIdempotency(
    scope: string,
    entry: AdapterIdempotencyEntry,
  ): void {
    this.state.adapterIdempotency[scope] = clone(entry);
    this.state.adapterPreparations[entry.record.provisioningId] =
      clone(entry.record);
    this.persist();
  }

  getAdapterPreparation(
    provisioningId: string,
  ): AdapterPreparationRecord | undefined {
    const found = this.state.adapterPreparations[provisioningId];
    return found ? clone(found) : undefined;
  }
}

export function createProvisioningStoreFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): ProvisioningStore {
  const file =
    env.PROVISIONING_GATEWAY_STATE_FILE?.trim() ||
    ".data/provisioning-gateway-state.json";
  return new FileProvisioningStore(path.resolve(file));
}
