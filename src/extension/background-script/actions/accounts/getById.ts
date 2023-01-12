import state from "~/extension/background-script/state";
import type { MessageAccountGetById } from "~/types";

const getById = async (message: MessageAccountGetById) => {
  const { id } = message.args;
  const accounts = state.getState().accounts;
  const account = accounts[id];
  const connector = await state.getState().getConnectorById(id);

  if (!account || !connector) return;

  const [info, balance] = await Promise.all([
    connector.getInfo(),
    connector.getBalance(),
  ]);

  const result = {
    id: account.id,
    connector: account.connector,
    config: account.config,
    name: account.name,
    nostrPrivateKey: account.nostrPrivateKey,
    info: info.data,
    balance: {
      balance: balance.data.balance,
      currency: balance.data.currency || "BTC", // set default currency for every account
    },
  };

  return {
    data: result,
  };
};

export default getById;
