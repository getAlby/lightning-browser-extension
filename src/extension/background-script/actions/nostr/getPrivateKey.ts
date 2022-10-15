import { decryptData } from "~/common/lib/crypto";

import state from "../../state";

const getPrivateKey = async () => {
  const password = state.getState().password as string;
  const privateKey = state.getState().nostrPrivateKey;
  return {
    data: privateKey ? decryptData(privateKey, password) : null,
  };
};

export default getPrivateKey;
