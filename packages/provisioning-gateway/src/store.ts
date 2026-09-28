import fs from "node:fs";
import path from "node:path";
import type {
  IdempotencyEntry,
  ProvisioningRecord,
  ProvisioningStore,
} from "./types.ts";
import type { AdapterReadinessRecord } from "./adapters/types.ts";

type PersistedState = {
  version: 1;
  nonces: Record<string, number>;
  idempotency: Record<string, IdempotencyEntry>;
  provisionings: Record<string, ProvisioningRecord>;
  adapterReadiness: Record<string, AdapterReadinessRecord>;
};

function emptyState(): PersistedState {
  return {
    version: 1,
    nonces: {},
    idempotency: {},
    provisionings: {},
    adapterReadiness: {},
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

  getAdapterReadiness(provisioningId: string): AdapterReadinessRecord | undefined {
    const found = this.state.adapterReadiness[provisioningId];
    return found ? clone(found) : undefined;
  }

  putAdapterReadiness(record: AdapterReadinessRecord): void {
    this.state.adapterReadiness[record.provisioningId] = clone(record);
  }
}

function parseState(raw: string): PersistedState {
  const parsed = JSON.parse(raw) as Partial<PersistedState>;
  if (
    parsed.version !== 1 ||
    !parsed.nonces ||
    typeof parsed.nonces !== "object" ||
    !parsed.idempotency ||
    typeof parsed.idempotency !== "object" ||
    !parsed.provisionings ||
    typeof parsed.provisionings !== "object" ||
    (parsed.adapterReadiness !== undefined &&
      (!parsed.adapterReadiness || typeof parsed.adapterReadiness !== "object"))
  ) {
    throw new Error("Provisioning gateway state file is invalid.");
  }
  return {
    version: 1,
    nonces: parsed.nonces,
    idempotency: parsed.idempotency,
    provisionings: parsed.provisionings,
    adapterReadiness: parsed.adapterReadiness ?? {},
  };
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

  getAdapterReadiness(provisioningId: string): AdapterReadinessRecord | undefined {
    const found = this.state.adapterReadiness[provisioningId];
    return found ? clone(found) : undefined;
  }

  putAdapterReadiness(record: AdapterReadinessRecord): void {
    this.state.adapterReadiness[record.provisioningId] = clone(record);
    this.persist();
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
