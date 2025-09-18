import { encryptData } from "~/common/lib/crypto";
import type { MessageKeyEncrypt } from "~/types";

import state from "../../state";

const encryptKey = async (message: MessageKeyEncrypt) => {
  const password = await state.getState().password();
  if (!password) {
    return {
      error: "Password is missing.",
    };
  }
  let key = message.args.key;
  key = encryptData(key, password);
  return {
    data: key,
  };
};

export default encryptKey;
