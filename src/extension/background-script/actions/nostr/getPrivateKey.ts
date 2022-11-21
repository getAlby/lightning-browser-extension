import state from "../../state";

const getPrivateKey = async () => {
  const privateKey = await state.getState().getNostr().getPrivateKey();
  return {
    data: privateKey,
  };
};

export default getPrivateKey;
