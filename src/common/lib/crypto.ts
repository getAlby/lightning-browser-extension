import { gcm } from "@noble/ciphers/aes.js";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import {
  bytesToHex,
  hexToBytes,
  randomBytes,
  utf8ToBytes,
} from "@noble/hashes/utils.js";
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
 *    by older versions — including blobs that sync down from another device that
 *    has not upgraded yet — keeps working. Never written by new code.
 *
 * `encryptData` always writes v2. `decryptData` detects the format and reads
 * either. Both keep the synchronous signature the rest of the codebase relies
 * on (connectors and actions call these inline).
 */

const KDF_ITERATIONS = 600_000; // OWASP 2023 floor for PBKDF2-HMAC-SHA256
const SALT_BYTES = 16;
const NONCE_BYTES = 12;
const KEY_BYTES = 32;

type EncryptedEnvelope = {
  v: 2;
  c: number; // KDF iteration count (so it can be raised later without a break)
  s: string; // salt, hex
  n: string; // GCM nonce, hex
  d: string; // ciphertext + GCM tag, hex
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Deriving a PBKDF2 key at this iteration count costs a few hundred ms, so the
// result is memoised per (password, salt, iterations). Decrypting the same
// stored blob repeatedly in one session then pays the cost once. Bounded so it
// can never grow without limit. The derived key is no more sensitive than the
// unlock password, which is already held in memory while unlocked.
const MAX_CACHE_ENTRIES = 64;
const keyCache = new Map<string, Uint8Array>();

function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number
): Uint8Array {
  const cacheKey = `${iterations}:${bytesToHex(salt)}:${bytesToHex(
    sha256(utf8ToBytes(password))
  )}`;
  const cached = keyCache.get(cacheKey);
  if (cached) return cached;

  const key = pbkdf2(sha256, utf8ToBytes(password), salt, {
    c: iterations,
    dkLen: KEY_BYTES,
  });

  if (keyCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = keyCache.keys().next().value;
    if (oldest !== undefined) keyCache.delete(oldest);
  }
  keyCache.set(cacheKey, key);
  return key;
}

function isEncryptedEnvelope(value: unknown): value is EncryptedEnvelope {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    e.v === 2 &&
    typeof e.c === "number" &&
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
  const key = deriveKey(password, salt, KDF_ITERATIONS);

  const plaintext = textEncoder.encode(JSON.stringify(data));
  const ciphertext = gcm(key, nonce).encrypt(plaintext);

  const envelope: EncryptedEnvelope = {
    v: 2,
    c: KDF_ITERATIONS,
    s: bytesToHex(salt),
    n: bytesToHex(nonce),
    d: bytesToHex(ciphertext),
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
    const key = deriveKey(password, hexToBytes(parsed.s), parsed.c);
    // GCM verifies the tag and throws on any tampering or wrong key.
    const plaintext = gcm(key, hexToBytes(parsed.n)).decrypt(
      hexToBytes(parsed.d)
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
 * tically without risking data loss. Used to upgrade already-stored secrets on
 * unlock, when the password is available.
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
