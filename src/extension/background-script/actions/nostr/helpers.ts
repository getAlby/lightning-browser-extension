import * as secp256k1 from "@noble/secp256k1";
import Hex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
import db from "~/extension/background-script/db";
import { Event } from "~/extension/ln/nostr/types";

export async function hasPermissionFor(method: string, host: string) {
  if (!host) {
    return false;
  }

  const allowance = await db.allowances.get({
    host,
  });

  if (!allowance?.id) {
    return false;
  }

  const findPermission = await db.permissions.get({
    host,
    method,
  });

  return !!findPermission?.enabled;
}

export async function addPermissionFor(method: string, host: string) {
  const allowance = await db.allowances.get({
    host,
  });

  if (!allowance?.id) {
    return false;
  }
  const permissionIsAdded = await db.permissions.add({
    createdAt: Date.now().toString(),
    allowanceId: allowance.id,
    host: host,
    method: method,
    enabled: true,
    blocked: false,
  });

  return !!permissionIsAdded && (await db.saveToStorage());
}

// from: https://github.com/nbd-wtf/nostr-tools/blob/160987472fd4922dd80c75648ca8939dd2d96cc0/event.ts#L61
// to avoid the additional dependency
export function validateEvent(event: Event): boolean {
  if (typeof event.content !== "string") return false;
  if (typeof event.created_at !== "number") return false;
  if (typeof event.pubkey !== "string") return false;
  if (!event.pubkey.match(/^[a-f0-9]{64}$/)) return false;

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
  const signedEvent = await secp256k1.schnorr.sign(getEventHash(event), key);
  return secp256k1.utils.bytesToHex(signedEvent);
}

export function getEventHash(event: Event): string {
  return sha256(serializeEvent(event)).toString(Hex);
}
