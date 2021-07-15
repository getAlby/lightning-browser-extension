import state from "../../state";

const lock = (message, sender) => {
  state.getState().lock();
  return Promise.resolve({ data: { unlocked: false } });
};

export default lock;
