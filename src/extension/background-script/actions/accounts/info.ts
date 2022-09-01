import type { AccountInfoRes } from "~/common/lib/api";
import state from "~/extension/background-script/state";
import i18n from "~/i18n/i18nConfig";
import { commonI18nNamespace } from "~/i18n/namespaces";
import type { MessageAccountInfo } from "~/types";

const info = async (message: MessageAccountInfo) => {
  const connector = await state.getState().getConnector();
  const currentAccountId = state.getState().currentAccountId;
  const currentAccount = state.getState().getAccount();

  const [info, balance] = await Promise.all([
    connector.getInfo(),
    connector.getBalance(),
  ]);

  if (!currentAccount || !currentAccountId) {
    return { error: i18n.t("errors.no_account_account", commonI18nNamespace) };
  }

  const result: AccountInfoRes = {
    currentAccountId: currentAccountId,
    name: currentAccount.name,
    info: info.data,
    balance: balance.data,
  };

  return {
    data: result,
  };
};

export default info;
