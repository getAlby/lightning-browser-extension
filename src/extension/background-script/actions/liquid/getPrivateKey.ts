import { decryptData } from "~/common/lib/crypto";
import type { MessagePrivateKeyGet } from "~/types";

import state from "../../state";

const getPrivateKey = async (message: MessagePrivateKeyGet) => {
  const id = message?.args?.id;

  if (!id) {
    return {
      data: state.getState().getLiquid().privateKey,
    };
  }

  const accounts = state.getState().accounts;
  if (Object.keys(accounts).includes(id)) {
    const password = state.getState().password as string;
    const account = accounts[id];
    if (!account.liquidPrivateKey) return { data: null };
    const privateKey = decryptData(account.liquidPrivateKey, password);
    return {
      data: privateKey,
    };
  }

  return {
    error: "Account does not exist.",
  };
};

export default getPrivateKey;
