import type { MessagePrivateKeySet } from "~/types";

import state from "../../state";

const setPrivateKey = async (message: MessagePrivateKeySet) => {
  await state.getState().getNostr().setPrivateKey(message.args.privateKey);
  return {};
};

export default setPrivateKey;
