import state from "~/extension/background-script/state";
import type { MessageAccountAll } from "~/types";

const all = async (_message: MessageAccountAll) => {
  const accounts = await state.getState().accounts;
  console.log("YOOOO:", accounts);

  return {
    data: accounts,
  };
};

export default all;
