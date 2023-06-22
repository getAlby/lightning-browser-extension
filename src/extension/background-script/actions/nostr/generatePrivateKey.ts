import { encryptData } from "~/common/lib/crypto";
import type { MessageNostrPrivateKeyGenerate } from "~/types";

import state from "../../state";

const generatePrivateKey = async (message: MessageNostrPrivateKeyGenerate) => {
  const id = message.args?.id || state.getState().currentAccountId;
  const password = await state.getState().password();
  if (!password) {
    return {
      error: "Password is missing.",
    };
  }
  const accounts = state.getState().accounts;

  if (id && Object.keys(accounts).includes(id)) {
    const mnemonic = await state.getState().getMnemonic();
    const privateKey = mnemonic.deriveNostrPrivateKey();
    const account = accounts[id];
    account.nostrPrivateKey = encryptData(privateKey, password);

    account.hasImportedNostrKey = false;
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
  } else {
    return {
      error: "Error generating private key.",
    };
  }
};

export default generatePrivateKey;
