import { decryptData, encryptData } from "~/common/lib/crypto";
import nostr from "~/common/lib/nostr";
import Mnemonic from "~/extension/background-script/mnemonic";
import type { MessageNostrPrivateKeySet } from "~/types";

import state from "../../state";

const setPrivateKey = async (message: MessageNostrPrivateKeySet) => {
  const id = message.args?.id || state.getState().currentAccountId;

  const password = await state.getState().password();
  if (!password) {
    return {
      error: "Password is missing.",
    };
  }
  // make sure private key is saved in hex format
  let privateKey;
  try {
    privateKey = nostr.normalizeToHex(message.args.privateKey);
    // Validate the private key before saving
    nostr.derivePublicKey(privateKey);
    nostr.hexToNip19(privateKey, "nsec");
  } catch (error) {
    return {
      error: "Invalid private key",
    };
  }

  const accounts = state.getState().accounts;

  if (id && Object.keys(accounts).includes(id)) {
    const account = accounts[id];
    account.nostrPrivateKey = privateKey
      ? encryptData(privateKey, password)
      : null;

    account.hasImportedNostrKey =
      !account.mnemonic ||
      new Mnemonic(
        decryptData(account.mnemonic, password)
      ).deriveNostrPrivateKeyHex() !== privateKey;
    accounts[id] = account;
    state.setState({
      accounts,
      nostr: null, // reset memoized nostr instance
    });
    await state.getState().saveToStorage();
    return {
      data: {
        accountId: id,
      },
    };
  }
  return {
    error: "No account selected.",
  };
};

export default setPrivateKey;
