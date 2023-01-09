import { decryptData, encryptData } from "~/common/lib/crypto";
import type { Message } from "~/types";

import state from "../../state";

const changePassword = async (message: Message) => {
  const accounts = state.getState().accounts;
  const password = await state.getState().password();
  if (!password) return { error: "Password is missing" };
  const newPassword = message.args.password as string;
  const tmpAccounts = { ...accounts };
  const nostPrivateKey = await state.getState().getNostr().getPrivateKey();

  for (const accountId in tmpAccounts) {
    const accountConfig = decryptData(
      accounts[accountId].config as string,
      password
    );
    tmpAccounts[accountId].config = encryptData(accountConfig, newPassword);
  }

  await state.getState().password(newPassword);
  state.setState({ accounts: tmpAccounts });
  await state.getState().getNostr().setPrivateKey(nostPrivateKey);

  // make sure we immediately persist the updated accounts
  await state.getState().saveToStorage();

  return {};
};

export default changePassword;
