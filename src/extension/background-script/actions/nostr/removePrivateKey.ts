import type { MessagePrivateKeyRemove } from "~/types";

import state from "../../state";

const removePrivateKey = async (message: MessagePrivateKeyRemove) => {
  const id = message.args?.id || state.getState().currentAccountId;

  const accounts = state.getState().accounts;

  if (id && Object.keys(accounts).includes(id)) {
    const account = accounts[id];
    if (account.nostrPrivateKey) delete account.nostrPrivateKey;
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

export default removePrivateKey;
