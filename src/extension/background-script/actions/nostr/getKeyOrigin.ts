import { MessageKeyOrigin } from "~/types";

import generatePrivateKey from "./generatePrivateKey";
import getPrivateKey from "./getPrivateKey";

const getKeyOrigin = async (message: MessageKeyOrigin) => {
  const privateKey = await getPrivateKey({
    ...message,
    action: "getPrivateKey",
  });
  // TODO: check against secret key
  const derivedKey = await generatePrivateKey({
    ...message,
    action: "generatePrivateKey",
    args: {
      type: undefined,
    },
  });
  return {
    data:
      derivedKey.data?.privateKey === privateKey.data ? "derived" : "unknown",
  };
};

export default getKeyOrigin;
