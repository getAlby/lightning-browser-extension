import type { MessageAccountLock } from "~/types";

import state from "../../state";

const lock = async (message: MessageAccountLock) => {
  await state.getState().lock();
  return {
    data: { unlocked: false },
  };
};

export default lock;
