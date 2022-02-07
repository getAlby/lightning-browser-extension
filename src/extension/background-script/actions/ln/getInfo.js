import state from "../../state";

const getInfo = async (message, sender) => {
  const connector = await state.getState().getConnector();
  const info = await connector.getInfo();

  return {
    data: {
      node: {
        alias: info.data.alias,
        pubkey: info.data.pubkey,
        color: info.data.color,
      },
    },
  };
};

export default getInfo;
