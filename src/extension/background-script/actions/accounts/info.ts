import type { AccountInfoRes } from "~/common/lib/api";
import state from "~/extension/background-script/state";
import type { MessageAccountInfo } from "~/types";

const info = async (message: MessageAccountInfo) => {
  const connector = await state.getState().getConnector();
  const currentAccountId = state.getState().currentAccountId;
  const currentAccount = state.getState().getAccount();

  if (!currentAccount || !currentAccountId) {
    return { error: "No current account set" };
  }

  try {
    const info = await connector.getInfo();
    const balance = await connector.getBalance();

    const result: AccountInfoRes = {
      currentAccountId: currentAccountId,
      name: currentAccount.name,
      avatarUrl: currentAccount.avatarUrl,
      info: info.data,
      connectorType: currentAccount.connector,
      balance: {
        balance: balance.data.balance,
        currency: balance.data.currency || "BTC", // set default currency for every account
      },
    };

    return {
      data: result,
    };
  } catch (e) {
    // return AccountInfo object, because "name" and "error" is used in UX
    return {
      data: {
        currentAccountId,
        name: currentAccount.name,
        connectorType: currentAccount.connector,
        balance: null,
        info: null,
        error: "Connection error",
      },
    };
  }
};

export default info;
