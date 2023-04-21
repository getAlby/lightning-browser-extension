import * as secp256k1 from "@noble/secp256k1";
import Hex from "crypto-js/enc-hex";
import sha512 from "crypto-js/sha512";
import type { MessagePrivateKeyGenerate } from "~/types";

import state from "../../state";

const generatePrivateKey = async (message: MessagePrivateKeyGenerate) => {
  const type = message?.args?.type;

  const privateKey =
    type === "random" ? generateRandomKey() : await deriveKey();

  if (privateKey)
    return {
      data: {
        privateKey: secp256k1.utils.bytesToHex(privateKey),
      },
    };
  else
    return {
      error: "Error generating private key.",
    };
};

const generateRandomKey = () => {
  return secp256k1.utils.randomPrivateKey();
};

const deriveKey = async () => {
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
    if (!keymaterial.length) {
      throw Error("No key material available.");
    }

    // Use SHA-512 to provide enough key material for secp256k1 (> 40 bytes)
    const hash = sha512(keymaterial).toString(Hex);
    const privateKey = secp256k1.utils.hashToPrivateKey(hash);
    return privateKey;
  } catch (e) {
    console.error(e);
  }
};

export default generatePrivateKey;
