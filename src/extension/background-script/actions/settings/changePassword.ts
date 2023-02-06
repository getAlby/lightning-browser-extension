import { decryptData, encryptData } from "~/common/lib/crypto";
import type { Message } from "~/types";

import state from "../../state";

const changePassword = async (message: Message) => {
  const accounts = state.getState().accounts;
  const password = state.getState().password as string;
  const newPassword = message.args.password as string;
  const tmpAccounts = { ...accounts };

  for (const accountId in tmpAccounts) {
    const accountConfig = decryptData(
      accounts[accountId].config as string,
      password
    );
    tmpAccounts[accountId].config = encryptData(accountConfig, newPassword);
    const accountNostrKey = decryptData(
      accounts[accountId].nostrPrivateKey as string,
      password
    );
    tmpAccounts[accountId].nostrPrivateKey = encryptData(
      accountNostrKey,
      newPassword
    );
    const accountLiquidKey = decryptData(
      accounts[accountId].liquidPrivateKey as string,
      password
    );
    tmpAccounts[accountId].liquidPrivateKey = encryptData(
      accountLiquidKey,
      newPassword
    );
  }
  state.setState({ accounts: tmpAccounts, password: newPassword });
  // make sure we immediately persist the updated accounts
  await state.getState().saveToStorage();

  return {};
};

export default changePassword;
