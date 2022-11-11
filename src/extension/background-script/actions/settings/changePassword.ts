import { decryptData, encryptData } from "~/common/lib/crypto";
import type { Message } from "~/types";

import state from "../../state";

const changePassword = async (message: Message) => {
  const accounts = state.getState().accounts;
  const storageSessionPassword = await chrome.storage.session.get("password");
  const password = storageSessionPassword.password;
  const newPassword = message.args.password as string;
  const tmpAccounts = { ...accounts };

  for (const accountId in tmpAccounts) {
    const accountConfig = decryptData(
      accounts[accountId].config as string,
      password
    );
    tmpAccounts[accountId].config = encryptData(accountConfig, newPassword);
  }
  await chrome.storage.session.set({ password: newPassword });
  state.setState({ accounts: tmpAccounts });
  // make sure we immediately persist the updated accounts
  await state.getState().saveToStorage();

  return {};
};

export default changePassword;
