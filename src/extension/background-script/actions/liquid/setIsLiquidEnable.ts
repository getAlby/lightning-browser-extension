import state from "~/extension/background-script/state";
import { MessageSetIsLiquidEnable } from "~/types";

const setIsLiquidEnable = async (message: MessageSetIsLiquidEnable) => {
  if (typeof message.args.enable !== "boolean") {
    return {
      error: "Invalid enable value.",
    };
  }

  const id = message.args?.id || state.getState().currentAccountId;
  if (!id) {
    return {
      error: "No account selected.",
    };
  }

  const accounts = state.getState().accounts;
  const account = accounts[id];

  if (account) {
    account.liquidEnabled = message.args.enable;
    state.setState({ accounts: { ...accounts, [id]: account } });
    await state.getState().saveToStorage();

    return {
      data: {
        accountId: id,
      },
    };
  }

  return {
    error: `Account "${id}" not found.`,
  };
};

export default setIsLiquidEnable;
