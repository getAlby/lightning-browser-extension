import { encryptData } from "~/common/lib/crypto";

import { MessageValueEncrypt } from "~/types";
import state from "../../state";

const encryptValue = async (message: MessageValueEncrypt) => {
  const password = await state.getState().password();
  if (!password) {
    return {
      error: "Password is missing.",
    };
  }
  let value = message.args.value;
  value = encryptData(value, password);
  return {
    data: value,
  };
};

export default encryptValue;
