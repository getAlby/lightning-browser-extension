import { MessageStatus } from "~/types";

import state from "../../state";

const status = (message: MessageStatus) => {
  const unlocked = state.getState().password !== null;
  const account = state.getState().getAccount();
  const currentAccountId = state.getState().currentAccountId;
  const configured = account != null;

  return Promise.resolve({
    data: {
      unlocked,
      configured,
      currentAccountId,
    },
  });
};

export default status;
