import type { MessageAccountLock } from "~/types";

// import state from "../../state";

const lock = async (message: MessageAccountLock) => {
  // await state.getState().lock();
  await chrome.storage.session.set({ password: null });
  return {
    data: { unlocked: false },
  };
};

export default lock;
