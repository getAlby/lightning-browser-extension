import type { MessageAccountInfo } from "~/types";
import state from "~/extension/background-script/state";

const info = async (message: MessageAccountInfo) => {
  // WHAT TO DO WITH THIS?
  // TODO!
  //if (message.args.id) {
  //  account = state.getState().accounts[message.args.id];
  //} else {
  //  account = state.getState().getAccount();
  //}
  const connector = await state.getState().getConnector();
  const currentAccountId = state.getState().currentAccountId;
  const currentAccount = state.getState().getAccount();

  const [info, balance] = await Promise.all([
    connector.getInfo(),
    connector.getBalance(),
  ]);

  if (!currentAccount) {
    return { error: "No current account set" };
  }

  return {
    data: {
      currentAccountId: currentAccountId,
      name: currentAccount.name,
      info: info.data,
      balance: balance.data,
    },
  };
};

export default info;
