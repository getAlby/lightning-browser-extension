import { decryptData, encryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";
import type { MessageAccountEdit } from "~/types";

const edit = async (message: MessageAccountEdit) => {
  const accounts = state.getState().accounts;
  const accountId = message.args.id;

  if (accountId in accounts) {
    accounts[accountId].name = message.args.name;

    if (
      message.args.accessToken &&
      message.args.refreshToken &&
      message.args.tokenExpiresAt
    ) {
      const password = await state.getState().password();

      let configData = decryptData(accounts[accountId].config, password);
      configData.accessToken = message.args.accessToken;
      configData.refreshToken = message.args.refreshToken;
      configData.tokenExpiresAt = message.args.tokenExpiresAt;
      const encryptConfigData = encryptData(configData, password);
      accounts[accountId].config = encryptConfigData;
    }

    state.setState({ accounts });
    // make sure we immediately persist the updated accounts
    await state.getState().saveToStorage();
    return {};
  } else {
    return {
      error: `Account not found: ${accountId}`,
    };
  }
};

export default edit;
