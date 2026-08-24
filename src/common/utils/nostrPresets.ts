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
 * Permission methods no preset grants any more, revoked once on upgrade.
 *
 * The revoke is unconditional: a permission row records only its method, not
 * which preset or prompt created it, so a grant the user made deliberately
 * through "don't ask again" is removed along with the preset's. It is limited
 * to methods no preset grants today, so nobody ends up narrower than the
 * preset they picked. `nostr/encrypt` is deliberately absent - "I fully trust
 * it" still grants it, and revoking it would prompt those users for a
 * permission that preset still covers.
 */
export const WITHDRAWN_PRESET_PERMISSIONS: string[] = [
  PermissionMethodNostr.NOSTR_DECRYPT,
  ...ALWAYS_CONFIRMED_EVENT_KINDS.map(
    (kind) => `${PermissionMethodNostr.NOSTR_SIGNMESSAGE}/${kind}`
  ),
];
