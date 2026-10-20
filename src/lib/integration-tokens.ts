/**
 * Encrypted token storage for OAuth integrations.
 * Uses Web Crypto API (AES-GCM) for encryption at rest.
 * Tokens are encrypted before storage in DO Functions KV / database.
 */

import type { IntegrationProviderId } from "./integrations.ts";

const KEY_LENGTH = 32; // 256-bit key for AES-GCM
const IV_LENGTH = 12; // 96-bit IV for GCM

let encryptionKey: CryptoKey | null = null;
let rawKey: Uint8Array | null = null;

/**
 * Derive or set the encryption key from environment variable.
 * INTEGRATION_ENCRYPTION_KEY should be a 32-byte base64 string.
 */
export async function getEncryptionKey(): Promise<CryptoKey> {
  if (encryptionKey) return encryptionKey;

  if (!rawKey) {
    const envKey = process.env.INTEGRATION_ENCRYPTION_KEY;
    if (envKey) {
      // Decode base64 key
      const binary = atob(envKey);
      rawKey = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        rawKey[i] = binary.charCodeAt(i);
      }
      if (rawKey.length !== KEY_LENGTH) {
        throw new Error(`INTEGRATION_ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (base64 encoded)`);
      }
    } else {
      // Development fallback - generate a deterministic key from a fixed seed
      // WARNING: Only for local development! Production must use env var.
      const encoder = new TextEncoder();
      const seed = encoder.encode("dev-only-integration-key-seed-32b");
      const hash = await crypto.subtle.digest("SHA-256", seed);
      rawKey = new Uint8Array(hash);
    }
  }

  encryptionKey = await crypto.subtle.importKey(
    "raw",
    rawKey as unknown as BufferSource,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );

  return encryptionKey;
}

/**
 * Override the encryption key (for testing).
 */
export function setEncryptionKey(key: Uint8Array): void {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Key must be ${KEY_LENGTH} bytes`);
  }
  rawKey = key;
  encryptionKey = null;
}

/**
 * Encrypt token data for storage.
 * Returns base64-encoded string: iv + ciphertext + authTag
 */
export async function encryptToken(data: TokenData): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  // Combine iv + ciphertext (which includes auth tag at the end)
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt token data from storage.
 */
export async function decryptToken(encrypted: string): Promise<TokenData> {
  const key = await getEncryptionKey();

  const combined = new Uint8Array(
    atob(encrypted)
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  if (combined.length < IV_LENGTH + 1) {
    throw new Error("Invalid encrypted token format");
  }

  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  const json = decoder.decode(plaintext);
  return JSON.parse(json) as TokenData;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp (ms)
  scope: string;
  tokenType?: string;
  idToken?: string;
}

/**
 * Token storage interface.
 * Implementation depends on deployment target (DO Functions KV, database, etc.)
 */
export interface TokenStore {
  /** Save encrypted tokens for a user/provider combination */
  save(userId: string, providerId: string, encryptedTokens: string): Promise<void>;

  /** Load encrypted tokens for a user/provider combination */
  load(userId: string, providerId: string): Promise<string | null>;

  /** Delete tokens for a user/provider combination */
  delete(userId: string, providerId: string): Promise<void>;

  /** List all providers connected for a user */
  listProviders(userId: string): Promise<string[]>;
}

/**
 * In-memory token store for development/testing only.
 * NOT for production use.
 */
export class MemoryTokenStore implements TokenStore {
  private store = new Map<string, string>();

  private key(userId: string, providerId: string): string {
    return `${userId}:${providerId}`;
  }

  async save(userId: string, providerId: string, encryptedTokens: string): Promise<void> {
    this.store.set(this.key(userId, providerId), encryptedTokens);
  }

  async load(userId: string, providerId: string): Promise<string | null> {
    return this.store.get(this.key(userId, providerId)) ?? null;
  }

  async delete(userId: string, providerId: string): Promise<void> {
    this.store.delete(this.key(userId, providerId));
  }

  async listProviders(userId: string): Promise<string[]> {
    const prefix = `${userId}:`;
    const providers: string[] = [];
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        providers.push(key.slice(prefix.length));
      }
    }
    return providers;
  }
}

/**
 * Get a token store instance.
 * In production, this should return a persistent store (KV, database).
 */
export function getTokenStore(): TokenStore {
  // Check if we're in a test environment or development
  if (process.env.NODE_ENV === "test" || process.env.NEXT_PUBLIC_ENVIRONMENT === "local") {
    return new MemoryTokenStore();
  }

  // Production: would connect to DO Functions KV or database
  // For now, return memory store with a warning
  console.warn("Using MemoryTokenStore in non-test environment. Implement persistent store for production.");
  return new MemoryTokenStore();
}

/**
 * Check if stored tokens are expired and need refresh.
 */
export function isTokenExpired(tokenData: TokenData): boolean {
  // Refresh 5 minutes before actual expiry
  return Date.now() >= tokenData.expiresAt - 5 * 60 * 1000;
}

/**
 * Refresh access token using refresh token.
 * Returns new TokenData or throws if refresh fails.
 */
export async function refreshAccessToken(
  providerId: IntegrationProviderId,
  refreshToken: string
): Promise<TokenData> {
  const config = (await import("./integrations")).getProviderConfig(providerId);

  const params = new URLSearchParams({
    client_id: process.env[config.clientIdEnv] ?? "",
    client_secret: process.env[config.clientSecretEnv] ?? "",
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  const expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt,
    scope: data.scope ?? config.scopes.join(" "),
    tokenType: data.token_type,
    idToken: data.id_token,
  };
}

// Re-export IntegrationProviderId for convenience
export type { IntegrationProviderId };