import getPublicKey from "~/extension/background-script/actions/nostr/getPublicKey";

import decryptOrPrompt from "./decryptOrPrompt";
import enable from "./enable";
import encryptOrPrompt from "./encryptOrPrompt";
import generatePrivateKey from "./generatePrivateKey";
import getPrivateKey from "./getPrivateKey";
import getPublicKeyOrPrompt from "./getPublicKeyOrPrompt";
import isEnabled from "./isEnabled";
import nip44DecryptOrPrompt from "./nip44DecryptOrPrompt";
import nip44EncryptOrPrompt from "./nip44EncryptOrPrompt";
import removePrivateKey from "./removePrivateKey";
import setPrivateKey from "./setPrivateKey";
import signEventOrPrompt from "./signEventOrPrompt";
import signSchnorrOrPrompt from "./signSchnorrOrPrompt";

export {
  decryptOrPrompt,
  enable,
  encryptOrPrompt,
  generatePrivateKey,
  getPrivateKey,
  getPublicKey,
  getPublicKeyOrPrompt,
  isEnabled,
  nip44DecryptOrPrompt,
  nip44EncryptOrPrompt,
  removePrivateKey,
  setPrivateKey,
  signEventOrPrompt,
  signSchnorrOrPrompt,
};
