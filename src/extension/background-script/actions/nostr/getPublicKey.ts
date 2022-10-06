import * as secp256k1 from "@noble/secp256k1";
import { decryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";

const getPublicKey = async () => {
  const encryptedPrivateKey = state.getState().nostrPrivateKey;
  if (!encryptedPrivateKey) {
    return;
  }
  const decryptedPrivateKey = decryptData(
    encryptedPrivateKey,
    state.getState().password as string
  );
  const buffer = Buffer.from(decryptedPrivateKey, "hex");
  const publicKey = Buffer.from(
    secp256k1.schnorr.getPublicKey(buffer)
  ).toString("hex");

  return publicKey;
};

export default getPublicKey;
