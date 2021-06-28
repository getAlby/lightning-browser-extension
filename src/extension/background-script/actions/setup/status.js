import state from "../../state";

const status = (message, sender) => {
  const unlocked = state.getState().password !== null;
  const currentAccountId = state.getState().currentAccountId;
  const configured = currentAccountId !== null;

  return Promise.resolve({
    data: {
      unlocked,
      configured,
      currentAccountId,
    },
  });
};

export default status;
