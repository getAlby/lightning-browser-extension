import type { MessageReset } from "~/types";

import state from "../../state";

const reset = async (message: MessageReset) => {
  await state.getState().password(null);
  state.setState({
    accounts: {},
    account: null,
    connector: null,
    currentAccountId: null,
  });
  await state.getState().saveToStorage();

  return { data: { reset: true } };
};

export default reset;
