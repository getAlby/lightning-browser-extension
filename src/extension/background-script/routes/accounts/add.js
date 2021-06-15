import { encryptData } from "../../../../common/lib/crypto";
import utils from "../../../../common/lib/utils";
import state from "../../state";

const add = (message, sender) => {
  console.log("Adding new account");
  const newAccount = message.args;
  const accounts = state.getState().accounts;
  const accountId = utils.getHash(newAccount.name);

  newAccount.config = encryptData(newAccount.config, "btc", "");
  accounts[accountId] = newAccount;

  state.setState({ accounts });
  return Promise.resolve({ data: { accountId: accountId } });
};

export default add;
