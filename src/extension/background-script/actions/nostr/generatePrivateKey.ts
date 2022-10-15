import * as secp256k1 from "@noble/secp256k1";

import state from "../../state";

const generatePrivateKey = async () => {
  const connector = await state.getState().getConnector();
  try {
    const response = await connector.signMessage({
      message:
        "DO NOT EVER SIGN THIS TEXT WITH YOUR PRIVATE KEYS! IT IS ONLY USED FOR DERIVATION OF NOSTR KEY PAIRS, DISCLOSING THIS SIGNATURE WILL COMPROMISE YOUR NOSTR IDENTITY!",
      key_loc: {
        key_family: 0,
        key_index: 0,
      },
    });
    const keymaterial = response.data.signature;
    const uint8 = Uint8Array.from(
      keymaterial.split("").map((x) => x.charCodeAt(0))
    );
    const hex = Buffer.from(secp256k1.utils.hashToPrivateKey(uint8));
    return {
      data: {
        privateKey: hex.toString("hex"),
      },
    };
  } catch (e) {
    console.error(e);
  }
};

export default generatePrivateKey;
