import state from "~/extension/background-script/state";

const getPublicKey = async () => {
  const publicKey = state.getState().getNostr().getPublicKey();
  return publicKey;
};

export default getPublicKey;
