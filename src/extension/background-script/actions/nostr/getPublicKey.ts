import { decryptData } from "~/common/lib/crypto";
import Nostr from "~/extension/background-script/nostr";
import { MessageNostrPublicKeyGet } from "~/types";

import state from "../../state";

const getPublicKey = async (message: MessageNostrPublicKeyGet) => {
  const id = message.args.id;

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
    const publicKey = new Nostr(privateKey).getPublicKey();
    return {
      data: publicKey,
    };
  }

  return {
    error: "Account does not exist.",
  };
};

export default getPublicKey;
