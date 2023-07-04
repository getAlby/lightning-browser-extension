import { decryptData } from "~/common/lib/crypto";
import type { MessageNostrPrivateKeyGet } from "~/types";

import state from "../../state";

const getPrivateKey = async (message: MessageNostrPrivateKeyGet) => {
  const id = message?.args?.id;

  if (!id) {
    return {
      data: (await state.getState().getNostr()).privateKey,
    };
  }

  const accounts = state.getState().accounts;
  if (Object.keys(accounts).includes(id)) {
    const password = await state.getState().password();
    if (!password) {
      return {
        error: "Password is missing.",
      };
    }
    const account = accounts[id];
    if (!account.nostrPrivateKey) return { data: null };
    const privateKey = decryptData(account.nostrPrivateKey, password);
    return {
      data: privateKey,
    };
  }

  return {
    error: "Account does not exist.",
  };
};

export default getPrivateKey;
