import state from "~/extension/background-script/state";
import type { MessageAccountAll } from "~/types";

const all = async (_message: MessageAccountAll) => {
  const accounts = await state.getState().accounts;
  // console.log("MV3: account all action - accounts: ", accounts);
  const tmp = await state.getState().getConnector();
  // console.log("MV3: account all action - tmp: ", tmp);
  return {
    data: accounts,
  };
};

export default all;
