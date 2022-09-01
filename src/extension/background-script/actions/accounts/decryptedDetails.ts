import { decryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";
import i18n from "~/i18n/i18nConfig";
import { commonI18nNamespace } from "~/i18n/namespaces";
import type { MessageAccountDecryptedDetails } from "~/types";

const decryptedDetails = async (message: MessageAccountDecryptedDetails) => {
  const accounts = state.getState().accounts;
  const password = state.getState().password as string;
  const accountId = message.args.id;

  if (accountId in accounts) {
    const lndHubData = decryptData(
      accounts[accountId].config as string,
      password
    );

    return {
      data: lndHubData,
    };
  } else {
    return {
      error: `${i18n.t(
        "errors.missing_account",
        commonI18nNamespace
      )} ${accountId}`,
    };
  }
};

export default decryptedDetails;
