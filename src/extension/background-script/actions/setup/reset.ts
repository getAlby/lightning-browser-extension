import type { MessageReset } from "~/types";

import state from "../../state";

const reset = async (message: MessageReset) => {
  state.setState({
    accounts: {},
    account: null,
    connector: null,
    password: null,
    currentAccountId: null,
  });
  await state.getState().saveToStorage();

  return { data: { reset: true } };
};

export default reset;
