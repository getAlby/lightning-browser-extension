import type { MessageNostrPrivateKeyRemove } from "~/types";

import state from "../../state";

const removePrivateKey = async (message: MessageNostrPrivateKeyRemove) => {
  const id = message.args?.id || state.getState().currentAccountId;

  const accounts = state.getState().accounts;

  if (id && Object.keys(accounts).includes(id)) {
    const account = accounts[id];
    if (account.nostrPrivateKey) delete account.nostrPrivateKey;
    account.hasImportedNostrKey = true;
    accounts[id] = account;
    state.setState({
      accounts,
      nostr: null, // reset memoized nostr instance
    });
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
