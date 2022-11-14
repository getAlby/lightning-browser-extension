import state from "../../state";

const status = async (message, sender) => {
  const unlocked = await state.getState().isUnlocked();
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
