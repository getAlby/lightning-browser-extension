import { encryptData } from "~/common/lib/crypto";
import type { MessageMnemonicEncrypt } from "~/types";

import state from "../../state";

const encryptMnemonic = async (message: MessageMnemonicEncrypt) => {
  const password = await state.getState().password();
  if (!password) {
    return {
      error: "Password is missing.",
    };
  }
  let mnemonic = message.args.mnemonic;
  mnemonic = encryptData(mnemonic, password);
  return {
    data: mnemonic,
  };
};

export default encryptMnemonic;
