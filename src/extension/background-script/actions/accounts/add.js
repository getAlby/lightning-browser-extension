import { encryptData } from "../../../../common/lib/crypto";
import utils from "../../../../common/lib/utils";
import state from "../../state";

const add = (message, sender) => {
  const newAccount = message.args;
  const accounts = state.getState().accounts;

  // TODO: add validations

  // TODO: make sure a password is set
  const password = state.getState().password;
  const currentAccountId = state.getState().currentAccountId;

  const accountId = utils.getHash(newAccount.name);
  console.log(`Created account ${accountId}`);

  newAccount.config = encryptData(newAccount.config, password);
  accounts[accountId] = newAccount;

  state.setState({ accounts });

  if (!currentAccountId) {
    state.setState({ currentAccountId: accountId });
  }
  return Promise.resolve({ data: { accountId: accountId } });
};

export default add;
