import getPublicKey from "./getPublicKey";
import getRelays from "./getRelays";
import { encrypt as nip04Encrypt, decrypt as nip04Decrypt } from "./nip04";
import signEvent from "./signEvent";

export { getPublicKey, signEvent, getRelays, nip04Encrypt, nip04Decrypt };
