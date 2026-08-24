import { EventKind } from "~/extension/providers/nostr/types";
import { PermissionMethodNostr } from "~/types";

/**
 * Event kinds the "reasonable" preset auto-approves.
 *
 * Limited to posting and social kinds. Kinds that change who the account is
 * (profile, contacts, relay list), speak privately as the user, or authenticate
 * the user to a relay or a website are deliberately absent: those always ask.
 */
export const REASONABLE_PRESET_EVENT_KINDS: EventKind[] = [
  EventKind.Text,
  EventKind.Repost,
  EventKind.React,
  EventKind.ZapRequest,
  EventKind.MuteList,
  EventKind.Bookmarks,
  EventKind.LongNote,
  EventKind.ProfileBadge,
  EventKind.CreateBadge,
  EventKind.AppData,
];

/**
 * Event kinds that are never auto-approved by a preset. Each one either changes
 * the account's identity or authenticates as the user, so each is confirmed
 * individually.
 */
export const ALWAYS_CONFIRMED_EVENT_KINDS: EventKind[] = [
  EventKind.Metadata,
  EventKind.Contacts,
  EventKind.DM,
  EventKind.RelayList,
  EventKind.Authenticate,
  EventKind.RemoteSign,
  EventKind.HTTPAuth,
  EventKind.UploadChunk,
];

/** Methods the "reasonable" preset auto-approves. */
export const REASONABLE_PRESET_METHODS: PermissionMethodNostr[] = [
  PermissionMethodNostr.NOSTR_GETPUBLICKEY,
];

/**
 * Reading the user's encrypted messages is never granted by a preset, not even
 * by "I fully trust it" — every decryption is confirmed individually.
 */
export const NEVER_PRESET_GRANTED_METHODS: PermissionMethodNostr[] = [
  PermissionMethodNostr.NOSTR_DECRYPT,
];

/** Methods the "I fully trust it" preset auto-approves. */
export const TRUST_FULLY_PRESET_METHODS: PermissionMethodNostr[] =
  Object.values(PermissionMethodNostr).filter(
    (method) => !NEVER_PRESET_GRANTED_METHODS.includes(method)
  );

/**
 * Permission methods earlier versions persisted from the "reasonable" preset
 * that it no longer grants. Revoked once on upgrade so existing connections do
 * not keep a broader grant than the preset now describes.
 */
export const WITHDRAWN_PRESET_PERMISSIONS: string[] = [
  PermissionMethodNostr.NOSTR_DECRYPT,
  PermissionMethodNostr.NOSTR_ENCRYPT,
  ...ALWAYS_CONFIRMED_EVENT_KINDS.map(
    (kind) => `${PermissionMethodNostr.NOSTR_SIGNMESSAGE}/${kind}`
  ),
];
