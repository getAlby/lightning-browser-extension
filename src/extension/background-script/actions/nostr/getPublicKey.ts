import * as secp256k1 from "@noble/secp256k1";
import state from "~/extension/background-script/state";

const getPublicKey = async () => {
  const privateKey = state.getState().settings.nostrPrivateKey;
  const buffer = Buffer.from(privateKey, "hex");
  const publicKey = Buffer.from(
    secp256k1.schnorr.getPublicKey(buffer)
  ).toString("hex");

  return publicKey;
};

export default getPublicKey;
