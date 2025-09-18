import { decryptData } from "~/common/lib/crypto";
import Mnemonic from "~/extension/background-script/mnemonic";
import type { MessageNostrPrivateKeyGenerate } from "~/types";

import state from "../../state";

const generatePrivateKey = async (message: MessageNostrPrivateKeyGenerate) => {
  const id = message.args?.id || state.getState().currentAccountId;
  const password = await state.getState().password();
  let nostrPrivateKey = "";
  if (!password) {
    return {
      error: "Password is missing.",
    };
  }
  const accounts = state.getState().accounts;

  if (id && Object.keys(accounts).includes(id)) {
    const account = accounts[id];
    if (!account.mnemonic) {
      return {
        error: "Master Key is missing.",
      };
    }
    const mnemonic = new Mnemonic(decryptData(account.mnemonic, password));
    nostrPrivateKey = mnemonic.deriveNostrPrivateKeyHex();
  } else if (message.args?.mnemonic) {
    const mnemonic = new Mnemonic(message.args.mnemonic);
    nostrPrivateKey = mnemonic.deriveNostrPrivateKeyHex();
  } else {
    return {
      error: "Error generating private key.",
    };
  }

  return {
    data: nostrPrivateKey,
  };
};

export default generatePrivateKey;
