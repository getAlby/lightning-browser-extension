import { encryptData } from "~/common/lib/crypto";
import type { MessagePrivateKeySet } from "~/types";

import state from "../../state";

const setPrivateKey = async (message: MessagePrivateKeySet) => {
  const password = state.getState().password as string;

  const privateKey = message.args.privateKey;
  state.setState({ nostrPrivateKey: encryptData(privateKey, password) });
  await state.getState().saveToStorage();

  return {};
};

export default setPrivateKey;
