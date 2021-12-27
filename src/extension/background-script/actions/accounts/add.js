import { encryptData } from "../../../../common/lib/crypto";
import state from "../../state";

const add = async (message, sender) => {
  const newAccount = message.args;
  const accounts = state.getState().accounts;

  // TODO: add validations

  // TODO: make sure a password is set
  const password = state.getState().password;
  const currentAccountId = state.getState().currentAccountId;

  const accountId = Object.keys(accounts).length + 1;
  console.log(`Created account ${accountId}`);

  newAccount.config = encryptData(newAccount.config, password);
  accounts[accountId] = newAccount;

  state.setState({ accounts });

  if (!currentAccountId) {
    state.setState({ currentAccountId: accountId });
  }

  // make sure we immediately persist the new account
  await state.getState().saveToStorage();
  return { data: { accountId: accountId } };
};

export default add;
