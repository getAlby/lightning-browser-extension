import { gcm } from "@noble/ciphers/aes.js";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, randomBytes, utf8ToBytes } from "@noble/hashes/utils.js";
import { base64 } from "@scure/base";
import { AES, enc } from "crypto-js";

/**
 * At-rest encryption for account secrets (connector configs, mnemonic, nostr
 * key). Two formats are understood:
 *
 *  - **v2** (written by this version): PBKDF2-SHA256 key derivation with a high
 *    iteration count, AES-256-GCM authenticated encryption. GCM's tag makes the
 *    ciphertext tamper-evident; a modified blob fails to decrypt instead of
 *    silently yielding altered plaintext.
 *  - **legacy** (crypto-js passphrase mode): still readable so that data written
 *    by older versions keeps working. Never written by new code.
 *
 * `encryptData` always writes v2. `decryptData` reads either. Both keep the
 * synchronous signature the rest of the codebase relies on (connectors and
 * actions call these inline).
 *
 * Cross-version note: v2 blobs are stored under the single `accounts`
 * `browser.storage.sync` key, so they replicate to other devices. A v2 blob is
 * NOT readable by versions <= 3.14.5 (their crypto-js path throws on it). Reading
 * the previous format here keeps a not-yet-upgraded device working when it
 * receives an old blob; the reverse — an old build receiving a v2 blob — cannot
 * be made to work and is a deliberate, documented consequence of no longer
 * writing the weak format.
 */

const KDF_ITERATIONS = 600_000; // OWASP 2023 floor for PBKDF2-HMAC-SHA256
const MIN_ITERATIONS = 1;
// Guardrail against a corrupted/poisoned envelope driving PBKDF2 into a long
// synchronous stall. Sized to leave headroom above KDF_ITERATIONS while capping
// the worst case near a second or two.
//
// NOTE: raising KDF_ITERATIONS above MAX_ITERATIONS is a BREAKING format change.
// Builds with the lower bound classify such envelopes as not-v2 and fail to
// decrypt them, which surfaces to the user as "invalid password". Raise this
// constant (and ship it) before raising KDF_ITERATIONS past it.
const MAX_ITERATIONS = 1_200_000;
const SALT_BYTES = 16;
const NONCE_BYTES = 12;
const KEY_BYTES = 32;

type EncryptedEnvelope = {
  v: 2;
  c: number; // KDF iteration count (so it can be raised later without a break)
  s: string; // salt, base64
  n: string; // GCM nonce, base64
  d: string; // ciphertext + GCM tag, base64
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Deriving a PBKDF2 key at this iteration count costs a few hundred ms, so the
// result is memoised per (password, salt, iterations) for the hot *read* path:
// decrypting the same stored blob repeatedly in one session then pays the cost
// once. Bounded, and cleared on lock via clearKeyCache() so derived keys and the
// password hash below do not outlive the unlocked session. Encryption uses a
// fresh salt every call, so its keys are single-use and are never cached (that
// would only evict useful read keys).
const MAX_CACHE_ENTRIES = 64;
const keyCache = new Map<string, Uint8Array>();

/** Drop all memoised keys. Call when the wallet locks or state is reset. */
export function clearKeyCache(): void {
  keyCache.clear();
}

function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
  cache: boolean
): Uint8Array {
  const cacheKey = cache
    ? `${iterations}:${bytesToHex(salt)}:${bytesToHex(
        sha256(utf8ToBytes(password))
      )}`
    : null;
  if (cacheKey) {
    const cached = keyCache.get(cacheKey);
    if (cached) return cached;
  }

  const key = pbkdf2(sha256, utf8ToBytes(password), salt, {
    c: iterations,
    dkLen: KEY_BYTES,
  });

  if (cacheKey) {
    if (keyCache.size >= MAX_CACHE_ENTRIES) {
      const oldest = keyCache.keys().next().value;
      if (oldest !== undefined) keyCache.delete(oldest);
    }
    keyCache.set(cacheKey, key);
  }
  return key;
}

function isEncryptedEnvelope(value: unknown): value is EncryptedEnvelope {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    e.v === 2 &&
    typeof e.c === "number" &&
    Number.isInteger(e.c) &&
    e.c >= MIN_ITERATIONS &&
    e.c <= MAX_ITERATIONS &&
    typeof e.s === "string" &&
    typeof e.n === "string" &&
    typeof e.d === "string"
  );
}

/** True when `cipher` is a legacy crypto-js passphrase blob, not a v2 envelope. */
export function isLegacyEncrypted(cipher: string): boolean {
  try {
    return !isEncryptedEnvelope(JSON.parse(cipher));
  } catch {
    // legacy ciphertext is base64 of "Salted__…", which is not valid JSON
    return true;
  }
}

export function encryptData(data: unknown, password: string): string {
  const salt = randomBytes(SALT_BYTES);
  const nonce = randomBytes(NONCE_BYTES);
  const key = deriveKey(password, salt, KDF_ITERATIONS, false);

  const plaintext = textEncoder.encode(JSON.stringify(data));
  const ciphertext = gcm(key, nonce).encrypt(plaintext);

  const envelope: EncryptedEnvelope = {
    v: 2,
    c: KDF_ITERATIONS,
    s: base64.encode(salt),
    n: base64.encode(nonce),
    d: base64.encode(ciphertext),
  };
  return JSON.stringify(envelope);
}

export function decryptData(cipher: string, password: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(cipher);
  } catch {
    parsed = undefined;
  }

  if (isEncryptedEnvelope(parsed)) {
    const key = deriveKey(password, base64.decode(parsed.s), parsed.c, true);
    // GCM verifies the tag and throws on any tampering or wrong key.
    const plaintext = gcm(key, base64.decode(parsed.n)).decrypt(
      base64.decode(parsed.d)
    );
    return JSON.parse(textDecoder.decode(plaintext));
  }

  // Legacy crypto-js passphrase format (EVP_BytesToKey/MD5, AES-CBC, no MAC).
  const decrypted = AES.decrypt(cipher, password);
  return JSON.parse(decrypted.toString(enc.Utf8));
}

/**
 * Re-encrypt a legacy blob into the v2 format using the same password. Returns
 * the input unchanged when it is already v2, or when it cannot be decrypted
 * (wrong password / not this account's data) so callers can run it opportunis-
 * tically without risking data loss.
 */
export function reEncryptToLatest(
  cipher: string | null | undefined,
  password: string
): string | null | undefined {
  if (typeof cipher !== "string" || !isLegacyEncrypted(cipher)) return cipher;
  try {
    const data = decryptData(cipher, password);
    return encryptData(data, password);
  } catch {
    return cipher;
  }
}
