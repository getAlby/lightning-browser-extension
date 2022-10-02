import generatePrivateKey from "./generatePrivateKey";
import getPublicKeyOrPrompt from "./getPublicKeyOrPrompt";
import getRelays from "./getRelays";
import { encrypt as nip04Encrypt, decrypt as nip04Decrypt } from "./nip04";
import signEventOrPrompt from "./signEventOrPrompt";

export {
  getPublicKeyOrPrompt,
  signEventOrPrompt,
  getRelays,
  nip04Encrypt,
  nip04Decrypt,
  generatePrivateKey,
};
