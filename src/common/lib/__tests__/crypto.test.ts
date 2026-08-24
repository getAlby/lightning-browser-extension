import { AES } from "crypto-js";

import {
  decryptData,
  encryptData,
  isLegacyEncrypted,
  reEncryptToLatest,
} from "../crypto";

const secret = {
  nostrWalletConnectUrl: "nostr+walletconnect://abc?relay=wss://r&secret=xyz",
  macaroon: "0201036c6e6402ff",
};

describe("crypto (v2 authenticated format)", () => {
  test("round-trips arbitrary data", () => {
    const cipher = encryptData(secret, "correct horse battery staple");
    expect(decryptData(cipher, "correct horse battery staple")).toEqual(secret);
  });

  test("writes a versioned, non-crypto-js envelope", () => {
    const cipher = encryptData(secret, "pw");
    const env = JSON.parse(cipher);
    expect(env.v).toBe(2);
    expect(env.c).toBeGreaterThanOrEqual(600_000);
    expect(typeof env.s).toBe("string");
    expect(typeof env.n).toBe("string");
    // must NOT be the old OpenSSL "Salted__" base64 format
    expect(cipher.startsWith("U2FsdGVk")).toBe(false);
  });

  test("uses a fresh salt and nonce every call (no deterministic ciphertext)", () => {
    const a = encryptData(secret, "pw");
    const b = encryptData(secret, "pw");
    expect(a).not.toEqual(b);
    expect(JSON.parse(a).s).not.toEqual(JSON.parse(b).s);
    expect(JSON.parse(a).n).not.toEqual(JSON.parse(b).n);
  });

  test("wrong password fails to decrypt (does not return garbage)", () => {
    const cipher = encryptData(secret, "right");
    expect(() => decryptData(cipher, "wrong")).toThrow();
  });

  test("tampering with the ciphertext is detected (AEAD tag)", () => {
    const cipher = encryptData(secret, "pw");
    const env = JSON.parse(cipher);
    // flip one nibble of the ciphertext+tag
    const bytes = env.d.split("");
    bytes[10] = bytes[10] === "a" ? "b" : "a";
    env.d = bytes.join("");
    expect(() => decryptData(JSON.stringify(env), "pw")).toThrow();
  });
});

describe("crypto (legacy compatibility)", () => {
  // exactly what the old code produced: AES.encrypt(JSON.stringify(x), password)
  const legacy = AES.encrypt(JSON.stringify(secret), "legacy-pw").toString();

  test("still decrypts legacy crypto-js blobs", () => {
    expect(legacy.startsWith("U2FsdGVk")).toBe(true); // "Salted__"
    expect(decryptData(legacy, "legacy-pw")).toEqual(secret);
  });

  test("isLegacyEncrypted distinguishes the two formats", () => {
    expect(isLegacyEncrypted(legacy)).toBe(true);
    expect(isLegacyEncrypted(encryptData(secret, "pw"))).toBe(false);
  });

  test("reEncryptToLatest upgrades a legacy blob, preserving plaintext", () => {
    const upgraded = reEncryptToLatest(legacy, "legacy-pw") as string;
    expect(isLegacyEncrypted(upgraded)).toBe(false);
    expect(decryptData(upgraded, "legacy-pw")).toEqual(secret);
  });

  test("reEncryptToLatest leaves a v2 blob untouched", () => {
    const v2 = encryptData(secret, "pw");
    expect(reEncryptToLatest(v2, "pw")).toBe(v2);
  });

  test("reEncryptToLatest returns the original when it cannot decrypt", () => {
    // wrong password: must not throw, must not lose the blob
    expect(reEncryptToLatest(legacy, "not-the-password")).toBe(legacy);
  });

  test("reEncryptToLatest passes through null/undefined", () => {
    expect(reEncryptToLatest(null, "pw")).toBeNull();
    expect(reEncryptToLatest(undefined, "pw")).toBeUndefined();
  });
});
