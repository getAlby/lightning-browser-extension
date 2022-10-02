import { Message } from "~/types";

const encrypt = async (message: Message) => {
  throw new Error("nostr.nip04.encrypt() is not yet available.");
};

const decrypt = async (message: Message) => {
  throw new Error("nostr.nip04.decrypt() is not yet available.");
};

export { encrypt, decrypt };
