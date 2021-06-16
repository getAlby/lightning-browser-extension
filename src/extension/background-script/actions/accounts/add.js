import { encryptData } from "../../../../common/lib/crypto";
import utils from "../../../../common/lib/utils";
import state from "../../state";

const add = (message, sender) => {
  console.log("Adding new account");
  const newAccount = message.args;
  const accounts = state.getState().accounts;

  // TODO: add validations

  // TODO: make sure a password is set
  const password = state.getState().password;

  const accountId = utils.getHash(newAccount.name);
  console.log(`Created account ${accountId}`);

  newAccount.config = encryptData(newAccount.config, password);
  accounts[accountId] = newAccount;

  state.setState({ accounts });
  return Promise.resolve({ data: { accountId: accountId } });
};

export default add;
