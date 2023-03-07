import { encryptData } from "~/common/lib/crypto";
import { MessageBackup } from "~/types";

import state from "../../state";

const backup = (message: MessageBackup) => {
  const accountInfo = state.getState().accounts;
  const password = state.getState().password;

  if (!password) return { error: "Password is missing" };

  return Promise.resolve({ data: encryptData(accountInfo, password) });
};

export default backup;
