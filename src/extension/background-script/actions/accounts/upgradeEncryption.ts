import { isLegacyEncrypted, reEncryptToLatest } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";

/**
 * Opportunistically re-encrypt account secrets still stored in the legacy
 * format into the current authenticated format, using the unlock password.
 *
 * Runs on unlock rather than as a startup migration because the startup
 * migration runner has no access to the password. It is intentionally
 * best-effort: any account whose secrets cannot be re-encrypted is left exactly
 * as-is (`reEncryptToLatest` returns the original blob on failure), so this can
 * never lock a user out. It only writes to storage when something actually
 * changed.
 */
export async function upgradeAccountEncryption(
  password: string
): Promise<void> {
  const accounts = state.getState().accounts;
  let changed = false;
  const updated = { ...accounts };

  for (const [id, account] of Object.entries(accounts)) {
    const next = { ...account };
    let accountChanged = false;

    for (const field of ["config", "mnemonic", "nostrPrivateKey"] as const) {
      const value = next[field];
      if (typeof value === "string" && isLegacyEncrypted(value)) {
        const upgraded = reEncryptToLatest(value, password);
        if (typeof upgraded === "string" && upgraded !== value) {
          next[field] = upgraded;
          accountChanged = true;
        }
      }
    }

    if (accountChanged) {
      updated[id] = next;
      changed = true;
    }
  }

  if (changed) {
    state.setState({ accounts: updated });
    await state.getState().saveToStorage();
  }
}
