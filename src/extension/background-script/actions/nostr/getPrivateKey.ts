import state from "../../state";

const getPrivateKey = async (_: { args: Record<string, never> }) => {
  const privateKey = state.getState().getNostr().getPrivateKey();
  return {
    data: privateKey,
  };
};

export default getPrivateKey;
