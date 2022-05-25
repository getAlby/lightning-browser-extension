import { v4 as uuidv4 } from "uuid";
import { encryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";
import type { MessageAccountAdd } from "~/types";

const add = async (message: MessageAccountAdd) => {
  const newAccount = message.args;
  const accounts = state.getState().accounts;

  // TODO: add validations

  // TODO: make sure a password is set
  const password = state.getState().password;
  const currentAccountId = state.getState().currentAccountId;

  if (!password) return { error: "Password is missing" };

  const accountId = uuidv4();
  newAccount.config = encryptData(newAccount.config, password);
  accounts[accountId] = {
    id: accountId,
    ...newAccount,
  };

  state.setState({ accounts });

  if (!currentAccountId) {
    state.setState({ currentAccountId: accountId });
  }

  // make sure we immediately persist the new account
  await state.getState().saveToStorage();
  return { data: { accountId: accountId } };
};

export default add;
