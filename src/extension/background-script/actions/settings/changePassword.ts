import { decryptData, encryptData } from "~/common/lib/crypto";
import type { MessageChangePassword } from "~/types";

import state from "../../state";

const changePassword = async (message: MessageChangePassword) => {
  const { currentPassword, password: newPassword } = message.args;

  if (typeof currentPassword !== "string" || currentPassword === "") {
    return { error: "Current password is missing" };
  }

  if (typeof newPassword !== "string" || newPassword === "") {
    return { error: "New password is missing" };
  }

  const accounts = state.getState().accounts;
  const accountIds = Object.keys(accounts);

  if (accountIds.length > 0) {
    // Verify current password by attempting to decrypt an account config
    try {
      decryptData(accounts[accountIds[0]].config as string, currentPassword);
    } catch (e) {
      return { error: "Invalid current password" };
    }
  }

  const tmpAccounts = { ...accounts };

  for (const accountId in tmpAccounts) {
    const accountConfig = decryptData(
      accounts[accountId].config as string,
      currentPassword
    );
    tmpAccounts[accountId].config = encryptData(accountConfig, newPassword);

    // Re-encrypt nostr key with the new password
    if (accounts[accountId].nostrPrivateKey) {
      const accountNostrKey = decryptData(
        accounts[accountId].nostrPrivateKey as string,
        currentPassword
      );
      tmpAccounts[accountId].nostrPrivateKey = encryptData(
        accountNostrKey,
        newPassword
      );
    }

    // Re-encrypt mnemonic with the new password
    if (accounts[accountId].mnemonic) {
      const accountMnemonic = decryptData(
        accounts[accountId].mnemonic as string,
        currentPassword
      );
      tmpAccounts[accountId].mnemonic = encryptData(
        accountMnemonic,
        newPassword
      );
    }
  }
  await state.getState().password(newPassword);
  state.setState({ accounts: tmpAccounts });
  // make sure we immediately persist the updated accounts
  await state.getState().saveToStorage();

  return {};
};

export default changePassword;
