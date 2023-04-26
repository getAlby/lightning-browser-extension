import { HDKey } from "@scure/bip32";
import * as bip39 from "@scure/bip39";
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
    // FIXME: this is all copied from NostrAdvancedSettings
    const seed = bip39.mnemonicToSeedSync(mnemonic.data);
    const hdkey = HDKey.fromMasterSeed(seed);
    if (!hdkey) {
      throw new Error("invalid hdkey");
    }
    const nostrPrivateKeyBytes = hdkey.derive("m/1237'/0'/0").privateKey;
    if (!nostrPrivateKeyBytes) {
      throw new Error("invalid derived private key");
    }
    const mnemonicDerivedPrivateKey =
      Buffer.from(nostrPrivateKeyBytes).toString("hex");

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
