/**
 * Helpers for classifying what a page asked the wallet to sign with the nostr
 * key. Shared by the background action and the confirmation screen so both
 * describe a request the same way.
 */

const HEX_32_BYTES = /^[0-9a-f]{64}$/i;

export type NostrDelegation = {
  delegatee: string;
  conditions: string;
};

/**
 * A nostr event id is the sha256 of its NIP-01 serialization, so a signature
 * over that serialization is a valid event signature. Requests carrying one are
 * event signing requests and belong in the kind-aware flow.
 */
export function isEventSerialization(message: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(message);
  } catch {
    return false;
  }

  if (!Array.isArray(parsed) || parsed.length !== 6) return false;

  const [prefix, pubkey, createdAt, kind, tags, content] = parsed;

  return (
    prefix === 0 &&
    typeof pubkey === "string" &&
    HEX_32_BYTES.test(pubkey) &&
    typeof createdAt === "number" &&
    typeof kind === "number" &&
    Array.isArray(tags) &&
    typeof content === "string"
  );
}

/**
 * NIP-26 delegation token strings: `nostr:delegation:<pubkey>:<conditions>`.
 * Signing one lets the delegatee publish as the user until the conditions run
 * out, so the confirmation screen spells the two parts out.
 */
export function parseDelegation(message: string): NostrDelegation | undefined {
  const prefix = "nostr:delegation:";
  if (!message.startsWith(prefix)) return undefined;

  const rest = message.slice(prefix.length);
  const separator = rest.indexOf(":");
  if (separator === -1) return undefined;

  const delegatee = rest.slice(0, separator);
  const conditions = rest.slice(separator + 1);
  if (!HEX_32_BYTES.test(delegatee) || !conditions) return undefined;

  return { delegatee, conditions };
}
