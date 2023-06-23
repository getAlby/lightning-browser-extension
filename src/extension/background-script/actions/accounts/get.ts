import state from "~/extension/background-script/state";
import type { MessageAccountGet } from "~/types";

const get = async (message: MessageAccountGet) => {
  const id = message?.args?.id || state.getState().currentAccountId;

  if (!id)
    return {
      error: "No account selected.",
    };

  const accounts = state.getState().accounts;
  const account = accounts[id];

  if (!account) return;

  const result = {
    id: account.id,
    connector: account.connector,
    name: account.name,
    nostrEnabled: !!account.nostrPrivateKey,
  };

  return {
    data: result,
  };
};

export default get;
