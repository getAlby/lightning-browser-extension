import state from "../../state";

const getPrivateKey = async () => {
  const privateKey = state.getState().getNostr().getPrivateKey();
  return {
    data: privateKey,
  };
};

export default getPrivateKey;
