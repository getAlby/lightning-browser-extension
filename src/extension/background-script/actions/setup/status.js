import state from "../../state";

const status = (message, sender) => {
  const unlocked = state.getState().password !== null;
  const configured = state.getState().configured;
  const currentAccountId = state.getState().currentAccountId;

  return Promise.resolve({
    data: {
      unlocked,
      configured,
      currentAccountId,
    },
  });
};

export default status;
