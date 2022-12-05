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

  const findPermission = await db.permissions.get({
    host,
    method,
  });

  if (findPermission) {
    if (!findPermission?.id) {
      return false;
    }

    const permissionEnabled = await db.permissions.update(findPermission.id, {
      enabled: true,
    });

    return !!permissionEnabled && (await db.saveToStorage());
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

export function validateEvent(event: Event) {
  if (event.id !== getEventHash(event)) return false;
  if (typeof event.content !== "string") return false;
  if (typeof event.created_at !== "number") return false;

  if (!Array.isArray(event.tags)) return false;
  for (const tag of event.tags) {
    if (!Array.isArray(tag)) return false;
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] === "object") return false;
    }
  }

  return true;
}

export async function signEvent(event: Event, key: string) {
  const signedEvent = await secp256k1.schnorr.sign(getEventHash(event), key);
  return secp256k1.utils.bytesToHex(signedEvent);
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
  return sha256(serializeEvent(event)).toString(Hex);
}
