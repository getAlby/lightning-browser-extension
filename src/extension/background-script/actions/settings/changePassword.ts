import { decryptData, encryptData } from "~/common/lib/crypto";
import type { Message } from "~/types";

import state from "../../state";

const changePassword = async (message: Message) => {
  const accounts = state.getState().accounts;
  const password = await state.getState().password();
  if (!password) return { error: "Password is missing" };
  const newPassword = message.args.password as string;
  const tmpAccounts = { ...accounts };

  for (const accountId in tmpAccounts) {
    const accountConfig = decryptData(
      accounts[accountId].config as string,
      password
    );
    tmpAccounts[accountId].config = encryptData(accountConfig, newPassword);

    // Re-encrypt nostr key with the new password
    if (accounts[accountId].nostrPrivateKey) {
      const accountNostrKey = decryptData(
        accounts[accountId].nostrPrivateKey as string,
        password
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
        password
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
