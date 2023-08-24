/*
 * This file defines the secp256k1 module injected in liquidjs-lib and slip77.
 * It implements interface compatible with BIP341Factory and SLIP77Factory.
 */
import { mod } from "@noble/curves/abstract/modular";
import { schnorr, secp256k1 } from "@noble/curves/secp256k1";
import type { XOnlyPointAddTweakResult } from "liquidjs-lib/src/bip341";

const ORDER = secp256k1.CURVE.n;

function assertBytes(name: string, bytes: Uint8Array, length: number): void {
  if (bytes.length !== length) {
    throw new Error(`(${name}) Expected ${length} bytes, got ${bytes.length}`);
  }
}

function hexToNumber(hex: string): bigint {
  if (typeof hex !== "string") {
    throw new TypeError("hexToNumber: expected string, got " + typeof hex);
  }
  return BigInt(`0x${hex}`);
}

const bytesToNumber = (bytes: Uint8Array) =>
  hexToNumber(Buffer.from(bytes).toString("hex"));

const numberToHex = (num: number | bigint) =>
  num.toString(16).padStart(64, "0");

export function pointFromScalar(
  d: Uint8Array,
  compressed = true
): Uint8Array | null {
  return secp256k1.ProjectivePoint.fromPrivateKey(d).toRawBytes(compressed);
}

export function privateSub(
  d: Uint8Array,
  tweak: Uint8Array
): Uint8Array | null {
  const point = secp256k1.ProjectivePoint.fromPrivateKey(d);
  const tweakedPoint = secp256k1.ProjectivePoint.fromHex(tweak);
  return point.subtract(tweakedPoint).toRawBytes(true);
}

export function signSchnorr(
  h: Uint8Array,
  d: Uint8Array,
  e?: Uint8Array
): Uint8Array {
  return schnorr.sign(h, d, e);
}

export function verifySchnorr(
  h: Uint8Array,
  Q: Uint8Array,
  signature: Uint8Array
): boolean {
  return schnorr.verify(signature, h, Q);
}

export function isPoint(p: Uint8Array): boolean {
  try {
    secp256k1.ProjectivePoint.fromHex(p);
    return true;
  } catch {
    return false;
  }
}

export function pointCompress(p: Uint8Array, compressed?: boolean): Uint8Array {
  return secp256k1.ProjectivePoint.fromHex(p).toRawBytes(compressed);
}

export function isPrivate(d: Uint8Array): boolean {
  try {
    secp256k1.ProjectivePoint.fromPrivateKey(d);
    return true;
  } catch {
    return false;
  }
}

export function xOnlyPointAddTweak(
  p: Uint8Array,
  tweak: Uint8Array
): XOnlyPointAddTweakResult | null {
  // add an y coordinate to the point (expected by liquidjs-lib.bip341 module)
  // the value does not matter, taproot will ignore it and use the x coordinate only
  p = Buffer.concat([Buffer.from([0x02]), p]);

  const point = secp256k1.ProjectivePoint.fromHex(p);
  const tweakedPoint = secp256k1.ProjectivePoint.fromPrivateKey(tweak);
  let result = null;
  try {
    result = point.add(tweakedPoint);
  } catch {
    return null;
  }
  return {
    parity: result.hasEvenY() ? 0 : 1,
    xOnlyPubkey: result.toRawBytes(true).slice(1),
  };
}

export function privateAdd(
  d: Uint8Array,
  tweak: Uint8Array
): Uint8Array | null {
  assertBytes("privateKey", d, 32);
  assertBytes("tweak", tweak, 32);

  let t = bytesToNumber(tweak);
  if (t === BigInt(0)) {
    throw new Error("Tweak must not be zero");
  }
  if (t >= ORDER) {
    throw new Error("Tweak bigger than curve order");
  }
  t += bytesToNumber(d);
  if (t >= ORDER) {
    t -= ORDER;
  }
  if (t === BigInt(0)) {
    throw new Error(
      "The tweak was out of range or the resulted private key is invalid"
    );
  }

  return Buffer.from(numberToHex(t), "hex");
}

export function privateNegate(d: Uint8Array): Uint8Array {
  assertBytes("privateKey", d, 32);
  const bn = mod(-bytesToNumber(d), ORDER);
  return Buffer.from(numberToHex(bn), "hex");
}

// ECDSA functions are expected by the interfaces but not used, so we throw an error if called

export function sign(h: Uint8Array, d: Uint8Array, e?: Uint8Array): Uint8Array {
  throw new Error("sign not implemented");
}

export function verify(
  h: Uint8Array,
  Q: Uint8Array,
  signature: Uint8Array,
  strict?: boolean
): boolean {
  throw new Error("verify not implemented");
}
