import { deriveNostrKeyFromSecretKey } from "~/app/utils/deriveNostrKeyFromSecretKey";
import { getMnemonic } from "~/extension/background-script/actions/mnemonic";
import { MessageKeyOrigin } from "~/types";

import generatePrivateKey from "./generatePrivateKey";
import getPrivateKey from "./getPrivateKey";

// TODO: should this function exist in the background script?
const getKeyOrigin = async (message: MessageKeyOrigin) => {
  const privateKey = await getPrivateKey({
    ...message,
    action: "getPrivateKey",
  });
  const mnemonic = await getMnemonic({
    ...message,
    action: "getMnemonic",
  });

  if (mnemonic.data) {
    const mnemonicDerivedPrivateKey = await deriveNostrKeyFromSecretKey(
      mnemonic.data
    );

    if (mnemonicDerivedPrivateKey === privateKey.data) {
      return {
        data: "secret-key",
      };
    }
  }

  const legacyAccountDerivedPrivateKey = await generatePrivateKey({
    ...message,
    action: "generatePrivateKey",
    args: {
      type: undefined,
    },
  });
  return {
    data:
      legacyAccountDerivedPrivateKey.data?.privateKey === privateKey.data
        ? "derived"
        : "unknown",
  };
};

export default getKeyOrigin;
