import { decryptData } from "~/common/lib/crypto";
import type { MessageMnemonicGet } from "~/types";

import state from "../../state";

const getMnemonic = async (message: MessageMnemonicGet) => {
  const id = message.args?.id || state.getState().currentAccountId;

  const accounts = state.getState().accounts;
  if (id && Object.keys(accounts).includes(id)) {
    const password = await state.getState().password();
    if (!password) {
      return {
        error: "Password is missing.",
      };
    }
    const account = accounts[id];
    if (!account.mnemonic) return { data: null };
    const mnemonic = decryptData(account.mnemonic, password) as string;
    return {
      data: mnemonic,
    };
  }

  return {
    error: "Account does not exist.",
  };
};

export default getMnemonic;
