import state from "~/extension/background-script/state";
import i18n from "~/i18n/i18nConfig";
import { commonI18nNamespace } from "~/i18n/namespaces";
import type { MessageAccountEdit } from "~/types";

const edit = async (message: MessageAccountEdit) => {
  const accounts = state.getState().accounts;
  const accountId = message.args.id;

  if (accountId in accounts) {
    accounts[accountId].name = message.args.name;

    state.setState({ accounts });
    // make sure we immediately persist the updated accounts
    await state.getState().saveToStorage();
    return {};
  } else {
    return {
      error: `${i18n.t(
        "errors.missing_account",
        commonI18nNamespace
      )}: ${accountId}`,
    };
  }
};

export default edit;
