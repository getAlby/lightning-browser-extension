import * as secp256k1 from "@noble/secp256k1";
import createHash from "create-hash";
import { Event } from "~/extension/ln/nostr/types";

export function validateEvent(event: Event) {
  if (event.id !== getEventHash(event)) return false;
  if (typeof event.content !== "string") return false;
  if (typeof event.created_at !== "number") return false;

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

export async function signEvent(event: Event, key: string) {
  return Buffer.from(
    await secp256k1.schnorr.sign(getEventHash(event), key)
  ).toString("hex");
}

export function serializeEvent(evt: Event) {
  return JSON.stringify([
    0,
    evt.pubkey,
    evt.created_at,
    evt.kind,
    evt.tags,
    evt.content,
  ]);
}

export function getEventHash(event: Event): string {
  const eventHash = createHash("sha256")
    .update(Buffer.from(serializeEvent(event)))
    .digest();
  return Buffer.from(eventHash).toString("hex");
}
