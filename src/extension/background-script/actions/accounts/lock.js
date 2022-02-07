import state from "../../state";

const lock = async (message, sender) => {
  await state.getState().lock();
  return {
    data: { unlocked: false },
  };
};

export default lock;
