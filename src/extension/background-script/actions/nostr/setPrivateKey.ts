import { decryptData, encryptData } from "~/common/lib/crypto";
import { deriveNostrPrivateKey } from "~/common/lib/mnemonic";
import type { MessagePrivateKeySet } from "~/types";

import state from "../../state";

const setPrivateKey = async (message: MessagePrivateKeySet) => {
  const id = message.args?.id || state.getState().currentAccountId;

  const password = await state.getState().password();
  if (!password) {
    return {
      error: "Password is missing.",
    };
  }
  const privateKey = message.args.privateKey;
  const accounts = state.getState().accounts;

  if (id && Object.keys(accounts).includes(id)) {
    const account = accounts[id];
    account.nostrPrivateKey = privateKey
      ? encryptData(privateKey, password)
      : null;

    // TODO: move deriveNostrPrivateKey to new Mnemonic object
    account.hasImportedNostrKey =
      !account.mnemonic ||
      deriveNostrPrivateKey(decryptData(account.mnemonic, password)) !==
        privateKey;
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
