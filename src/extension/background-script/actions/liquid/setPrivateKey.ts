import { encryptData } from "~/common/lib/crypto";
import type { MessagePrivateKeySet } from "~/types";

import state from "../../state";

const setPrivateKey = async (message: MessagePrivateKeySet) => {
  const id = message.args?.id || state.getState().currentAccountId;

  const password = state.getState().password as string;
  const privateKey = message.args.privateKey;
  const accounts = state.getState().accounts;

  if (id && Object.keys(accounts).includes(id)) {
    const account = accounts[id];
    account.liquidPrivateKey = privateKey
      ? encryptData(privateKey, password)
      : null;
    accounts[id] = account;
    state.setState({ accounts });
    await state.getState().saveToStorage();
    return {
      data: {
        accountId: id,
      },
    };
  }
  return {
    error: "No account selected.",
  };
};

export default setPrivateKey;
