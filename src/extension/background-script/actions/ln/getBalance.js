import state from "../../state";

const getInfo = async (message, sender) => {
  const connector = await state.getState().getConnector();
  const res = await connector.getBalance();

  return {
    data: {
      node: {
        balance: res.data.balance,
      },
    },
  };
};

export default getInfo;
