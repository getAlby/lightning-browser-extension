import { encryptData } from "~/common/lib/crypto";
import Mnemonic from "~/extension/background-script/mnemonic";
import type { MessageMnemonicSet } from "~/types";

import state from "../../state";

const setMnemonic = async (message: MessageMnemonicSet) => {
  const id = message.args?.id || state.getState().currentAccountId;

  const password = await state.getState().password();
  if (!password) {
    return {
      error: "Password is missing.",
    };
  }
  const mnemonic = message.args.mnemonic;
  const accounts = state.getState().accounts;

  if (id && Object.keys(accounts).includes(id)) {
    const account = accounts[id];
    account.mnemonic = mnemonic ? encryptData(mnemonic, password) : null;

    if (mnemonic && !account.nostrPrivateKey) {
      const nostrPrivateKey = new Mnemonic(mnemonic).deriveNostrPrivateKeyHex();
      account.nostrPrivateKey = encryptData(nostrPrivateKey, password);
      account.hasImportedNostrKey = false;
    } else {
      account.hasImportedNostrKey = true;
    }
    accounts[id] = account;

    state.setState({
      accounts,
      mnemonic: null, // reset memoized mnemonic instance
      bitcoin: null, // reset memoized bitcoin instance
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

export default setMnemonic;
