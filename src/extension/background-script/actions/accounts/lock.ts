import state from "../../state";
import type { MessageAccountLock } from "~/types";

const lock = async (message: MessageAccountLock) => {
  await state.getState().lock();
  return {
    data: { unlocked: false },
  };
};

export default lock;
