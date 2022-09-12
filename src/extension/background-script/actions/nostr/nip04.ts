import * as nip04 from "nostr-tools/nip04";
import { Message } from "~/types";

// TODO: Replace keys with extension storage
const privateKey =
  "0a334764af75be0347e2699f4db94c2c4b557f79aa69b01ec6080224f2af100d";

const encrypt = async (message: Message) => {
  // Private key: 0a334764af75be0347e2699f4db94c2c4b557f79aa69b01ec6080224f2af100d
  // Public key: f5b795282b4ac1f11fc107485a5aa7150823024a8ae5b317d639176f881e9a74
  const result = nip04.encrypt(
    privateKey,
    message.args.peer,
    message.args.plaintext
  );

  return {
    data: result,
  };
};

const decrypt = async (message: Message) => {
  const result = nip04.decrypt(
    privateKey,
    message.args.peer,
    message.args.ciphertext
  );

  return {
    data: result,
  };
};

export { encrypt, decrypt };
