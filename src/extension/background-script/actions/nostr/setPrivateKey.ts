import { encryptData } from "~/common/lib/crypto";
import type { Message } from "~/types";

import state from "../../state";

const setPrivateKey = async (message: Message) => {
  const password = state.getState().password as string;

  const privateKey = message.args.privateKey as string;
  state.setState({ nostrPrivateKey: encryptData(privateKey, password) });
  await state.getState().saveToStorage();

  return {};
};

export default setPrivateKey;
