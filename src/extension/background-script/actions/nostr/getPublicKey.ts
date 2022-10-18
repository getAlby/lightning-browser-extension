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
  const publicKey = secp256k1.schnorr.getPublicKey(
    secp256k1.utils.hexToBytes(decryptedPrivateKey)
  );
  const publicKeyHex = secp256k1.utils.bytesToHex(publicKey);

  return publicKeyHex;
};

export default getPublicKey;
