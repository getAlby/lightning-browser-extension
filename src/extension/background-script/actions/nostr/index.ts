import generatePrivateKey from "./generatePrivateKey";
import getPrivateKey from "./getPrivateKey";
import getPublicKeyOrPrompt from "./getPublicKeyOrPrompt";
import getRelays from "./getRelays";
import { encrypt as nip04Encrypt, decrypt as nip04Decrypt } from "./nip04";
import setPrivateKey from "./setPrivateKey";
import signEventOrPrompt from "./signEventOrPrompt";

export {
  generatePrivateKey,
  getPrivateKey,
  setPrivateKey,
  getPublicKeyOrPrompt,
  getRelays,
  nip04Encrypt,
  nip04Decrypt,
  signEventOrPrompt,
};
