import state from "../../state";

const isUnlocked = (message, sender) => {
  const isUnlocked = state.getState().password !== null;

  return Promise.resolve({ data: { unlocked: isUnlocked } });
};

export default isUnlocked;
