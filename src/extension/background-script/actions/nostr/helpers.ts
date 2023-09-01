import { schnorr } from "@noble/curves/secp256k1";
import * as secp256k1 from "@noble/secp256k1";
import Hex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
import { Event } from "~/extension/providers/nostr/types";

// based upon : https://github.com/nbd-wtf/nostr-tools/blob/b9a7f814aaa08a4b1cec705517b664390abd3f69/event.ts#L95
// to avoid the additional dependency
export function validateEvent(event: Event): boolean {
  if (!(event instanceof Object)) return false;
  if (typeof event.kind !== "number") return false;
  if (typeof event.content !== "string") return false;
  if (typeof event.created_at !== "number") return false;
  // ignore pubkey checks because if the pubkey is not set we add it to the event. same for the ID.

  if (!Array.isArray(event.tags)) return false;
  for (let i = 0; i < event.tags.length; i++) {
    const tag = event.tags[i];
    if (!Array.isArray(tag)) return false;
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] === "object") return false;
    }
  }

  return true;
}

// from: https://github.com/nbd-wtf/nostr-tools/blob/160987472fd4922dd80c75648ca8939dd2d96cc0/event.ts#L42
// to avoid the additional dependency
export function serializeEvent(evt: Event): string {
  if (!validateEvent(evt))
    throw new Error("can't serialize event with wrong or missing properties");

  return JSON.stringify([
    0,
    evt.pubkey,
    evt.created_at,
    evt.kind,
    evt.tags,
    evt.content,
  ]);
}

export async function signEvent(event: Event, key: string) {
  const signedEvent = await schnorr.sign(getEventHash(event), key);
  return secp256k1.etc.bytesToHex(signedEvent);
}

export function getEventHash(event: Event): string {
  return sha256(serializeEvent(event)).toString(Hex);
}
