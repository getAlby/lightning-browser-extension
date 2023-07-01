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
      info: info.data,
      balance: {
        balance: balance.data.balance,
        currency: balance.data.currency || "BTC", // set default currency for every account
      },
    };

    return {
      data: result,
    };
  } catch (e) {
    return { error: "Connection error" };
  }
};

export default info;
