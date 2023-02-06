import * as secp256k1 from "@noble/secp256k1";
import type { MessagePrivateKeyGenerate } from "~/types";

const generatePrivateKey = async (message: MessagePrivateKeyGenerate) => {
  const privateKey = secp256k1.utils.randomPrivateKey();

  return {
    data: {
      privateKey: secp256k1.utils.bytesToHex(privateKey),
    },
  };
};

export default generatePrivateKey;
