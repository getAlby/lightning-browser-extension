import { decryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";
import type { MessageAccountExport } from "~/types";

const exportAccount = async (message: MessageAccountExport) => {
  const accounts = state.getState().accounts;
  const password = state.getState().password as string;
  const accountId = message.args.id;

  if (accountId in accounts) {
    if (accounts[accountId].connector === "lndhub") {
      const lndHubData = decryptData(
        accounts[accountId].config as string,
        password
      );

      return {
        data: lndHubData,
      };
    } else {
      return {
        error: `Account: ${accountId} not an LndHub Account; cannot be exported`,
      };
    }
  } else {
    return {
      error: `Account not found: ${accountId}`,
    };
  }
};

export default exportAccount;
