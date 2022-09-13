import * as nip04 from "nostr-tools/nip04";
import { Message } from "~/types";

const encrypt = async (message: Message) => {
  const result = nip04.encrypt(
    "", // TODO: add private key
    message.args.peer,
    message.args.plaintext
  );

  return {
    data: result,
  };
};

const decrypt = async (message: Message) => {
  const result = nip04.decrypt(
    "", // TODO: add private key
    message.args.peer,
    message.args.ciphertext
  );

  return {
    data: result,
  };
};

export { encrypt, decrypt };
